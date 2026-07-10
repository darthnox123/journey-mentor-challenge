<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { formatDateLabel } from '@/utils/date'

const store = useSearchStore()

function shift(deltaDays: number) {
  store.shiftDateWindow(deltaDays)
}
</script>

<template>
  <div class="flex items-center justify-center gap-4">
    <button
      type="button"
      class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="store.status === 'loading'"
      @click="shift(-1)"
    >
      ← Previous day
    </button>
    <span class="text-sm font-medium text-slate-600">{{ formatDateLabel(store.form.departureDate) }}</span>
    <button
      type="button"
      class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="store.status === 'loading'"
      @click="shift(1)"
    >
      Next day →
    </button>
  </div>
</template>
