export const generateCode = function(root: any) {
  return `
  
  import { createStore } from 'vuex'
  // ================= 生成了store code ==================
  ${root.code}
  export const root = ${JSON.stringify({ ...root, code: '' })}
  // ================= end store code ==================

  /* 热加载 */

  // ================= 公共方法 ==================
  /**
   * 设置generatedStore下modules属性namespaced
   * @params {Object} 生成的store code，即：createStore(store)中的store
   */
  function setModulesNamespaced(moduleRoot) {
    if (!moduleRoot.modules) {
      // 结束回调
      return true
    }
    for (const moduleKey in moduleRoot.modules) {
      const module = moduleRoot.modules[moduleKey]
      if (module.namespaced === undefined) {
        // namespaced 默认值为false|undefined
        module.namespaced = true
      }
      setModulesNamespaced(module)
    }// end for
  }
  // ================= end 公共方法 ==================

  // 判断是否开启全局 namespaced，默认开启全局命名空间
  if (generatedStore.namespaced === true) {
    // 如果全局开启，则添加到模块
    setModulesNamespaced(generatedStore)
  }
  const _store = window.store
  if (!window.store) {
    console.log('不存在store, 创建generatedStore： ', generatedStore)
    window.store = createStore(generatedStore)
  }
  export const store = window.store
  export { generatedStore }

  const loadingTime = Date.now()
  const lastHotTime = loadingTime
  console.log('[vite-plugin-store] loading: ', loadingTime)

  let globalVar = 0

  let hotEvent = null
  if (import.meta.hot) {
    import.meta.hot.on('vite-plugin-store-update', (data) => {
      // TODO: 有时会有两次的更新，做防止抖动
      globalVar++
      // 判断类型
      hotEvent = data
      console.log('通知：自定义---------------------------globalVar', globalVar, loadingTime, data)
    })

    import.meta.hot.accept((newModule) => {
      console.log('操作：accept state update ...hotEvent', hotEvent, loadingTime)
      if (hotEvent) {
        const newStore = newModule.generatedStore
        console.log('newStore ', newStore)
        if (hotEvent.type === 'state') {
          // 设置state
          // TODO: 获取state，然后设置state

          let hotState = null
          // 判断是不是/index.ts
          if (hotEvent.moduleInType === hotEvent.moduleName === 'index') {
            //
            hotState = newStore.state()
          }
          else {
            // moduleName: "user/role/element"
            const subModules = hotEvent.moduleName.split('/')
            // TODO:
          }

          // TODO: 循环更新state： state => state.[user.role.menu].info,

          window.store.hotUpdate(newStore)
        }
        else if (hotEvent.type === 'hot-update') {
          window.store.hotUpdate(newStore)
        }
      }

      // console.log('newStore.modules: ', newModule, newStore)
      // let stateData = newStore.modules.account.state()

      // window.store.commit('account/__init__', stateData)

      // TODO: window.store.commit('account/__init__', stateData)
      /*
        TODO: 在handleHotUpdate方法中自动执行

        判断修改的文件路径，如果是state、index文件
        判断是否更改了state，比较出差异
        如果更改了state，则循环被修改的

        // state.user.role.menu.info
        let diffObj = {...} // 如： {'user/role/menu': {path: 'new path'}}
        window.store.commit('__hot_update_state__', diffObj)

      */
    })// end hot.accept
  }// end if

  // ============================================================

  `
}
