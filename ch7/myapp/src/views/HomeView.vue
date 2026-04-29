<template>
 <section class="hero">
 <h1>Todo SPA</h1>
 <p>Built with Vue 3, Vite, Vue Router and Pinia.</p>
 <router-link to="/todos" class="cta">Open my todos &rarr;</router-link>
 </section>
</template>
<style scoped>
.hero { text-align: center; padding: 4rem 1rem; }
h1 { font-size: 3rem; color: #35495E; margin: 0; }
p { color: #64748B; }
.cta {
 display: inline-block; margin-top: 1.5rem;
 background: #42B883; color: #FFFFFF;
 padding: .8rem 1.4rem; border-radius: 8px;
 text-decoration: none; font-weight: 600;
 }
.cta:hover { background: #33A06F; }
</style>
