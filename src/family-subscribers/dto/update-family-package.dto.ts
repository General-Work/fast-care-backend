import { PartialType } from '@nestjs/swagger';
import { CreateFamilyPackageDto } from './create-family-package.dto';

export class UpdateFamilyPackageDto extends PartialType(
  CreateFamilyPackageDto,
) {}
