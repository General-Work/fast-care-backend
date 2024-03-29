import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIndividualSubscriberDto } from './dto/create-individual-subscriber.dto';
import { UpdateIndividualSubscriberDto } from './dto/update-individual-subscriber.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
import { IndividualSubscriber } from './entities/individual-subscriber.entity';
import { IndividualSubscriberPayment } from './entities/individual-subscriber-payment.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Package } from 'src/packages/entities/package.entity';
import {
  MANDATESTATUS,
  MOMONETWORK,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBER_CODES,
  calculateDiscount,
  createMandate,
} from 'src/lib';
import { Bank } from 'src/bank/entities/bank.entity';
import { PackagesService } from 'src/packages/packages.service';

export enum IndividualSort {
  id_asc = 'id_asc',
  id_desc = 'id_desc',
  name_asc = 'name_asc',
  name_desc = 'name_desc',
  idNumber_asc = 'idNumber_asc',
  idNumber_desc = 'idNumber_desc',
  membershipID_asc = 'membershipID_asc',
  membershipID_desc = 'membershipID_desc',
  firstName_asc = 'firstName_asc',
  firstName_desc = 'firstName_desc',
  lastName_asc = 'lastName_asc',
  lastName_desc = 'lastName_desc',
  agent_asc = 'agent_asc',
  agent_desc = 'agent_desc',
  createdAt_asc = 'createdAt_asc',
  createdAt_desc = 'createdAt_desc',
}
@Injectable()
export class IndividualSubscribersServicesa {
  constructor(
    @InjectRepository(IndividualSubscriber)
    private readonly subscriberRepository: Repository<IndividualSubscriber>,
    @InjectRepository(IndividualSubscriberPayment)
    private readonly subscriberPaymentRepository: Repository<IndividualSubscriberPayment>,
    private readonly paginationService: PaginationService,
    private readonly packageService: PackagesService,
  ) {}

  async create(
    data: CreateIndividualSubscriberDto,
    passportPicture: string | undefined,
    createdBy: string,
    agent: number,
  ) {
    const staff = await this.findOrCreateStaff(agent);
    const facility = await this.findOrCreateFacility(+data.facility);
    const group = await this.findOrCreateGroup(+data.group);
    const newPackage = await this.findOrCreatePackage(+data.package);

    const membershipID = await this.generateStaffCode();

    const packageAmount = (await this.packageService.findOne(+data.package))
      .amount;
    const amount = calculateDiscount(packageAmount, +data.discount);

    const subscriber = this.createSubscriberInstance(
      data,
      staff,
      createdBy,
      facility,
      group,
      newPackage,
      passportPicture,
      membershipID,
    );

    const payment = await this.createSubscriberPayment(
      data,
      subscriber,
      amount,
      packageAmount,
      createdBy,
    );

    try {
      if (data.paymentMode === PAYMENTMODE.MOMO) {
        const x = {
          amountToDebit: `${amount}`,
          momoNumber: data.momoNumber,
          momoNetWork: data.momoNetwork,
          membershipId: membershipID,
          frequency: data.frequency,
        };

        const res = await createMandate(x);

        if (res.responseCode === '03') {
          await this.saveSubscriberAndPayment(subscriber, payment);
          return {
            message: 'Subscriber has been successfully created.',
            status: HttpStatus.CREATED,
            success: true,
          };
        } else {
          throw new BadRequestException(res.responseMessage);
        }
      } else {
        await this.saveSubscriberAndPayment(subscriber, payment);
        return {
          message: 'Subscriber has been successfully created.',
          status: HttpStatus.CREATED,
          success: true,
        };
      }
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException(
          'Subscriber with this details already exists. Confirm idNumber and phoneOne',
        );
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    const alias = 'item';
    const properties = this.subscriberRepository.metadata.columns.map(
      (column) => `${alias}.${column.propertyName}`,
    );

    // Filter out 'passportPicture' property
    const selectedProperties = properties.filter(
      (property) => property !== `${alias}.passportPicture`,
    );

    const x = await this.paginationService.paginate({
      ...options,
      repository: this.subscriberRepository
        .createQueryBuilder(alias)
        .select(selectedProperties)
        .leftJoinAndSelect(`${alias}.agent`, 'agent')
        .leftJoinAndSelect(`${alias}.facility`, 'facility')
        .leftJoinAndSelect(`${alias}.package`, 'package')
        .leftJoinAndSelect(`${alias}.group`, 'group')
        .leftJoinAndSelect(`${alias}.bank`, 'bank'),
    });

    return x;
  }

  async findOneById(id: number) {
    const subscriber = await this.subscriberRepository.findOneBy({ id });
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }
    return subscriber;
  }

