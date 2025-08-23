<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `Nouveau communiqué - ${currentService.value.name}`;
});

const backRoute = computed(() => {
  return {
    name: 'list',
    params: { serviceType: currentServiceType.value }
  };
});

$(document).ready(function(){
  //-initialize the javascript
  App.init();
  App.mailCompose();
});
</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="email-head">
        <div class="email-head-title">
          {{ pageTitle }}
          <span class="icon mdi mdi-edit"></span>
        </div>
      </div>
      
      <!-- ... existing code ... -->
      
      <div class="email editor">
        <div id="email-editor"></div>
        <div class="form-group">
          <router-link :to="backRoute" class="btn btn-secondary btn-space">
            <i class="icon s7-close"></i> Retour
          </router-link>
          <button class="btn btn-primary btn-space" type="submit">
            <i class="icon s7-mail"></i> Envoyer
          </button>
        </div>
      </div>
    </div>
  </div>    
</template>