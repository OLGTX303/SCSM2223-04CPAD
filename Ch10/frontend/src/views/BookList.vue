<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import api from '../api/client';

const router = useRouter();

const books = ref([]);
const total = ref(0);
const page = ref(1);
const totalPages = ref(1);
const q = ref('');
const limit = ref(25);
const error = ref('');
const ok = ref('');
const loading = ref(false);

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, page.value - 2);
  const end = Math.min(totalPages.value, page.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

async function load() {
  error.value = '';
  loading.value = true;

  try {
    const params = {
      page: page.value,
      limit: limit.value,
    };

    if (q.value) {
      params.q = q.value;
    }

    const { data } = await api.get('/api/books', { params });
    books.value = data.data;
    total.value = data.count;
    page.value = data.page ?? page.value;
    totalPages.value = data.total_pages ?? 1;
  } catch (e) {
    error.value = e.response?.data?.error || e.message;
  } finally {
    loading.value = false;
  }
}

function search() {
  page.value = 1;
  load();
}

function goToPage(nextPage) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
    return;
  }

  page.value = nextPage;
  load();
}

async function remove(book) {
  if (!confirm(`Delete "${book.title}"?`)) return;

  error.value = '';
  ok.value = '';

  try {
    await api.delete(`/api/books/${book.id}`);
    ok.value = `Deleted "${book.title}"`;
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || e.message;
  }
}

watch(limit, () => {
  page.value = 1;
  load();
});

onMounted(load);
</script>

<template>
  <p class="note">
    <strong>Persistent storage!</strong> The Chapter 10 backend uses MySQL through PDO.
    Restart the server and refresh; your books are still there.
  </p>

  <div class="card">
    <div class="row" style="align-items: end;">
      <div style="flex: 2;">
        <label>Search by title or author</label>
        <input v-model="q" placeholder="e.g. clean" @keyup.enter="search" />
      </div>
      <div style="max-width: 140px;">
        <label>Per page</label>
        <input v-model.number="limit" type="number" min="1" max="100" />
      </div>
      <div>
        <button class="primary" :disabled="loading" @click="search">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
      <div>
        <button class="primary" @click="router.push({ name: 'create' })">+ New book</button>
      </div>
    </div>
  </div>

  <p v-if="error" class="alert error">{{ error }}</p>
  <p v-if="ok" class="alert ok">{{ ok }}</p>

  <div v-if="books.length" class="card">
    <div class="list-summary">
      <span>Showing {{ books.length }} of {{ total }}</span>
      <span>Page {{ page }} of {{ totalPages }}</span>
    </div>

    <div class="book" v-for="b in books" :key="b.id">
      <div>
        <RouterLink :to="{ name: 'book', params: { id: b.id } }">
          <strong>{{ b.title }}</strong>
        </RouterLink>
        <span class="tag">{{ b.year }}</span>
        <div class="meta">{{ b.author }} - {{ b.genre }}</div>
      </div>
      <div class="actions">
        <button @click="router.push({ name: 'edit', params: { id: b.id } })">Edit</button>
        <button class="danger" @click="remove(b)">Delete</button>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page === 1 || loading" @click="goToPage(1)">First</button>
      <button :disabled="page === 1 || loading" @click="goToPage(page - 1)">Previous</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        :class="{ active: p === page }"
        :disabled="loading"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
      <button :disabled="page === totalPages || loading" @click="goToPage(page + 1)">Next</button>
      <button :disabled="page === totalPages || loading" @click="goToPage(totalPages)">Last</button>
    </div>
  </div>

  <p v-else class="card" style="text-align: center; color: var(--muted);">
    No books match; try a different search or click <strong>+ New book</strong>.
  </p>
</template>
