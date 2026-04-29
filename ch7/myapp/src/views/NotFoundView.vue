<template>
  <section class="not-found">
    <h1>Page not found</h1>
    <p>Sorry, that page does not exist. You can go back home or open your todo list.</p>
    <div class="actions">
      <router-link to="/">Home</router-link>
      <router-link to="/todos">Todos</router-link>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  max-width: 520px;
  margin: 3rem auto;
  padding: 1rem;
  text-align: center;
}

h1 {
  color: #35495e;
}

p {
  color: #64748b;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.actions a {
  padding: 0.6rem 1rem;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  background: #42b883;
  border-radius: 6px;
}
</style>
