<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import SortFilterBar from './SortFilterBar.vue'
import OffersTable from './OffersTable.vue'
import LoadingState from './LoadingState.vue'
import EmptyState from './EmptyState.vue'
import ErrorState from './ErrorState.vue'

const store = useSearchStore()
</script>

<template>
  <div class="space-y-4">
    <SortFilterBar v-if="store.status !== 'idle'" />
    <LoadingState v-if="store.status === 'loading'" />
    <ErrorState v-else-if="store.status === 'error'" :message="store.error ?? 'Something went wrong.'" @retry="store.search()" />
    <EmptyState v-else-if="store.status === 'empty'" />
    <OffersTable v-else-if="store.status === 'success'" />
  </div>
</template>
