import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'

declare module 'vite-plugin-store' {
  export default Store
}
declare module '@vue/runtime-core' {
  // Declare your own store states.
  interface State {
    count: number
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

declare module 'pages-generated' {
  // eslint-disable-next-line import/no-duplicates
  import { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

declare module 'virtual:generated-pages' {
  // eslint-disable-next-line import/no-duplicates
  import { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}
