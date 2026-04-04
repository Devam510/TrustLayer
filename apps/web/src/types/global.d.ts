export {}

declare global {
  interface Window {
    Razorpay: any; // We'll type this as any to avoid complex typings for the checkout widget
  }
}
