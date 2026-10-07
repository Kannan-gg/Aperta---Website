import type { TelemetryPacket } from './types'

/**
 * Hook point: replace these UUIDs and decoders to match the APERTA ESP32 firmware.
 * Defaults assume each characteristic notifies a little-endian float32.
 */
export const APERTA_BLE = {
  namePrefix: 'APERTA',
  serviceUuid: '6e400001-a5e2-4c7b-9f00-a9e7a0000001',
  angleCharacteristicUuid: '6e400002-a5e2-4c7b-9f00-a9e7a0000001',
  forceCharacteristicUuid: '6e400003-a5e2-4c7b-9f00-a9e7a0000001',
  batteryServiceUuid: 'battery_service',
  batteryCharacteristicUuid: 'battery_level',
  decodeAngle: (view: DataView): number => view.getFloat32(0, true),
  decodeForce: (view: DataView): number => view.getFloat32(0, true),
} as const

export const TELEMETRY = {
  openingResolutionMm: 0.16,
  forceSampleRateHz: 80,
  forceLimitN: 25,
  closedOpeningMm: 18,
  maxOpeningMm: 45,
  historyWindowMs: 12_000,
  historySampleIntervalMs: 50,
  rawFeedLength: 10,
  maxReconnectAttempts: 5,
  httpPollIntervalMs: 100,
} as const

export const quantizeOpening = (mm: number) =>
  Math.round(mm / TELEMETRY.openingResolutionMm) * TELEMETRY.openingResolutionMm

const pickNumber = (obj: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return undefined
}

/** Hook point: adapt this to the JSON shape emitted by the ESP32 over WebSocket / HTTP. */
export function parseJsonTelemetry(text: string): TelemetryPacket | null {
  try {
    const data: unknown = JSON.parse(text)
    if (!data || typeof data !== 'object') return null
    const obj = data as Record<string, unknown>
    const packet: TelemetryPacket = {
      openingMm: pickNumber(obj, ['opening_mm', 'openingMm', 'opening', 'mm']),
      forceN: pickNumber(obj, ['force_n', 'forceN', 'force', 'n']),
      batteryPct: pickNumber(obj, ['battery', 'battery_pct', 'batteryPct']),
      deviceTs: pickNumber(obj, ['ts', 'timestamp', 't']),
      raw: text,
    }
    if (packet.openingMm === undefined && packet.forceN === undefined) return null
    return packet
  } catch {
    return null
  }
}
