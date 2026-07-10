<script setup lang="ts">
import { ref, useId } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { usePlaceAutocomplete } from '@/composables/usePlaceAutocomplete'
import type { PlaceSuggestion } from '@/types/duffel'

defineProps<{
  label: string
  placeholder: string
  error?: string
}>()

const model = defineModel<string>({ required: true })

const emit = defineEmits<{
  select: [place: PlaceSuggestion]
}>()

const inputId = useId()
const { suggestions, isLoading, search, clear } = usePlaceAutocomplete()
const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

onClickOutside(rootRef, () => {
  isOpen.value = false
})

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  model.value = value
  isOpen.value = true
  search(value)
}

function onSelect(place: PlaceSuggestion) {
  model.value = place.city_name ? `${place.city_name} (${place.iata_code})` : `${place.name} (${place.iata_code})`
  emit('select', place)
  isOpen.value = false
  clear()
}

function onFocus() {
  if (suggestions.value.length > 0) isOpen.value = true
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <label :for="inputId" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <input
      :id="inputId"
      :value="model"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      class="field-input"
      :class="{ 'field-input--error': error }"
      @input="onInput"
      @focus="onFocus"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>

    <ul
      v-if="isOpen && (suggestions.length > 0 || isLoading)"
      class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
    >
      <li v-if="isLoading" class="px-3 py-2 text-sm text-slate-400">Searching…</li>
      <li
        v-for="place in suggestions"
        :key="place.id"
        class="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
        @click="onSelect(place)"
      >
        <span class="font-medium text-slate-800">{{ place.city_name ?? place.name }}</span>
        <span class="ml-1 text-slate-400">({{ place.iata_code }})</span>
        <span v-if="place.city_name && place.type === 'airport'" class="block text-xs text-slate-400">{{ place.name }}</span>
      </li>
    </ul>
  </div>
</template>
