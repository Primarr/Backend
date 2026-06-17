import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { PaymentReceipt, Transaction } from './payment.types';
import { PaymentService } from './payment.service';
import { PaymentDto, BudgetDto } from './payment.dto';

@Controller('v1')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  pay(@Body() paymentDto: PaymentDto): PaymentReceipt {
    if (!paymentDto.to || paymentDto.amount <= 0) {
      throw new BadRequestException('Invalid payment request');
    }
    const mockAgentAddress = 'GAVXXX...XXXX';
    return this.paymentService.pay(paymentDto, mockAgentAddress);
  }

  @Get('transactions')
  getTransactions(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Transaction[] {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.paymentService.getTransactions(limitNum, offsetNum);
  }

  @Get('transactions/:id')
  getTransaction(@Param('id') id: string): Transaction {
    const transaction = this.paymentService.getTransaction(id);
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }
    return transaction;
  }

  @Put('budget/:agentId')
  configureBudget(
    @Param('agentId') agentId: string,
    @Body() budgetDto: BudgetDto,
  ) {
    return {
      agentId,
      budget: budgetDto,
      message: 'Budget configured',
    };
  }
}
