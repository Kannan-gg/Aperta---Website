'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Battery, Bluetooth, Gauge, Radio, Unplug, Wifi, X, Zap } from 'lucide-react'
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { TELEMETRY, deviceDrawer, hardwareService, useDeviceDrawerOpen, useTelemetry } from '@/lib/hardware'
import type { ConnectionStatus } from '@/lib/hardware'

const statusCopy: Record<ConnectionStatus, string> = {
  disconnected: 'Disconnected',
  searching: 'Searching…',
  reconnecting: 'Reconnecting…',
  connected: 'Connected',
  error: 'Connection error',
}

const noopSubscribe = () => () => {}

export function DeviceStatusPill() {
  const { status, deviceName } = useTelemetry()
  const pending = status === 'searching' || status === 'reconnecting'

  return (
    <button
      type="button"
      onClick={deviceDrawer.open}
      aria-haspopup="dialog"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-sm',
        status === 'connected' && 'border-cyan bg-cyan text-navy hover:bg-royal hover:border-royal hover:text-white',
        pending && 'animate-pulse border-cyan bg-ice text-royal',
        status === 'disconnected' && 'border-line bg-white text-slate hover:border-royal hover:text-royal',
        status === 'error' && 'border-amber/50 bg-white text-amber',
      )}
    >
      <span className="relative flex size-2">
        {status === 'connected' ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        ) : null}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            status === 'connected' && 'bg-emerald-500 ring-2 ring-white/70',
            pending && 'bg-cyan',
            status === 'disconnected' && 'bg-slate/50',
            status === 'error' && 'bg-amber',
          )}
        />
      </span>
      <span className="max-w-[9rem] truncate sm:max-w-none">
        {status === 'connected' ? (
          <>
            <span className="hidden sm:inline">Connected: </span>
            {deviceName ?? 'APERTA-ESP32'}
          </>
        ) : (
          statusCopy[status]
        )}
      </span>
    </button>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  tone = 'navy',
}: {
  icon: typeof Gauge
  label: string
  value: string
  unit: string
  tone?: 'navy' | 'amber'
}) {
  return (
    <div className="rounded-[12px] border border-line bg-white p-4 shadow-lg shadow-slate-200/50">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-slate">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-display text-3xl font-bold tabular-nums',
          tone === 'amber' ? 'text-amber' : 'text-navy',
        )}
      >
        {value}
        <span className="ml-1 text-base font-semibold text-slate">{unit}</span>
      </p>
    </div>
  )
}

