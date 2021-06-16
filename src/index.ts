import { resolve, basename } from 'path'
import type { Plugin, ResolvedConfig, ModuleNode } from 'vite'
import { Route, ResolvedOptions, UserOptions, ModuleOptions, Store } from './types'
import { getFilesFromPath } from './files'
import { generateOptions, generateClientCode, updateRouteFromHMR } from './generate'
import { debug, normalizePath } from './utils'
import { parseVueRequest } from './query'
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
      // debug.gen('config: %O', config)
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
        const clientCode = generateClientCode(moduleOptions, options)
        return clientCode
      }
    },
    generateBundle(_options, bundle) {
      if (options.replaceSquareBrackets) {
        const files = Object.keys(bundle).map(i => basename(i))
        for (const name in bundle) {
          const chunk = bundle[name]
          chunk.fileName = chunk.fileName.replace(/(\[|\])/g, '_')
          if (chunk.type === 'chunk') {
            for (const file of files)
              chunk.code = chunk.code.replace(file, file.replace(/(\[|\])/g, '_'))
          }
        }
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
        //   type: 'custom',
        //   event: 'vite-plugin-store-update',
        //   data: module,
        // })
        // return []
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
