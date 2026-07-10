<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  error?: string
}>()

const model = defineModel<string>({ required: true })

const inputId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <input
      :id="inputId"
      v-model="model"
      type="date"
      class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      :class="{ 'border-red-500': error }"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
