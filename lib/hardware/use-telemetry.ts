'use client'

import { useSyncExternalStore } from 'react'
import { hardwareService } from './hardware-service'

export function useTelemetry() {
  return useSyncExternalStore(
    hardwareService.subscribe,
    hardwareService.getSnapshot,
    hardwareService.getServerSnapshot,
  )
}

type Listener = () => void
let drawerOpen = false
const drawerListeners = new Set<Listener>()

export const deviceDrawer = {
  open() {
    drawerOpen = true
    drawerListeners.forEach((l) => l())
  },
  close() {
    drawerOpen = false
    drawerListeners.forEach((l) => l())
  },
  subscribe(listener: Listener) {
    drawerListeners.add(listener)
    return () => {
      drawerListeners.delete(listener)
    }
  },
}

export function useDeviceDrawerOpen() {
  return useSyncExternalStore(
    deviceDrawer.subscribe,
    () => drawerOpen,
    () => false,
  )
}
