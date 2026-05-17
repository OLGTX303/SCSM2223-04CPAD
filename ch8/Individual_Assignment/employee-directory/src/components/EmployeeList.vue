<script setup>
defineProps({
  employees: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'page-change'])

const moneyFormatter = new Intl.NumberFormat('ms-MY', {
  style: 'currency',
  currency: 'MYR'
})

function formatSalary(value) {
  return moneyFormatter.format(Number(value))
}
</script>

<template>
  <div class="list-shell">
    <div v-if="loading" class="loading-state">Loading employees...</div>

    <div v-else-if="!employees.length" class="empty-state">
      No employees found.
    </div>

    <div v-else>
      <div class="pagination-bar pagination-bar-top">
        <p>
          Page {{ pagination.page }} of {{ pagination.totalPages }}
          <span>{{ pagination.total }} records</span>
        </p>
        <div class="pagination-actions">
          <button
            class="ghost-btn"
            type="button"
            :disabled="pagination.page <= 1"
            @click="$emit('page-change', pagination.page - 1)"
          >
            Previous
          </button>
          <button
            class="ghost-btn"
            type="button"
            :disabled="pagination.page >= pagination.totalPages"
            @click="$emit('page-change', pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="employee.id">
              <td>
                <strong>{{ employee.name }}</strong>
                <span>{{ employee.empId }} - {{ employee.email }}</span>
              </td>
              <td>{{ employee.department }}</td>
              <td>{{ employee.position }}</td>
              <td>{{ employee.hireDate }}</td>
              <td>{{ formatSalary(employee.salary) }}</td>
              <td>
                <span class="badge" :class="employee.active ? 'active' : 'inactive'">
                  {{ employee.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="ghost-btn" type="button" @click="$emit('edit', employee)">Edit</button>
                  <button class="danger-btn" type="button" @click="$emit('delete', employee)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <p>
          Page {{ pagination.page }} of {{ pagination.totalPages }}
          <span>{{ pagination.total }} records</span>
        </p>
        <div class="pagination-actions">
          <button
            class="ghost-btn"
            type="button"
            :disabled="pagination.page <= 1"
            @click="$emit('page-change', pagination.page - 1)"
          >
            Previous
          </button>
          <button
            class="ghost-btn"
            type="button"
            :disabled="pagination.page >= pagination.totalPages"
            @click="$emit('page-change', pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
