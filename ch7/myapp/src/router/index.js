import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TodosView from '@/views/TodosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/todos', name: 'todos', component: TodosView },
    {
      path: '/todos/:id',
      name: 'todo-detail',
      // Lazy-loaded: only fetched when the route is visited.
      component: () => import('@/views/TodoDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.name !== 'todo-detail') return true

  const id = Number(to.params.id)
  if (to.params.id === 'undefined' || Number.isNaN(id)) {
    return { name: 'todos' }
  }

  return true
})

export default router
