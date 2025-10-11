"use client";
import { useEffect } from "react";

export default function ProjectsGrid() {
  useEffect(() => {
    const cards = document.querySelectorAll(".projects-grid .card");
    cards.forEach((card) => {
      const content = card.querySelector(".card-content");
      if (!content) return;
      content.style.maxHeight = "0px";
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        const open = card.classList.toggle("open");
        if (open) {
          content.style.maxHeight = content.scrollHeight + "px";
          content.style.opacity = "1";
        } else {
          content.style.maxHeight = "0px";
          content.style.opacity = "0";
        }
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.style.transform = "translateY(0)";
            en.target.style.opacity = "1";
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".card").forEach((c) => {
      c.style.transform = "translateY(10px)";
      c.style.opacity = "0";
      c.style.transition = "transform .35s ease, opacity .35s ease";
      io.observe(c);
    });
  }, []);

  return (
    <>
      <section id="projelerim">
        <h2>🧩 Projelerim</h2>

        <div className="projects-grid">
          <article className="card">
            <header>
              <h3>Chat Uygulaması</h3>
            </header>
            <div className="card-content">
              <p>
                Node.js + WebSocket ile gerçek zamanlı, oturum sistemli sohbet;
                profil görselleri ve canlı mesaj akışı.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-bolt"></i> Realtime
                </span>
                <span>
                  <i className="fa-solid fa-shield-halved"></i> Auth
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Teknik Servis Takip Sistemi</h3>
            </header>
            <div className="card-content">
              <p>
                MySQL + Express.js backend; cihaz kabul/onarım/teslim,
                filtreleme ve raporlama, Excel çıktıları.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-database"></i> MySQL
                </span>
                <span>
                  <i className="fa-solid fa-file-excel"></i> Export
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>YÖS Mobil Uygulaması</h3>
            </header>
            <div className="card-content">
              <p>
                React Native + Firebase; öğretmen ekleme, kayıt/giriş,
                dark/light tema, kart sistemi.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-brands fa-react"></i> RN
                </span>
                <span>
                  <i className="fa-solid fa-cloud"></i> Firebase
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Kullanıcı Kayıt & Doğrulama</h3>
            </header>
            <div className="card-content">
              <p>
                Email doğrulama; SHA-256 tek yön, diğer alanlar AES ile
                şifreleme; Firebase Auth + Firestore.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-lock"></i> Secure
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Sevgili Kart Uygulaması</h3>
            </header>
            <div className="card-content">
              <p>
                React Native; offline + Firebase senkron; kullanıcıların özel
                kartlar ekleyip paylaşabildiği uygulama.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-brands fa-react"></i> RN
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Notepad (Desktop)</h3>
            </header>
            <div className="card-content">
              <p>
                C# ile koyu temalı not alma; global kısayol,
                kelime/satır/karakter sayacı.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-desktop"></i> Windows
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Multiplayer Yılan Oyunu</h3>
            </header>
            <div className="card-content">
              <p>
                Node.js + Vanilla JS ile gerçek zamanlı çok oyunculu; skor ve
                süre limiti, renk seçimi.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-gamepad"></i> Game
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>WordPress Tatlıcı Sitesi</h3>
            </header>
            <div className="card-content">
              <p>
                Waffle/pancake menü; Hakkımızda &amp; İletişim sayfaları;
                profesyonel tema ve düzen.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-brands fa-wordpress"></i> WP
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Restoran Sitesi</h3>
            </header>
            <div className="card-content">
              <p>
                Modern arayüz; yan ürünler (kek, meyve tabağı, dondurma) ile
                zenginleştirilmiş menü.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-utensils"></i> Menü
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Arduino Katlar Arası Ses Sistemi</h3>
            </header>
            <div className="card-content">
              <p>
                Basit kablolu bağlantı; butonla ses çalma—1. ve 2. kat arası.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-microchip"></i> Arduino
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Portföy Sayfası</h3>
            </header>
            <div className="card-content">
              <p>
                Siyah-beyaz modern UI; solda sabit görsel, sağda kaydırılabilir
                içerik; GitHub & LinkedIn entegrasyonu.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-code"></i> HTML/CSS
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Web İçerik Yönetimi</h3>
            </header>
            <div className="card-content">
              <p>
                Meta reklam raporları, SEO, içerik planı; Instagram için planlı
                gönderi üretimi.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-chart-line"></i> SEO
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Cafe Fizibilite Raporu</h3>
            </header>
            <div className="card-content">
              <p>
                Gider/gelir, hedef kitle ve lokasyon analizleri ile profesyonel
                fizibilite çalışma.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-mug-saucer"></i> İş Planı
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>USB Dosya Sunucusu (Router)</h3>
            </header>
            <div className="card-content">
              <p>
                Router üzerindeki USB belleğe LAN/WAN erişim; paylaşım izinleri
                ve güvenlik yapılandırmaları.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-network-wired"></i> Ağ
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Linux Sistem Problemleri</h3>
            </header>
            <div className="card-content">
              <p>
                Paket kurulumu, GRUB, SFC/DISM, boot kaybı vb. sorunlara çözüm
                ve dokümantasyon.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-brands fa-linux"></i> Linux
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Defender & Güvenlik Scriptleri</h3>
            </header>
            <div className="card-content">
              <p>
                PowerShell ile Defender kontrolü; script kısıtlarını aşmaya
                yönelik yöntemler (lab ortamında test).
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-terminal"></i> PowerShell
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <header>
              <h3>Blog Sitesi</h3>
            </header>
            <div className="card-content">
              <p>
                Vercel üzerinde kişisel blog; ileride JS kütüphaneleriyle
                büyütülecek mimari.
              </p>
              <div className="meta">
                <span>
                  <i className="fa-solid fa-rss"></i> Blog
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
      <br />
    </>
  );
}
