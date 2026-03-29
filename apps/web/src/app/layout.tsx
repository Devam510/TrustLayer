import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'TrustLayer — Know You'll Get Paid',
    template: '%s | TrustLayer',
  },
  description:
    'Zero-custody, real-time payment visibility for freelancers and agencies. Verify client funds before you start work.',
  keywords: ['freelancer', 'payment security', 'client funds', 'trust', 'invoicing'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trustlayer.dev',
    siteName: 'TrustLayer',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
