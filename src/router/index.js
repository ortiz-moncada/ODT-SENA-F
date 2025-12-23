import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/login.vue'
import Dashboard from '../pages/Dashboard.vue'
import Users from '../pages/Users.vue'
import Areas from '../pages/Areas.vue'
import RContraseña from '../pages/RContraseña.vue'
import Task from '../pages/Task.vue'
import notify from '../pages/notify.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/Users', name: 'Users', component: Users},
  { path: '/Areas', name: 'Areas', component: Areas},
  { path: "/restablecer", name: "restablecer", component: RContraseña, },
  { path: "/task", name: "Task", component: Task},
  { path: "/notify", name: "notify", component: notify } 
];
//() => import("../pages/RContraseña.vue")

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
