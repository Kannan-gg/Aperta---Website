'use client'

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowDown, Bluetooth } from 'lucide-react'
import type { PointerEvent } from 'react'
import { HeroTelemetryCard } from './hero-telemetry-card'
import { deviceDrawer } from '@/lib/hardware'

const waves = [
  { d: 'M0 60 Q 150 20 300 60 T 600 60 T 900 60 T 1200 60 V120 H0Z', fill: '#D0F2FA', opacity: 0.9, duration: 18 },
  { d: 'M0 70 Q 150 35 300 70 T 600 70 T 900 70 T 1200 70 V120 H0Z', fill: '#72D3F0', opacity: 0.35, duration: 12 },
  { d: 'M0 85 Q 150 60 300 85 T 600 85 T 900 85 T 1200 85 V120 H0Z', fill: '#00AEEF', opacity: 0.18, duration: 9 },
]

export function Hero() {
  const reduceMotion = useReducedMotion()
  const mouseX = useMotionValue(-400)
  const mouseY = useMotionValue(-400)
  const x = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const y = useSpring(mouseY, { stiffness: 120, damping: 20 })
  const glow = useMotionTemplate`radial-gradient(520px circle at ${x}px ${y}px, rgba(114,211,240,0.35), rgba(208,242,250,0.25) 35%, transparent 70%)`

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <section
      id="top"
      onPointerMove={reduceMotion ? undefined : onPointerMove}
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-pearl pt-16"
      style={{
        backgroundImage:
          'radial-gradient(at 12% 18%, rgba(208,242,250,0.9) 0px, transparent 50%), radial-gradient(at 88% 12%, rgba(114,211,240,0.22) 0px, transparent 45%), radial-gradient(at 75% 85%, rgba(208,242,250,0.7) 0px, transparent 50%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#020B44 1px, transparent 1px), linear-gradient(90deg, #020B44 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      {reduceMotion ? null : (
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: glow }} />
      )}

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 overflow-hidden">
        {waves.map((wave, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 h-full w-[200%]"
            animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: wave.duration, repeat: Infinity, ease: 'linear' }}
          >
            <path d={wave.d} fill={wave.fill} fillOpacity={wave.opacity} />
            <path d={wave.d} fill={wave.fill} fillOpacity={wave.opacity} transform="translate(1200 0)" />
          </motion.svg>
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.35fr_1fr] lg:px-10">
        <div className="flex flex-col items-start gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="flex items-center gap-3 rounded-full border border-cyan/30 bg-white/70 px-4 py-1.5 backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan" />
            </span>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-royal">
              Rev D Prototype · Trismus Rehabilitation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
            className="font-display text-[clamp(4.5rem,13vw,9.5rem)] font-bold leading-[0.85] tracking-tight text-navy"
          >
            APERTA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.25 }}
            className="max-w-xl text-pretty text-xl leading-relaxed text-slate md:text-2xl"
          >
            A safety-first jaw mobilisation device that turns trismus therapy into{' '}
            <span className="font-semibold text-royal">measured, sub-millimetre progress</span> — for
            patients at home and the clinicians guiding them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.a
              href="#problem"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="group inline-flex items-center gap-3 rounded-[8px] bg-cyan px-7 py-4 text-base font-semibold text-navy shadow-[0_12px_40px_-12px_#00AEEF] transition-colors hover:bg-royal hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            >
              Explore
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </motion.a>
            <button
              type="button"
              onClick={deviceDrawer.open}
              className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-white px-6 py-4 text-base font-semibold text-navy transition-colors hover:border-royal hover:text-royal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            >
              <Bluetooth className="size-4" aria-hidden="true" />
              Connect device
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.35 }}
        >
          <HeroTelemetryCard />
        </motion.div>
      </div>
    </section>
  )
}
