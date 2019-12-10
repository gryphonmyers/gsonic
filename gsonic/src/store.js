import Vue from 'vue';
import Vuex from 'vuex';
import SubsonicMusicLibraryInterface from "./subsonic-interface";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    libraryInterface: null,
  },
  mutations: {
    setLibrary(state, library) {
      state.libraryInterface = library;
    }
  },
  actions: {
    async createInterface({commit}, {username, host, password}) {
      var libraryInterface = new SubsonicMusicLibraryInterface({ server: host });
      const token = await libraryInterface.auth(username, password);
      commit('setLibrary', libraryInterface)
    }
  },
});
