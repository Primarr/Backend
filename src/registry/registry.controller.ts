import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { Service } from '../payment/payment.types';
import { RegistryService } from './registry.service';

@Controller('v1/registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('search')
  search(
    @Query('capability') capability?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('asset') asset?: string,
  ): Service[] {
    return this.registryService.search({
      capability,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      asset,
    });
  }

  @Get(':id')
  getService(@Param('id') id: string): Service {
    const service = this.registryService.getService(id);
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    return service;
  }

  @Post()
  publishService(
    @Body()
    data: {
      name: string;
      capability: string;
      payoutAddress: string;
      pricePerCall: number;
    },
  ): Service {
    if (!data.name || !data.capability || !data.payoutAddress) {
      throw new BadRequestException('Missing required fields');
    }
    return this.registryService.publishService({
      ...data,
      provider: 'unknown',
      rating: 5.0,
    });
  }

  @Put(':id')
  updateService(
    @Param('id') id: string,
    @Body() updates: Partial<Service>,
  ): Service {
    const updated = this.registryService.updateService(id, updates);
    if (!updated) {
      throw new BadRequestException('Service not found');
    }
    return updated;
  }

  @Delete(':id')
  deleteService(@Param('id') id: string): { message: string } {
    const service = this.registryService.getService(id);
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    return { message: 'Service deleted' };
  }
}
