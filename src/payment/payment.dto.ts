import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class PaymentDto {
  @IsString()
  to: string;

  @IsNumber()
  @Min(0.000001)
  amount: number;

  @IsString()
  asset: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;
}

export class BudgetDto {
  @IsNumber()
  @Min(0)
  sessionCap: number;

  @IsNumber()
  @Min(0)
  taskCap: number;

  @IsNumber()
  @Min(0)
  requireApprovalAbove: number;

  @IsOptional()
  @IsNumber()
  rateLimit?: number;
}
