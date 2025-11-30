<script setup>
defineProps({
  msg: {
    type: String,
    required: false,
    default: '',
  },
})
</script>

<template>
  <footer class="app-footer">
    <p class="copyright">
      &copy; MIJERCA Kinshasa 2025. Tous droits réservés.
      <br />
      <span class="d-block mt-1">Prod. by Beyin LQ</span>
    </p>
    <!-- <div class="copyright">© 2025 Beyin LazQuir.</div> -->
  </footer>
</template>

<style scoped>
@media (min-width: 1024px) {
}
</style>
