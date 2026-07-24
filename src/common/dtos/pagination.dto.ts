import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
