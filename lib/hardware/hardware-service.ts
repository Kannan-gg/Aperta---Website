import { APERTA_BLE, TELEMETRY, parseJsonTelemetry, quantizeOpening } from './config'
import type {
  SampleListener,
  TelemetryPacket,
  TelemetrySample,
  TelemetrySnapshot,
  TransportKind,
} from './types'

type BleCharacteristic = EventTarget & {
  value?: DataView
  startNotifications(): Promise<BleCharacteristic>
  stopNotifications(): Promise<BleCharacteristic>
  readValue(): Promise<DataView>
}
type BleService = { getCharacteristic(uuid: string): Promise<BleCharacteristic> }
type BleServer = {
  connected: boolean
  disconnect(): void
  getPrimaryService(uuid: string): Promise<BleService>
}
type BleDevice = EventTarget & { name?: string; gatt?: { connect(): Promise<BleServer> } }
type BluetoothApi = {
  getAvailability?(): Promise<boolean>
  requestDevice(options: {
    filters?: { namePrefix?: string; services?: string[] }[]
    optionalServices?: string[]
  }): Promise<BleDevice>
}

const initialSnapshot: TelemetrySnapshot = {
  status: 'disconnected',
  transport: null,
  deviceName: null,
  error: null,
  latest: null,
  peakOpeningMm: null,
  batteryPct: null,
  latencyMs: null,
  packetRateHz: null,
  history: [],
  rawFeed: [],
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const getBluetooth = (): BluetoothApi | undefined =>
  typeof navigator === 'undefined'
    ? undefined
    : (navigator as Navigator & { bluetooth?: BluetoothApi }).bluetooth

export class HardwareService {
  private snapshot: TelemetrySnapshot = initialSnapshot
  private listeners = new Set<() => void>()
  private sampleListeners = new Set<SampleListener>()
  private flushScheduled = false

  private current: { openingMm: number; forceN: number } = { openingMm: TELEMETRY.closedOpeningMm, forceN: 0 }
  private lastPacketAt = 0
  private lastHistoryAt = 0
  private rateEma: number | null = null
  private latencyEma: number | null = null

  private manualDisconnect = false
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private teardown: (() => void) | null = null

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot
  getServerSnapshot = () => initialSnapshot

  /** Hook point: receive every decoded sample at full device rate (e.g. for logging or export). */
  onSample(listener: SampleListener) {
    this.sampleListeners.add(listener)
    return () => {
      this.sampleListeners.delete(listener)
    }
  }

  isBluetoothSupported() {
    return Boolean(getBluetooth())
  }

  async connectBluetooth() {
    const bluetooth = getBluetooth()
    if (!bluetooth) {
      this.fail('Web Bluetooth is not available in this browser. Use Chrome or Edge on desktop/Android.')
      return
    }
    this.reset('ble')
    this.update({ status: 'searching' })
    try {
      const device = await bluetooth.requestDevice({
        filters: [{ namePrefix: APERTA_BLE.namePrefix }],
        optionalServices: [APERTA_BLE.serviceUuid, APERTA_BLE.batteryServiceUuid],
      })
      this.update({ deviceName: device.name ?? 'APERTA-ESP32' })
      await this.attachBleDevice(device)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        this.update({ ...initialSnapshot })
        return
      }
      this.fail(`Bluetooth pairing failed: ${message}`)
    }
  }

  private async attachBleDevice(device: BleDevice) {
    if (!device.gatt) throw new Error('Device does not expose a GATT server')
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(APERTA_BLE.serviceUuid)
    const [angleChar, forceChar] = await Promise.all([
      service.getCharacteristic(APERTA_BLE.angleCharacteristicUuid),
      service.getCharacteristic(APERTA_BLE.forceCharacteristicUuid),
    ])

    const onAngle = (event: Event) => {
      const view = (event.target as BleCharacteristic).value
      if (!view) return
      const mm = APERTA_BLE.decodeAngle(view)
      this.ingest({ openingMm: mm, raw: `{"ch":"angle","mm":${mm.toFixed(2)}}` })
    }
    const onForce = (event: Event) => {
      const view = (event.target as BleCharacteristic).value
      if (!view) return
      const n = APERTA_BLE.decodeForce(view)
      this.ingest({ forceN: n, raw: `{"ch":"force","n":${n.toFixed(2)}}` })
    }
    angleChar.addEventListener('characteristicvaluechanged', onAngle)
    forceChar.addEventListener('characteristicvaluechanged', onForce)
    await Promise.all([angleChar.startNotifications(), forceChar.startNotifications()])

    let batteryChar: BleCharacteristic | null = null
    const onBattery = (event: Event) => {
      const view = (event.target as BleCharacteristic).value
      if (view) this.ingest({ batteryPct: view.getUint8(0) })
    }
    try {
      const batteryService = await server.getPrimaryService(APERTA_BLE.batteryServiceUuid)
      batteryChar = await batteryService.getCharacteristic(APERTA_BLE.batteryCharacteristicUuid)
      const initial = await batteryChar.readValue()
      this.ingest({ batteryPct: initial.getUint8(0) })
      batteryChar.addEventListener('characteristicvaluechanged', onBattery)
      await batteryChar.startNotifications().catch(() => undefined)
    } catch {
      // Battery service is optional on the firmware.
    }

    const onDisconnected = () => {
      this.teardown?.()
      this.teardown = null
      this.scheduleReconnect(() => this.attachBleDevice(device))
    }
    device.addEventListener('gattserverdisconnected', onDisconnected)

    this.teardown = () => {
      device.removeEventListener('gattserverdisconnected', onDisconnected)
      angleChar.removeEventListener('characteristicvaluechanged', onAngle)
      forceChar.removeEventListener('characteristicvaluechanged', onForce)
      batteryChar?.removeEventListener('characteristicvaluechanged', onBattery)
      if (server.connected) server.disconnect()
    }
    this.reconnectAttempts = 0
    this.update({ status: 'connected', error: null })
  }

  connectNetwork(rawUrl: string) {
    const url = rawUrl.trim()
    if (!url) return
    const normalized = /^(wss?|https?):\/\//i.test(url) ? url : `ws://${url}`
    const isHttp = /^https?:\/\//i.test(normalized)
    this.reset(isHttp ? 'http' : 'websocket')
    this.update({ status: 'searching', deviceName: 'APERTA-ESP32' })
    if (isHttp) this.openHttpPoll(normalized)
    else this.openWebSocket(normalized)
  }

  private openWebSocket(url: string) {
    let socket: WebSocket
    try {
      socket = new WebSocket(url)
    } catch (err) {
      this.fail(`Invalid WebSocket address: ${err instanceof Error ? err.message : String(err)}`)
      return
    }
    socket.onopen = () => {
      this.reconnectAttempts = 0
      this.update({ status: 'connected', error: null })
    }
    socket.onmessage = (event) => {
      if (typeof event.data !== 'string') return
      const packet = parseJsonTelemetry(event.data)
      if (packet) this.ingest(packet)
    }
    socket.onclose = () => {
      this.teardown = null
      this.scheduleReconnect(() => this.openWebSocket(url))
    }
    this.teardown = () => {
      socket.onclose = null
      socket.close()
    }
  }

  private openHttpPoll(url: string) {
    const controller = new AbortController()
    let failures = 0
    const timer = setInterval(async () => {
      try {
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const packet = parseJsonTelemetry(await res.text())
        if (packet) this.ingest(packet)
        failures = 0
        if (this.snapshot.status !== 'connected') this.update({ status: 'connected', error: null })
      } catch (err) {
        if (controller.signal.aborted) return
        failures += 1
        if (failures >= TELEMETRY.maxReconnectAttempts) {
          this.teardown?.()
          this.teardown = null
          this.fail(`Lost HTTP endpoint: ${err instanceof Error ? err.message : String(err)}`)
        } else {
          this.update({ status: 'reconnecting' })
        }
      }
    }, TELEMETRY.httpPollIntervalMs)
    this.teardown = () => {
      controller.abort()
      clearInterval(timer)
    }
  }

  startDemo() {
    this.reset('demo')
    this.update({ status: 'connected', deviceName: 'APERTA-ESP32 (Demo)', batteryPct: 87, error: null })
    const start = performance.now()
    const interval = 1000 / TELEMETRY.forceSampleRateHz
    let battery = 87
    const timer = setInterval(() => {
      const s = (performance.now() - start) / 1000
      const cycle = (Math.sin(s * 0.55 - Math.PI / 2) + 1) / 2
      const drift = Math.min(s / 90, 1) * 4
      const opening = TELEMETRY.closedOpeningMm + cycle * (11 + drift) + (Math.random() - 0.5) * 0.25
      const force = Math.max(0, cycle * 19 + Math.sin(s * 3.1) * 1.2 + (Math.random() - 0.5) * 0.8 + (cycle > 0.92 ? 7 : 0))
      battery = Math.max(5, battery - 0.0004)
      this.ingest({
        openingMm: opening,
        forceN: force,
        batteryPct: Math.round(battery),
        deviceTs: Date.now() - (8 + Math.random() * 10),
      })
    }, interval)
    this.teardown = () => clearInterval(timer)
  }

  disconnect() {
    this.manualDisconnect = true
    this.clearReconnect()
    this.teardown?.()
    this.teardown = null
    this.update({ ...initialSnapshot })
  }

  private reset(transport: TransportKind) {
    this.disconnect()
    this.manualDisconnect = false
    this.reconnectAttempts = 0
    this.current = { openingMm: TELEMETRY.closedOpeningMm, forceN: 0 }
    this.lastPacketAt = 0
    this.lastHistoryAt = 0
    this.rateEma = null
    this.latencyEma = null
    this.update({ ...initialSnapshot, transport })
  }

  private scheduleReconnect(attempt: () => Promise<void> | void) {
    if (this.manualDisconnect) return
    if (this.reconnectAttempts >= TELEMETRY.maxReconnectAttempts) {
      this.fail('Device connection lost. Auto-reconnect gave up after several attempts.')
      return
    }
    this.reconnectAttempts += 1
    const delay = Math.min(8000, 500 * 2 ** (this.reconnectAttempts - 1))
    this.update({ status: 'reconnecting' })
    this.clearReconnect()
    this.reconnectTimer = setTimeout(async () => {
      try {
        await attempt()
      } catch {
        this.scheduleReconnect(attempt)
      }
    }, delay)
  }

  private clearReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private fail(message: string) {
    this.clearReconnect()
    this.update({ status: 'error', error: message })
  }

  /** Feed a decoded packet from any transport into the shared telemetry store. */
  ingest(packet: TelemetryPacket) {
    const now = Date.now()
    if (packet.openingMm !== undefined) {
      this.current.openingMm = quantizeOpening(clamp(packet.openingMm, 0, TELEMETRY.maxOpeningMm))
    }
    if (packet.forceN !== undefined) this.current.forceN = Math.max(0, packet.forceN)

    if (this.lastPacketAt) {
      const dt = now - this.lastPacketAt
      if (dt > 0) {
        const hz = 1000 / dt
        this.rateEma = this.rateEma === null ? hz : this.rateEma * 0.95 + hz * 0.05
      }
    }
    this.lastPacketAt = now

    if (packet.deviceTs !== undefined && Math.abs(now - packet.deviceTs) < 10_000) {
      const latency = Math.max(0, now - packet.deviceTs)
      this.latencyEma = this.latencyEma === null ? latency : this.latencyEma * 0.9 + latency * 0.1
    }

    const sample: TelemetrySample = { t: now, ...this.current }
    for (const listener of this.sampleListeners) listener(sample, packet)

    const next: Partial<TelemetrySnapshot> = {
      latest: sample,
      peakOpeningMm: Math.max(this.snapshot.peakOpeningMm ?? 0, sample.openingMm),
      packetRateHz: this.rateEma,
      latencyMs: this.latencyEma,
    }
    if (packet.batteryPct !== undefined) next.batteryPct = clamp(packet.batteryPct, 0, 100)

    if (now - this.lastHistoryAt >= TELEMETRY.historySampleIntervalMs) {
      this.lastHistoryAt = now
      const cutoff = now - TELEMETRY.historyWindowMs
      next.history = [...this.snapshot.history.filter((h) => h.t >= cutoff), sample]
      const raw =
        packet.raw ??
        JSON.stringify({ opening_mm: +sample.openingMm.toFixed(2), force_n: +sample.forceN.toFixed(2) })
      next.rawFeed = [raw, ...this.snapshot.rawFeed].slice(0, TELEMETRY.rawFeedLength)
    }
    this.update(next, true)
  }

  private update(partial: Partial<TelemetrySnapshot>, batched = false) {
    this.snapshot = { ...this.snapshot, ...partial }
    if (!batched) {
      this.notify()
      return
    }
    if (this.flushScheduled) return
    this.flushScheduled = true
    const flush = () => {
      this.flushScheduled = false
      this.notify()
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(flush)
    else setTimeout(flush, 16)
  }

  private notify() {
    for (const listener of this.listeners) listener()
  }
}

export const hardwareService = new HardwareService()
