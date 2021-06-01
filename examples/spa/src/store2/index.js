import cart from './modules/cart'
import products from './modules/products'

import * as test from './modules/test'

console.log('cart: ', cart)
console.log('test: ', test, { ...test })

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
