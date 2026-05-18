<template><ReportBoard /></template>
<script setup lang="ts">
import ReportBoard from '@/components/report/ReportBoard.vue'
definePageMeta({ roles: ['Admin', 'Engineer'] })
</script>
