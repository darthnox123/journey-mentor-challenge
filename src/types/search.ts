import type { CabinClass } from './duffel'

export type { CabinClass }

export type SortOption = 'price' | 'duration' | 'departure_time'

export type SortDirection = 'asc' | 'desc'

export type StopFilter = 'any' | 'nonstop' | 'one_stop'

export interface FilterState {
  stops: StopFilter
  airline: string | null
  maxPrice: number | null
  departureAfter: string | null
  departureBefore: string | null
}

export interface SearchFormState {
  origin: string
  originName: string
  destination: string
  destinationName: string
  departureDate: string
  passengers: number
  cabinClass: CabinClass
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty'
