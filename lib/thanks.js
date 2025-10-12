// lib/thanks.js
// Her kişi { name, url? } — url varsa link altı çizilir.

export const thanksGroups = [
  {
    key: "family",
    title: "Aileme",
    icon: "fa-solid fa-heart",
    // Annem + 3 kardeş (IG kullanıcı adlarını gerçekleriyle değiştir)
    people: [
      { name: "Annem", url: "https://instagram.com/ANNEN_KULLANICI_ADI" },
      { name: "Kardeşim 1", url: "https://instagram.com/KARDES1_KULLANICI" },
      { name: "Kardeşim 2", url: "https://instagram.com/KARDES2_KULLANICI" },
      { name: "Kardeşim 3", url: "https://instagram.com/KARDES3_KULLANICI" },
    ],
  },
  {
    key: "friends",
    title: "Arkadaşlar",
    icon: "fa-solid fa-people-group",
    people: [
      { name: "Hamza", url: "https://instagram.com/h_27_5_2" },
      { name: "Ozan", url: "https://instagram.com/OZAN_KULLANICI" },
      { name: "Ayşegül", url: "https://instagram.com/AYSEGUL_KULLANICI" },
      { name: "İbrahim", url: "https://instagram.com/IBRAHIM_KULLANICI" },
      { name: "Haydar", url: "https://instagram.com/7.ura" },
    ],
  },
  {
    key: "lise",
    title: "Lise Hocalarım",
    icon: "fa-solid fa-school",
    people: [], // şimdilik boş
  },
  {
    key: "university",
    title: "Üniversite Hocalarım",
    icon: "fa-solid fa-graduation-cap",
    people: [
        { name: "Dr. Öğr. Üyesi Serkan G.", url: "https://avesis.gelisim.edu.tr/sgonen" },
        { name: "Arş. Gör. Mehmet Ali B.", url: "https://avesis.gelisim.edu.tr/mabariskan" },
    ], // şimdilik boş
  },
  {
    key: "community",
    title: "Katkıda Bulunanlar",
    icon: "fa-solid fa-code-branch",
    people: [], // şimdilik boş
  },
];
