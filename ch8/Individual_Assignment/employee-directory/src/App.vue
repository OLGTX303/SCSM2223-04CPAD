<script setup>
import { onMounted, ref } from 'vue'
import EmployeeForm from './components/EmployeeForm.vue'
import EmployeeList from './components/EmployeeList.vue'
import SearchSortControls from './components/SearchSortControls.vue'
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from './services/api'

const employees = ref([])
const selectedEmployee = ref(null)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const resetToken = ref(0)
const pagination = ref({
  page: 1,
  pageSize: 7,
  total: 0,
  activeTotal: 0,
  inactiveTotal: 0,
  totalPages: 1
})
const filters = ref({
  q: '',
  sortBy: 'name',
  order: 'asc'
})

onMounted(loadEmployees)

async function loadEmployees() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await fetchEmployees({
      ...filters.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })
    employees.value = result.data
    pagination.value = {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      activeTotal: result.activeTotal,
      inactiveTotal: result.inactiveTotal,
      totalPages: result.totalPages
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function handleFilterChange(nextFilters) {
  filters.value = nextFilters
  pagination.value.page = 1
  await loadEmployees()
}

async function handlePageChange(nextPage) {
  pagination.value.page = nextPage
  await loadEmployees()
}

async function handleSave(employee) {
  saving.value = true
  errorMessage.value = ''
  try {
    if (selectedEmployee.value) {
      await updateEmployee(selectedEmployee.value.id, employee)
      selectedEmployee.value = null
    } else {
      await createEmployee(employee)
      resetToken.value += 1
    }
    await loadEmployees()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}

function handleEdit(employee) {
  selectedEmployee.value = { ...employee }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleDelete(employee) {
  const confirmed = window.confirm(`Delete ${employee.name} (${employee.empId})?`)
  if (!confirmed) return

  loading.value = true
  errorMessage.value = ''
  try {
    await deleteEmployee(employee.id)
    if (selectedEmployee.value?.id === employee.id) selectedEmployee.value = null
    await loadEmployees()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

function clearSelection() {
  selectedEmployee.value = null
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar" aria-label="Admin navigation">
      <div class="brand-block">
        <div class="brand-icon">HR</div>
        <div>
          <strong>Admin Console</strong>
          <span>HR Department</span>
        </div>
      </div>

      <nav class="side-nav">
        <a href="#">Overview</a>
        <a class="active" href="#">Employees</a>
        <a href="#">Org Chart</a>
        <a href="#">Settings</a>
      </nav>

      <div class="help-card">
        <strong>Help Center</strong>
        <span>Assignment support</span>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <strong>HR Portal</strong>
        <nav>
          <a href="#">Dashboard</a>
          <a class="active" href="#">Directory</a>
          <a href="#">Analytics</a>
          <a href="#">Reports</a>
        </nav>
      </header>

      <main class="app-shell">
        <section class="page-header">
          <div>
            <p class="eyebrow">Human Resources</p>
            <h1>Employee Directory</h1>
            <p class="subtitle">Manage staff records with Vue, Axios, Express and MySQL.</p>
          </div>
        </section>

        <section class="stats" aria-label="Employee summary">
          <div class="stat-card total">
            <span class="stat-icon">T</span>
            <p>Total Employees</p>
            <strong>{{ pagination.total }}</strong>
          </div>
          <div class="stat-card active">
            <span class="stat-icon">A</span>
            <p>Active Employees</p>
            <strong>{{ pagination.activeTotal }}</strong>
          </div>
          <div class="stat-card inactive">
            <span class="stat-icon">I</span>
            <p>Inactive Employees</p>
            <strong>{{ pagination.inactiveTotal }}</strong>
          </div>
        </section>

        <div v-if="errorMessage" class="banner" role="alert">{{ errorMessage }}</div>

        <section class="workspace">
          <EmployeeForm
            :editing-employee="selectedEmployee"
            :saving="saving"
            :reset-token="resetToken"
            @save="handleSave"
            @cancel="clearSelection"
          />

          <section class="directory-panel">
            <SearchSortControls :filters="filters" @change="handleFilterChange" />
            <EmployeeList
              :employees="employees"
              :loading="loading"
              :pagination="pagination"
              @edit="handleEdit"
              @delete="handleDelete"
              @page-change="handlePageChange"
            />
          </section>
        </section>
      </main>
    </div>
  </div>
</template>
