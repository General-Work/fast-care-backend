import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateCorporateSubscriberDto } from './dto/create-corporate-subscriber.dto';
import { UpdateCorporateSubscriberDto } from './dto/update-corporate-subscriber.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CorporateSubscriber } from './entities/corporate-subscriber.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CorporateBeneficiaries } from './entities/corporate-beneficiaries.entity';
import { CorporatePackage } from './entities/corporate-package.entity';
import { CorporateSubscriberPayment } from './entities/corporate-payment.entity';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
import { Staff } from 'src/staff/entities/staff.entity';
import { CreateCorporateBeneficiaryDto } from './dto/create-corporate-beneficiaries.dto';
import { Package } from 'src/packages/entities/package.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { UpdateCorporateBeneficiaryDto } from './dto/update-corporate-beneficiary.dto';
import { CreateCorporatePackageDto } from './dto/create-corporate-package.dto';
import {
  IPayment,
  ISubscriberDto,
  MANDATESTATUS,
  MOMONETWORK,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBERTYPE,
  SUBSCRIBER_CODES,
  SUBSCRIBER_STATUS,
  calculateDiscount,
  delay,
} from 'src/lib';
import { UpdateCorporatePackageDto } from './dto/update-corporate-package.dto';
import { Bank } from 'src/bank/entities/bank.entity';
import { v4 as uuidv4 } from 'uuid';
import { PaymentsService } from 'src/payments/payments.service';

export enum CorporateSort {
  id_asc = 'id_asc',
  id_desc = 'id_desc',
  name_asc = 'name_asc',
  name_desc = 'name_desc',
  idNumber_asc = 'idNumber_asc',
  idNumber_desc = 'idNumber_desc',
  corporateMembershipID_asc = 'corporateMembershipID_asc',
  corporateMembershipID_desc = 'corporateMembershipID_desc',
  agent_asc = 'agent_asc',
  agent_desc = 'agent_desc',
  createdAt_asc = 'createdAt_asc',
  createdAt_desc = 'createdAt_desc',
}

@Injectable()
export class CorporateSubscribersService {
  constructor(
    @InjectRepository(CorporateSubscriber)
    private readonly corporateRepository: Repository<CorporateSubscriber>,
    @InjectRepository(CorporateBeneficiaries)
    private readonly corporateBeneficiayRepository: Repository<CorporateBeneficiaries>,
    @InjectRepository(CorporatePackage)
    private readonly corporatePackageRepository: Repository<CorporatePackage>,
    @InjectRepository(CorporateSubscriberPayment)
    private readonly corporateSubscriberPaymentRepository: Repository<CorporateSubscriberPayment>,
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
  ) {}

