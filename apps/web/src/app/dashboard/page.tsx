import Link from 'next/link'
import { Plus, Link2 } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Welcome back
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here's your real-time escrow overview.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/bank-accounts"
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold transition-all shadow-sm">
            <Link2 className="w-4 h-4" />
            Link Bank
          </Link>
          <Link
            href="/dashboard/projects/new"
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:scale-[1.02] text-white transition-transform font-semibold shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Active in Escrow</h3>
          <p className="text-4xl font-extrabold text-success mt-3">₹0</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Milestones Safe</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-3">0</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Active Alerts</h3>
          <p className="text-4xl font-extrabold text-slate-900 mt-3">0</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📁
          </div>
          <h3 className="text-slate-900 font-bold mb-2">No projects yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Create your first project and generate an invite link to secure client funds in escrow.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow-sm hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </Link>
        </div>
      </div>
    </div>
  )
}

