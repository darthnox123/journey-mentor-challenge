import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUrlSearchParams } from '@vueuse/core'
import { createOfferRequest } from '@/services/offers'
import { DuffelApiError } from '@/services/duffelClient'
import { parseIsoDuration } from '@/utils/duration'
import { shiftDate, todayIsoDate } from '@/utils/date'
import type { CabinClass, Offer } from '@/types/duffel'
import type { FilterState, SearchFormState, SearchStatus, SortDirection, SortOption, StopFilter } from '@/types/search'

interface SearchQueryParams {
  origin?: string
  originName?: string
  destination?: string
  destinationName?: string
  date?: string
  pax?: string
  cabin?: string
  sort?: string
  dir?: string
  stops?: string
  airline?: string
  maxPrice?: string
  after?: string
  before?: string
}

// Module-scoped so aborting/sequencing survives store re-instantiation without
// polluting reactive state (Pinia would otherwise try to persist/track these).
let currentController: AbortController | null = null
let requestSeq = 0

export const useSearchStore = defineStore('search', () => {
  const query = useUrlSearchParams<SearchQueryParams>('history')

  const form = reactive<SearchFormState>({
    get origin() {
      return query.origin ?? ''
    },
    set origin(value: string) {
      query.origin = value || undefined
    },
    get originName() {
      return query.originName ?? ''
    },
    set originName(value: string) {
      query.originName = value || undefined
    },
    get destination() {
      return query.destination ?? ''
    },
    set destination(value: string) {
      query.destination = value || undefined
    },
    get destinationName() {
      return query.destinationName ?? ''
    },
    set destinationName(value: string) {
      query.destinationName = value || undefined
    },
    get departureDate() {
      return query.date || todayIsoDate()
    },
    set departureDate(value: string) {
      query.date = value || undefined
    },
    get passengers() {
      return Number(query.pax) || 1
    },
    set passengers(value: number) {
      query.pax = String(value)
    },
    get cabinClass() {
      return (query.cabin as CabinClass) || 'economy'
    },
    set cabinClass(value: CabinClass) {
      query.cabin = value
    },
  })

  const filters = reactive<FilterState>({
    get stops() {
      return (query.stops as StopFilter) || 'any'
    },
    set stops(value: StopFilter) {
      query.stops = value === 'any' ? undefined : value
    },
    get airline() {
      return query.airline || null
    },
    set airline(value: string | null) {
      query.airline = value || undefined
    },
    get maxPrice() {
      return query.maxPrice ? Number(query.maxPrice) : null
    },
    set maxPrice(value: number | null) {
      query.maxPrice = value != null ? String(value) : undefined
    },
    get departureAfter() {
      return query.after || null
    },
    set departureAfter(value: string | null) {
      query.after = value || undefined
    },
    get departureBefore() {
      return query.before || null
    },
    set departureBefore(value: string | null) {
      query.before = value || undefined
    },
  })

  const sort = computed<SortOption>({
    get: () => (query.sort as SortOption) || 'departure_time',
    set: (value) => {
      query.sort = value
    },
  })

  const sortDirection = computed<SortDirection>({
    get: () => (query.dir as SortDirection) || 'asc',
    set: (value) => {
      query.dir = value === 'asc' ? undefined : value
    },
  })

  const status = ref<SearchStatus>('idle')
  const offers = ref<Offer[]>([])
  const offerRequestId = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function search(overrides?: Partial<SearchFormState>) {
    if (overrides) {
      Object.assign(form, overrides)
    }

    currentController?.abort()
    const controller = new AbortController()
    currentController = controller
    const seq = ++requestSeq

    status.value = 'loading'
    error.value = null

    try {
      const response = await createOfferRequest({
        origin: form.origin,
        destination: form.destination,
        departureDate: form.departureDate,
        passengers: form.passengers,
        cabinClass: form.cabinClass,
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

  // The URL already encodes a complete search (deep link, shared link, reload) — run it.
  if (form.origin && form.destination) {
    search()
  }

  function shiftDateWindow(deltaDays: number) {
    return search({ departureDate: shiftDate(form.departureDate, deltaDays) })
  }

  function setSort(option: SortOption) {
    if (sort.value !== option) {
      sort.value = option
      sortDirection.value = 'asc'
    } else {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    }
  }

  function setFilters(partial: Partial<FilterState>) {
    Object.assign(filters, partial)
  }

  function reset() {
    currentController?.abort()
    requestSeq++
    query.origin = undefined
    query.originName = undefined
    query.destination = undefined
    query.destinationName = undefined
    query.date = undefined
    query.pax = undefined
    query.cabin = undefined
    query.stops = undefined
    query.airline = undefined
    query.maxPrice = undefined
    query.after = undefined
    query.before = undefined
    query.sort = undefined
    query.dir = undefined
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
      if (filters.stops === 'nonstop' && stopCount !== 0) return false
      if (filters.stops === 'one_stop' && stopCount !== 1) return false

      if (filters.airline && offer.owner.name !== filters.airline) return false

      if (filters.maxPrice !== null && Number(offer.total_amount) > filters.maxPrice) {
        return false
      }

      const departureTime = slice.segments[0]?.departing_at.slice(11, 16)
      if (filters.departureAfter && departureTime && departureTime < filters.departureAfter) {
        return false
      }
      if (filters.departureBefore && departureTime && departureTime > filters.departureBefore) {
        return false
      }

      return true
    })

    const sorted = [...filtered]
    const direction = sortDirection.value === 'asc' ? 1 : -1
    sorted.sort((a, b) => {
      let comparison: number
      if (sort.value === 'price') {
        comparison = Number(a.total_amount) - Number(b.total_amount)
      } else if (sort.value === 'duration') {
        comparison = parseIsoDuration(a.slices[0]?.duration ?? 'PT0M') - parseIsoDuration(b.slices[0]?.duration ?? 'PT0M')
      } else {
        const aTime = a.slices[0]?.segments[0]?.departing_at ?? ''
        const bTime = b.slices[0]?.segments[0]?.departing_at ?? ''
        comparison = aTime.localeCompare(bTime)
      }
      return comparison * direction
    })
    return sorted
  })

  const availableAirlines = computed(() => {
    const names = new Set(offers.value.map((offer) => offer.owner.name))
    return [...names].sort((a, b) => a.localeCompare(b))
  })

  return {
    form,
    status,
    offers,
    offerRequestId,
    error,
    sort,
    sortDirection,
    filters,
    sortedFilteredOffers,
    availableAirlines,
    search,
    shiftDateWindow,
    setSort,
    setFilters,
    reset,
  }
})
