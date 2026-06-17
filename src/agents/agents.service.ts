import { Injectable } from '@nestjs/common';
import { Budget } from '../payment/payment.types';

export interface Agent {
  id: string;
  name: string;
  address: string;
  environment: 'prod' | 'staging' | 'dev';
  lastActive: Date;
  spent: number;
  calls: number;
  budget?: Budget;
}

@Injectable()
export class AgentsService {
  private agents: Map<string, Agent> = new Map();
  private budgets: Map<string, Budget> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    const mockAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'research-bot',
        address: 'GAVXXX...XXXX',
        environment: 'prod',
        lastActive: new Date(Date.now() - 2 * 60000),
        spent: 1234.56,
        calls: 450,
      },
      {
        id: 'agent-2',
        name: 'analysis-agent',
        address: 'GBYXXX...XXXX',
        environment: 'staging',
        lastActive: new Date(Date.now() - 10 * 60000),
        spent: 567.89,
        calls: 120,
      },
      {
        id: 'agent-3',
        name: 'code-review',
        address: 'GCZXXX...XXXX',
        environment: 'dev',
        lastActive: new Date(Date.now() - 60 * 60000),
        spent: 89.01,
        calls: 45,
      },
    ];

    mockAgents.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  createAgent(data: {
    name: string;
    address: string;
    environment: 'prod' | 'staging' | 'dev';
  }): Agent {
    const id = 'agent_' + Math.random().toString(36).substring(2, 9);
    const agent: Agent = {
      id,
      ...data,
      lastActive: new Date(),
      spent: 0,
      calls: 0,
    };
    this.agents.set(id, agent);
    return agent;
  }

  configureBudget(agentId: string, budget: Budget): Budget {
    this.budgets.set(agentId, budget);
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.budget = budget;
    }
    return budget;
  }

  getBudget(agentId: string): Budget | undefined {
    return this.budgets.get(agentId);
  }
}
