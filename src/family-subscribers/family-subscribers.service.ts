import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateFamilySubscriberDto } from './dto/create-family-subscriber.dto';
import { UpdateFamilySubscriberDto } from './dto/update-family-subscriber.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilySubscriber } from './entities/family-subscriber.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
import { Staff } from 'src/staff/entities/staff.entity';
import { FamilyBeneficiaries } from './entities/family-beneficiaries.entity';
import { CreateFamilyBeneficiaryDto } from './dto/create-family-beneficiary.dto';
import { Package } from 'src/packages/entities/package.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { UpdateFamilyBeneficiaryDto } from './dto/update-family-beneficiary.dto';
import { CreateFamilyPackageDto } from './dto/create-family-package.dto';
import { FamilyPackage } from './entities/family-package.entity';
import { FamilySubscriberPayment } from './entities/family-subscriber-payment.entity';
import {
  IPayment,
  MANDATESTATUS,
  MOMONETWORK,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBERTYPE,
  SUBSCRIBER_CODES,
  calculateDiscount,
} from 'src/lib';
import { UpdateFamilyPackageDto } from './dto/update-family-package.dto';
import { Bank } from 'src/bank/entities/bank.entity';
import { v4 as uuidv4 } from 'uuid';
import { PaymentsService } from 'src/payments/payments.service';
// import { PackagesService } from 'src/packages/packages.service';

export enum FamilySort {
  id_asc = 'id_asc',
  id_desc = 'id_desc',
  name_asc = 'name_asc',
  name_desc = 'name_desc',
  familyMembershipID_asc = 'familyMembershipID_asc',
  familyMembershipID_desc = 'familyMembershipID_desc',
  agent_asc = 'agent_asc',
  agent_desc = 'agent_desc',
  createdAt_asc = 'createdAt_asc',
  createdAt_desc = 'createdAt_desc',
}

@Injectable()
export class FamilySubscribersService {
  constructor(
    @InjectRepository(FamilySubscriber)
    private readonly familyRepository: Repository<FamilySubscriber>,
    @InjectRepository(FamilyBeneficiaries)
    private readonly familyBeneficiayRepository: Repository<FamilyBeneficiaries>,
    @InjectRepository(FamilyPackage)
    private readonly familyPackageRepository: Repository<FamilyPackage>,
    @InjectRepository(FamilySubscriberPayment)
    private readonly familySubscriberPaymentRepository: Repository<FamilySubscriberPayment>,
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
  ) {}

  async create(
    data: CreateFamilySubscriberDto,
    createdBy: string,
    agent: number,
  ) {
    const staff = new Staff();
    staff.id = agent;
    const family = new FamilySubscriber();
    family.name = data.name;
    family.address = data.address;
    family.contact = data.contact;
    family.email = data.email;
    family.agent = staff;
    family.principalPerson = data.principalPerson;
    family.principalPersonPhone = data.principalPersonPhone;
    family.createdBy = createdBy;
    family.familyMembershipID = await this.generateStaffCode();

    try {
      await this.familyRepository.save(family);

      return {
        message: 'Family has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException(
          'Family with this details already exists. Confirm familyMembershipID',
        );
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions) {
    // console.log(options.page, options.pageSize)/
    // const { filter, order } = options;

    // const filters = [
    //   { familyMembershipID: filter?.familyMembershipID },
    //   { name: filter?.name },
    // ].filter((filter) => filter[Object.keys(filter)[0]]);

    // return ;
    return this.paginationService.paginate({
      ...options,
      // order: order.filter((o) => o.direction),
      // filter: filters.length
      //   ? filters.reduce((acc, curr) => ({ ...acc, ...curr }))
      //   : {},

      repository: this.familyRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.agent', 'agent')
        .leftJoinAndSelect('item.familyPackage', 'familyPackage')
        .leftJoinAndMapOne(
          'familyPackage.bank',
          Bank,
          'bank',
          'bank.id = familyPackage.bank',
        )
        .leftJoinAndMapMany(
          'item.beneficiaries',
          FamilyBeneficiaries,
          'beneficiary',
          'beneficiary.familySubscriber = item.id',
        )
        .leftJoinAndMapOne(
          'beneficiary.package',
          Package,
          'package',
          'package.id = beneficiary.package',
        )
        .leftJoinAndMapOne(
          'beneficiary.facility',
          Facility,
          'facility',
          'facility.id = beneficiary.facility',
        ),
    });
  }

  async findOneById(id: number) {
    const res = await this.familyRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException(`Family with ID ${id} not found.`);
    }
    return res;
  }

