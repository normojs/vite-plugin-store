import { createApp } from 'vue'
// import { createRouter, createWebHistory } from 'vue-router'
import store from 'vite-plugin-store'
import App from './App.vue'
import './index.css'
import * as Store2 from './store'

console.log('store: ', store)
console.log('Store2: ', Store2)

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// })

const app = createApp(App)

// app.use(router)

app.mount('#app')
