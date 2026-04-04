import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "TrustLayer — Know You'll Get Paid",
  description:
    'Real-time payment visibility and escrow for freelancers. Verify your client has the funds before you start work.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="absolute top-0 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">T</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">TrustLayer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-1.5 text-sm text-success mb-8 font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            100% Escrow Protection via Razorpay
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Know You'll Get Paid
            <br />
            <span className="text-primary">Before You Start Work</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            TrustLayer automatically holds client funds securely in Escrow — 
            and deposits directly into your bank account the second a milestone is approved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-primary text-white text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform"
            >
              Start Free Trial →
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div id="how-it-works" className="mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Trust</h2>
            <p className="text-slate-500">The safest way to do freelance work in India.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🛡️',
                title: 'Money securely held',
                description: 'Clients deposit milestone funds upfront via Razorpay. We hold it securely until the work is done.',
              },
              {
                icon: '⚡',
                title: 'Instant Payouts',
                description: 'Once approved, 99% gets instantly routed straight to your Indian Bank Account via IMPS/NEFT.',
              },
              {
                icon: '🔮',
                title: 'Zero Uncertainty',
                description: 'No more chasing invoices. See exactly how much money is sitting safely in escrow before lifting a finger.',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card hover:shadow-md transition-shadow p-8 text-left border-slate-100">
                <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-100">{feature.icon}</div>
                <h3 className="text-slate-900 font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
