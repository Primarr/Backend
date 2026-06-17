import { Injectable } from '@nestjs/common';
import { Service } from '../payment/payment.types';

@Injectable()
export class RegistryService {
  private services: Map<string, Service> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    const mockServices: Service[] = [
      {
        id: 'search-1',
        name: 'Web Search',
        capability: 'web-search',
        provider: 'search-agent',
        payoutAddress: 'GBSEARCH123456789',
        pricePerCall: 0.002,
        calls: 1250,
        rating: 4.8,
      },
      {
        id: 'model-1',
        name: 'GPT-4 Inference',
        capability: 'model-inference',
        provider: 'inference-agent',
        payoutAddress: 'GBINFERENCE123456',
        pricePerCall: 0.015,
        calls: 450,
        rating: 4.9,
      },
      {
        id: 'analysis-1',
        name: 'Data Analysis',
        capability: 'data-analysis',
        provider: 'analytics-agent',
        payoutAddress: 'GBANALYTICS123456',
        pricePerCall: 0.005,
        calls: 320,
        rating: 4.7,
      },
      {
        id: 'code-1',
        name: 'Code Review',
        capability: 'code-review',
        provider: 'review-agent',
        payoutAddress: 'GBCODEREVIEW12345',
        pricePerCall: 0.01,
        calls: 180,
        rating: 4.6,
      },
    ];

    mockServices.forEach((service) => {
      this.services.set(service.id, service);
    });
  }

  search(params: {
    capability?: string;
    maxPrice?: number;
    asset?: string;
  }): Service[] {
    let results = Array.from(this.services.values());

    if (params.capability) {
      const capability = params.capability;
      results = results.filter((s) =>
        s.capability.toLowerCase().includes(capability.toLowerCase()),
      );
    }

    if (params.maxPrice !== undefined) {
      const maxPrice = params.maxPrice;
      results = results.filter((s) => s.pricePerCall <= maxPrice);
    }

    return results.sort((a, b) => b.rating - a.rating);
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  publishService(service: Omit<Service, 'id' | 'calls'>): Service {
    const id = 'svc_' + Math.random().toString(36).substring(2, 9);
    const newService: Service = {
      ...service,
      id,
      calls: 0,
    };
    this.services.set(id, newService);
    return newService;
  }

  updateService(id: string, updates: Partial<Service>): Service | undefined {
    const existing = this.services.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.services.set(id, updated);
    return updated;
  }
}
