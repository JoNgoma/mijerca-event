<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
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
            <div class="email-head-title">Nouveau communiqué<span class="icon mdi mdi-edit"></span></div>
          </div>
          <div class="email-compose-fields">
            <div class="to">
              <div class="form-group row pt-0">
                <label class="col-md-1 control-label">A :</label>
                <div class="col-md-11">
                  <select class="tags" multiple="">
                    <option value="1" selected="">Yellow</option>
                    <option value="2" selected="">Violet</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="subject">
              <div class="form-group row pt-2">
                <label class="col-md-1 control-label">Objet : </label>
                <div class="col-md-11">
                  <input class="form-control" type="text">
                </div>
              </div>
            </div>
          </div>
          <div class="email editor">
            <div id="email-editor"></div>
            <div class="form-group">
                <button class="btn btn-secondary btn-space" type="button"><i class="icon s7-close"></i> Retour</button>
              <button class="btn btn-primary btn-space" type="submit"><i class="icon s7-mail"></i> Envoyer</button>
            </div>
          </div>
        </div>
      </div>    
</template>