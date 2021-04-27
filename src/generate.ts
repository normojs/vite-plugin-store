/**
 * https://github.com/brattonross/vite-plugin-voie/blob/main/packages/vite-plugin-voie/src/routes.ts
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/brattonross/vite-plugin-voie/blob/main/LICENSE
 */

import fs from 'fs'
import { join } from 'path'
import deepEqual from 'deep-equal'
import { Route, ResolvedOptions, PageDirOptions, Store, Module, ModuleOptions } from './types'
import { debug, isDynamicRoute, isCatchAllRoute, normalizePath, findRouteByFilename } from './utils'
import { stringifyRoutes } from './stringify'
import { parseCustomBlock, parseSFC } from './parseSfc'

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
export function generateModuleOptions(filesPath: string[], storeDir: string, options: ResolvedOptions): ModuleOptions[] {
  // console.log(filesPath, storeDir, options)
  const {
    extensionsRE,
    root,
  } = options
  const store: Store = { strict: true }

  const moduleOptions: ModuleOptions[] = []
  for (const filePath of filesPath) {
    // 去除后缀
    const resolvedPath = filePath.replace(extensionsRE, '')
    // resolvedPath: 'index' | 'user/index' | 'user/getters' | 'user/mutations'
    const temps = resolvedPath.split('/')
    // 'index' | 'user' | 'user' | 'user'
    const moduleName = temps[0]
    // undefined(module) | 'index' | 'getters' | 'mutations'
    const moduleInType = temps[1] || 'module'
    const componentPath = `/${storeDir}/${filePath}`
    console.log('====:', { resolvedPath, moduleName, moduleInType, componentPath, filePath })
    moduleOptions.push({ root: options.root, resolvedPath, moduleName, moduleInType, componentPath, filePath })
    // 这个是store/index.[js,ts]
    if (moduleName === 'index' && moduleInType === 'module') {
      // TODO  处理store
      // store
      store.name = 'index'
      store.path = componentPath

      // TODO 处理index.ts或index.js
      // TODO 处理ts
      continue
    }

    // TODO 获取module：工作空间、别名

    /*
       TODO
       判断index里是否有getters、mutations、actions等，如果有，则忽略目录下的getters等文件
       以index中为准
    */
    // console.log('====:', resolvedPath, moduleName, moduleInType, componentPath)
  }// end for

  // TODO 处理store：工作空间、严格模式、
  return moduleOptions
}

/**
 * TODO 生成数据
 */
export function generateClientCode(moduleOptions: ModuleOptions[], options: ResolvedOptions) {
  // TODO 根据moduleOptions生成代码

  return `export default ${JSON.stringify(moduleOptions)}`
  // const { imports, stringRoutes } = stringifyRoutes(routes, options)

  // return `${imports.join('\n')}\n\nconst routes = ${stringRoutes}\n\nexport default routes`
}

// =====================================
export function updateRouteFromHMR(content: string, filename: string, routes: Route[], options: ResolvedOptions): boolean {
  const parsed = parseSFC(content)
  const routeBlock = parsed.customBlocks.find(b => b.type === 'route')
  if (routeBlock) {
    const route = findRouteByFilename(routes, filename)

    if (route) {
      const before = Object.assign({}, route)
      const customBlockContent = parseCustomBlock(routeBlock, filename, options)
      debug.hmr('custom block: %O', customBlockContent)
      Object.assign(route, customBlockContent)
      return !deepEqual(before, route)
    }
  }
  return false
}
