<script setup lang="ts">
import { reactive } from 'vue'
import { useSearchStore } from '@/stores/search'
import { validateSearchForm } from '@/utils/validation'
import type { PlaceSuggestion } from '@/types/duffel'
import type { CabinClass } from '@/types/search'
import AutocompleteInput from './AutocompleteInput.vue'
import Select from './Select.vue'
import DateInput from './DateInput.vue'

const store = useSearchStore()

const errors = reactive<Record<string, string>>({})

const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}))

const cabinClassOptions: Array<{ value: CabinClass; label: string }> = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
]

function onSelectOrigin(place: PlaceSuggestion) {
  store.form.origin = place.iata_code
  store.form.originName = place.city_name ?? place.name
}

function onSelectDestination(place: PlaceSuggestion) {
  store.form.destination = place.iata_code
  store.form.destinationName = place.city_name ?? place.name
}

function onOriginText(value: string) {
  store.form.originName = value
  if (!value) store.form.origin = ''
}

function onDestinationText(value: string) {
  store.form.destinationName = value
  if (!value) store.form.destination = ''
}

async function onSubmit() {
  const result = validateSearchForm(store.form)
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.assign(errors, result.errors)
  if (!result.valid) return
  await store.search()
}
</script>

<template>
  <form class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6" @submit.prevent="onSubmit">
    <div class="lg:col-span-2">
      <AutocompleteInput
        label="Origin"
        placeholder="City or airport"
        :model-value="store.form.originName"
        :error="errors.origin"
        @update:model-value="onOriginText"
        @select="onSelectOrigin"
      />
    </div>
    <div class="lg:col-span-2">
      <AutocompleteInput
        label="Destination"
        placeholder="City or airport"
        :model-value="store.form.destinationName"
        :error="errors.destination"
        @update:model-value="onDestinationText"
        @select="onSelectDestination"
      />
    </div>
    <div>
      <DateInput v-model="store.form.departureDate" label="Departure date" :error="errors.departureDate" />
    </div>
    <div>
      <Select
        v-model="store.form.passengers"
        label="Passengers"
        :options="passengerOptions"
        :error="errors.passengers"
      />
    </div>

    <div class="lg:col-span-2">
      <Select v-model="store.form.cabinClass" label="Cabin class" :options="cabinClassOptions" />
    </div>
    <div class="flex items-end lg:col-span-4">
      <button
        type="submit"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="store.status === 'loading'"
      >
        {{ store.status === 'loading' ? 'Searching…' : 'Search flights' }}
      </button>
    </div>
  </form>
</template>
