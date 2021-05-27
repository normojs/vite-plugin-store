/**
 * https://github.com/brattonross/vite-plugin-voie/blob/main/packages/vite-plugin-voie/src/routes.ts
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/brattonross/vite-plugin-voie/blob/main/LICENSE
 */

import { Route, ResolvedOptions, PageDirOptions, Store, Module, ModuleOptions } from './types'
import { debug, normalizePath, pathsToTree } from './utils'
import { stringifyStores } from './stringify'
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
export function generateModuleOptions(filePaths: string[], storeDir: string, options: ResolvedOptions): ModuleOptions[] {
  // console.log(filesPath, storeDir, options)
  const {
    extensionsRE,
    root,
  } = options

  const moduleOptions: ModuleOptions[] = []
  const map = {}
  const moduleOptionsMap: ModuleOptionsMap = {}

  for (const filePath of filePaths) {
    // 去除后缀
    const resolvedPath = filePath.replace(extensionsRE, '')
    // resolvedPath: 'index' | 'user/index' | 'user/getters' | 'user/mutations'
    const temps = resolvedPath.split('/')

    // temp[0] => 'index' | 'user' | 'user' | 'user'
    let moduleName = temps[0]
    // temp[1] => | 'index' | 'getters' | 'mutations'
    let moduleInType = temps[1] || 'module'

    if (moduleName === 'plugins') {
      // 处理插件
      [moduleName, moduleInType] = [moduleInType, moduleName]
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
    const componentPath = `/${storeDir}/${filePath}`
    // moduleOptionsMap

    moduleOptions.push({ root: options.root, resolvedPath, moduleName, moduleInType, componentPath, filePath })
  }// end for

  return moduleOptions
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

// =====================================
export function updateRouteFromHMR(content: string, filename: string, routes: Route[], options: ResolvedOptions): boolean {
  return false
}
