<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
  // $(document).ready(function(){
  //     	//-initialize the javascript
  //     	App.init();
  //     	App.mailInbox();
  //     });
</script>

<template>
  <div class="be-content be-no-padding">
         <!-- style="margin: 0 21.6em; width:79%;" -->
        <div class="main-content container-fluid">
          <div class="email-inbox-header">
            <div class="row">
              <div class="col-lg-6">
                <div class="email-title"><span class="icon mdi mdi-inbox"></span> Communication 
                  <span class="new-messages">( tous )</span>  
                </div>
              </div>
              <div class="col-lg-6">
                <div class="email-search">
                  <div class="input-group input-search input-group-sm">
                    <input class="form-control" type="text" placeholder="Search mail..."><span class="input-group-btn">
                      <button class="btn btn-secondary" type="button"><i class="icon mdi mdi-search"></i></button></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="email-filters">
            <div class="email-filters-left">
              <div class="custom-control custom-checkbox be-select-all">
                <input class="custom-control-input" type="checkbox" id="check1">
                <label class="custom-control-label" for="check1"></label>
              </div>
              <div class="btn-group">
                <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" type="button">
                   Plus d'options <span class="caret"></span></button>
                <div class="dropdown-menu" role="menu"><a class="dropdown-item" href="#">Marquer lu</a><a class="dropdown-item" href="#">Marquer non lu</a>
                  <div class="dropdown-divider"></div><a class="dropdown-item" href="#">Delete</a>
                </div>
              </div>
            </div>
            <div class="email-filters-right"><span class="email-pagination-indicator">1-50 à 100</span>
              <div class="btn-group email-pagination-nav">
                <button class="btn btn-secondary" type="button"><i class="mdi mdi-chevron-left"></i></button>
                <button class="btn btn-secondary" type="button"><i class="mdi mdi-chevron-right"></i></button>
              </div>
            </div>
          </div>

          <!-- Listes -->
          <div class="email-list">
            <div class="email-list-item email-list-item--unread">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check2">
                  <label class="custom-control-label" for="check2"></label>
                </div><a class="favorite active" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right"><i class="icon mdi mdi-attachment-alt"></i> 28 Jul</span><span class="from">Penelope Thornton</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item email-list-item--unread">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check3">
                  <label class="custom-control-label" for="check3"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right"></span><span class="date float-right"><i class="icon mdi mdi-attachment-alt"></i> 13 Jul</span><span class="from">Benji Harper</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check4">
                  <label class="custom-control-label" for="check4"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right">23 Jun</span><span class="from">Justine Myranda</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check5">
                  <label class="custom-control-label" for="check5"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right">17 May</span><span class="from">John Doe</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check4">
                  <label class="custom-control-label" for="check4"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right">23 Jun</span><span class="from">Justine Myranda</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check4">
                  <label class="custom-control-label" for="check4"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right">23 Jun</span><span class="from">Justine Myranda</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check6">
                  <label class="custom-control-label" for="check6"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right">16 May</span><span class="from">Sherwood Clifford</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
            <div class="email-list-item">
              <div class="email-list-actions">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" id="check7">
                  <label class="custom-control-label" for="check7"></label>
                </div><a class="favorite" href="#"><span class="mdi mdi-star"></span></a>
              </div>
              <div class="email-list-detail"><span class="date float-right">12 May</span><span class="from">Kristopher Donny</span>
                <p class="msg">Urgent - You forgot your keys in the class room, please come imediatly!</p>
              </div>
            </div>
          </div>
        </div>
      </div>    
</template>