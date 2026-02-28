<template>
  <div class="landing-page">
    
    <!-- Navbar için üst ayırma alanı (opsiyonel), auth layoutta navbar yok, padding bırakalım -->
    <header class="landing-header">
      <div class="logo">
        <span class="logo-icon">💙</span>
        <span class="logo-text">LÖSEV İnci</span>
      </div>
      <div class="header-actions">
        <!-- Zaten login veya register'a yönlendiriyoruz -->
      </div>
    </header>

    <!-- Zemin Şekilleri -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="shape shape-6"></div>
      <div class="shape shape-7"></div>
    </div>

    <!-- 1. Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Gönüllülüğün En <span class="highlight">Parlama</span> Hali</h1>
        <p class="hero-description">
          LÖSEV İnci Gönüllülük Takip Sistemi ile okullardaki gençlerimiz LÖSEV faaliyetlerine katılıyor, sorumluluk bilinci kazanıyor ve iyilik yolculuklarını rozetlerle taçlandırıyorlar.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn btn-primary btn-lg">Aramıza Katıl</router-link>
          <router-link to="/login" class="btn btn-outline btn-lg">Giriş Yap</router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="mockup-card">
          <span class="mockup-icon">🌟</span>
          <h3>İyilik Elçisi Ol!</h3>
          <p>Sen de LÖSEV İnci'nin bir parçası ol ve gülen yüzlere umut taşı.</p>
        </div>
      </div>
    </section>

    <!-- 2. Neden LÖSEV İnci? (Features) -->
    <section class="features-section">
      <div class="section-header animate-on-scroll">
        <h2 class="section-title">Neden LÖSEV İnci?</h2>
        <p class="section-subtitle">Gençlerin sosyal gelişimini destekleyen ve iyiliği ödüllendiren bir platform.</p>
      </div>
      <div class="features-grid animate-on-scroll" style="transition-delay: 0.2s;">
        <div class="feature-card">
          <div class="feature-icon">🎓</div>
          <h3 class="feature-title">Sosyal Sorumluluk</h3>
          <p class="feature-desc">Okuldaki teorik eğitimi pratik ve faydalı bir sosyal sorumluluk projesine dönüştürüyoruz.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3 class="feature-title">Dijital Takip</h3>
          <p class="feature-desc">Öğrencilerin tüm gönüllülük faaliyetleri, saatleri ve onay durumları tek bir ekranda.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🏅</div>
          <h3 class="feature-title">Oyunlaştırma</h3>
          <p class="feature-desc">Belirli saatlere ulaşan öğrenciler Bronz, Gümüş, Altın ve Platin rozetler kazanarak motive oluyor.</p>
        </div>
      </div>
    </section>

    <!-- 3. Nasıl Çalışır? (Steps) -->
    <section class="steps-section">
      <div class="section-header animate-on-scroll">
        <h2 class="section-title">Süreç Nasıl Çalışır?</h2>
        <p class="section-subtitle">Sisteme dahil olmak ve faaliyet yürütmek çok kolay.</p>
      </div>
      <div class="steps-container">
        
        <div class="step-item animate-on-scroll" style="transition-delay: 0.1s;">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Kayıt Olun</h4>
            <p>Öğrenci veya koordinatör öğretmen olarak sisteme kayıt yapın ve okulunuzu seçin.</p>
          </div>
        </div>

        <div class="step-item animate-on-scroll" style="transition-delay: 0.3s;">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Faaliyet Ekleyin</h4>
            <p>Stand, seminer veya dijital farkındalık gibi LÖSEV etkinliklerine katılıp portala yükleyin.</p>
          </div>
        </div>

        <div class="step-item animate-on-scroll" style="transition-delay: 0.5s;">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Onay Alın</h4>
            <p>Öğretmeniniz veya Genel Merkez faaliyetlerinizi inceleyip onaylasın.</p>
          </div>
        </div>

        <div class="step-item animate-on-scroll" style="transition-delay: 0.7s;">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>Sertifikanızı Alın</h4>
            <p>Saatleriniz biriktikçe seviye atlayın ve başarı sertifikanızı dijital olarak elde edin!</p>
          </div>
        </div>

      </div>
    </section>

    <!-- 4. Etki & Hedef (Impact) -->
    <section class="impact-section">
      <div class="impact-card animate-on-scroll">
        <div class="impact-content">
          <h2>Birlikte Daha Güçlüyüz!</h2>
          <p>Her bir saat gönüllülük, lösemili çocuklarımız ve aileleri için umut demek. LÖSEV İnci ile Türkiye genelinde binlerce öğrenci aynı iyilik hedefine koşuyor.</p>
          <div class="impact-stats">
            <div class="stat">
              <span class="stat-num">81</span>
              <span class="stat-text">İl</span>
            </div>
            <div class="stat">
              <span class="stat-num">1000+</span>
              <span class="stat-text">Okul</span>
            </div>
            <div class="stat">
              <span class="stat-num">∞</span>
              <span class="stat-text">Umut</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Footer & CTA -->
    <footer class="landing-footer">
      <div class="footer-cta animate-on-scroll">
        <h2>Bu İyilik Yolculuğuna Hazır mısın?</h2>
        <p>Hemen kayıt ol ve LÖSEV İnci rozetini kazanmaya başla.</p>
        <router-link to="/register" class="btn btn-primary btn-lg pulse-btn">Hemen Başla</router-link>
      </div>
      <div class="footer-bottom">
        <div class="footer-logo">
          <span class="logo-icon">💙</span> LÖSEV İnci
        </div>
        <p class="copyright">&copy; 2026 LÖSEV - Tüm Hakları Saklıdır.</p>
        <div class="footer-links">
          <router-link to="/about">Hakkında</router-link>
          <a href="#">Gizlilik Politikası</a>
          <a href="#">İletişim</a>
        </div>
      </div>
    </footer>

  </div>
