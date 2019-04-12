import Vue from 'vue'
import VueCarousel from 'vue-carousel'
import App from './App.vue'
import VueFire from 'vuefire';
import VueRouter from 'vue-router'

Vue.use(VueRouter)
Vue.use(VueFire)
Vue.use(VueCarousel)

const routes = [
	{path: '/*', component: App}
]

const router = new VueRouter({
	routes
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})