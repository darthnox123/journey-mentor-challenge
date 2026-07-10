<script setup lang="ts">
import { formatDuration } from '@/utils/duration'
import { formatTime } from '@/utils/date'
import type { Offer } from '@/types/duffel'

defineProps<{
  offer: Offer
}>()
</script>

<template>
  <div class="border-t border-slate-200 bg-slate-50 px-4 py-4">
    <div v-for="slice in offer.slices" :key="slice.id" class="space-y-3">
      <div v-for="segment in slice.segments" :key="segment.id" class="flex items-center gap-4 text-sm">
        <div class="w-16 shrink-0 font-medium text-slate-800">{{ formatTime(segment.departing_at) }}</div>
        <div class="flex-1">
          <p class="font-medium text-slate-800">
            {{ segment.origin.iata_code }} → {{ segment.destination.iata_code }}
          </p>
          <p class="text-xs text-slate-500">
            {{ segment.marketing_carrier.name }} · Flight {{ segment.marketing_carrier_flight_number }} · {{ formatDuration(segment.duration) }}
          </p>
        </div>
        <div class="w-16 shrink-0 text-right font-medium text-slate-800">{{ formatTime(segment.arriving_at) }}</div>
      </div>
    </div>
    <p class="mt-3 text-xs text-slate-400">Offer expires {{ new Date(offer.expires_at).toLocaleString() }}</p>
  </div>
</template>
