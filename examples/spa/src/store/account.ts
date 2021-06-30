import { getXx } from '../utils/db'

export const state = () => {
  return {
    path: '/account',
    info: 'File system based vuex plugin for Vite',
    token: null,
  }
}
export const mutations = {
  setToken(state: any, data: any) {
    state.token = data + getXx()
  },
  test(state: any, data: any) {
    state.token = data + getXx()
  },
}

export const getters = {
  getAccountInfo(state: any) {
    return `${state.path}:---测试123`
  },
}
