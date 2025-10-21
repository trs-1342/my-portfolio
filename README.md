# Halil Hattab — Portföy (Next.js)

- [portfolio site](https://hattab.vercel.app)

![version](https://img.shields.io/github/v/tag/trs-1342/my-portfolio?label=version&sort=semver)

Siyah–beyaz (varsayılan siyah) temalı, performans ve erişilebilirliğe özen gösterilmiş kişisel portföy sitesi.
GitHub verileri sunucu tarafı API’lerinden çekilir, projeler kart yapısıyla gösterilir, sol panelde optimize görsel galerisi 7 sn’de bir animasyonla değişir (tıklayınca bir sonrakine geçer).

## ✨ Özellikler

- **Siyah/Beyaz Tema** – Kalıcı tema anahtarı (localStorage), light modda okunaklı koyu metinler
- **Sol Panel Galeri** – `next/image` ile optimize, 7 sn’de bir cross-fade; tıklayınca bir sonraki görsel
- **GitHub Entegrasyonu**

  - Üst rozetler: followers, following, repo/gist, toplam star & fork, top diller
  - Güncel repolar tablosu: dil • son commit mesajı • açıklama • ⭐ • 🍴 • “güncel” zamanı • repo linki
  - Mobilde tablo **kart görünümüne** dönüşür

- **Proje Kartları** – Her kart bağımsız **overlay** ile açılır; yan kartlar etkilenmez
- **Hakkımda Paneli** – Kısa tanıtım + ilgi alanları + motto
- **Erişilebilirlik** – Klavye (Esc ile kart kapatma), düşük hareket tercihi için animasyon azaltma
- **Performans** – `next/image`, `next/font`, responsive `sizes`, hafif API cache

## 🧱 Teknolojiler

- **Next.js (App Router)**, React
- **CSS (globals.css)** — Monospace: JetBrains Mono / Fira Code
- **Font Awesome** ikonlar
- **GitHub REST API** (isteğe bağlı **Fine-grained PAT**)

## ⚙️ Kurulum

### 1) Gerekli ortam değişkeni

Rate-limit ve tutarlı veri için **Fine-grained Personal Access Token** (salt okuma) önerilir:

- Repository permissions: **Contents: Read-only**, **Metadata: Read-only**
- (İsteğe bağlı) **Issues: Read-only**, **Pull requests: Read-only**

`.env.local` oluştur:

```bash
GITHUB_TOKEN=github_pat_XXXXXXXXXXXXXXXX
```

> Token **sadece server** tarafında kullanılır; istemciye gönderilmez. Repoya commit etme.

### 2) Kurulum ve çalıştırma

```bash
npm install
npm run dev
# http://localhost:3000
```

Üretim:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

## 📁 Önemli Dosyalar

```text
/app
  /api/gh/route.js        # GitHub verilerini toplayan API (user + repos + en son commit)
  /components
    Gallery.js            # 7 sn’de bir cross-fade + click ile ileri
    GithubTable.js        # Rozetler + tablo (mobil kart görünümü)
    ProjectsGrid.js       # Overlay kartlar (komşular etkilenmez)
    ThemeToggle.js        # Tema anahtarı (persisted)
    CustomCursor.js       # (opsiyonel) özel imleç
  layout.js               # Fontlar, global CSS, meta
  page.js                 # Ana sayfa iskeleti (Hakkımda + GitHub + Projeler)
/public
  halil.png               # Galeri görseli (tercihen .webp)
/app/globals.css          # Tema, layout, tablo, kartlar, responsive stiller
```

---

## Proje version türü:

- vX.X.M.Y:
  - X: version numarası
  - M: güncellenen ay
  - Y: güncellenen yıl

## 📧 İletişim

[![Email](https://img.shields.io/badge/E--posta-hattab1342@gmail.com-blue?style=flat&logo=gmail)](mailto:hattab1342@gmail.com)

© 2025 trs-1342
