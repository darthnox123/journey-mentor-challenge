import { onScopeDispose, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { suggestPlaces } from '@/services/places'
import type { PlaceSuggestion } from '@/types/duffel'

export function usePlaceAutocomplete() {
  const suggestions = ref<PlaceSuggestion[]>([])
  const isLoading = ref(false)

  let controller: AbortController | null = null
  let seq = 0

  const search = useDebounceFn(async (query: string) => {
    controller?.abort()

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      suggestions.value = []
      isLoading.value = false
      return
    }

    controller = new AbortController()
    const requestId = ++seq
    isLoading.value = true

    try {
      const results = await suggestPlaces(trimmed, controller.signal)
      if (requestId !== seq) return
      suggestions.value = results
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      suggestions.value = []
    } finally {
      if (requestId === seq) isLoading.value = false
    }
  }, 300)

  function clear() {
    controller?.abort()
    suggestions.value = []
    isLoading.value = false
  }

  onScopeDispose(() => {
    controller?.abort()
  })

  return { suggestions, isLoading, search, clear }
}
