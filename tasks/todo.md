# Production Payment & Escrow Implementation

**Problem statement**: 
TrustLayer currently implements basic platform subscription billing and Plaid bank linking, but completely lacks the B2B/B2C payment routing infrastructure required for a real production platform. We need a system to hold client funds securely and conditionally trigger payouts to developers (escrow) when milestones are approved.

1. **Schema Expansion**
   - Add `stripe_connect_id` and `onboarding_complete` to the `users` table for freelancers.
   - Create an `escrow_transactions` tracking table linking a `project_id`, `amount`, and `status`.
   - *Expected Output*: Drizzle schema migration applied successfully.
   - *Verification method*: Running Drizzle Studio to inspect new database structures.

2. **Stripe Connect Integration (Developer Payouts)**
   - Implement `Stripe Connect` inside the NestJS `billing.service.ts` to allow developers to create Express payout accounts.
   - Add an endpoint to generate Connect onboarding session URLs.
   - *Expected Output*: A working `/billing/connect` endpoint that redirects developers to Stripe.
   - *Verification method*: Onboard a test developer and verify they appear in the Stripe Dashboard.

3. **Client Funding (Inbound)**
   - Implement Stripe PaymentIntents to capture funds from the Client (using attached bank accounts or cards) placing them into the TrustLayer platform balance.
   - *Expected Output*: An endpoint that freezes/commits milestone funds.
   - *Verification method*: Test Stripe card captures showing up as "Uncaptured" or securely held in the Stripe balances dashboard.

4. **Milestone Escrow Release**
   - Build a `PATCH /projects/:id/milestones/:index/release` endpoint.
   - Execute a `Stripe Transfer` from TrustLayer's platform balance to the developer's connected Stripe account.
   - *Expected Output*: Funds successfully transferring to the developer's connected wallet upon client approval.
   - *Verification method*: Verify webhook triggers and successful transfers in the Stripe Dashboard logs.

**Risk / uncertainty flags**:
- **Plaid vs Stripe**: Plaid handles the bank login, but processing raw ACH pulls often requires Stripe's native ACH/Financial Connections integration or a processor like Dwolla. We will utilize Stripe as the processor.
- **Compliance Restrictions**: Using Stripe Connect requires setting up Terms of Service and understanding who retains chargeback liability. We will default to standard Connect Express flows.