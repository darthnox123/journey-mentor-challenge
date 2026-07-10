<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 py-16 text-center">
    <p class="text-sm font-medium text-red-700">{{ message }}</p>
    <button
      type="button"
      class="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-500"
      @click="emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