export function DeviceConnectionDrawer() {
  const open = useDeviceDrawerOpen()
  const telemetry = useTelemetry()
  const [address, setAddress] = useState('ws://192.168.4.1:81')
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const inputId = useId()
  const bleSupported = useSyncExternalStore(
    noopSubscribe,
    () => hardwareService.isBluetoothSupported(),
    () => true,
  )

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => panelRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deviceDrawer.close()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      returnFocusRef.current?.focus()
    }
  }, [open])

  const { status, transport, latest, batteryPct, latencyMs, packetRateHz, rawFeed, error } = telemetry
  const live = status === 'connected' && latest !== null
  const busy = status === 'searching' || status === 'reconnecting'
  const overLimit = live && latest.forceN > TELEMETRY.forceLimitN

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    hardwareService.connectNetwork(address)
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-navy/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={deviceDrawer.close}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-line bg-pearl shadow-2xl outline-none"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/90 px-6 py-4 backdrop-blur">
              <div>
                <h2 id={titleId} className="font-display text-xl font-bold text-navy">
                  Device Connection
                </h2>
                <p className="text-sm text-slate">
                  {statusCopy[status]}
                  {transport ? ` · ${transport.toUpperCase()}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={deviceDrawer.close}
                className="rounded-full p-2 text-slate transition-colors hover:bg-ice hover:text-navy focus-visible:outline-2 focus-visible:outline-cyan"
              >
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">Close device panel</span>
              </button>
            </div>

            <div className="flex flex-col gap-6 p-6">
              {error ? (
                <p role="alert" className="rounded-[12px] border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
                  {error}
                </p>
              ) : null}

              <section aria-label="Bluetooth pairing" className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!bleSupported || busy}
                  onClick={() => hardwareService.connectBluetooth()}
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-cyan px-5 py-3 font-semibold text-navy shadow-[0_12px_30px_-12px_#00AEEF] transition-colors hover:bg-royal hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-cyan disabled:hover:text-navy"
                >
                  <Bluetooth className="size-4" aria-hidden="true" />
                  Pair via Bluetooth (BLE)
                </button>
                {!bleSupported ? (
                  <p className="text-xs text-slate">
                    Web Bluetooth isn&apos;t available here. Use Chrome or Edge, or open the app outside the preview frame.
                  </p>
                ) : null}
              </section>

              <form onSubmit={onSubmit} className="flex flex-col gap-2">
                <label htmlFor={inputId} className="text-sm font-semibold text-navy">
                  Connect via ESP32 Local IP / WebSocket
                </label>
                <div className="flex gap-2">
                  <input
                    id={inputId}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ws://192.168.4.1:81"
                    spellCheck={false}
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-[8px] border border-line bg-white px-3 py-2.5 font-mono text-sm text-navy placeholder:text-slate/60 focus-visible:border-cyan focus-visible:outline-2 focus-visible:outline-cyan/30"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-[8px] border border-royal px-4 py-2.5 text-sm font-semibold text-royal transition-colors hover:bg-royal hover:text-white disabled:opacity-50"
                  >
                    <Wifi className="size-4" aria-hidden="true" />
                    Connect
                  </button>
                </div>
                <p className="text-xs text-slate">
                  Accepts ws://, wss:// or an http:// JSON endpoint (polled at 10 Hz).
                </p>
              </form>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => hardwareService.startDemo()}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-cyan hover:text-royal"
                >
                  <Radio className="size-4" aria-hidden="true" />
                  {transport === 'demo' ? 'Restart demo telemetry' : 'Use demo telemetry'}
                </button>
                {status !== 'disconnected' ? (
                  <button
                    type="button"
                    onClick={() => hardwareService.disconnect()}
                    className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-2 text-sm font-semibold text-slate transition-colors hover:border-amber hover:text-amber"
                  >
                    <Unplug className="size-4" aria-hidden="true" />
                    Disconnect
                  </button>
                ) : null}
              </div>

              <section aria-label="Live stream monitor" className="flex flex-col gap-3">
                <h3 className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-slate">
                  Live stream monitor
                  {live ? <span className="text-royal">● streaming</span> : <span>idle</span>}
                </h3>
                <div className="grid grid-cols-2 gap-3" aria-live="off">
                  <Metric icon={Gauge} label="Opening" value={live ? latest.openingMm.toFixed(2) : '—'} unit="mm" />
                  <Metric
                    icon={Zap}
                    label="Force"
                    value={live ? latest.forceN.toFixed(1) : '—'}
                    unit="N"
                    tone={overLimit ? 'amber' : 'navy'}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-[12px] border border-line bg-white p-3">
                    <p className="flex items-center gap-1 text-xs text-slate">
                      <Battery className="size-3.5" aria-hidden="true" /> Battery
                    </p>
                    <p className="mt-1 font-semibold tabular-nums text-navy">
                      {batteryPct !== null ? `${Math.round(batteryPct)}%` : '—'}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ice">
                      <div
                        className={cn('h-full rounded-full', (batteryPct ?? 100) < 20 ? 'bg-amber' : 'bg-sky')}
                        style={{ width: `${batteryPct ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-line bg-white p-3">
                    <p className="text-xs text-slate">Latency</p>
                    <p className="mt-1 font-semibold tabular-nums text-navy">
                      {latencyMs !== null ? `${Math.round(latencyMs)} ms` : '—'}
                    </p>
                  </div>
                  <div className="rounded-[12px] border border-line bg-white p-3">
                    <p className="text-xs text-slate">Packet rate</p>
                    <p className="mt-1 font-semibold tabular-nums text-navy">
                      {packetRateHz !== null ? `${Math.round(packetRateHz)} Hz` : '—'}
                    </p>
                  </div>
                </div>
                <div className="rounded-[12px] border border-line bg-navy p-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-sky">Raw packets</p>
                  <ol className="flex h-40 flex-col gap-1 overflow-hidden font-mono text-xs text-ice/85">
                    {rawFeed.length ? (
                      rawFeed.map((line, i) => (
                        <li key={`${i}-${line}`} className={cn('truncate', i === 0 && 'text-sky')}>
                          {line}
                        </li>
                      ))
                    ) : (
                      <li className="text-ice/50">Waiting for telemetry…</li>
                    )}
                  </ol>
                </div>
                <p className="text-xs text-slate">
                  AS5600 opening at {TELEMETRY.openingResolutionMm} mm resolution · load cell at{' '}
                  {TELEMETRY.forceSampleRateHz} Hz · safe force ceiling {TELEMETRY.forceLimitN} N.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
