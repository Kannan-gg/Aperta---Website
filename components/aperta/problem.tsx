'use client'

import { motion } from 'framer-motion'
import { SectionHeading, spring, viewportOnce } from './section-heading'

const bullets = [
  {
    title: 'Restricted opening limits life',
    body: 'Below 35 mm of interincisal opening, eating, speaking, oral hygiene and dental care all become difficult — or impossible.',
  },
  {
    title: 'Therapy is unmeasured',
    body: 'Stacked tongue depressors and passive stretchers give no objective feedback, so progress and compliance stay invisible.',
  },
  {
    title: 'Overstretching causes harm',
    body: 'Without force limits, patients can inflame fibrotic tissue and set recovery back by weeks.',
  },
  {
    title: 'Clinicians see snapshots',
    body: 'A ruler measurement every few weeks cannot reveal the daily trajectory needed to adjust a protocol.',
  },
]

const stats = [
  { label: 'Oral submucous fibrosis (OSMF)', value: 40, display: '40M' },
  { label: 'Post-radiation trismus', value: 8, display: '8M' },
  { label: 'Post-surgical trismus', value: 2, display: '2M' },
]

const maxValue = 40

export function Problem() {
  return (
    <section id="problem" className="relative scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="01 — The Problem"
          title="Millions can’t open their mouths. Almost none can measure recovery."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <ul className="flex flex-col gap-4">
            {bullets.map((item, i) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: -48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ ...spring, delay: i * 0.1 }}
                className="flex gap-5 rounded-[12px] border border-line bg-white shadow-lg shadow-slate-200/50 p-6"
              >
                <span className="mt-1 font-mono text-sm font-semibold text-amber">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-navy">{item.title}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-slate">{item.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <motion.figure
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={spring}
            className="flex flex-col justify-center rounded-[12px] border border-line bg-white shadow-lg shadow-slate-200/50 p-8 md:p-10"
          >
            <figcaption className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate">
                Estimated global prevalence
              </span>
              <span className="font-display text-2xl font-semibold text-navy">People living with trismus</span>
            </figcaption>

            <ul className="mt-10 flex flex-col gap-8">
              {stats.map((stat, i) => (
                <li key={stat.label} className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-base text-slate">{stat.label}</span>
                    <span className="font-display text-3xl font-bold text-navy">{stat.display}</span>
                  </div>
                  <div
                    className="h-4 overflow-hidden rounded-full bg-white/80"
                    role="img"
                    aria-label={`${stat.label}: approximately ${stat.value} million people`}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          i === 0
                            ? 'linear-gradient(90deg, #0066B3, #00AEEF)'
                            : 'linear-gradient(90deg, #0066B3, #72D3F0)',
                        boxShadow: '0 0 20px -2px #00AEEF',
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max((stat.value / maxValue) * 100, 4)}%` }}
                      viewport={viewportOnce}
                      transition={{ type: 'spring', stiffness: 40, damping: 16, delay: 0.2 + i * 0.15 }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 border-t border-line pt-6 text-sm leading-relaxed text-slate">
              OSMF is concentrated across South and Southeast Asia and strongly linked to areca nut use.
              Radiation-induced trismus affects up to a third of head-and-neck cancer survivors.
            </p>
          </motion.figure>
        </div>
      </div>
    </section>
  )
}
