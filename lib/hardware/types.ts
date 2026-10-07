export type ConnectionStatus = 'disconnected' | 'searching' | 'connected' | 'reconnecting' | 'error'

export type TransportKind = 'ble' | 'websocket' | 'http' | 'demo'

export type TelemetrySample = {
  /** Host receive time, ms since epoch */
  t: number
  openingMm: number
  forceN: number
}

/** A partial reading as decoded from any transport. Missing fields keep their previous value. */
export type TelemetryPacket = {
  openingMm?: number
  forceN?: number
  batteryPct?: number
  /** Device-side timestamp in ms since epoch, if the firmware provides one */
  deviceTs?: number
  raw?: string
}

export type TelemetrySnapshot = {
  status: ConnectionStatus
  transport: TransportKind | null
  deviceName: string | null
  error: string | null
  latest: TelemetrySample | null
  peakOpeningMm: number | null
  batteryPct: number | null
  latencyMs: number | null
  packetRateHz: number | null
  history: TelemetrySample[]
  rawFeed: string[]
}

export type SampleListener = (sample: TelemetrySample, packet: TelemetryPacket) => void
