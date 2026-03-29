'use client'

import { useState } from 'react'

export default function CreateProjectPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Placeholder logic for API submission
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1000)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white/5 border border-emerald-500/20 rounded-xl p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Created Successfully!</h2>
        <p className="text-slate-400 mb-6">Send this secure invite link to your client to link their bank account.</p>
        <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-4 flex items-center justify-between">
          <code className="text-emerald-400 break-all text-sm">https://app.trustlayer.com/onboard/inv_12345sample67890</code>
          <button className="ml-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white font-medium transition-colors">
            Copy
          </button>
        </div>
        <div className="mt-8">
          <a href="/dashboard/projects" className="text-blue-400 hover:text-blue-300 font-medium">← Back to Projects</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Create New Project</h1>
        <p className="text-slate-400">Define the project details and budget to generate a client onboarding link.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Acme Corp iOS App"
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client Name</label>
            <input
              required
              type="text"
              placeholder="e.g. John Doe / Acme Corp"
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Total Budget (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500">$</span>
              <input
                required
                type="number"
                min="1"
                placeholder="50000"
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button type="button" onClick={() => window.history.back()} className="px-5 py-2.5 rounded-lg text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors">
            {loading ? 'Generating Link...' : 'Create & Generate Link'}
          </button>
        </div>
      </form>
    </div>
  )
}
