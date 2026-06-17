import { Injectable } from '@nestjs/common';
import { Webhook } from '../payment/payment.types';

@Injectable()
export class WebhooksService {
  private webhooks: Map<string, Webhook> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    const mockWebhooks: Webhook[] = [
      {
        id: 'wh-1',
        url: 'https://myapp.com/primer/webhooks',
        events: ['payment.settled', 'budget.exceeded'],
        lastDelivery: new Date(Date.now() - 2 * 60000),
        status: 'healthy',
      },
      {
        id: 'wh-2',
        url: 'https://slack.com/services/...',
        events: ['budget.exceeded'],
        lastDelivery: new Date(Date.now() - 60 * 60000),
        status: 'healthy',
      },
    ];

    mockWebhooks.forEach((webhook) => {
      this.webhooks.set(webhook.id, webhook);
    });
  }

  getWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  createWebhook(data: { url: string; events: string[] }): Webhook {
    const id = 'wh_' + Math.random().toString(36).substring(2, 9);
    const webhook: Webhook = {
      id,
      ...data,
      status: 'healthy',
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  deleteWebhook(id: string): boolean {
    return this.webhooks.delete(id);
  }

  testPayload(id: string): { success: boolean; message: string } {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    // Mock webhook delivery
    try {
      webhook.lastDelivery = new Date();
      return { success: true, message: 'Test payload delivered' };
    } catch {
      webhook.status = 'failing';
      return { success: false, message: 'Failed to deliver payload' };
    }
  }

  triggerWebhook(event: string): void {
    const targetWebhooks = Array.from(this.webhooks.values()).filter((wh) =>
      wh.events.includes(event),
    );

    for (const webhook of targetWebhooks) {
      // Mock webhook delivery
      try {
        webhook.lastDelivery = new Date();
        webhook.status = 'healthy';
      } catch {
        webhook.status = 'failing';
      }
    }
  }
}
