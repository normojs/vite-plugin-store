import { cacheGet } from '@/utils/cache'

export const namespaced = true

// 严格模式，默认true
export const strict = false // cacheGet()
// 插件地址，默认：plugins
export const pluginDir = 'plugins'
export const state = () => {
  return {
    path: '/11',
    info: '111 1File system based vuex plugin for Vite',
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
