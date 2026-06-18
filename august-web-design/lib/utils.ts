import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuid } from 'uuid'
import Cookies from 'js-cookie'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEVICE_ID_KEY = 'august_device_id'

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return uuid()
  }

  try {
    let id = Cookies.get(DEVICE_ID_KEY)
    if (!id) {
      id = uuid()
      Cookies.set(DEVICE_ID_KEY, id, {
        path: '/',
        sameSite: 'lax',
        expires: 3650,
      })
    }
    return id
  } catch {
    return uuid()
  }
}