  async create(
    data: CreateCorporateSubscriberDto,
    createdBy: string,
    agent: number,
  ) {
    const staff = new Staff();
    staff.id = agent;
    const corporate = new CorporateSubscriber();
    corporate.name = data.name;
    corporate.idNumber = data.idNumber;
    corporate.address = data.address;
    corporate.contact = data.contact;
    corporate.email = data.email;
    corporate.agent = staff;
    corporate.principalPerson = data.principalPerson;
    corporate.principalPersonPhone = data.principalPersonPhone;
    corporate.createdBy = createdBy;
    corporate.corporateMembershipID = await this.generateStaffCode();

    try {
      await this.corporateRepository.save(corporate);

      return {
        message: 'Corporate has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException(
          'Corporate with this details already exists. Confirm contact',
        );
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    // const { filter, order } = options;

    // const filters = [
    //   { corporateMembershipID: filter?.corporateMembershipID },
    //   { name: filter?.name },
    // ].filter((filter) => filter[Object.keys(filter)[0]]);

    return this.paginationService.paginate({
      ...options,
      // order: order.filter((o) => o.direction),
      // filter: filters.length
      //   ? filters.reduce((acc, curr) => ({ ...acc, ...curr }))
      //   : {},
      repository: this.corporateRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.agent', 'agent')
        .leftJoinAndSelect('item.corporatePackage', 'corporatePackage')
        .leftJoinAndMapOne(
          'corporatePackage.bank',
          Bank,
          'bank',
          'bank.id = corporatePackage.bank',
        )
        .leftJoinAndMapMany(
          'item.beneficiaries',
          CorporateBeneficiaries,
          'beneficiary',
          'beneficiary.corporateSubscriber = item.id',
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

  async findOneWithRelations(id: number) {
    return this.corporateRepository.findOne({
      where: { id },
      relations: ['agent', 'corporatePackage', 'beneficiaries'],
    });
  }

  async findOneById(id: number) {
    const res = await this.corporateRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException(`Corporate with ID ${id} not found.`);
    }
    return res;
  }

  async update(
    id: number,
    updateDto: UpdateCorporateSubscriberDto,
    updatedBy: string,
  ): Promise<{ message: string; status: number; success: boolean }> {
    const corporate = await this.findOneById(id);

    corporate.name = updateDto.name ?? corporate.name;
    corporate.idNumber = updateDto.idNumber ?? corporate.idNumber;
    corporate.address = updateDto.address ?? corporate.address;
    corporate.contact = updateDto.contact ?? corporate.contact;
    corporate.email = updateDto.email ?? corporate.email;
    corporate.principalPerson =
      updateDto.principalPerson ?? corporate.principalPerson;
    corporate.principalPersonPhone =
      updateDto.principalPersonPhone ?? corporate.principalPersonPhone;

    corporate.updatedBy = updatedBy;

    try {
      await this.corporateRepository.save(corporate);

      return {
        message: 'Corporate has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    const corporate = await this.findOneById(id);

    await this.corporateRepository.remove(corporate);

    return {
      message: 'Subscriber has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async findBeneficiaryById(id: number) {
    const res = await this.corporateBeneficiayRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException(`Beneficiary with ID ${id} not found.`);
    }
    return res;
  }

  async removeBeneficiary(id: number) {
    const subscriber = await this.findBeneficiaryById(id);

    await this.corporateBeneficiayRepository.remove(subscriber);

    return {
      message: 'Beneficiary has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async createBeneficiary(
    createDto: CreateCorporateBeneficiaryDto,
    createdBy: string,
  ) {
    const corporateSubscriber = await this.findOneById(createDto.corporateId);

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

    const beneficiary = new CorporateBeneficiaries();
    beneficiary.name = createDto.name;
    beneficiary.dateOfBirth = createDto.dateOfBirth;
    beneficiary.contact = createDto.contact;
    beneficiary.facility = newFacility;
    beneficiary.package = newPackage;
    beneficiary.corporateSubscriber = corporateSubscriber;
    beneficiary.createdBy = createdBy;

    try {
      await this.corporateBeneficiayRepository.save(beneficiary);
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
    updateDto: UpdateCorporateBeneficiaryDto,
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
      await this.corporateBeneficiayRepository.save(beneficiary);
      return {
        message: 'Succesfully updated Beneficiary',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllByCorporateSubscriberBeneficiaries(id: number) {
    const corporate = await this.findOneById(id);
    return corporate.beneficiaries;
  }

  // async findCorporateBeneficiaries(id: number) {
  //   return await this.corporateBeneficiayRepository
  //     .createQueryBuilder('beneficiary')
  //     .leftJoinAndSelect('beneficiary.facility', 'facility')
  //     .leftJoinAndSelect('beneficiary.package', 'package')
  //     .where('beneficiary.corporateSubscriber.id = :corporateSubscriberId', {
  //       id,
  //     })
  //     .getMany();
  // }

  // async createPackage(data: CreateCorporatePackageDto, createdBy: string) {
  //   const corporateSubscriber = await this.findOneById(data.corporateId);

  //   const newPackage = new CorporatePackage();
  //   newPackage.amountToDebit = data.amountToDebit;
  //   newPackage.createdBy = createdBy;
  //   newPackage.discount = data.discount;
  //   newPackage.frequency = data.frequency;
  //   newPackage.corporateSubscriber = corporateSubscriber;
  //   newPackage.paymentMode = data.paymentMode;

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
  //     await this.corporatePackageRepository.save(newPackage);

  //     const payment = new CorporateSubscriberPayment();
  //     payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
  //     payment.confirmedBy =
  //       data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
  //     payment.createdBy === createdBy;
  //     payment.paymentStatus = PAYMENTMODE.MOMO
  //       ? PAYMENTSTATUS.Paid
  //       : PAYMENTSTATUS.Unpaid;

  //     payment.createdBy = createdBy;

  //     payment.corporatePackage = newPackage;

  //     await this.corporateSubscriberPaymentRepository.save(payment);

  //     return {
  //       message: 'Corporate Package has been successfully created.',
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

  async createPackage(
    data: CreateCorporatePackageDto,
    createdBy: string,
    agent: number,
  ) {
    if (data.paymentMode === PAYMENTMODE.MOMO) {
      throw new BadRequestException('MOMO Payment not available now');
    }
    try {
      const corporateSubscriber = await this.findOneById(data.corporateId);
      // console.log(corporateSubscriber)
      const newPackage = await this.createCorporatePackage(
        data,
        createdBy,
        corporateSubscriber,
      );
      // console.log(newPackage);
      const corporatePayment = await this.createCorporatePayment(
        data,
        newPackage,
        createdBy,
      );
      // console.log(corporatePayment);

      // if (data.paymentMode !== PAYMENTMODE.MOMO) {
      await this.makePayment(
        data,
        corporateSubscriber,
        newPackage,
        corporatePayment,
        agent,
      );
      // }

      const subscriberData: ISubscriberDto = {
        name: corporateSubscriber.name,
        agentId: corporateSubscriber.agent.id,
        subscriberId: corporateSubscriber.id,
        subscriberType: SUBSCRIBERTYPE.Corporate,
        membershipID: corporateSubscriber.corporateMembershipID,
        corporatePackageId: newPackage.id,
        corporatePaymentId: corporatePayment.id,
        discount: newPackage.discount,
        paymentMode: newPackage.paymentMode,
        amountToDebit: corporatePayment.amountToDebit,
        originalAmount: corporatePayment.originalAmount,
        frequency: newPackage.frequency,
        momoNetwork: newPackage.momoNetwork,
        momoNumber: newPackage.momoNumber,
        accountNumber: newPackage.accountNumber,
        chequeNumber: newPackage.chequeNumber,
        CAGDStaffID: newPackage.CAGDStaffID,
        paymentReferenceCode: newPackage.paymentReferenceCode,
        bank: newPackage?.bank ?? null,
        status: SUBSCRIBER_STATUS.Active,
        createdAt: new Date()
      };
      await this.paymentService.addToAllSubscribers(subscriberData);

      return {
        message: 'Corporate Package has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (e) {
      throw e;
    }
  }

  private async createCorporatePackage(
    data: CreateCorporatePackageDto,
    createdBy: string,
    corporateSubscriber: CorporateSubscriber,
  ) {
    const newPackage = new CorporatePackage();
    const reference = `${SUBSCRIBER_CODES.Corporate}-${Date.now().toString(
      36,
    )}-${uuidv4()}`;

    newPackage.amountToDebit = data.amountToDebit;
    newPackage.createdBy = createdBy;
    newPackage.discount = data.discount;
    newPackage.frequency = data.frequency;
    newPackage.paymentMode = data.paymentMode;
    newPackage.corporateSubscriber = corporateSubscriber;
    newPackage.paymentReferenceCode = reference;

    if (data.paymentMode === PAYMENTMODE.Cash) {
      newPackage.momoNetwork = MOMONETWORK.None;
      newPackage.momoNumber = '';
      newPackage.CAGDStaffID = '';
      newPackage.chequeNumber = '';
      newPackage.accountNumber = '';
      newPackage.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.CAGD) {
      newPackage.momoNetwork = MOMONETWORK.None;
      newPackage.momoNumber = '';
      newPackage.CAGDStaffID = data.CAGDStaffID;
      newPackage.chequeNumber = '';
      newPackage.accountNumber = '';
      newPackage.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.Cheque) {
      newPackage.momoNetwork = MOMONETWORK.None;
      newPackage.momoNumber = '';
      newPackage.CAGDStaffID = '';
      newPackage.chequeNumber = data.chequeNumber;
      newPackage.accountNumber = '';
      if (data.bank) {
        const bank = new Bank();
        bank.id = data.bank;
        newPackage.bank = bank;
      } else {
        newPackage.bank = null;
      }
    } else if (data.paymentMode === PAYMENTMODE.MOMO) {
      newPackage.momoNetwork = data.momoNetwork;
      newPackage.momoNumber = data.momoNumber;
      newPackage.CAGDStaffID = '';
      newPackage.chequeNumber = '';
      newPackage.accountNumber = '';
      newPackage.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.StandingOrder) {
      newPackage.momoNetwork = MOMONETWORK.None;
      newPackage.momoNumber = '';
      newPackage.CAGDStaffID = '';
      newPackage.chequeNumber = '';
      newPackage.accountNumber = data.accountNumber;
      if (data.bank) {
        const bank = new Bank();
        bank.id = data.bank;
        newPackage.bank = bank;
      } else {
        newPackage.bank = null;
      }
    }

    // switch (data.paymentMode) {
    //   case PAYMENTMODE.Cash:
    //     break;
    //   case PAYMENTMODE.CAGD:
    //     newPackage.CAGDStaffID = data.CAGDStaffID;
    //     break;
    //   case PAYMENTMODE.Cheque:
    //     newPackage.chequeNumber = data.chequeNumber;
    //     if (data.bank) {
    //       this.setBank(newPackage, data.bank);
    //     }
    //     break;
    //   case PAYMENTMODE.MOMO:
    //     newPackage.momoNetwork = data.momoNetwork;
    //     newPackage.momoNumber = data.momoNumber;
    //     break;
    //   case PAYMENTMODE.StandingOrder:
    //     newPackage.accountNumber = data.accountNumber;
    //     if (data.bank) {
    //       this.setBank(newPackage, data.bank);
    //     }
    //     break;
    // }

    // return newPackage;
    // // console.log(newPackage);
    return await this.corporatePackageRepository.save(newPackage);
  }

  private setBank(newPackage: CorporatePackage, bankId: number): void {
    if (newPackage.bank) {
      newPackage.bank.id = bankId;
    } else if (!newPackage.bank && bankId) {
      const bank = new Bank();
      bank.id = bankId;
      newPackage.bank = bank;
    } else {
      newPackage.bank = null;
    }
  }

  private async createCorporatePayment(
    data: CreateCorporatePackageDto,
    newPackage: CorporatePackage,
    createdBy: string,
  ): Promise<CorporateSubscriberPayment> {
    const payment = new CorporateSubscriberPayment();
    payment.createdBy = createdBy;
    payment.paymentStatus = PAYMENTSTATUS.Unpaid;
    payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO;
    payment.referenceCode = newPackage.paymentReferenceCode;
    payment.amountToDebit = calculateDiscount(
      data.amountToDebit,
      +data.discount,
    );
    payment.originalAmount = data.amountToDebit;
    payment.corporatePackage = newPackage;
    payment.mandateStatus =
      data.paymentMode === PAYMENTMODE.MOMO
        ? MANDATESTATUS.Pending
        : MANDATESTATUS.None;

    return await this.corporateSubscriberPaymentRepository.save(payment);
  }

  private async makePayment(
    data: CreateCorporatePackageDto,
    familySubscriber: CorporateSubscriber,
    newPackage: CorporatePackage,
    familyPayment: CorporateSubscriberPayment,
    agent: number,
  ) {
    const paymentData: IPayment = {
      dateOfPayment: new Date(),
      agentId: agent,
      confirmed: false,
      confirmedBy: '',
      confirmedDate: null,
      paymentStatus: PAYMENTSTATUS.Paid,
      paymentMode: newPackage.paymentMode,
      amountWithOutDiscount: familyPayment.originalAmount,
      amount: familyPayment.amountToDebit,
      subscriberType: SUBSCRIBERTYPE.Corporate,
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
    const x = await this.corporatePackageRepository.findOneBy({ id });
    if (!x) {
      throw new NotFoundException(`Corporate Package with ID ${id} not found.`);
    }
    return x;
  }

  async updatePackage(
    packageId: number,
    data: UpdateCorporatePackageDto,
    updatedBy: string,
  ) {
    if (data.paymentMode === PAYMENTMODE.MOMO) {
      throw new BadRequestException('Momo Payment not available now');
    }
    const existingPackage = await this.findPackageById(packageId);

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
      } else if (existingPackage.bank && !data.bank) {
        existingPackage.bank = null;
      } else {
        existingPackage.bank = null;
      }
      // }
      // else if (data.paymentMode === PAYMENTMODE.MOMO) {
      //   existingPackage.momoNetwork =
      //     data.momoNetwork ?? existingPackage.momoNetwork;
      //   existingPackage.momoNumber =
      //     data.momoNumber ?? existingPackage.momoNumber;
      //   existingPackage.CAGDStaffID = '';
      //   existingPackage.chequeNumber = '';
      //   existingPackage.accountNumber = '';
      //   existingPackage.bank = null;
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
      } else if (existingPackage.bank && !data.bank) {
        existingPackage.bank = null;
      } else {
        existingPackage.bank = null;
      }
    }

    try {
      const newPackage =
        await this.corporatePackageRepository.save(existingPackage);

      // Update associated payment
      const payment = await this.corporateSubscriberPaymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.corporatePackage', 'corporatePackage')
        .where('corporatePackage.id = :corporatePackageId', {
          corporatePackageId: existingPackage.id,
        })
        .getOne();

      if (!payment) {
        throw new NotFoundException(
          `Payment not found for Corporate Package with ID ${packageId}.`,
        );
      }

      // payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
      // payment.confirmedBy =
      //   data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
      // payment.paymentStatus =
      //   data.paymentMode === PAYMENTMODE.MOMO
      //     ? PAYMENTSTATUS.Paid
      //     : PAYMENTSTATUS.Unpaid;

      payment.updatedBy = updatedBy;

      const corporatePayment =
        await this.corporateSubscriberPaymentRepository.save(payment);

      const subscriberData = {
        discount: newPackage.discount,
        paymentMode: newPackage.paymentMode,
        amountToDebit: corporatePayment.amountToDebit,
        originalAmount: corporatePayment.originalAmount,
        frequency: newPackage.frequency,
        momoNetwork: newPackage.momoNetwork,
        momoNumber: newPackage.momoNumber,
        accountNumber: newPackage.accountNumber,
        chequeNumber: newPackage.chequeNumber,
        CAGDStaffID: newPackage.CAGDStaffID,
        paymentReferenceCode: newPackage.paymentReferenceCode,
        bank: newPackage?.bank ?? null,
      };
      await this.paymentService.updateSubscriber(
        existingPackage.paymentReferenceCode,
        subscriberData,
      );

      return {
        message: 'Corporate Package has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async findFamilyPacakge(id: number) {
    const payment = await this.corporatePackageRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.corporateSubscriber', 'corporateSubscriber')
      .where('corporateSubscriber.id = :corporateSubscriberId', {
        corporateSubscriberId: id,
      })
      .getOne();

    if (!payment) {
      throw new NotFoundException(
        `Package for Corporate with ID ${id} not found.`,
      );
    }

    return payment;
  }

  async findAllWithoutPagination() {
    return await this.corporateRepository.find();
  }

  async updateMandateStatus(data: {
    momoNumber: string;
    referenceCode: string;
    mandateID: string;
    mandateStatus: MANDATESTATUS;
    success: boolean;
  }) {
    try {
      return await this.updateMandateStatusWithRetry(data);
    } catch (e) {
      return e; // Handling the error outside
    }
  }

  private async updateMandateStatusWithRetry(
    data: {
      momoNumber: string;
      referenceCode: string;
      mandateID: string;
      mandateStatus: MANDATESTATUS;
      success: boolean;
    },
    retryCount: number = 0,
  ): Promise<HttpStatus> {
    try {
      const result = await this.findAndProcessSubscriberPayment(data);
      if (result === null && retryCount < 3) {
        // Retry after 2 minutes
        await delay(1 * 60 * 1000);
        return await this.updateMandateStatusWithRetry(
          data,

          retryCount + 1,
        );
      }
      return result;
    } catch (e) {
      throw e; // Re-throwing the error to handle it outside
    }
  }

  private async findAndProcessSubscriberPayment(
    data: {
      momoNumber: string;
      referenceCode: string;
      mandateID: string;
      mandateStatus: MANDATESTATUS;
      success: boolean;
    },
    // subscriberRepository: SubscriberRepository,
    // subscriberPaymentRepository: SubscriberPaymentRepository,
  ): Promise<HttpStatus> {
    try {
      const payment = await this.corporateSubscriberPaymentRepository
        .createQueryBuilder('payment')
        // .select(['id', 'payments'])
        .where('payment.referenceCode = :referenceCode', {
          referenceCode: data.referenceCode,
        })
        .orderBy('payment.id', 'DESC')
        .select(['payment'])
        .getOne();

      console.log(payment);

      if (!payment) {
        return null;
      }

      const paymentToUpdate = payment;
      paymentToUpdate.confirmed = data.success ? true : false;
      paymentToUpdate.confirmedBy = data.success ? 'Payment gateway' : '';
      paymentToUpdate.confirmedDate = data.success
        ? new Date()
        : payment.confirmedDate;
      paymentToUpdate.mandateID = data.mandateID;
      paymentToUpdate.mandateStatus = data.mandateStatus;

      // console.log(paymentToUpdate);

      await this.corporateSubscriberPaymentRepository.save(paymentToUpdate);

      // console.log('res', res);
    } catch (e) {
      console.log(e); // Re-throwing the error to handle it outside
      return null;
    }
  }

  private async generateStaffCode(): Promise<string> {
    const latestMemberID = await this.corporateRepository
      .createQueryBuilder('corporate_subscriber')
      .select('corporate_subscriber.corporateMembershipID')
      .orderBy(
        'CAST(SUBSTRING(corporate_subscriber.corporateMembershipID, 10, LEN(corporate_subscriber.corporateMembershipID)) AS INT)',
        'DESC',
      )
      .limit(1)
      .getRawOne();

    let latestUniqueNumber = 0;
    if (
      latestMemberID &&
      latestMemberID.corporate_subscriber_corporateMembershipID
    ) {
      const match =
        latestMemberID.corporate_subscriber_corporateMembershipID.match(/\d+$/);
      latestUniqueNumber = match ? parseInt(match[0], 10) : 0;
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const uniqueNumber = Number(latestUniqueNumber.toString().slice(6)) + 1;
    return `${SUBSCRIBER_CODES.Corporate}${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }
}