  async update(
    id: number,
    updateDto: UpdateFamilySubscriberDto,
    updatedBy: string,
  ): Promise<{ message: string; status: number; success: boolean }> {
    const family = await this.findOneById(id);

    family.name = updateDto.name ?? family.name;
    family.address = updateDto.address ?? family.address;
    family.contact = updateDto.contact ?? family.contact;
    family.email = updateDto.email ?? family.email;
    family.principalPerson =
      updateDto.principalPerson ?? family.principalPerson;
    family.principalPersonPhone =
      updateDto.principalPersonPhone ?? family.principalPersonPhone;

    family.updatedBy = updatedBy;

    try {
      await this.familyRepository.save(family);

      return {
        message: 'Family has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('Family with this name already exists.');
      } else {
        throw error;
      }
    }
  }

  async findBeneficiaryById(id: number) {
    const res = await this.familyBeneficiayRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException(`Beneficiary with ID ${id} not found.`);
    }
    return res;
  }

  async removeBeneficiary(id: number) {
    const subscriber = await this.findBeneficiaryById(id);

    await this.familyBeneficiayRepository.remove(subscriber);

    return {
      message: 'Beneficiary has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async createBeneficiary(
    createDto: CreateFamilyBeneficiaryDto,
    createdBy: string,
  ) {
    const familySubscriber = await this.findOneById(createDto.familyId);

    const currentDate = new Date();
    const dateOfBirth = new Date(createDto.dateOfBirth);

    let age = currentDate.getFullYear() - dateOfBirth.getFullYear();

    // Check if the birthday has occurred this year
    if (
      currentDate.getMonth() < dateOfBirth.getMonth() ||
      (currentDate.getMonth() === dateOfBirth.getMonth() &&
        currentDate.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    if (age > 23) {
      throw new ConflictException(
        'Beneficiary must be 23 years old or younger.',
      );
    }

    const newPackage = new Package();
    newPackage.id = createDto.package;

    const newFacility = new Facility();
    newFacility.id = createDto.facility;

    const beneficiary = new FamilyBeneficiaries();
    beneficiary.name = createDto.name;
    beneficiary.dateOfBirth = createDto.dateOfBirth;
    beneficiary.contact = createDto.contact;
    beneficiary.facility = newFacility;
    beneficiary.package = newPackage;
    beneficiary.familySubscriber = familySubscriber;
    beneficiary.createdBy = createdBy;

    try {
      await this.familyBeneficiayRepository.save(beneficiary);
      return {
        message: 'Succesfully created Beneficiary',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateBeneficiary(
    id: number,
    updateDto: UpdateFamilyBeneficiaryDto,
    updatedBy: string,
  ) {
    const beneficiary = await this.findBeneficiaryById(id);

    beneficiary.name = updateDto.name ?? beneficiary.name;
    // beneficiary.dateOfBirth = updateDto.dateOfBirth ?? beneficiary.dateOfBirth;
    beneficiary.contact = updateDto.contact ?? beneficiary.contact;
    beneficiary.updatedBy = updatedBy;

    if (updateDto.facility) {
      beneficiary.facility.id = updateDto.facility;
    }

    if (updateDto.package) {
      beneficiary.package.id = updateDto.package;
    }

    try {
      await this.familyBeneficiayRepository.save(beneficiary);
      return {
        message: 'Succesfully updated Beneficiary',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    const beneficiary = await this.findOneById(id);

    await this.familyRepository.remove(beneficiary);

    return {
      message: 'Subscriber has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async findAllByFamilySubscriberBeneficiaries(id: number) {
    const family = await this.findOneById(id);
    return family.beneficiaries;
  }

  // async createPackage(data: CreateFamilyPackageDto, createdBy: string) {
  //   const familySubscriber = await this.findOneById(data.familyId);

  //   const newPackage = new FamilyPackage();
  //   const reference = `FNS-${Date.now().toString(36)}-${uuidv4()}`;
  //   newPackage.amountToDebit = data.amountToDebit;
  //   newPackage.createdBy = createdBy;
  //   newPackage.discount = data.discount;
  //   newPackage.frequency = data.frequency;
  //   newPackage.paymentMode = data.paymentMode;
  //   newPackage.familySubscriber = familySubscriber;
  //   newPackage.paymentReferenceCode = reference;

  //   if (data.paymentMode === PAYMENTMODE.Cash) {
  //     newPackage.momoNetwork = MOMONETWORK.None;
  //     newPackage.momoNumber = '';
  //     newPackage.CAGDStaffID = '';
  //     newPackage.chequeNumber = '';
  //     newPackage.accountNumber = '';
  //     newPackage.bank = null;
  //   } else if (data.paymentMode === PAYMENTMODE.CAGD) {
  //     newPackage.momoNetwork = MOMONETWORK.None;
  //     newPackage.momoNumber = '';
  //     newPackage.CAGDStaffID = data.CAGDStaffID;
  //     newPackage.chequeNumber = '';
  //     newPackage.accountNumber = '';
  //     newPackage.bank = null;
  //   } else if (data.paymentMode === PAYMENTMODE.Cheque) {
  //     newPackage.momoNetwork = MOMONETWORK.None;
  //     newPackage.momoNumber = '';
  //     newPackage.CAGDStaffID = '';
  //     newPackage.chequeNumber = data.chequeNumber;
  //     newPackage.accountNumber = '';
  //     if (newPackage.bank && data.bank) {
  //       newPackage.bank.id = +data.bank;
  //     } else if (!newPackage.bank && data.bank) {
  //       const bank = new Bank();
  //       bank.id = +data.bank;
  //       newPackage.bank = bank;
  //     }
  //   } else if (data.paymentMode === PAYMENTMODE.MOMO) {
  //     newPackage.momoNetwork = data.momoNetwork;
  //     newPackage.momoNumber = data.momoNumber;
  //     newPackage.CAGDStaffID = '';
  //     newPackage.chequeNumber = '';
  //     newPackage.accountNumber = '';
  //     newPackage.bank = null;
  //   } else if (data.paymentMode === PAYMENTMODE.StandingOrder) {
  //     newPackage.momoNetwork = MOMONETWORK.None;
  //     newPackage.momoNumber = '';
  //     newPackage.CAGDStaffID = '';
  //     newPackage.chequeNumber = '';
  //     newPackage.accountNumber = data.accountNumber;
  //     if (newPackage.bank && data.bank) {
  //       newPackage.bank.id = +data.bank;
  //     } else if (!newPackage.bank && data.bank) {
  //       const bank = new Bank();
  //       bank.id = +data.bank;
  //       newPackage.bank = bank;
  //     }
  //   }

  //   try {
  //     const familyPackage = await this.familyPackageRepository.save(newPackage);

  //     // const packageData = await this.packageService.findOne(familyPackage.p);
  //     const payment = new FamilySubscriberPayment();
  //     payment.createdBy = createdBy;
  //     payment.paymentStatus = PAYMENTSTATUS.Unpaid;
  //     payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
  //     payment.createdBy === createdBy;
  //     payment.referenceCode = familyPackage.paymentReferenceCode;
  //     payment.amountToDebit = calculateDiscount(
  //       data.amountToDebit,
  //       +data.discount,
  //     );
  //     payment.originalAmount = data.amountToDebit;
  //     payment.familyPackage = newPackage;
  //     payment.mandateStatus =
  //       data.paymentMode === PAYMENTMODE.MOMO
  //         ? MANDATESTATUS.Pending
  //         : MANDATESTATUS.None;

  //     const familyPayment =
  //       await this.familySubscriberPaymentRepository.save(payment);

  //     if (data.paymentMode !== PAYMENTMODE.MOMO) {
  //       const x: IPayment = {
  //         dateOfPayment: new Date(),
  //         confirmed: false,
  //         confirmedBy: '',
  //         confirmedDate: null,
  //         paymentStatus: PAYMENTSTATUS.Unpaid,
  //         paymentMode: familyPackage.paymentMode,
  //         amountWithOutDiscount: familyPayment.originalAmount,
  //         amount: familyPayment.amountToDebit,
  //         subscriberType: SUBSCRIBERTYPE.Family,
  //         subscriberDbId: familySubscriber.id,
  //         subscriberPaymentDbId: familyPayment.id,
  //         paymentReferenceCode: newPackage.paymentReferenceCode,
  //         subscriberName: `${familySubscriber.name}`,
  //         momTransactionId: null,
  //         debitOrderTransactionId: null,
  //         mandateId: null,
  //         phoneNumber: familyPackage.momoNumber ?? null,
  //       };
  //       await this.paymentService.makePayment(x);
  //     }

  //     return {
  //       message: 'Family Package has been successfully created.',
  //       status: HttpStatus.CREATED,
  //       success: true,
  //     };
  //   } catch (error) {
  //     if (
  //       error instanceof QueryFailedError &&
  //       error.message.includes('duplicate key')
  //     ) {
  //       throw new ConflictException(
  //         'Subscriber with this name already exists.',
  //       );
  //     } else {
  //       throw error;
  //     }
  //   }
  // }

  async createPackage(data: CreateFamilyPackageDto, createdBy: string) {
    const familySubscriber = await this.findOneById(data.familyId);
    const newPackage = this.createFamilyPackage(
      data,
      createdBy,
      familySubscriber,
    );
    const familyPayment = await this.createFamilyPayment(
      data,
      newPackage,
      createdBy,
    );

    if (data.paymentMode !== PAYMENTMODE.MOMO) {
      await this.makePayment(data, familySubscriber, newPackage, familyPayment);
    }

    return {
      message: 'Family Package has been successfully created.',
      status: HttpStatus.CREATED,
      success: true,
    };
  }

  private createFamilyPackage(
    data: CreateFamilyPackageDto,
    createdBy: string,
    familySubscriber: FamilySubscriber,
  ): FamilyPackage {
    const newPackage = new FamilyPackage();
    const reference = `${SUBSCRIBER_CODES.Family}-${Date.now().toString(
      36,
    )}-${uuidv4()}`;

    newPackage.amountToDebit = data.amountToDebit;
    newPackage.createdBy = createdBy;
    newPackage.discount = data.discount;
    newPackage.frequency = data.frequency;
    newPackage.paymentMode = data.paymentMode;
    newPackage.familySubscriber = familySubscriber;
    newPackage.paymentReferenceCode = reference;

    switch (data.paymentMode) {
      case PAYMENTMODE.Cash:
        break;
      case PAYMENTMODE.CAGD:
        newPackage.CAGDStaffID = data.CAGDStaffID;
        break;
      case PAYMENTMODE.Cheque:
        newPackage.chequeNumber = data.chequeNumber;
        if (data.bank) {
          this.setBank(newPackage, data.bank);
        }
        break;
      case PAYMENTMODE.MOMO:
        newPackage.momoNetwork = data.momoNetwork;
        newPackage.momoNumber = data.momoNumber;
        break;
      case PAYMENTMODE.StandingOrder:
        newPackage.accountNumber = data.accountNumber;
        if (data.bank) {
          this.setBank(newPackage, data.bank);
        }
        break;
    }

    return newPackage;
  }

  private setBank(newPackage: FamilyPackage, bankId: number): void {
    if (newPackage.bank) {
      newPackage.bank.id = +bankId;
    } else {
      const bank = new Bank();
      bank.id = +bankId;
      newPackage.bank = bank;
    }
  }

  private async createFamilyPayment(
    data: CreateFamilyPackageDto,
    newPackage: FamilyPackage,
    createdBy: string,
  ): Promise<FamilySubscriberPayment> {
    const payment = new FamilySubscriberPayment();
    payment.createdBy = createdBy;
    payment.paymentStatus = PAYMENTSTATUS.Unpaid;
    payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO;
    payment.referenceCode = newPackage.paymentReferenceCode;
    payment.amountToDebit = calculateDiscount(
      data.amountToDebit,
      +data.discount,
    );
    payment.originalAmount = data.amountToDebit;
    payment.familyPackage = newPackage;
    payment.mandateStatus =
      data.paymentMode === PAYMENTMODE.MOMO
        ? MANDATESTATUS.Pending
        : MANDATESTATUS.None;

    return this.familySubscriberPaymentRepository.save(payment);
  }

  private async makePayment(
    data: CreateFamilyPackageDto,
    familySubscriber: FamilySubscriber,
    newPackage: FamilyPackage,
    familyPayment: FamilySubscriberPayment,
  ): Promise<void> {
    const paymentData: IPayment = {
      dateOfPayment: new Date(),
      confirmed: false,
      confirmedBy: '',
      confirmedDate: null,
      paymentStatus: PAYMENTSTATUS.Paid,
      paymentMode: newPackage.paymentMode,
      amountWithOutDiscount: familyPayment.originalAmount,
      amount: familyPayment.amountToDebit,
      subscriberType: SUBSCRIBERTYPE.Family,
      subscriberDbId: familySubscriber.id,
      subscriberPaymentDbId: familyPayment.id,
      paymentReferenceCode: newPackage.paymentReferenceCode,
      subscriberName: `${familySubscriber.name}`,
      momTransactionId: null,
      debitOrderTransactionId: null,
      mandateId: null,
      phoneNumber: newPackage.momoNumber ?? null,
    };
    await this.paymentService.makePayment(paymentData);
  }

  async findPackageById(id: number) {
    const x = await this.familyPackageRepository.findOneBy({ id });
    if (!x) {
      throw new NotFoundException(`FamilyPackage with ID ${id} not found.`);
    }
    return x;
  }

  async findFamilyPacakge(id: number) {
    const payment = await this.familyPackageRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.familySubscriber', 'familySubscriber')
      .where('familySubscriber.id = :familySubscriberId', {
        familySubscriberId: id,
      })
      .getOne();

    if (!payment) {
      throw new NotFoundException(
        `Package for family with ID ${id} not found.`,
      );
    }

    return payment;
  }

  async updatePackage(
    packageId: number,
    data: UpdateFamilyPackageDto,
    updatedBy: string,
  ) {
    const existingPackage = await this.findPackageById(packageId);

    // Update properties based on your requirements
    existingPackage.amountToDebit =
      data.amountToDebit ?? existingPackage.amountToDebit;
    existingPackage.discount = data.discount ?? existingPackage.discount;
    existingPackage.frequency = data.frequency ?? existingPackage.frequency;
    existingPackage.paymentMode =
      data.paymentMode ?? existingPackage.paymentMode;

    existingPackage.updateBy = updatedBy;

    if (data.paymentMode === PAYMENTMODE.Cash) {
      existingPackage.momoNetwork = MOMONETWORK.None;
      existingPackage.momoNumber = '';
      existingPackage.CAGDStaffID = '';
      existingPackage.chequeNumber = '';
      existingPackage.accountNumber = '';
      existingPackage.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.CAGD) {
      existingPackage.momoNetwork = MOMONETWORK.None;
      existingPackage.momoNumber = '';
      existingPackage.CAGDStaffID =
        data.CAGDStaffID ?? existingPackage.CAGDStaffID;
      existingPackage.chequeNumber = '';
      existingPackage.accountNumber = '';
      existingPackage.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.Cheque) {
      existingPackage.momoNetwork = MOMONETWORK.None;
      existingPackage.momoNumber = '';
      existingPackage.CAGDStaffID = '';
      existingPackage.chequeNumber =
        data.chequeNumber ?? existingPackage.chequeNumber;
      existingPackage.accountNumber = '';
      if (existingPackage.bank && data.bank) {
        existingPackage.bank.id = +data.bank ?? existingPackage.bank.id;
      } else if (!existingPackage.bank && data.bank) {
        const bank = new Bank();
        bank.id = +data.bank;
        existingPackage.bank = bank;
      }
    } else if (data.paymentMode === PAYMENTMODE.MOMO) {
      existingPackage.momoNetwork =
        data.momoNetwork ?? existingPackage.momoNetwork;
      existingPackage.momoNumber =
        data.momoNumber ?? existingPackage.momoNumber;
      existingPackage.CAGDStaffID = '';
      existingPackage.chequeNumber = '';
      existingPackage.accountNumber = '';
      existingPackage.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.StandingOrder) {
      existingPackage.momoNetwork = MOMONETWORK.None;
      existingPackage.momoNumber = '';
      existingPackage.CAGDStaffID = '';
      existingPackage.chequeNumber = '';
      existingPackage.accountNumber =
        data.accountNumber ?? existingPackage.accountNumber;
      if (existingPackage.bank && data.bank) {
        existingPackage.bank.id = +data.bank ?? existingPackage.bank.id;
      } else if (!existingPackage.bank && data.bank) {
        const bank = new Bank();
        bank.id = +data.bank;
        existingPackage.bank = bank;
      }
    }
    try {
      await this.familyPackageRepository.save(existingPackage);
      const payment = await this.familySubscriberPaymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.familyPackage', 'familyPackage')
        .where('familyPackage.id = :familyPackageId', {
          familyPackageId: existingPackage.id,
        })
        .getOne();

      if (!payment) {
        throw new NotFoundException(
          `Payment not found for FamilyPackage with ID ${packageId}.`,
        );
      }

      payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
      payment.confirmedBy =
        data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
      payment.paymentStatus =
        data.paymentMode === PAYMENTMODE.MOMO
          ? PAYMENTSTATUS.Paid
          : PAYMENTSTATUS.Unpaid;

      payment.updatedBy = updatedBy;

      await this.familySubscriberPaymentRepository.save(payment);

      return {
        message: 'Family Package has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllWithoutPagination() {
    return this.familyRepository.find();
  }

  private async generateStaffCode(): Promise<string> {
    const latestMemberID = await this.familyRepository
      .createQueryBuilder('family_subscriber')
      .select('family_subscriber.familyMembershipID')
      .orderBy(
        'CAST(SUBSTRING(family_subscriber.familyMembershipID, 10, LEN(family_subscriber.familyMembershipID)) AS INT)',
        'DESC',
      )
      .limit(1)
      .getRawOne();

    let latestUniqueNumber = 0;
    if (latestMemberID && latestMemberID.family_subscriber_familyMembershipID) {
      const match =
        latestMemberID.family_subscriber_familyMembershipID.match(/\d+$/);
      latestUniqueNumber = match ? parseInt(match[0], 10) : 0;
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const uniqueNumber = Number(latestUniqueNumber.toString().slice(6)) + 1;
    return `${SUBSCRIBER_CODES.Family}${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }
}
