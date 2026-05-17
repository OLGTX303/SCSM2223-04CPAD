<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['change'])

const localFilters = reactive({ ...props.filters })

watch(
  () => props.filters,
  (filters) => Object.assign(localFilters, filters),
  { deep: true }
)

let searchTimer

function queueSearch() {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(applyFilters, 250)
}

function applyFilters() {
  emit('change', { ...localFilters, q: localFilters.q.trim() })
}

function resetFilters() {
  Object.assign(localFilters, { q: '', sortBy: 'name', order: 'asc' })
  applyFilters()
}
</script>

<template>
  <div class="toolbar">
    <label class="search-field">
      Search
      <input
        v-model.trim="localFilters.q"
        type="search"
        placeholder="Name, ID, email or department"
        @input="queueSearch"
      />
    </label>

    <label>
      Sort by
      <select v-model="localFilters.sortBy" @change="applyFilters">
        <option value="name">Name</option>
        <option value="hireDate">Hire date</option>
        <option value="salary">Salary</option>
        <option value="department">Department</option>
      </select>
    </label>

    <label>
      Order
      <select v-model="localFilters.order" @change="applyFilters">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </label>

    <button class="ghost-btn" type="button" @click="resetFilters">Reset</button>
  </div>
</template>
