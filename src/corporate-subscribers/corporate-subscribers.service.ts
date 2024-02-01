import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
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
import { PAYMENTMODE, PAYMENTSTATUS } from 'src/lib';
import { UpdateCorporatePackageDto } from './dto/update-corporate-package.dto';

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

  async createPackage(data: CreateCorporatePackageDto, createdBy: string) {
    const corporateSubscriber = await this.findOneById(data.corporateId);

    const newPackage = new CorporatePackage();
    newPackage.amountToDebit = data.amountToDebit;
    newPackage.createdBy = createdBy;
    newPackage.discount = data.discount;
    newPackage.frequency = data.frequency;
    newPackage.momoNetwork = data.momoNetwork;
    newPackage.momoNumber = data.momoNumber;
    newPackage.paymentMode = data.paymentMode;
    newPackage.corporateSubscriber = corporateSubscriber;

    try {
      await this.corporatePackageRepository.save(newPackage);

      const payment = new CorporateSubscriberPayment();
      payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
      payment.confirmedBy =
        data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
      payment.createdBy === createdBy;
      payment.paymentStatus = PAYMENTMODE.MOMO
        ? PAYMENTSTATUS.Paid
        : PAYMENTSTATUS.Unpaid;

      payment.createdBy = createdBy;

      payment.corporatePackage = newPackage;

      await this.corporateSubscriberPaymentRepository.save(payment);

      return {
        message: 'Corporate Package has been successfully created.',
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
    const existingPackage = await this.findPackageById(packageId);

    // Update properties based on your requirements
    existingPackage.amountToDebit = data.amountToDebit;
    existingPackage.discount = data.discount;
    existingPackage.frequency = data.frequency;
    existingPackage.momoNetwork = data.momoNetwork;
    existingPackage.momoNumber = data.momoNumber;
    existingPackage.paymentMode = data.paymentMode;

    try {
      await this.corporatePackageRepository.save(existingPackage);

      // Update associated payment
      const payment = await this.corporateSubscriberPaymentRepository.findOne({
        where: { corporatePackage: existingPackage },
      });

      if (!payment) {
        throw new NotFoundException(
          `Payment not found for Corporate Package with ID ${packageId}.`,
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

      await this.corporateSubscriberPaymentRepository.save(payment);

      return {
        message: 'Corporate Package has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      throw error;
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
    return `CNS${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }
}
