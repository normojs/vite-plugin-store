export const namespaced = true

// 使state.ts失效
export const state = () => {
  return {
    path: '/user',
    info: 'File system based vuex plugin for Vite',
    token: null,
  }
}

// 使mutations.ts失效
export const mutations = {
  setInfo2({ state }: any, params: any) {
    state.info = params
  },
}
