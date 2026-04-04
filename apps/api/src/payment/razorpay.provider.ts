import type { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Razorpay from 'razorpay'

export const RAZORPAY_TOKEN = 'RAZORPAY_TOKEN'

export const RazorpayProvider: Provider = {
  provide: RAZORPAY_TOKEN,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const key_id = config.get<string>('RAZORPAY_KEY_ID')
    const key_secret = config.get<string>('RAZORPAY_KEY_SECRET')

    if (!key_id || !key_secret) {
      throw new Error('FATAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined in .env')
    }

    return new Razorpay({ key_id, key_secret })
  },
}

