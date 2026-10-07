'use client'

import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion'
import { Activity, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react'
import { SectionHeading, spring, viewportOnce } from './section-heading'

type Pillar = {
  icon: LucideIcon
  title: string
  body: string
  points: string[]
  loop: TargetAndTransition
}

const pillars: Pillar[] = [
  {
    icon: ShieldCheck,
    title: 'Safety-First Design',
    body: 'A mechanical torque-limiting clutch caps opening force before tissue is overloaded — no software required to stay safe.',
    points: ['Hardware force ceiling', 'Patient-controlled increments', 'Soft medical-grade bite pads'],
    loop: { scale: [1, 1.12, 1], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  },
  {
    icon: Activity,
    title: 'Real-Time Measurement',
    body: 'An integrated displacement sensor captures interincisal opening continuously during every session.',
    points: ['0.16 mm resolution', '80 Hz sampling rate', 'Live on-device readout'],
    loop: { x: [0, 3, -3, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
  },
  {
    icon: TrendingUp,
    title: 'Progress Intelligence',
    body: 'Session data builds a longitudinal recovery curve that clinicians can review remotely and act on early.',
    points: ['12-week trajectory tracking', 'Adherence insights', 'Plateau detection'],
    loop: { y: [0, -4, 0], rotate: [0, -6, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  },
]

export function Pillars() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="solution" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="02 — The Solution"
          title="Three pillars. One device."
          description="APERTA combines controlled mechanical stretching with clinical-grade sensing, so every session is safe, quantified and part of a bigger picture."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ ...spring, delay: i * 0.12 }}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col gap-6 rounded-[12px] border border-line bg-white shadow-lg shadow-slate-200/50 p-8 transition-[border-color,box-shadow] duration-300 hover:border-cyan/70 hover:shadow-[0_0_0_1px_rgba(0,174,239,0.35),0_24px_60px_-18px_rgba(0,102,179,0.35)] md:last:col-span-2 lg:last:col-span-1"
              >
                <div className="flex size-14 items-center justify-center rounded-[12px] bg-white/50 ring-1 ring-line transition-colors group-hover:ring-cyan/50">
                  <motion.span animate={reduceMotion ? undefined : pillar.loop} className="inline-flex">
                    <Icon className="size-7 text-royal" aria-hidden="true" />
                  </motion.span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-2xl font-bold text-navy">{pillar.title}</h3>
                  <p className="text-lg leading-relaxed text-slate">{pillar.body}</p>
                </div>
                <ul className="mt-auto flex flex-col gap-2 border-t border-line pt-5">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm font-medium text-slate">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
