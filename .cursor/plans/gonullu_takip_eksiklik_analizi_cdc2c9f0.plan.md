---
name: GONULLU_TAKIP Eksiklik Analizi
overview: GONULLU_TAKIP.md dokümanına göre losev-net projesindeki eksik ve kısıtlı özelliklerin analizi ve tamamlanması için önerilen adımlar.
todos: []
isProject: false
---

# GONULLU_TAKIP.md Eksiklik Analizi ve Tamamlama Planı

## Mevcut Durum Özeti

Proje, dokümandaki temel işlevlerin büyük kısmını karşılıyor:

- Öğrenci/öğretmen/admin panelleri
- Faaliyet girişi (tarih, tür, saat, açıklama, fotoğraf, belge)
- Saat takibi (toplam, aylık, yıllık, hedef 40 saat)
- Öğretmen onay/red akışı
- Genel merkez raporlama (okul sıralaması, il dağılımı, en aktif 10 öğrenci/okul)
- Öğrenci rozetleri (25/50/100/200 saat)
- Chart.js ile grafikler

---

## Eksik veya Kısıtlı Özellikler

### 1. T.C. Kimlik No (KVKK Uyumlu, Opsiyonel)

**Durum:** Backend model (`[server/models/User.js](server/models/User.js)`) ve `[server/controllers/authController.js](server/controllers/authController.js)` destekliyor; frontend formlarda yok.

**Eksik:**

- `[client/src/views/auth/RegisterView.vue](client/src/views/auth/RegisterView.vue)`: T.C. Kimlik alanı yok
- `[client/src/views/student/StudentProfile.vue](client/src/views/student/StudentProfile.vue)`: T.C. Kimlik alanı yok

**Öneri:** Opsiyonel alan eklenmeli; KVKK metni ve onay checkbox'ı ile birlikte.

---

### 2. Gerçek Dosya Depolama

**Durum:** `[server/controllers/uploadController.js](server/controllers/uploadController.js)` multer ile dosya alıyor ama gerçek depolamıyor; her zaman `https://via.placeholder.com/150?text=Sahte+Dosya` dönüyor.

**Eksik:** Supabase Storage, Firebase Storage veya Cloudinary entegrasyonu.

**Öneri:** GONULLU_TAKIP.md'de önerilen Supabase/Firebase/Cloudinary'den biri seçilip gerçek depolama eklenmeli.

---

### 3. Okul Performans Rozetleri

**Durum:** `[server/models/School.js](server/models/School.js)` içinde `badge` alanı var (`inci_dostu`, `etki_lideri`, `yilin_okulu`); atama mantığı ve UI yok.

**Eksik:**

- Okul rozetlerinin otomatik veya manuel atanması
- Admin/öğretmen panelinde okul rozetlerinin gösterilmesi
- Rozet kriterlerinin tanımlanması

**Öneri:** Kriterler belirlenip (örn. toplam saat, öğrenci sayısı) otomatik hesaplama veya admin tarafından manuel atama eklenmeli.

---

### 4. Dijital Sertifika İndirme

**Durum:** `[client/src/views/student/CertificateView.vue](client/src/views/student/CertificateView.vue)` sadece tablo ile sertifika geçmişini gösteriyor.

**Eksik:**

- PDF sertifika oluşturma
- İndirilebilir dijital doküman (üniversite başvuruları için)

**Öneri:** jsPDF veya benzeri ile PDF sertifika üretimi ve indirme butonu eklenmeli.

---

### 5. Üniversite Başvurusu Dijital Dokümanı

**Durum:** Dokümanda "Üniversite başvurularında kullanılabilecek dijital gönüllülük dokümanı üretmek" hedefi var; projede yok.

**Eksik:** Toplam saat, rozetler ve faaliyet özetini içeren resmi görünümlü PDF/indirilebilir doküman.

**Öneri:** Sertifika indirme ile birlikte veya ayrı bir "Gönüllülük Özet Belgesi" sayfası eklenebilir.

---

### 6. Veli Dijital İzin Süreci

