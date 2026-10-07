'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, FlaskConical, Stethoscope, UserRound, type LucideIcon } from 'lucide-react'
import { SectionHeading, spring, viewportOnce } from './section-heading'

const audiences: { icon: LucideIcon; label: string; headline: string; points: string[] }[] = [
  {
    icon: UserRound,
    label: 'Patients',
    headline: 'Confidence in every session',
    points: [
      'See progress in millimetres, not guesses',
      'Force ceiling removes fear of overstretching',
      'Home therapy with fewer clinic visits',
    ],
  },
  {
    icon: Stethoscope,
    label: 'Clinicians',
    headline: 'Decisions backed by daily data',
    points: [
      'Remote review of adherence and range',
      'Early detection of plateaus or regression',
      'Protocol adjustments between appointments',
    ],
  },
  {
    icon: FlaskConical,
    label: 'Science',
    headline: 'A new standard for outcome data',
    points: [
      'High-resolution longitudinal MIO datasets',
      'Comparable endpoints across trial sites',
      'Evidence base for OSMF and radiation trismus',
    ],
  },
]

export function Impact() {
  return (
    <section id="impact" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="05 — Clinical Impact"
          title="Built for everyone in the recovery loop."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {audiences.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ ...spring, delay: i * 0.12 }}
                className="flex flex-col gap-6 rounded-[12px] border border-line bg-white shadow-lg shadow-slate-200/50 p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-[12px] bg-white shadow-lg shadow-slate-200/50">
                    <Icon className="size-5 text-royal" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-royal">
                    {item.label}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-tight text-navy">{item.headline}</h3>
                <ul className="flex flex-col gap-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-3 text-lg leading-snug text-slate">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-cyan" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            )
          })}
        </div>

        <motion.div
          role="note"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={spring}
          className="mt-8 flex flex-col gap-4 rounded-[12px] border border-amber/50 bg-amber/10 p-6 sm:flex-row sm:items-center"
        >
          <AlertTriangle className="size-6 shrink-0 text-amber" aria-hidden="true" />
          <p className="text-base leading-relaxed text-slate">
            <span className="font-semibold text-amber">Rev D Prototype — investigational device.</span>{' '}
            APERTA is not approved or cleared for clinical use. Specifications reflect bench testing and may
            change ahead of formal clinical evaluation.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
