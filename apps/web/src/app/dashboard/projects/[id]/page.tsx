'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRazorpay } from '@/hooks/useRazorpay'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface Milestone {
  id: string
  title: string
  amount: number
  status: 'pending' | 'funded' | 'released'
}

interface Project {
  id: string
  title: string
  status: string
  budget: number
  currency: string
  milestones: Milestone[]
  clientId: string | null
  freelancerId: string
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoaded, initializeRazorpay } = useRazorpay()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fundingMilestone, setFundingMilestone] = useState<string | null>(null)

  // Retrieve user payload from jwt ideally, mocked for demo assuming role exists
  const isClientMode = true // Hardcoded for demo - usually read from JWT

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('tl_token')
      const res = await fetch(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load project details')
      
      const data = await res.json()
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  const handleFundEscrow = async (milestone: Milestone) => {
    const token = localStorage.getItem('tl_token')
    if (!token) return router.push('/login')
    
    setFundingMilestone(milestone.id)
    setError('')

    try {
      // 1. Create order on backend
      const res = await fetch(`${API_URL}/escrow/milestone/${milestone.id}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to initialize escrow')

      // 2. Open Razorpay Widget Native
      initializeRazorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Inserted key
        amount: data.amount,
        currency: data.currency,
        name: 'TrustLayer Escrow',
        description: `Fund Milestone: ${milestone.title}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Razorpay returns rzp_payment_id, rzp_order_id, rzp_signature
          // Optimistically refresh project data (Backend Webhook verifies this eventually)
          console.log('Payment success:', response)
          await fetchProject()
        },
        prefill: {
          name: 'Client Name', // Could be populated from active user
          email: 'client@example.com',
        },
        theme: {
          color: '#3b82f6', // matches Trust Blue 60/30/10 theme
        },
        onPaymentFailure: () => {
          setError('Payment process was cancelled or failed.')
          setFundingMilestone(null)
        }
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setFundingMilestone(null)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading project details...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!project) return <div className="p-8 text-center text-slate-500">Project not found.</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <Link href="/dashboard/projects" className="text-primary text-sm font-semibold hover:underline mb-4 inline-block">
          ← Back to Projects
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{project.title}</h1>
            <p className="text-slate-500 mt-2 font-medium">
              Budget: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(project.budget / 100)}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-primary text-sm font-bold rounded-lg uppercase tracking-wider">
            {project.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Milestones Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Project Milestones</h2>
          {!isLoaded && <span className="text-xs text-slate-400">Loading secure checkout...</span>}
        </div>
        
        <div className="divide-y divide-slate-100">
          {(project.milestones || []).length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No milestones defined yet.
            </div>
          ) : (
            project.milestones.map((milestone) => (
              <div key={milestone.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{milestone.title}</h3>
                  <p className="text-slate-500 font-medium mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(milestone.amount / 100)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  {milestone.status === 'funded' && (
                    <span className="px-3 py-1.5 bg-success/10 text-success text-sm font-bold rounded-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Safe in Escrow
                    </span>
                  )}
                  {milestone.status === 'released' && (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg">
                      ✓ Paid Out
                    </span>
                  )}
                  {milestone.status === 'pending' && (
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-sm font-bold rounded-lg">
                      Awaiting Funds
                    </span>
                  )}

                  {/* Fund Button (Only for Client when pending) */}
                  {isClientMode && milestone.status === 'pending' && (
                    <button
                      onClick={() => handleFundEscrow(milestone)}
                      disabled={fundingMilestone === milestone.id || !isLoaded}
                      className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                    >
                      {fundingMilestone === milestone.id ? 'Connecting...' : 'Fund (Escrow)'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
