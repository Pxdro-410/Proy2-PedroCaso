<template>
  <nav class="navbar glass-panel">
    <div class="nav-brand">
      <div class="logo-icon"></div>
      <span class="brand-text">StoreAdmin</span>
    </div>
    <div class="nav-links">
      <RouterLink to="/" class="nav-link" active-class="active">Dashboard</RouterLink>
      <RouterLink to="/productos" class="nav-link" active-class="active">Productos</RouterLink>
      <RouterLink to="/categorias" class="nav-link" active-class="active">Categorías</RouterLink>
      <RouterLink to="/ventas" class="nav-link" active-class="active">Ventas</RouterLink>
      <RouterLink to="/reportes" class="nav-link" active-class="active">Reportes</RouterLink>
    </div>
    <div class="nav-actions">
      <div class="user-avatar">AD</div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  margin: 1rem;
  border-radius: 100px;
  position: sticky;
  top: 1rem;
  z-index: 100;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}
.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
}
.nav-links {
  display: flex;
  gap: 0.5rem;
}
.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}
.nav-link.active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--accent-primary);
}
</style>
