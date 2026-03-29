'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface ProjectInfo {
  id: string
  title: string
  budget: number
  currency: string
}

export default function OnboardPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [done, setDone] = useState(false)

  // Validate the invite token on load
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(`${API_URL}/projects/validate-invite?token=${token}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.message ?? 'Invalid or expired invite link')
          return
        }
        const data = await res.json()
        setProject(data)
      } catch {
        setError('Could not reach the server. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [token])

  const handleAccept = async () => {
    const stored = localStorage.getItem('tl_token')
    if (!stored) {
      // Redirect to login with redirect back here
      router.push(`/login?redirect=/onboard/${token}`)
      return
    }

    setAccepting(true)
    try {
      const res = await fetch(`${API_URL}/projects/accept-invite?token=${token}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${stored}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to accept invite')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0f1e, #0d1635)' }}>
        <div className="text-slate-400 animate-pulse">Validating invite link…</div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0a0f1e, #0d1635)' }}>
        <div className="glass-card p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">You&apos;re linked!</h1>
          <p className="text-slate-400 mb-8">
            Your account is now connected to <span className="text-white font-medium">{project?.title}</span>. The freelancer will be notified.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0a0f1e, #0d1635)' }}>
        <div className="glass-card p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Invalid Invite</h1>
          <p className="text-red-400 mb-8">{error}</p>
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">Return home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0a0f1e, #0d1635)' }}>
      <div className="glass-card p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bank Account Verification</h1>
          <p className="text-slate-400 text-sm">You have been invited to verify your funds for a project.</p>
        </div>

        {project && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Project</span>
              <span className="text-white font-medium text-sm">{project.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Budget</span>
              <span className="text-emerald-400 font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency ?? 'USD' }).format(project.budget)}
              </span>
            </div>
          </div>
        )}

        <p className="text-slate-400 text-sm mb-6 text-center">
          By accepting, you allow TrustLayer to verify your account balance in real-time. We never store your credentials.
        </p>

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          {accepting ? 'Linking…' : 'Accept & Link Bank Account'}
        </button>

        <p className="text-center text-slate-500 text-xs mt-4">
          You will need to log in or create an account to continue.
        </p>
      </div>
    </div>
  )
}
