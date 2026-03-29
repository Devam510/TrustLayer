import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/dashboard" className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-500 inline-block" />
            TrustLayer
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {[
            { name: 'Overview', href: '/dashboard' },
            { name: 'Projects', href: '/dashboard/projects' },
            { name: 'Bank Accounts', href: '/dashboard/bank-accounts' },
            { name: 'Alerts', href: '/dashboard/alerts' },
            { name: 'API & Webhooks', href: '/dashboard/settings/api' },
            { name: 'Billing', href: '/dashboard/settings/billing' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-white transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/logout"
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-white/5 hover:text-white transition-colors">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header (Placeholder) */}
        <header className="md:hidden border-b border-white/10 p-4 flex justify-between items-center">
          <span className="font-bold text-white">TrustLayer</span>
          <button className="p-2 bg-white/5 rounded">Menu</button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
