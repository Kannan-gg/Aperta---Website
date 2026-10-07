'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SectionHeading, spring, viewportOnce } from './section-heading'
import { TELEMETRY, useTelemetry } from '@/lib/hardware'

type PartId = 'pads' | 'actuator' | 'clutch' | 'sensor' | 'module'

const parts: Record<PartId, { name: string; detail: string; x: number; y: number }> = {
  pads: {
    name: 'Bite Pads',
    detail: 'Soft, autoclavable silicone pads seat on the incisors and spread load evenly across the dental arch.',
    x: 521,
    y: 272,
  },
  actuator: {
    name: 'Lead-Screw Actuator',
    detail: 'A fine-pitch screw converts each thumbwheel turn into a small, repeatable opening increment.',
    x: 320,
    y: 200,
  },
  clutch: {
    name: 'Torque-Limiting Clutch',
    detail: 'Slips mechanically once opening force reaches the clinician-set ceiling, so overstretching is physically prevented.',
    x: 320,
    y: 318,
  },
  sensor: {
    name: 'Displacement Sensor',
    detail: 'A hinge-mounted angular sensor resolves opening to 0.16 mm and samples at 80 Hz.',
    x: 100,
    y: 200,
  },
  module: {
    name: 'Control Module',
    detail: 'Low-power microcontroller timestamps every session and syncs it over Bluetooth Low Energy.',
    x: 210,
    y: 290,
  },
}

const partOrder: PartId[] = ['pads', 'actuator', 'clutch', 'sensor', 'module']

const steps: { title: string; body: string; parts: PartId[] }[] = [
  {
    title: 'Position',
    body: 'The patient seats the bite pads between upper and lower incisors with the device fully closed. No force is applied yet.',
    parts: ['pads'],
  },
  {
    title: 'Actuate',
    body: 'Turning the thumbwheel drives the lead screw, opening the arms in small, patient-controlled increments.',
    parts: ['actuator'],
  },
  {
    title: 'Measure',
    body: 'The hinge sensor tracks interincisal distance in real time at 80 Hz, displaying opening to within 0.16 mm.',
    parts: ['sensor'],
  },
  {
    title: 'Protect & Record',
    body: 'If force exceeds the safe ceiling the clutch slips. Every session is logged and synced for clinician review.',
    parts: ['clutch', 'module'],
  },
]

function deriveLiveStep(openingMm: number, forceN: number, prevOpening: number | null) {
  if (forceN > TELEMETRY.forceLimitN) return 3
  if (openingMm < TELEMETRY.closedOpeningMm + 0.5 && forceN < 1) return 0
  if (prevOpening !== null && openingMm - prevOpening > 0.05) return 1
  return 2
}

