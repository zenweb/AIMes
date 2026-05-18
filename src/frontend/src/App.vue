<template>
  <MainLayout v-if="route.meta.requiresAuth">
    <router-view />
  </MainLayout>
  <router-view v-else />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'

const route = useRoute()
</script>
