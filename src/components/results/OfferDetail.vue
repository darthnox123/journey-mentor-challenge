<script setup lang="ts">
import { formatDuration, formatMinutes } from '@/utils/duration'
import { formatTime } from '@/utils/date'
import { layoverMinutes } from '@/utils/offer'
import type { Offer, OfferSegment } from '@/types/duffel'

defineProps<{
  offer: Offer
}>()

function baggageSummary(segment: OfferSegment): string | null {
  const baggages = segment.passengers?.[0]?.baggages
  if (!baggages || baggages.length === 0) return null
  return baggages
    .map((bag) => `${bag.quantity}× ${bag.type === 'checked' ? 'checked bag' : 'carry-on'}`)
    .join(' · ')
}
</script>

<template>
  <div class="border-t border-slate-200 bg-slate-50 px-4 py-4">
    <div v-for="(slice, sliceIndex) in offer.slices" :key="slice.id" :class="{ 'mt-4': sliceIndex > 0 }">
      <p v-if="offer.slices.length > 1" class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {{ sliceIndex === 0 ? 'Outbound' : 'Return' }}
      </p>
      <div class="space-y-3">
        <template v-for="(segment, segmentIndex) in slice.segments" :key="segment.id">
          <div class="flex items-center gap-4 text-sm">
            <div class="w-16 shrink-0 font-medium text-slate-800">{{ formatTime(segment.departing_at) }}</div>
            <div class="flex-1">
              <p class="font-medium text-slate-800">
                {{ segment.origin.iata_code }} → {{ segment.destination.iata_code }}
              </p>
              <p class="text-xs text-slate-500">
                {{ segment.marketing_carrier.name }} · Flight {{ segment.marketing_carrier_flight_number }} · {{ formatDuration(segment.duration) }}
              </p>
              <p v-if="baggageSummary(segment)" class="text-xs text-slate-500">{{ baggageSummary(segment) }}</p>
            </div>
            <div class="w-16 shrink-0 text-right font-medium text-slate-800">{{ formatTime(segment.arriving_at) }}</div>
          </div>
          <p
            v-if="segmentIndex < slice.segments.length - 1"
            class="pl-20 text-xs italic text-slate-400"
          >
            Layover in {{ segment.destination.iata_code }} ·
            {{ formatMinutes(layoverMinutes(segment.arriving_at, slice.segments[segmentIndex + 1]!.departing_at)) }}
          </p>
        </template>
      </div>
    </div>

    <div v-if="offer.conditions" class="mt-4 flex flex-wrap gap-2">
      <span
        class="rounded-full px-2 py-1 text-xs font-medium"
        :class="offer.conditions.refund_before_departure?.allowed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
      >
        {{ offer.conditions.refund_before_departure?.allowed ? 'Refundable' : 'Non-refundable' }}
      </span>
      <span
        class="rounded-full px-2 py-1 text-xs font-medium"
        :class="offer.conditions.change_before_departure?.allowed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
      >
        {{ offer.conditions.change_before_departure?.allowed ? 'Changes allowed' : 'No changes allowed' }}
      </span>
    </div>

    <p class="mt-3 text-xs text-slate-400">Offer expires {{ new Date(offer.expires_at).toLocaleString() }}</p>
  </div>
</template>
