<template>
  <section class="wrap">
    <h1>Todos</h1>

    <form class="add-form" @submit.prevent="submit">
      <input v-model="text" placeholder="What needs doing?" autofocus />
      <button type="submit" :disabled="!text.trim()">Add</button>
    </form>

    <div class="tabs" role="tablist" aria-label="Todo filters">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="{ active: selectedTab === tab.value }"
        @click="selectedTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="filteredItems.length === 0" class="empty">
      {{ emptyMessage }}
    </p>

    <ul v-else class="list">
      <TodoItem
        v-for="t in filteredItems"
        :key="t.id"
        :todo="t"
        @toggle="store.toggle"
        @remove="store.remove"
      />
    </ul>

    <p class="stats">
      {{ store.activeCount }} active | {{ store.doneCount }} done | {{ store.total }} total
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'

const store = useTodosStore()
const text = ref('')
const selectedTab = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'done' },
]

const filteredItems = computed(() => {
  if (selectedTab.value === 'active') {
    return store.items.filter((t) => !t.done)
  }

  if (selectedTab.value === 'done') {
    return store.items.filter((t) => t.done)
  }

  return store.items
})

const emptyMessage = computed(() => {
  if (store.total === 0) return 'Nothing yet - add your first todo above.'
  return `No ${selectedTab.value} todos.`
})

function submit() {
  store.add(text.value)
  text.value = ''
}
</script>

<style scoped>
.wrap {
  max-width: 520px;
  margin: 2rem auto;
  padding: 1rem;
}

h1 {
  color: #35495e;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-form input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}

.add-form button,
.tabs button {
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.add-form button {
  background: #42b883;
  color: #ffffff;
  padding: 0.6rem 1rem;
}

.add-form button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tabs button {
  background: #e2e8f0;
  color: #1f2937;
  padding: 0.5rem 0.9rem;
}

.tabs button.active {
  background: #35495e;
  color: #ffffff;
}

.list {
  padding: 0;
  overflow: hidden;
  list-style: none;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty {
  color: #64748b;
  font-style: italic;
}

.stats {
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
}
</style>
