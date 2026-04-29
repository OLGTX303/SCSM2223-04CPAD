<template>
 <section class="wrap">
 <router-link to="/todos" class="back">&larr; Back</router-link>
 <div v-if="todo" class="card" :class="{ done: todo.done }">
 <h1>{{ todo.text }}</h1>
 <p class="status">
 Status:
 <strong>{{ todo.done ? 'Completed' : 'Active' }}</strong>
 </p>
 <label>
 Notes
 <textarea v-model="notes" rows="4"
 placeholder="Add some context..."></textarea>
 </label>
 <div class="actions">
 <button class="save" @click="saveNotes">Save notes</button>
 <button class="toggle" @click="store.toggle(todo.id)">
 Mark as {{ todo.done ? 'active' : 'done' }}
 </button>
 </div>
 </div>
 <div v-else class="missing">
 <p>Todo not found.</p>
 <router-link to="/todos">Back to list</router-link>
 </div>
 </section>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTodosStore } from '@/stores/todos'
const route = useRoute()
const store = useTodosStore()
const todo = computed(() => store.getById(route.params.id))
const notes = ref(todo.value?.notes ?? '')
// keep textarea in sync if user navigates to another todo
watch(todo, t => { notes.value = t?.notes ?? '' })
function saveNotes() {
 if (todo.value) store.updateNotes(todo.value.id, notes.value)
}
</script>
<style scoped>
.wrap { max-width: 520px; margin: 2rem auto; padding: 1rem; }
.back { color: #42B883; text-decoration: none; font-weight: 600; }
.card {
 background: #FFFFFF; margin-top: 1rem;
 border-radius: 12px; padding: 1.25rem;
 box-shadow: 0 4px 12px rgba(0,0,0,.05);
}
.card.done h1 { text-decoration: line-through; color: #94A3B8; }
.status { color: #64748B; margin-bottom: 1rem; }
label { display: block; margin-top: 1rem; color: #35495E; }
textarea {
 width: 100%; margin-top: .25rem; padding: .5rem;
 border: 1px solid #CBD5E1; border-radius: 6px;
 font-family: inherit; font-size: 1rem;
}
.actions { display: flex; gap: .5rem; margin-top: 1rem; }
.save, .toggle {
 padding: .5rem .9rem; border: none;
 border-radius: 6px; cursor: pointer; font-weight: 600;
}
.save { background: #42B883; color: #FFFFFF; }
.toggle { background: #E2E8F0; color: #1F2937; }
.missing { margin-top: 2rem; color: #EF4444; }
</style>