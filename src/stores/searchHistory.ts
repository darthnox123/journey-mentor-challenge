import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { SearchFormState } from '@/types/search'

export interface SearchHistoryEntry extends SearchFormState {
  searchedAt: string
}

const MAX_ENTRIES = 10

function entryKey(entry: Pick<SearchFormState, 'origin' | 'destination' | 'departureDate'>): string {
  return `${entry.origin}-${entry.destination}-${entry.departureDate}`
}

export const useSearchHistoryStore = defineStore('searchHistory', () => {
  const entries = useStorage<SearchHistoryEntry[]>('journey-mentor:search-history', [])

  function record(form: SearchFormState) {
    const key = entryKey(form)
    const deduped = entries.value.filter((entry) => entryKey(entry) !== key)
    entries.value = [{ ...form, searchedAt: new Date().toISOString() }, ...deduped].slice(0, MAX_ENTRIES)
  }

  function clear() {
    entries.value = []
  }

  return { entries, record, clear }
})
