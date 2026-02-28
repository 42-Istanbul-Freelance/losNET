<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <span class="not-found-icon">💙</span>
      <h1>404</h1>
      <p class="not-found-title">Sayfa Bulunamadı</p>
      <p class="not-found-desc">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <router-link to="/login" class="btn btn-primary">Giriş Sayfasına Dön</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.not-found-card {
  text-align: center;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
}

.not-found-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(124, 58, 237, 0.3));
}

.not-found-card h1 {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.not-found-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-top: 16px;
}

.not-found-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin-top: 8px;
  margin-bottom: 24px;
}

.not-found-card .btn {
  padding: 12px 24px;
  font-weight: 600;
}
</style>
