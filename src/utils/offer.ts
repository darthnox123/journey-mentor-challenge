import type { Offer } from '@/types/duffel'
import { parseIsoDuration } from './duration'

/** Total stops across every slice (outbound + return, for round trips). */
export function stopCount(offer: Offer): number {
  return offer.slices.reduce((total, slice) => total + slice.segments.length - 1, 0)
}

/** Sum of flight duration across every slice — excludes time spent on the ground between trips. */
export function totalDurationMinutes(offer: Offer): number {
  return offer.slices.reduce((total, slice) => total + parseIsoDuration(slice.duration), 0)
}

export function layoverMinutes(arrivingAt: string, departingAt: string): number {
  return Math.round((new Date(departingAt).getTime() - new Date(arrivingAt).getTime()) / 60000)
}
