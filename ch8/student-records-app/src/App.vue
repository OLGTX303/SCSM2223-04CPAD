<script setup>
import { ref, onMounted } from 'vue'
import StudentForm from './components/StudentForm.vue'
import StudentList from './components/StudentList.vue'
import {
    getStudents, createStudent, updateStudent, deleteStudent
} from './api/studentApi.js'
const students = ref([])
const editingStudent = ref(null)
const loading = ref(false)
const errorMsg = ref('')
async function load() {
 loading.value = true
 errorMsg.value = ''
 try {
 const { data } = await getStudents()
 students.value = data
 } catch (e) {
 errorMsg.value = 'Failed to load students. Is the API running on :3000?'
 } finally {
 loading.value = false
 }
}
async function handleSave(payload) {
 try {
 if (editingStudent.value) {
 await updateStudent(editingStudent.value.id, payload)
 editingStudent.value = null
 } else {
 await createStudent(payload)
 }
 await load()
 } catch (e) {
 errorMsg.value = 'Save failed. Check the console for details.'
 }
}
function handleEdit(s) { editingStudent.value = { ...s } }
function handleCancel() { editingStudent.value = null }
async function handleDelete(id) {
 if (!confirm('Delete this student? This cannot be undone.')) return
 try {
 await deleteStudent(id)
 await load()
 } catch {
 errorMsg.value = 'Delete failed.'
 }
}
onMounted(load)
</script>
<template>
 <header>
 <h1>Student Records Manager</h1>
 <p class="subtitle">Vue 3 · Axios · Express · MySQL</p>
 </header>
 <main>
 <p v-if="loading" class="loading">Loading…</p>
 <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
 <StudentForm
 :editingStudent="editingStudent"
 @save="handleSave"
 @cancel="handleCancel" />
 <StudentList
 :students="students"
 @edit="handleEdit"
 @delete="handleDelete" />
 </main>
</template>