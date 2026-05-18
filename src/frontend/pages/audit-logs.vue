<template><AuditLogBoard /></template>
<script setup lang="ts">
import AuditLogBoard from '@/components/auditLog/AuditLogBoard.vue'
definePageMeta({ roles: ['Admin'] })
</script>
