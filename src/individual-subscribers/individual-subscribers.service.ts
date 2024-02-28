import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
import { CreateIndividualSubscriberDto } from './dto/create-individual-subscriber.dto';
import { UpdateIndividualSubscriberDto } from './dto/update-individual-subscriber.dto';
import { IndividualSubscriber } from './entities/individual-subscriber.entity';
import { IndividualSubscriberPayment } from './entities/individual-subscriber-payment.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Package } from 'src/packages/entities/package.entity';
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
  createMandate,
  delay,
} from 'src/lib';
import { Bank } from 'src/bank/entities/bank.entity';
import { PackagesService } from 'src/packages/packages.service';
import { PaymentsService } from 'src/payments/payments.service';
import { v4 as uuidv4 } from 'uuid';

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
export class IndividualSubscribersService {
  constructor(
    @InjectRepository(IndividualSubscriber)
    private readonly subscriberRepository: Repository<IndividualSubscriber>,
    @InjectRepository(IndividualSubscriberPayment)
    private readonly subscriberPaymentRepository: Repository<IndividualSubscriberPayment>,
    private readonly paginationService: PaginationService,
    private readonly packageService: PackagesService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
  ) {}

  async create(
    data: CreateIndividualSubscriberDto,
    passportPicture: string | undefined,
    createdBy: string,
    agent: number,
  ) {
    try {
      const staffPromise = this.findOrCreateStaff(agent);
      const facilityPromise = this.findOrCreateFacility(+data.facility);
      const groupPromise = this.findOrCreateGroup(+data.group);
      const packagePromise = this.findOrCreatePackage(+data.package);
      const membershipIDPromise = this.generateStaffCode();

      const [staff, facility, group, newPackage, membershipID] =
        await Promise.all([
          staffPromise,
          facilityPromise,
          groupPromise,
          packagePromise,
          membershipIDPromise,
        ]);

      const { subscriber, payment } = await this.createSubscriberAndPayment(
        data,
        staff,
        createdBy,
        facility,
        group,
        newPackage,
        passportPicture,
        membershipID,
      );

      if (data.paymentMode === PAYMENTMODE.MOMO) {
        await this.createMandateIfNeeded(data, subscriber.paymentReferenceCode);
      }

      await this.saveSubscriberAndPayment(subscriber, payment, true, agent);

      return {
        message: 'Subscriber has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
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

  async findAllWithoutPagination() {
    const alias = 'item';
    const properties = this.subscriberRepository.metadata.columns.map(
      (column) => `${alias}.${column.propertyName}`,
    );

    // Filter out 'passportPicture' property
    const selectedProperties = properties.filter(
      (property) => property !== `${alias}.passportPicture`,
    );
    return this.subscriberRepository
      .createQueryBuilder(alias)
      .select(selectedProperties)
      .leftJoinAndSelect(`${alias}.agent`, 'agent')
      .leftJoinAndSelect(`${alias}.facility`, 'facility')
      .leftJoinAndSelect(`${alias}.package`, 'package')
      .leftJoinAndSelect(`${alias}.group`, 'group')
      .leftJoinAndSelect(`${alias}.bank`, 'bank')
      .leftJoinAndSelect(`${alias}.payments`, 'payments');
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
        .leftJoinAndSelect(`${alias}.bank`, 'bank')
        .leftJoinAndSelect(`${alias}.payments`, 'payments'),
    });

    return x;
  }

  async findOneById(id: number) {
    const subscriber = await this.subscriberRepository.findOne({
      where: { id },
      relations: ['bank', 'group', 'facility', 'package', 'agent'],
    });
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }
    return subscriber;
  }

  // async findSubscriberWithReferenceCode(code: string) {
  //   return this.subscriberRepository.findOneBy({ paymentReferenceCode: code });
  // }

