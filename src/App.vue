<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
import SearchForm from '@/components/search/SearchForm.vue';
import ResultsList from '@/components/results/ResultsList.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <AppHeader />
    <main class="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <SearchForm />
      </section>

      <ResultsList />

    </main>
  </div>
</template>
