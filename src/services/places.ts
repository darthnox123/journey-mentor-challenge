import { duffelFetch } from './duffelClient'
import type { PlaceSuggestionsResponse, PlaceSuggestion } from '@/types/duffel'

export async function suggestPlaces(query: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 2) return []

  const response = await duffelFetch<PlaceSuggestionsResponse>('places/suggestions', {
    searchParams: { query },
    signal,
  })
  return response.data
}
