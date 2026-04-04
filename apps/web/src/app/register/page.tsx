'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    productRole: 'freelancer' as 'freelancer' | 'client',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message ?? 'Registration failed')

      localStorage.setItem('tl_token', data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/40 to-transparent" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-24">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl leading-none">T</span>
            </div>
            <span className="font-bold text-xl tracking-tight">TrustLayer</span>
          </Link>

          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Get paid<br />with confidence.
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              Join thousands of freelancers and clients using escrow to guarantee milestone payouts instantly via Razorpay.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl max-w-sm">
            <div className="flex gap-1 text-green-400 mb-3">🛡️</div>
            <p className="text-sm font-medium leading-relaxed">
              "As a client, I love that my money is held securely until I'm happy with the work. TrustLayer makes it easy."
            </p>
            <p className="text-xs text-blue-200 mt-4">— Neha K., Startup Founder</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h2>
            <p className="text-slate-500">Start verifying client funds in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, productRole: 'freelancer' }))}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  form.productRole === 'freelancer'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, productRole: 'client' }))}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  form.productRole === 'client'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Client
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Alice Johnson"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="alice@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
