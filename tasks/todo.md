# Phase G: Razorpay Checkout Integration

**Problem statement**: 
The backend has been completely wired up to process Razorpay Route transfers, but the frontend currently lacks any mechanism to actually trigger the `checkout.js` modal for Clients to supply their credit cards or UPI details to fund a milestone. We need a secure, dynamic bridge to initialize payment sessions on the frontend.

1. **[x] Native Script Loader Hook**
   - Write a React hook `useRazorpay.ts` that dynamically appends the Razorpay `checkout.js` script tag to the DOM.
   - *Expected Output*: A hook exposing `isLoaded` boolean that safely loads the library without Next.js SSR crashes.
   - *Verification method*: Checking if `window.Razorpay` becomes available on mount.

2. **[x] Milestone UI Scaffold (`/dashboard/projects/[id]`)**
   - Create a clean detailed Project View following the 60/30/10 Light Theme.
   - Display project info and mapping over milestones.
   - *Expected Output*: A visual list of milestones with "Fund in Escrow" buttons.
   - *Verification method*: Navigating to a mock project ID in the dashboard.

3. **[x] Checkout Initialization Logic**
   - Bind the "Fund" button to call the API's `/fund` endpoint, fetching the generated Razorpay `order_id` and options payload from NestJS.
   - Pass the `order_id` to `window.Razorpay(options).open()`.
   - *Expected Output*: The Razorpay iFrame modal appears prompting the user for payment.
   - *Verification method*: Attempting to click the trigger button in dev mode connecting to test keys.

**Risk / uncertainty flags**:
- `window.Razorpay` TypeScript definitions might be missing, requiring a custom `global.d.ts` declaration.
- Webhook timing: the Razorpay window closing might race the backend webhook processing `order.paid` events. We must handle optimistic UI updates carefully.