
// - 引入 user/role/menu
import * as _user_role_menu_index from './user/role/menu/index'

// --------------------------------------- // ---------------------------------------
// - 引入 user/role/element
import * as _user_role_element_index from './user/role/element/index'

// --------------------------------------- // ---------------------------------------
// - 引入 user/role
import * as _user_role_index from './user/role/index'

// --------------------------------------- // ---------------------------------------
// - 引入 user
import * as _user_actions from './user/actions'
import * as _user_getters from './user/getters'
import * as _user_index from './user/index'
import * as _user_mutations from './user/mutations'
import * as _user_state from './user/state'

// --------------------------------------- // ---------------------------------------
// - 引入 index
import * as _index_actions from './actions'
import * as _index_getters from './getters'
import * as _account_module from './account'
import * as _index_index from './index'

// --------------------------------------- // ---------------------------------------
// - 引入 account

// - 定义
const _user_role_menu_var = {
  ..._user_role_menu_index,
}

// - 定义
const _user_role_element_var = {
  ..._user_role_element_index,
}

// - 定义
const _user_role_var = {
  ..._user_role_index,
  modules: {
    menu: _user_role_menu_var,
    element: _user_role_element_var,
  },
}

// - 定义
const _user_var = {
  ..._user_index,
  actions: { ..._user_actions },
  getters: { ..._user_getters },
  mutations: { ..._user_mutations },
  state: { ..._user_state },
  modules: {
    role: _user_role_var,
  },
}

// - 定义
const _index_var = {
  ..._index_index,
  actions: { ..._index_actions },
  getters: { ..._index_getters },
}

// - 定义
const _account_var = {
  ..._account_module,
}

// --------------------------------------- // ---------------------------------------
// - 引入 __root__

// - 定义
export default {
  ..._index_var,
  modules: {
    user: _user_var,
    account: _account_var,
  },
}
