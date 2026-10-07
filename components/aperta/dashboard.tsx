'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { LiveSessionChart } from './live-session-chart'
import { SectionHeading, spring, viewportOnce } from './section-heading'

const trajectory = [18.0, 19.4, 21.0, 22.8, 24.3, 26.0, 27.6, 29.0, 30.4, 31.6, 32.7, 33.5, 34.2].map(
  (mio, week) => ({ week, mio }),
)

const stats = [
  { value: '0.16', unit: 'mm', label: 'Measurement resolution', accent: 'text-royal' },
  { value: '80', unit: 'Hz', label: 'Sensor sampling rate', accent: 'text-royal' },
  { value: '+16.2', unit: 'mm', label: 'Modelled 12-week gain', accent: 'text-navy' },
  { value: '35', unit: 'mm', label: 'Functional opening target', accent: 'text-amber' },
]

const ranges = [4, 8, 12] as const

type TooltipPayload = { active?: boolean; payload?: { value: number }[]; label?: number }

function ChartTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[12px] border border-cyan/40 bg-white/95 px-4 py-3 shadow-xl">
      <p className="font-mono text-xs uppercase tracking-widest text-slate">Week {label}</p>
      <p className="font-display text-xl font-bold text-royal">{payload[0].value.toFixed(1)} mm</p>
    </div>
  )
}

export function Dashboard() {
  const [range, setRange] = useState<(typeof ranges)[number]>(12)
  const data = trajectory.slice(0, range + 1)

  return (
    <section id="data" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="04 — The Data"
          title="Recovery you can see, week by week."
          description="Every session feeds a longitudinal curve of maximum interincisal opening (MIO) — the clinical gold-standard outcome for trismus."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_2.2fr]">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ ...spring, delay: i * 0.08 }}
                className="rounded-[12px] border border-line bg-white shadow-lg shadow-slate-200/50 p-5 md:p-6"
              >
                <p className={cn('font-display text-4xl font-bold tracking-tight md:text-5xl', stat.accent)}>
                  {stat.value}
                  <span className="ml-1 text-xl font-semibold text-slate md:text-2xl">{stat.unit}</span>
                </p>
                <p className="mt-2 text-sm text-slate md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.figure
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={spring}
            className="flex flex-col rounded-[12px] border border-line bg-gradient-to-b from-ice/40 to-white p-6 md:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <figcaption>
                <p className="font-display text-xl font-semibold text-navy md:text-2xl">Healing trajectory</p>
                <p className="text-sm text-slate">Modelled MIO across a 12-week home protocol</p>
              </figcaption>
              <div role="group" aria-label="Chart range" className="flex rounded-[4px] border border-line p-1">
                {ranges.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                    className={cn(
                      'rounded-[4px] px-3 py-1.5 text-sm font-semibold transition-colors',
                      range === r ? 'bg-cyan text-navy' : 'text-slate hover:text-royal',
                    )}
                  >
                    {r} wk
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 h-72 w-full md:h-96" role="img" aria-label={`Line chart: mouth opening rises from 18 mm at week 0 to ${data[data.length - 1].mio} mm at week ${range}.`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mioFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00AEEF" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#00AEEF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#020B44" strokeOpacity={0.06} vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickFormatter={(w) => `W${w}`}
                  />
                  <YAxis
                    domain={[15, 40]}
                    ticks={[15, 20, 25, 30, 35, 40]}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}mm`}
                  />
                  <ReferenceLine
                    y={35}
                    stroke="#D97706"
                    strokeDasharray="6 6"
                    label={{ value: 'Functional target 35 mm', fill: '#D97706', fontSize: 12, position: 'insideTopLeft' }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#00AEEF', strokeOpacity: 0.4 }} />
                  <Area
                    type="monotone"
                    dataKey="mio"
                    stroke="#00AEEF"
                    strokeWidth={3}
                    fill="url(#mioFill)"
                    dot={{ r: 3, fill: '#FFFFFF', stroke: '#00AEEF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#00AEEF', stroke: '#FFFFFF', strokeWidth: 2 }}
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-slate">
              Trajectory modelled from published trismus rehabilitation outcomes; not patient data from APERTA.
            </p>
          </motion.figure>
        </div>
        <LiveSessionChart />
      </div>
    </section>
  )
}
