import { Injectable } from '@nestjs/common';
import { PaymentRequest, PaymentReceipt, Transaction } from './payment.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  private transactions: Map<string, Transaction> = new Map();
  private receipts: Map<string, PaymentReceipt> = new Map();

  pay(request: PaymentRequest, agentAddress: string): PaymentReceipt {
    const txHash = this.generateMockTxHash();
    const ledger = Math.floor(Math.random() * 1000000) + 1000000;

    const receipt: PaymentReceipt = {
      txHash,
      ledger,
      settledAt: new Date(),
      from: agentAddress,
      to: request.to,
      amount: request.amount,
      asset: request.asset,
    };

    this.receipts.set(txHash, receipt);

    const transaction: Transaction = {
      id: uuidv4(),
      from: agentAddress,
      to: request.to,
      service: request.serviceId || 'unknown',
      amount: request.amount,
      status: 'settled',
      timestamp: new Date(),
      txHash,
    };

    this.transactions.set(transaction.id, transaction);

    return receipt;
  }

  getTransactions(limit: number = 10, offset: number = 0): Transaction[] {
    const txArray = Array.from(this.transactions.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
    return txArray.slice(offset, offset + limit);
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getReceipt(txHash: string): PaymentReceipt | undefined {
    return this.receipts.get(txHash);
  }

  private generateMockTxHash(): string {
    return 'tx_' + Math.random().toString(36).substring(2, 15);
  }
}
