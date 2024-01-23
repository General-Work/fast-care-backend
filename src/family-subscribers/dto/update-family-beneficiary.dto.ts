import { PartialType } from '@nestjs/swagger';
import { CreateFamilyBeneficiaryDto } from './create-family-beneficiary.dto';

export class UpdateFamilyBeneficiaryDto extends PartialType(
  CreateFamilyBeneficiaryDto,
) {}
