import { CreateChargeDto } from '@app/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateChargeDto)
  charge: CreateChargeDto;
}
