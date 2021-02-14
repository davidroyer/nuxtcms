/* eslint-disable no-console */
export const state = () => ({
  nav: [],
  dataFileExample: {}
})

export const mutations = {
  setNav: (state, payload) => (state.nav = payload),
  setDataFileExample: (state, payload) => (state.dataFileExample = payload)

}

export const actions = {
  // nuxtServerInit({ commit, state }, { $cmsApi, isDev }) {

  nuxtServerInit({ commit, state }, ctx) {
    const { $cmsApi } = ctx
    console.log('🚀 ~ file: index.js ~ line 16 ~ nuxtServerInit ~ ctx.$pages', ctx.$pages)
    console.log("$cmsApi.get('site', 'nav')", $cmsApi.get('site', 'nav'))

    commit('setNav', $cmsApi.get('site', 'nav'))
    // commit('setDataFileExample', $cmsApi.get('data-file-example'))
  }
}
