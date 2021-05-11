import { createApp } from 'vue'
// import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import './index.css'
import * as Store2 from './store'

let n: number
n = 20
console.log('n: ', n + 10, Store2)

// console.log('store: ', store)
// console.log(store.testString)
// console.log('Store2: ', Store2)
/*
const store = createStore({
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  modules: {
    a: moduleA,
    b: moduleB
  }
})
*/

/* if (module.hot) {
  // 使 action 和 mutation 成为可热重载模块
  module.hot.accept(['./mutations', './modules/a'], () => {
    // 获取更新后的模块
    // 因为 babel 6 的模块编译格式问题，这里需要加上 `.default`
    const newMutations = require('./mutations').default
    const newModuleA = require('./modules/a').default
    // 加载新模块
    store.hotUpdate({
      mutations: newMutations,
      modules: {
        a: newModuleA
      }
    })
  })
} */

const app = createApp(App)

// app.use(router)

app.mount('#app')
