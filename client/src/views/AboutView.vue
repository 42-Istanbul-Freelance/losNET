<template>
  <div class="about-container">
    <div class="about-card">
      <span class="about-icon">💙</span>
      <h1>LÖSEV İnci Hakkında</h1>
      <p class="about-subtitle">Gönüllülük Takip Sistemi</p>

      <div class="about-content">
        <p>Bu sistem, LÖSEV İnci öğrencilerinin sosyal sorumluluk çalışmalarını kayıt altına alan, doğrulayan ve raporlayan bir takip sistemidir.</p>

        <h2>Sistemin Amacı</h2>
        <ul>
          <li>Sosyal sorumluluk çalışmalarını düzenli takip etmek</li>
          <li>Gönüllülük saatlerini kayıt altına almak</li>
          <li>Okul bazlı performans ölçümü yapmak</li>
          <li>Türkiye geneli etki analizi oluşturmak</li>
          <li>Üniversite başvurularında kullanılabilecek dijital gönüllülük dokümanı üretmek</li>
        </ul>

        <h2>Hedef Kitle</h2>
        <p>Ortaokul ve lise öğrencileri, okul koordinatör öğretmenleri ve genel merkez raporlama birimi.</p>
      </div>

      <router-link to="/login" class="btn btn-primary">Giriş Yap</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
.about-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.about-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  max-width: 560px;
  box-shadow: var(--shadow-lg);
}

.about-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
  filter: drop-shadow(0 6px 12px rgba(77, 182, 172, 0.4));
}

.about-card h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #00897b, #ff9800, #4db6ac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-subtitle {
  color: var(--text-secondary);
  font-size: 15px;
  margin-top: 8px;
  font-weight: 600;
}

.about-content {
  margin: 32px 0;
  text-align: left;
}

.about-content p {
  margin-bottom: 16px;
  color: var(--text);
  line-height: 1.6;
}

.about-content h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-top: 24px;
  margin-bottom: 12px;
}

.about-content ul {
  margin: 0 0 16px 20px;
  color: var(--text);
}

.about-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.about-card .btn {
  padding: 12px 24px;
  font-weight: 600;
}
</style>
