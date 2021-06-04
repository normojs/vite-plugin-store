<template>
  <div>
    状态：{{ state2 }}
    <hr>
    <hr>
    <template v-for="(name, key) in store.moduleNames" :key="key">
      <div>
        // - 引入 {{ name }}
        <pre>
          {{ store.modules[name].imports.join('\n') }}
        </pre>
        // - 定义
        <pre>
          {{ store.modules[name].variables.join('\n') }}
        </pre>
      </div>
      // ---------------------------------------
      // ---------------------------------------
    </template>

    <!-- export default -->
    <div>
      // - 引入 __root__
      <pre>
          {{ store.modules['__root__'].imports.join('\n') }}
        </pre>
      // - 定义
      <pre>
          {{ store.modules['__root__'].variables.join('\n') }}
        </pre>
    </div>
    <!-- <hello-word mds="xx" /> -->
  </div>
</template>
<script>
import store from 'virtual:generated-store'
console.log('store: ', store)
export default {
  data() {
    return {
      store,
      state2: {},
    }
  },
  mounted() {
    this.state2 = this.$store.state
    console.log('xxx', this.$store)
  },
}
</script>
