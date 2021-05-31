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
    else if(temps.length == 1 && subStoreExtensions.includes(temps[0])){
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
  const rootModule: any = { strict: true, moduleOptions, imports: [], modules: {} }

  const fileSystemTree: any = {
    // 'name': result
  }
  const moduleOptionsMap: any = {}
  moduleOptions.map((item: ModuleOptions)=>{
    moduleOptionsMap[item.moduleName] = item
  })
  // 保证key的顺序
  let keys = Object.keys(moduleOptionsMap).sort()

  for(let key of keys){
    let moduleOption = moduleOptionsMap[key]
    if(fileSystemTree[moduleOption.moduleName]){
      fileSystemTree[moduleOption.moduleName].imports.push(moduleOption)
    }else{
      // TODO: modules
      fileSystemTree[moduleOption.moduleName] = {}
      fileSystemTree[moduleOption.moduleName].imports = [moduleOption]
    }
  }

  rootModule.keys = keys
  rootModule.tree = fileSystemTree

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

export function generateModule(fileSystemTree: any[], options: ResolvedOptions) {
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
 const imports = []
 let module = {}
//  const modules = {name: imports: [], modules: []}
const results = {
  // 'name': result
}
  const result = {
    name: '',
    imports: [],
    modules: []
  }

  // TODO: 遍历树，从子节点开始生成code
  // 同级 inmodule


  return result
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
