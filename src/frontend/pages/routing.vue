<template><RoutingBoard /></template>
<script setup lang="ts">
import RoutingBoard from '@/components/routing/RoutingBoard.vue'
definePageMeta({ roles: ['Admin', 'Engineer'] })
</script>
