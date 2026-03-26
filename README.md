# TrustLayer (Project Guardian)

**Core Principle**: No fund custody. Only verification + automated execution.

## 1. High-Level Components

### Frontend
- Freelancer Dashboard (React)
- Client Dashboard (React)
- **Displays**: Project status, Verified balance, Milestones, Alerts

### Backend API Layer
- Node.js / Python (FastAPI)
- **Handles**: Auth (OAuth 2.0), Project logic, Webhooks (GitHub, Figma), Bank API communication

### Banking Integration Layer
- Plaid / TrueLayer APIs
- **Functions**: Account linking, Balance fetch, Payment initiation (where supported)

### Monitoring Engine (Core Logic)
- Runs continuously (cron + event-driven)
- **Checks**: Account balance ≥ project budget, Milestone triggers
- **Sends**: Stop-work alerts, Payment execution calls

### Database
- PostgreSQL
- **Stores**: Users, Projects, Milestones, Bank tokens (encrypted), Event logs

### Event System
- Webhooks + Queue (Kafka / RabbitMQ)
- **Sources**: GitHub (PR merged), Figma (file update)
- Drives milestone completion

### Notification Service
- Email + SMS + in-app
- **Critical for**: Low balance alerts, Payment confirmations, Stop-work signals

## 2. Data Flow (Step-by-Step)
- **Step 1: Client Onboarding**
  - Client signs up
  - Connects bank via Plaid/TrueLayer
  - OAuth token stored (encrypted AES-256)
- **Step 2: Project Creation**
  - Client defines: Budget, Milestones
  - Freelancer accepts
- **Step 3: Fund Verification**
  - System checks bank balance via API
  - If balance ≥ budget → project activated
  - Else → blocked
- **Step 4: Continuous Monitoring**
  - Background job runs: Every few minutes or via webhook
  - If balance drops: → Trigger Stop Work Alert
- **Step 5: Milestone Trigger**
  - Example: GitHub PR merged, Figma file updated
  - Webhook → Backend → Verify condition
- **Step 6: Payment Execution**
  - If milestone valid: Trigger payment API, Direct bank → freelancer transfer
- **Step 7: Logging + Audit**
  - Every action stored: Balance checks, Alerts, Payments

## 3. Core APIs

### Bank API
- `/link_account`
- `/get_balance`
- `/initiate_payment`

### Internal API
- `/create_project`
- `/verify_funds`
- `/trigger_milestone`
- `/send_alert`

### Webhook Endpoints
- `/webhook/github`
- `/webhook/figma`

## 4. Security Layer
- AES-256 encryption (tokens, sensitive data)
- OAuth 2.0 for bank access
- Zero storage of raw bank credentials
- Role-based access (client vs freelancer)
- Audit logs immutable

## 5. Failure Handling
- Bank API down → retry queue
- Payment failure → rollback + alert
- False milestone → manual override option
- Balance fluctuation → threshold buffer (e.g., 10%)

## 6. Minimal MVP Stack
- **Frontend**: React + Tailwind
- **Backend**: Node.js (Express)
- **DB**: PostgreSQL
- **Queue**: Redis (BullMQ)
- **Bank API**: Plaid (start)
- **Hosting**: AWS / Vercel

## 7. Architecture Summary (Mental Model)
- You are not a wallet
- You are a real-time trust validator
- Replace escrow with: 
  - continuous verification
  - automated execution
  - instant enforcement

## 8. YC-Level Insight

**Escrow = static trust (hold money)**
**TrustLayer = dynamic trust (verify continuously)**

This distinction is the core pitch.

---

## Differentiation: How to win against competition

Competition is guaranteed. Differentiation is structural, not cosmetic.

### 1. Change the Category (Not “Better Escrow”)
- **Current framing**: payment tool
- **Correct framing**: trust infrastructure layer

Escrow companies: Hold money, Charge fees, Resolve disputes.
TrustLayer: Don’t hold money, Don’t mediate, Enforce conditions automatically.
**Position**: “Stripe for trust, not payments.”

### 2. Own the Hard Layer: Enforcement
Most competitors will stop at Bank verification and Simple milestone triggers.
You differentiate by enforcement depth:
- Auto “stop work” signals integrated into tools
- GitHub access control (auto revoke collaborator)
- Figma access downgrade
- API keys disabled for client deliverables
**Result**: not just alerts → actual execution control

### 3. Become System of Record
Competitors sit on top (optional tool).
You become a required layer in workflow. 
**Execution**: GitHub App, Figma Plugin, Slack bot. All milestones routed through you → you control truth.

### 4. Build a Trust Score Graph
Not just transactions → reputation infrastructure.
- Client reliability score (based on balance behavior)
- Freelancer delivery score (based on milestone integrity)
Over time a marketplace emerges and risk pricing becomes possible. Competitors won’t have data depth early.

### 5. Geographic Advantage (India Edge)
Western startups focus US/EU and ignore fragmented markets.
You solve cross-border with India, SEA, MENA first. Handle UPI rails, currency friction, informal contracts. This is harder → defensible.

### 6. Compliance Moat
Most builders avoid PSD2, SCA, RBI guidelines.
You lean into it early: Become compliant-first infra. Others get blocked later, regulation becomes a barrier.

### 7. Pricing Innovation
Escrow charges a % fee (10–20%).
You charge a Subscription (₹ or $ monthly) or per-project flat fee.
**Signal**: You are infra, not marketplace.

### 8. AI Verification Layer
Competitors use manual or basic triggers.
You use AI to validate: Code quality (PR meaningful, not dummy), Design completeness, Deliverable authenticity. Prevents fake milestone triggering.

### 9. Speed as Weapon
Most will overbuild. You ship MVP in 2–3 weeks:
- Bank link
- Balance check
- Single milestone trigger (GitHub)
Get users early → data moat begins.

### 10. Core Reality
If someone else builds the same thing:
- Distribution wins
- Integration depth wins
- Data wins
- Speed wins

**Final Differentiation Axis**
Not: “Who thought of it first”
But: Who becomes the default layer freelancers rely on before starting any project. That position compounds.