**Durum:** GONULLU_TAKIP.md'de "Veli dijital izin süreci düşünülmeli" deniyor; projede hiç yok.

**Eksik:** Çocuk verisi işlendiği için veli onayı akışı (e-posta/SMS ile onay linki vb.).

**Öneri:** Öğrenci kaydı veya ilk faaliyet öncesi veli onayı akışı tasarlanmalı.

---

### 7. İl Bazlı Etki Haritası

**Durum:** Admin panelinde "İl Bazlı Etki Dağılımı" tablo olarak var (`[client/src/views/admin/AdminDashboard.vue](client/src/views/admin/AdminDashboard.vue)`); dokümanda "İl bazlı etki haritası" geçiyor.

**Eksik:** Harita görünümü (Türkiye haritası üzerinde il bazlı renklendirme).

**Öneri:** Leaflet + Türkiye GeoJSON veya basit bir harita kütüphanesi ile görsel harita eklenebilir.

---

### 8. Hedef Saat Yapılandırılabilirliği

**Durum:** Hedef saat sabit 40 olarak kullanılıyor (örn. `[client/src/views/student/StudentDashboard.vue](client/src/views/student/StudentDashboard.vue)`).

**Eksik:** Dokümanda "30 veya 40 saat gibi" deniyor; yapılandırılabilir değil.

**Öneri:** Sistem ayarları veya okul bazlı hedef saat (30/40) seçeneği eklenebilir.

---

### 9. Firebase Auth Entegrasyonu

**Durum:** Demo modda `Bearer` token (e-posta @ öncesi) kullanılıyor; gerçek Firebase Auth yok.

**Eksik:** `[client/src/services/firebase.js](client/src/services/firebase.js)` ve backend'de gerçek Firebase Auth entegrasyonu.

**Öneri:** Production için Firebase Auth veya Supabase Auth entegrasyonu tamamlanmalı.

---

### 10. Admin Kayıt / Yönetim

**Durum:** Kayıt formunda sadece "Öğrenci" ve "Koordinatör Öğretmen" seçenekleri var; admin rolü yok.

**Eksik:** Admin kullanıcı oluşturma arayüzü; admin şu an veritabanında elle atanıyor.

**Öneri:** Gizli admin kayıt endpoint'i veya seed script ile ilk admin oluşturulabilir; güvenlik nedeniyle açık formda admin seçeneği olmaması tercih edilebilir.

---

### 11. Profil Fotoğrafı Yükleme

**Durum:** User modelinde `profilePhoto` alanı var; UI'da yükleme yok.

**Eksik:** `[client/src/views/student/StudentProfile.vue](client/src/views/student/StudentProfile.vue)` içinde profil fotoğrafı yükleme alanı.

**Öneri:** Profil sayfasına fotoğraf yükleme ve önizleme eklenebilir.

---

## Öncelik Sıralaması


| Öncelik | Özellik                           | Zorluk |
| ------- | --------------------------------- | ------ |
| Yüksek  | Gerçek dosya depolama             | Orta   |
| Yüksek  | Firebase Auth entegrasyonu        | Orta   |
| Yüksek  | Dijital sertifika PDF indirme     | Düşük  |
| Orta    | T.C. Kimlik (KVKK) alanları       | Düşük  |
| Orta    | Okul performans rozetleri         | Orta   |
| Orta    | Hedef saat yapılandırılabilirliği | Düşük  |
| Düşük   | İl bazlı harita görünümü          | Orta   |
| Düşük   | Üniversite başvurusu dokümanı     | Düşük  |
| Düşük   | Profil fotoğrafı yükleme          | Düşük  |
| Düşük   | Veli dijital izin süreci          | Yüksek |


---

## Özet

Proje GONULLU_TAKIP.md gereksinimlerinin büyük kısmını karşılıyor. Kritik eksikler: gerçek dosya depolama, gerçek kimlik doğrulama ve indirilebilir sertifika. KVKK ile ilgili T.C. Kimlik alanı, okul rozetleri ve veli izni gibi konular da dokümana uyum için tamamlanmalı.
