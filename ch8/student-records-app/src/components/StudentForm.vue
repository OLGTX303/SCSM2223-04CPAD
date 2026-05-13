<script setup>
const matricRegex = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{4}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function validate() {
 const e = {}
 if (!form.value.matricNo.trim())
 e.matricNo = 'Matric number is required.'
 else if (!matricRegex.test(form.value.matricNo.trim().toUpperCase()))
 e.matricNo = 'Format: A21CS0001 (1 letter, 2 digits, 2 letters, 4 digits).'
 if (!form.value.name.trim() || form.value.name.trim().length < 3)
 e.name = 'Name must be at least 3 characters.'
 if (!emailRegex.test(form.value.email.trim()))
 e.email = 'Please enter a valid email address.'
 const gpa = Number(form.value.gpa)
 if (Number.isNaN(gpa) || gpa < 0 || gpa > 4)
 e.gpa = 'GPA must be between 0.00 and 4.00.'
 if (!form.value.course.trim()) e.course = 'Course is required.'
 if (!form.value.faculty.trim()) e.faculty = 'Faculty is required.'
 errors.value = e
 return Object.keys(e).length === 0
}
function onSubmit() {
 if (!validate()) return
 emit('save', {
 ...form.value,
 matricNo: form.value.matricNo.trim().toUpperCase(),
 name: form.value.name.trim(),
 email: form.value.email.trim(),
 gpa: Number(form.value.gpa),
 year: Number(form.value.year)
 })
 if (!isEditing.value) form.value = emptyForm()
}
function onCancel() {
 emit('cancel')
 form.value = emptyForm()
 errors.value = {}
}

import { ref, watch, computed } from 'vue'
const props = defineProps({
 editingStudent: { type: Object, default: null }
})
const emit = defineEmits(['save', 'cancel'])
const emptyForm = () => ({
 matricNo: '', name: '', course: '', faculty: '',
 gpa: '', email: '', year: 1, active: true
})
const form = ref(emptyForm())
const errors = ref({})
watch(() => props.editingStudent, (val) => {
 form.value = val ? { ...val } : emptyForm()
 errors.value = {}
}, { immediate: true })
const isEditing = computed(() => Boolean(props.editingStudent))
</script>

<template>
 <form @submit.prevent="onSubmit" class="student-form">
 <h3>{{ isEditing ? 'Edit Student' : 'Add New Student' }}</h3>
 <label>Matric No
 <input v-model.trim="form.matricNo" placeholder="A21CS0001" />
 <span v-if="errors.matricNo" class="err">{{ errors.matricNo }}</span>
 </label>
 <label>Full Name
 <input v-model.trim="form.name" />
 <span v-if="errors.name" class="err">{{ errors.name }}</span>
 </label>
 <label>Course
 <input v-model.trim="form.course" />
 <span v-if="errors.course" class="err">{{ errors.course }}</span>
 </label>
 <label>Faculty
 <select v-model="form.faculty">
 <option value="">-- Select --</option>
 <option>FSKSM</option>
 <option>FKE</option>
 <option>FAB</option>
 </select>
 <span v-if="errors.faculty" class="err">{{ errors.faculty }}</span>
 </label>
 <label>Email
 <input v-model.trim="form.email" type="email" />
 <span v-if="errors.email" class="err">{{ errors.email }}</span>
 </label>
 <label>GPA
 <input v-model.number="form.gpa" type="number" step="0.01"
 min="0" max="4" />
 <span v-if="errors.gpa" class="err">{{ errors.gpa }}</span>
 </label>
 <label>Year
 <select v-model.number="form.year">
 <option v-for="y in [1,2,3,4,5,6]" :key="y" :value="y">{{ y }}</option>
 </select>
 </label>
 <label class="check">
 <input type="checkbox" v-model="form.active" /> Active student
 </label>
 <div class="actions">
 <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
 <button v-if="isEditing" type="button" @click="onCancel">Cancel</button>
 </div>
 </form>
</template>