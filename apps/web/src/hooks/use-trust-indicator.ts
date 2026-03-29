'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface TrustStatusEvent {
  projectId: string
  status: 'safe' | 'at_risk' | 'stopped'
  balance: number
  budget: number
  confidence: 'high' | 'medium' | 'low'
  fundStability: 'stable' | 'moderate' | 'volatile' | 'insufficient_data'
  checkedAt: string
}

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

const INITIAL_RETRY_DELAY = 1000  // 1s
const MAX_RETRY_DELAY = 30_000    // 30s

interface UseTrustIndicatorOptions {
  projectId: string
  token: string
  apiUrl?: string
}

interface UseTrustIndicatorResult {
  status: TrustStatusEvent | null
  connectionState: ConnectionState
  error: string | null
}

/**
 * Real-time trust indicator hook using SSE.
 * Features:
 * - Exponential backoff reconnection (1s → 2s → 4s → max 30s)
 * - Shows 'reconnecting...' state in UI during reconnect
 * - On reconnect: fetches latest status via REST before SSE resumes
 * - Unlimited retry attempts
 */
export function useTrustIndicator({
  projectId,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
}: UseTrustIndicatorOptions): UseTrustIndicatorResult {
  const [status, setStatus] = useState<TrustStatusEvent | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [error, setError] = useState<string | null>(null)

  const esRef = useRef<EventSource | null>(null)
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const fetchLatestStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (mountedRef.current && data) {
        // Construct a TrustStatusEvent from the REST response
        setStatus((prev) => prev ?? {
          projectId,
          status: data.status === 'active' ? 'safe' : data.status === 'at_risk' ? 'at_risk' : 'stopped',
          balance: 0,
          budget: parseFloat(data.budget ?? '0'),
          confidence: 'low',
          fundStability: 'insufficient_data',
          checkedAt: data.updatedAt ?? new Date().toISOString(),
        })
      }
    } catch {
      // Ignore — SSE will provide live data once connected
    }
  }, [apiUrl, projectId, token])

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    setConnectionState('connecting')
    const url = `${apiUrl}/monitoring/stream/${projectId}?token=${token}`
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('trust-status', (event: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse(event.data) as TrustStatusEvent
        setStatus(data)
        setConnectionState('connected')
        setError(null)
        retryDelayRef.current = INITIAL_RETRY_DELAY // Reset on success
      } catch {
        // ignore malformed events
      }
    })

    es.onopen = () => {
      if (!mountedRef.current) return
      setConnectionState('connected')
      setError(null)
      retryDelayRef.current = INITIAL_RETRY_DELAY
    }

    es.onerror = () => {
      if (!mountedRef.current) return
      es.close()
      esRef.current = null
      setConnectionState('reconnecting')

      const delay = retryDelayRef.current
      retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY)

      retryTimerRef.current = setTimeout(async () => {
        if (!mountedRef.current) return
        // Fetch latest via REST before SSE resumes
        await fetchLatestStatus()
        connect()
      }, delay)
    }
  }, [apiUrl, projectId, token, fetchLatestStatus])

  useEffect(() => {
    mountedRef.current = true
    fetchLatestStatus().then(() => connect())

    return () => {
      mountedRef.current = false
      esRef.current?.close()
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [connect, fetchLatestStatus])

  return { status, connectionState, error }
}
