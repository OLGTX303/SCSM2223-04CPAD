import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const defaultItems = [
  { id: 1, text: 'Finish Chapter 7 lab', done: false, notes: '' },
  { id: 2, text: 'Commit code to Git', done: false, notes: '' },
]

function loadItems() {
  const saved = localStorage.getItem('todos')

  if (!saved) return defaultItems

  try {
    return JSON.parse(saved)
  } catch {
    return defaultItems
  }
}

export const useTodosStore = defineStore('todos', () => {
  const items = ref(loadItems())

  const total = computed(() => items.value.length)
  const doneCount = computed(() => items.value.filter((t) => t.done).length)
  const activeCount = computed(() => total.value - doneCount.value)

  watch(items, (newItems) => localStorage.setItem('todos', JSON.stringify(newItems)), {
    deep: true,
  })

  function add(text) {
    const clean = text.trim()
    if (!clean) return

    items.value.push({
      id: Date.now(),
      text: clean,
      done: false,
      notes: '',
    })
  }

  function remove(id) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  function toggle(id) {
    const t = items.value.find((t) => t.id === id)
    if (t) t.done = !t.done
  }

  function updateNotes(id, notes) {
    const t = items.value.find((t) => t.id === id)
    if (t) t.notes = notes
  }

  function getById(id) {
    return items.value.find((t) => t.id === Number(id))
  }

  return {
    items,
    total,
    doneCount,
    activeCount,
    add,
    remove,
    toggle,
    updateNotes,
    getById,
  }
})
