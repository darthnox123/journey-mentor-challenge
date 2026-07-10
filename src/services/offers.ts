import { duffelFetch } from './duffelClient'
import type { CabinClass } from '@/types/duffel'
import type { OfferRequestPayload, OfferRequestResponse } from '@/types/duffel'

export interface CreateOfferRequestParams {
  origin: string
  destination: string
  departureDate: string
  passengers: number
  cabinClass: CabinClass
  signal?: AbortSignal
}

export function createOfferRequest(params: CreateOfferRequestParams): Promise<OfferRequestResponse> {
  const payload: OfferRequestPayload = {
    data: {
      slices: [
        {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departureDate,
        },
      ],
      passengers: Array.from({ length: params.passengers }, () => ({ type: 'adult' as const })),
      cabin_class: params.cabinClass,
    },
  }

  return duffelFetch<OfferRequestResponse>('air/offer_requests', {
    method: 'POST',
    body: payload,
    signal: params.signal,
  })
}