  async update(
    id: number,
    data: UpdateIndividualSubscriberDto,
    passportPicture: string | undefined,
    updatedBy: string,
  ): Promise<{ message: string; status: number; success: boolean }> {
    try {
      const subscriber = await this.findOneById(id);
      this.updateSubscriberFields(subscriber, data, passportPicture, updatedBy);
      const newSubscriber = await this.saveSubscriber(subscriber);
      const newPayment = await this.updateSubscriberPayment(
        subscriber,
        data,
        updatedBy,
      );

      const subscriberData: ISubscriberDto = {
        name: `${newSubscriber.firstName} ${newSubscriber.otherNames ?? ''} ${
          newSubscriber.lastName
        }`,
        subscriberId: newSubscriber.id,
        bank: newSubscriber?.bank ?? null,
        subscriberType: SUBSCRIBERTYPE.Individual,
        membershipID: newSubscriber.membershipID,
        individualPaymentId: newPayment.id,
        discount: newSubscriber.discount,
        paymentMode: newSubscriber.paymentMode,
        amountToDebit: newPayment.amountToDebit,
        originalAmount: newPayment.originalAmount,
        frequency: newSubscriber.frequency,
        momoNetwork: newSubscriber.momoNetwork,
        momoNumber: newSubscriber.momoNumber,
        accountNumber: newSubscriber.accountNumber,
        chequeNumber: newSubscriber.chequeNumber,
        CAGDStaffID: newSubscriber.CAGDStaffID,
        paymentReferenceCode: newSubscriber.paymentReferenceCode,
        status: SUBSCRIBER_STATUS.Active,
      };
      await this.paymentService.updateSubscriber(
        subscriberData.paymentReferenceCode,
        subscriberData,
      );
      return {
        message: 'Subscriber has been successfully updated.',
        status: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      throw error;
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

  private async createMandateIfNeeded(
    data: CreateIndividualSubscriberDto,
    membershipID: string,
  ): Promise<void> {
    const x = {
      amountToDebit: `${calculateDiscount(
        (await this.packageService.findOne(+data.package)).amount,
        +data.discount,
      )}`,
      momoNumber: data.momoNumber,
      momoNetWork: data.momoNetwork,
      membershipId: membershipID,
      frequency: data.frequency,
    };
    const res = await createMandate(x);
    if (res.responseCode !== '03') {
      throw new BadRequestException(res.responseMessage);
      // return true
    }
  }

  private async createSubscriberAndPayment(
    data: CreateIndividualSubscriberDto,
    staff: Staff,
    createdBy: string,
    facility: Facility,
    group: Group,
    newPackage: Package,
    passportPicture: string | undefined,
    membershipID: string,
  ) {
    const subscriber = new IndividualSubscriber();
    const payment = new IndividualSubscriberPayment();
    const reference = `${SUBSCRIBER_CODES.Individual}-${Date.now().toString(
      36,
    )}-${uuidv4()}`;

    // Populate subscriber fields
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
    subscriber.paymentReferenceCode = reference;

    // Populate payment fields
    // payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO;
    // payment.confirmedBy =
    //   data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
    const packageData = await this.packageService.findOne(newPackage.id);
    payment.createdBy = createdBy;
    payment.paymentStatus = PAYMENTSTATUS.Unpaid;
    payment.referenceCode = subscriber.paymentReferenceCode;
    payment.amountToDebit = calculateDiscount(
      packageData.amount,
      +data.discount,
    );
    payment.originalAmount = packageData.amount;
    payment.subscriber = subscriber;
    payment.mandateStatus =
      data.paymentMode === PAYMENTMODE.MOMO
        ? MANDATESTATUS.Pending
        : MANDATESTATUS.None;

    return { subscriber, payment };
  }

  private async saveSubscriberAndPayment(
    subscriber: IndividualSubscriber,
    payment: IndividualSubscriberPayment,
    addPayment: boolean = true,
    agent: number,
  ) {
    const subscriberDb = await this.subscriberRepository.save(subscriber);
    const paymentDb = await this.subscriberPaymentRepository.save(payment);

    if (addPayment && subscriber.paymentMode !== PAYMENTMODE.MOMO) {
      const x: IPayment = {
        agentId: agent,
        dateOfPayment: new Date(),
        confirmed: false,
        confirmedBy: '',
        confirmedDate: null,
        paymentStatus: PAYMENTSTATUS.Unpaid,
        paymentMode: subscriber.paymentMode,
        amountWithOutDiscount: paymentDb.originalAmount,
        amount: paymentDb.amountToDebit,
        subscriberType: SUBSCRIBERTYPE.Individual,
        subscriberDbId: subscriberDb.id,
        subscriberPaymentDbId: paymentDb.id,
        paymentReferenceCode: subscriberDb.paymentReferenceCode,
        subscriberName: `${subscriberDb.firstName} ${
          subscriberDb.otherNames ?? ''
        } ${subscriberDb.lastName}`,
        momTransactionId: null,
        debitOrderTransactionId: null,
        mandateId: null,
        phoneNumber: subscriberDb.momoNumber ?? null,
      };
      await this.paymentService.makePayment(x);
    }

    const data: ISubscriberDto = {
      name: `${subscriberDb.firstName} ${subscriberDb.otherNames ?? ''} ${
        subscriberDb.lastName
      }`,
      subscriberId: subscriberDb.id,
      subscriberType: SUBSCRIBERTYPE.Individual,
      membershipID: subscriber.membershipID,
      individualPaymentId: paymentDb.id,
      bank: subscriberDb?.bank ?? null,
      discount: subscriberDb.discount,

      paymentMode: subscriberDb.paymentMode,

      amountToDebit: paymentDb.amountToDebit,

      originalAmount: paymentDb.originalAmount,

      frequency: subscriberDb.frequency,

      momoNetwork: subscriberDb.momoNetwork,

      momoNumber: subscriberDb.momoNumber,

      accountNumber: subscriberDb.accountNumber,

      chequeNumber: subscriberDb.chequeNumber,

      CAGDStaffID: subscriberDb.CAGDStaffID,

      paymentReferenceCode: subscriberDb.paymentReferenceCode,
      status: SUBSCRIBER_STATUS.Active,
    };

    await this.paymentService.addToAllSubscribers(data);
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
      } else if (subscriber.bank && !data.bank) {
        subscriber.bank = null;
      } else {
        subscriber.bank = null;
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
      } else if (subscriber.bank && !data.bank) {
        subscriber.bank = null;
      } else {
        subscriber.bank = null;
      }
    }
  }

  private updateRelationships(
    subscriber: IndividualSubscriber,
    data: UpdateIndividualSubscriberDto,
  ): void {
    // console.log(subscriber);
    // console.log(data);
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
    } else if (subscriber.group && !data.group) {
      subscriber.group = null;
    } else {
      subscriber.group = null;
    }
  }

