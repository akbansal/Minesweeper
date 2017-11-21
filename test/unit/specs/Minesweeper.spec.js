import Vue from 'vue';
import Minesweeper from '@/components/Minesweeper';

describe('Minesweeper.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Minesweeper);
    const vm = new Constructor().$mount();
    expect(vm.$el.querySelector('#minesweeperApp h1').textContent)
    .toEqual('Minesweeper');
  });
});
