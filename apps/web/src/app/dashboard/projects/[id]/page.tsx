'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TrustIndicator } from '@/components/trust-indicator'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface Milestone {
  id: string
  title: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed'
}

interface Project {
  id: string
  title: string
  status: string
  budget: number
  currency: string
  clientId: string | null
  createdAt: string
  milestones: Milestone[]
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  pending_verification: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const MILESTONE_STYLES = {
  pending: 'bg-white/10 text-slate-300',
  in_progress: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)

  // Add Milestone Modal State
  const [isAddingMilestone, setIsAddingMilestone] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const tlToken = localStorage.getItem('tl_token')
    setToken(tlToken)

    const fetchProject = async () => {
      try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
          headers: { Authorization: `Bearer ${tlToken}` },
        })
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/dashboard/projects')
            return
          }
          throw new Error('Failed to load project details')
        }
        const data = await res.json()
        // Ensure milestones is always an array
        setProject({ ...data, milestones: data.milestones || [] })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load project')
      } finally {
        setLoading(false)
      }
    }
    
    if (tlToken) {
      fetchProject()
    } else {
      router.push('/login')
    }
  }, [id, router])

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !token) return
    setIsSaving(true)

    try {
      const newMilestone: Milestone = {
        id: crypto.randomUUID(),
        title: newTitle,
        amount: parseFloat(newAmount),
        status: 'pending',
      }

      const updatedMilestones = [...project.milestones, newMilestone]

      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ milestones: updatedMilestones }),
      })

      if (!res.ok) throw new Error('Failed to save milestone')
      
      setProject({ ...project, milestones: updatedMilestones })
      setIsAddingMilestone(false)
      setNewTitle('')
      setNewAmount('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding milestone')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading project details…</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-red-400">{error || 'Project not found'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start bg-white/5 border border-white/10 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{project.title}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className={`px-2.5 py-1 flex items-center rounded-md border capitalize ${STATUS_STYLES[project.status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {project.status.replace(/_/g, ' ')}
            </span>
            <span>Client: {project.clientId ? 'Linked ✓' : 'Pending Link'}</span>
            <span>
              Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency ?? 'USD' }).format(project.budget)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400">Project ID</p>
          <code className="text-slate-500 bg-[#0a0f1e] px-2 py-1 rounded-md text-xs mt-1 block">{id}</code>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Real-time Indicator */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 transition-all">
          <h2 className="text-lg font-semibold text-white mb-6">Live Trust Status</h2>
          {token && <TrustIndicator projectId={id as string} token={token} />}
        </div>

        {/* Milestone Logic */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Milestone Tracking</h2>
            {!isAddingMilestone && (
              <button 
                onClick={() => setIsAddingMilestone(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                + Add Milestone
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Added Milestones */}
            {project.milestones.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#0a0f1e] border border-white/5 rounded-lg gap-3 transition-colors hover:border-white/10">
                <div className="w-full">
                  <p className="text-white font-medium">{m.title}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency ?? 'USD' }).format(m.amount)}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap capitalize ${MILESTONE_STYLES[m.status]}`}>
                  {m.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}

            {/* Adding Milestone Inline Form */}
            {isAddingMilestone && (
              <form onSubmit={handleAddMilestone} className="p-4 bg-[#0a0f1e] border border-blue-500/30 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Milestone Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Design Phase"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMilestone(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Milestone'}
                  </button>
                </div>
              </form>
            )}

            {/* Total Budget Remaining Logic (Opacited placeholder for final delivery) */}
            {!isAddingMilestone && (
              <div className="flex items-center justify-between p-4 bg-[#0a0f1e] border border-dashed border-white/10 rounded-lg opacity-50">
                <div className="w-full">
                  <p className="text-white font-medium">Final Delivery 🔒</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency ?? 'USD' }).format(
                      Math.max(0, project.budget - project.milestones.reduce((acc, m) => acc + m.amount, 0))
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
