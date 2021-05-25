
// initial state
const state = () => ({
  all: [],
})

// getters
const getters = {}

// actions
const actions = {
  async getAllProducts({ commit }) {
    const products = [{ name: 1 }, { name: 2 }]
    commit('setProducts', products)
  },
}

// mutations
const mutations = {
  setProducts(state, products) {
    state.all = products
  },

  decrementProductInventory(state, { id }) {
    const product = state.all.find(product => product.id === id)
    product.inventory--
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
