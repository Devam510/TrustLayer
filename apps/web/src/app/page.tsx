import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TrustLayer — Know You'll Get Paid',
  description:
    'Real-time payment visibility for freelancers. Verify your client has the funds before you start work.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1635 50%, #0a0f1e 100%)' }}>
      
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Real-time fund verification
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
          Know You'll Get Paid
          <span className="block text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            Before You Start Work
          </span>
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          TrustLayer automatically verifies your client has sufficient funds via secure bank
          connections — and alerts you in real-time if that changes.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            Start Free →
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all duration-200">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {[
          {
            icon: '🔒',
            title: 'Bank-Grade Security',
            description: 'AES-256-GCM encrypted token storage. We never custody your money.',
          },
          {
            icon: '⚡',
            title: 'Real-Time Alerts',
            description: 'Get notified instantly via email or webhook when funds drop below threshold.',
          },
          {
            icon: '🌍',
            title: 'Global Coverage',
            description: 'US via Plaid. EU/UK via TrueLayer. Australia via Basiq. Expanding.',
          },
        ].map((feature) => (
          <div key={feature.title} className="glass-card p-6">
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
