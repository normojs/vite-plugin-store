/**
 * https://github.com/brattonross/vite-plugin-voie/blob/main/packages/vite-plugin-voie/src/options.ts
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/brattonross/vite-plugin-voie/blob/main/LICENSE
 */

export type ImportMode = 'sync' | 'async'
export type ImportModeResolveFn = (filepath: string) => ImportMode

export interface Module {
  // 命名空间：默认开启
  namespaced?: boolean
  // 文件名（不包含后缀名），[name].ts
  name: string
  // 别名，默认使用文件名，允许用户自定义
  alias?: string

  state: Function
  mutations: Object
  actions: Object
  getters: Object
}

/**
 *
 *
 *
    const moduleA = {
      namespaced: true,
      state: () => ({ ... }),
      mutations: { ... },
      actions: { ... },
      getters: { ... }
    }
    const store = createStore({
      strict: true,
      modules: {
        a: moduleA,
        b: moduleB
      }
    })
 */
export interface Store {
  // 严格模式： true（默认）|false
  strict: boolean
  plugins?: Function[]
  // 多模块
  modules?: Module[]
  // 命名空间：默认全局开启
  namespaced: boolean
}
export interface StoreDirOptions {
  dir: string
  baseRoute: string
}

export interface Route {
  name?: string
  path: string
  props?: boolean
  component: string
  children?: Route[]
  meta?: Record<string, unknown>
}

export interface PageDirOptions {
  dir: string
  baseRoute: string
}

/**
 * Plugin options.
 */
interface Options {
  /**
   * 状态组件的相对路径
   * Relative path to the directory to search for store components.
   * @default 'src/store'
   */
  storeDir: string | string[] | PageDirOptions[]
  /**
   * Relative path to the directory to search for page components.
   * @default 'src/pages'
   */
  pagesDir: string | string[] | PageDirOptions[]
  /**
   * Valid file extensions for page components.
   * @default ['vue', 'js']
   */
  extensions: string[]
  /**
   * List of path globs to exclude when resolving pages.
   */
  exclude: string[]
  /**
   * Import routes directly or as async components
   * @default 'async'
   */
  importMode: ImportMode | ImportModeResolveFn
  /**
   * Sync load top level index file
   * @default true
   */
  syncIndex: boolean
  /**
   * Use Nuxt.js style dynamic routing
   * @default false
   */
  nuxtStyle: boolean
  /**
   * Set default route block parser, or use `<route lang=xxx>` in SFC route block
   * @default 'json5'
   */
  routeBlockLang: 'json5' | 'json' | 'yaml'
  /**
   * Replace '[]' to '_' in bundle chunk filename
   * Experimental feature
   * @default true
   */
  replaceSquareBrackets: boolean
  /**
   * Extend route records
   */
  extendRoute?: (route: Route, parent: Route | undefined) => Route | void
}

export type UserOptions = Partial<Options>

export interface ResolvedOptions extends Options {
  /**
   * Resolves to the `root` value from Vite config.
   * @default config.root
   */
  root: string
  /**
   * Page Dir as a normalized array of PageDirOptions
   */
  pagesDirOptions: PageDirOptions[]
  /**
   * RegExp to match extensions
   */
  extensionsRE: RegExp
}
