import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/About.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'about',
      component: Home,
      meta: {
        noAuth: true
      }
    },
    {
      path: '/home',
      name: 'home',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/Home.vue')
	},
	{
		path: '/table',
		name: 'table',
		component: () => import('./views/Table.vue')
	}
  ]
});

router.beforeEach((to, from, next) => {
    if(to.matched.some(res => res.meta.noAuth)||localStorage.getItem('username')){
		next();
    } else {
		next('/');
	}
});

export default router;