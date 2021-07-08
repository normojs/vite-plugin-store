import { resolve } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import { ResolvedOptions, UserOptions, ModuleOptions, Store } from './types'
import { getFilesFromPath } from './files'
import { generateOptions, generateClientRoot, updateStoreFromHMR } from './generate'
import { debug, normalizePath, slash } from './utils'
import { resolveOptions } from './options'
import { MODULE_IDS, MODULE_ID_VIRTUAL } from './constants'
function storePlugin(userOptions: UserOptions = {}): Plugin {
  let config: ResolvedConfig | undefined
  let moduleOptions: ModuleOptions[]

  let generatedStores: Store[] | null | undefined
  let generatedStore: Store | null | undefined

  // ['account.ts', 'user/actions.ts',]
  let storeFilePaths: string[] = [] // []
  let storeDirPath = '' // 'e://xxx/store'

  const options: ResolvedOptions = resolveOptions(userOptions)

  const lastHotTime = Date.now() // 最后一次修改时间
  const interval = 1000 // 间隔时间
  let generateRoot: { moduleOptions: { [x: string]: any } }
  return {
    name: 'vite-plugin-store',
    enforce: 'pre',
    configResolved(_config) {
      config = _config
      options.root = config.root
      storeDirPath = normalizePath(resolve(options.root, options.storeDir))
    },
    resolveId(id) {
      return MODULE_IDS.includes(id) || MODULE_IDS.some(i => id.startsWith(i))
        ? MODULE_ID_VIRTUAL
        : null
    },
    async load(id) {
      if (id === MODULE_ID_VIRTUAL) {
        if (!generatedStores) {
          generatedStores = []
          generatedStore = { strict: true }

          // 相对路径数组
          storeFilePaths = await getFilesFromPath(storeDirPath, options)
          const storeOptions = generateOptions(storeFilePaths, options.storeDir, options)
          moduleOptions = storeOptions.moduleOptions
          // TODO: 插件
          // pluginOptions = storeOptions.pluginOptions
        }

        // 生成code
        generateRoot = generateClientRoot(moduleOptions, options)
        const root: any = generateRoot
        // return clientCode
        // TODO: 判断是否为开发环境
        /*
          TODO: 原理，在最外层mutations添加一个更新state的方法，更新相应模块的state
          判断是否开启 namespaced
          __init_${modulename}__(state: any, data: any){}

        */
        return `
          import { createStore } from 'vuex'
          // ================= 生成了store code ==================
          ${root.code}
          export const root = ${JSON.stringify({ ...root, code: '' })}
          // ================= end store code ==================

          // ================= 公共方法 ==================
          /**
           * 设置generatedStore下modules属性namespaced
           * @params {Object} 生成的store code，即：createStore(store)中的store
           */
          function setModulesNamespaced(moduleRoot){
            if(!moduleRoot.modules){
              // 结束回调
              return true
            }
            for(let moduleKey in moduleRoot.modules){
              let module = moduleRoot.modules[moduleKey]
              if(module.namespaced === undefined){
                // namespaced 默认值为false|undefined
                module.namespaced = true
              }
              setModulesNamespaced(module)
            }// end for
          }
          // ================= end 公共方法 ==================

          // 判断是否开启全局 namespaced，默认开启全局命名空间
          if(generatedStore.namespaced === true){
            // 如果全局开启，则添加到模块
            setModulesNamespaced(generatedStore)
          }
          const _store = window.store
          if(!window.store){
            console.log('不存在store, 创建generatedStore： ', generatedStore)
            window.store = createStore(generatedStore)
          }
          export const store = window.store
          export {generatedStore};

          let loadingTime = Date.now()
          let lastHotTime = loadingTime
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
              if(hotEvent){
                let newStore = newModule.generatedStore
                console.log('newStore ', newStore)
                if(hotEvent.type == 'state'){
                  // 设置state
                  // TODO: 获取state，然后设置state

                  let hotState = null
                  // 判断是不是/index.ts
                  if(hotEvent.moduleInType === hotEvent.moduleName === 'index'){
                    // 
                    hotState = newStore.state()
                  }else{
                    // moduleName: "user/role/element"
                    let subModules = hotEvent.moduleName.split('/')
                    // TODO: 
                  }

                  // 循环更新state： state => state.[user.role.menu].info,



                  window.store.hotUpdate(newStore)
                }else if(hotEvent.type == 'hot-update'){
                  
                  window.store.hotUpdate(newStore)
                }
              }
              console.log('操作：accept state update ...hotEvent', hotEvent.type, loadingTime)
              
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
    },
    configureServer(server) {
      const { ws, watcher } = server

      // TODO: 删除、添加

      watcher.on('change', (file) => {
        const path = slash(file)
        const isPagesDir = path.startsWith(`${storeDirPath}/`)
        // TODO: 类型定义
        let hotEvent: any = {
          // type: state、full-reload、hot-update
          // type: 'hot-update',
        }
        if (isPagesDir) {
          for (const index in generateRoot.moduleOptions) {
            const moduleOption = generateRoot.moduleOptions[index]
            if (path === moduleOption.fullPath) {
              hotEvent = moduleOption
              break
            }
          } // end for
          // TODO: 防抖动
          if (['index', 'module'].includes(hotEvent.moduleInType)) {
            // 设置 type
            hotEvent.type = 'state'
          }
          else {
            hotEvent.type = 'hot-update'
          }
          server.ws.send({
            type: 'custom',
            event: 'vite-plugin-store-update',
            data: hotEvent,
          })
        }
      })
    },
    async handleHotUpdate(ctx) {
      const { file, server } = ctx
      // 热加载
      const isPagesDir = file.startsWith(`${storeDirPath}/`)
      if (isPagesDir) {
        const { moduleGraph } = server
        const module = moduleGraph.getModuleById(MODULE_ID_VIRTUAL)
        debug.hmr('---- --hmr update: %s', file.replace(options.root, ''))

        // TODO: 判断修改的文件, 如果修改了index文件、或state文件，则全局刷新
        // TODO: v2 如果修改了index文件里的state方法，则全局刷新
        return [module!]
      }
    },
  }
}

export * from './types'
export default storePlugin
