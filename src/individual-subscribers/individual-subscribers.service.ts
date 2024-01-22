import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIndividualSubscriberDto } from './dto/create-individual-subscriber.dto';
import { UpdateIndividualSubscriberDto } from './dto/update-individual-subscriber.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationService } from 'src/pagination/pagination.service';
import { IndividualSubscriber } from './entities/individual-subscriber.entity';
import { IndividualSubscriberPayment } from './entities/individual-subscriber-payment.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Package } from 'src/packages/entities/package.entity';
import { PAYMENTMODE, PAYMENTSTATUS } from 'src/lib';

@Injectable()
export class IndividualSubscribersService {
  constructor(
    @InjectRepository(IndividualSubscriber)
    private readonly subscriberRepository: Repository<IndividualSubscriber>,
    @InjectRepository(IndividualSubscriberPayment)
    private readonly subscriberPaymentRepository: Repository<IndividualSubscriberPayment>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(
    data: CreateIndividualSubscriberDto,
    passportPicture: string | undefined,
    createdBy: string,
    agent: number,
  ) {
    // const staff = await this.staffRepository.findByID(agent);
    // console.log(staff);

    const staff = new Staff();
    staff.id = agent;

    const facility = new Facility();
    facility.id = +data.facility;

    const group = new Group();
    group.id = +data.group;

    const newPackage = new Package();
    newPackage.id = +data.package;

    const payment = new IndividualSubscriberPayment();
    payment.confirmed = data.paymentMode === PAYMENTMODE.MOMO ? true : false;
    payment.confirmedBy =
      data.paymentMode === PAYMENTMODE.MOMO ? data.momoNetwork : '';
    payment.createdBy === createdBy;
    payment.paymentStatus = PAYMENTMODE.MOMO
      ? PAYMENTSTATUS.Paid
      : PAYMENTSTATUS.Unpaid;

    payment.createdBy = createdBy;

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
    subscriber.membershipID = await this.generateStaffCode();
    subscriber.momoNetwork = data.momoNetwork ?? null;
    subscriber.momoNumber = data.momoNumber ?? null;
    subscriber.occupation = data.occupation;
    subscriber.otherNames = data.otherNames ?? '';
    subscriber.package = newPackage;
    subscriber.passportPicture = passportPicture;
    subscriber.paymentMode = data.paymentMode;
    subscriber.phoneOne = data.phoneOne;
    subscriber.phoneTwo = data.phoneTwo ?? '';

    try {
      await this.subscriberRepository.save(subscriber);

      payment.subscriber = subscriber;

      await this.subscriberPaymentRepository.save(payment);

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
          'Subscriber with this name already exists.',
        );
      } else {
        throw error;
      }
    }
  }

  findAll() {
    return this.subscriberRepository.find();
  }

  findOneById(id: number) {
    return this.subscriberRepository.findOneBy({ id });
  }

  update(
    id: number,
    updateIndividualSubscriberDto: UpdateIndividualSubscriberDto,
  ) {
    return `This action updates a #${id} individualSubscriber`;
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
    return `INS${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }
}
