import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import i18n from './i18n/plugin'
import VueResource from 'vue-resource'
import BootstrapForVue from 'bootstrap-for-vue'

import App from './components/App.vue'

window.jQuery = window.$ = require('jquery')
window.Tether = require('tether')
require('bootstrap')

Vue.use(i18n)
Vue.use(VueResource)
Vue.use(BootstrapForVue, { all: true, custom: true })
Vue.use(VueRouter)
Vue.use(Vuex)

window.addEventListener('dragover', e => {
  e.preventDefault()
})

window.addEventListener('drop', e => {
  e.preventDefault()
  alert(app.i18n('drop-warn'))
})

const routes = [{ path: '*', component: App }]

const router = new VueRouter({ mode: 'history', routes })

const store = new Vuex.Store({
  state: {
    isCausedByExt: true,
    isFixedInInsiders: true,
    isStartupPerfIssue: true,
    vscodeInfo: {},
    info: {}
  },
  mutations: {
    setCausedByExt (state, val) {
      state.isCausedByExt = val
    },
    setFixedInInsiders (state, val) {
      state.isFixedInInsiders = val
    },
    setStartupPerfIssue (state, val) {
      state.isStartupPerfIssue = val
    },
    updateVSCodeInfo (state, val) {
      state.vscodeInfo = val
    },
    updateInfo (state, val) {
      state.info = val
    }
  }
})

const app = new Vue({
  router,
  store
}).$mount('#app')
