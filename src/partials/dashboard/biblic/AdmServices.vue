<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceContext } from '@/composables/useServiceContext';

const router = useRouter();
const { currentService, currentServiceType } = useServiceContext();

const pageTitle = computed(() => {
  return `${currentService.value.name}`;
});

</script>

<template>
  <div class="be-content be-no-padding">
    <div class="main-content container-fluid">
      <div class="email-inbox-header">
        <div class="row">
          <div class="col-lg-6">
            <div class="email-title">
              <span class="icon mdi mdi-inbox"></span> {{ pageTitle }}
            </div>
          </div>
          <div class="col-lg-6">
            <div class="email-search">
              <div class="input-group input-search input-group-sm">
                <input class="form-control" type="text" placeholder="Search mail...">
                <span class="input-group-btn">
                  <button class="btn btn-secondary" type="button">
                    <i class="icon mdi mdi-search"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton pour nouveau communiqué -->
      <div class="email-filters">
        <div class="email-filters-left">
          <!-- <router-link :to="composeRoute" class="btn btn-primary">
            <i class="icon mdi mdi-plus"></i> Nouveau communiqué
          </router-link> -->
          
          <!-- ... existing code ... -->
          
        </div>
        
        <!-- ... existing code ... -->
        
      </div>

      <!-- ... existing code ... -->
      
    </div>
  </div>    
</template>