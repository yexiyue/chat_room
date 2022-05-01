import { createApp } from 'vue'
import App from './App.vue'
import {createPinia} from 'pinia'
import router from './router/router'

const pinia=createPinia()
const app=createApp(App)
declare module '@vue/runtime-core'{
  export interface ComponentCustomProperties{
    $fetch:typeof fetch
  }
}

app.use(pinia)
app.use(router)
app.mount('#app')
