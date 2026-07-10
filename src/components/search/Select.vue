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
      class="field-input"
      :class="{ 'field-input--error': error }"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
