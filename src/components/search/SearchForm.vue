<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useSearchStore } from '@/stores/search'
import { validateSearchForm } from '@/utils/validation'
import type { PlaceSuggestion } from '@/types/duffel'
import type { CabinClass } from '@/types/search'
import AutocompleteInput from './AutocompleteInput.vue'
import Select from './Select.vue'
import DateInput from './DateInput.vue'

const store = useSearchStore()

const errors = reactive<Record<string, string>>({})

// Kept local so free typing doesn't write into the URL on every keystroke —
// only picking a suggestion or submitting commits into store.form (and the query params).
const originDraft = ref(store.form.originName)
const destinationDraft = ref(store.form.destinationName)

watch(
  () => store.form.originName,
  (value) => {
    originDraft.value = value
  },
)
watch(
  () => store.form.destinationName,
  (value) => {
    destinationDraft.value = value
  },
)

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

function commitDrafts() {
  if (!originDraft.value) {
    store.form.origin = ''
    store.form.originName = ''
  }
  if (!destinationDraft.value) {
    store.form.destination = ''
    store.form.destinationName = ''
  }
}

async function onSubmit() {
  commitDrafts()
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
        v-model="originDraft"
        label="Origin"
        placeholder="City or airport"
        :error="errors.origin"
        @select="onSelectOrigin"
      />
    </div>
    <div class="lg:col-span-2">
      <AutocompleteInput
        v-model="destinationDraft"
        label="Destination"
        placeholder="City or airport"
        :error="errors.destination"
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
