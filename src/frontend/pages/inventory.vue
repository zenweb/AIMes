<template><InventoryBoard /></template>
<script setup lang="ts">
import InventoryBoard from '@/components/inventory/InventoryBoard.vue'
definePageMeta({ roles: ['Admin', 'Engineer'] })
</script>
