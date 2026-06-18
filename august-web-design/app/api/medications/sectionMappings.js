const sectionMappings = {
    en: {
      brand_names: "Available brands",
      description: "About this medication",
      before_using: "Before using this medication",
      proper_use: "How to use this medication",
      sideeffects: "Side effects"
    },
    es: {
      brand_names: "Marcas disponibles",
      description: "Acerca de este medicamento",
      before_using: "Antes de usar este medicamento",
      proper_use: "Cómo usar este medicamento",
      sideeffects: "Efectos secundarios"
    },
    fr: {
      brand_names: "Marques disponibles",
      description: "À propos de ce médicament",
      before_using: "Avant d'utiliser ce médicament",
      proper_use: "Comment utiliser ce médicament",
      sideeffects: "Effets secondaires"
    },
    de: {
      brand_names: "Verfügbare Marken",
      description: "Über dieses Medikament",
      before_using: "Vor der Anwendung dieses Medikaments",
      proper_use: "Wie man dieses Medikament verwendet",
      sideeffects: "Nebenwirkungen"
    },
    it: {
      brand_names: "Marchi disponibili",
      description: "Informazioni su questo farmaco",
      before_using: "Prima di usare questo farmaco",
      proper_use: "Come usare questo farmaco",
      sideeffects: "Effetti collaterali"
    },
    pt: {
      brand_names: "Marcas disponíveis",
      description: "Sobre este medicamento",
      before_using: "Antes de usar este medicamento",
      proper_use: "Como usar este medicamento",
      sideeffects: "Efeitos colaterais"
    },
    ru: {
      brand_names: "Доступные бренды",
      description: "Об этом лекарстве",
      before_using: "Перед применением этого лекарства",
      proper_use: "Как использовать это лекарство",
      sideeffects: "Побочные эффекты"
    },
    "zh-Hans": {
      brand_names: "可用品牌",
      description: "关于此药物",
      before_using: "使用此药物前",
      proper_use: "如何使用此药物",
      sideeffects: "副作用"
    },
    "zh-Hant": {
      brand_names: "可用品牌",
      description: "關於此藥物",
      before_using: "使用此藥物前",
      proper_use: "如何使用此藥物",
      sideeffects: "副作用"
    },
    ja: {
      brand_names: "利用可能なブランド",
      description: "この薬について",
      before_using: "この薬を使用する前に",
      proper_use: "この薬の使用方法",
      sideeffects: "副作用"
    },
    ko: {
      brand_names: "이용 가능한 브랜드",
      description: "이 약에 대하여",
      before_using: "이 약을 사용하기 전에",
      proper_use: "이 약을 사용하는 방법",
      sideeffects: "부작용"
    },
    ar: {
      brand_names: "العلامات التجارية المتاحة",
      description: "حول هذا الدواء",
      before_using: "قبل استخدام هذا الدواء",
      proper_use: "كيفية استخدام هذا الدواء",
      sideeffects: "الآثار الجانبية"
    },
      hi: {
      brand_names: "उपलब्ध ब्रांड",
      description: "इस दवा के बारे में",
      before_using: "इस दवा का उपयोग करने से पहले",
      proper_use: "इस दवा का उपयोग कैसे करें",
      sideeffects: "दुष्प्रभाव"
      },
     nl: {
      brand_names: "Beschikbare merken",
      description: "Over dit medicijn",
      before_using: "Voor gebruik van dit medicijn",
      proper_use: "Hoe dit medicijn te gebruiken",
      sideeffects: "Bijwerkingen"
      },
    pl: {
      brand_names: "Dostępne marki",
      description: "O tym leku",
      before_using: "Przed użyciem tego leku",
      proper_use: "Jak stosować ten lek",
      sideeffects: "Skutki uboczne"
    },
    sv: {
      brand_names: "Tillgängliga varumärken",
      description: "Om detta läkemedel",
      before_using: "Innan du använder detta läkemedel",
      proper_use: "Hur man använder detta läkemedel",
      sideeffects: "Biverkningar"
    },
    no: {
      brand_names: "Tilgjengelige merker",
      description: "Om denne medisinen",
      before_using: "Før du bruker denne medisinen",
      proper_use: "Hvordan bruke denne medisinen",
      sideeffects: "Bivirkninger"
    },
    da: {
      brand_names: "Tilgængelige mærker",
      description: "Om denne medicin",
      before_using: "Før du bruger denne medicin",
      proper_use: "Sådan bruges denne medicin",
      sideeffects: "Bivirkninger"
    },
    fi: {
       brand_names: "Saatavilla olevat tuotemerkit",
      description: "Tietoa tästä lääkkeestä",
      before_using: "Ennen tämän lääkkeen käyttöä",
      proper_use: "Kuinka tätä lääkettä käytetään",
      sideeffects: "Sivuvaikutukset"
    },
    cs: {
      brand_names: "Dostupné značky",
       description: "O tomto léku",
      before_using: "Před použitím tohoto léku",
      proper_use: "Jak tento lék používat",
      sideeffects: "Nežádoucí účinky"
    },
    hu: {
      brand_names: "Elérhető márkák",
      description: "Erről a gyógyszerről",
      before_using: "A gyógyszer használata előtt",
      proper_use: "Hogyan kell használni ezt a gyógyszert",
      sideeffects: "Mellékhatások"
    },
    ro: {
      brand_names: "Mărci disponibile",
      description: "Despre acest medicament",
      before_using: "Înainte de a utiliza acest medicament",
      proper_use: "Cum se utilizează acest medicament",
      sideeffects: "Efecte secundare"
    },
    el: {
       brand_names: "Διαθέσιμες μάρκες",
      description: "Σχετικά με αυτό το φάρμακο",
      before_using: "Πριν χρησιμοποιήσετε αυτό το φάρμακο",
      proper_use: "Πώς να χρησιμοποιήσετε αυτό το φάρμακο",
      sideeffects: "Παρενέργειες"
    },
    uk: {
       brand_names: "Доступні бренди",
      description: "Про ці ліки",
      before_using: "Перед використанням цих ліків",
      proper_use: "Як використовувати ці ліки",
      sideeffects: "Побічні ефекти"
    },
    bg: {
      brand_names: "Налични марки",
      description: "За това лекарство",
      before_using: "Преди употреба на това лекарство",
      proper_use: "Как да използвате това лекарство",
      sideeffects: "Странични ефекти"
    },
    hr: {
      brand_names: "Dostupne marke",
      description: "O ovom lijeku",
      before_using: "Prije korištenja ovog lijeka",
      proper_use: "Kako koristiti ovaj lijek",
      sideeffects: "Nuspojave"
    },
    sk: {
       brand_names: "Dostupné značky",
      description: "O tomto lieku",
      before_using: "Pred použitím tohto lieku",
      proper_use: "Ako používať tento liek",
      sideeffects: "Vedľajšie účinky"
    },
      sl: {
      brand_names: "Razpoložljive blagovne znamke",
      description: "O tem zdravilu",
      before_using: "Pred uporabo tega zdravila",
      proper_use: "Kako uporabljati to zdravilo",
      sideeffects: "Stranski učinki"
      },
    et: {
       brand_names: "Saadaval kaubamärgid",
      description: "Teave selle ravimi kohta",
      before_using: "Enne selle ravimi kasutamist",
      proper_use: "Kuidas seda ravimit kasutada",
      sideeffects: "Kõrvaltoimed"
    },
      lv: {
       brand_names: "Pieejamie zīmoli",
      description: "Par šīm zālēm",
      before_using: "Pirms šo zāļu lietošanas",
      proper_use: "Kā lietot šīs zāles",
      sideeffects: "Blakusparādības"
      },
     lt: {
      brand_names: "Galimi prekių ženklai",
       description: "Apie šį vaistą",
      before_using: "Prieš vartodami šį vaistą",
      proper_use: "Kaip vartoti šį vaistą",
      sideeffects: "Šalutiniai poveikiai"
      },
    is: {
      brand_names: "Fáanleg vörumerki",
      description: "Um þetta lyf",
      before_using: "Áður en þú notar þetta lyf",
      proper_use: "Hvernig á að nota þetta lyf",
      sideeffects: "Aukaverkanir"
    },
    ga: {
      brand_names: "Brandaí atá ar fáil",
      description: "Maidir leis an gcógas seo",
      before_using: "Sula n-úsáideann tú an cógas seo",
      proper_use: "Conas an cógas seo a úsáid",
      sideeffects: "Fo-iarmhairtí"
    },
    mt: {
      brand_names: "Marki disponibbli",
      description: "Dwar dan il-mediċina",
      before_using: "Qabel tuża din il-mediċina",
      proper_use: "Kif tuża din il-mediċina",
      sideeffects: "Effetti sekondarji"
    },
      sq: {
      brand_names: "Marka të disponueshme",
      description: "Rreth këtij ilaçi",
      before_using: "Para se të përdorni këtë ilaç",
      proper_use: "Si të përdorni këtë ilaç",
      sideeffects: "Efekte anësore"
      },
      be: {
      brand_names: "Даступныя брэнды",
      description: "Пра гэтыя лекі",
      before_using: "Перад выкарыстаннем гэтых лекаў",
      proper_use: "Як выкарыстоўваць гэтыя лекі",
      sideeffects: "Пабочныя эфекты"
      },
       bs: {
      brand_names: "Dostupni brendovi",
      description: "O ovom lijeku",
       before_using: "Prije upotrebe ovog lijeka",
      proper_use: "Kako koristiti ovaj lijek",
      sideeffects: "Nuspojave"
       },
    gd: {
      brand_names: "Brandan ri fhaighinn",
      description: "Mu dheidhinn a’ chungaidh-leigheis seo",
      before_using: "Mus cleachd thu a’ chungaidh-leigheis seo",
      proper_use: "Mar a chleachdas tu a’ chungaidh-leigheis seo",
      sideeffects: "Fo-bhuaidhean"
    },
    lb: {
      brand_names: "Verfügbare Marken",
      description: "Iwwer dëst Medikament",
      before_using: "Ier Dir dëst Medikament benotzt",
       proper_use: "Wéi dëst Medikament benotzen",
      sideeffects: "Niewewierkungen"
    },
      mk: {
      brand_names: "Достапни брендови",
      description: "За овој лек",
      before_using: "Пред употреба на овој лек",
       proper_use: "Како да го користите овој лек",
      sideeffects: "Несакани ефекти"
      },
     sr: {
      brand_names: "Доступни брендови",
      description: "О овом леку",
      before_using: "Пре употребе овог лека",
       proper_use: "Како користити овај лек",
      sideeffects: "Нежељени ефекти"
       },
    cy: {
      brand_names: "Brandiau sydd ar gael",
      description: "Ynghylch y feddyginiaeth hon",
      before_using: "Cyn defnyddio'r feddyginiaeth hon",
      proper_use: "Sut i ddefnyddio'r feddyginiaeth hon",
      sideeffects: "Sgîl-effeithiau"
    },
    vi: {
      brand_names: "Nhãn hiệu có sẵn",
      description: "Về loại thuốc này",
      before_using: "Trước khi sử dụng thuốc này",
      proper_use: "Cách sử dụng thuốc này",
      sideeffects: "Tác dụng phụ"
    },
    th: {
      brand_names: "แบรนด์ที่มีจำหน่าย",
      description: "เกี่ยวกับยานี้",
      before_using: "ก่อนใช้ยานี้",
      proper_use: "วิธีใช้ยานี้",
      sideeffects: "ผลข้างเคียง"
    },
    id: {
      brand_names: "Merek yang tersedia",
      description: "Tentang obat ini",
      before_using: "Sebelum menggunakan obat ini",
      proper_use: "Cara menggunakan obat ini",
      sideeffects: "Efek samping"
    },
     ms: {
      brand_names: "Jenama yang tersedia",
      description: "Mengenai ubat ini",
      before_using: "Sebelum menggunakan ubat ini",
      proper_use: "Cara menggunakan ubat ini",
      sideeffects: "Kesan sampingan"
    },
      tl: {
        brand_names: "Mga brand na magagamit",
      description: "Tungkol sa gamot na ito",
      before_using: "Bago gamitin ang gamot na ito",
      proper_use: "Paano gamitin ang gamot na ito",
      sideeffects: "Mga side effect"
      },
     bn: {
      brand_names: "উপলব্ধ ব্র্যান্ড",
      description: "এই ওষুধ সম্পর্কে",
      before_using: "এই ওষুধ ব্যবহার করার আগে",
      proper_use: "এই ওষুধ কিভাবে ব্যবহার করবেন",
      sideeffects: "পার্শ্ব প্রতিক্রিয়া"
      },
     ur: {
       brand_names: "دستیاب برانڈز",
      description: "اس دوا کے بارے میں",
      before_using: "اس دوا کو استعمال کرنے سے پہلے",
      proper_use: "اس دوا کو کیسے استعمال کریں",
      sideeffects: "سائیڈ اثرات"
      },
    ta: {
      brand_names: "கிடைக்கும் பிராண்டுகள்",
      description: "இந்த மருந்தை பற்றி",
      before_using: "இந்த மருந்தை பயன்படுத்துவதற்கு முன்",
      proper_use: "இந்த மருந்தை எப்படி பயன்படுத்துவது",
      sideeffects: "பக்க விளைவுகள்"
    },
    te: {
      brand_names: "అందుబాటులో ఉన్న బ్రాండ్లు",
      description: "ఈ ఔషధం గురించి",
      before_using: "ఈ ఔషధం ఉపయోగించే ముందు",
      proper_use: "ఈ ఔషధం ఎలా ఉపయోగించాలి",
      sideeffects: "దుష్ప్రభావాలు"
    },
      mr: {
       brand_names: "उपलब्ध ब्रांड",
      description: "या औषधाबद्दल",
       before_using: "हे औषध वापरण्यापूर्वी",
      proper_use: "हे औषध कसे वापरावे",
      sideeffects: "साइड इफेक्ट्स"
       },
     gu: {
      brand_names: "ઉપલબ્ધ બ્રાન્ડ",
      description: "આ દવા વિશે",
      before_using: "આ દવા વાપરતા પહેલાં",
       proper_use: "આ દવા કેવી રીતે વાપરવી",
      sideeffects: "આડઅસરો"
     },
     kn: {
      brand_names: "ಲಭ್ಯವಿರುವ ಬ್ರ್ಯಾಂಡ್‌ಗಳು",
      description: "ಈ ಔಷಧಿಯ ಬಗ್ಗೆ",
      before_using: "ಈ ಔಷಧಿಯನ್ನು ಬಳಸುವ ಮೊದಲು",
      proper_use: "ಈ ಔಷಧಿಯನ್ನು ಹೇಗೆ ಬಳಸುವುದು",
      sideeffects: "ಅಡ್ಡ ಪರಿಣಾಮಗಳು"
     },
     pa: {
      brand_names: "ਉਪਲਬਧ ਬ੍ਰਾਂਡ",
       description: "ਇਸ ਦਵਾਈ ਬਾਰੇ",
      before_using: "ਇਸ ਦਵਾਈ ਦੀ ਵਰਤੋਂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ",
       proper_use: "ਇਸ ਦਵਾਈ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰੀਏ",
      sideeffects: "ਮਾੜੇ ਅਸਰ"
     },
    ne: {
      brand_names: "उपलब्ध ब्रान्डहरू",
      description: "यो औषधिको बारेमा",
      before_using: "यो औषधि प्रयोग गर्नु अघि",
      proper_use: "यो औषधि कसरी प्रयोग गर्ने",
      sideeffects: "साइड इफेक्टहरू"
    },
    my: {
     brand_names: "ရရှိနိုင်သော အမှတ်တံဆိပ်များ",
      description: "ဤဆေးအကြောင်း",
      before_using: "ဤဆေးကို အသုံးမပြုမီ",
      proper_use: "ဤဆေးကို ဘယ်လိုသုံးမလဲ",
      sideeffects: "ဘေးထွက်ဆိုးကျိုးများ"
    },
    km: {
      brand_names: "ម៉ាកដែលមាន",
      description: "អំពីថ្នាំនេះ",
      before_using: "មុនពេលប្រើថ្នាំនេះ",
      proper_use: "របៀបប្រើថ្នាំនេះ",
      sideeffects: "ផល​ប៉ះពាល់​"
    },
    si: {
      brand_names: "ලබා ගත හැකි වෙළඳ නාම",
      description: "මෙම ඖෂධය ගැන",
      before_using: "මෙම ඖෂධය භාවිතා කිරීමට පෙර",
      proper_use: "මෙම ඖෂධය භාවිතා කරන ආකාරය",
      sideeffects: "අතුරු ආබාධ"
    },
      ml: {
      brand_names: "ലഭ്യമായ ബ്രാൻഡുകൾ",
      description: "ഈ മരുന്നിനെക്കുറിച്ച്",
      before_using: "ഈ മരുന്ന് ഉപയോഗിക്കുന്നതിന് മുമ്പ്",
      proper_use: "ഈ മരുന്ന് എങ്ങനെ ഉപയോഗിക്കാം",
      sideeffects: "പാർശ്വഫലങ്ങൾ"
      },
    mn: {
      brand_names: "Бэлэн брэндүүд",
      description: "Энэ эмийн тухай",
      before_using: "Энэ эмийг хэрэглэхээс өмнө",
      proper_use: "Энэ эмийг хэрхэн хэрэглэх вэ",
      sideeffects: "Гаж нөлөө"
    },
    jv: {
      brand_names: "Merek sing kasedhiya",
      description: "Babagan obat iki",
      before_using: "Sadurunge nggunakake obat iki",
      proper_use: "Cara nggunakake obat iki",
      sideeffects: "Efek samping"
    },
    su: {
      brand_names: "Merek anu sayogi",
      description: "Ngeunaan ubar ieu",
      before_using: "Sateuacan nganggo ubar ieu",
      proper_use: "Kumaha cara ngagunakeun ubar ieu",
      sideeffects: "Épék samping"
    },
    sw: {
      brand_names: "Bidhaa zinazopatikana",
      description: "Kuhusu dawa hii",
      before_using: "Kabla ya kutumia dawa hii",
      proper_use: "Jinsi ya kutumia dawa hii",
      sideeffects: "Madhara"
    },
    he: {
      brand_names: "מותגים זמינים",
      description: "על תרופה זו",
      before_using: "לפני השימוש בתרופה זו",
      proper_use: "כיצד להשתמש בתרופה זו",
      sideeffects: "תופעות לוואי"
    },
    fa: {
      brand_names: "برندهای موجود",
      description: "درباره این دارو",
      before_using: "قبل از استفاده از این دارو",
      proper_use: "نحوه استفاده از این دارو",
      sideeffects: "عوارض جانبی"
    },
    tr: {
       brand_names: "Mevcut markalar",
      description: "Bu ilaç hakkında",
      before_using: "Bu ilacı kullanmadan önce",
      proper_use: "Bu ilaç nasıl kullanılır",
      sideeffects: "Yan etkiler"
    },
    af: {
       brand_names: "Beskikbare handelsmerke",
      description: "Oor hierdie medikasie",
      before_using: "Voordat jy hierdie medikasie gebruik",
       proper_use: "Hoe om hierdie medikasie te gebruik",
      sideeffects: "Newe-effekte"
    },
      am: {
      brand_names: "የሚገኙ ምርቶች",
       description: "ስለዚህ መድሃኒት",
      before_using: "ይህንን መድሃኒት ከመጠቀምዎ በፊት",
      proper_use: "ይህንን መድሃኒት እንዴት መጠቀም እንደሚቻል",
      sideeffects: "የጎንዮሽ ጉዳቶች"
     },
      so: {
      brand_names: "Noocyada la heli karo",
      description: "Ku saabsan dawadan",
      before_using: "Kahor intaadan isticmaalin dawadan",
      proper_use: "Sida loo isticmaalo dawadan",
      sideeffects: "Waxyeelooyinka"
       },
    yo: {
      brand_names: "Àwọn ọnà ìtajà tó wà",
      description: "Nípa oògùn yìí",
      before_using: "Kí o tó lo oògùn yìí",
      proper_use: "Báwo lo ṣe lè lo oògùn yìí",
      sideeffects: "Àwọn ẹ̀gbẹ́ ńlá"
    },
    zu: {
       brand_names: "Imikhiqizo etholakalayo",
      description: "Mayelana naleli khambi",
      before_using: "Ngaphambi kokusebenzisa leli khambi",
      proper_use: "Indlela yokusebenzisa leli khambi",
      sideeffects: "Imiphumela emibi"
    },
      ha: {
       brand_names: "Samfuran da ake da su",
      description: "Game da wannan maganin",
      before_using: "Kafin amfani da wannan maganin",
       proper_use: "Yadda ake amfani da wannan maganin",
      sideeffects: "Sakamakon illa"
      },
      ig: {
      brand_names: "Ụdị dịnụ",
      description: "Gbasara ọgwụ a",
      before_using: "Tupu iji ọgwụ a",
      proper_use: "Otu esi eji ọgwụ a",
      sideeffects: "Mmetụta ndị na-eso ya"
       },
      rw: {
        brand_names: "Amoko ahari",
        description: "Ibyerekeye uyu muti",
       before_using: "Mbere yo gukoresha uyu muti",
        proper_use: "Uburyo bwo gukoresha uyu muti",
       sideeffects: "Ingaruka"
      },
      om: {
        brand_names: "Mallattoolee argaman",
        description: "Waa'ee qoricha kanaa",
       before_using: "Qoricha kana fayyadamuun dura",
        proper_use: "Akkaataa qoricha kana itti fayyadaman",
       sideeffects: "Miidhaa gamaara"
      },
       sn: {
      brand_names: "Mhando dzinowanikwa",
        description: "Nezve mushonga uyu",
        before_using: "Usati washandisa mushonga uyu",
        proper_use: "Mashandisirwo aungaita mushonga uyu",
      sideeffects: "Mhedzisiro"
      },
     ht: {
       brand_names: "Mak fabrikasyon ki disponib",
      description: "Konsènan medikaman sa a",
       before_using: "Anvan ou itilize medikaman sa a",
      proper_use: "Kijan pou itilize medikaman sa a",
      sideeffects: "Efè segondè"
       },
        mi: {
        brand_names: "Ngā waitohu e wātea ana",
        description: "Mō tēnei rongoā",
       before_using: "I mua i te whakamahi i tēnei rongoā",
        proper_use: "Me pēhea te whakamahi i tēnei rongoā",
      sideeffects: "Ngā pānga taha"
        },
     haw: {
        brand_names: "Nā mea hōʻailona e loaʻa ana",
        description: "E pili ana i kēia lāʻau",
       before_using: "Ma mua o ka hoʻohana ʻana i kēia lāʻau",
        proper_use: "Pehea e hoʻohana ai i kēia lāʻau",
      sideeffects: "Nā hopena ʻaoʻao"
      },
      la: {
       brand_names: "Notae praesto",
        description: "De hoc medicamento",
        before_using: "Antequam hoc medicamento utaris",
        proper_use: "Quomodo hoc medicamento utaris",
      sideeffects: "Effectus secundarii"
      }
  };
  
  export default sectionMappings;