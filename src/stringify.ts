import {
  resolveImportMode,
  pathToName,
  pathsToTree,
} from './utils'
import { ResolvedOptions, ModuleOptions, Route } from './types'
import { buildModule, transformModule } from './build'
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

  //

  for (const i in moduleOptions) {
    /*
      TODO: 处理每个模块：返回
      1、

    */
    const { name, imports } = generateModule(moduleOptions[i], options)
    rootModule.modules[name] = {}
  }

  // TODO: 从string中取出结果
  const res = buildModule(`${moduleOptions[1].root}${moduleOptions[1].componentPath}`)

  const paths = moduleOptions.map((item: ModuleOptions) => { return item.resolvedPath })

  // TODO: 形成树，循环处理moduleOptions
  const tree = pathsToTree(paths)
  rootModule.tree = tree

  rootModule.testString = res
  return JSON.stringify(rootModule)
}

// ========================================================================

export function generateModule(moduleOptions: ModuleOptions, options: ResolvedOptions) {
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

  // TODO: 使用esbuild

  return {
    name: moduleOptions.moduleName,
    imports: [],
  }
}

/**
 * Creates a stringified Vue Router route definition.
 */
export function stringifyRoutes(
  preparedRoutes: Route[],
  options: ResolvedOptions,
) {
  const imports: string[] = []

  const stringRoutes = JSON
    .stringify(preparedRoutes, null, 2)
    .split('\n')
    .map((str) => {
      if (/"component":\s"\S+"/.test(str)) {
        const start = '"component": "'
        const startIndex = str.indexOf(start) + start.length
        const endIndex = str.indexOf('",')
        const path = str.slice(startIndex, endIndex)
        const replaceStr = str.slice(startIndex - 1, endIndex + 1)

        const mode = resolveImportMode(path, options)
        if (mode === 'sync') {
          const importName = pathToName(path)
          imports.push(`import ${importName} from '${path}'`)
          return str.replace(replaceStr, importName)
        }
        else {
          return str.replace(replaceStr, `() => import('${path}')`)
        }
      }
      return str
    }).join('\n')

  return {
    imports,
    stringRoutes,
  }
}
