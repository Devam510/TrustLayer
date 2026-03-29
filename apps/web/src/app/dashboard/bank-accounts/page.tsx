'use client'

import { useState } from 'react'

export default function BankAccountsPage() {
  const [loading, setLoading] = useState(false)

  const handleLinkBank = () => {
    setLoading(true)
    // Simulate Plaid Link opening
    setTimeout(() => {
      setLoading(false)
      alert('Plaid Link integration requires Plaid tokens. Phase 2.4 implementation.')
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-emerald-500/20 rounded-xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Connected Bank Accounts</h1>
            <p className="text-emerald-100/70">Connect your primary accounts via secure Plaid integration for real-time proof of funds.</p>
          </div>
          <button
            onClick={handleLinkBank}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-500/20 whitespace-nowrap">
            {loading ? 'Initializing Plaid...' : '+ Link New Institution'}
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Active Connections</h2>
        <div className="space-y-4">
          {/* Empty State */}
          <div className="text-center py-12 text-slate-500 bg-[#0a0f1e] rounded-lg border-2 border-dashed border-white/10">
            <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p>No bank accounts linked yet.</p>
          </div>

          {/* Placeholder Account */}
          <div className="hidden items-center justify-between p-5 bg-[#0a0f1e] rounded-lg border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-2">
                <img src="/plaid-chase-logo.svg" alt="Bank Logo" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div>
                <p className="text-white font-medium text-lg">Chase Business Checking</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-slate-400">•••• 1234</p>
                  <span className="w-1 h-1 bg-slate-600 rounded-full" />
                  <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Healthy</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Manage</button>
              <p className="text-xs text-slate-500">Last synced 2m ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
