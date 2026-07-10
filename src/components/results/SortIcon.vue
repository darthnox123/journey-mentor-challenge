<script setup lang="ts">
defineProps<{
  direction: 'asc' | 'desc' | null
}>()
</script>

<template>
  <svg
    v-if="direction === 'asc'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-3.5 w-3.5"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
  <svg
    v-else-if="direction === 'desc'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-3.5 w-3.5"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
  <svg v-else viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5">
    <polygon points="12,4 19,11 5,11" />
    <polygon points="12,20 19,13 5,13" />
  </svg>
</template>
