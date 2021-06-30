import { resolve } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import { ResolvedOptions, UserOptions, ModuleOptions, Store } from './types'
import { getFilesFromPath } from './files'
import { generateOptions, generateClientRoot, updateStoreFromHMR } from './generate'
import { debug, normalizePath } from './utils'
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
        const root = generateClientRoot(moduleOptions, options)
        // return clientCode
        // TODO: 判断是否为开发环境
        return `
          import { createStore } from 'vuex'
          ${root.code}
          const _store = window.store
          if(!window.store){
            console.log('不存在store')
            window.store = createStore(defaultValue)
          }
          export const store = window.store
          if (import.meta.hot) {
            import.meta.hot.accept((newModule) => {
              let newStore = newModule.default
              store.hotUpdate(newStore)
              console.log('updated: count is now ', newStore.modules.account.getters.getAccountInfo())
            })
          }

          export const root = ${JSON.stringify({ ...root, code: '' })}
        `
      }
    },
    // TODO: 热加载太简单了
    async handleHotUpdate({ file, server }) {
      // 热加载
      const isPagesDir = file.startsWith(`${storeDirPath}/`)
      if (isPagesDir) {
        const { moduleGraph } = server
        const module = moduleGraph.getModuleById(MODULE_ID_VIRTUAL)
        debug.hmr('hmr update: %s', file.replace(options.root, ''))
        return [module!]
        // server.ws.send({
        //   type: 'full-reload',
        //   path: `${storeDirPath}/src/sotre/account.ts`,
        // })
        // return []
        // server.ws.send({
        //   type: 'update',
        //   updates: [{
        //     type: 'js-update',
        //     path: '/src/sotre/account.ts',
        //     acceptedPath: '/src/sotre/account.ts',
        //     timestamp: Date.now(),
        //   }],
        // })
        // server.ws.send({
        //   type: 'custom',
        //   event: 'store-update',
        //   data: module,
        // })
        return []
      }
      // const isPagesDir = pagesDirPaths.find(p => file.startsWith(`${p}/`))
      // if (isPagesDir && options.extensionsRE.test(file)) {
      //   let needReload = false

      //   // Handle new file
      //   if (!filesPath.includes(file)) {
      //     generatedRoutes = null
      //     needReload = true
      //   }
      //   else if (generatedRoutes) {
      //     const content = await read()
      //     needReload = updateRouteFromHMR(content, file, generatedRoutes, options)
      //   }

      //   if (needReload) {
      //     const { moduleGraph } = server
      //     const module = moduleGraph.getModuleById(MODULE_ID_VIRTUAL)
      //     if (module)
      //       server.moduleGraph.invalidateModule(module)

      //     debug.hmr('hmr update: %s', file.replace(options.root, ''))

      //     return [module!]
      //   }
      // }
    },
  }
}

export * from './types'
export default storePlugin
