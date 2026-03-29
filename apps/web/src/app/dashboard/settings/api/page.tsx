export default function ApiSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys & Webhooks</h1>
          <p className="text-slate-400 mt-1">Manage integration credentials to automate trust alerts.</p>
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors duration-200">
          + Generate New Key
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Active API Keys</h2>
        <div className="space-y-4">
          {/* Empty State */}
          <div className="text-center py-8 text-slate-500 bg-[#0a0f1e] rounded-lg border border-white/5">
            You don't have any active API keys.
          </div>
          
          {/* Placeholder Key */}
          <div className="hidden flex items-center justify-between p-4 bg-[#0a0f1e] rounded-lg border border-white/5">
            <div>
              <p className="text-white font-medium">Production ERP Sync</p>
              <p className="text-xs text-slate-500 font-mono mt-1 mt-1">tl_live_83jc92... (Last used 2h ago)</p>
            </div>
            <button className="text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 transition-colors text-sm font-medium">
              Revoke
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Webhook Endpoints</h2>
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">+ Add Endpoint</button>
        </div>
        
        <div className="text-center py-8 text-slate-500 bg-[#0a0f1e] rounded-lg border border-white/5">
          No webhook endpoints configured.
        </div>
      </div>
    </div>
  )
}
