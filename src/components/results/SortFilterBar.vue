<script setup lang="ts">
import { computed, useId } from 'vue'
import { useSearchStore } from '@/stores/search'
import type { StopFilter } from '@/types/search'
import Select from '@/components/search/Select.vue'

const store = useSearchStore()

const afterId = useId()
const beforeId = useId()

const stopOptions: Array<{ value: StopFilter; label: string }> = [
  { value: 'any', label: 'Any stops' },
  { value: 'nonstop', label: 'Nonstop' },
  { value: 'one_stop', label: '1 stop' },
]

const airlineOptions = computed(() => [
  { value: '', label: 'All airlines' },
  ...store.availableAirlines.map((name) => ({ value: name, label: name })),
])

const airlineFilter = computed({
  get: () => store.filters.airline ?? '',
  set: (value: string) => store.setFilters({ airline: value || null }),
})

const stopsFilter = computed({
  get: () => store.filters.stops,
  set: (value: StopFilter) => store.setFilters({ stops: value }),
})

function onDepartureAfter(event: Event) {
  store.setFilters({ departureAfter: (event.target as HTMLInputElement).value || null })
}

function onDepartureBefore(event: Event) {
  store.setFilters({ departureBefore: (event.target as HTMLInputElement).value || null })
}
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
    <div class="flex flex-wrap items-end gap-4">
      <div class="w-40">
        <Select v-model="stopsFilter" label="Stops" :options="stopOptions" />
      </div>
      <div class="w-48">
        <Select v-model="airlineFilter" label="Airline" :options="airlineOptions" />
      </div>
      <div class="w-32">
        <label :for="afterId" class="mb-1 block text-xs font-medium text-slate-600">Departs after</label>
        <input
          :id="afterId"
          type="time"
          :value="store.filters.departureAfter ?? ''"
          class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          @change="onDepartureAfter"
        />
      </div>
      <div class="w-32">
        <label :for="beforeId" class="mb-1 block text-xs font-medium text-slate-600">Departs before</label>
        <input
          :id="beforeId"
          type="time"
          :value="store.filters.departureBefore ?? ''"
          class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          @change="onDepartureBefore"
        />
      </div>
    </div>
    <p class="text-xs font-medium text-slate-400">{{ store.sortedFilteredOffers.length }} of {{ store.offers.length }} offers</p>
  </div>
</template>
