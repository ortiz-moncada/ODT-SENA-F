import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/login.vue'
import Dashboard from '../pages/Dashboard.vue'
import Users from '../pages/Users.vue'
import Areas from '../pages/Areas.vue'
import Task from '../pages/Task.vue'
import notify from '../pages/notify.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/Users', name: 'Users', component: Users },
  { path: '/Areas', name: 'Areas', component: Areas },
  { path: '/task', name: 'Task', component: Task },
  { path: '/notify', name: 'notify', component: notify },
  { path: '/restablecer-password/:token', name: 'restablecer-password',component: () => import('../pages/RestablecerPassword.vue')}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router