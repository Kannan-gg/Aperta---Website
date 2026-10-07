'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const viewportOnce = { once: true, amount: 0.3 } as const
export const spring = { type: 'spring', stiffness: 120, damping: 20 } as const

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={spring}
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <span className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-royal">
        {eyebrow}
      </span>
      <h2 className="max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy md:text-5xl lg:text-[54px]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-slate md:text-xl">
          {description}
        </p>
      ) : null}
    </motion.div>
  )
}
