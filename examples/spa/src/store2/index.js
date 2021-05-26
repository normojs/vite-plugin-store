import cart from './modules/cart'
import products from './modules/products'

console.log('cart: ', cart)

const debug = process.env.NODE_ENV !== 'production'

export default {
  modules: {
    cart,
    products,
  },
  state: () => ({
    items: [],
    checkoutStatus: null,
  }),
  getters: {
    indexGetter: (state, getters, rootState) => {},
  },
  strict: debug,
}
