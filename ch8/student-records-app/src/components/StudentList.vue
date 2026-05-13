<script setup>
defineProps({ students: { type: Array, required: true } })
const emit = defineEmits(['edit', 'delete'])
</script>
<template>
 <div v-if="!students.length" class="empty">
 No students found. Add one above or clear the search filter.
 </div>
 <table v-else class="student-table">
 <thead>
 <tr>
 <th>Matric</th><th>Name</th><th>Course</th>
 <th>GPA</th><th>Year</th><th>Status</th><th>Actions</th>
 </tr>
 </thead>
 <tbody>
 <tr v-for="s in students" :key="s.id">
 <td><code>{{ s.matricNo }}</code></td>
 <td>
 <strong>{{ s.name }}</strong>
 <div class="muted">{{ s.email }}</div>
 </td>
 <td>{{ s.course }}</td>
 <td>{{ Number(s.gpa).toFixed(2) }}</td>
 <td>{{ s.year }}</td>
 <td>
 <span :class="s.active ? 'badge ok' : 'badge no'">
 {{ s.active ? 'Active' : 'Inactive' }}
 </span>
 </td>
 <td>
 <button @click="emit('edit', s)">Edit</button>
 <button class="danger" @click="emit('delete', s.id)">Delete</button>
 </td>
 </tr>
 </tbody>
 </table>
</template>