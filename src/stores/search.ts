import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { createOfferRequest } from '@/services/offers'
import { DuffelApiError } from '@/services/duffelClient'
import { parseIsoDuration } from '@/utils/duration'
import { shiftDate, todayIsoDate } from '@/utils/date'
import type { Offer } from '@/types/duffel'
import type { FilterState, SearchFormState, SearchStatus, SortOption } from '@/types/search'

function defaultForm(): SearchFormState {
  return {
    origin: '',
    originName: '',
    destination: '',
    destinationName: '',
    departureDate: todayIsoDate(),
    passengers: 1,
    cabinClass: 'economy',
  }
}

function defaultFilters(): FilterState {
  return {
    stops: 'any',
    maxPrice: null,
    departureAfter: null,
    departureBefore: null,
  }
}

// Module-scoped so aborting/sequencing survives store re-instantiation without
// polluting reactive state (Pinia would otherwise try to persist/track these).
let currentController: AbortController | null = null
let requestSeq = 0

export const useSearchStore = defineStore('search', () => {
  const form = useStorage<SearchFormState>('journey-mentor:search-form', defaultForm())
  const sort = useStorage<SortOption>('journey-mentor:search-sort', 'price')
  const filters = useStorage<FilterState>('journey-mentor:search-filters', defaultFilters())

  const status = useStorage<SearchStatus>('journey-mentor:search-status', 'idle')
  const offers = useStorage<Offer[]>('journey-mentor:search-offers', [])
  const offerRequestId = useStorage<string | null>('journey-mentor:search-offer-request-id', null)
  const error = ref<string | null>(null)

  // A request that was in flight when the tab closed can never resolve on reload.
  if (status.value === 'loading') {
    status.value = offers.value.length > 0 ? 'success' : 'idle'
  }

  async function search(overrides?: Partial<SearchFormState>) {
    if (overrides) {
      form.value = { ...form.value, ...overrides }
    }

    currentController?.abort()
    const controller = new AbortController()
    currentController = controller
    const seq = ++requestSeq

    status.value = 'loading'
    error.value = null

    try {
      const response = await createOfferRequest({
        origin: form.value.origin,
        destination: form.value.destination,
        departureDate: form.value.departureDate,
        passengers: form.value.passengers,
        cabinClass: form.value.cabinClass,
        signal: controller.signal,
      })

      if (seq !== requestSeq) return

      offers.value = response.data.offers
      offerRequestId.value = response.data.id
      status.value = response.data.offers.length > 0 ? 'success' : 'empty'
    } catch (err) {
      if (seq !== requestSeq) return
      if (err instanceof DOMException && err.name === 'AbortError') return

      offers.value = []
      offerRequestId.value = null
      status.value = 'error'
      error.value = err instanceof DuffelApiError ? err.message : 'Something went wrong. Please try again.'
    }
  }

  function shiftDateWindow(deltaDays: number) {
    return search({ departureDate: shiftDate(form.value.departureDate, deltaDays) })
  }

  function setSort(option: SortOption) {
    sort.value = option
  }

  function setFilters(partial: Partial<FilterState>) {
    filters.value = { ...filters.value, ...partial }
  }

  function reset() {
    currentController?.abort()
    requestSeq++
    form.value = defaultForm()
    filters.value = defaultFilters()
    sort.value = 'price'
    offers.value = []
    offerRequestId.value = null
    status.value = 'idle'
    error.value = null
  }

  const sortedFilteredOffers = computed(() => {
    const filtered = offers.value.filter((offer) => {
      const slice = offer.slices[0]
      if (!slice) return false

      const stopCount = slice.segments.length - 1
      if (filters.value.stops === 'nonstop' && stopCount !== 0) return false
      if (filters.value.stops === 'one_stop' && stopCount !== 1) return false

      if (filters.value.maxPrice !== null && Number(offer.total_amount) > filters.value.maxPrice) {
        return false
      }

      const departureTime = slice.segments[0]?.departing_at.slice(11, 16)
      if (filters.value.departureAfter && departureTime && departureTime < filters.value.departureAfter) {
        return false
      }
      if (filters.value.departureBefore && departureTime && departureTime > filters.value.departureBefore) {
        return false
      }

      return true
    })

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sort.value === 'price') {
        return Number(a.total_amount) - Number(b.total_amount)
      }
      if (sort.value === 'duration') {
        return parseIsoDuration(a.slices[0]?.duration ?? 'PT0M') - parseIsoDuration(b.slices[0]?.duration ?? 'PT0M')
      }
      const aTime = a.slices[0]?.segments[0]?.departing_at ?? ''
      const bTime = b.slices[0]?.segments[0]?.departing_at ?? ''
      return aTime.localeCompare(bTime)
    })
    return sorted
  })

  return {
    form,
    status,
    offers,
    offerRequestId,
    error,
    sort,
    filters,
    sortedFilteredOffers,
    search,
    shiftDateWindow,
    setSort,
    setFilters,
    reset,
  }
})
