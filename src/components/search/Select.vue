<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  options: Array<{ value: string | number; label: string }>
  error?: string
}>()

const model = defineModel<string | number>({ required: true })

const selectId = useId()
</script>

<template>
  <div>
    <label :for="selectId" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <select
      :id="selectId"
      v-model="model"
      class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      :class="{ 'border-red-500': error }"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
