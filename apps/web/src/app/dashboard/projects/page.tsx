'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

interface Project {
  id: string
  title: string
  status: string
  budget: number
  currency: string
  inviteToken: string
  clientId: string | null
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400',
  pending_verification: 'bg-amber-500/20 text-amber-400',
  active: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const TRUST_STATUS: Record<string, string> = {
  draft: 'Awaiting client',
  pending_verification: 'Verifying…',
  active: 'Verified ✓',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('tl_token')
        const res = await fetch(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load projects')
        const data = await res.json()
        setProjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(`${WEB_URL}/onboard/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Projects</h1>
          <p className="text-slate-400 mt-1">Manage active contracts and monitor real-time client fund status.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors duration-200"
        >
          Create Project
        </Link>
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
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                    Loading projects…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500 mb-3">You don&apos;t have any projects yet.</p>
                    <Link href="/dashboard/projects/new" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      + Create your first project
                    </Link>
                  </td>
                </tr>
              )}

              {!loading && projects.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{p.title}</span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[p.status] ?? 'bg-slate-500/20 text-slate-400'}`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency ?? 'USD' }).format(p.budget)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${p.clientId ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {TRUST_STATUS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!p.clientId && (
                      <button
                        onClick={() => handleCopy(p.inviteToken)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                      >
                        {copied === p.inviteToken ? '✓ Copied' : 'Copy Invite'}
                      </button>
                    )}
                    <Link
                      href={`/dashboard/projects/${p.id}`}
                      className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-medium transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
