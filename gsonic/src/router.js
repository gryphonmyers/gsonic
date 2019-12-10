import Vue from 'vue';
import Router from 'vue-router';
import Home from '~/views/Home.vue';
import About from '~/views/About.vue';

Vue.use(Router);

export const options = {
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    }
  ]
};
export default new Router(options);