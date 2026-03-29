'use client'

import { useState } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

interface CreatedProject {
  id: string
  inviteToken: string
  title: string
}

export default function CreateProjectPage() {
  const [form, setForm] = useState({ title: '', description: '', budget: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [project, setProject] = useState<CreatedProject | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('tl_token')
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          budget: Number(form.budget),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to create project')
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inviteLink = project
    ? `${WEB_URL}/onboard/${project.inviteToken}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (project) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white/5 border border-emerald-500/20 rounded-xl p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Created!</h2>
        <p className="text-slate-400 mb-2">
          <span className="text-white font-medium">{project.title}</span> is ready.
        </p>
        <p className="text-slate-400 mb-6">Send this secure invite link to your client to link their bank account.</p>

        <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-4 flex items-center justify-between gap-3">
          <code className="text-emerald-400 break-all text-sm text-left">{inviteLink}</code>
          <button
            onClick={handleCopy}
            className="shrink-0 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white font-medium transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <Link href="/dashboard/projects" className="text-blue-400 hover:text-blue-300 font-medium text-sm">
            ← Back to Projects
          </Link>
          <button
            onClick={() => { setProject(null); setForm({ title: '', description: '', budget: '' }) }}
            className="text-slate-400 hover:text-white font-medium text-sm transition-colors"
          >
            + Create Another
          </button>
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
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Acme Corp iOS App"
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description <span className="text-slate-500">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Brief project description…"
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
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
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                placeholder="50000"
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating Link...' : 'Create & Generate Link'}
          </button>
        </div>
      </form>
    </div>
  )
}
