# TrustLayer (Project Guardian)

**The Trust Infrastructure Layer for Freelancers and Clients.**

Traditional escrow relies on static trust—holding money, charging high fees (10-20%), and mediating disputes manually. TrustLayer replaces escrow with dynamic trust: **continuous verification, automated execution, and instant enforcement without ever taking custody of funds.**

Positioning: *Stripe for trust, not payments.*

---

## 1. Why We Win (The Moat)

Competition in the payment space is guaranteed. We differentiate structurally through deep integration and execution control.

- **Deep Enforcement, Not Just Alerts**: We don't just monitor balances; we enforce conditions. If client funds drop or a milestone fails, TrustLayer instantly triggers auto "stop-work" signals—downgrading Figma access, revoking GitHub collaborator permissions, or rotating client API keys.
- **Workflow System of Record**: TrustLayer operates where work happens. Via our GitHub App, Figma Plugin, and Slack Bot, all milestones are routed through us, making our infrastructure a required dependency, not an optional add-on.
- **Geographic & Compliance Advantage**: While Western startups focus on smooth US/EU rails, we solve hard cross-border friction first (India, SEA, MENA) utilizing UPI and informal contracts. We are compliant-first (PSD2, SCA, RBI guidelines), turning regulation into a barrier to entry for latecomers.
- **AI-Driven Verification Layer**: Instead of manual milestone approvals or blind triggers, TrustLayer runs heuristic and AI checks on code quality (meaningful PRs vs. dummy commits) and design completeness to prevent fraudulent triggers.
- **The Trust Score Graph**: Over time, verifiable milestone and fund data compounds into a reputation graph—a true reliability score for both clients and freelancers that enables future risk pricing.

---

## 2. Core Architecture

### High-Level Components
- **Frontend**: Freelancer & Client Dashboards (React, Tailwind) for project status, verified balances, and alerts.
- **Backend API Layer**: Node.js / Python (FastAPI) handling core logic, OAuth 2.0, Webhooks, and Bank API routing.
- **Banking Integration Layer**: Plaid / TrueLayer APIs for instant account linking and continuous zero-custody balance verification.
- **Monitoring Engine**: Event-driven cron jobs checking account balance thresholds and executing stop-work alerts or payment API calls.
- **Event System**: Kafka / Redis (BullMQ) processing webhooks (GitHub PR merges, Figma updates) to drive milestone progression.
- **Database**: PostgreSQL storing encrypted bank tokens (AES-256), project data, and immutable audit logs.

### Security Posture
- AES-256 encryption for all sensitive tokens.
- OAuth 2.0 strictly used for bank read/write access—**zero storage of raw bank credentials**.
- Immutable audit logs for every balance check, alert, and payment.

---

## 3. Data Flow

1. **Client Onboarding & Project Creation**: Client connects bank securely via Plaid/TrueLayer. Budget and milestones are defined.
2. **Fund Verification (Activation)**: System verifies real-time bank balance via API. Project activates only if Balance ≥ Budget.
3. **Continuous Monitoring**: The Monitoring Engine continuously checks balance health. If the balance drops below the budget buffered threshold (e.g., 10%), a **Stop Work Alert** is triggered and tool access is suspended.
4. **Milestone Trigger**: Work happens (e.g., GitHub PR merged, Figma file approved). A webhook hits the backend to verify the condition.
5. **Automated Payment Execution**: Once the milestone is validated, TrustLayer initiates a direct bank-to-freelancer transfer API call.

---

## 4. API & Extensibility

### Core APIs
- `/link_account`, `/get_balance`, `/initiate_payment`
- `/create_project`, `/verify_funds`, `/trigger_milestone`, `/send_alert`

### Webhook Integrations
- `/webhook/github`: Validates PR state, diff size, and AI code review.
- `/webhook/figma`: Validates design iterations and access control.

---

**Execution Factor**: TrustLayer's goal is to become the default layer freelancers rely on before writing a single line of code or designing a single pixel.
