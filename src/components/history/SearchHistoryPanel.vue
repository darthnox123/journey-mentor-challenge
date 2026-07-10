<script setup lang="ts">
import { useSearchHistoryStore } from '@/stores/searchHistory'
import { useSearchStore } from '@/stores/search'
import { formatDateLabel } from '@/utils/date'
import type { SearchHistoryEntry } from '@/stores/searchHistory'

const historyStore = useSearchHistoryStore()
const searchStore = useSearchStore()

function rerun(entry: SearchHistoryEntry) {
  const { searchedAt, ...formState } = entry
  searchStore.search(formState)
}
</script>

<template>
  <div v-if="historyStore.entries.length > 0" class="rounded-lg border border-slate-200 bg-white p-4">
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-700">Recent searches</h2>
      <button type="button" class="text-xs text-slate-400 hover:text-slate-600" @click="historyStore.clear()">
        Clear
      </button>
    </div>
    <ul class="flex flex-wrap gap-2">
      <li v-for="entry in historyStore.entries" :key="entry.searchedAt">
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
          @click="rerun(entry)"
        >
          {{ entry.origin }} → {{ entry.destination }} · {{ formatDateLabel(entry.departureDate) }}
        </button>
      </li>
    </ul>
  </div>
</template>
