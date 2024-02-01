import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
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
import { PAYMENTMODE, PAYMENTSTATUS } from 'src/lib';
import { UpdateFamilyPackageDto } from './dto/update-family-package.dto';
import { Bank } from 'src/bank/entities/bank.entity';

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

  async createPackage(data: CreateFamilyPackageDto, createdBy: string) {
    const familySubscriber = await this.findOneById(data.familyId);

    const newPackage = new FamilyPackage();
    newPackage.amountToDebit = data.amountToDebit;
    newPackage.createdBy = createdBy;
    newPackage.discount = data.discount;
    newPackage.frequency = data.frequency;
    newPackage.momoNetwork = data.momoNetwork;
    newPackage.momoNumber = data.momoNumber;
    newPackage.paymentMode = data.paymentMode;
    newPackage.familySubscriber = familySubscriber;
    newPackage.CAGDStaffID = data.CAGDStaffID;
    newPackage.accountNumber = data.accountNumber;
    newPackage.chequeNumber = data.chequeNumber;
    if (data.bank) {
      const bank = new Bank();
      bank.id = data.bank;
      newPackage.bank = bank;
    }

    try {
      await this.familyPackageRepository.save(newPackage);

      const payment = new FamilySubscriberPayment();
      payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
      payment.confirmedBy =
        data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
      payment.createdBy === createdBy;
      payment.paymentStatus = PAYMENTMODE.MOMO
        ? PAYMENTSTATUS.Paid
        : PAYMENTSTATUS.Unpaid;

      payment.createdBy = createdBy;

      payment.familyPackage = newPackage;

      await this.familySubscriberPaymentRepository.save(payment);

      return {
        message: 'Family Package has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException(
          'Subscriber with this name already exists.',
        );
      } else {
        throw error;
      }
    }
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
    existingPackage.momoNetwork =
      data.momoNetwork ?? existingPackage.momoNetwork;
    existingPackage.momoNumber = data.momoNumber ?? existingPackage.momoNumber;
    existingPackage.paymentMode =
      data.paymentMode ?? existingPackage.paymentMode;
    existingPackage.CAGDStaffID =
      data.CAGDStaffID ?? existingPackage.CAGDStaffID;
    existingPackage.accountNumber =
      data.accountNumber ?? existingPackage.accountNumber;
    existingPackage.chequeNumber =
      data.chequeNumber ?? existingPackage.chequeNumber;
    if (data.bank) {
      const bank = new Bank();
      bank.id = data.bank;
      existingPackage.bank = bank;
    }

    try {
      await this.familyPackageRepository.save(existingPackage);

      // Update associated payment

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
    return `FNS${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }
}
