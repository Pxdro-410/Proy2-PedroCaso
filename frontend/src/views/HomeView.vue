<template>
  <div class="page-container">
    <h1 class="page-title">Dashboard</h1>
    <div class="glass-panel p-6" style="margin-bottom: 2rem;">
      <h2 style="margin-bottom: 1rem; color: var(--text-primary)">Bienvenido al Sistema de Inventario y Ventas</h2>
      <p class="text-secondary">
        Utiliza el menú de navegación para gestionar tus productos, categorías, realizar ventas y consultar reportes.
      </p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
      <div class="glass-panel p-6" style="text-align: center;">
        <h3 style="color: var(--accent-primary); margin-bottom: 0.5rem; font-size: 2rem;">📦</h3>
        <h4>Productos</h4>
      </div>
      <div class="glass-panel p-6" style="text-align: center;">
        <h3 style="color: var(--accent-secondary); margin-bottom: 0.5rem; font-size: 2rem;">🏷️</h3>
        <h4>Categorías</h4>
      </div>
      <div class="glass-panel p-6" style="text-align: center;">
        <h3 style="color: var(--success); margin-bottom: 0.5rem; font-size: 2rem;">💰</h3>
        <h4>Ventas</h4>
      </div>
      <div class="glass-panel p-6" style="text-align: center;">
        <h3 style="color: var(--danger); margin-bottom: 0.5rem; font-size: 2rem;">📊</h3>
        <h4>Reportes</h4>
      </div>
    </div>
  </div>
</template>