import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast, { POSITION } from 'vue-toastification'
import "vue-toastification/dist/index.css"


const app = createApp(App)

app.use(router)

app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 4000, // 3 secondes
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
})

app.mount('#app')

