import {
  createRouter,
  RouteRecordRaw,
  createWebHashHistory,
  Router,
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: { animation: 'animate__animated animate__fadeInUp' },
    alias: ['/login'],
    component: () => import('../components/Login.vue'),
  },
  {
    path: '/index',
    name:'index',
    meta: { animation: 'animate__animated animate__flipInX' },
    component: () => import('../components/Index.vue'),
    children:[
      {
        path:'container',
        component:()=>import('../components/Continue.vue')
      }
    ]
  },
  {
    path: '/register',
    meta: { animation: 'animate__animated animate__fadeInUp' },
    component: () => import('../components/Register.vue'),
  },
]

const router: Router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if(to.path=='/register'){
    next()
  }
  if (to.path != '/') {
    if (localStorage.getItem('token')) {
      next()
    }
    next('/')
  } else {
    next()
  }
})

export default router
