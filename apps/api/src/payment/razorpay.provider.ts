import type { Provider } from '@nestjs/common'
import Razorpay from 'razorpay'

export const RAZORPAY_TOKEN = 'RAZORPAY_TOKEN'

export const RazorpayProvider: Provider = {
  provide: RAZORPAY_TOKEN,
  useFactory: () =>
    new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    }),
}
