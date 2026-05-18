<template>
  <MainLayout v-if="requiresAuth">
    <NuxtPage />
  </MainLayout>
  <NuxtPage v-else />
</template>

<script setup lang="ts">
import MainLayout from './src/components/layout/MainLayout.vue'

const route = useRoute()
const requiresAuth = computed(() => route.meta.requiresAuth !== false)
</script>
