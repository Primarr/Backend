# Primer — Backend & SDK

> **The developer-facing payment layer for AI agents on Stellar.**  
> Embed `primer.pay()` in any agent runtime. Discover services, settle in USDC, enforce budgets — no invoices, no net-30.

[![Stellar](https://img.shields.io/badge/Stellar-integrated-7D00FF)](https://stellar.org)
[![Node](https://img.shields.io/badge/node-%3E%3D20-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

**Primer** (formerly conceptualised as ChainBrain) is a B2B SDK that lets AI agents autonomously pay each other for services — data, compute, API calls, model inference — with settlement on Stellar in seconds. **This repository** is the core product: the **Node.js SDK**, REST API, webhook system, and Stellar transaction orchestration that agent frameworks integrate in a single import.

---

## The problem

Companies deploy fleets of agents: one searches, one analyses, one calls a specialised model, one writes code. When **Agent A** needs output from **Agent B** (another vendor), today's options are broken for autonomy:

- Monthly API invoices and static API keys
- Human approval for every payment decision
- Payment rails too slow and expensive for $0.001–$0.01 micro-transactions

Primer fixes this with **machine-speed, pay-per-call settlement on Stellar** — and this repo is how developers actually ship it.

---

## What you get

### 1. Pay for services atomically

```typescript
import { Primer } from '@primarr/sdk';

const primer = new Primer({
  secretKey: process.env.PRIMER_AGENT_SECRET, // Stellar keypair
  network: 'testnet',
});

// Pay before the upstream service responds (x402-aligned flow)
const receipt = await primer.pay({
  to: 'G...SERVICE_ADDRESS',
  amount: 0.002,
  asset: 'USDC',
  memo: 'inference:run:xyz',
  serviceId: 'inference:gpt-wrapper:v1', // optional registry lookup
});

// receipt.txHash, receipt.ledger, receipt.settledAt
const result = await callExternalService(receipt);
```

Payment settles on Stellar in **under 5 seconds**. No invoice. No API key rotation. Money moves with the request.

### 2. Discover services from the on-chain registry

```typescript
const services = await primer.registry.search({
  capability: 'web-search',
  maxPrice: 0.01,
  asset: 'USDC',
});

const cheapest = services[0];
await primer.pay({ to: cheapest.payoutAddress, amount: cheapest.pricePerCall, ... });
```

Registry data is sourced from [Primer Soroban contracts](https://github.com/Primarr/Contract) — a two-sided network where agents publish priced capabilities and buyers discover them programmatically.

### 3. Budget guardrails (enterprise-ready)

```typescript
await primer.budget.configure({
  sessionCap: 5.0,      // USDC
  taskCap: 0.5,
  requireApprovalAbove: 1.0, // webhook if exceeded
});

try {
  await primer.pay({ amount: 2.0, ... });
} catch (e) {
  if (e.code === 'BUDGET_EXCEEDED') {
    // Human approval flow via webhook
  }
}
```

Policies are enforced against [Soroban budget contracts](https://github.com/Primarr/Contract) so spending limits are not merely honour-system checks in your app server.

---

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Your AI Agent   │     │  Partner Agent   │     │  Service Provider │
│  (LangChain etc) │     │  (other company) │     │  HTTP / gRPC API  │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │    @primarr/sdk        │                        │
         ▼                        ▼                        ▼
┌────────────────────────────────────────────────────────────────────┐
│                     PRIMER BACKEND (this repo)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  SDK Core   │  │  REST API    │  │  Webhooks  │  │  Indexer    │  │
│  │ primer.pay  │  │  /v1/pay     │  │  approval  │  │  tx history │  │
│  └──────┬──────┘  └──────────────┘  └────────────┘  └─────────────┘  │
│         │                                                             │
│  ┌──────▼──────────────────────────────────────────────────────────┐ │
│  │           Stellar Adapter (Horizon + Soroban RPC)               │ │
│  └──────┬──────────────────────────────────────────────────────────┘ │
└─────────┼──────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Soroban Contracts (Primarr/Contract)                    │
│         Registry · Budget Vault · Settlement Router                │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
              Stellar Network (USDC)
```

---

## Tech stack

| Component | Technology |
|-----------|------------|
| SDK | TypeScript, published as `@primarr/sdk` |
| API server | Node.js 20+, Fastify (planned) |
| Stellar | `@stellar/stellar-sdk`, Soroban RPC |
| Database | PostgreSQL — agents, sessions, audit logs |
| Queue | Redis — webhook delivery, retry |
| Auth | API keys + Stellar account linking |
| Python client | `primarr` on PyPI (Phase 2) |

---

## API overview (planned)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/pay` | POST | Submit payment, return settlement receipt |
| `/v1/registry/search` | GET | Query on-chain registry (cached) |
| `/v1/budget` | PUT | Configure spending policy for agent key |
| `/v1/transactions` | GET | Paginated payment history |
| `/v1/webhooks` | POST | Register approval / settlement callbacks |

OpenAPI spec will ship with beta.

---

## Repository layout (planned)

```
packages/
├── sdk/                 # @primarr/sdk — primary integration surface
└── types/               # Shared TypeScript types

src/
├── api/                 # REST server
├── stellar/             # Horizon + Soroban client
├── registry/            # Registry read/write helpers
├── budget/              # Policy enforcement client
└── webhooks/            # HMAC-signed event delivery

examples/
├── langchain-agent/     # Pay before tool call
├── crewai-fleet/        # Multi-agent budget sharing
└── x402-middleware/     # HTTP 402 payment gate
```

---

## Getting started

### Prerequisites

- Node.js 20+
- Stellar testnet account ([Laboratory](https://laboratory.stellar.org))
- USDC on testnet (or configured test asset)
- Deployed Primer contracts on testnet (see [Contract repo](https://github.com/Primarr/Contract))

### Install (once published)

```bash
npm install @primarr/sdk
```

### Local development

```bash
git clone https://github.com/Primarr/Backend.git
cd Backend
cp .env.example .env   # PRIMER_NETWORK, HORIZON_URL, SOROBAN_RPC_URL, DATABASE_URL
npm install
npm run dev
```

### Minimal integration

```typescript
import { Primer } from '@primarr/sdk';

const primer = new Primer({ secretKey: process.env.AGENT_SECRET! });

// Agent loop: discover → pay → consume
const service = await primer.registry.get('summarisation:v1');
const receipt = await primer.pay({
  to: service.payoutAddress,
  amount: service.pricePerCall,
  asset: 'USDC',
  memo: `task:${taskId}`,
});

console.log(`Settled: https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`);
```

---

## x402 & agentic payments

Primer is designed alongside Stellar's **x402 / agentic payments** direction:

- HTTP middleware returns `402 Payment Required` with Stellar payment instructions
- Client SDK (`primer.pay`) satisfies the payment header before retrying the request
- Settlement proof attached to subsequent requests (tx hash + ledger)

We are building the **reference implementation** teams can drop into agent frameworks without implementing Stellar primitives themselves.

---

## Business model (B2B)

Primer monetises as infrastructure, not as an agent product:

| Stream | Description |
|--------|-------------|
| Protocol fee | ~0.2% on agent-to-agent txs via Settlement Router |
| Developer plan | $199/mo — analytics, budget UI, higher rate limits |
| Enterprise | Custom policies, audit exports, SLA, dedicated support |

**Distribution:** LangChain-style platforms, enterprise automation vendors, and OpenAI-wrapper shops integrate the SDK — every integration brings their agent fleet onto Stellar without end-user wallet decisions.

---

## Why Stellar

| Requirement | Stellar fit |
|-------------|-------------|
| Sub-cent micro-payments | Low, predictable fees |
| Fast finality | ~5s — matches agent tool-call latency |
| USDC native | Standard unit for API pricing |
| Soroban | On-chain registry + spending policies |
| SDF alignment | Agentic payments / x402 priority for 2026 |

---

## Roadmap

| Milestone | Deliverable |
|-----------|-------------|
| **M1 — Alpha** | `primer.pay`, testnet, manual registry seed |
| **M2 — Beta** | Registry search, budget vault integration, webhooks |
| **M3 — Launch** | Mainnet, npm publish, Python client |
| **M4 — Scale** | Enterprise audit API, x402 middleware package |

---

## Related repositories

| Repo | Description |
|------|-------------|
| [Contract](https://github.com/Primarr/Contract) | Soroban registry, budget vault, settlement |
| [Frontend](https://github.com/Primarr/Frontend) | Dashboard for registry, analytics, fleet management |

---

## Contributing

Issues and PRs welcome. For Soroban or payment-protocol changes, coordinate with the Contract repo. See `CONTRIBUTING.md` (coming soon).

---

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

## Contact

**Organisation:** [Primarr](https://github.com/Primarr)  
**Programme:** Stellar Community Fund application  
**Support:** GitHub Issues on this repository

*Primer — payment rails for the agent economy.*
