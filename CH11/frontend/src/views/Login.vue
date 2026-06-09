<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useAuth } from '../stores/auth';

const auth   = useAuth();
const router = useRouter();
const route  = useRoute();

const email    = ref('member@books.test');
const password = ref('password');
const error    = ref('');
const busy     = ref(false);

async function submit() {
  error.value = '';
  busy.value  = true;
  try {
    await auth.login(email.value, password.value);
    router.push(route.query.redirect ?? '/');
  } catch (e) {
    error.value = e.response?.status === 401
      ? 'Invalid email or password.'
      : (e.response?.data?.error || e.message);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="card" style="max-width: 420px; margin: 32px auto;">
    <h2 style="margin-top: 0;">Sign in</h2>
    <p v-if="error" class="alert error">{{ error }}</p>

    <label>Email</label>
    <input v-model="email" type="email" autocomplete="email" />

    <label>Password</label>
    <input v-model="password" type="password" autocomplete="current-password" />

    <p style="margin-top: 18px;">
      <button class="primary" :disabled="busy" @click="submit">
        {{ busy ? 'Signing in…' : 'Sign in' }}
      </button>
    </p>
    <p style="font-size: 13px; color: var(--muted);">
      No account? <RouterLink to="/register">Register</RouterLink>
    </p>
    <p class="note" style="margin-top: 24px;">
      <strong>Seeded demo users:</strong><br>
      admin@books.test / password — admin (can delete books)<br>
      member@books.test / password — member (can create + edit)
    </p>
  </div>
</template>
