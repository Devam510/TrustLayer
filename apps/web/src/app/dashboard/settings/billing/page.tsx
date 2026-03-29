'use client'

import { useState } from 'react'

export default function BillingSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePortalRedirect = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('tl_token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/portal?returnUrl=${encodeURIComponent(
          window.location.href,
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to open billing portal')

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleCheckout = async (priceId: string) => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('tl_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, returnUrl: window.location.href }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Checkout failed')
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">Billing & Plans</h1>
      <p className="text-slate-400 mb-8">
        Manage your subscription, view invoices, and upgrade your plan to increase project limits.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Customer Portal Button */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Billing Portal</h2>
          <p className="text-slate-400 text-sm mt-1">
            Update credit cards, download invoices, and manage emails via Stripe securely.
          </p>
        </div>
        <button
          onClick={handlePortalRedirect}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors shadow-sm disabled:opacity-50">
          {loading ? 'Opening...' : 'Manage Billing ↗'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white">Free</h3>
          <p className="text-2xl font-bold mt-2">$0<span className="text-sm font-normal text-slate-400">/mo</span></p>
          <ul className="mt-6 mb-8 space-y-3 text-sm text-slate-300 flex-1">
            <li>✓ 1 Active Project</li>
            <li>✓ Balance Checks (every 30m)</li>
            <li>✓ Standard Email Alerts</li>
          </ul>
          <button disabled className="w-full py-2 bg-white/5 text-slate-400 rounded-lg cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-blue-900/40 to-white/5 border border-blue-500/50 rounded-xl p-6 flex flex-col shadow-lg shadow-blue-500/10 relative">
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
            RECOMMENDED
          </div>
          <h3 className="text-lg font-semibold text-white">Pro</h3>
          <p className="text-2xl font-bold mt-2">$15<span className="text-sm font-normal text-slate-400">/mo</span></p>
          <ul className="mt-6 mb-8 space-y-3 text-sm text-slate-300 flex-1">
            <li>✓ 10 Active Projects</li>
            <li>✓ Fast Balance Checks (every 5m)</li>
            <li>✓ Webhook Alerts Support</li>
          </ul>
          <button
            onClick={() => handleCheckout('price_pro')}
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
            Upgrade to Pro
          </button>
        </div>

        {/* Agency Plan */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white">Agency</h3>
          <p className="text-2xl font-bold mt-2">$49<span className="text-sm font-normal text-slate-400">/mo</span></p>
          <ul className="mt-6 mb-8 space-y-3 text-sm text-slate-300 flex-1">
            <li>✓ Unlimited Projects</li>
            <li>✓ Real-Time Checks (every 1m)</li>
            <li>✓ Public API Access</li>
          </ul>
          <button
            onClick={() => handleCheckout('price_agency')}
            disabled={loading}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors">
            Upgrade to Agency
          </button>
        </div>
      </div>
    </div>
  )
}
