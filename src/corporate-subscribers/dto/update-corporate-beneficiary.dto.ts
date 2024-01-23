import { PartialType } from '@nestjs/swagger';
import { CreateCorporateBeneficiaryDto } from './create-corporate-beneficiaries.dto';

export class UpdateCorporateBeneficiaryDto extends PartialType(
  CreateCorporateBeneficiaryDto,
) {}
