import { PartialType } from '@nestjs/swagger';
import { CreateCorporateSubscriberDto } from './create-corporate-subscriber.dto';

export class UpdateCorporateSubscriberDto extends PartialType(CreateCorporateSubscriberDto) {}
