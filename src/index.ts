import { resolve, basename } from 'path'
import type { Plugin, ResolvedConfig, ModuleNode } from 'vite'
import { Route, ResolvedOptions, UserOptions, ModuleOptions, Store } from './types'
import { getFilesFromPath } from './files'
import { generateModuleOptions, generateClientCode, updateRouteFromHMR } from './generate'
import { debug, normalizePath } from './utils'
import { parseVueRequest } from './query'
import { resolveOptions } from './options'
import { MODULE_IDS, MODULE_ID_VIRTUAL } from './constants'

function storePlugin(userOptions: UserOptions = {}): Plugin {
  let config: ResolvedConfig | undefined
  let filesPath: string[] = []

  let moduleOptions: ModuleOptions[]

  let generatedRoutes: Route[] | null | undefined
  let generatedStores: Store[] | null | undefined
  let generatedStore: Store | null | undefined

  const pagesDirPaths: string[] = []

  const options: ResolvedOptions = resolveOptions(userOptions)

  return {
    name: 'vite-plugin-store',
    enforce: 'pre',
    // enforce: 'post',
    configResolved(_config) {
      config = _config
      // debug.gen('config: %O', config)
      options.root = config.root
    },
    resolveId(id) {
      return MODULE_IDS.includes(id) || MODULE_IDS.some(i => id.startsWith(i))
        ? MODULE_ID_VIRTUAL
        : null
    },
    async load(id) {
      // debug.gen('load: %O', id)
      if (id && id.includes('utils/cache'))
        console.log('============:', id)

      if (id === MODULE_ID_VIRTUAL) {
        if (!generatedStores) {
          generatedStores = []
          generatedStore = { strict: true }
          filesPath = []
          const storeDirPath = normalizePath(resolve(options.root, options.storeDir))
          // 相对路径数组
          const files = await getFilesFromPath(storeDirPath, options)
          moduleOptions = generateModuleOptions(files, options.storeDir, options)
        }

        // TODO: 生成code
        const clientCode = generateClientCode(moduleOptions, options)

        return clientCode
      }
    },
    async transform(code: string, id: string) {
      const { query } = parseVueRequest(id)

      // if (id === 'vite-plugin-store')
      debug.transform('id: %O', id)
      const s = 'App.vue'
      if (id.endsWith(s))
        console.log(`code: ${s} \n`, code, '\n\n')
      // console.log('dd', id)

      // return null

      if (query && query.vue && query.type === 'route') {
        return {
          code: 'export default {}',
          map: null,
        }
      }
      return {
        code,
        // TODO source-map
        map: null,
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
    async handleHotUpdate({ file, server, read }) {
      // TODO 热加载
      const isPagesDir = pagesDirPaths.find(p => file.startsWith(`${p}/`))
      // 是pages下的文件更新，且，
      // Handle pages HMR
      if (isPagesDir && options.extensionsRE.test(file)) {
        let needReload = false

        // Handle new file
        if (!filesPath.includes(file)) {
          generatedRoutes = null
          needReload = true
        }
        else if (generatedRoutes) {
          const content = await read()
          needReload = updateRouteFromHMR(content, file, generatedRoutes, options)
        }

        if (needReload) {
          const { moduleGraph } = server
          const module = moduleGraph.getModuleById(MODULE_ID_VIRTUAL)
          if (module)
            server.moduleGraph.invalidateModule(module)

          debug.hmr('hmr update: %s', file.replace(options.root, ''))

          return [module!]
        }
      }
    },
  }
}

export * from './types'
export default storePlugin
