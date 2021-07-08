<template>
  <div>
    <div>
      {{ Math.random() }}
    </div>
    <div>
      mapGetters: {{ getAccountInfo }}
    </div>
    <div class="test">
      测试111 {{ account }} - {{ userRoleInfo }}
      <button @click="onclick">
        修改account info(非严格模式时)
      </button>
    </div>
    <div>
      menu: {{ userMenuInfo }}
    </div>

    <div>
      <button @click="editStore">
        修改account path (mutation)
      </button>
    </div>
    <div class="store-section">
    </div>
  </div>
</template>
<script>
// import { store, mapState, mapGetters } from 'virtual:generated-store'
import { mapState, mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      getAccountInfo: 'account/getAccountInfo',
    }),
    ...mapState({
      state: state => state,
      account: state => state.account,
      accountInfo: state => state.account.info,
      userRole: state => state.user.role,
      userRoleInfo: state => state.user.role.info,
      userMenuInfo: state => state.user.role.menu.info,
    }),
  },
  data() {
    return {
      state2: {},
    }
  },
  mounted() {
    console.log('this.$store: ', this.$store)
  },
  methods: {
    editStore() {
      this.$store.commit('account/__init_account__', {
        path: `/path?t=${Date.now()}`,
        info: 'File system based vuex plugin for Vite',
        token: null,
      })
    },
    onclick() {
      this.$store.state.account.info = Math.random()
      // this.accountInfo = Math.random()
      console.log('修改1', Math.random())
    },
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
