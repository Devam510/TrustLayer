export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Projects</h1>
          <p className="text-slate-400 mt-1">Manage active contracts and monitor real-time client fund status.</p>
        </div>
        <a
          href="/dashboard/projects/new"
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors duration-200">
          Create Project
        </a>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-sm text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Project Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Budget</th>
                <th className="px-6 py-4 font-medium">Trust Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {/* Empty State */}
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  You don't have any projects yet. Create one to generate a client invite link.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
