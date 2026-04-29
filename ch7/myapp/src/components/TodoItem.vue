<template>
 <li :class="{ done: todo.done }" class="todo">
 <input type="checkbox"
 :checked="todo.done"
 @change="$emit('toggle', todo.id)">
 <router-link :to="{ name: 'todo-detail', params: { id: todo.id } }"
 class="text">
 {{ todo.text }}
 </router-link>
 <button class="remove"
 @click="$emit('remove', todo.id)"
 title="Delete">&times;</button>
 </li>
</template>
<script setup>
defineProps({
 todo: { type: Object, required: true }
})
defineEmits(['toggle', 'remove'])
</script>
<style scoped>
.todo {
 display: flex;
 align-items: center;
 gap: .75rem;
 padding: .6rem .75rem;
 border-bottom: 1px solid #E2E8F0;
}
.todo.done .text {
 text-decoration: line-through;
 color: #94A3B8;
}
.text {
 flex: 1;
 text-decoration: none;
 color: #1F2937;
}
.text:hover { color: #42B883; }
.remove {
 background: none;
 border: none;
 color: #EF4444;
 cursor: pointer;
 font-size: 1.25rem;
}
</style>