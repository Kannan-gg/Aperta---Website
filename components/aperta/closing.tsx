'use client'

import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import { spring, viewportOnce } from './section-heading'

const meta = [
  { label: 'Build', value: 'Prototype Rev D' },
  { label: 'Focus', value: 'Trismus Rehabilitation' },
  { label: 'Presented', value: 'October 2026' },
  { label: 'Status', value: 'Pre-clinical' },
]

export function Closing() {
  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-16 overflow-hidden border-t border-line py-28 md:py-40"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 0%, rgba(208,242,250,0.9) 0px, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(114,211,240,0.3) 0px, transparent 60%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={spring}
        className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center"
      >
        <span className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-royal">
          06 — What’s Next
        </span>
        <h2 className="text-balance font-display text-5xl font-bold leading-[0.95] tracking-tight text-navy md:text-7xl lg:text-[80px]">
          Every millimetre matters.
        </h2>
        <p className="max-w-2xl text-pretty text-xl leading-relaxed text-slate">
          We are seeking clinical partners and pilot sites to take APERTA from bench validation into its
          first patient studies.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <motion.a
            href="mailto:team@aperta.health?subject=APERTA%20clinical%20partnership"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-cyan px-7 py-4 font-semibold text-navy shadow-[0_12px_40px_-12px_#00AEEF] transition-colors hover:bg-royal hover:text-white"
          >
            Partner With Us
            <ArrowRight className="size-4" aria-hidden="true" />
          </motion.a>
          <motion.a
            href="#mechanism"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-line bg-white px-7 py-4 font-semibold text-navy transition-colors hover:border-royal hover:text-royal"
          >
            <FileText className="size-4" aria-hidden="true" />
            Review the Mechanism
          </motion.a>
        </div>
      </motion.div>

      <footer className="mx-auto mt-24 max-w-7xl px-6 lg:px-10">
        <dl className="grid grid-cols-2 gap-6 border-t border-line pt-8 md:grid-cols-4">
          {meta.map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-slate">{item.label}</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-navy">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-slate">© 2026 APERTA. Investigational device — not for clinical use.</p>
      </footer>
    </section>
  )
}
