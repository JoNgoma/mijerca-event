<script setup>
import { useRouter } from 'vue-router'

// Import des images
import logo from "/assets/img/mijerca.jpg"
import avatar from "/assets/img/avatar.png"
import avatar2 from "/assets/img/avatar2.png"
import avatar3 from "/assets/img/avatar3.png"
import avatar4 from "/assets/img/avatar4.png"
import avatar5 from "/assets/img/avatar5.png"
import github from "/assets/img/github.png"
import bitbucket from "/assets/img/bitbucket.png"
import slack from "/assets/img/slack.png"
import dribbble from "/assets/img/dribbble.png"
import mailchimp from "/assets/img/mail_chimp.png"
import dropbox from "/assets/img/dropbox.png"

const router = useRouter()

const { userData } = defineProps({
  userData: {
    type: Object,
    required: true,
    default: () => ({
      firstName: '',
      name: '',
      email: ''
    })
  }
})

function logout() {
  localStorage.removeItem('token')
  router.push('/sign-in')
}
</script>

<template>
  <nav class="navbar navbar-expand fixed-top be-top-header">
    <div class="container-fluid">
      <div class="be-navbar-header"><a class="navbar-brand d-none d-md-flex align-items-center" href="#">
          <img class="d-none d-md-block" :src="logo" alt="logo"/>
          <span class="fw-bold bg-white d-none d-md-block" style="font-size: 1.7rem; letter-spacing: 1.5px; padding-left: .5em">
            MIJERCA
          </span>
        </a>
      </div>
      <a class="be-toggle-top-header-menu collapsed" href="#" data-toggle="collapse" aria-expanded="false" data-target="#be-navbar-collapse">Top Menu</a>
      <div class="navbar-collapse collapse" id="be-navbar-collapse">
        <!-- Slot dynamique pour le contenu de navigation -->
        <slot name="navigation">
          <!-- Contenu par défaut si aucun slot n'est fourni -->
          <ul class="navbar-nav">
            <li class="nav-item"><router-link :to="{ name: 'dashboard' }" class="nav-link">Accueil</router-link></li>
          </ul>
        </slot>
      </div>

      <div class="be-right-navbar">
        <!-- ... existing code ... -->
        <ul class="nav navbar-nav float-right be-user-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false">
              <img :src="avatar" alt="Avatar">
              <span class="user-name">{{ userData.firstName || "Utilisateur" }}</span>
            </a>
            <div class="dropdown-menu" role="menu">     
              <div class="user-info">
                <div class="user-name">{{ userData.firstName }} {{ userData.name }}</div>
                <div class="user-position online">Available</div>
              </div>
              <a class="dropdown-item" href="#"><span class="icon mdi mdi-face"></span> Account</a>
              <a class="dropdown-item" href="#"><span class="icon mdi mdi-settings"></span> Settings</a>
              <a class="dropdown-item" href="#" @click.prevent="logout"><span class="icon mdi mdi-power"></span> Logout</a>
            </div>
          </li>
        </ul>

        <ul class="nav navbar-nav float-right be-icons-nav">
          <li class="nav-item">
            <a class="nav-link be-toggle-right-sidebar" href="#"><span class="icon mdi mdi-settings"></span></a>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false">
              <span class="icon mdi mdi-notifications"></span>
              <span class="indicator"></span>
            </a>
            <ul class="dropdown-menu be-notifications">
              <li>
                <div class="title">Notifications <span class="badge badge-pill">3</span></div>
                <div class="list">
                  <div class="be-scroller-notifications">
                    <div class="content">
                      <ul>
                        <li class="notification notification-unread">
                          <a href="#">
                            <div class="image"><img :src="avatar2" alt="Avatar"></div>
                            <div class="notification-info">
                              <div class="text"><span class="user-name">Jessica Caruso</span> accepted your invitation.</div>
                              <span class="date">2 min ago</span>
                            </div>
                          </a>
                        </li>
                        <li class="notification">
                          <a href="#">
                            <div class="image"><img :src="avatar3" alt="Avatar"></div>
                            <div class="notification-info">
                              <div class="text"><span class="user-name">Joel King</span> is now following you</div>
                              <span class="date">2 days ago</span>
                            </div>
                          </a>
                        </li>
                        <li class="notification">
                          <a href="#">
                            <div class="image"><img :src="avatar4" alt="Avatar"></div>
                            <div class="notification-info">
                              <div class="text"><span class="user-name">John Doe</span> is watching your repo</div>
                              <span class="date">2 days ago</span>
                            </div>
                          </a>
                        </li>
                        <li class="notification">
                          <a href="#">
                            <div class="image"><img :src="avatar5" alt="Avatar"></div>
                            <div class="notification-info">
                              <span class="text"><span class="user-name">Emily Carter</span> is now following you</span>
                              <span class="date">5 days ago</span>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="footer"><a href="#">View all notifications</a></div>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false">
              <span class="icon mdi mdi-apps"></span>
            </a>
            <ul class="dropdown-menu be-connections">
              <li>
                <div class="list">
                  <div class="content">
                    <div class="row">
                      <div class="col"><a class="connection-item" href="#"><img :src="github" alt="Github"><span>GitHub</span></a></div>
                      <div class="col"><a class="connection-item" href="#"><img :src="bitbucket" alt="Bitbucket"><span>Bitbucket</span></a></div>
                      <div class="col"><a class="connection-item" href="#"><img :src="slack" alt="Slack"><span>Slack</span></a></div>
                    </div>
                    <div class="row">
                      <div class="col"><a class="connection-item" href="#"><img :src="dribbble" alt="Dribbble"><span>Dribbble</span></a></div>
                      <div class="col"><a class="connection-item" href="#"><img :src="mailchimp" alt="Mailchimp"><span>Mail Chimp</span></a></div>
                      <div class="col"><a class="connection-item" href="#"><img :src="dropbox" alt="Dropbox"><span>Dropbox</span></a></div>
                    </div>
                  </div>
                </div>
                <div class="footer"><a href="#">More</a></div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar-brand img {
  max-height: 40px;
}
</style>
