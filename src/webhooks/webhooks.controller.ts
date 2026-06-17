import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  getWebhooks() {
    return this.webhooksService.getWebhooks();
  }

  @Get(':id')
  getWebhook(@Param('id') id: string) {
    const webhook = this.webhooksService.getWebhook(id);
    if (!webhook) {
      throw new BadRequestException('Webhook not found');
    }
    return webhook;
  }

  @Post()
  createWebhook(@Body() data: { url: string; events: string[] }) {
    if (!data.url || !data.events || data.events.length === 0) {
      throw new BadRequestException('URL and events are required');
    }
    return this.webhooksService.createWebhook(data);
  }

  @Delete(':id')
  deleteWebhook(@Param('id') id: string) {
    const deleted = this.webhooksService.deleteWebhook(id);
    if (!deleted) {
      throw new BadRequestException('Webhook not found');
    }
    return { message: 'Webhook deleted' };
  }

  @Post(':id/test')
  testWebhook(@Param('id') id: string) {
    return this.webhooksService.testPayload(id);
  }
}
