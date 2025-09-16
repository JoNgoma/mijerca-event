<script setup>
import { RouterView } from 'vue-router';



defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
    <RouterView />
</template>

<style scoped>

</style>
