<script setup lang="ts">
import { reactive } from 'vue'
import { useSearchStore } from '@/stores/search'
import { formatDuration } from '@/utils/duration'
import { formatPrice } from '@/utils/money'
import { formatTime } from '@/utils/date'
import type { SortOption } from '@/types/search'
import OfferDetail from './OfferDetail.vue'
import SortIcon from './SortIcon.vue'

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
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table class="w-full min-w-[640px] text-left text-sm">
      <thead class="border-b border-slate-200 text-xs text-slate-500">
        <tr>
          <th
            v-for="column in sortableColumns"
            :key="column.key"
            class="cursor-pointer select-none px-4 py-3 font-medium hover:text-slate-700"
            @click="store.setSort(column.key)"
          >
            <span class="inline-flex items-center gap-1">
              {{ column.label }}
              <SortIcon
                :direction="store.sort === column.key ? store.sortDirection : null"
                :class="store.sort === column.key ? 'text-slate-600' : 'text-slate-300'"
              />
            </span>
          </th>
          <th class="px-4 py-3 font-medium">Airline</th>
          <th class="px-4 py-3 font-medium">Stops</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="offer in store.sortedFilteredOffers" :key="offer.id">
          <tr
            class="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
            @click="toggleExpanded(offer.id)"
          >
            <td class="px-4 py-3 font-medium text-slate-800">
              {{ formatTime(offer.slices[0]!.segments[0]!.departing_at) }} →
              {{ formatTime(offer.slices[0]!.segments[offer.slices[0]!.segments.length - 1]!.arriving_at) }}
            </td>
            <td class="px-4 py-3 text-slate-600">{{ formatDuration(offer.slices[0]!.duration) }}</td>
            <td class="px-4 py-3 font-semibold text-slate-900">{{ formatPrice(offer.total_amount, offer.total_currency) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ offer.owner.name }}</td>
            <td class="px-4 py-3 text-slate-600">
              {{
                offer.slices[0]!.segments.length - 1 === 0
                  ? 'Nonstop'
                  : `${offer.slices[0]!.segments.length - 1} stop${offer.slices[0]!.segments.length - 1 > 1 ? 's' : ''}`
              }}
            </td>
            <td class="px-4 py-3 text-right text-slate-400">{{ expandedIds.has(offer.id) ? '▲' : '▼' }}</td>
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
