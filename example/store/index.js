/* eslint-disable no-console */
export const state = () => ({
  menu: [],
  dataApi: {},
  testFile: {}
})

export const mutations = {
  // changeSomeValue(state, newValue) {
  //   this.$myInjectedFunction('accessible in mutations')
  //   state.someValue = newValue
  // },

  setDataApi: (state, payload) => (state.dataApi = payload),
  setMenu: (state, payload) => (state.menu = payload),
  setTestFile: (state, payload) => (state.testFile = payload)

}

export const actions = {

  nuxtServerInit({ commit, state }, { $dataApi, isDev }) {
    commit('setDataApi', $dataApi)
    commit('setMenu', $dataApi.mainMenu)
    commit('setTestFile', $dataApi.mainNav)
  }

  // setSomeValueToWhatever({ commit }) {
  //   this.$myInjectedFunction('accessible in actions')
  //   const newValue = 'whatever'
  //   commit('changeSomeValue', newValue)
  // }
}
