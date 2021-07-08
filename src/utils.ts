import Debug from 'debug'
import { ResolvedOptions, Route } from './types'

export function moduleName2InName(moduleName: string) {
  return `_${moduleName.replace(/\//g, '_')}`
}

export function isSubModule(parentModuleName: string, subModuleName: string) {
  return false
}

export function extensionsToGlob(extensions: string[]) {
  return extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0] || ''
}

export function normalizePath(str: string): string {
  return str.replace(/\\/g, '/')
}

export const debug = {
  // 代码生成
  gen: Debug('vite-plugin-store:gen'),
  // transform
  transform: Debug('vite-plugin-store:transform'),
  // 热加载
  hmr: Debug('vite-plugin-store:hmr'),
}

const dynamicRouteRE = /^\[.+\]$/
export const nuxtDynamicRouteRE = /^_[\s\S]*$/

export function slash(str: string): string {
  return str.replace(/\\/g, '/')
}

export function resolveImportMode(
  filepath: string,
  options: ResolvedOptions,
) {
  const mode = options.importMode
  if (typeof mode === 'function')
    return mode(filepath)
  if (options.syncIndex && filepath === `/${options.pagesDir}/index.vue`)
    return 'sync'
  else
    return mode
}

export function pathToName(filepath: string) {
  return filepath.replace(/[_.\-\\/]/g, '_').replace(/[[:\]()]/g, '$')
}
