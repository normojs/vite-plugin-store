/**
 * https://github.com/brattonross/vite-plugin-voie/blob/main/packages/vite-plugin-voie/src/routes.ts
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/brattonross/vite-plugin-voie/blob/main/LICENSE
 */

// TODO: https://www.npmjs.com/package/array-starts-with
// https://github.com/tunnckocore/starts-with
import { Route, ResolvedOptions, PageDirOptions, Store, Module, ModuleOptions, PluginOption } from './types'
import { debug, normalizePath, moduleName2InName } from './utils'
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
    else if (temps.length === 1 && subStoreExtensions.includes(temps[0])) {
      // store/[actions, getters]
      moduleInType = moduleName
      moduleName = 'index'
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
export function generateClientCode(moduleOptions: ModuleOptions[], options: ResolvedOptions) {
  const root: any = { moduleOptions, modules: {} }

  const moduleOptionTree: any = {
    // 'name': result
  }
  for (const index in moduleOptions) {
    const moduleOption = moduleOptions[index]
    const moduleName: string = moduleOption.moduleName
    if (moduleOptionTree[moduleName]) {
      moduleOptionTree[moduleName].imports.push(moduleOption)
    }
    else {
      moduleOptionTree[moduleName] = { moduleName: moduleOption.moduleName }
      moduleOptionTree[moduleName].imports = [moduleOption]
    }
  }// end for(moduleOptions)

  // 确保moduleName的顺序为倒叙，先处理 sub module
  const moduleNames = Object.keys(moduleOptionTree).sort()
  moduleNames.reverse()

  for (const moduleName of moduleNames) {
    if (!root.modules[moduleName]) {
      root.modules[moduleName] = {
        imports: [],
        variables: [],
        inmodules: [],
      }
    }// end if

    const singleModule = moduleOptionTree[moduleName]
    const { moduleInName, imports, variables, out } = generateSingleModule(singleModule, options)
    root.modules[moduleName].variableName = out.variableName
    root.modules[moduleName].moduleInName = moduleInName
    root.modules[moduleName].imports.push(...imports)
    root.modules[moduleName].variables.push(...variables)
    const splitKeys = moduleName.split('/')

    if (splitKeys.length >= 2) {
      splitKeys.pop()
      // 上一级module name
      const parentModuleName = splitKeys.join('/')
      if (!root.modules[parentModuleName]) {
        root.modules[parentModuleName] = {
          imports: [],
          variables: [],
          inmodules: [],
        }
      }// end if

      root.modules[parentModuleName].inmodules.push(`${moduleInName}: ${out.variableName}`)
    }// end if
  }// end for(moduleNames)

  // TODO: 生成code

  root.moduleNames = moduleNames
  root.tree = moduleOptionTree

  return `export default ${JSON.stringify(root)}`
}

interface ResultSingleModule {
  // 如：'user/role/menu' 取 'menu'
  moduleInName: string
  imports: string[]
  variables: string[]
  out: any
}
const storeExtensions = ['getters', 'actions', 'mutations', 'state']
export function generateSingleModule(singleModule: any, options: ResolvedOptions) {
  const result: ResultSingleModule = {
    moduleInName: '',
    imports: [],
    variables: [],
    out: {},
  }
  result.moduleInName = singleModule.moduleName.split('/').pop()
  result.out.variableName = `${moduleName2InName(singleModule.moduleName)}__module`

  // === start variables
  result.variables.push(`let _${result.out.variableName} = {`)
  singleModule.imports.forEach((item: any) => {
    const importName = moduleName2InName(`${item.moduleName}__${item.moduleInType}`)
    // item.moduleName === 'index' ||
    if (item.moduleInType === 'index')
      result.variables.push(`...${importName},`)

    // else if (storeExtensions.includes(item.moduleInType))
    else
      result.variables.push(`${item.moduleInType}: ...${importName},`)

    result.imports.push(`import * as ${importName} from '${item.filePath}'`)
  })
  result.variables.push('}')
  if (result.variables.length === 2)
    result.variables = []
  // === end variables

  return result
}

/**
 * 返回数据结构
 * TODO: 方法改名
 * @export
 * @param {string[]} paths
 * @return {*}
 * @deprecated
 */
export function pathsToTree(moduleOptions: ModuleOptions[]) {
  const moduleOptionsMap: any = {}
  moduleOptions.forEach((moduleOption) => {
    moduleOptionsMap[moduleOption.resolvedPath] = moduleOption
  })

  const result: Object[] = []
  const level = { result }
  // const subTreeMap = {}

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
