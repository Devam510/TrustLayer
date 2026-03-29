import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Welcome back
          </h1>
          <p className="text-slate-400 mt-2">Here's your real-time trust overview.</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/projects/new"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors duration-200">
            + New Project
          </Link>
          <Link
            href="/dashboard/bank-accounts"
            className="px-5 py-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium transition-colors duration-200">
            Link Bank Account
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium">Safe Projects</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">0</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium">At-Risk Projects</h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">0</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium">Active Alerts</h3>
          <p className="text-3xl font-bold text-slate-200 mt-2">0</p>
        </div>
      </div>
      
      {/* Recent Activity Placeholder */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
        <div className="text-center py-12 text-slate-500">
          No projects yet. Create your first project and generate an invite link to verify client funds.
        </div>
      </div>
    </div>
  )
}
