<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  error?: string
  required?: boolean
}>()

const model = defineModel<string>({ required: true })

const inputId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }}<span v-if="required" class="text-red-500" aria-hidden="true"> *</span>
    </label>
    <input
      :id="inputId"
      v-model.lazy="model"
      type="date"
      :aria-required="required"
      class="field-input"
      :class="{ 'field-input--error': error }"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
