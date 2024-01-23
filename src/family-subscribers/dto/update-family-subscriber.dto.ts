import { PartialType } from '@nestjs/swagger';
import { CreateFamilySubscriberDto } from './create-family-subscriber.dto';

export class UpdateFamilySubscriberDto extends PartialType(CreateFamilySubscriberDto) {}