export function Mechanism() {
  const [activeStep, setActiveStep] = useState(0)
  const [focusedPart, setFocusedPart] = useState<PartId | null>(null)
  const { status, latest, history } = useTelemetry()
  const live = status === 'connected' && latest !== null
  const prevOpening = history.length > 2 ? history[history.length - 3].openingMm : null
  const liveStep = live ? deriveLiveStep(latest.openingMm, latest.forceN, prevOpening) : null
  const step = liveStep ?? activeStep

  const highlighted: PartId[] = focusedPart ? [focusedPart] : steps[step].parts
  const isOpen = activeStep >= 1 || focusedPart === 'actuator'
  const lift = live
    ? Math.min(44, Math.max(0, (latest.openingMm - TELEMETRY.closedOpeningMm) * 2))
    : isOpen
      ? 22
      : 0
  const clutchSlipping = live && latest.forceN > TELEMETRY.forceLimitN
  const isHot = (id: PartId) => highlighted.includes(id) || (id === 'clutch' && clutchSlipping)
  const motionTransition = live ? { type: 'tween' as const, duration: 0.08, ease: 'linear' as const } : spring

  return (
    <section id="mechanism" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="03 — The Mechanism"
          title="Five components. Four steps. Zero guesswork."
          description="Hover, tap or focus any component to inspect it. Scroll through the steps to see a full session play out."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={spring}
              className="relative aspect-[3/2] w-full rounded-[12px] border border-line bg-gradient-to-br from-ice/40 to-white"
            >
              <svg viewBox="0 0 600 400" className="absolute inset-0 size-full" aria-hidden="true">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" fill="none" stroke="#020B44" strokeOpacity="0.05" />
                  </pattern>
                </defs>
                <rect width="600" height="400" fill="url(#grid)" />

                {/* Lower arm */}
                <line x1="100" y1="200" x2="520" y2="270" stroke="#020B44" strokeOpacity="0.85" strokeWidth="14" strokeLinecap="round" />
                {/* Upper arm */}
                <motion.line
                  x1="100"
                  y1="200"
                  x2="520"
                  initial={false}
                  animate={{ y2: 130 - lift }}
                  transition={motionTransition}
                  stroke="#020B44"
                  strokeOpacity="0.85"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Actuator screw */}
                <motion.g animate={{ opacity: isHot('actuator') ? 1 : 0.55 }}>
                  <motion.line
                    x1="320"
                    x2="320"
                    y2="237"
                    initial={false}
                    animate={{ y1: 163 - lift * 0.52 }}
                    transition={motionTransition}
                    stroke={isHot('actuator') ? '#00AEEF' : '#64748B'}
                    strokeWidth="10"
                  />
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <line key={n} x1="312" x2="328" y1={180 + n * 9} y2={175 + n * 9} stroke="#FFFFFF" strokeWidth="2" />
                  ))}
                </motion.g>

                {/* Clutch thumbwheel */}
                <line x1="320" y1="237" x2="320" y2="294" stroke="#64748B" strokeWidth="6" />
                <motion.circle
                  cx="320"
                  cy="318"
                  r="26"
                  fill="#FFFFFF"
                  strokeWidth="5"
                  animate={{
                    stroke: isHot('clutch') ? '#D97706' : '#64748B',
                    rotate: isHot('clutch') || isHot('actuator') ? 360 : 0,
                  }}
                  transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, stroke: { duration: 0.3 } }}
                  strokeDasharray="10 6"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />

                {/* Control module */}
                <line x1="210" y1="218" x2="210" y2="268" stroke="#64748B" strokeWidth="4" />
                <motion.rect
                  x="160"
                  y="268"
                  width="100"
                  height="44"
                  rx="8"
                  fill="#FFFFFF"
                  strokeWidth="3"
                  animate={{ stroke: isHot('module') ? '#00AEEF' : '#64748B' }}
                />
                {[0, 1, 2].map((n) => (
                  <motion.circle
                    key={n}
                    cx={185 + n * 25}
                    cy="290"
                    r="4"
                    fill="#00AEEF"
                    animate={isHot('module') ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.25 }}
                    transition={{ duration: 1.2, repeat: isHot('module') ? Infinity : 0, delay: n * 0.2 }}
                  />
                ))}

                {/* Hinge sensor */}
                <motion.circle
                  cx="100"
                  cy="200"
                  r="30"
                  fill="#FFFFFF"
                  strokeWidth="5"
                  animate={{ stroke: isHot('sensor') ? '#00AEEF' : '#64748B' }}
                />
                <circle cx="100" cy="200" r="8" fill="#020B44" />
                {isHot('sensor') ? (
                  <motion.circle
                    cx="100"
                    cy="200"
                    r="30"
                    fill="none"
                    stroke="#00AEEF"
                    strokeWidth="2"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                ) : null}

                {/* Bite pads */}
                <motion.rect
                  x="480"
                  width="82"
                  height="28"
                  rx="10"
                  initial={false}
                  animate={{ y: 114 - lift, fill: isHot('pads') ? '#00AEEF' : '#0066B3' }}
                  transition={motionTransition}
                />
                <motion.rect
                  x="480"
                  y="258"
                  width="82"
                  height="28"
                  rx="10"
                  animate={{ fill: isHot('pads') ? '#00AEEF' : '#0066B3' }}
                />

                {/* Opening dimension */}
                <motion.line
                  x1="580"
                  x2="580"
                  y2="258"
                  initial={false}
                  animate={{ y1: 142 - lift }}
                  transition={motionTransition}
                  stroke="#00AEEF"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>

              <div className="absolute right-3 top-3 rounded-[4px] bg-white/80 px-3 py-1.5 font-mono text-xs text-royal ring-1 ring-cyan/30">
                {live
                  ? `LIVE · ${latest.openingMm.toFixed(1)} mm · ${latest.forceN.toFixed(1)} N`
                  : isOpen
                    ? 'MIO 29.4 mm'
                    : 'MIO 18.0 mm'}
              </div>
              {clutchSlipping ? (
                <div role="status" className="absolute left-3 top-3 rounded-[4px] bg-amber px-3 py-1.5 font-mono text-xs font-semibold text-white">
                  Clutch slip · force ceiling reached
                </div>
              ) : null}

              {partOrder.map((id) => {
                const part = parts[id]
                const active = isHot(id)
                const showTooltip = focusedPart === id
                return (
                  <div
                    key={id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${(part.x / 600) * 100}%`, top: `${(part.y / 400) * 100}%` }}
                  >
                    <button
                      type="button"
                      aria-label={part.name}
                      aria-describedby={showTooltip ? `tip-${id}` : undefined}
                      onMouseEnter={() => setFocusedPart(id)}
                      onMouseLeave={() => setFocusedPart(null)}
                      onFocus={() => setFocusedPart(id)}
                      onBlur={() => setFocusedPart(null)}
                      onClick={() => setFocusedPart((prev) => (prev === id ? null : id))}
                      className="group relative flex size-9 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-cyan"
                    >
                      <span
                        className={cn(
                          'absolute inset-0 rounded-full transition-colors',
                          active ? 'bg-cyan/25 animate-ping' : 'bg-transparent',
                        )}
                      />
                      <span
                        className={cn(
                          'relative size-3.5 rounded-full ring-2 ring-white transition-all group-hover:scale-125',
                          active ? 'bg-cyan' : 'bg-slate/40',
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showTooltip ? (
                        <motion.div
                          id={`tip-${id}`}
                          role="tooltip"
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className={cn(
                            'pointer-events-none absolute bottom-full z-20 mb-2 hidden w-60 rounded-[12px] border border-cyan/40 bg-white/95 p-4 shadow-2xl backdrop-blur sm:block',
                            part.x > 400 ? 'right-0' : part.x < 200 ? 'left-0' : 'left-1/2 -translate-x-1/2',
                          )}
                        >
                          <p className="font-display text-sm font-semibold text-royal">{part.name}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate">{part.detail}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                )
              })}
            </motion.div>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Device components">
              {partOrder.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusedPart(id)}
                    onMouseLeave={() => setFocusedPart(null)}
                    onClick={() => setFocusedPart((prev) => (prev === id ? null : id))}
                    aria-pressed={focusedPart === id}
                    className={cn(
                      'rounded-[4px] border px-3 py-1.5 text-sm font-medium transition-colors',
                      isHot(id)
                        ? 'border-cyan bg-cyan/15 text-royal'
                        : 'border-line bg-white text-slate hover:border-royal hover:text-royal',
                    )}
                  >
                    {parts[id].name}
                  </button>
                </li>
              ))}
            </ul>
            <AnimatePresence mode="wait">
              {focusedPart ? (
                <motion.p
                  key={focusedPart}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-base leading-relaxed text-slate sm:hidden"
                >
                  {parts[focusedPart].detail}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <ol className="flex flex-col gap-6 lg:gap-[30vh] lg:py-[10vh]">
            {steps.map((item, i) => {
              const active = step === i
              const isLive = liveStep === i
              return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.6 }}
                  onViewportEnter={() => setActiveStep(i)}
                  transition={spring}
                  className={cn(
                    'rounded-[12px] border p-6 transition-colors duration-500 md:p-8',
                    active ? 'border-cyan/60 bg-white shadow-lg shadow-slate-200/50' : 'border-line bg-white shadow-lg shadow-slate-200/50',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'flex size-11 items-center justify-center rounded-full font-display text-lg font-bold transition-colors duration-500',
                        active ? 'bg-cyan text-navy' : 'bg-ice text-slate',
                      )}
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-navy">{item.title}</h3>
                    {isLive ? (
                      <span className="ml-auto rounded-full bg-cyan px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-navy">
                        Live
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-lg leading-relaxed text-slate">{item.body}</p>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
