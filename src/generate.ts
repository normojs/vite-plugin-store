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
  const rootModule: any = { strict: true, moduleOptions, modules: {}, imports: [] }

  const moduleOptionsMap: any = {}
  moduleOptions.forEach((item: ModuleOptions) => {
    moduleOptionsMap[item.moduleName] = item
  })

  const fileSystemTree: any = {
    // 'name': result
  }
  for (const index in moduleOptions) {
    const moduleOption = moduleOptions[index]
    const moduleName: string = moduleOption.moduleName
    if (fileSystemTree[moduleName]) {
      fileSystemTree[moduleName].imports.push(moduleOption)
    }
    else {
      fileSystemTree[moduleName] = { moduleName: moduleOption.moduleName }
      fileSystemTree[moduleName].imports = [moduleOption]
    }
  }// end for

  // 【重点】 保证key的顺序
  const moduleNames = Object.keys(moduleOptionsMap).sort()
  moduleNames.reverse()

  const xx = []
  const xx2 = []
  const xx3 = []

  for (const moduleName of moduleNames) {
    const singleModule = fileSystemTree[moduleName]
    const { moduleInName, imports, modules } = generateSingleModule(singleModule, options)
    xx.push(...imports)
    xx2.push(...modules)
    xx3.push(moduleInName)

    //
    const splitKeys = moduleName.split('/')

    // 上一级module name
    let parentModuleName = ''
    if (splitKeys.length >= 2)
      parentModuleName = splitKeys.join('/')
    // TODO: 如果有parentModule，则不设置
    if (parentModuleName && fileSystemTree[parentModuleName]) {
      // 存在父module，把当前设置到父modules中
      // fileSystemTree[parentModuleName].modules || fileSystemTree[parentModuleName].modules
    }
    else {
      // 不存在父module，即：一级module
      // rootModule.modules
    }
  }

  rootModule.moduleNames = moduleNames
  rootModule.tree = fileSystemTree
  rootModule.xx = xx
  rootModule.xx2 = xx2
  rootModule.xx3 = xx3

  /*
    import _user_actions from 'user/actions'
    import _user_getters from 'user/getters'
    import _user_mutations from 'user/mutations'
    import _user_state from 'user/state'
    import _user_index from 'user/index'
    // 判断是否为空，按需拼接
    let _user_module = {
      ..._user_index,
      state: _user_state,
      mutations: ..._user_mutations,
      getters: ..._user_getters,
      actions: ..._user_actions,
      modules: {...}
    }
    */

  // TODO: 生成全部的code

  // rootModule.xx = moduleOptionsMap

  // const { name, imports } = generateModule(moduleOptionTree, options)

  // console.log('moduleOptions ；', moduleOptions)

  // return `${JSON.stringify(JSON.parse(stringStores).testString.text)}`
  return `export default ${JSON.stringify(rootModule)}`
}

interface ResultSingleModule {
  // 如：'user/role/menu' 取 'menu'
  moduleInName: string
  imports: string[]
  // TODO: 类型
  modules: string[]
  out: any
}

export function generateSingleModule(singleModule: any, options: ResolvedOptions) {
  /*
    import _user_actions from 'user/actions'
    import _user_getters from 'user/getters'
    import _user_mutations from 'user/mutations'
    import _user_state from 'user/state'
    import _user_index from 'user/index'
    // 判断是否为空，按需拼接
    let _user_module = {
      ..._user_index,
      state: _user_state,
      mutations: ..._user_mutations,
      getters: ..._user_getters,
      actions: ..._user_actions,

      modules: {
      'role': _user_role,
      'element': _user_element
      }

    }
  */
  const result: ResultSingleModule = {
    moduleInName: '',
    imports: [],
    modules: [],
    out: {},
  }
  result.moduleInName = singleModule.moduleName.split('/').pop()
  result.out.moduleVariableName = `${moduleName2InName(singleModule.moduleName)}__module`
  result.modules.push(`let _${result.out.moduleVariableName} = {`)

  singleModule.imports.forEach((item: any) => {
    const importName = moduleName2InName(`${item.moduleName}__${item.moduleInType}`)
    if (item.moduleName === 'index')
      result.modules.push(`...${importName},`)

    else if (subStoreExtensions.includes(item.moduleInType))
      result.modules.push(`${item.moduleInType}: ...${importName},`)

    result.imports.push(`import * as ${importName} from '${item.filePath}'`)
  })

  result.modules.push('}')

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
