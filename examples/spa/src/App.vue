<template>
  <div>
    <div class="test">
      测试111 {{ account }}
      <button @click="onclick">修改account info</button>
    </div>
    <div class="store-section">
    </div>
  </div>
</template>
<script>
import store from 'virtual:generated-store'
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState({
      state: state => state,
      account: state => state.account,
      accountInfo: state => state.account.info,
      userRole: state => state['user/role'],
      userRoleInfo: state => state['user/role'].info,
    }),
  },
  data() {
    return {
      store,
      state2: {},
    }
  },
  mounted() {
  },
  methods: {
    onclick(){
      this.$store.state.account.info = Math.random()
      // this.accountInfo = Math.random()
      console.log('修改', Math.random())
    }
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
