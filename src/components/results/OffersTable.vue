<script setup lang="ts">
import { defineAsyncComponent, reactive } from 'vue'
import { useSearchStore } from '@/stores/search'
import { formatMinutes } from '@/utils/duration'
import { formatPrice } from '@/utils/money'
import { formatTime, formatDateLabel } from '@/utils/date'
import { stopCount, totalDurationMinutes } from '@/utils/offer'
import type { SortOption } from '@/types/search'
import SortIcon from './SortIcon.vue'

const OfferDetail = defineAsyncComponent(() => import('./OfferDetail.vue'))

const store = useSearchStore()

const expandedIds = reactive(new Set<string>())

function toggleExpanded(offerId: string) {
  if (expandedIds.has(offerId)) {
    expandedIds.delete(offerId)
  } else {
    expandedIds.add(offerId)
  }
}

const sortableColumns: Array<{ key: SortOption; label: string }> = [
  { key: 'departure_time', label: 'Departure' },
  { key: 'duration', label: 'Duration' },
  { key: 'price', label: 'Price' },
]

function ariaSort(column: SortOption): 'ascending' | 'descending' | 'none' {
  if (store.sort !== column) return 'none'
  return store.sortDirection === 'asc' ? 'ascending' : 'descending'
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table class="w-full min-w-[640px] text-left text-sm">
      <thead class="border-b border-slate-200 text-xs text-slate-500">
        <tr>
          <th v-for="column in sortableColumns" :key="column.key" class="p-0 font-medium" :aria-sort="ariaSort(column.key)">
            <button
              type="button"
              class="flex w-full items-center gap-1 px-4 py-3 text-left hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500"
              @click="store.setSort(column.key)"
            >
              {{ column.label }}
              <SortIcon
                :direction="store.sort === column.key ? store.sortDirection : null"
                :class="store.sort === column.key ? 'text-slate-600' : 'text-slate-300'"
              />
            </button>
          </th>
          <th class="px-4 py-3 font-medium">Airline</th>
          <th class="px-4 py-3 font-medium">Stops</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="offer in store.sortedFilteredOffers" :key="offer.id">
          <tr class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50" @click="toggleExpanded(offer.id)">
            <td class="px-4 py-3 font-medium text-slate-800">
              <div>
                {{ formatTime(offer.slices[0]!.segments[0]!.departing_at) }} →
                {{ formatTime(offer.slices[0]!.segments[offer.slices[0]!.segments.length - 1]!.arriving_at) }}
              </div>
              <div v-if="offer.slices.length > 1" class="mt-0.5 text-xs font-normal text-slate-400">
                Return {{ formatDateLabel(offer.slices[1]!.segments[0]!.departing_at.slice(0, 10)) }}
                {{ formatTime(offer.slices[1]!.segments[0]!.departing_at) }} →
                {{ formatTime(offer.slices[1]!.segments[offer.slices[1]!.segments.length - 1]!.arriving_at) }}
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ formatMinutes(totalDurationMinutes(offer)) }}</td>
            <td class="px-4 py-3 font-semibold text-slate-900">{{ formatPrice(offer.total_amount, offer.total_currency) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ offer.owner.name }}</td>
            <td class="px-4 py-3 text-slate-600">
              {{ stopCount(offer) === 0 ? 'Nonstop' : `${stopCount(offer)} stop${stopCount(offer) > 1 ? 's' : ''}` }}
            </td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                class="text-slate-400 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                :aria-expanded="expandedIds.has(offer.id)"
                :aria-label="`${expandedIds.has(offer.id) ? 'Hide' : 'Show'} flight details`"
                @click.stop="toggleExpanded(offer.id)"
              >
                {{ expandedIds.has(offer.id) ? '▲' : '▼' }}
              </button>
            </td>
          </tr>
          <tr v-if="expandedIds.has(offer.id)" class="border-b border-slate-100 last:border-b-0">
            <td colspan="6" class="bg-slate-50 p-0">
              <OfferDetail :offer="offer" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
