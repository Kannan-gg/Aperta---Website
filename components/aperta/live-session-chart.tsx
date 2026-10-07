'use client'

import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { TELEMETRY, deviceDrawer, useTelemetry } from '@/lib/hardware'

export function LiveSessionChart() {
  const { status, latest, history, peakOpeningMm, packetRateHz } = useTelemetry()
  const live = status === 'connected' && latest !== null
  const now = latest?.t ?? 0
  const data = history.map((s) => ({
    t: +((s.t - now) / 1000).toFixed(2),
    opening: s.openingMm,
    force: s.forceN,
  }))
  const overLimit = live && latest.forceN > TELEMETRY.forceLimitN

  return (
    <figure className="mt-6 rounded-[12px] border border-line bg-white p-6 shadow-lg shadow-slate-200/50 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <figcaption>
          <p className="flex items-center gap-2 font-display text-xl font-semibold text-navy md:text-2xl">
            <span
              aria-hidden="true"
              className={cn('size-2.5 rounded-full', live ? 'animate-pulse bg-cyan' : 'bg-slate/40')}
            />
            Live session
          </p>
          <p className="text-sm text-slate">
            Last {TELEMETRY.historyWindowMs / 1000} s of opening and applied force from the connected device
          </p>
        </figcaption>
        <dl className="flex flex-wrap gap-6 text-right">
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate">Opening</dt>
            <dd className="font-display text-2xl font-bold tabular-nums text-navy">
              {live ? `${latest.openingMm.toFixed(1)} mm` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate">Force</dt>
            <dd className={cn('font-display text-2xl font-bold tabular-nums', overLimit ? 'text-amber' : 'text-navy')}>
              {live ? `${latest.forceN.toFixed(1)} N` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate">Session MIO</dt>
            <dd className="font-display text-2xl font-bold tabular-nums text-royal">
              {peakOpeningMm !== null ? `${peakOpeningMm.toFixed(1)} mm` : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {live && data.length > 1 ? (
        <div className="mt-6 h-64 w-full" role="img" aria-label={`Live chart: current opening ${latest.openingMm.toFixed(1)} millimetres, force ${latest.forceN.toFixed(1)} newtons.`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="liveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#72D3F0" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#72D3F0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#020B44" strokeOpacity={0.06} vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={[-TELEMETRY.historyWindowMs / 1000, 0]}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(v: number) => `${v.toFixed(0)}s`}
              />
              <YAxis
                yAxisId="mm"
                domain={[15, 45]}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}mm`}
              />
              <YAxis
                yAxisId="n"
                orientation="right"
                domain={[0, 35]}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}N`}
              />
              <ReferenceLine yAxisId="n" y={TELEMETRY.forceLimitN} stroke="#D97706" strokeDasharray="6 6" />
              <Area
                yAxisId="mm"
                dataKey="opening"
                type="monotone"
                stroke="#00AEEF"
                strokeWidth={2.5}
                fill="url(#liveFill)"
                isAnimationActive={false}
                dot={false}
              />
              <Line
                yAxisId="n"
                dataKey="force"
                type="monotone"
                stroke="#0066B3"
                strokeWidth={1.5}
                strokeOpacity={0.7}
                isAnimationActive={false}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 flex h-64 flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-line bg-pearl text-center">
          <p className="font-medium text-navy">
            {status === 'searching' || status === 'reconnecting' ? 'Waiting for the first packet…' : 'No device streaming'}
          </p>
          <p className="max-w-sm text-sm text-slate">
            Pair over Bluetooth, connect over Wi-Fi, or start the demo stream to see sensor data here.
          </p>
          <button
            type="button"
            onClick={deviceDrawer.open}
            className="rounded-[8px] bg-cyan px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-royal hover:text-white"
          >
            Open device panel
          </button>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-4 bg-cyan" /> Opening (mm)
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-4 bg-royal/70" /> Force (N)
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-4 border-t border-dashed border-amber" /> Clutch ceiling
        </span>
        {packetRateHz !== null && live ? <span className="ml-auto font-mono">{Math.round(packetRateHz)} Hz</span> : null}
      </div>
    </figure>
  )
}
