import { PartialType } from '@nestjs/swagger';
import { CreateCorporatePackageDto } from './create-corporate-package.dto';

export class UpdateCorporatePackageDto extends PartialType(
  CreateCorporatePackageDto,
) {}
