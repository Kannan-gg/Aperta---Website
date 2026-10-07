'use client'

import { cn } from '@/lib/utils'
import { TELEMETRY, deviceDrawer, useTelemetry } from '@/lib/hardware'
import type { TelemetrySample } from '@/lib/hardware'

const W = 320
const H = 72

function Sparkline({ history }: { history: TelemetrySample[] }) {
  if (history.length < 2) {
    return <path d={`M0 ${H - 8} H${W}`} stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 6" fill="none" />
  }
  const t0 = history[0].t
  const span = Math.max(1, history[history.length - 1].t - t0)
  const toY = (mm: number) =>
    H - 6 - ((mm - TELEMETRY.closedOpeningMm + 2) / (TELEMETRY.maxOpeningMm - TELEMETRY.closedOpeningMm)) * (H - 12)
  const pts = history.map((s) => `${(((s.t - t0) / span) * W).toFixed(1)},${toY(s.openingMm).toFixed(1)}`)
  return (
    <>
      <polygon points={`0,${H} ${pts.join(' ')} ${W},${H}`} fill="url(#sparkFill)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#00AEEF" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  )
}

export function HeroTelemetryCard() {
  const { status, latest, history, deviceName, peakOpeningMm } = useTelemetry()
  const live = status === 'connected' && latest !== null
  const forcePct = live ? Math.min(100, (latest.forceN / TELEMETRY.forceLimitN) * 100) : 0
  const overLimit = live && latest.forceN > TELEMETRY.forceLimitN

  return (
    <div className="rounded-[16px] border border-line bg-white/85 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate">Live telemetry</p>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest',
            live ? 'bg-cyan text-navy' : 'bg-ice text-royal',
          )}
        >
          {live ? 'Streaming' : status === 'searching' || status === 'reconnecting' ? 'Linking' : 'Standby'}
        </span>
      </div>
      <p className="mt-1 truncate text-sm text-slate">{live ? deviceName : 'No device connected'}</p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate">Mouth opening</p>
          <p className="font-display text-6xl font-bold tabular-nums leading-none text-navy">
            {live ? latest.openingMm.toFixed(1) : TELEMETRY.closedOpeningMm.toFixed(1)}
            <span className="ml-1 text-2xl font-semibold text-slate">mm</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-widest text-slate">Session peak</p>
          <p className="font-display text-2xl font-bold tabular-nums text-royal">
            {peakOpeningMm !== null ? `${peakOpeningMm.toFixed(1)} mm` : '—'}
          </p>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#72D3F0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#72D3F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Sparkline history={history} />
      </svg>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-widest text-slate">Applied force</span>
          <span className={cn('font-mono font-semibold tabular-nums', overLimit ? 'text-amber' : 'text-navy')}>
            {live ? `${latest.forceN.toFixed(1)} N` : '— N'} / {TELEMETRY.forceLimitN} N
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ice">
          <div
            className={cn('h-full rounded-full transition-[width] duration-150', overLimit ? 'bg-amber' : 'bg-cyan')}
            style={{ width: `${forcePct}%` }}
          />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate">Resolution</dt>
          <dd className="font-display text-xl font-bold text-navy">{TELEMETRY.openingResolutionMm} mm</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate">Sampling</dt>
          <dd className="font-display text-xl font-bold text-navy">{TELEMETRY.forceSampleRateHz} Hz</dd>
        </div>
      </dl>

      {!live ? (
        <button
          type="button"
          onClick={deviceDrawer.open}
          className="mt-5 w-full rounded-[8px] bg-ice py-2.5 text-sm font-semibold text-royal transition-colors hover:bg-royal hover:text-white"
        >
          Pair an APERTA device or start demo stream
        </button>
      ) : null}
    </div>
  )
}
