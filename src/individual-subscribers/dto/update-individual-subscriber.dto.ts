import { PartialType } from '@nestjs/swagger';
import { CreateIndividualSubscriberDto } from './create-individual-subscriber.dto';

export class UpdateIndividualSubscriberDto extends PartialType(CreateIndividualSubscriberDto) {}
