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
        <div class="main-content container-fluid">
          <div class="email-head">
            <div class="email-head-subject">
              <div class="title"><a class="active" href="#"><span class="icon mdi mdi-star"></span></a> <span>Communiqué du diocèse</span> 
                <div class="icons"><a href="#"><i class="icon mdi mdi-mail-reply"></i></a><a href="#"><i class="icon mdi mdi-print"></i></a><a href="#"><i class="icon mdi mdi-delete"></i></a></div>
              </div>
            </div>
            <div class="email-head-sender">
              <div class="date">August 23, 3:37</div>
              <div class="avatar"><img src="/assets/img/avatar3.png" alt="Avatar"></div>
              <div class="sender"><a href="#">Justine Myranda</a> to <a href="#">me</a>
                <div class="actions"><a class="icon toggle-dropdown" href="#" data-toggle="dropdown"><i class="mdi mdi-caret-down"></i></a>
                  <div class="dropdown-menu" role="menu"><a class="dropdown-item" href="#">Mark as read</a><a class="dropdown-item" href="#">Mark as unread</a>
                    <div class="dropdown-divider"></div><a class="dropdown-item" href="#">Delete</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="email-body">
            <p>Hello,</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
            <p>Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna.</p>
            <p>Regards,<br> Justine Myranda</p>
          </div>
          <div class="email-attachments">
            <div class="title">Attachments <span>(2 files, 16,24 KB)</span></div>
            <ul>
              <li><a href="#"><span class="icon mdi mdi-attachment-alt"></span> new-release.zip <span>(5.12 KB)</span></a></li>
              <li><a href="#"><span class="icon mdi mdi-attachment-alt"></span> guidelines.pdf <span>(11.3 MB)</span></a></li>
            </ul>
          </div>
        </div>
      </div>
</template>