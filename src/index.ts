import { resolve, basename } from 'path'
import type { Plugin, ResolvedConfig, ModuleNode } from 'vite'
import { Route, ResolvedOptions, UserOptions, PageDirOptions, Store } from './types'
import { getFilesFromPath } from './files'
import { generateRoutes, generateStore, generateClientCode, updateRouteFromHMR } from './generate'
import { debug, normalizePath } from './utils'
import { parseVueRequest } from './query'
import { resolveOptions } from './options'

const MODULE_ID = 'vite-plugin-store'

function storePlugin(userOptions: UserOptions = {}): Plugin {
  let config: ResolvedConfig | undefined
  let filesPath: string[] = []

  let generatedRoutes: Route[] | null | undefined
  let generatedStore: Store | null | undefined

  const pagesDirPaths: string[] = []

  const options: ResolvedOptions = resolveOptions(userOptions)

  return {
    name: MODULE_ID,
    enforce: 'pre',
    configResolved(_config) {
      config = _config
      options.root = config.root
    },
    resolveId(id) {
      return MODULE_ID === id ? MODULE_ID : null
    },
    async load(id) {
      if (id === MODULE_ID) {
        if (!generatedRoutes) {
          generatedRoutes = []
          generatedStore = { strict: true }
          filesPath = []

          // pagesDirPaths = []

          const storeDirPath = normalizePath(resolve(options.root, options.storeDir))
          debug.gen('dir: %O', storeDirPath)
          // 相对路径数组
          const files = await getFilesFromPath(storeDirPath, options)
          // filesPath = filesPath.concat(files.map(f => `${storeDirPath}/${f}`))
          debug.gen('files: %O', files)
          // debug.gen('filesPath: %O', filesPath)
          generatedStore = generateStore(files, options.storeDir, options)

          // TODO
        }
        debug.gen('routes: %O', generatedRoutes)

        // TODO 生成code
        const clientCode = generateClientCode(generatedStore!, options)
        // debug.gen('client code: %O', clientCode)

        return clientCode
      }
    },
    async transform(code: string, id: string) {
      const { query } = parseVueRequest(id)

      if (id === 'vite-plugin-store') console.log('code: 开始\n', code, '\n 结束')

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
          const module = moduleGraph.getModuleById(MODULE_ID)
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
