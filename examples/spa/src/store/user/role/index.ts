// TODO: 未生效
export const state = () => {
  return {
    path: '/user/role',
    info: 'File system based vuex plugin for Vite',
    description: '用户所属角色',
    token: null,
  }
}

export const mutations = {
  setRoleInfo(state: any, data: any) {
    state.info = data
  },
}
