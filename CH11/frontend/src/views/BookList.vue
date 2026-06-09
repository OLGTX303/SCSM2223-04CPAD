<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/client';
import { useAuth } from '../stores/auth';
import BookForm from '../components/BookForm.vue';

const auth   = useAuth();

const books   = ref([]);
const q       = ref('');
const error   = ref('');
const ok      = ref('');
const editing = ref(null);   // null | 'new' | bookObj
const loading = ref(false);

async function load() {
  error.value = '';
  loading.value = true;
  try {
    const { data } = await api.get('/api/books', { params: { q: q.value || undefined } });
    books.value = data.data;
  } catch (e) {
    error.value = e.response?.data?.error || e.message;
  } finally {
    loading.value = false;
  }
}

async function save(book) {
  error.value = ''; ok.value = '';
  try {
    if (book.id) {
      await api.put(`/api/books/${book.id}`, book);
      ok.value = 'Book updated';
    } else {
      await api.post('/api/books', book);
      ok.value = 'Book created';
    }
    editing.value = null;
    await load();
  } catch (e) {
    const d = e.response?.data;
    if (e.response?.status === 401) {
      error.value = 'Please sign in first.';
    } else {
      error.value = d?.errors ? Object.values(d.errors).join(' • ') : (d?.error || e.message);
    }
  }
}

async function remove(book) {
  if (!confirm(`Delete "${book.title}"?`)) return;
  error.value = ''; ok.value = '';
  try {
    await api.delete(`/api/books/${book.id}`);
    ok.value = `Deleted "${book.title}"`;
    await load();
  } catch (e) {
    if (e.response?.status === 403) {
      error.value = 'Only admins can delete books.';
    } else {
      error.value = e.response?.data?.error || e.message;
    }
  }
}

onMounted(load);
</script>

<template>
  <div class="card">
    <div class="row" style="align-items: end;">
      <div style="flex: 2;">
        <label>Search by title or author</label>
        <input v-model="q" placeholder="e.g. clean" @keyup.enter="load" />
      </div>
      <div>
        <button class="primary" :disabled="loading" @click="load">
          {{ loading ? 'Loading…' : 'Search' }}
        </button>
      </div>
      <div v-if="auth.isAuthenticated">
        <button class="primary" @click="editing = 'new'">+ New book</button>
      </div>
    </div>
    <p v-if="!auth.isAuthenticated" class="note" style="margin: 14px 0 0;">
      You're browsing as a guest. <strong>Login</strong> to create or edit books.
    </p>
  </div>

  <BookForm
    v-if="editing !== null && auth.isAuthenticated"
    :book="editing === 'new' ? null : editing"
    @save="save"
    @cancel="editing = null"
  />

  <p v-if="error" class="alert error">{{ error }}</p>
  <p v-if="ok"    class="alert ok">{{ ok }}</p>

  <div v-if="books.length" class="card">
    <div class="book" v-for="b in books" :key="b.id">
      <div>
        <strong>{{ b.title }}</strong>
        <span class="tag">{{ b.year }}</span>
        <div class="meta">{{ b.author }} • {{ b.genre }}</div>
      </div>
      <div class="actions" v-if="auth.isAuthenticated">
        <button @click="editing = { ...b }">Edit</button>
        <button class="danger" v-if="auth.isAdmin" @click="remove(b)">Delete</button>
      </div>
    </div>
  </div>
  <p v-else class="card" style="text-align: center; color: var(--muted);">
    No books found.
  </p>
</template>