</template>

<script>
export default {
  name: 'HomeView',
  mounted() {
    // Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    // Observe all elements with .animate-on-scroll class
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
  }
}
</script>

<style scoped>
/* Genel Ayarlar & Konteyner */
.landing-page {
  width: 100vw;
  height: 100vh; /* Fixed height for scroll snapping */
  position: relative;
  overflow-x: hidden;
  overflow-y: scroll;
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory; /* Magnetic scroll */
}

/* Scroll Animasyonları Cihazı */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Header */
.landing-header {
  width: 100%;
  padding: 24px 48px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #00897b;
}

.logo-icon {
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
}

/* Yüzen Şekiller */
.floating-shapes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  animation: floatShape 20s ease-in-out infinite;
}

.shape-1 { width: 300px; height: 300px; background: radial-gradient(circle, #81d4fa 0%, transparent 70%); top: -10%; left: -5%; }
.shape-2 { width: 400px; height: 400px; background: radial-gradient(circle, #ffaaa5 0%, transparent 70%); top: 40%; right: -10%; animation-delay: -5s; }
.shape-3 { width: 200px; height: 200px; background: radial-gradient(circle, #a8e6cf 0%, transparent 70%); bottom: -5%; left: 20%; animation-delay: -10s; }
.shape-4 { width: 150px; height: 150px; background: radial-gradient(circle, #fff9c4 0%, transparent 70%); top: 20%; left: 40%; animation-delay: -3s; }
.shape-5 { width: 100px; height: 100px; background: radial-gradient(circle, #ffd3b6 0%, transparent 70%); bottom: 30%; right: 25%; animation-delay: -7s; }
.shape-6 { width: 250px; height: 250px; background: radial-gradient(circle, #b3e5fc 0%, transparent 70%); top: 70%; left: -10%; animation-delay: -15s; }
.shape-7 { width: 350px; height: 350px; background: radial-gradient(circle, #ffcc80 0%, transparent 70%); top: -15%; right: 20%; opacity: 0.3; animation-delay: -8s; }

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(30px, -40px) scale(1.1) rotate(10deg); }
  50% { transform: translate(-20px, 30px) scale(0.95) rotate(-5deg); }
  75% { transform: translate(40px, 20px) scale(1.05) rotate(5deg); }
}

/* Tasarım Sistemi Utility */
.highlight {
  background: linear-gradient(135deg, #ff9800, #ffb74d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

section {
  position: relative;
  z-index: 1;
  padding: 100px 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  /* Scroll Snap Ayarları */
  scroll-snap-align: start;
  scroll-snap-stop: always;
  min-height: 100vh; /* Her section en az 1 viewport boyunda */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #00897b;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 18px;
  color: #546e7a;
  max-width: 600px;
  margin: 0 auto;
}

/* 1. Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding-top: 120px;
  gap: 60px;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 56px;
  font-weight: 700;
  color: #2f3640;
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-description {
  font-size: 19px;
  color: #546e7a;
  line-height: 1.7;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 18px 40px;
  font-size: 18px;
  border-radius: 30px;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
  padding: 40px;
  border-radius: 50%;
}

.mockup-card {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  padding: 40px 30px;
  border-radius: 30px;
  text-align: center;
  box-shadow: 0 30px 60px rgba(77, 182, 172, 0.2);
  border: 4px solid rgba(255,255,255,0.9);
  max-width: 320px;
  transform: rotate(3deg);
  animation: floatMockup 6s ease-in-out infinite;
}

@keyframes floatMockup {
  0%, 100% { transform: translateY(0) rotate(3deg); }
  50% { transform: translateY(-20px) rotate(-1deg); }
}

.mockup-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}
.mockup-card h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 24px;
  color: #00897b;
  margin-bottom: 12px;
}
.mockup-card p {
  color: #546e7a;
  font-size: 15px;
}

/* 2. Özellikler */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(16px);
  padding: 40px 32px;
  border-radius: 32px;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0,0,0,0.04);
  border: 2px solid rgba(255,255,255,0.9);
  transition: all 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 24px 48px rgba(77, 182, 172, 0.15);
  background: rgba(255,255,255,0.9);
}

.feature-icon {
  font-size: 56px;
  margin-bottom: 24px;
  display: inline-block;
  background: linear-gradient(135deg, #e0f2f1, #b2dfdb);
  padding: 20px;
  border-radius: 24px;
  box-shadow: inset 0 4px 12px rgba(255,255,255,0.8);
}

.feature-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 22px;
  color: #2f3640;
  margin-bottom: 16px;
}

.feature-desc {
  color: #546e7a;
  font-size: 15px;
  line-height: 1.6;
}

/* 3. Steps */
.steps-section {
  background: linear-gradient(180deg, transparent, rgba(224, 242, 241, 0.4), transparent);
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
  border-left: 6px solid #4db6ac;
  transition: transform 0.3s;
}

.step-item:hover {
  transform: translateX(10px);
  background: #ffffff;
}

.step-number {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  background: #4db6ac;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(77, 182, 172, 0.3);
}

.step-content h4 {
  font-family: 'Fredoka', sans-serif;
  font-size: 22px;
  color: #2f3640;
  margin-bottom: 8px;
}

.step-content p {
  color: #546e7a;
  font-size: 16px;
}

/* 4. Impact */
.impact-card {
  background: linear-gradient(135deg, #00897b, #4db6ac);
  border-radius: 40px;
  padding: 64px 40px;
  color: white;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 137, 123, 0.3);
  position: relative;
  overflow: hidden;
}

/* İç dekorasyon */
.impact-card::before {
  content: '💙';
  position: absolute;
  font-size: 200px;
  opacity: 0.1;
  top: -40px;
  right: -20px;
  transform: rotate(15deg);
}

.impact-content {
  position: relative;
  z-index: 1;
}

.impact-content h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 36px;
  margin-bottom: 24px;
}

.impact-content p {
  font-size: 18px;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto 48px;
  line-height: 1.7;
}

.impact-stats {
  display: flex;
  justify-content: center;
  gap: 64px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-family: 'Fredoka', sans-serif;
  font-size: 56px;
  font-weight: 700;
  color: #fff9c4;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-text {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 1px;
}

/* 5. Footer CTA */
.landing-footer {
  width: 100%;
  padding: 80px 24px 40px;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.8);
  position: relative;
  z-index: 1;
  scroll-snap-align: end;
}

.footer-cta {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 80px;
}

.footer-cta h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 32px;
  color: #2f3640;
  margin-bottom: 16px;
}

.footer-cta p {
  color: #546e7a;
  font-size: 18px;
  margin-bottom: 32px;
}

.pulse-btn {
  animation: pulseBtn 2s infinite;
}

@keyframes pulseBtn {
  0% { box-shadow: 0 0 0 0 rgba(77, 182, 172, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(77, 182, 172, 0); }
  100% { box-shadow: 0 0 0 0 rgba(77, 182, 172, 0); }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
  padding-top: 32px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.footer-logo {
  font-family: 'Fredoka', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #00897b;
}

.copyright {
  color: #7d6b9a;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: #546e7a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #00897b;
}

/* Buton Stilleri (App.vue'dan miras alınmayanlar için) */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #4db6ac, #ff9800);
  color: white;
  box-shadow: 0 8px 24px rgba(77, 182, 172, 0.4);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #00897b, #f57c00);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(77, 182, 172, 0.5);
  color: white;
}

.btn-outline {
  border-color: #00897b;
  color: #00897b;
  background: transparent;
}

/* Mobil Uyumluluk */
@media (max-width: 900px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding-top: 140px;
  }
  .hero-content {
    margin: 0 auto;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-title {
    font-size: 44px;
  }
  .impact-stats {
    gap: 32px;
  }
}

@media (max-width: 600px) {
  section {
    padding: 60px 20px;
  }
  .hero-title {
    font-size: 36px;
  }
  .btn-lg {
    width: 100%;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    border-left: none;
    border-top: 6px solid #4db6ac;
  }
}
</style>
