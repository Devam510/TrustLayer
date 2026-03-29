'use client'

import { useParams } from 'next/navigation'
import TrustIndicator from '@/components/trust-indicator'

export default function ProjectDetailsPage() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start bg-white/5 border border-white/10 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Acme Corp iOS App</h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">Active</span>
            <span>Client: John Doe</span>
            <span>Budget: $50,000</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400">Project ID</p>
          <code className="text-slate-500 bg-[#0a0f1e] px-2 py-1 rounded-md text-xs mt-1 block">{id}</code>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Real-time Indicator */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Live Trust Status</h2>
          <TrustIndicator projectId={id as string} />
        </div>

        {/* Milestone Logic Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Milestone Tracking</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">+ Add Milestone</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0a0f1e] border border-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Design Phase</p>
                <p className="text-sm text-slate-500 mt-1">$10,000</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full">Completed</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0f1e] border border-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Beta Build</p>
                <p className="text-sm text-slate-500 mt-1">$20,000</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0f1e] border border-white/5 rounded-lg opacity-60 flex-col sm:flex-row gap-2">
              <div className="w-full">
                <p className="text-white font-medium">Final Delivery 🔒</p>
                <p className="text-sm text-slate-500 mt-1">$20,000</p>
              </div>
              <span className="px-3 py-1 bg-white/10 text-slate-300 text-xs font-bold rounded-full whitespace-nowrap">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
