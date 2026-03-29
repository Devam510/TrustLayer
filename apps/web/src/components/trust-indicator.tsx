'use client'

import { useTrustIndicator } from '@/hooks/use-trust-indicator'

interface TrustIndicatorProps {
  projectId: string
  token: string
}

const STATUS_CONFIG = {
  safe: {
    label: 'Funded',
    color: 'hsl(142, 76%, 46%)',
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.2)',
    pulse: '#22c55e',
  },
  at_risk: {
    label: 'At Risk',
    color: 'hsl(38, 92%, 50%)',
    bg: 'rgba(234, 179, 8, 0.1)',
    border: 'rgba(234, 179, 8, 0.2)',
    pulse: '#eab308',
  },
  stopped: {
    label: 'Stop Work',
    color: 'hsl(0, 72%, 51%)',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
    pulse: '#ef4444',
  },
}

const CONFIDENCE_LABELS = {
  high: '●●●',
  medium: '●●○',
  low: '●○○',
}

const STABILITY_LABELS = {
  stable: 'Stable',
  moderate: 'Moderate',
  volatile: 'Volatile',
  insufficient_data: 'Collecting data…',
}

export function TrustIndicator({ projectId, token }: TrustIndicatorProps) {
  const { status, connectionState } = useTrustIndicator({ projectId, token })

  if (connectionState === 'reconnecting') {
    return (
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm text-slate-400">Reconnecting to live feed…</span>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-slate-500 animate-pulse" />
        <span className="text-sm text-slate-400">Loading trust status…</span>
      </div>
    )
  }

  const config = STATUS_CONFIG[status.status]

  return (
    <div
      className="rounded-xl p-5 border transition-all duration-300"
      style={{ background: config.bg, borderColor: config.border }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: config.pulse,
              boxShadow: `0 0 8px ${config.pulse}`,
              animation: status.status !== 'safe' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span className="font-semibold" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span title="Signal confidence">
            {CONFIDENCE_LABELS[status.confidence]}
          </span>
          <span>{STABILITY_LABELS[status.fundStability]}</span>
        </div>
      </div>

      {/* Balance vs Budget */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Available Balance</span>
          <span className="text-white font-semibold">
            ${status.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Project Budget</span>
          <span className="text-slate-300">
            ${status.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((status.balance / status.budget) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${config.color}, ${config.pulse})`,
            }}
          />
        </div>
      </div>

      {/* Last checked */}
      <p className="text-xs text-slate-500 mt-3">
        Last verified: {new Date(status.checkedAt).toLocaleString()}
      </p>
    </div>
  )
}
