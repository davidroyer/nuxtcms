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
  // nuxtServerInit({ commit, state }, { $cmsApi, isDev }) {

  nuxtServerInit({ commit, state }, ctx) {
    const { $cmsApi } = ctx
    console.log('🚀 ~ file: index.js ~ line 16 ~ nuxtServerInit ~ ctx.$pages', ctx.$pages)
    commit('setMenu', $cmsApi.get('menus', 'nav-menu'))
    // commit('setDataFileExample', $cmsApi.get('data-file-example'))
  }
}
