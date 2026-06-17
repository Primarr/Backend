import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import type { Agent } from './agents.service';
import { AgentsService } from './agents.service';
import { BudgetDto } from '../payment/payment.dto';

@Controller('v1')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('agents')
  getAgents(): Agent[] {
    return this.agentsService.getAgents();
  }

  @Get('agents/:id')
  getAgent(@Param('id') id: string): Agent {
    const agent = this.agentsService.getAgent(id);
    if (!agent) {
      throw new BadRequestException('Agent not found');
    }
    return agent;
  }

  @Post('agents')
  createAgent(
    @Body()
    data: {
      name: string;
      address: string;
      environment: 'prod' | 'staging' | 'dev';
    },
  ): Agent {
    return this.agentsService.createAgent(data);
  }

  @Get('budget/:agentId')
  getBudget(@Param('agentId') agentId: string) {
    const budget = this.agentsService.getBudget(agentId);
    if (!budget) {
      return { message: 'No budget configured' };
    }
    return budget;
  }

  @Put('budget/:agentId')
  configureBudget(
    @Param('agentId') agentId: string,
    @Body() budgetDto: BudgetDto,
  ) {
    const agent = this.agentsService.getAgent(agentId);
    if (!agent) {
      throw new BadRequestException('Agent not found');
    }
    return this.agentsService.configureBudget(agentId, budgetDto);
  }
}
