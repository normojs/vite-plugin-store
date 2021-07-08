import { createApp } from 'vue'

import App from './App.vue'
import './index.css'
// import { createRouter, createWebHistory } from 'vue-router'

import { createStore } from 'vuex'
import { root, store } from 'virtual:generated-store'
console.log('root: ', root)
// // import store from './store/index.index'
// const store_1 = createStore(storeConfig)

const app = createApp(App)
app.use(store)

app.mount('#app')