  async update(
    id: number,
    data: UpdateIndividualSubscriberDto,
    passportPicture: string | undefined,
    updatedBy: string,
  ): Promise<{ message: string; status: number; success: boolean }> {
    try {
      const subscriber = await this.findOneById(id);
      this.updateSubscriberFields(subscriber, data, passportPicture, updatedBy);
      await this.saveSubscriber(subscriber);
      await this.updateSubscriberPayment(subscriber, data, updatedBy);
      return {
        message: 'Subscriber has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      throw error; // Handle the error appropriately, e.g., log it or rethrow it
    }
  }

  async remove(id: number) {
    const subscriber = await this.findOneById(id);

    await this.subscriberRepository.remove(subscriber);

    return {
      message: 'Subscriber has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }

  private async generateStaffCode(): Promise<string> {
    const latestMemberID = await this.subscriberRepository
      .createQueryBuilder('individual_subscriber')
      .select('individual_subscriber.membershipID')
      .orderBy(
        'CAST(SUBSTRING(individual_subscriber.membershipID, 10, LEN(individual_subscriber.membershipID)) AS INT)',
        'DESC',
      )
      .limit(1)
      .getRawOne();

    let latestUniqueNumber = 0;
    if (latestMemberID && latestMemberID.individual_subscriber_membershipID) {
      const match =
        latestMemberID.individual_subscriber_membershipID.match(/\d+$/);
      latestUniqueNumber = match ? parseInt(match[0], 10) : 0;
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const uniqueNumber = Number(latestUniqueNumber.toString().slice(6)) + 1;
    return `${SUBSCRIBER_CODES.Individual}${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }

  private async findOrCreateStaff(agent: number): Promise<Staff> {
    const staff = new Staff();
    staff.id = agent;
    return staff;
  }

  private async findOrCreateFacility(facilityId: number): Promise<Facility> {
    const facility = new Facility();
    facility.id = facilityId;
    return facility;
  }

  private async findOrCreateGroup(groupId: number): Promise<Group> {
    const group = new Group();
    group.id = groupId;
    return group;
  }

  private async findOrCreatePackage(packageId: number): Promise<Package> {
    const newPackage = new Package();
    newPackage.id = packageId;
    return newPackage;
  }

  private createSubscriberInstance(
    data: CreateIndividualSubscriberDto,
    staff: Staff,
    createdBy: string,
    facility: Facility,
    group: Group,
    newPackage: Package,
    passportPicture: string | undefined,
    membershipID: string,
  ): IndividualSubscriber {
    const subscriber = new IndividualSubscriber();
    subscriber.NHISNumber = data.NHISNumber;
    subscriber.address = data.address;
    subscriber.agent = staff;
    subscriber.createdBy = createdBy;
    subscriber.dateOfBirth = data.dateOfBirth;
    subscriber.discount = data.discount;
    subscriber.emergencyPerson = data.emergencyPerson;
    subscriber.emergencyPersonPhone = data.emergencyPersonPhone;
    subscriber.firstName = data.firstName;
    subscriber.facility = facility;
    subscriber.frequency = data.frequency;
    subscriber.gender = data.gender;
    subscriber.gpsAddress = data.gpsAddress;
    subscriber.group = group.id ? group : null;
    subscriber.hasNHIS = data.hasNHIS;
    subscriber.idNumber = data.idNumber;
    subscriber.idType = data.idType;
    subscriber.lastName = data.lastName;
    subscriber.maritalStatus = data.maritalStatus;
    subscriber.membershipID = membershipID;
    subscriber.occupation = data.occupation;
    subscriber.otherNames = data.otherNames ?? '';
    subscriber.package = newPackage;
    subscriber.passportPicture = passportPicture;
    subscriber.phoneOne = data.phoneOne;
    subscriber.phoneTwo = data.phoneTwo ?? '';
    subscriber.paymentMode = data.paymentMode;

    if (data.paymentMode === PAYMENTMODE.Cash) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = '';
      subscriber.accountNumber = '';
      subscriber.bank = null;
    } else if (
      data.paymentMode === PAYMENTMODE.CAGD ||
      data.paymentMode === PAYMENTMODE.Cheque
    ) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID =
        data.paymentMode === PAYMENTMODE.CAGD ? data.CAGDStaffID : '';
      subscriber.chequeNumber =
        data.paymentMode === PAYMENTMODE.Cheque ? data.chequeNumber : '';
      subscriber.accountNumber = '';
      subscriber.bank = null;
      if (
        data.paymentMode === PAYMENTMODE.Cheque &&
        subscriber.bank &&
        data.bank
      ) {
        subscriber.bank.id = +data.bank;
      } else if (
        data.paymentMode === PAYMENTMODE.Cheque &&
        !subscriber.bank &&
        data.bank
      ) {
        const bank = new Bank();
        bank.id = +data.bank;
        subscriber.bank = bank;
      }
    } else if (data.paymentMode === PAYMENTMODE.MOMO) {
      subscriber.momoNetwork = data.momoNetwork;
      subscriber.momoNumber = data.momoNumber;
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = '';
      subscriber.accountNumber = '';
      subscriber.bank = null;
    } else if (data.paymentMode === PAYMENTMODE.StandingOrder) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = '';
      subscriber.accountNumber = data.accountNumber;
      if (subscriber.bank && data.bank) {
        subscriber.bank.id = +data.bank;
      } else if (!subscriber.bank && data.bank) {
        const bank = new Bank();
        bank.id = +data.bank;
        subscriber.bank = bank;
      }
    }

    return subscriber;
  }

  private async createSubscriberPayment(
    data: CreateIndividualSubscriberDto,
    subscriber: IndividualSubscriber,
    amount: number,
    packageAmount: number,
    createdBy: string,
  ): Promise<IndividualSubscriberPayment> {
    const payment = new IndividualSubscriberPayment();
    payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO;
    payment.confirmedBy =
      data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
    payment.createdBy = createdBy;
    payment.paymentStatus =
      data.paymentMode === PAYMENTMODE.MOMO
        ? PAYMENTSTATUS.Paid
        : PAYMENTSTATUS.Unpaid;
    payment.amountToDebit = amount;
    payment.originalAmount = packageAmount;
    payment.subscriber = subscriber;

    return payment;
  }

  private async saveSubscriberAndPayment(
    subscriber: IndividualSubscriber,
    payment: IndividualSubscriberPayment,
  ) {
    await this.subscriberRepository.save(subscriber);
    await this.subscriberPaymentRepository.save(payment);
  }

  private updateSubscriberFields(
    subscriber: IndividualSubscriber,
    data: UpdateIndividualSubscriberDto,
    passportPicture: string | undefined,
    updatedBy: string,
  ): void {
    subscriber.idNumber = data.idNumber ?? subscriber.idNumber;
    subscriber.idType = data.idType ?? subscriber.idType;
    subscriber.firstName = data.firstName ?? subscriber.firstName;
    subscriber.otherNames = data.otherNames ?? subscriber.otherNames;
    subscriber.lastName = data.lastName ?? subscriber.lastName;
    subscriber.dateOfBirth = data.dateOfBirth ?? subscriber.dateOfBirth;
    subscriber.gender = data.gender ?? subscriber.gender;
    subscriber.occupation = data.occupation ?? subscriber.occupation;
    subscriber.maritalStatus = data.maritalStatus ?? subscriber.maritalStatus;
    subscriber.address = data.address ?? subscriber.address;
    subscriber.gpsAddress = data.gpsAddress ?? subscriber.gpsAddress;
    subscriber.phoneOne = data.phoneOne ?? subscriber.phoneOne;
    subscriber.phoneTwo = data.phoneTwo ?? subscriber.phoneTwo;
    subscriber.emergencyPerson =
      data.emergencyPerson ?? subscriber.emergencyPerson;
    subscriber.emergencyPersonPhone =
      data.emergencyPersonPhone ?? subscriber.emergencyPersonPhone;
    subscriber.hasNHIS = data.hasNHIS ?? subscriber.hasNHIS;
    subscriber.NHISNumber = data.NHISNumber ?? subscriber.NHISNumber;
    subscriber.frequency = data.frequency ?? subscriber.frequency;
    subscriber.discount = data.discount ?? subscriber.discount;
    subscriber.passportPicture =
      passportPicture ?? subscriber.passportPicture ?? '';
    subscriber.updatedBy = updatedBy;
    this.updatePaymentModeFields(subscriber, data);
    this.updateRelationships(subscriber, data);
  }

  private updatePaymentModeFields(
    subscriber: IndividualSubscriber,
    data: UpdateIndividualSubscriberDto,
  ): void {
    const paymentMode = data.paymentMode ?? subscriber.paymentMode;
    subscriber.paymentMode = paymentMode;

    if (paymentMode === PAYMENTMODE.Cash) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = '';
      subscriber.accountNumber = '';
      subscriber.bank = null;
    } else if (paymentMode === PAYMENTMODE.CAGD) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID = data.CAGDStaffID ?? subscriber.CAGDStaffID;
      subscriber.chequeNumber = '';
      subscriber.accountNumber = '';
      subscriber.bank = null;
    } else if (paymentMode === PAYMENTMODE.Cheque) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = data.chequeNumber ?? subscriber.chequeNumber;
      subscriber.accountNumber = '';
      if (subscriber.bank && data.bank) {
        subscriber.bank.id = +data.bank ?? subscriber.bank.id;
      } else if (!subscriber.bank && data.bank) {
        const bank = new Bank();
        bank.id = +data.bank;
        subscriber.bank = bank;
      }
    } else if (paymentMode === PAYMENTMODE.MOMO) {
      subscriber.momoNetwork = data.momoNetwork ?? subscriber.momoNetwork;
      subscriber.momoNumber = data.momoNumber ?? subscriber.momoNumber;
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = '';
      subscriber.accountNumber = '';
      subscriber.bank = null;
    } else if (paymentMode === PAYMENTMODE.StandingOrder) {
      subscriber.momoNetwork = MOMONETWORK.None;
      subscriber.momoNumber = '';
      subscriber.CAGDStaffID = '';
      subscriber.chequeNumber = '';
      subscriber.accountNumber = data.accountNumber ?? subscriber.accountNumber;
      if (subscriber.bank && data.bank) {
        subscriber.bank.id = +data.bank ?? subscriber.bank.id;
      } else if (!subscriber.bank && data.bank) {
        const bank = new Bank();
        bank.id = +data.bank;
        subscriber.bank = bank;
      }
    }
  }

  private updateRelationships(
    subscriber: IndividualSubscriber,
    data: UpdateIndividualSubscriberDto,
  ): void {
    if (data.facility) {
      subscriber.facility.id = +data.facility;
    }
    if (data.package) {
      subscriber.package.id = +data.package;
    }

    if (subscriber.group && data.group) {
      subscriber.group.id = +data.group;
    } else if (!subscriber.group && data.group) {
      const group = new Group();
      group.id = +data.group;
      subscriber.group = group;
    }
  }

  private async saveSubscriber(
    subscriber: IndividualSubscriber,
  ): Promise<void> {
    await this.subscriberRepository.save(subscriber);
  }

  private async updateSubscriberPayment(
    subscriber: IndividualSubscriber,
    data: UpdateIndividualSubscriberDto,
    updatedBy: string,
  ): Promise<IndividualSubscriberPayment> {
    const payment = await this.subscriberPaymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.subscriber', 'subscriber')
      .where('subscriber.id = :subscriberId', {
        subscriberId: subscriber.id,
      })
      .orderBy('payment.id', 'DESC')
      .getOne();

    if (!payment) {
      throw new NotFoundException(
        `Payment not found for IndividualSubscriber with ID ${subscriber.id}.`,
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

    await this.subscriberPaymentRepository.save(payment);
    return payment;
  }
}
