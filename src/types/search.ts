import type { CabinClass } from './duffel'

export type { CabinClass }

export type SortOption = 'price' | 'duration' | 'departure_time'

export type SortDirection = 'asc' | 'desc'

export type StopFilter = 'any' | 'nonstop' | 'one_stop' | 'two_plus'

export interface FilterState {
  stops: StopFilter
  airline: string | null
  departureAfter: string | null
  departureBefore: string | null
  minPrice: number | null
  maxPrice: number | null
}

export interface SearchFormState {
  origin: string
  originName: string
  destination: string
  destinationName: string
  departureDate: string
  returnDate: string | null
  passengers: number
  cabinClass: CabinClass
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty'
