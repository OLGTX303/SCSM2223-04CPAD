<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  editingEmployee: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  },
  resetToken: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['save', 'cancel'])

const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations']
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const form = reactive(getEmptyForm())
const errors = ref({})

const title = computed(() => (props.editingEmployee ? 'Edit Employee' : 'Add Employee'))

watch(
  () => props.editingEmployee,
  (employee) => {
    Object.assign(form, employee ? toForm(employee) : getEmptyForm())
    errors.value = {}
  },
  { immediate: true }
)

watch(
  () => props.resetToken,
  () => {
    if (!props.editingEmployee) resetForm()
  }
)

function submitForm() {
  const nextErrors = validate()
  errors.value = nextErrors
  if (Object.keys(nextErrors).length) return

  emit('save', {
    empId: form.empId.trim().toUpperCase(),
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    department: form.department,
    position: form.position.trim(),
    hireDate: form.hireDate,
    salary: Number(form.salary),
    active: form.active
  })

}

function resetForm() {
  Object.assign(form, getEmptyForm())
  errors.value = {}
}

function cancelEdit() {
  resetForm()
  emit('cancel')
}

function validate() {
  const nextErrors = {}
  const today = new Date().toISOString().slice(0, 10)

  if (!form.empId) nextErrors.empId = 'Employee ID is required.'
  else if (!/^EMP[0-9]{3,5}$/.test(form.empId.trim().toUpperCase())) {
    nextErrors.empId = 'Use EMP followed by 3 to 5 digits, for example EMP001.'
  }

  if (!form.name || form.name.trim().length < 3) nextErrors.name = 'Name must be at least 3 characters.'
  if (!emailRegex.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
  if (!form.department) nextErrors.department = 'Choose a department.'
  if (!form.position || !form.position.trim()) nextErrors.position = 'Position is required.'
  if (!form.hireDate) nextErrors.hireDate = 'Hire date is required.'
  else if (form.hireDate > today) nextErrors.hireDate = 'Hire date cannot be in the future.'
  if (!Number.isFinite(Number(form.salary))) nextErrors.salary = 'Salary must be numeric.'
  else if (Number(form.salary) < 1500 || Number(form.salary) > 50000) {
    nextErrors.salary = 'Salary must be between RM1,500 and RM50,000.'
  }

  return nextErrors
}

function getEmptyForm() {
  return {
    empId: '',
    name: '',
    email: '',
    department: '',
    position: '',
    hireDate: '',
    salary: 1500,
    active: true
  }
}

function toForm(employee) {
  return {
    empId: employee.empId,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    position: employee.position,
    hireDate: employee.hireDate,
    salary: Number(employee.salary),
    active: Boolean(employee.active)
  }
}
</script>

<template>
  <form class="employee-form" novalidate @submit.prevent="submitForm">
    <div class="form-heading">
      <div>
        <p class="eyebrow">{{ editingEmployee ? editingEmployee.empId : 'New record' }}</p>
        <h2>{{ title }}</h2>
      </div>
      <button v-if="editingEmployee" class="ghost-btn" type="button" @click="cancelEdit">Cancel</button>
    </div>

    <label>
      Employee ID
      <input v-model.trim="form.empId" type="text" placeholder="EMP001" :aria-invalid="Boolean(errors.empId)" />
      <span v-if="errors.empId" class="field-error">{{ errors.empId }}</span>
    </label>

    <label>
      Full Name
      <input v-model.trim="form.name" type="text" placeholder="Aina Sofia Rahman" :aria-invalid="Boolean(errors.name)" />
      <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
    </label>

    <label>
      Email
      <input v-model.trim="form.email" type="email" placeholder="name@company.my" :aria-invalid="Boolean(errors.email)" />
      <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
    </label>

    <div class="form-row">
      <label>
        Department
        <select v-model="form.department" :aria-invalid="Boolean(errors.department)">
          <option value="">Select department</option>
          <option v-for="department in departments" :key="department" :value="department">{{ department }}</option>
        </select>
        <span v-if="errors.department" class="field-error">{{ errors.department }}</span>
      </label>

      <label>
        Position
        <input v-model.trim="form.position" type="text" placeholder="Systems Analyst" :aria-invalid="Boolean(errors.position)" />
        <span v-if="errors.position" class="field-error">{{ errors.position }}</span>
      </label>
    </div>

    <div class="form-row">
      <label>
        Hire Date
        <input v-model="form.hireDate" type="date" :aria-invalid="Boolean(errors.hireDate)" />
        <span v-if="errors.hireDate" class="field-error">{{ errors.hireDate }}</span>
      </label>

      <label>
        Salary (RM)
        <input v-model.number="form.salary" type="number" min="1500" max="50000" step="100" :aria-invalid="Boolean(errors.salary)" />
        <span v-if="errors.salary" class="field-error">{{ errors.salary }}</span>
      </label>
    </div>

    <label class="switch-row">
      <input v-model="form.active" type="checkbox" />
      <span>Active employee</span>
    </label>

    <button class="primary-btn" type="submit" :disabled="saving">
      {{ saving ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Add Employee' }}
    </button>
  </form>
</template>
