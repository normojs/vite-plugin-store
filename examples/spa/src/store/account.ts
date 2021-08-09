import { getXx } from '../utils/db'
export const namespaced = true
export const state = () => {
  return {
    path: '/1111',
    info: 'account File system based vuex plugin for Vite',
    token: null,
  }
}
export const mutations = {
  __init__(state: any, data: any) {
    console.log('__init__ : ', data.path)
    state.path = data.path
  },
  setToken(state: any, data: any) {
    state.token = data + getXx()
  },
  test(state: any, data: any) {
    state.token = data + getXx()
  },
}

export const getters = {
  getAccountInfo(state) {
    return `${state.path}-accounts getters-${Math.random()}1`
  },
}
