import {
  resolveImportMode,
  pathToName,
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
  const indexModule: any = { strict: true, moduleOptions, modules: {} }
  for (const i in moduleOptions) {
    /*
      TODO: 处理每个模块：返回
      1、

    */
    const { name, module } = stringifyStore(moduleOptions[i], options)
    indexModule.modules[name] = module
  }

  // TODO: 从string中取出结果
  const res = buildModule(`${moduleOptions[1].root}${moduleOptions[1].componentPath}`)
  indexModule.testString = res
  return JSON.stringify(indexModule)
}

export function stringifyStore(moduleOptions: ModuleOptions, options: ResolvedOptions) {
  const module = {}

  // TODO: 使用esbuild

  return { name: moduleOptions.moduleName, module }
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