  private async saveSubscriber(subscriber: IndividualSubscriber) {
    return await this.subscriberRepository.save(subscriber);
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

  // async updateMandateStatus(data: {
  //   momoNumber: string;
  //   referenceCode: string;
  //   mandateID: string;
  //   mandateStatus: MANDATESTATUS;
  //   success: boolean;
  // }) {
  //   try {
  //     const subscriber = await this.subscriberRepository.findOneBy({
  //       paymentReferenceCode: data.referenceCode,
  //     });
  //     console.log(subscriber);

  //     if (!subscriber) {
  //       return null;
  //     }
  //     const payments = subscriber.payments.filter(
  //       (payment) => payment.subscriber.momoNumber === data.momoNumber,
  //     );
  //     console.log(payments);

  //     if (payments.length === 0) {
  //       await delay(120000); // 120000 milliseconds = 2 minutes
  //       return this.updateMandateStatus(data);

  //       // return null;
  //     }
  //     const paymentToUpdate = payments[0];
  //     paymentToUpdate.confirmed = data.success ? true : false;
  //     paymentToUpdate.confirmedBy = data.success ? 'Payment gateway' : '';
  //     paymentToUpdate.confirmedDate = data.success && new Date();
  //     paymentToUpdate.mandateID = data.mandateID;
  //     paymentToUpdate.mandateStatus = data.mandateStatus;

  //     console.log(paymentToUpdate);

  //     await this.subscriberPaymentRepository.save(paymentToUpdate);

  //     return HttpStatus.OK;
  //   } catch (e) {
  //     return e;
  //   }
  // }

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
      const subscriber =
        await this.findIndividualWithoutPassportByReferenceCode(
          data.referenceCode,
        );

      console.log(subscriber);
      if (!subscriber) {
        return null;
      }
      const payment = await this.subscriberPaymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.subscriber', 'subscriber')
        // .select(['id', 'payments'])
        .where('subscriber.id = :subscriberId', {
          subscriberId: subscriber.id,
        })
        .orderBy('payment.id', 'DESC')
        .select(['payment', 'subscriber.id'])
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

      await this.subscriberPaymentRepository.save(paymentToUpdate);

      // console.log('res', res);
    } catch (e) {
      console.log(e); // Re-throwing the error to handle it outside
      return null;
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

  async findIndividualWithoutPassportByReferenceCode(referenceCode: string) {
    const alias = 'item';
    const properties = this.subscriberRepository.metadata.columns.map(
      (column) => `${alias}.${column.propertyName}`,
    );

    const selectedProperties = properties.filter(
      (property) => property !== `${alias}.passportPicture`,
    );

    return (
      this.subscriberRepository
        .createQueryBuilder(alias)
        .select(selectedProperties)
        .leftJoinAndSelect(`${alias}.agent`, 'agent')
        .leftJoinAndSelect(`${alias}.facility`, 'facility')
        .leftJoinAndSelect(`${alias}.package`, 'package')
        .leftJoinAndSelect(`${alias}.group`, 'group')
        .leftJoinAndSelect(`${alias}.bank`, 'bank')
        // .leftJoinAndSelect(`${alias}.payments`, 'payments')
        .where(`${alias}.paymentReferenceCode = :referenceCode`, {
          referenceCode,
        })
        .getOne()
    );
  }
}
