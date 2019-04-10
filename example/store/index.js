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
    console.log('DATA FILE: ', $cmsApi.get('data-file-example'))

    commit('setDataFileExample', $cmsApi.get('data-file-example'))
  }
}
