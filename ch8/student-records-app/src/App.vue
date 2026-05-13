<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentForm from './components/StudentForm.vue'
import StudentList from './components/StudentList.vue'
import {
 getStudents, createStudent, updateStudent, patchStudent, deleteStudent
} from './api/studentApi.js'

const students = ref([])
const editingStudent = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const formErrors = ref({})
const page = ref(1)
const size = ref(5)
const total = ref(0)
const totalPages = computed(() => Math.max(Math.ceil(total.value / size.value), 1))

async function load() {
 loading.value = true
 errorMsg.value = ''
 try {
 const { data } = await getStudents({ page: page.value, size: size.value })
 students.value = data.data
 total.value = data.total
 page.value = data.page
 size.value = data.size
 } catch (e) {
 errorMsg.value = 'Failed to load students. Is the API running on :3000?'
 } finally {
 loading.value = false
 }
}

async function handleSave(payload) {
 try {
 formErrors.value = {}
 if (editingStudent.value) {
 await updateStudent(editingStudent.value.id, payload)
 editingStudent.value = null
 } else {
 await createStudent(payload)
 }
 await load()
 } catch (e) {
 if (e.response?.status === 400 && e.response.data?.errors) {
 formErrors.value = e.response.data.errors
 return
 }
 errorMsg.value = 'Save failed. Check the console for details.'
 }
}

function handleEdit(s) {
 editingStudent.value = { ...s }
 formErrors.value = {}
}

function handleCancel() {
 editingStudent.value = null
 formErrors.value = {}
}

async function handleToggleActive(student) {
 const oldValue = Boolean(student.active)
 student.active = !oldValue
 try {
 const { data } = await patchStudent(student.id, { active: student.active })
 Object.assign(student, data)
 } catch {
 student.active = oldValue
 errorMsg.value = 'Active toggle failed.'
 }
}

async function handleDelete(id) {
 if (!confirm('Delete this student? This cannot be undone.')) return
 try {
 await deleteStudent(id)
 if (students.value.length === 1 && page.value > 1) page.value -= 1
 await load()
 } catch {
 errorMsg.value = 'Delete failed.'
 }
}

async function previousPage() {
 if (page.value <= 1) return
 page.value -= 1
 await load()
}

async function nextPage() {
 if (page.value >= totalPages.value) return
 page.value += 1
 await load()
}

onMounted(load)
</script>

<template>
 <header>
 <h1>Student Records Manager</h1>
 <p class="subtitle">Vue 3 - Axios - Express - MySQL</p>
 </header>
 <main>
 <p v-if="loading" class="loading">Loading...</p>
 <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
 <StudentForm
 :editingStudent="editingStudent"
 :serverErrors="formErrors"
 @save="handleSave"
 @cancel="handleCancel" />
 <div class="pagination">
 <button type="button" :disabled="page <= 1 || loading" @click="previousPage">Prev</button>
 <span>Page {{ page }} of {{ totalPages }} - {{ total }} students</span>
 <button type="button" :disabled="page >= totalPages || loading" @click="nextPage">Next</button>
 </div>
 <StudentList
 :students="students"
 @edit="handleEdit"
 @toggle-active="handleToggleActive"
 @delete="handleDelete" />
 </main>
</template>
