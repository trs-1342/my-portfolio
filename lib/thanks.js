// lib/thanks.js
// Her kişi { name, url? } — url varsa link altı çizilir.

export const thanksGroups = [
  {
    key: "family",
    title: "Aileme",
    icon: "fa-solid fa-heart",
    // Annem + 3 kardeş (IG kullanıcı adlarını gerçekleriyle değiştir)
    people: [
      {
        name: "Annem",
        bio: "Varolduğu için, Yaşam kaynağım. {iyi ki varsın <3}",
        url: "https://www.linkedin.com/in/bushra-dukhan-671869107/",
        color: "red",
      },
      {
        name: "Hiba",
        bio: "Varolduğu ve bana Annelik ettiği için. {iyi ki varsın}",
        color: "red",
      },
    ],
  },
  {
    key: "friends",
    title: "Arkadaşlar",
    icon: "fa-solid fa-people-group",
    people: [
      {
        name: "Hamza",
        bio: "Çocukluk arkadaşım.",
        url: "https://instagram.com/h_27_5_2",
        color: "blue",
      },
      {
        name: "Ati",
        bio: "Yazılımda bana fikir ve kantık sağladı.",
        url: "https://instagram.com/ataer667",
        color: "green",
      },
      {
        name: "Ozan",
        bio: "Dostum ve destekçim. {iyi ki varsın}",
        url: "https://instagram.com/ozanaksoy_19",
        color: "green",
      },
      {
        name: "Ayşegül",
        bio: "Kusurları bile en güzel olan kız arkadaşım. {kendisi özel bir insan ve konuşmuyor olsam bile unutmayacağım. felsefi olarak karmaşık açıklayamıyorum.}",
        url: "https://instagram.com/ayyseegullyilmaz",
        color: "red",
      },
      {
        name: "Yasir",
        bio: "Doğru bir insan.",
        url: "https://instagram.com/yasirsadikekec/",
        color: "yellow",
      },
      {
        name: "Mete",
        bio: "En güzel erkek. Bu ardakaşın editlerde geleceği var İnşAllah {bu lavuğu seviyorum.}",
        url: "https://instagram.com/phetteps/",
        color: "green",
      },
      {
        name: "İbrahim",
        bio: "Saygı değer ve karakterinden insan olduğu için.",
        url: "https://instagram.com/ibrahimmefc",
        color: "green",
      },
      {
        name: "Haydar",
        bio: "Ortak geleceğimiz, hedeflerimiz ve karakterinden.",
        url: "https://instagram.com/7._ura",
        color: "blue",
      },
    ],
  },
  {
    key: "vfrends",
    title: "Sanal Dostlar",
    icon: "fa-solid fa-globe",
    people: [
      {
        name: "Hazal",
        bio: "Tanıdığıma memnun olduğum bir arkadaşım.",
        url: "https://instagram.com/cileklihttps/",
        color: "red",
      },
      {
        name: "Mehmet Bey",
        bio: "Tanıdığıma memnun olduğum bir abim, kendisine yazılım alanında başrılar diliyor kesintisiz yardım etmeye hazır olduğumu bildiririm!",
        url: "https://instagram.com/m.b.0.01",
        color: "green",
      },
      {
        name: "İsmail",
        bio: "Zor durumlarda kendini yetiştirebilen bir arkadaşım. Kendisine başarılar dilerim. Kendisiyle tanıştığıma memnunum. Kendisiyle gurur duyuyorum.",
        color: "blue",
      },
    ],
  },
  {
    key: "ortaokul",
    title: "Ortaokul Hocalarım",
    icon: "fa-solid fa-school",
    people: [
      {
        name: "Zehra Hocam",
        bio: "Benimsediğim Ahlaki ve Etik değerlerin kaynaklarındandır kendisi. Hayatımdaki en sevdiğim Hocamdır.",
        color: "red",
      },
    ],
  },
  {
    key: "lise",
    title: "Lise Hocalarım",
    icon: "fa-solid fa-school",
    people: [
      {
        name: "Şahdiye Hocam",
        bio: "Tanıdığım ilk Lise hocam, bana rehperlik etti.",
        url: "https://instagram.com/sadiyeozcnn",
        color: "green",
      },
      {
        name: "Fatma Hocam",
        bio: "Bilişim alanında bana çok destek oldu.",
        url: "https://instagram.com/_fatmaunal_",
        color: "blue",
      },
      {
        name: "Ezgi Hocam",
        bio: "TDE dersinden kültürümü genişletti.",
        color: "yellow",
      },
      {
        name: "Sema Hocam",
        bio: "TDE dersinden kültürümü genişletti.",
        url: "https://instagram.com/semaakann",
        color: "yellow",
      },
    ],
  },
  {
    key: "university",
    title: "Üniversite Hocalarım",
    icon: "fa-solid fa-graduation-cap",
    people: [
      {
        name: "Dr. Öğr. Üyesi Serkan G.",
        bio: "Yazılım Mühendisliği'nde bana rehberlik ediyor.",
        url: "https://avesis.gelisim.edu.tr/sgonen",
        color: "red",
      },
      {
        name: "Arş. Gör. Mehmet Ali B.",
        bio: "Yazılım Mühendisliği'nde bana rehberlik ediyor.",
        url: "https://avesis.gelisim.edu.tr/mabariskan",
        color: "green",
      },
    ],
  },
  {
    key: "community",
    title: "Katkıda Bulunanlar",
    icon: "fa-solid fa-code-branch",
    people: [
      {
        name: "Feyzanur Abla",
        bio: "Kendisi iyi kalbi ile manevi olarak destek oldu...",
        url: "https://instagram.com/feyzanur.demircii/",
        color: "red",
      },
      {
        name: "Hamza Sedat Abi",
        bio: "Kendisi hiç düşünmeden bana destek oldu.",
        url: "https://instagram.com/hamzasedatdemir",
        color: "blue",
      },
    ],
  },
];
