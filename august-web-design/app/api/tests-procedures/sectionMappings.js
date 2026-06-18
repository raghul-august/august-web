const sectionMappings = {
    en: {
      overview: "About this test",
      why_its_done: "Why it's done",
      risks: "Risks and complications",
      how_to_prepare: "How to prepare",
      what_to_expect: "What to expect",
      results: "Understanding your results"
    },
    es: {
      overview: "Acerca de esta prueba",
      why_its_done: "Por qué se realiza",
      risks: "Riesgos y complicaciones",
      how_to_prepare: "Cómo prepararse",
      what_to_expect: "Qué esperar",
      results: "Entendiendo sus resultados"
    },
     fr: {
      overview: "À propos de ce test",
      why_its_done: "Pourquoi il est fait",
      risks: "Risques et complications",
      how_to_prepare: "Comment se préparer",
      what_to_expect: "À quoi s'attendre",
      results: "Comprendre vos résultats"
    },
    de: {
       overview: "Über diesen Test",
      why_its_done: "Warum er durchgeführt wird",
      risks: "Risiken und Komplikationen",
      how_to_prepare: "Wie man sich vorbereitet",
      what_to_expect: "Was zu erwarten ist",
      results: "Ihre Ergebnisse verstehen"
    },
    it: {
       overview: "Informazioni su questo test",
       why_its_done: "Perché viene eseguito",
      risks: "Rischi e complicazioni",
      how_to_prepare: "Come prepararsi",
      what_to_expect: "Cosa aspettarsi",
      results: "Comprensione dei risultati"
    },
     pt: {
      overview: "Sobre este teste",
      why_its_done: "Por que é feito",
      risks: "Riscos e complicações",
      how_to_prepare: "Como se preparar",
      what_to_expect: "O que esperar",
      results: "Compreendendo seus resultados"
     },
     ru: {
        overview: "Об этом тесте",
       why_its_done: "Зачем это делается",
      risks: "Риски и осложнения",
        how_to_prepare: "Как подготовиться",
         what_to_expect: "Чего ожидать",
        results: "Понимание ваших результатов"
     },
    "zh-Hans": {
      overview: "关于此测试",
       why_its_done: "为什么要进行此项检查",
      risks: "风险和并发症",
       how_to_prepare: "如何准备",
      what_to_expect: "预期事项",
       results: "了解您的结果"
    },
    "zh-Hant": {
      overview: "關於此測試",
      why_its_done: "為什麼要進行此項檢查",
      risks: "風險和併發症",
      how_to_prepare: "如何準備",
      what_to_expect: "預期事項",
      results: "了解您的結果"
    },
     ja: {
      overview: "この検査について",
       why_its_done: "なぜそれが行われるのか",
      risks: "リスクと合併症",
      how_to_prepare: "準備方法",
       what_to_expect: "何を期待するか",
       results: "結果を理解する"
      },
    ko: {
      overview: "이 검사에 대하여",
       why_its_done: "왜 하는 검사인가요",
      risks: "위험 및 합병증",
       how_to_prepare: "준비 방법",
      what_to_expect: "예상 사항",
       results: "결과 이해하기"
     },
    ar: {
      overview: "حول هذا الاختبار",
       why_its_done: "لماذا يتم ذلك",
      risks: "المخاطر والمضاعفات",
      how_to_prepare: "كيفية التحضير",
      what_to_expect: "ماذا تتوقع",
      results: "فهم نتائجك"
    },
    hi: {
      overview: "इस परीक्षण के बारे में",
       why_its_done: "यह क्यों किया जाता है",
      risks: "जोखिम और जटिलताएं",
       how_to_prepare: "कैसे तैयार करें",
      what_to_expect: "क्या उम्मीद करें",
       results: "अपने परिणामों को समझना"
    },
      nl: {
      overview: "Over deze test",
       why_its_done: "Waarom het wordt gedaan",
      risks: "Risico's en complicaties",
        how_to_prepare: "Hoe voor te bereiden",
       what_to_expect: "Wat te verwachten",
      results: "Uw resultaten begrijpen"
      },
      pl: {
       overview: "O tym teście",
        why_its_done: "Dlaczego jest wykonywany",
        risks: "Ryzyko i powikłania",
         how_to_prepare: "Jak się przygotować",
       what_to_expect: "Czego się spodziewać",
        results: "Zrozumienie wyników"
      },
      sv: {
       overview: "Om detta test",
       why_its_done: "Varför det görs",
        risks: "Risker och komplikationer",
         how_to_prepare: "Hur man förbereder sig",
      what_to_expect: "Vad du kan förvänta dig",
        results: "Förstå dina resultat"
      },
      no: {
        overview: "Om denne testen",
        why_its_done: "Hvorfor den utføres",
        risks: "Risiko og komplikasjoner",
       how_to_prepare: "Hvordan forberede seg",
      what_to_expect: "Hva du kan forvente",
        results: "Forstå resultatene dine"
      },
      da: {
        overview: "Om denne test",
         why_its_done: "Hvorfor det gøres",
        risks: "Risici og komplikationer",
         how_to_prepare: "Sådan forbereder du dig",
      what_to_expect: "Hvad kan du forvente",
        results: "Forstå dine resultater"
      },
       fi: {
        overview: "Tietoja tästä testistä",
       why_its_done: "Miksi se tehdään",
         risks: "Riskit ja komplikaatiot",
          how_to_prepare: "Miten valmistautua",
        what_to_expect: "Mitä odottaa",
          results: "Tulosten ymmärtäminen"
       },
     cs: {
        overview: "O tomto testu",
         why_its_done: "Proč se provádí",
        risks: "Rizika a komplikace",
        how_to_prepare: "Jak se připravit",
        what_to_expect: "Co očekávat",
       results: "Porozumění vašim výsledkům"
     },
     hu: {
      overview: "A tesztről",
        why_its_done: "Miért végzik el",
        risks: "Kockázatok és szövődmények",
         how_to_prepare: "Hogyan kell felkészülni",
      what_to_expect: "Mire számíthat",
      results: "Az eredmények értelmezése"
      },
    ro: {
       overview: "Despre acest test",
      why_its_done: "De ce se face",
        risks: "Riscuri și complicații",
         how_to_prepare: "Cum să vă pregătiți",
       what_to_expect: "La ce să vă așteptați",
        results: "Înțelegerea rezultatelor"
      },
    el: {
      overview: "Σχετικά με αυτό το τεστ",
        why_its_done: "Γιατί γίνεται",
        risks: "Κίνδυνοι και επιπλοκές",
          how_to_prepare: "Πώς να προετοιμαστείτε",
       what_to_expect: "Τι να περιμένετε",
        results: "Κατανόηση των αποτελεσμάτων σας"
       },
       uk: {
         overview: "Про цей тест",
         why_its_done: "Навіщо це робиться",
          risks: "Ризики та ускладнення",
          how_to_prepare: "Як підготуватися",
          what_to_expect: "Чого очікувати",
         results: "Розуміння результатів"
      },
    bg: {
         overview: "За този тест",
       why_its_done: "Защо се прави",
        risks: "Рискове и усложнения",
         how_to_prepare: "Как да се подготвите",
       what_to_expect: "Какво да очаквате",
         results: "Разбиране на резултатите"
      },
    hr: {
      overview: "O ovom testu",
      why_its_done: "Zašto se radi",
        risks: "Rizici i komplikacije",
         how_to_prepare: "Kako se pripremiti",
      what_to_expect: "Što očekivati",
       results: "Razumijevanje rezultata"
      },
      sk: {
        overview: "O tomto teste",
        why_its_done: "Prečo sa to robí",
        risks: "Riziká a komplikácie",
        how_to_prepare: "Ako sa pripraviť",
         what_to_expect: "Čo očakávať",
        results: "Pochopenie vašich výsledkov"
      },
     sl: {
      overview: "O tem testu",
         why_its_done: "Zakaj se izvaja",
        risks: "Tveganja in zapleti",
        how_to_prepare: "Kako se pripraviti",
         what_to_expect: "Kaj pričakovati",
        results: "Razumevanje rezultatov"
      },
      et: {
        overview: "Selle testi kohta",
        why_its_done: "Miks seda tehakse",
        risks: "Riskid ja tüsistused",
         how_to_prepare: "Kuidas valmistuda",
        what_to_expect: "Mida oodata",
        results: "Tulemuste mõistmine"
      },
      lv: {
       overview: "Par šo testu",
      why_its_done: "Kāpēc tas tiek darīts",
       risks: "Riski un sarežģījumi",
        how_to_prepare: "Kā sagatavoties",
         what_to_expect: "Ko gaidīt",
      results: "Izpratne par saviem rezultātiem"
      },
      lt: {
        overview: "Apie šį testą",
       why_its_done: "Kodėl tai daroma",
        risks: "Rizika ir komplikacijos",
         how_to_prepare: "Kaip pasiruošti",
        what_to_expect: "Ko tikėtis",
      results: "Savo rezultatų supratimas"
      },
      is: {
         overview: "Um þetta próf",
      why_its_done: "Af hverju það er gert",
      risks: "Áhætta og fylgikvillar",
      how_to_prepare: "Hvernig á að undirbúa",
       what_to_expect: "Hvers má búast við",
       results: "Að skilja niðurstöður þínar"
      },
     ga: {
        overview: "Maidir leis an tástáil seo",
        why_its_done: "Cén fáth a ndéantar é",
        risks: "Rioscaí agus deacrachtaí",
        how_to_prepare: "Conas ullmhú",
       what_to_expect: "Cad atá le súil leis",
       results: "Do thorthaí a thuiscint"
      },
      mt: {
        overview: "Dwar dan it-test",
       why_its_done: "Għaliex isir",
        risks: "Riskji u kumplikazzjonijiet",
         how_to_prepare: "Kif tipprepara",
       what_to_expect: "X'tistenna",
        results: "Nifhmu r-riżultati tiegħek"
      },
    sq: {
      overview: "Rreth këtij testi",
      why_its_done: "Pse bëhet",
      risks: "Rreziqet dhe ndërlikimet",
       how_to_prepare: "Si të përgatiteni",
       what_to_expect: "Çfarë të prisni",
      results: "Kuptimi i rezultateve tuaja"
      },
    be: {
        overview: "Пра гэты тэст",
       why_its_done: "Чаму гэта робіцца",
        risks: "Рызыкі і ўскладненні",
        how_to_prepare: "Як падрыхтавацца",
        what_to_expect: "Чаго чакаць",
       results: "Разуменне вынікаў"
       },
    bs: {
        overview: "O ovom testu",
        why_its_done: "Zašto se radi",
        risks: "Rizici i komplikacije",
         how_to_prepare: "Kako se pripremiti",
        what_to_expect: "Šta očekivati",
        results: "Razumijevanje rezultata"
    },
    gd: {
        overview: "Mun deidhinn an deuchainn seo",
        why_its_done: "Carson a tha e air a dhèanamh",
        risks: "Cunnartan agus duilgheadasan",
        how_to_prepare: "Mar a dh’ullaicheas tu",
         what_to_expect: "Na tha ri shùileachadh",
        results: "A’ tuigsinn nan toraidhean agad"
      },
    lb: {
       overview: "Iwwer dësen Test",
         why_its_done: "Firwat et gemaach gëtt",
       risks: "Risiken a Komplikatiounen",
         how_to_prepare: "Wéi preparéieren",
       what_to_expect: "Wat erwaart",
        results: "Är Resultater verstoen"
    },
      mk: {
        overview: "За овој тест",
      why_its_done: "Зошто се прави",
         risks: "Ризици и компликации",
         how_to_prepare: "Како да се подготвите",
       what_to_expect: "Што да очекувате",
        results: "Разбирање на вашите резултати"
     },
     sr: {
         overview: "О овом тесту",
       why_its_done: "Зашто се ради",
        risks: "Ризици и компликације",
        how_to_prepare: "Како се припремити",
        what_to_expect: "Шта очекивати",
        results: "Разумевање резултата"
      },
     cy: {
        overview: "Ynglŷn â'r prawf hwn",
        why_its_done: "Pam ei fod yn cael ei wneud",
       risks: "Risgiau a chymhlethdodau",
        how_to_prepare: "Sut i baratoi",
        what_to_expect: "Beth i'w ddisgwyl",
       results: "Deall eich canlyniadau"
      },
      vi: {
         overview: "Về xét nghiệm này",
         why_its_done: "Tại sao nó được thực hiện",
        risks: "Rủi ro và biến chứng",
         how_to_prepare: "Cách chuẩn bị",
        what_to_expect: "Điều gì sẽ xảy ra",
       results: "Hiểu kết quả của bạn"
       },
     th: {
        overview: "เกี่ยวกับแบบทดสอบนี้",
      why_its_done: "ทำไมถึงทำ",
         risks: "ความเสี่ยงและภาวะแทรกซ้อน",
          how_to_prepare: "วิธีการเตรียมตัว",
       what_to_expect: "สิ่งที่คาดหวัง",
       results: "ทำความเข้าใจผลลัพธ์ของคุณ"
     },
     id: {
         overview: "Tentang tes ini",
       why_its_done: "Mengapa ini dilakukan",
        risks: "Risiko dan komplikasi",
         how_to_prepare: "Cara mempersiapkan",
       what_to_expect: "Apa yang diharapkan",
        results: "Memahami hasil Anda"
      },
      ms: {
       overview: "Mengenai ujian ini",
        why_its_done: "Mengapa ia dilakukan",
       risks: "Risiko dan komplikasi",
         how_to_prepare: "Cara membuat persediaan",
        what_to_expect: "Apa yang dijangka",
        results: "Memahami keputusan anda"
      },
    tl: {
       overview: "Tungkol sa pagsusulit na ito",
        why_its_done: "Bakit ito ginagawa",
        risks: "Mga panganib at komplikasyon",
        how_to_prepare: "Paano maghanda",
      what_to_expect: "Ano ang aasahan",
        results: "Pag-unawa sa iyong mga resulta"
      },
     bn: {
        overview: "এই পরীক্ষা সম্পর্কে",
        why_its_done: "এটি কেন করা হয়",
         risks: "ঝুঁকি এবং জটিলতা",
       how_to_prepare: "কিভাবে প্রস্তুত করতে হয়",
      what_to_expect: "কি আশা করা যায়",
        results: "আপনার ফলাফল বোঝা"
      },
       ur: {
        overview: "اس ٹیسٹ کے بارے میں",
       why_its_done: "یہ کیوں کیا جاتا ہے؟",
      risks: "خطرات اور پیچیدگیاں",
       how_to_prepare: "تیاری کیسے کریں",
      what_to_expect: "کیا توقع کی جائے",
        results: "اپنے نتائج کو سمجھنا"
      },
     te: {
       overview: "ఈ పరీక్ష గురించి",
        why_its_done: "ఇది ఎందుకు చేస్తారు",
      risks: "నష్టాలు మరియు సమస్యలు",
       how_to_prepare: "ఎలా సిద్ధం కావాలి",
        what_to_expect: "ఏమి ఆశించాలి",
      results: "మీ ఫలితాలను అర్థం చేసుకోవడం"
     },
      mr: {
       overview: "या चाचणीबद्दल",
        why_its_done: "हे का केले जाते",
      risks: "धोके आणि गुंतागुंत",
        how_to_prepare: "तयारी कशी करावी",
      what_to_expect: "काय अपेक्षित आहे",
      results: "तुमचे निकाल समजून घेणे"
        },
    gu: {
       overview: "આ પરીક્ષણ વિશે",
        why_its_done: "તે શા માટે કરવામાં આવે છે",
      risks: "જોખમો અને ગૂંચવણો",
        how_to_prepare: "કેવી રીતે તૈયાર કરવું",
        what_to_expect: "શું અપેક્ષા રાખવી",
      results: "તમારા પરિણામોને સમજવું"
      },
    kn: {
        overview: "ಈ ಪರೀಕ್ಷೆಯ ಬಗ್ಗೆ",
       why_its_done: "ಇದು ಏಕೆ ಮಾಡಲಾಗುತ್ತದೆ",
        risks: "ಅಪಾಯಗಳು ಮತ್ತು ತೊಡಕುಗಳು",
       how_to_prepare: "ಹೇಗೆ ತಯಾರಿಸುವುದು",
        what_to_expect: "ಏನು ನಿರೀಕ್ಷಿಸಬಹುದು",
      results: "ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು"
      },
      pa: {
       overview: "ਇਸ ਟੈਸਟ ਬਾਰੇ",
         why_its_done: "ਇਹ ਕਿਉਂ ਕੀਤਾ ਜਾਂਦਾ ਹੈ",
      risks: "ਜੋਖਮ ਅਤੇ ਜਟਿਲਤਾਵਾਂ",
         how_to_prepare: "ਤਿਆਰੀ ਕਿਵੇਂ ਕਰੀਏ",
        what_to_expect: "ਕੀ ਉਮੀਦ ਕਰਨੀ ਹੈ",
      results: "ਆਪਣੇ ਨਤੀਜਿਆਂ ਨੂੰ ਸਮਝਣਾ"
      },
      ne: {
        overview: "यो परीक्षणको बारेमा",
         why_its_done: "यो किन गरिन्छ",
      risks: "जोखिमहरू र जटिलताहरू",
        how_to_prepare: "कसरी तयारी गर्ने",
        what_to_expect: "के अपेक्षा गर्ने",
       results: "तपाईंको परिणामहरू बुझ्दै"
      },
      my: {
        overview: "ဒီစမ်းသပ်မှုအကြောင်း",
         why_its_done: "ဘာလို့လုပ်တာလဲ",
       risks: "အန္တရာယ်များနှင့် နောက်ဆက်တွဲပြဿနာများ",
         how_to_prepare: "ဘယ်လိုပြင်ဆင်မလဲ",
       what_to_expect: "ဘာတွေမျှော်လင့်ရမလဲ",
       results: "သင့်ရလဒ်များကို နားလည်ခြင်း"
      },
       km: {
       overview: "អំពីការធ្វើតេស្តនេះ",
       why_its_done: "ហេតុអ្វីបានជាវាត្រូវបានធ្វើ",
         risks: "ហានិភ័យ និងផលវិបាក",
      how_to_prepare: "របៀបរៀបចំ",
        what_to_expect: "អ្វីដែលត្រូវរំពឹងទុក",
         results: "ការយល់ដឹងពីលទ្ធផលរបស់អ្នក"
      },
     si: {
        overview: "මෙම පරීක්ෂණය ගැන",
       why_its_done: "මෙය සිදු කරන්නේ ඇයි",
        risks: "අවදානම් සහ සංකූලතා",
       how_to_prepare: "සූදානම් වන්නේ කෙසේද",
       what_to_expect: "බලාපොරොත්තු විය යුතු දේ",
      results: "ඔබගේ ප්‍රතිඵල අවබෝධ කර ගැනීම"
     },
     ml: {
      overview: "ഈ പരിശോധനയെക്കുറിച്ച്",
        why_its_done: "ഇത് എന്തിനാണ് ചെയ്യുന്നത്",
        risks: "അപകടസാധ്യതകളും സങ്കീർണതകളും",
        how_to_prepare: "എങ്ങനെ തയ്യാറാക്കാം",
        what_to_expect: "എന്താണ് പ്രതീക്ഷിക്കേണ്ടത്",
       results: "നിങ്ങളുടെ ഫലങ്ങൾ മനസ്സിലാക്കുന്നു"
      },
      mn: {
        overview: "Энэ шинжилгээний тухай",
        why_its_done: "Яагаад үүнийг хийдэг вэ",
        risks: "Эрсдэл ба хүндрэл",
       how_to_prepare: "Хэрхэн бэлтгэх вэ",
       what_to_expect: "Юу хүлээх вэ",
      results: "Үр дүнгээ ойлгох"
      },
      jv: {
        overview: "Babagan tes iki",
       why_its_done: "Napa sebabe iki ditindakake",
        risks: "Risiko lan komplikasi",
        how_to_prepare: "Cara nyiapake",
       what_to_expect: "Apa sing dikarepake",
        results: "Ngerteni asil sampeyan"
      },
    su: {
        overview: "Ngeunaan tés ieu",
       why_its_done: "Naha éta dilakukeun",
         risks: "Résiko sareng komplikasi",
        how_to_prepare: "Kumaha carana nyiapkeun",
         what_to_expect: "Naon anu diarepkeun",
       results: "Ngartos hasil anjeun"
     },
      sw: {
      overview: "Kuhusu jaribio hili",
        why_its_done: "Kwa nini inafanywa",
        risks: "Hatari na shida",
         how_to_prepare: "Jinsi ya kujiandaa",
       what_to_expect: "Unachoweza kutarajia",
        results: "Kuelewa matokeo yako"
      },
      he: {
      overview: "על בדיקה זו",
      why_its_done: "למה זה נעשה",
      risks: "סיכונים וסיבוכים",
        how_to_prepare: "כיצד להתכונן",
         what_to_expect: "למה לצפות",
      results: "הבנת התוצאות שלך"
      },
     fa: {
       overview: "درباره این آزمایش",
       why_its_done: "چرا انجام می شود",
       risks: "خطرات و عوارض",
      how_to_prepare: "چگونه آماده شویم",
       what_to_expect: "چه انتظاری داشته باشیم",
      results: "درک نتایج خود"
       },
     tr: {
        overview: "Bu test hakkında",
      why_its_done: "Neden yapılıyor",
        risks: "Riskler ve komplikasyonlar",
       how_to_prepare: "Nasıl hazırlanmalı",
      what_to_expect: "Ne beklenmeli",
      results: "Sonuçlarınızı anlamak"
      },
      af: {
         overview: "Oor hierdie toets",
      why_its_done: "Hoekom dit gedoen word",
        risks: "Risiko's en komplikasies",
          how_to_prepare: "Hoe om voor te berei",
        what_to_expect: "Wat om te verwag",
      results: "Verstaan ​​jou resultate"
      },
      am: {
       overview: "ስለዚህ ምርመራ",
        why_its_done: "ለምን ይደረጋል",
       risks: "አደጋዎች እና ውስብስብ ችግሮች",
        how_to_prepare: "እንዴት መዘጋጀት ይቻላል",
         what_to_expect: "ምን ይጠበቃል",
        results: "ውጤቶችዎን መረዳት"
      },
       so: {
          overview: "Ku saabsan baaritaankan",
         why_its_done: "Waa maxay sababta loo sameeyo",
        risks: "Khataraha iyo dhibaatooyinka",
       how_to_prepare: "Sidee loo diyaargaroobaa",
        what_to_expect: "Maxaa la filan karaa",
       results: "Fahamka natiijooyinkaaga"
       },
     yo: {
          overview: "Nípa ìdánwò yìí",
          why_its_done: "Kí nìdí tí wọ́n fi ń ṣe é",
         risks: "Àwọn ewu àti ìṣòro tó lè wáyé",
          how_to_prepare: "Báwo ni a ṣe lè múra sílẹ̀",
        what_to_expect: "Kí la lè retí",
          results: "Lílóye àwọn àbájáde rẹ"
      },
     zu: {
      overview: "Mayelana nalokhu kuhlolwa",
        why_its_done: "Kungani kwenziwa",
        risks: "Izingozi nezinkinga",
         how_to_prepare: "Indlela yokulungiselela",
       what_to_expect: "Okulindelekile",
      results: "Ukuqonda imiphumela yakho"
     },
     ha: {
          overview: "Game da wannan gwajin",
      why_its_done: "Me yasa ake yin sa",
      risks: "Haɗari da rikitarwa",
          how_to_prepare: "Yadda ake shiryawa",
      what_to_expect: "Abin da za a yi tsammani",
        results: "Fahimtar sakamakon ku"
       },
      ig: {
          overview: "Gbasara ule a",
        why_its_done: "Maka gịnị ka e ji eme ya",
        risks: "Ihe egwu na nsogbu",
       how_to_prepare: "Otu esi akwado",
        what_to_expect: "Ihe ị ga-atụ anya ya",
        results: "Ịghọta nsonaazụ gị"
      },
       rw: {
        overview: "Ibyerekeye iki kizamini",
       why_its_done: "Impamvu bikorwa",
        risks: "Ingaruka n’ibibazo",
         how_to_prepare: "Uko witegura",
       what_to_expect: "Icyo kwitega",
         results: "Gusobanukirwa ibisubizo byawe"
        },
      om: {
        overview: "Waa'ee qormaata kanaa",
         why_its_done: "Maaliif kan godhamu",
         risks: "Rakkoolee fi dhibeewwan",
          how_to_prepare: "Akkaataa itti qophaa'an",
        what_to_expect: "Maal eeguu qabda",
         results: "Bu'aa kee hubachuu"
      },
    sn: {
       overview: "Nezve bvunzo iyi",
         why_its_done: "Nei ichiitwa",
       risks: "Ngozi nematambudziko",
         how_to_prepare: "Maitiro ekugadzirira",
        what_to_expect: "Zvekutarisira",
       results: "Kunzwisisa mhedzisiro yako"
      },
    ht: {
          overview: "Konsènan tès sa a",
      why_its_done: "Poukisa li fèt",
      risks: "Risk ak konplikasyon",
         how_to_prepare: "Ki jan yo prepare",
          what_to_expect: "Kisa pou atann",
        results: "Konprann rezilta ou yo"
      },
     mi: {
         overview: "Mō tēnei whakamātautau",
       why_its_done: "He aha ai i mahia ai",
        risks: "Ngā tūraru me ngā raruraru",
        how_to_prepare: "Me pēhea te whakarite",
        what_to_expect: "He aha e tūmanakohia",
        results: "Te mārama ki ō hua"
      },
       haw: {
         overview: "E pili ana i kēia hoʻāʻo",
      why_its_done: "No ke aha i hana ʻia ai",
       risks: "Nā pilikia a me nā pilikia",
        how_to_prepare: "Pehea e hoʻomākaukau ai",
       what_to_expect: "He aha ka mea e manaʻo ʻia",
       results: "Ke hoʻomaopopo nei i kāu mau hopena"
     },
     la: {
         overview: "De hoc experimento",
      why_its_done: "Cur id fiat",
       risks: "Pericula et implicationes",
        how_to_prepare: "Quomodo parare",
         what_to_expect: "Quid exspectes",
       results: "Intellectus eventus tuos"
      }
  };
  
  export default sectionMappings;