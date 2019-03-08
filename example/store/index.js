/* eslint-disable no-console */
export const state = () => ({
  menu: [],
  testFile: {}
})

export const mutations = {
  // changeSomeValue(state, newValue) {
  //   this.$myInjectedFunction('accessible in mutations')
  //   state.someValue = newValue
  // },

  setMenu: (state, payload) => (state.menu = payload),
  setTestFile: (state, payload) => (state.testFile = payload)

}

export const actions = {

  nuxtServerInit({ commit, state }, { $cmsApi, isDev }) {
    commit('setMenu', $cmsApi.get('main-menu'))
    commit('setTestFile', $cmsApi.get('file-7'))
  }

  // setSomeValueToWhatever({ commit }) {
  //   this.$myInjectedFunction('accessible in actions')
  //   const newValue = 'whatever'
  //   commit('changeSomeValue', newValue)
  // }
}
