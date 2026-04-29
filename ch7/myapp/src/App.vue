<template>
 <header>
 <nav>
 <router-link to="/">Home</router-link>
 <router-link to="/todos">Todos</router-link>
 </nav>
 </header>
 <main>
 <RouterView />
 </main>
</template>
<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
<style>
body { margin: 0; font-family: system-ui, sans-serif;
 background: #F1F5F9; color: #1F2937; }
header { background: #35495E; padding: 1rem; }
nav { max-width: 520px; margin: 0 auto; display: flex; gap: 1rem; }
nav a { color: #FFFFFF; text-decoration: none; font-weight: 600; }
nav a.router-link-active { color: #42B883; }
</style>