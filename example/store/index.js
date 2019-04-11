/* eslint-disable no-console */
export const state = () => ({
  menu: [],
  dataFileExample: {}
})

export const mutations = {
  setMenu: (state, payload) => (state.menu = payload),
  setDataFileExample: (state, payload) => (state.dataFileExample = payload)

}

export const actions = {

  nuxtServerInit({ commit, state }, { $cmsApi, isDev }) {
    commit('setMenu', $cmsApi.get('nav-menu'))
    commit('setDataFileExample', $cmsApi.get('data-file-example'))
  }
}
