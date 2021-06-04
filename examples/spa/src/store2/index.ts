import { cacheGet } from '@/utils/cache'

// 严格模式，默认true
export const strict = cacheGet()
// 插件地址，默认：plugins
export const pluginDir = 'plugins'
export const state = () => {
  return {
    path: '/',
    info: 'File system based vuex plugin for Vite',
    token: null,
  }
}

export const mutations = {
  token(state: any, data: any) {
    state.token = data
  },
}
export const actions = {
  token({ commit }: any, params: any) {
    commit('token', params)
  },
}
