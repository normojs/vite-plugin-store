// 严格模式，默认true
export const strict = false
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
  token(state, data) {
    state.token = data
  },
}
export const actions = {
  token({ commit }, params) {
    commit('token', params)
  },
}
