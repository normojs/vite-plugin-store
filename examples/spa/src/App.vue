<template>
  <div class="store-section">
    <div class="left">
      <template v-for="(name, key) in store.moduleNames" :key="key">
        <div>
          <pre>
          {{ store.modules[name].imports.join('\n') }}
        </pre>
          <pre>
          {{ store.modules[name].variables.join('\n') }}
        </pre>
        </div>
      </template>

      <!-- export default -->
      <div>
        <pre>
          {{ store.modules['__root__'].imports.join('\n') }}
        </pre>
        <pre>
          {{ store.modules['__root__'].variables.join('\n') }}
        </pre>
      </div>
    </div>
    <hr>
    <div class="right">
      <pre>
        {{ store.code }}
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

<style scoped>
.store-section{
  display: flex;
}
.left{

}
</style>
