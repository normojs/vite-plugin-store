<template>
  <div>
    <div class="store-section">
      <!-- <div class="left">
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

        <div>
          <pre>
            {{ store.modules['__root__'].imports.join('\n') }}
          </pre>
          <pre>
            {{ store.modules['__root__'].variables.join('\n') }}
          </pre>
        </div>
      </div> -->
      <hr>
      <div class="right">
        <pre>
          {{ store }}
        </pre>
      </div>

      <!-- <hello-word mds="xx" /> -->
    </div>
  </div>
</template>
<script>
import store from 'virtual:generated-store'
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState({
      state: state=>state,
      account: state => state.account,
      accountInfo: state => state.account.info,
      userRole: state => state['user/role'],
      userRoleInfo: state => state['user/role'].info
    })
  },
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
