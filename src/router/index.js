import Vue from 'vue';
import Router from 'vue-router';
import Minesweeper from '@/components/Minesweeper';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Minesweeper',
      component: Minesweeper,
    },
  ],
});
