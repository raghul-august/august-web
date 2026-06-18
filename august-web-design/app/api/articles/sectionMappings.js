const sectionMappings = {
  en: {
    content: 'Content',
    summary: 'Summary',
    introduction: 'Introduction',
    conclusion: 'Conclusion',
    references: 'References'
  },
  es: {
    content: 'Contenido',
    summary: 'Resumen',
    introduction: 'Introducción',
    conclusion: 'Conclusión',
    references: 'Referencias'
  },
  fr: {
    content: 'Contenu',
    summary: 'Résumé',
    introduction: 'Introduction',
    conclusion: 'Conclusion',
    references: 'Références'
  },
  de: {
    content: 'Inhalt',
    summary: 'Zusammenfassung',
    introduction: 'Einleitung',
    conclusion: 'Fazit',
    references: 'Referenzen'
  },
  it: {
    content: 'Contenuto',
    summary: 'Riassunto',
    introduction: 'Introduzione',
    conclusion: 'Conclusione',
    references: 'Riferimenti'
  },
  pt: {
    content: 'Conteúdo',
    summary: 'Resumo',
    introduction: 'Introdução',
    conclusion: 'Conclusão',
    references: 'Referências'
  },
  ru: {
    content: 'Содержание',
    summary: 'Резюме',
    introduction: 'Введение',
    conclusion: 'Заключение',
    references: 'Список литературы'
  },
  'zh-Hans': {
    content: '内容',
    summary: '概要',
    introduction: '介绍',
    conclusion: '结论',
    references: '参考文献'
  },
  'zh-Hant': {
    content: '內容',
    summary: '概要',
    introduction: '介紹',
    conclusion: '結論',
    references: '參考文獻'
  },
  ja: {
    content: 'コンテンツ',
    summary: '概要',
    introduction: '導入',
    conclusion: '結論',
    references: '参考文献'
  },
  ko: {
    content: '내용',
    summary: '요약',
    introduction: '소개',
    conclusion: '결론',
    references: '참고 문헌'
  },
  ar: {
    content: 'المحتوى',
    summary: 'ملخص',
    introduction: 'مقدمة',
    conclusion: 'استنتاج',
    references: 'المراجع'
  },
  hi: {
    content: 'विषय-सूची',
    summary: 'सारांश',
    introduction: 'परिचय',
    conclusion: 'निष्कर्ष',
    references: 'संदर्भ'
  },
  nl: {
    content: 'Inhoud',
    summary: 'Samenvatting',
    introduction: 'Inleiding',
    conclusion: 'Conclusie',
    references: 'Referenties'
  },
  pl: {
    content: 'Zawartość',
    summary: 'Podsumowanie',
    introduction: 'Wprowadzenie',
    conclusion: 'Wniosek',
    references: 'Bibliografia'
  },
  sv: {
    content: 'Innehåll',
    summary: 'Sammanfattning',
    introduction: 'Introduktion',
    conclusion: 'Slutsats',
    references: 'Referenser'
  },
  no: {
    content: 'Innhold',
    summary: 'Sammendrag',
    introduction: 'Introduksjon',
    conclusion: 'Konklusjon',
    references: 'Referanser'
  },
  da: {
    content: 'Indhold',
    summary: 'Resumé',
    introduction: 'Introduktion',
    conclusion: 'Konklusion',
    references: 'Referencer'
  },
  fi: {
    content: 'Sisältö',
    summary: 'Yhteenveto',
    introduction: 'Johdanto',
    conclusion: 'Johtopäätös',
    references: 'Viitteet'
  },
  cs: {
    content: 'Obsah',
    summary: 'Shrnutí',
    introduction: 'Úvod',
    conclusion: 'Závěr',
    references: 'Reference'
  },
  hu: {
    content: 'Tartalom',
    summary: 'Összefoglalás',
    introduction: 'Bevezetés',
    conclusion: 'Következtetés',
    references: 'Hivatkozások'
  },
  ro: {
    content: 'Conținut',
    summary: 'Rezumat',
    introduction: 'Introducere',
    conclusion: 'Concluzie',
    references: 'Referințe'
  },
  el: {
    content: 'Περιεχόμενο',
    summary: 'Περίληψη',
    introduction: 'Εισαγωγή',
    conclusion: 'Συμπέρασμα',
    references: 'Αναφορές'
  },
  uk: {
    content: 'Зміст',
    summary: 'Резюме',
    introduction: 'Вступ',
    conclusion: 'Висновок',
    references: 'Список літератури'
  },
  bg: {
    content: 'Съдържание',
    summary: 'Резюме',
    introduction: 'Въведение',
    conclusion: 'Заключение',
    references: 'Източници'
  },
  hr: {
    content: 'Sadržaj',
    summary: 'Sažetak',
    introduction: 'Uvod',
    conclusion: 'Zaključak',
    references: 'Reference'
  },
  sk: {
    content: 'Obsah',
    summary: 'Zhrnutie',
    introduction: 'Úvod',
    conclusion: 'Záver',
    references: 'Referencie'
  },
  sl: {
    content: 'Vsebina',
    summary: 'Povzetek',
    introduction: 'Uvod',
    conclusion: 'Zaključek',
    references: 'Reference'
  },
  et: {
    content: 'Sisu',
    summary: 'Kokkuvõte',
    introduction: 'Sissejuhatus',
    conclusion: 'Järeldus',
    references: 'Viited'
  },
  lv: {
    content: 'Saturs',
    summary: 'Kopsavilkums',
    introduction: 'Ievads',
    conclusion: 'Secinājumi',
    references: 'Atsauces'
  },
  lt: {
    content: 'Turinys',
    summary: 'Santrauka',
    introduction: 'Įvadas',
    conclusion: 'Išvada',
    references: 'Šaltiniai'
  },
  is: {
    content: 'Efni',
    summary: 'Samantekt',
    introduction: 'Inngangur',
    conclusion: 'Ályktun',
    references: 'Heimildir'
  },
  ga: {
    content: 'Ábhar',
    summary: 'Achoimre',
    introduction: 'Réamhrá',
    conclusion: 'Conclúid',
    references: 'Tagairtí'
  },
  mt: {
    content: 'Kontenut',
    summary: 'Sommarju',
    introduction: 'Introduzzjoni',
    conclusion: 'Konklużjoni',
    references: 'Referenzi'
  },
  sq: {
    content: 'Përmbajtja',
    summary: 'Përmbledhje',
    introduction: 'Hyrje',
    conclusion: 'Përfundim',
    references: 'Referencat'
  },
  be: {
    content: 'Змест',
    summary: 'Рэзюмэ',
    introduction: 'Уводзіны',
    conclusion: 'Выснова',
    references: 'Спасылкі'
  },
  bs: {
    content: 'Sadržaj',
    summary: 'Sažetak',
    introduction: 'Uvod',
    conclusion: 'Zaključak',
    references: 'Reference'
  },
  gd: {
    content: 'Susbaint',
    summary: 'Geàrr-chunntas',
    introduction: 'Ro-ràdh',
    conclusion: 'Co-dhùnadh',
    references: 'Iomraidhean'
  },
  lb: {
    content: 'Inhalt',
    summary: 'Resumé',
    introduction: 'Aféierung',
    conclusion: 'Conclusioun',
    references: 'Referenzen'
  },
  mk: {
    content: 'Содржина',
    summary: 'Резиме',
    introduction: 'Вовед',
    conclusion: 'Заклучок',
    references: 'Референци'
  },
  sr: {
    content: 'Садржај',
    summary: 'Резиме',
    introduction: 'Увод',
    conclusion: 'Закључак',
    references: 'Референце'
  },
  cy: {
    content: 'Cynnwys',
    summary: 'Crynodeb',
    introduction: 'Cyflwyniad',
    conclusion: 'Casgliad',
    references: 'Cyfeiriadau'
  },
  vi: {
    content: 'Nội dung',
    summary: 'Tóm tắt',
    introduction: 'Giới thiệu',
    conclusion: 'Kết luận',
    references: 'Tài liệu tham khảo'
  },
  th: {
    content: 'เนื้อหา',
    summary: 'บทสรุป',
    introduction: 'บทนำ',
    conclusion: 'สรุป',
    references: 'อ้างอิง'
  },
  id: {
    content: 'Isi',
    summary: 'Ringkasan',
    introduction: 'Pendahuluan',
    conclusion: 'Kesimpulan',
    references: 'Referensi'
  },
  ms: {
    content: 'Kandungan',
    summary: 'Ringkasan',
    introduction: 'Pengenalan',
    conclusion: 'Kesimpulan',
    references: 'Rujukan'
  },
  tl: {
    content: 'Nilalaman',
    summary: 'Buod',
    introduction: 'Panimula',
    conclusion: 'Konklusyon',
    references: 'Mga Sanggunian'
  },
  bn: {
    content: 'বিষয়বস্তু',
    summary: 'সারসংক্ষেপ',
    introduction: 'ভূমিকা',
    conclusion: 'উপসংহার',
    references: 'রেফারেন্স'
  },
  ur: {
    content: 'مواد',
    summary: 'خلاصہ',
    introduction: 'تعارف',
    conclusion: 'نتیجہ',
    references: 'حوالہ جات'
  },
  ta: {
    content: 'உள்ளடக்கம்',
    summary: 'சுருக்கம்',
    introduction: 'அறிமுகம்',
    conclusion: 'முடிவுரை',
    references: 'குறிப்புகள்'
  },
  te: {
    content: 'విషయము',
    summary: 'సారాంశం',
    introduction: 'పరిచయం',
    conclusion: 'ముగింపు',
    references: 'సూచనలు'
  },
  mr: {
    content: 'सामग्री',
    summary: 'सारांश',
    introduction: 'परिचय',
    conclusion: 'निष्कर्ष',
    references: 'संदर्भ'
  },
  gu: {
    content: 'સામગ્રી',
    summary: 'સારાંશ',
    introduction: 'પરિચય',
    conclusion: 'નિષ્કર્ષ',
    references: 'સંદર્ભો'
  },
  kn: {
    content: 'ವಿಷಯ',
    summary: 'ಸಾರಾಂಶ',
    introduction: 'ಪರಿಚಯ',
    conclusion: 'ತೀರ್ಮಾನ',
    references: 'ಉಲ್ಲೇಖಗಳು'
  },
  pa: {
    content: 'ਸਮੱਗਰੀ',
    summary: 'ਸੰਖੇਪ',
    introduction: 'ਜਾਣ-ਪਛਾਣ',
    conclusion: 'ਸਿੱਟਾ',
    references: 'ਹਵਾਲੇ'
  },
  ne: {
    content: 'विषयवस्तु',
    summary: 'सारांश',
    introduction: 'परिचय',
    conclusion: 'निष्कर्ष',
    references: 'सन्दर्भहरू'
  },
  my: {
    content: 'အကြောင်းအရာ',
    summary: 'အကျဉ်းချုပ်',
    introduction: 'နိဒါန္း',
    conclusion: 'နိဂုံး',
    references: 'ကိုးကားချက်များ'
  },
  km: {
    content: 'ខ្លឹមសារ',
    summary: 'សេចក្តីសង្ខេប',
    introduction: 'សេចក្តីផ្តើម',
    conclusion: 'សេចក្តីសន្និដ្ឋាន',
    references: 'ឯកសារយោង'
  },
  si: {
    content: 'අන්තර්ගතය',
    summary: 'සාරාංශය',
    introduction: 'හැඳින්වීම',
    conclusion: 'නිගමනය',
    references: 'යොමු කිරීම්'
  },
  ml: {
    content: 'ഉള്ളടക്കം',
    summary: 'സംഗ്രഹം',
    introduction: 'ആമുഖം',
    conclusion: 'ഉപസംഹാരം',
    references: 'റഫറൻസുകൾ'
  },
  mn: {
    content: 'Агуулга',
    summary: 'Товчлол',
    introduction: 'Оршил',
    conclusion: 'Дүгнэлт',
    references: 'Ашигласан материал'
  },
  jv: {
    content: 'Isi',
    summary: 'Ringkesan',
    introduction: 'Pambuka',
    conclusion: 'Kesimpulan',
    references: 'Referensi'
  },
  su: {
    content: 'Eusi',
    summary: 'Ringkesan',
    introduction: 'Bubuka',
    conclusion: 'Kacindekan',
    references: 'Rujukan'
  },
  sw: {
    content: 'Yaliyomo',
    summary: 'Muhtasari',
    introduction: 'Utangulizi',
    conclusion: 'Hitimisho',
    references: 'Marejeo'
  },
  he: {
    content: 'תוכן',
    summary: 'סיכום',
    introduction: 'מבוא',
    conclusion: 'מסקנה',
    references: 'מקורות'
  },
  fa: {
    content: 'محتوا',
    summary: 'خلاصه',
    introduction: 'مقدمه',
    conclusion: 'نتیجه گیری',
    references: 'منابع'
  },
  tr: {
    content: 'İçerik',
    summary: 'Özet',
    introduction: 'Giriş',
    conclusion: 'Sonuç',
    references: 'Referanslar'
  },
  af: {
    content: 'Inhoud',
    summary: 'Opsomming',
    introduction: 'Inleiding',
    conclusion: 'Gevolgtrekking',
    references: 'Verwysings'
  },
  am: {
    content: 'ይዘት',
    summary: 'ማጠቃለያ',
    introduction: 'መግቢያ',
    conclusion: 'ማጠቃለያ',
    references: 'ማጣቀሻዎች'
  },
  so: {
    content: 'Nuxurka',
    summary: 'Soo koobid',
    introduction: 'Hordhac',
    conclusion: 'Gunaanad',
    references: 'Tixraacyo'
  },
  yo: {
    content: 'Àwọn Ìwé',
    summary: 'Àkópọ̀',
    introduction: 'Ìṣáájú',
    conclusion: 'Ìparí',
    references: 'Àwọn Ìtọ́kasí'
  },
  zu: {
    content: 'Okuqukethwe',
    summary: 'Isifinyezo',
    introduction: 'Isingeniso',
    conclusion: 'Isiphetho',
    references: 'Izikhombo'
  },
  ha: {
    content: 'Abinda ke ciki',
    summary: 'Takaitawa',
    introduction: 'Gabatarwa',
    conclusion: 'Kammalawa',
    references: 'Manazarta'
  },
  ig: {
    content: 'Ọdịnaya',
    summary: 'Nchịkọta',
    introduction: 'Okwu mmalite',
    conclusion: 'Mmechi',
    references: 'Ntụaka'
  },
  rw: {
    content: 'Ibirimo',
    summary: 'Incamake',
    introduction: 'Intangiriro',
    conclusion: 'Umwanzuro',
    references: 'Inkomoko'
  },
  om: {
    content: 'Qabiyyee',
    summary: 'Gabaasa',
    introduction: 'Seensa',
    conclusion: 'Xumura',
    references: 'Wabiira'
  },
  sn: {
    content: 'Zviri Mukati',
    summary: 'Pfupiso',
    introduction: 'Sumo',
    conclusion: 'Mhedziso',
    references: 'Zvekushandisa'
  },
  ht: {
    content: 'Kontni',
    summary: 'Rezime',
    introduction: 'Entwodiksyon',
    conclusion: 'Konklizyon',
    references: 'Referans'
  },
  mi: {
    content: 'Ihirangi',
    summary: 'Whakarāpopoto',
    introduction: 'Whakataki',
    conclusion: 'Whakamutunga',
    references: 'Ngā Tohutoro'
  },
  haw: {
    content: 'Ka Waihona',
    summary: 'Hōʻuluʻulu Manaʻo',
    introduction: 'Hoʻolauna',
    conclusion: 'Panina',
    references: 'Nā Pepa E Heluhelu ʻia'
  },
    la: {
    content: 'Contenta',
    summary: 'Summarium',
    introduction: 'Introductio',
    conclusion: 'Conclusio',
    references: 'Res'
  }

}

export default sectionMappings;
