export const state = () => ({
  siteMenu: null
})

export const mutations = {
  changeSomeValue(state, newValue) {
    this.$myInjectedFunction('accessible in mutations')
    state.someValue = newValue
  }
}

export const actions = {
  setSomeValueToWhatever({ commit }) {
    this.$myInjectedFunction('accessible in actions')
    const newValue = 'whatever'
    commit('changeSomeValue', newValue)
  }
}
