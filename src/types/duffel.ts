export interface DuffelPlace {
  id: string
  name: string
  type: 'airport' | 'city'
  iata_code: string
  iata_country_code: string
  iata_city_code: string | null
  city_name: string | null
}

export type PlaceSuggestion = DuffelPlace

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

export interface OfferRequestSlicePayload {
  origin: string
  destination: string
  departure_date: string
}

export interface OfferRequestPayload {
  data: {
    slices: OfferRequestSlicePayload[]
    passengers: Array<{ type: 'adult' }>
    cabin_class: CabinClass
  }
}

export interface DuffelCarrier {
  name: string
  iata_code: string | null
}

export interface OfferSegment {
  id: string
  origin: DuffelPlace
  destination: DuffelPlace
  departing_at: string
  arriving_at: string
  duration: string
  marketing_carrier_flight_number: string
  marketing_carrier: DuffelCarrier
  operating_carrier: DuffelCarrier
}

export interface OfferSlice {
  id: string
  origin: DuffelPlace
  destination: DuffelPlace
  duration: string
  segments: OfferSegment[]
}

export interface Offer {
  id: string
  live_mode: boolean
  total_amount: string
  total_currency: string
  tax_amount: string | null
  tax_currency: string | null
  base_amount: string
  base_currency: string
  expires_at: string
  owner: DuffelCarrier
  slices: OfferSlice[]
}

export interface OfferRequestResponse {
  data: {
    id: string
    live_mode: boolean
    offers: Offer[]
    slices: OfferSlice[]
  }
}

export interface PlaceSuggestionsResponse {
  data: PlaceSuggestion[]
}

export interface DuffelErrorItem {
  type?: string
  title?: string
  message: string
  code?: string
}

export interface DuffelErrorResponse {
  errors: DuffelErrorItem[]
}
