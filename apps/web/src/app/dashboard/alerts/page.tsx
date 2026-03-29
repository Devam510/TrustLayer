export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trust Alerts</h1>
          <p className="text-slate-400 mt-1">Review and manage warnings triggered by insufficient client funds.</p>
        </div>
        <button className="px-5 py-2 z.5 rounded-lg bg-white/10 hover:bg-white/20 font-medium text-white transition-colors duration-200">
          Acknowledge All
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-12 text-center text-slate-500 border-b border-white/10">
          <svg className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">No Active Alerts</h3>
          <p>All your active projects currently have sufficient client balances verified.</p>
        </div>

        {/* Example Alert (hidden) */}
        <div className="hidden border-b border-rose-500/20 bg-rose-500/5 p-6 hover:bg-rose-500/10 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-bold text-rose-400 uppercase tracking-wide">Stop Work Advisory</p>
                <h4 className="text-lg font-semibold text-white mt-1">Acme Corp iOS App</h4>
                <p className="text-sm text-slate-300 mt-2">Client balance dropped below the $50,000 threshold (Current: $12,400).</p>
                <p className="text-xs text-slate-500 mt-3">Triggered 2 hours ago</p>
              </div>
            </div>
            <button className="text-sm font-medium text-white bg-[#0a0f1e] border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
