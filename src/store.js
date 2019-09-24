import Vue from "vue";
import Vuex from "vuex";
const fb = require("./firebaseConfig.js");

Vue.use(Vuex);

// handle page reload
fb.auth.onAuthStateChanged(user => {
  if (user) {
    store.commit("setCurrentUser", user);
    store.dispatch("fetchUserProfile");
  }
});

const store = new Vuex.Store({
  state: {
    currentUser: null,
    userProfile: {},
    posts: [],
    hiddenPosts: []
  },
  actions: {
    fetchUserProfile({ commit, state }) {
      fb.usersCollection
        .doc(state.currentUser.uid)
        .get()
        .then(res => {
          console.log(res.data);
          commit("setUserProfile", res.data());
        })
        .catch(err => {
          console.log("Loi" + err);
        });
    },
    clearData({ commit }) {
      commit("setUserProfile", {});
      commit("setCurrentUser", null);
    }
  },
  mutations: {
    setCurrentUser(state, val) {
      state.currentUser = val;
    },
    setUserProfile(state, val) {
      state.userProfile = val;
    },
    setPosts(state, val) {
      state.posts = val;
    },
    setHiddenPosts(state, val) {
      if (val) {
        if (!state.hiddenPosts.some(x => x.id === val.id)){
          state.hiddenPosts = val;
        }
      } else {
        state.hiddenPosts = [];
      }
    }
  }
});

export default store;
