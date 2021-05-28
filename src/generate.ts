/**
 * https://github.com/brattonross/vite-plugin-voie/blob/main/packages/vite-plugin-voie/src/routes.ts
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/brattonross/vite-plugin-voie/blob/main/LICENSE
 */

import { Route, ResolvedOptions, PageDirOptions, Store, Module, ModuleOptions, PluginOption } from './types'
import { debug, normalizePath } from './utils'
// import { stringifyStores } from './stringify'
// import { parseCustomBlock, parseSFC } from './parseSfc'

const subStoreExtensions = ['index', 'getters', 'actions', 'mutations', 'state']
type ModuleOptionsMap = Record<string, ModuleOptions>
/**
 * TODO 处理文件内容，参考: vite-plugin-components
 * 处理严格模式、工作空间
 * TODO source-map
 *
 * @export
 * @param {string[]} filesPath
 * @param {string} storeDir
 * @param {ResolvedOptions} options
 * @return {*}  {Store}
 */
export function generateOptions(filePaths: string[], storeDir: string, options: ResolvedOptions): {moduleOptions: ModuleOptions[]; pluginOptions: PluginOption[]} {
  // console.log(filesPath, storeDir, options)
  const {
    extensionsRE,
    root,
  } = options

  const moduleOptions: ModuleOptions[] = []
  const map = {}
  const moduleOptionsMap: ModuleOptionsMap = {}

  const pluginOptions: PluginOption[] = []

  for (const filePath of filePaths) {
    // 去除后缀
    const resolvedPath = filePath.replace(extensionsRE, '')
    const componentPath = `/${storeDir}/${filePath}`
    // resolvedPath: 'index' | 'user/index' | 'user/getters' | 'user/mutations'
    const temps = resolvedPath.split('/')

    // temp[0] => 'index' | 'user' | 'user' | 'user'
    let moduleName = temps[0]
    // temp[1] => | 'index' | 'getters' | 'mutations'
    let moduleInType = temps[1] || 'module'

    if (moduleName === 'plugins') {
      // 处理插件
      [moduleName, moduleInType] = [moduleInType, moduleName]
      pluginOptions.push({ resolvedPath, pluginName: moduleName, componentPath, filePath })
      continue
    }
    else if (temps.length > 2) {
      // 处理多级module
      moduleInType = temps.pop() || 'undefined'
      moduleName = temps.join('/') || ''
      if (!subStoreExtensions.includes(moduleInType) || !moduleName) {
        // 如果子模块类型错误，则忽略
        continue
      }
    }

    // moduleOptionsMap

    moduleOptions.push({ root: options.root, resolvedPath, moduleName, moduleInType, componentPath, filePath })
  }// end for

  return { moduleOptions, pluginOptions }
}

/**
 * TODO 生成数据
 */
export function generateClientCode(moduleOptions: ModuleOptions[], options: ResolvedOptions) {
  // TODO: 根据moduleOptions生成代码

  // console.log('moduleOptions ；', moduleOptions)
  const stringStores = stringifyStores(moduleOptions, options)

  // return `${JSON.stringify(JSON.parse(stringStores).testString.text)}`
  return `export default ${stringStores}`
}

/**
 * 创建一个字符串化的Vuex Store定义。
 * Store{}
 * {
 *  strict: true,
 *  state: ...
 *  getters: ...
 *  modules:{
 *
 *  }
 * }
 */
export function stringifyStores(moduleOptions: ModuleOptions[], options: ResolvedOptions) {
  // let result = ''
  const rootModule: any = { strict: true, moduleOptions, modules: {} }
  // const moduleOptionsMap: any = {}
  // moduleOptions.forEach((moduleOption) => {
  //   moduleOptionsMap[moduleOption.resolvedPath] = moduleOption
  // })

  // const resolvedPaths = Object.keys(moduleOptionsMap)

  // TODO: 形成树，循环处理moduleOptions
  const moduleOptionTree = pathsToTree(moduleOptions)
  // rootModule.resolvedPaths = resolvedPaths

  rootModule.tree = moduleOptionTree
  // let module
  // for()

  const { name, imports } = generateModule(moduleOptionTree, options)

  return JSON.stringify(rootModule)
}

export function generateModule(moduleOptionTree: Object[], options: ResolvedOptions) {
  const module = {}
  /*
      import _user_actions from 'user/actions'
      import _user_getters from 'user/getters'
      import _user_mutations from 'user/mutations'
      import _user_state from 'user/state'
      import _user_index from 'user/index'
      // 判断是否为空，按需拼接
      let _user_module = {..._user_index, state: _user_state, mutations: _user_mutations, getters: ..._user_getters, actions: _user_actions}
  */
  const imports = []

  // TODO: 遍历树，从子节点开始生成code
  // 同级 inmodule

  return {
    name: '',
    imports: [],
  }
}

/**
 * 返回数据结构
 * TODO: 方法改名
 * @export
 * @param {string[]} paths
 * @return {*}
 */
export function pathsToTree(moduleOptions: ModuleOptions[]) {
  const moduleOptionsMap: any = {}
  moduleOptions.forEach((moduleOption) => {
    moduleOptionsMap[moduleOption.resolvedPath] = moduleOption
  })

  const result: Object[] = []
  const level = { result }

  Object.keys(moduleOptionsMap).forEach((path) => {
    path.split('/').reduce((r: any, name, i, a) => {
      if (!r[name]) {
        r[name] = { result: [] }
        const module = moduleOptionsMap[path]
        r.result.push({ name, ...module, children: r[name].result })
      }
      return r[name]
    }, level)
  })
  return result
}
// =====================================
export function updateRouteFromHMR(content: string, filename: string, routes: Route[], options: ResolvedOptions): boolean {
  return false
}
