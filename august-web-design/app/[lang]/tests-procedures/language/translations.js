const translationStrings = {
    en: {
      title: 'Tests and Procedures',
      description:
        'Find detailed information about medical tests and procedures, including what to expect and how to prepare.',
      searchPlaceholder: 'Search tests and procedures...',
      browseByLetter: 'Browse by Letter',
      noTestsFound: (letter) =>
        `No tests found starting with '${letter.toUpperCase()}'`,
      tryAnother: 'Please try another letter or use the search function.',
      home: 'Home',
      originalSource: 'Original source: ',
      commonTestsTitle: 'Common Tests and Procedures',
      commonTestsDescription:
        'Find detailed information about frequently performed medical tests and procedures.',
      completeBloodCount: 'Complete Blood Count (CBC)',
      completeBloodCountDescription:
        'Measures different components of your blood, including red and white blood cells.',
      mriScan: 'MRI Scan',
      mriScanDescription:
        'Detailed imaging test that uses magnetic fields and radio waves to create pictures of organs.',
      ctScan: 'CT Scan',
      ctScanDescription:
        'Advanced X-ray that takes detailed images of organs and structures inside your body.',
      colonoscopy: 'Colonoscopy',
      colonoscopyDescription:
        'Examination of the large intestine for abnormalities and cancer screening.',
      echocardiogram: 'Echocardiogram',
      echocardiogramDescription:
        "Ultrasound test that checks your heart's structure and function.",
      stressTest: 'Stress Test',
      stressTestDescription:
        'Measures how your heart performs during physical activity.',
      mammogram: 'Mammogram',
      mammogramDescription:
        'X-ray imaging of the breast used to screen for breast cancer.',
      endoscopy: 'Endoscopy',
      endoscopyDescription:
        'Procedure to examine the inside of your digestive tract.',
      testNotFound: 'Test not found',
      learnMore: 'Learn more: ',
      concernedXrayTitle: 'Concerned about X-ray exposure?',
      askAugustAITitle: 'Ask <b>August AI</b> privately.',
    },
    es: {
      title: 'Pruebas y Procedimientos',
      description:
        'Encuentre información detallada sobre pruebas médicas y procedimientos, incluyendo qué esperar y cómo prepararse.',
      searchPlaceholder: 'Buscar pruebas y procedimientos...',
      browseByLetter: 'Buscar por Letra',
      noTestsFound: (letter) =>
        `No se encontraron pruebas que comiencen con '${letter.toUpperCase()}'`,
      tryAnother:
        'Por favor, intente con otra letra o use la función de búsqueda.',
      home: 'Inicio',
      originalSource: 'Fuente original: ',
      commonTestsTitle: 'Pruebas y Procedimientos Comunes',
      commonTestsDescription:
        'Encuentre información sobre pruebas médicas y procedimientos frecuentes.',
      completeBloodCount: 'Hemograma Completo',
      completeBloodCountDescription:
        'Mide diferentes componentes de su sangre, incluyendo glóbulos rojos y blancos.',
      mriScan: 'Resonancia Magnética',
      mriScanDescription:
        'Prueba de imagen detallada que utiliza campos magnéticos y ondas de radio para crear imágenes de órganos.',
      ctScan: 'Tomografía Computarizada',
      ctScanDescription:
        'Radiografía avanzada que toma imágenes detalladas de órganos y estructuras dentro de su cuerpo.',
      colonoscopy: 'Colonoscopia',
      colonoscopyDescription:
        'Examen del intestino grueso para detectar anomalías y realizar exámenes de cáncer.',
      echocardiogram: 'Ecocardiograma',
      echocardiogramDescription:
        'Prueba de ultrasonido que verifica la estructura y función de su corazón.',
      stressTest: 'Prueba de Esfuerzo',
      stressTestDescription:
        'Mide cómo funciona su corazón durante la actividad física.',
      mammogram: 'Mamografía',
      mammogramDescription:
        'Imágenes de rayos X del seno utilizadas para detectar cáncer de mama.',
      endoscopy: 'Endoscopia',
      endoscopyDescription:
        'Procedimiento para examinar el interior de su tracto digestivo.',
      testNotFound: 'Prueba no encontrada',
      learnMore: 'Más información: ',
      concernedXrayTitle: '¿Preocupado por la exposición a rayos X?',
      askAugustAITitle: 'Pregunta a <b>August AI</b> en privado.',
    },
    fr: {
      title: 'Tests et Procédures',
      description:
        'Trouvez des informations détaillées sur les tests et procédures médicales, y compris ce que vous pouvez attendre et comment vous préparer.',
      searchPlaceholder: 'Rechercher des tests et procédures...',
      browseByLetter: 'Rechercher par Lettre',
      noTestsFound: (letter) =>
        `Aucun test trouvé commençant par '${letter.toUpperCase()}'`,
      tryAnother:
        'Veuillez essayer une autre lettre ou utiliser la fonction de recherche.',
      home: 'Accueil',
      originalSource: 'Source originale: ',
      commonTestsTitle: 'Tests et Procédures Fréquents',
      commonTestsDescription:
        'Trouvez des informations sur les tests et procédures médicales fréquemment réalisés.',
      completeBloodCount: 'Hémogramme Complet',
      completeBloodCountDescription:
        'Mesure différents composants de votre sang, y compris les globules rouges et blancs.',
      mriScan: 'Résonance Magnétique',
      mriScanDescription:
        'Test d\'imagerie détaillée qui utilise des champs magnétiques et des ondes radio pour créer des images d\'organes.',
      ctScan: 'Tomographie Computée',
      ctScanDescription:
        'Radiographie avancée qui prend des images détaillées des organes et des structures dans votre corps.',
      colonoscopy: 'Colonoscopie',
      colonoscopyDescription:
        'Examen du gros intestin pour détecter des anomalies et réaliser des examens de cancer.',
      echocardiogram: 'Echocardiogramme',
      echocardiogramDescription:
        'Test d\'ultrason qui vérifie la structure et la fonction de votre cœur.',
      stressTest: 'Test d\'Esfuerzo',
      stressTestDescription:
        'Mesure comment votre cœur fonctionne pendant l\'activité physique.',
      mammogram: 'Mamographie',
      mammogramDescription:
        'Images de rayons X du sein utilisées pour détecter le cancer du sein.',
      endoscopy: 'Endoscopie',
      endoscopyDescription:
        'Procédure pour examiner l\'intérieur de votre tractus digestif.',
      testNotFound: 'Test non trouvé',
      learnMore: 'Plus d\'informations: ',
      concernedXrayTitle: 'Inquiet de l\'exposition aux rayons X ?',
      askAugustAITitle: 'Demandez à <b>August AI</b> en privé.',
    },
      ta: {
        title: 'சோதனைகள் மற்றும் நடைமுறைகள்',
      description:
        'மருத்துவ பரிசோதனைகள் மற்றும் நடைமுறைகள் பற்றிய விரிவான தகவல்களைக் கண்டறியவும், எதிர்பார்க்க வேண்டியவை மற்றும் எவ்வாறு தயாராவது என்பது உட்பட.',
       searchPlaceholder: 'சோதனைகள் மற்றும் நடைமுறைகள் தேடவும்...',
       browseByLetter: 'எழுத்தைப் பயன்படுத்தி தேடவும்',
        noTestsFound: (letter) => `'${letter.toUpperCase()}' என்ற எழுத்தில் தொடங்கும் சோதனைகள் எதுவும் கிடைக்கவில்லை`,
        tryAnother: 'வேறு எழுத்தை முயற்சிக்கவும் அல்லது தேடல் வசதியைப் பயன்படுத்தவும்.',
        home: 'முகப்பு',
        originalSource: 'மூல ஆதாரம்: ',
        commonTestsTitle: 'மிகவும் பரிசோதனைகள் மற்றும் நடைமுறைகள்',
        commonTestsDescription:
          'அடிக்கடி செய்யக்கூடிய மருத்துவ பரிசோதனைகள் மற்றும் நடைமுறைகள் பற்றிய விரிவான தகவல்களைக் கண்டறியவும்.',
        completeBloodCount: 'முழுமையான இரத்த எண்ணிக்கை (சிபிசி)',
        completeBloodCountDescription:
          'சிவப்பு மற்றும் வெள்ளை இரத்த அணுக்கள் உட்பட உங்கள் இரத்தத்தின் பல்வேறு கூறுகளை அளவிடுகிறது.',
        mriScan: 'எம்ஆர்ஐ ஸ்கேன்',
        mriScanDescription:
          'உறுப்புகளின் படங்களை உருவாக்க காந்தப்புலங்களையும் கதிரியக்க அலைகளையும் பயன்படுத்தும் விரிவான இமேஜிங் சோதனை.',
        ctScan: 'சிடி ஸ்கேன்',
        ctScanDescription:
          'உங்கள் உடலுக்குள் உள்ள உறுப்புகள் மற்றும் கட்டமைப்புகளின் விரிவான படங்களை எடுக்கும் மேம்பட்ட எக்ஸ்-ரே.',
        colonoscopy: 'பெருங்குடல் ஆய்வு',
        colonoscopyDescription:
          'குடல் பெருங்குடல் அசாதாரணங்கள் மற்றும் புற்றுநோய் பரிசோதனைகளை கண்டறிய.',
        echocardiogram: 'எக்கோ கார்டியோகிராம்',
        echocardiogramDescription:
          'உங்கள் இதயத்தின் அமைப்பு மற்றும் செயல்பாட்டைச் சரிபார்க்கும் அல்ட்ராசவுண்ட் சோதனை.',
        stressTest: 'அழுத்த சோதனை',
        stressTestDescription:
          'உடல் செயல்பாடுகளின் போது உங்கள் இதயம் எவ்வாறு செயல்படுகிறது என்பதை அளவிடுகிறது.',
        mammogram: 'மேமோகிராம்',
        mammogramDescription:
          'மார்பக புற்றுநோய்க்கான சோதனையாகப் பயன்படுத்தப்படும் மார்பகத்தின் எக்ஸ்-ரே படங்கள்.',
        endoscopy: 'எண்டோஸ்கோபி',
        endoscopyDescription: 'உங்கள் செரிமானப் பாதையின் உட்புறத்தை ஆராய்வதற்கான செயல்முறை.',
        testNotFound: 'சோதனை கிடைக்கவில்லை',
        learnMore: 'மேலும் அறிக: ',
        concernedXrayTitle: 'எக்ஸ்-ரே வெளிப்பாடு குறித்து கவலைப்படுகிறீர்களா?',
        askAugustAITitle: '<b>August AI</b> ஐ தனிப்பட்ட முறையில் கேளுங்கள்.',
    },
     de: {
      title: 'Tests und Verfahren',
      description:
        'Hier finden Sie detaillierte Informationen zu medizinischen Tests und Verfahren, einschließlich der Erwartungen und der Vorbereitung.',
      searchPlaceholder: 'Suche nach Tests und Verfahren...',
      browseByLetter: 'Nach Buchstaben suchen',
      noTestsFound: (letter) =>
        `Keine Tests gefunden, die mit '${letter.toUpperCase()}' beginnen`,
      tryAnother:
        'Bitte versuchen Sie einen anderen Buchstaben oder verwenden Sie die Suchfunktion.',
      home: 'Startseite',
      originalSource: 'Originalquelle: ',
      commonTestsTitle: 'Häufige Tests und Verfahren',
      commonTestsDescription:
        'Hier finden Sie detaillierte Informationen zu häufig durchgeführten medizinischen Tests und Verfahren.',
       completeBloodCount: 'Vollständiges Blutbild (CBC)',
      completeBloodCountDescription:
        'Misst verschiedene Bestandteile Ihres Blutes, einschließlich roter und weißer Blutkörperchen.',
      mriScan: 'MRT-Scan',
      mriScanDescription:
        'Detaillierter Bildgebungstest, der Magnetfelder und Radiowellen verwendet, um Bilder von Organen zu erstellen.',
      ctScan: 'CT-Scan',
      ctScanDescription:
        'Fortgeschrittene Röntgenaufnahme, die detaillierte Bilder von Organen und Strukturen in Ihrem Körper macht.',
      colonoscopy: 'Darmspiegelung',
      colonoscopyDescription:
        'Untersuchung des Dickdarms zur Erkennung von Anomalien und zur Krebsvorsorge.',
      echocardiogram: 'Echokardiogramm',
      echocardiogramDescription:
        'Ultraschalltest, der die Struktur und Funktion Ihres Herzens überprüft.',
      stressTest: 'Belastungstest',
      stressTestDescription:
        'Misst, wie Ihr Herz bei körperlicher Aktivität arbeitet.',
      mammogram: 'Mammographie',
      mammogramDescription:
        'Röntgenbilder der Brust, die zur Früherkennung von Brustkrebs verwendet werden.',
      endoscopy: 'Endoskopie',
      endoscopyDescription:
        'Verfahren zur Untersuchung des Inneren Ihres Verdauungstrakts.',
      testNotFound: 'Test nicht gefunden',
      learnMore: 'Mehr erfahren: ',
      concernedXrayTitle: 'Besorgt über Röntgenstrahlung?',
      askAugustAITitle: 'Fragen Sie <b>August AI</b> privat.',
      },
     it: {
      title: 'Test e procedure',
      description:
          'Trova informazioni dettagliate su test e procedure mediche, inclusi cosa aspettarsi e come prepararsi.',
      searchPlaceholder: 'Cerca test e procedure...',
      browseByLetter: 'Cerca per lettera',
      noTestsFound: (letter) =>
        `Nessun test trovato che inizi con '${letter.toUpperCase()}'`,
        tryAnother:
        'Prova un\'altra lettera o utilizza la funzione di ricerca.',
      home: 'Home',
      originalSource: 'Fonte originale: ',
      commonTestsTitle: 'Test e procedure comuni',
      commonTestsDescription:
          'Trova informazioni dettagliate su test e procedure mediche eseguite frequentemente.',
      completeBloodCount: 'Emocromo completo (CBC)',
      completeBloodCountDescription:
          'Misura diversi componenti del sangue, inclusi globuli rossi e bianchi.',
      mriScan: 'Risonanza magnetica (RM)',
      mriScanDescription:
          'Test di imaging dettagliato che utilizza campi magnetici e onde radio per creare immagini degli organi.',
      ctScan: 'Tomografia computerizzata (TC)',
      ctScanDescription:
          'Radiografia avanzata che acquisisce immagini dettagliate di organi e strutture all\'interno del corpo.',
      colonoscopy: 'Colonscopia',
      colonoscopyDescription:
          'Esame dell\'intestino crasso per rilevare anomalie e eseguire lo screening per il cancro.',
      echocardiogram: 'Ecocardiogramma',
      echocardiogramDescription:
          'Test ecografico che controlla la struttura e la funzione del cuore.',
      stressTest: 'Test da sforzo',
      stressTestDescription:
          'Misura le prestazioni del cuore durante l\'attività fisica.',
      mammogram: 'Mammografia',
      mammogramDescription:
          'Imaging a raggi X del seno utilizzato per lo screening del cancro al seno.',
      endoscopy: 'Endoscopia',
      endoscopyDescription:
          'Procedura per esaminare l\'interno del tratto digestivo.',
      testNotFound: 'Test non trovato',
      learnMore: 'Per saperne di più: ',
      concernedXrayTitle: 'Preoccupato per l\'esposizione ai raggi X?',
      askAugustAITitle: 'Chiedi a <b>August AI</b> in privato.',
      },
     pt: {
          title: 'Testes e Procedimentos',
          description:
            'Encontre informações detalhadas sobre testes e procedimentos médicos, incluindo o que esperar e como se preparar.',
          searchPlaceholder: 'Pesquisar testes e procedimentos...',
          browseByLetter: 'Procurar por letra',
          noTestsFound: (letter) =>
            `Nenhum teste encontrado que comece com '${letter.toUpperCase()}'`,
            tryAnother:
              'Por favor, tente outra letra ou use a função de pesquisa.',
          home: 'Início',
          originalSource: 'Fonte original: ',
          commonTestsTitle: 'Testes e Procedimentos Comuns',
          commonTestsDescription:
            'Encontre informações detalhadas sobre testes e procedimentos médicos realizados com frequência.',
          completeBloodCount: 'Hemograma Completo (CBC)',
          completeBloodCountDescription:
            'Mede diferentes componentes do seu sangue, incluindo glóbulos vermelhos e brancos.',
          mriScan: 'Ressonância Magnética',
          mriScanDescription:
            'Teste de imagem detalhado que usa campos magnéticos e ondas de rádio para criar imagens de órgãos.',
          ctScan: 'Tomografia Computadorizada (TC)',
          ctScanDescription:
            'Raio-x avançado que tira imagens detalhadas de órgãos e estruturas dentro do seu corpo.',
          colonoscopy: 'Colonoscopia',
          colonoscopyDescription:
            'Exame do intestino grosso para detectar anormalidades e realizar exames de câncer.',
          echocardiogram: 'Ecocardiograma',
          echocardiogramDescription:
            'Teste de ultrassom que verifica a estrutura e a função do seu coração.',
          stressTest: 'Teste de Esforço',
          stressTestDescription:
            'Mede como seu coração se comporta durante a atividade física.',
          mammogram: 'Mamografia',
          mammogramDescription:
            'Imagens de raios-X da mama usadas para rastrear o câncer de mama.',
          endoscopy: 'Endoscopia',
          endoscopyDescription:
            'Procedimento para examinar o interior do seu trato digestivo.',
          testNotFound: 'Teste não encontrado',
           learnMore: 'Saber mais: ',
           concernedXrayTitle: 'Preocupado com a exposição a raios X?',
           askAugustAITitle: 'Pergunte ao <b>August AI</b> em particular.',
     },
     ru: {
      title: 'Тесты и процедуры',
      description:
        'Найдите подробную информацию о медицинских тестах и процедурах, в том числе о том, чего ожидать и как подготовиться.',
      searchPlaceholder: 'Поиск тестов и процедур...',
      browseByLetter: 'Просмотр по буквам',
      noTestsFound: (letter) =>
        `Не найдено тестов, начинающихся с '${letter.toUpperCase()}'`,
      tryAnother:
        'Пожалуйста, попробуйте другую букву или используйте функцию поиска.',
      home: 'Главная',
      originalSource: 'Исходный источник: ',
      commonTestsTitle: 'Общие тесты и процедуры',
      commonTestsDescription:
        'Найдите подробную информацию о часто выполняемых медицинских тестах и процедурах.',
      completeBloodCount: 'Общий анализ крови (ОАК)',
      completeBloodCountDescription:
        'Измеряет различные компоненты вашей крови, включая красные и белые кровяные клетки.',
      mriScan: 'МРТ',
      mriScanDescription:
        'Детальное визуализационное исследование, в котором используются магнитные поля и радиоволны для создания изображений органов.',
      ctScan: 'КТ',
      ctScanDescription:
        'Усовершенствованный рентген, который делает подробные снимки органов и структур внутри вашего тела.',
      colonoscopy: 'Колоноскопия',
      colonoscopyDescription:
        'Обследование толстого кишечника для выявления аномалий и проведения скрининга на рак.',
      echocardiogram: 'Эхокардиограмма',
      echocardiogramDescription:
        'УЗИ, которое проверяет структуру и функцию вашего сердца.',
      stressTest: 'Стресс-тест',
      stressTestDescription:
        'Измеряет, как работает ваше сердце во время физической активности.',
      mammogram: 'Маммография',
      mammogramDescription:
        'Рентгеновское исследование молочной железы, используемое для скрининга на рак молочной железы.',
      endoscopy: 'Эндоскопия',
      endoscopyDescription:
        'Процедура для исследования внутренней поверхности вашего пищеварительного тракта.',
       testNotFound: 'Тест не найден',
       learnMore: 'Узнать больше: ',
       concernedXrayTitle: 'Обеспокоены воздействием рентгеновских лучей?',
       askAugustAITitle: 'Задайте вопрос <b>August AI</b> конфиденциально.',
     },
      "zh-Hans": {
      title: '测试和程序',
       description:
          '查找有关医疗测试和程序的详细信息，包括预期事项和如何准备。',
        searchPlaceholder: '搜索测试和程序...',
        browseByLetter: '按字母浏览',
      noTestsFound: (letter) =>
        `找不到以 '${letter.toUpperCase()}' 开头的测试`,
        tryAnother: '请尝试其他字母或使用搜索功能。',
      home: '主页',
        originalSource: '原始来源：',
      commonTestsTitle: '常见测试和程序',
      commonTestsDescription: '查找有关经常执行的医疗测试和程序的详细信息。',
         completeBloodCount: '全血细胞计数（CBC）',
        completeBloodCountDescription:
          '测量您血液的不同成分，包括红细胞和白细胞。',
        mriScan: '核磁共振扫描',
      mriScanDescription:
          '使用磁场和无线电波创建器官图像的详细成像测试。',
        ctScan: 'CT扫描',
        ctScanDescription: '高级X射线，可拍摄您体内器官和结构的详细图像。',
        colonoscopy: '结肠镜检查',
        colonoscopyDescription: '检查大肠是否有异常情况并进行癌症筛查。',
         echocardiogram: '超声心动图',
        echocardiogramDescription: '检查心脏结构和功能的超声测试。',
        stressTest: '压力测试',
        stressTestDescription: '测量您在体力活动期间心脏的运作情况。',
        mammogram: '乳房X光检查',
      mammogramDescription: '用于筛查乳腺癌的乳房X射线成像。',
        endoscopy: '内窥镜检查',
        endoscopyDescription: '检查消化道内部的程序。',
         testNotFound: '未找到测试',
        learnMore: '了解更多：',
        concernedXrayTitle: '担心X射线暴露？',
        askAugustAITitle: '私下向 <b>August AI</b> 询问。',
      },
      "zh-Hant": {
       title: '測試和程序',
        description:
          '查找有關醫療測試和程序的詳細資訊，包括預期事項和如何準備。',
        searchPlaceholder: '搜尋測試和程序...',
         browseByLetter: '按字母瀏覽',
         noTestsFound: (letter) =>
          `找不到以 '${letter.toUpperCase()}' 開頭的測試`,
         tryAnother: '請嘗試其他字母或使用搜尋功能。',
        home: '首頁',
        originalSource: '原始來源：',
        commonTestsTitle: '常見測試和程序',
         commonTestsDescription: '查找有關經常執行的醫療測試和程序的詳細資訊。',
          completeBloodCount: '全血細胞計數（CBC）',
        completeBloodCountDescription:
          '測量您血液的不同成分，包括紅血球和白血球。',
        mriScan: '核磁共振掃描',
         mriScanDescription:
          '使用磁場和無線電波建立器官影像的詳細影像測試。',
        ctScan: 'CT掃描',
         ctScanDescription: '高級X射線，可拍攝您體內器官和結構的詳細影像。',
        colonoscopy: '大腸鏡檢查',
        colonoscopyDescription: '檢查大腸是否有異常情況並進行癌症篩檢。',
          echocardiogram: '超聲心動圖',
         echocardiogramDescription: '檢查心臟結構和功能的超聲測試。',
        stressTest: '壓力測試',
        stressTestDescription: '測量您在體力活動期間心臟的運作情況。',
        mammogram: '乳房X光檢查',
       mammogramDescription: '用於篩檢乳癌的乳房X射線影像。',
        endoscopy: '內視鏡檢查',
        endoscopyDescription: '檢查消化道內部的程序。',
         testNotFound: '未找到測試',
        learnMore: '了解更多：',
        concernedXrayTitle: '擔心X射線暴露？',
        askAugustAITitle: '私下向 <b>August AI</b> 詢問。',
      },
    ja: {
      title: '検査と手順',
      description:
        '何を期待するか、どのように準備するかなど、医学的検査と手順に関する詳細な情報を見つけてください。',
      searchPlaceholder: '検査と手順を検索...',
      browseByLetter: '文字で検索',
      noTestsFound: (letter) =>
        `「${letter.toUpperCase()}」で始まるテストは見つかりませんでした`,
      tryAnother:
        '別の文字を試すか、検索機能を使用してください。',
      home: 'ホーム',
      originalSource: '元のソース： ',
      commonTestsTitle: '一般的な検査と手順',
      commonTestsDescription: '頻繁に実施される医学的検査と手順に関する詳細な情報を見つけてください。',
        completeBloodCount: '全血球計算（CBC）',
      completeBloodCountDescription:
        '赤血球や白血球など、血液のさまざまな成分を測定します。',
      mriScan: 'MRIスキャン',
      mriScanDescription:
        '磁場と電波を使用して臓器の画像を作成する詳細な画像検査。',
      ctScan: 'CTスキャン',
      ctScanDescription:
        '体内の臓器や構造の詳細な画像を撮影する高度なX線撮影。',
      colonoscopy: '大腸内視鏡検査',
      colonoscopyDescription:
        '異常を検出し、がん検診を実施するための大腸の検査。',
       echocardiogram: '心エコー図',
      echocardiogramDescription:
        '心臓の構造と機能をチェックする超音波検査。',
      stressTest: 'ストレステスト',
      stressTestDescription:
        '身体活動中の心臓の働きを測定します。',
      mammogram: 'マンモグラフィー',
      mammogramDescription:
        '乳がんのスクリーニングに使用される乳房のX線画像。',
      endoscopy: '内視鏡検査',
       endoscopyDescription:
        '消化管の内部を検査するための手順。',
      testNotFound: 'テストが見つかりません',
      learnMore: '詳細はこちら：',
      concernedXrayTitle: 'X線被曝が心配？',
      askAugustAITitle: '<b>August AI</b> に非公開で質問してください。',
    },
      ko: {
      title: '검사 및 시술',
      description:
        '기대할 사항과 준비 방법 등 의료 검사 및 시술에 대한 자세한 정보를 찾아보십시오.',
      searchPlaceholder: '검사 및 시술 검색...',
      browseByLetter: '문자로 찾아보기',
      noTestsFound: (letter) =>
        `'${letter.toUpperCase()}'로 시작하는 검사를 찾을 수 없습니다.`,
      tryAnother: '다른 문자를 시도하거나 검색 기능을 사용하십시오.',
      home: '홈',
       originalSource: '원래 출처: ',
      commonTestsTitle: '일반적인 검사 및 시술',
      commonTestsDescription: '자주 수행되는 의료 검사 및 시술에 대한 자세한 정보를 찾아보십시오.',
       completeBloodCount: '전혈구 검사(CBC)',
      completeBloodCountDescription:
        '적혈구와 백혈구를 포함하여 혈액의 여러 구성 요소를 측정합니다.',
      mriScan: 'MRI 스캔',
      mriScanDescription:
        '자기장과 전파를 사용하여 장기의 사진을 만드는 자세한 영상 검사입니다.',
      ctScan: 'CT 스캔',
      ctScanDescription:
        '신체 내부의 장기와 구조의 자세한 이미지를 촬영하는 고급 엑스레이입니다.',
      colonoscopy: '대장 내시경 검사',
      colonoscopyDescription:
        '이상 유무를 확인하고 암 검진을 실시하기 위한 대장 검사입니다.',
      echocardiogram: '심장 초음파 검사',
      echocardiogramDescription:
        '심장의 구조와 기능을 확인하는 초음파 검사입니다.',
      stressTest: '부하 검사',
      stressTestDescription: '신체 활동 중 심장이 어떻게 작동하는지 측정합니다.',
      mammogram: '유방 촬영술',
      mammogramDescription: '유방암 검진에 사용되는 유방 엑스레이 영상입니다.',
      endoscopy: '내시경 검사',
      endoscopyDescription: '소화관 내부를 검사하는 절차입니다.',
       testNotFound: '검사를 찾을 수 없습니다',
       learnMore: '더 알아보기: ',
       concernedXrayTitle: 'X선 노출이 걱정되나요?',
       askAugustAITitle: '<b>August AI</b>에게 비공개로 물어보세요.',
      },
     ar: {
      title: 'الفحوصات والإجراءات',
      description:
        'ابحث عن معلومات مفصلة حول الفحوصات والإجراءات الطبية، بما في ذلك ما يمكن توقعه وكيفية الاستعداد.',
      searchPlaceholder: 'البحث عن الفحوصات والإجراءات...',
      browseByLetter: 'تصفح بالحرف',
      noTestsFound: (letter) =>
        `لم يتم العثور على أي اختبارات تبدأ بـ '${letter.toUpperCase()}'`,
       tryAnother:
        'الرجاء تجربة حرف آخر أو استخدام وظيفة البحث.',
      home: 'الصفحة الرئيسية',
       originalSource: 'المصدر الأصلي: ',
      commonTestsTitle: 'الفحوصات والإجراءات الشائعة',
      commonTestsDescription:
        'ابحث عن معلومات مفصلة حول الفحوصات والإجراءات الطبية التي يتم إجراؤها بشكل متكرر.',
        completeBloodCount: 'تعداد الدم الكامل (CBC)',
      completeBloodCountDescription:
        'يقيس مكونات مختلفة من دمك، بما في ذلك خلايا الدم الحمراء والبيضاء.',
      mriScan: 'التصوير بالرنين المغناطيسي',
      mriScanDescription:
        'اختبار تصوير تفصيلي يستخدم المجالات المغناطيسية والموجات الراديوية لإنشاء صور للأعضاء.',
      ctScan: 'التصوير المقطعي المحوسب',
      ctScanDescription:
        'أشعة سينية متقدمة تلتقط صورًا مفصلة للأعضاء والهياكل داخل جسمك.',
      colonoscopy: 'تنظير القولون',
      colonoscopyDescription:
        'فحص الأمعاء الغليظة للكشف عن التشوهات وإجراء فحوصات السرطان.',
      echocardiogram: 'مخطط صدى القلب',
      echocardiogramDescription:
        'اختبار الموجات فوق الصوتية الذي يفحص بنية ووظيفة قلبك.',
      stressTest: 'اختبار الجهد',
      stressTestDescription:
        'يقيس كيف يؤدي قلبك أثناء النشاط البدني.',
      mammogram: 'تصوير الثدي الشعاعي',
       mammogramDescription:
        'تصوير بالأشعة السينية للثدي يستخدم للكشف عن سرطان الثدي.',
      endoscopy: 'التنظير الداخلي',
      endoscopyDescription:
        'إجراء لفحص الجزء الداخلي من الجهاز الهضمي.',
      testNotFound: 'لم يتم العثور على اختبار',
      learnMore: 'أعرف أكثر: ',
      concernedXrayTitle: 'قلق بشأن التعرض للأشعة السينية؟',
      askAugustAITitle: 'اسأل <b>August AI</b> بشكل خاص.',
    },
     hi: {
          title: 'परीक्षण और प्रक्रियाएं',
          description:
            'चिकित्सा परीक्षणों और प्रक्रियाओं के बारे में विस्तृत जानकारी प्राप्त करें, जिसमें क्या उम्मीद की जाए और कैसे तैयार किया जाए।',
          searchPlaceholder: 'परीक्षणों और प्रक्रियाओं को खोजें...',
          browseByLetter: 'अक्षर के अनुसार ब्राउज़ करें',
          noTestsFound: (letter) =>
            `'${letter.toUpperCase()}' से शुरू होने वाला कोई परीक्षण नहीं मिला`,
          tryAnother:
            'कृपया कोई दूसरा अक्षर आज़माएँ या खोज फ़ंक्शन का उपयोग करें।',
          home: 'होम',
          originalSource: 'मूल स्रोत: ',
          commonTestsTitle: 'सामान्य परीक्षण और प्रक्रियाएं',
          commonTestsDescription:
            'अक्सर किए जाने वाले चिकित्सा परीक्षणों और प्रक्रियाओं के बारे में विस्तृत जानकारी प्राप्त करें।',
          completeBloodCount: 'पूर्ण रक्त गणना (सीबीसी)',
          completeBloodCountDescription:
            'लाल और सफेद रक्त कोशिकाओं सहित आपके रक्त के विभिन्न घटकों को मापता है।',
          mriScan: 'एमआरआई स्कैन',
          mriScanDescription:
            'विस्तृत इमेजिंग परीक्षण जो अंगों की तस्वीरें बनाने के लिए चुंबकीय क्षेत्रों और रेडियो तरंगों का उपयोग करता है।',
          ctScan: 'सीटी स्कैन',
          ctScanDescription:
            'उन्नत एक्स-रे जो आपके शरीर के अंदर अंगों और संरचनाओं की विस्तृत छवियां लेता है।',
          colonoscopy: 'कोलोनोस्कोपी',
          colonoscopyDescription:
            'असामान्यताओं का पता लगाने और कैंसर की जांच करने के लिए बड़ी आंत की जांच।',
          echocardiogram: 'इकोकार्डियोग्राम',
          echocardiogramDescription:
            'अल्ट्रासाउंड परीक्षण जो आपके हृदय की संरचना और कार्य की जांच करता है।',
          stressTest: 'तनाव परीक्षण',
          stressTestDescription:
            'मापता है कि शारीरिक गतिविधि के दौरान आपका दिल कैसा प्रदर्शन करता है।',
          mammogram: 'मैमोग्राम',
          mammogramDescription:
            'स्तन कैंसर की जांच के लिए उपयोग की जाने वाली स्तन की एक्स-रे इमेजिंग।',
          endoscopy: 'एंडोस्कोपी',
           endoscopyDescription:
            'आपके पाचन तंत्र के अंदरूनी हिस्से की जांच करने की प्रक्रिया।',
          testNotFound: 'परीक्षण नहीं मिला',
            learnMore: 'और जानें: ',
            concernedXrayTitle: 'एक्स-रे जोखिम के बारे में चिंतित?',
            askAugustAITitle: '<b>August AI</b> से निजी तौर पर पूछें।',
      },
      nl: {
      title: 'Tests en procedures',
      description:
        'Vind gedetailleerde informatie over medische tests en procedures, inclusief wat je kunt verwachten en hoe je je kunt voorbereiden.',
      searchPlaceholder: 'Zoek tests en procedures...',
       browseByLetter: 'Blader per letter',
       noTestsFound: (letter) =>
        `Geen tests gevonden die beginnen met '${letter.toUpperCase()}'`,
      tryAnother:
          'Probeer een andere letter of gebruik de zoekfunctie.',
       home: 'Thuis',
       originalSource: 'Originele bron: ',
       commonTestsTitle: 'Algemene tests en procedures',
      commonTestsDescription:
         'Vind gedetailleerde informatie over veelvoorkomende medische tests en procedures.',
       completeBloodCount: 'Volledig bloedbeeld (CBC)',
      completeBloodCountDescription:
         'Meet verschillende componenten van je bloed, inclusief rode en witte bloedcellen.',
       mriScan: 'MRI-scan',
      mriScanDescription:
          'Gedetailleerde beeldvormingstest die magnetische velden en radiogolven gebruikt om afbeeldingen van organen te maken.',
      ctScan: 'CT-scan',
      ctScanDescription:
          'Geavanceerde röntgenfoto die gedetailleerde afbeeldingen maakt van organen en structuren in je lichaam.',
        colonoscopy: 'Colonoscopie',
       colonoscopyDescription:
          'Onderzoek van de dikke darm om afwijkingen op te sporen en kankeronderzoeken uit te voeren.',
       echocardiogram: 'Echocardiogram',
      echocardiogramDescription:
         'Echografie die de structuur en functie van je hart controleert.',
      stressTest: 'Stresstest',
      stressTestDescription:
         'Meet hoe je hart presteert tijdens lichamelijke activiteit.',
      mammogram: 'Mammografie',
      mammogramDescription:
          'Röntgenfoto\'s van de borst die worden gebruikt om borstkanker op te sporen.',
        endoscopy: 'Endoscopie',
       endoscopyDescription:
          'Procedure om de binnenkant van je spijsverteringskanaal te onderzoeken.',
      testNotFound: 'Test niet gevonden',
      learnMore: 'Meer informatie: ',
      concernedXrayTitle: 'Bezorgd over blootstelling aan röntgenstraling?',
      askAugustAITitle: 'Vraag het privé aan <b>August AI</b>.',
     },
     pl: {
        title: 'Badania i procedury',
        description:
          'Znajdź szczegółowe informacje o badaniach i procedurach medycznych, w tym o tym, czego się spodziewać i jak się przygotować.',
        searchPlaceholder: 'Szukaj badań i procedur...',
        browseByLetter: 'Przeglądaj według litery',
        noTestsFound: (letter) =>
          `Nie znaleziono żadnych badań rozpoczynających się od '${letter.toUpperCase()}'`,
        tryAnother:
          'Spróbuj innej litery lub użyj funkcji wyszukiwania.',
        home: 'Strona główna',
        originalSource: 'Oryginalne źródło: ',
        commonTestsTitle: 'Typowe badania i procedury',
        commonTestsDescription:
          'Znajdź szczegółowe informacje o często wykonywanych badaniach i procedurach medycznych.',
        completeBloodCount: 'Morfologia krwi (CBC)',
        completeBloodCountDescription:
          'Mierzy różne składniki krwi, w tym czerwone i białe krwinki.',
        mriScan: 'Rezonans magnetyczny (MRI)',
        mriScanDescription:
          'Szczegółowe badanie obrazowe wykorzystujące pola magnetyczne i fale radiowe do tworzenia obrazów narządów.',
        ctScan: 'Tomografia komputerowa (TK)',
        ctScanDescription:
          'Zaawansowane zdjęcie rentgenowskie, które robi szczegółowe zdjęcia narządów i struktur wewnątrz ciała.',
        colonoscopy: 'Kolonoskopia',
        colonoscopyDescription:
          'Badanie jelita grubego w celu wykrycia nieprawidłowości i przeprowadzenia badań przesiewowych w kierunku raka.',
        echocardiogram: 'Echokardiografia',
        echocardiogramDescription:
          'Badanie ultrasonograficzne sprawdzające strukturę i funkcję serca.',
        stressTest: 'Test wysiłkowy',
        stressTestDescription:
          'Mierzy, jak pracuje serce podczas aktywności fizycznej.',
        mammogram: 'Mammografia',
        mammogramDescription:
          'Obrazowanie rentgenowskie piersi stosowane w badaniach przesiewowych raka piersi.',
        endoscopy: 'Endoskopia',
        endoscopyDescription:
          'Procedura badania wnętrza przewodu pokarmowego.',
        testNotFound: 'Nie znaleziono badania',
        learnMore: 'Dowiedz się więcej: ',
        concernedXrayTitle: 'Martwisz się o narażenie na promieniowanie rentgenowskie?',
        askAugustAITitle: 'Zapytaj prywatnie <b>August AI</b>.',
      },
      sv: {
        title: 'Tester och procedurer',
        description:
          'Hitta detaljerad information om medicinska tester och procedurer, inklusive vad du kan förvänta dig och hur du förbereder dig.',
        searchPlaceholder: 'Sök efter tester och procedurer...',
        browseByLetter: 'Bläddra efter bokstav',
        noTestsFound: (letter) =>
          `Inga tester hittades som börjar med '${letter.toUpperCase()}'`,
        tryAnother:
          'Försök med en annan bokstav eller använd sökfunktionen.',
        home: 'Hem',
        originalSource: 'Originalkälla: ',
        commonTestsTitle: 'Vanliga tester och procedurer',
        commonTestsDescription:
          'Hitta detaljerad information om vanliga medicinska tester och procedurer.',
        completeBloodCount: 'Fullständig blodstatus (CBC)',
        completeBloodCountDescription:
          'Mäter olika komponenter i blodet, inklusive röda och vita blodkroppar.',
        mriScan: 'MR-scanning',
        mriScanDescription:
          'Detaljerad bilddiagnostisk test som använder magnetfält och radiovågor för att skapa bilder av organ.',
        ctScan: 'Datortomografi (CT)',
        ctScanDescription:
          'Avancerad röntgen som tar detaljerade bilder av organ och strukturer i kroppen.',
        colonoscopy: 'Koloskopi',
        colonoscopyDescription:
          'Undersökning av tjocktarmen för att upptäcka avvikelser och utföra cancerundersökningar.',
        echocardiogram: 'Ekokardiogram',
        echocardiogramDescription:
          'Ultraljudsundersökning som kontrollerar hjärtats struktur och funktion.',
        stressTest: 'Arbetsprov',
        stressTestDescription:
          'Mäter hur ditt hjärta fungerar under fysisk aktivitet.',
        mammogram: 'Mammografi',
        mammogramDescription:
          'Röntgenbilder av bröstet som används för att screena för bröstcancer.',
        endoscopy: 'Endoskopi',
        endoscopyDescription:
          'Procedur för att undersöka insidan av matsmältningskanalen.',
        testNotFound: 'Testet hittades inte',
        learnMore: 'Läs mer: ',
        concernedXrayTitle: 'Orolig för röntgenexponering?',
        askAugustAITitle: 'Fråga <b>August AI</b> privat.',
      },
      no: {
        title: 'Tester og prosedyrer',
        description:
          'Finn detaljert informasjon om medisinske tester og prosedyrer, inkludert hva du kan forvente og hvordan du forbereder deg.',
        searchPlaceholder: 'Søk etter tester og prosedyrer...',
        browseByLetter: 'Bla gjennom etter bokstav',
        noTestsFound: (letter) =>
          `Ingen tester funnet som begynner med '${letter.toUpperCase()}'`,
        tryAnother:
          'Prøv en annen bokstav eller bruk søkefunksjonen.',
        home: 'Hjem',
        originalSource: 'Opprinnelig kilde: ',
        commonTestsTitle: 'Vanlige tester og prosedyrer',
        commonTestsDescription:
          'Finn detaljert informasjon om ofte utførte medisinske tester og prosedyrer.',
        completeBloodCount: 'Fullstendig blodtelling (CBC)',
        completeBloodCountDescription:
          'Måler forskjellige komponenter i blodet ditt, inkludert røde og hvite blodceller.',
        mriScan: 'MR-skanning',
        mriScanDescription:
          'Detaljert bildediagnostisk test som bruker magnetfelt og radiobølger for å lage bilder av organer.',
        ctScan: 'CT-skanning',
        ctScanDescription:
          'Avansert røntgen som tar detaljerte bilder av organer og strukturer i kroppen din.',
        colonoscopy: 'Koloskopi',
        colonoscopyDescription:
          'Undersøkelse av tykktarmen for å oppdage avvik og utføre kreftundersøkelser.',
        echocardiogram: 'Ekkokardiogram',
        echocardiogramDescription:
          'Ultralydundersøkelse som sjekker hjertets struktur og funksjon.',
        stressTest: 'Stresstest',
        stressTestDescription:
          'Måler hvordan hjertet ditt fungerer under fysisk aktivitet.',
        mammogram: 'Mammografi',
        mammogramDescription:
          'Røntgenbilder av brystet som brukes til å screene for brystkreft.',
        endoscopy: 'Endoskopi',
        endoscopyDescription:
          'Prosedyre for å undersøke innsiden av fordøyelseskanalen.',
        testNotFound: 'Test ikke funnet',
          learnMore: 'Lær mer: ',
          concernedXrayTitle: 'Bekymret for røntgeneksponering?',
          askAugustAITitle: 'Spør <b>August AI</b> privat.',
      },
      da: {
        title: 'Test og procedurer',
        description:
          'Find detaljerede oplysninger om medicinske test og procedurer, herunder hvad du kan forvente, og hvordan du forbereder dig.',
        searchPlaceholder: 'Søg efter test og procedurer...',
        browseByLetter: 'Gennemse efter bogstav',
        noTestsFound: (letter) =>
          `Ingen test fundet, der starter med '${letter.toUpperCase()}'`,
        tryAnother:
          'Prøv et andet bogstav eller brug søgefunktionen.',
        home: 'Hjem',
        originalSource: 'Original kilde: ',
        commonTestsTitle: 'Almindelige test og procedurer',
        commonTestsDescription:
          'Find detaljeret information om hyppigt udførte medicinske test og procedurer.',
        completeBloodCount: 'Komplet blodtælling (CBC)',
        completeBloodCountDescription:
          'Måler forskellige komponenter i dit blod, herunder røde og hvide blodlegemer.',
        mriScan: 'MR-scanning',
        mriScanDescription:
          'Detaljeret billeddiagnostisk test, der bruger magnetfelter og radiobølger til at skabe billeder af organer.',
        ctScan: 'CT-scanning',
        ctScanDescription:
          'Avanceret røntgen, der tager detaljerede billeder af organer og strukturer inde i din krop.',
        colonoscopy: 'Koloskopi',
        colonoscopyDescription:
          'Undersøgelse af tyktarmen for at opdage abnormiteter og udføre kræftundersøgelser.',
        echocardiogram: 'Ekkokardiogram',
        echocardiogramDescription:
          'Ultralydsundersøgelse, der kontrollerer dit hjertes struktur og funktion.',
        stressTest: 'Stresstest',
        stressTestDescription:
          'Måler, hvordan dit hjerte fungerer under fysisk aktivitet.',
        mammogram: 'Mammografi',
        mammogramDescription:
          'Røntgenbilleder af brystet, der bruges til at screene for brystkræft.',
        endoscopy: 'Endoskopi',
        endoscopyDescription:
          'Procedure til undersøgelse af indersiden af dit fordøjelsessystem.',
          testNotFound: 'Test ikke fundet',
            learnMore: 'Lær mere: ',
            concernedXrayTitle: 'Bekymret for røntgeneksponering?',
            askAugustAITitle: 'Spørg <b>August AI</b> privat.',
      },
       fi: {
        title: 'Testit ja toimenpiteet',
        description:
          'Löydä yksityiskohtaista tietoa lääketieteellisistä testeistä ja toimenpiteistä, mukaan lukien mitä odottaa ja miten valmistautua.',
        searchPlaceholder: 'Etsi testejä ja toimenpiteitä...',
        browseByLetter: 'Selaa kirjaimella',
        noTestsFound: (letter) =>
          `Kirjaimella '${letter.toUpperCase()}' alkavia testejä ei löytynyt`,
        tryAnother: 'Yritä toista kirjainta tai käytä hakutoimintoa.',
        home: 'Koti',
        originalSource: 'Alkuperäinen lähde: ',
        commonTestsTitle: 'Yleiset testit ja toimenpiteet',
        commonTestsDescription:
          'Löydä yksityiskohtaista tietoa yleisesti suoritetuista lääketieteellisistä testeistä ja toimenpiteistä.',
         completeBloodCount: 'Täydellinen verenkuva (TVK)',
        completeBloodCountDescription:
          'Mittaa veren eri osia, mukaan lukien punaiset ja valkoiset verisolut.',
        mriScan: 'MRI-kuvaus',
        mriScanDescription:
          'Yksityiskohtainen kuvantamistesti, jossa käytetään magneettikenttiä ja radioaaltoja elinten kuvien luomiseksi.',
        ctScan: 'CT-kuvaus',
        ctScanDescription:
          'Kehittynyt röntgenkuva, joka ottaa yksityiskohtaisia kuvia elimistä ja rakenteista kehosi sisällä.',
         colonoscopy: 'Kolonoskopia',
         colonoscopyDescription:
          'Paksusuolen tutkimus poikkeavuuksien havaitsemiseksi ja syöpäseulonnan suorittamiseksi.',
        echocardiogram: 'Sydämen ultraäänitutkimus',
        echocardiogramDescription:
          'Ultraäänitutkimus, jossa tarkistetaan sydämen rakenne ja toiminta.',
        stressTest: 'Rasituskoe',
        stressTestDescription:
          'Mittaa sydämesi toimintaa fyysisen toiminnan aikana.',
        mammogram: 'Mammografia',
        mammogramDescription:
          'Rintojen röntgenkuvaus, jota käytetään rintasyövän seulontaan.',
        endoscopy: 'Tähystys',
        endoscopyDescription:
          'Menetelmä ruoansulatuskanavan sisäpuolen tutkimiseksi.',
         testNotFound: 'Testiä ei löytynyt',
           learnMore: 'Lisätietoja: ',
           concernedXrayTitle: 'Huolissaan röntgensäteilystä?',
           askAugustAITitle: 'Kysy yksityisesti <b>August AI</b>:ltä.',
      },
        cs: {
        title: 'Testy a postupy',
        description:
            'Najděte podrobné informace o lékařských testech a postupech, včetně toho, co očekávat a jak se připravit.',
        searchPlaceholder: 'Hledat testy a postupy...',
          browseByLetter: 'Procházet podle písmene',
        noTestsFound: (letter) =>
          `Nenalezeny žádné testy začínající na '${letter.toUpperCase()}'`,
          tryAnother:
              'Zkuste jiné písmeno nebo použijte funkci vyhledávání.',
        home: 'Domů',
          originalSource: 'Původní zdroj: ',
        commonTestsTitle: 'Běžné testy a postupy',
        commonTestsDescription:
            'Najděte podrobné informace o často prováděných lékařských testech a postupech.',
          completeBloodCount: 'Kompletní krevní obraz (CBC)',
            completeBloodCountDescription:
              'Měří různé složky vaší krve, včetně červených a bílých krvinek.',
            mriScan: 'Magnetická rezonance (MRI)',
           mriScanDescription:
              'Podrobný zobrazovací test, který využívá magnetická pole a rádiové vlny k vytváření snímků orgánů.',
            ctScan: 'CT vyšetření',
        ctScanDescription:
              'Pokročilý rentgen, který pořizuje detailní snímky orgánů a struktur uvnitř vašeho těla.',
          colonoscopy: 'Kolonoskopie',
        colonoscopyDescription:
              'Vyšetření tlustého střeva za účelem zjištění abnormalit a provedení vyšetření na rakovinu.',
          echocardiogram: 'Echokardiografie',
          echocardiogramDescription:
              'Ultrazvukové vyšetření, které kontroluje strukturu a funkci vašeho srdce.',
           stressTest: 'Zátěžový test',
        stressTestDescription:
              'Měří, jak vaše srdce pracuje během fyzické aktivity.',
          mammogram: 'Mamografie',
            mammogramDescription:
              'Rentgenové snímky prsu používané k vyšetření karcinomu prsu.',
            endoscopy: 'Endoskopie',
             endoscopyDescription:
              'Postup k vyšetření vnitřku vašeho trávicího traktu.',
          testNotFound: 'Test nebyl nalezen',
          learnMore: 'Dozvědět se více: ',
          concernedXrayTitle: 'Máte obavy z vystavení rentgenovému záření?',
          askAugustAITitle: 'Zeptejte se soukromě <b>August AI</b>.',
        },
        hu: {
         title: 'Vizsgálatok és eljárások',
        description:
            'Részletes információkat talál a orvosi vizsgálatokról és eljárásokról, beleértve a várhatókat és a felkészülést.',
        searchPlaceholder: 'Vizsgálatok és eljárások keresése...',
         browseByLetter: 'Böngészés betűk szerint',
        noTestsFound: (letter) =>
          `Nem található '${letter.toUpperCase()}' betűvel kezdődő vizsgálat`,
         tryAnother:
              'Próbáljon ki egy másik betűt, vagy használja a kereső funkciót.',
        home: 'Kezdőlap',
         originalSource: 'Eredeti forrás: ',
        commonTestsTitle: 'Gyakori vizsgálatok és eljárások',
        commonTestsDescription:
           'Részletes információkat talál a gyakran elvégzett orvosi vizsgálatokról és eljárásokról.',
        completeBloodCount: 'Teljes vérkép (CBC)',
         completeBloodCountDescription:
            'Méri a vér különböző összetevőit, beleértve a vörös- és fehérvérsejteket.',
         mriScan: 'MRI-vizsgálat',
        mriScanDescription:
            'Részletes képalkotó vizsgálat, amely mágneses mezőket és rádióhullámokat használ a szervek képeinek létrehozásához.',
         ctScan: 'CT-vizsgálat',
        ctScanDescription:
           'Fejlett röntgenfelvétel, amely részletes képeket készít a testben lévő szervekről és struktúrákról.',
         colonoscopy: 'Kolonoszkópia',
       colonoscopyDescription:
            'A vastagbél vizsgálata rendellenességek és a rákszűrés elvégzése céljából.',
        echocardiogram: 'Echokardiogram',
        echocardiogramDescription:
           'Ultrahangvizsgálat, amely ellenőrzi a szív szerkezetét és működését.',
        stressTest: 'Terheléses teszt',
        stressTestDescription:
            'Méri a szív működését fizikai aktivitás közben.',
        mammogram: 'Mammográfia',
          mammogramDescription:
           'A mell röntgenfelvétele, amelyet a mellrák szűrésére használnak.',
         endoscopy: 'Endoszkópia',
       endoscopyDescription:
            'Eljárás az emésztőrendszer belsejének vizsgálatára.',
            testNotFound: 'A teszt nem található',
              learnMore: 'Tudjon meg többet: ',
              concernedXrayTitle: 'Aggódik a röntgensugárzás miatt?',
              askAugustAITitle: 'Kérdezze meg privátban a <b>August AI</b>-t.',
        },
       ro: {
            title: 'Teste și proceduri',
        description:
          'Găsiți informații detaliate despre testele și procedurile medicale, inclusiv la ce să vă așteptați și cum să vă pregătiți.',
        searchPlaceholder: 'Căutați teste și proceduri...',
          browseByLetter: 'Răsfoiți după literă',
         noTestsFound: (letter) =>
          `Nu au fost găsite teste care încep cu '${letter.toUpperCase()}'`,
         tryAnother:
          'Vă rugăm să încercați o altă literă sau să utilizați funcția de căutare.',
        home: 'Acasă',
        originalSource: 'Sursa originală: ',
       commonTestsTitle: 'Teste și proceduri frecvente',
        commonTestsDescription:
            'Găsiți informații detaliate despre testele și procedurile medicale efectuate frecvent.',
        completeBloodCount: 'Hemoleucograma completă (CBC)',
        completeBloodCountDescription:
            'Măsoară diferiți componenți ai sângelui, inclusiv celulele roșii și albe.',
         mriScan: 'RMN',
          mriScanDescription:
            'Test detaliat de imagistică care folosește câmpuri magnetice și unde radio pentru a crea imagini ale organelor.',
          ctScan: 'Tomografie computerizată (CT)',
          ctScanDescription:
            'Radiografie avansată care realizează imagini detaliate ale organelor și structurilor din interiorul corpului.',
         colonoscopy: 'Colonoscopie',
        colonoscopyDescription:
           'Examinarea intestinului gros pentru a detecta anomaliile și a efectua screening pentru cancer.',
         echocardiogram: 'Ecocardiogramă',
         echocardiogramDescription:
            'Test cu ultrasunete care verifică structura și funcția inimii.',
         stressTest: 'Test de efort',
        stressTestDescription:
           'Măsoară cum funcționează inima în timpul activității fizice.',
         mammogram: 'Mamografie',
        mammogramDescription:
           'Imagistica cu raze X a sânului utilizată pentru a depista cancerul de sân.',
       endoscopy: 'Endoscopie',
        endoscopyDescription:
            'Procedură pentru examinarea interiorului tractului digestiv.',
           testNotFound: 'Testul nu a fost găsit',
              learnMore: 'Află mai multe: ',
              concernedXrayTitle: 'Îngrijorat de expunerea la raze X?',
              askAugustAITitle: 'Întreabă în privat <b>August AI</b>.',
      },
      el: {
        title: 'Εξετάσεις και διαδικασίες',
        description:
          'Βρείτε λεπτομερείς πληροφορίες σχετικά με τις ιατρικές εξετάσεις και διαδικασίες, συμπεριλαμβανομένου του τι να περιμένετε και πώς να προετοιμαστείτε.',
        searchPlaceholder: 'Αναζήτηση εξετάσεων και διαδικασιών...',
          browseByLetter: 'Περιήγηση ανά γράμμα',
        noTestsFound: (letter) =>
          `Δεν βρέθηκαν εξετάσεις που να ξεκινούν με '${letter.toUpperCase()}'`,
        tryAnother:
            'Προσπαθήστε με ένα άλλο γράμμα ή χρησιμοποιήστε τη λειτουργία αναζήτησης.',
        home: 'Αρχική σελίδα',
         originalSource: 'Αρχική πηγή: ',
         commonTestsTitle: 'Συνηθισμένες εξετάσεις και διαδικασίες',
        commonTestsDescription:
            'Βρείτε λεπτομερείς πληροφορίες σχετικά με συχνά πραγματοποιούμενες ιατρικές εξετάσεις και διαδικασίες.',
          completeBloodCount: 'Γενική εξέταση αίματος (CBC)',
        completeBloodCountDescription:
            'Μετρά διαφορετικά συστατικά του αίματός σας, συμπεριλαμβανομένων των ερυθρών και λευκών αιμοσφαιρίων.',
         mriScan: 'Μαγνητική τομογραφία (MRI)',
       mriScanDescription:
            'Λεπτομερής εξέταση απεικόνισης που χρησιμοποιεί μαγνητικά πεδία και ραδιοκύματα για τη δημιουργία εικόνων οργάνων.',
          ctScan: 'Αξονική τομογραφία (CT)',
           ctScanDescription:
           'Προηγμένη ακτινογραφία που λαμβάνει λεπτομερείς εικόνες οργάνων και δομών μέσα στο σώμα σας.',
        colonoscopy: 'Κολονοσκόπηση',
         colonoscopyDescription:
           'Εξέταση του παχέος εντέρου για την ανίχνευση ανωμαλιών και τη διενέργεια εξετάσεων για τον καρκίνο.',
        echocardiogram: 'Ηχοκαρδιογράφημα',
      echocardiogramDescription:
            'Υπερηχογράφημα που ελέγχει τη δομή και τη λειτουργία της καρδιάς.',
       stressTest: 'Δοκιμασία κοπώσεως',
      stressTestDescription:
            'Μετρά πώς λειτουργεί η καρδιά σας κατά τη διάρκεια της σωματικής δραστηριότητας.',
      mammogram: 'Μαστογραφία',
       mammogramDescription:
            'Ακτινογραφική απεικόνιση του μαστού που χρησιμοποιείται για τον έλεγχο για καρκίνο του μαστού.',
        endoscopy: 'Ενδοσκόπηση',
        endoscopyDescription:
           'Διαδικασία για την εξέταση του εσωτερικού του πεπτικού σας συστήματος.',
          testNotFound: 'Δεν βρέθηκε η εξέταση',
        learnMore: 'Μάθετε περισσότερα: ',
        concernedXrayTitle: 'Ανησυχείτε για την έκθεση σε ακτίνες Χ;',
        askAugustAITitle: 'Ρωτήστε ιδιωτικά το <b>August AI</b>.',
        },
      uk: {
        title: 'Аналізи та процедури',
        description:
          'Знайдіть детальну інформацію про медичні аналізи та процедури, включно з тим, чого очікувати та як підготуватися.',
        searchPlaceholder: 'Пошук аналізів та процедур...',
          browseByLetter: 'Перегляд за літерою',
        noTestsFound: (letter) =>
          `Не знайдено аналізів, що починаються з '${letter.toUpperCase()}'`,
        tryAnother:
          'Будь ласка, спробуйте іншу літеру або скористайтеся функцією пошуку.',
        home: 'Головна',
        originalSource: 'Оригінальне джерело: ',
         commonTestsTitle: 'Поширені аналізи та процедури',
        commonTestsDescription:
          'Знайдіть детальну інформацію про поширені медичні аналізи та процедури.',
        completeBloodCount: 'Загальний аналіз крові (ЗАК)',
        completeBloodCountDescription:
          'Вимірює різні компоненти вашої крові, включно з червоними та білими кров\'яними клітинами.',
         mriScan: 'МРТ',
         mriScanDescription:
          'Детальний візуалізаційний тест, що використовує магнітні поля та радіохвилі для створення зображень органів.',
       ctScan: 'КТ',
        ctScanDescription:
          'Удосконалений рентген, що робить детальні знімки органів і структур у вашому тілі.',
        colonoscopy: 'Колоноскопія',
        colonoscopyDescription:
           'Обстеження товстого кишківника для виявлення відхилень і проведення скринінгу на рак.',
         echocardiogram: 'Ехокардіограма',
        echocardiogramDescription:
          'Ультразвукове дослідження, що перевіряє структуру та функцію вашого серця.',
         stressTest: 'Стрес-тест',
        stressTestDescription:
           'Вимірює, як працює ваше серце під час фізичної активності.',
         mammogram: 'Мамографія',
       mammogramDescription:
          'Рентгенівське зображення грудей, що використовується для скринінгу на рак грудей.',
         endoscopy: 'Ендоскопія',
        endoscopyDescription:
           'Процедура для обстеження внутрішньої частини вашого травного тракту.',
         testNotFound: 'Аналіз не знайдено',
           learnMore: 'Дізнатися більше: ',
           concernedXrayTitle: 'Турбуєтесь через вплив рентгенівських променів?',
           askAugustAITitle: 'Запитайте приватно у <b>August AI</b>.',
      },
      bg: {
       title: 'Тестове и процедури',
        description:
          'Намерете подробна информация за медицински тестове и процедури, включително какво да очаквате и как да се подготвите.',
        searchPlaceholder: 'Търсене на тестове и процедури...',
         browseByLetter: 'Търсене по буква',
        noTestsFound: (letter) =>
          `Не са намерени тестове, започващи с '${letter.toUpperCase()}'`,
        tryAnother:
          'Моля, опитайте с друга буква или използвайте функцията за търсене.',
        home: 'Начало',
        originalSource: 'Оригинален източник: ',
         commonTestsTitle: 'Често срещани тестове и процедури',
        commonTestsDescription:
          'Намерете подробна информация за често извършвани медицински тестове и процедури.',
          completeBloodCount: 'Пълна кръвна картина (ПКК)',
            completeBloodCountDescription:
              'Измерва различни компоненти на кръвта, включително червени и бели кръвни клетки.',
            mriScan: 'ЯМР сканиране',
            mriScanDescription:
              'Подробен образен тест, който използва магнитни полета и радиовълни за създаване на изображения на органи.',
            ctScan: 'КТ сканиране',
            ctScanDescription:
              'Разширена рентгенова снимка, която прави подробни изображения на органи и структури в тялото ви.',
        colonoscopy: 'Колоноскопия',
            colonoscopyDescription:
              'Изследване на дебелото черво за откриване на аномалии и провеждане на изследвания за рак.',
         echocardiogram: 'Ехокардиография',
        echocardiogramDescription:
              'Ултразвуково изследване, което проверява структурата и функцията на сърцето.',
       stressTest: 'Стрес тест',
       stressTestDescription:
              'Измерва как сърцето ви работи по време на физическа активност.',
         mammogram: 'Мамография',
         mammogramDescription:
              'Рентгенови снимки на гърдата, използвани за скрининг за рак на гърдата.',
           endoscopy: 'Ендоскопия',
        endoscopyDescription:
              'Процедура за изследване на вътрешността на храносмилателния ви тракт.',
          testNotFound: 'Тестът не е намерен',
        learnMore: 'Научете повече: ',
        concernedXrayTitle: 'Притеснени ли сте от излагане на рентгенови лъчи?',
        askAugustAITitle: 'Попитайте на лично <b>August AI</b>.',
      },
      hr: {
        title: 'Testovi i postupci',
        description:
          'Pronađite detaljne informacije o medicinskim testovima i postupcima, uključujući što očekivati i kako se pripremiti.',
        searchPlaceholder: 'Pretražite testove i postupke...',
         browseByLetter: 'Pregledaj po slovu',
        noTestsFound: (letter) =>
          `Nisu pronađeni testovi koji počinju s '${letter.toUpperCase()}'`,
        tryAnother:
          'Pokušajte s drugim slovom ili upotrijebite funkciju pretraživanja.',
        home: 'Početna',
         originalSource: 'Izvorni izvor: ',
         commonTestsTitle: 'Uobičajeni testovi i postupci',
        commonTestsDescription:
          'Pronađite detaljne informacije o često izvođenim medicinskim testovima i postupcima.',
          completeBloodCount: 'Kompletna krvna slika (KKS)',
        completeBloodCountDescription:
          'Mjeri različite komponente vaše krvi, uključujući crvene i bijele krvne stanice.',
        mriScan: 'MRI skeniranje',
         mriScanDescription:
          'Detaljan test snimanja koji koristi magnetska polja i radiovalove za stvaranje slika organa.',
          ctScan: 'CT skeniranje',
         ctScanDescription:
          'Napredna rendgenska snimka koja snima detaljne slike organa i struktura unutar vašeg tijela.',
         colonoscopy: 'Kolonoskopija',
         colonoscopyDescription:
          'Pregled debelog crijeva radi otkrivanja abnormalnosti i provođenja pregleda na rak.',
       echocardiogram: 'Ehokardiogram',
       echocardiogramDescription:
          'Ultrazvučni test koji provjerava strukturu i funkciju vašeg srca.',
        stressTest: 'Test opterećenja',
        stressTestDescription:
          'Mjeri kako vaše srce radi tijekom tjelesne aktivnosti.',
        mammogram: 'Mamografija',
        mammogramDescription:
          'Rendgensko snimanje dojke koje se koristi za pregled raka dojke.',
       endoscopy: 'Endoskopija',
        endoscopyDescription:
          'Postupak za pregled unutrašnjosti vašeg probavnog trakta.',
        testNotFound: 'Test nije pronađen',
        learnMore: 'Saznajte više: ',
        concernedXrayTitle: 'Zabrinuti zbog izloženosti rendgenskim zrakama?',
        askAugustAITitle: 'Pitajte privatno <b>August AI</b>.',
      },
      sk: {
        title: 'Testy a postupy',
        description:
          'Nájdite podrobné informácie o lekárskych testoch a postupoch vrátane toho, čo môžete očakávať a ako sa pripraviť.',
        searchPlaceholder: 'Hľadať testy a postupy...',
        browseByLetter: 'Prehliadať podľa písmena',
        noTestsFound: (letter) =>
          `Nenašli sa žiadne testy začínajúce na '${letter.toUpperCase()}'`,
        tryAnother:
          'Skúste iné písmeno alebo použite funkciu vyhľadávania.',
        home: 'Domov',
        originalSource: 'Pôvodný zdroj: ',
        commonTestsTitle: 'Bežné testy a postupy',
        commonTestsDescription:
          'Nájdite podrobné informácie o často vykonávaných lekárskych testoch a postupoch.',
         completeBloodCount: 'Kompletný krvný obraz (CBC)',
        completeBloodCountDescription:
          'Merá rôzne zložky vašej krvi vrátane červených a bielych krviniek.',
         mriScan: 'MRI skenovanie',
        mriScanDescription:
          'Podrobný zobrazovací test, ktorý využíva magnetické polia a rádiové vlny na vytváranie obrázkov orgánov.',
        ctScan: 'CT skenovanie',
         ctScanDescription:
          'Pokročilý röntgen, ktorý robí podrobné snímky orgánov a štruktúr vo vašom tele.',
        colonoscopy: 'Kolonoskopia',
       colonoscopyDescription:
          'Vyšetrenie hrubého čreva na zistenie abnormalít a vykonanie skríningu rakoviny.',
       echocardiogram: 'Echokardiogram',
       echocardiogramDescription:
          'Ultrazvukové vyšetrenie, ktoré kontroluje štruktúru a funkciu vášho srdca.',
        stressTest: 'Záťažový test',
       stressTestDescription:
          'Merá, ako vaše srdce pracuje počas fyzickej aktivity.',
       mammogram: 'Mamografia',
        mammogramDescription:
          'Röntgenové snímky prsníka používané na skríning rakoviny prsníka.',
       endoscopy: 'Endoskopia',
         endoscopyDescription:
          'Postup na vyšetrenie vnútra vášho tráviaceho traktu.',
         testNotFound: 'Test sa nenašiel',
           learnMore: 'Zistiť viac: ',
           concernedXrayTitle: 'Máte obavy z vystavenia röntgenovému žiareniu?',
           askAugustAITitle: 'Opýtajte sa súkromne <b>August AI</b>.',
      },
      sl: {
        title: 'Testi in postopki',
        description:
          'Poiščite podrobne informacije o medicinskih testih in postopkih, vključno s tem, kaj pričakovati in kako se pripraviti.',
        searchPlaceholder: 'Iskanje testov in postopkov ...',
        browseByLetter: 'Brskaj po črki',
         noTestsFound: (letter) =>
          `Ni najdenih testov, ki se začnejo s črko '${letter.toUpperCase()}'`,
        tryAnother: 'Poskusite drugo črko ali uporabite iskalno funkcijo.',
        home: 'Domov',
         originalSource: 'Izvirni vir: ',
        commonTestsTitle: 'Pogosti testi in postopki',
         commonTestsDescription:
          'Poiščite podrobne informacije o pogosto izvajanih medicinskih testih in postopkih.',
          completeBloodCount: 'Kompletna krvna slika (KKS)',
        completeBloodCountDescription:
          'Meri različne sestavine vaše krvi, vključno z rdečimi in belimi krvničkami.',
        mriScan: 'Slikanje z magnetno resonanco (MRI)',
        mriScanDescription:
          'Podroben slikovni test, ki uporablja magnetna polja in radijske valove za ustvarjanje slik organov.',
        ctScan: 'CT slikanje',
        ctScanDescription:
          'Napredni rentgen, ki naredi podrobne slike organov in struktur v vašem telesu.',
        colonoscopy: 'Kolonoskopija',
        colonoscopyDescription:
          'Pregled debelega črevesa za odkrivanje nepravilnosti in izvajanje pregledov raka.',
        echocardiogram: 'Ehokardiogram',
        echocardiogramDescription:
          'Ultrazvočni test, ki preveri strukturo in delovanje vašega srca.',
        stressTest: 'Test obremenitve',
        stressTestDescription:
          'Meri, kako deluje vaše srce med telesno aktivnostjo.',
        mammogram: 'Mamografija',
        mammogramDescription:
          'Rentgensko slikanje dojk, ki se uporablja za presejanje raka dojk.',
        endoscopy: 'Endoskopija',
        endoscopyDescription:
          'Postopek za pregled notranjosti prebavnega trakta.',
         testNotFound: 'Test ni najden',
        learnMore: 'Preberi več: ',
        concernedXrayTitle: 'Skrbi vas izpostavljenost rentgenskim žarkom?',
        askAugustAITitle: 'Vprašajte zasebno <b>August AI</b>.',
      },
      et: {
        title: 'Uuringud ja protseduurid',
        description:
          'Leidke üksikasjalikku teavet meditsiiniliste uuringute ja protseduuride kohta, sealhulgas, mida oodata ja kuidas valmistuda.',
        searchPlaceholder: 'Otsi uuringuid ja protseduure...',
        browseByLetter: 'Sirvi tähe järgi',
        noTestsFound: (letter) =>
          `Ühtegi uuringut, mis algaks tähega '${letter.toUpperCase()}', ei leitud`,
        tryAnother:
          'Proovige mõnda teist tähte või kasutage otsingufunktsiooni.',
        home: 'Avaleht',
        originalSource: 'Algallikas: ',
        commonTestsTitle: 'Levinud uuringud ja protseduurid',
        commonTestsDescription:
          'Leidke üksikasjalikku teavet sageli tehtavate meditsiiniliste uuringute ja protseduuride kohta.',
        completeBloodCount: 'Täielik vereanalüüs (CBC)',
        completeBloodCountDescription:
          'Mõõdab teie vere erinevaid komponente, sealhulgas punaseid ja valgeid vereliblesid.',
        mriScan: 'MRI uuring',
        mriScanDescription:
          'Üksikasjalik kuvauuring, mis kasutab organite piltide loomiseks magnetvälju ja raadiolaineid.',
        ctScan: 'CT uuring',
        ctScanDescription:
          'Täiustatud röntgenuuring, mis teeb üksikasjalikke pilte teie kehas olevatest organitest ja struktuuridest.',
        colonoscopy: 'Kolonoskoopia',
        colonoscopyDescription:
          'Jämesoole uuring ebanormaalsuste tuvastamiseks ja vähktõve sõeluuringu tegemiseks.',
        echocardiogram: 'Ehhokardiograafia',
        echocardiogramDescription:
          'Ultraheliuuring, mis kontrollib teie südame struktuuri ja funktsiooni.',
        stressTest: 'Stressitest',
        stressTestDescription:
          'Mõõdab, kuidas teie süda füüsilise aktiivsuse ajal toimib.',
        mammogram: 'Mammograafia',
        mammogramDescription:
          'Röntgenikiirgus rindkere piirkonnast, mida kasutatakse rinnavähi sõeluuringuks.',
        endoscopy: 'Endoskoopia',
        endoscopyDescription:
          'Protseduur teie seedetrakti sisemuse uurimiseks.',
         testNotFound: 'Testi ei leitud',
        learnMore: 'Lisateave: ',
        concernedXrayTitle: 'Muretsed röntgenkiirguse mõju pärast?',
        askAugustAITitle: 'Küsige privaatselt <b>August AI</b> käest.',
      },
      lv: {
        title: 'Pārbaudes un procedūras',
        description:
          'Atrodiet detalizētu informāciju par medicīniskajām pārbaudēm un procedūrām, tostarp to, ko gaidīt un kā sagatavoties.',
        searchPlaceholder: 'Meklēt pārbaudes un procedūras...',
        browseByLetter: 'Pārlūkot pēc burta',
        noTestsFound: (letter) =>
          `Nav atrasti testi, kas sākas ar '${letter.toUpperCase()}'`,
        tryAnother:
          'Lūdzu, mēģiniet citu burtu vai izmantojiet meklēšanas funkciju.',
        home: 'Sākums',
         originalSource: 'Oriģinālais avots: ',
        commonTestsTitle: 'Bieži sastopamās pārbaudes un procedūras',
        commonTestsDescription:
          'Atrodiet detalizētu informāciju par bieži veiktajām medicīniskajām pārbaudēm un procedūrām.',
           completeBloodCount: 'Pilna asins aina (CBC)',
        completeBloodCountDescription:
          'Mēra dažādus jūsu asins komponentus, ieskaitot sarkanās un baltās asins šūnas.',
        mriScan: 'MRI skenēšana',
        mriScanDescription:
          'Detalizēts attēlveidošanas tests, kurā tiek izmantoti magnētiskie lauki un radioviļņi, lai izveidotu orgānu attēlus.',
        ctScan: 'CT skenēšana',
        ctScanDescription:
          'Uzlabots rentgenstarojums, kas uzņem detalizētus orgānu un struktūru attēlus jūsu ķermenī.',
        colonoscopy: 'Kolonoskopija',
        colonoscopyDescription:
          'Resnās zarnas izmeklēšana, lai noteiktu patoloģijas un veiktu vēža skrīningu.',
         echocardiogram: 'Ehokardiogramma',
        echocardiogramDescription:
          'Ultraskaņas tests, kas pārbauda jūsu sirds struktūru un funkcijas.',
        stressTest: 'Slodzes tests',
        stressTestDescription:
          'Mēra, kā jūsu sirds darbojas fiziskās aktivitātes laikā.',
        mammogram: 'Mamogrāfija',
        mammogramDescription:
          'Krūts rentgenattēls, ko izmanto krūts vēža skrīningam.',
        endoscopy: 'Endoskopija',
        endoscopyDescription:
          'Procedūra jūsu gremošanas trakta iekšpuses izmeklēšanai.',
         testNotFound: 'Tests nav atrasts',
          learnMore: 'Uzzināt vairāk: ',
          concernedXrayTitle: 'Vai uztrauc rentgena starojuma iedarbība?',
          askAugustAITitle: 'Jautājiet privāti <b>August AI</b>.',
      },
      lt: {
        title: 'Tyrimai ir procedūros',
        description:
          'Raskite išsamios informacijos apie medicininius tyrimus ir procedūras, įskaitant tai, ko tikėtis ir kaip pasiruošti.',
        searchPlaceholder: 'Ieškoti tyrimų ir procedūrų...',
        browseByLetter: 'Naršyti pagal raidę',
          noTestsFound: (letter) =>
          `Nerasta tyrimų, kurie prasideda raide '${letter.toUpperCase()}'`,
        tryAnother:
          'Pabandykite kitą raidę arba naudokite paieškos funkciją.',
        home: 'Pagrindinis',
        originalSource: 'Originalus šaltinis: ',
        commonTestsTitle: 'Dažni tyrimai ir procedūros',
        commonTestsDescription:
          'Raskite išsamios informacijos apie dažnai atliekamus medicininius tyrimus ir procedūras.',
            completeBloodCount: 'Bendras kraujo tyrimas (BKT)',
        completeBloodCountDescription:
          'Matuoja įvairius jūsų kraujo komponentus, įskaitant raudonuosius ir baltuosius kraujo kūnelius.',
        mriScan: 'MRT tyrimas',
        mriScanDescription:
          'Išsamus vaizdo tyrimas, kurio metu naudojami magnetiniai laukai ir radijo bangos organų vaizdams kurti.',
        ctScan: 'KT tyrimas',
        ctScanDescription:
          'Pažangus rentgeno tyrimas, kuriuo gaunami išsamūs jūsų kūno organų ir struktūrų vaizdai.',
        colonoscopy: 'Kolonoskopija',
        colonoscopyDescription:
          'Storžarnės tyrimas, siekiant nustatyti anomalijas ir atlikti vėžio patikrą.',
        echocardiogram: 'Echokardiograma',
        echocardiogramDescription:
          'Ultragarsinis tyrimas, kuriuo tikrinama jūsų širdies struktūra ir funkcija.',
        stressTest: 'Streso testas',
        stressTestDescription:
          'Matuoja, kaip jūsų širdis veikia fizinio aktyvumo metu.',
        mammogram: 'Mamograma',
         mammogramDescription:
          'Krūties rentgeno vaizdavimas, naudojamas krūties vėžio atrankai.',
        endoscopy: 'Endoskopija',
        endoscopyDescription:
          'Procedūra, skirta ištirti jūsų virškinamojo trakto vidų.',
         testNotFound: 'Testas nerastas',
        learnMore: 'Sužinokite daugiau: ',
        concernedXrayTitle: 'Nerimaujate dėl rentgeno spinduliuotės poveikio?',
        askAugustAITitle: 'Klauskite privačiai <b>August AI</b>.',
      },
        is: {
        title: 'Rannsóknir og aðgerðir',
        description:
          'Finndu nákvæmar upplýsingar um læknisfræðilegar rannsóknir og aðgerðir, þar með talið við hverju má búast og hvernig á að undirbúa.',
        searchPlaceholder: 'Leita að rannsóknum og aðgerðum...',
        browseByLetter: 'Fletta eftir staf',
          noTestsFound: (letter) =>
          `Engar rannsóknir fundust sem byrja á '${letter.toUpperCase()}'`,
        tryAnother:
          'Vinsamlegast reyndu annan staf eða notaðu leitaraðgerðina.',
        home: 'Heim',
         originalSource: 'Upprunaleg heimild: ',
        commonTestsTitle: 'Algengar rannsóknir og aðgerðir',
        commonTestsDescription:
          'Finndu nákvæmar upplýsingar um algengar læknisfræðilegar rannsóknir og aðgerðir.',
          completeBloodCount: 'Almenn blóðtalning (CBC)',
        completeBloodCountDescription:
          'Mælir mismunandi hluta blóðsins, þar með talið rauð og hvít blóðkorn.',
        mriScan: 'Segulómun',
        mriScanDescription:
          'Ítarleg myndgreiningarpróf sem notar segulsvið og útvarpsbylgjur til að búa til myndir af líffærum.',
        ctScan: 'Tölvusneiðmyndataka',
        ctScanDescription:
          'Ítarleg röntgenmyndataka sem tekur nákvæmar myndir af líffærum og mannvirkjum í líkamanum.',
        colonoscopy: 'Ristilspeglun',
        colonoscopyDescription:
          'Skoðun á ristli til að greina frávik og framkvæma krabbameinsskimanir.',
        echocardiogram: 'Hjartalínurit',
        echocardiogramDescription:
          'Ómskoðun sem athugar byggingu og starfsemi hjartans.',
        stressTest: 'Áreynslupróf',
         stressTestDescription:
          'Mælir hvernig hjartað starfar við líkamlega áreynslu.',
        mammogram: 'Brjóstamyndataka',
        mammogramDescription:
          'Röntgenmyndataka af brjóstinu sem notuð er til að leita að brjóstakrabbameini.',
        endoscopy: 'Spegilspeglun',
        endoscopyDescription:
          'Aðgerð til að skoða innra yfirborð meltingarvegar.',
        testNotFound: 'Próf fannst ekki',
        learnMore: 'Læra meira: ',
        concernedXrayTitle: 'Áhyggjur af geislun frá röntgenmyndum?',
        askAugustAITitle: 'Spyrðu <b>August AI</b> í einrúmi.',
      },
       ga: {
        title: 'Tástálacha agus Nósanna Imeachta',
         description:
          'Faigh eolas mionsonraithe faoi thástálacha agus nósanna imeachta leighis, lena n-áirítear cad is féidir a bheith ag súil leis agus conas ullmhú.',
         searchPlaceholder: 'Cuardaigh tástálacha agus nósanna imeachta...',
        browseByLetter: 'Brabhsáil de réir litreach',
          noTestsFound: (letter) =>
          `Níor aimsíodh aon tástálacha a thosaíonn le '${letter.toUpperCase()}'`,
        tryAnother:
            'Déan iarracht litir eile nó bain úsáid as an bhfeidhm chuardaigh.',
        home: 'Baile',
        originalSource: 'Foinse bhunaidh: ',
        commonTestsTitle: 'Tástálacha agus Nósanna Imeachta Coiteanna',
        commonTestsDescription:
          'Faigh eolas mionsonraithe faoi thástálacha agus nósanna imeachta leighis a dhéantar go minic.',
           completeBloodCount: 'Líon Iomlán Fola (LIF)',
        completeBloodCountDescription:
          'Tomhaiseann sé comhpháirteanna éagsúla de do chuid fola, lena n-áirítear cealla fola dearga agus bána.',
          mriScan: 'Scanadh MRI',
          mriScanDescription:
          'Tástáil íomháithe mionsonraithe a úsáideann páirceanna maighnéadacha agus tonnta raidió chun pictiúir d’orgáin a chruthú.',
        ctScan: 'Scanadh CT',
        ctScanDescription:
            'X-gha ardfhorbartha a thógann pictiúir mhionsonraithe d’orgáin agus struchtúir laistigh de do chorp.',
        colonoscopy: 'Coloscópacht',
          colonoscopyDescription:
          'Scrúdú ar an inní mhór chun neamhghnáchaíochtaí a bhrath agus chun scrúduithe ailse a dhéanamh.',
        echocardiogram: 'Eocairdagram',
        echocardiogramDescription:
          'Tástáil ultrafhuaime a sheiceálann struchtúr agus feidhm do chroí.',
        stressTest: 'Tástáil Strus',
        stressTestDescription:
          'Tomhaiseann sé conas a fheidhmíonn do chroí le linn gníomhaíochta coirp.',
        mammogram: 'Mamaagraim',
       mammogramDescription:
          'Íomháú X-ghathach den chíche a úsáidtear chun ailse chíche a scagadh.',
        endoscopy: 'Endoscópacht',
        endoscopyDescription:
          'Nós imeachta chun taobh istigh de do chonair díleá a scrúdú.',
          testNotFound: 'Tástáil gan a aimsiú',
        learnMore: 'Foghlaim níos mó: ',
        concernedXrayTitle: 'Imní ort faoi nochtadh do ghhathanna X?',
        askAugustAITitle: 'Cuir ceist ar <b>August AI</b> go príobháideach.',
       },
       mt: {
        title: 'Testijiet u Proċeduri',
         description:
          'Sib informazzjoni dettaljata dwar testijiet u proċeduri mediċi, inkluż x\'tista\' tistenna u kif tipprepara.',
        searchPlaceholder: 'Fittex testijiet u proċeduri...',
        browseByLetter: 'Ibbrawżja skont l-ittra',
         noTestsFound: (letter) =>
          `L-ebda test ma nstab li jibda b' '${letter.toUpperCase()}'`,
        tryAnother:
          'Jekk jogħġbok ipprova ittra oħra jew uża l-funzjoni tat-tiftix.',
        home: 'Dar',
        originalSource: 'Sors oriġinali: ',
        commonTestsTitle: 'Testijiet u Proċeduri Komuni',
        commonTestsDescription:
          'Sib informazzjoni dettaljata dwar testijiet u proċeduri mediċi mwettqa ta’ spiss.',
          completeBloodCount: 'Għadd Sħiħ tad-Demm (CBC)',
        completeBloodCountDescription:
            'Ikejjel komponenti differenti tad-demm tiegħek, inklużi ċ-ċelluli ħomor u bojod tad-demm.',
        mriScan: 'Skan MRI',
         mriScanDescription:
          'Test dettaljat tal-immaġini li juża kampi manjetiċi u mewġ tar-radju biex joħloq stampi tal-organi.',
        ctScan: 'Skan CT',
        ctScanDescription:
          'X-ray avvanzat li jieħu stampi dettaljati ta organi u strutturi ġewwa ġismek.',
        colonoscopy: 'Kolonoskopija',
         colonoscopyDescription:
          'Eżami tal-musrana l-kbira biex jiġu skoperti anormalitajiet u jitwettqu eżamijiet tal-kanċer.',
          echocardiogram: 'Ekokardjogramma',
         echocardiogramDescription:
          'Test tal-ultrasound li jiċċekkja l-istruttura u l-funzjoni tal-qalb tiegħek.',
        stressTest: 'Test tal-Istress',
         stressTestDescription:
          'Ikejjel kif il-qalb tiegħek taħdem waqt l-attività fiżika.',
        mammogram: 'Mammogramm',
        mammogramDescription:
          'Immaġini bir-raġġi-X tas-sider użati biex jiġi skrinjat għall-kanċer tas-sider.',
        endoscopy: 'Endoskopija',
        endoscopyDescription:
          'Proċedura biex teżamina l-ġewwa tal-passaġġ diġestiv tiegħek.',
         testNotFound: 'Test mhux misjub',
         learnMore: 'Sir af aktar: ',
         concernedXrayTitle: 'Inkwetat dwar l-espożizzjoni għar-raġġi X?',
         askAugustAITitle: 'Staqsija lil <b>August AI</b> b\'mod privat.',
      },
        sq: {
        title: 'Testet dhe procedurat',
         description:
          'Gjeni informacione të detajuara rreth testeve dhe procedurave mjekësore, duke përfshirë se çfarë duhet të prisni dhe si të përgatiteni.',
         searchPlaceholder: 'Kërkoni teste dhe procedura...',
        browseByLetter: 'Shfleto sipas shkronjës',
          noTestsFound: (letter) =>
          `Nuk u gjetën teste që fillojnë me '${letter.toUpperCase()}'`,
        tryAnother:
          'Ju lutemi provoni një shkronjë tjetër ose përdorni funksionin e kërkimit.',
        home: 'Fillimi',
        originalSource: 'Burimi origjinal: ',
        commonTestsTitle: 'Testet dhe procedurat e zakonshme',
        commonTestsDescription:
          'Gjeni informacione të detajuara rreth testeve dhe procedurave mjekësore të kryera shpesh.',
           completeBloodCount: 'Numërimi i plotë i gjakut (CBC)',
        completeBloodCountDescription:
          'Mat komponentë të ndryshëm të gjakut tuaj, duke përfshirë qelizat e kuqe dhe të bardha të gjakut.',
        mriScan: 'Skanimi MRI',
        mriScanDescription:
          'Test i detajuar i imazhit që përdor fusha magnetike dhe valë radio për të krijuar foto të organeve.',
        ctScan: 'Skanimi CT',
        ctScanDescription:
          'Rreze X e avancuar që merr imazhe të detajuara të organeve dhe strukturave brenda trupit tuaj.',
        colonoscopy: 'Kolonoskopia',
        colonoscopyDescription:
          'Ekzaminimi i zorrës së trashë për të zbuluar anomalitë dhe për të kryer testime për kancer.',
        echocardiogram: 'Ekokardiogrami',
        echocardiogramDescription:
          'Test me ultratinguj që kontrollon strukturën dhe funksionin e zemrës tuaj.',
        stressTest: 'Testi i stresit',
         stressTestDescription:
          'Mat se si performon zemra juaj gjatë aktivitetit fizik.',
        mammogram: 'Mamografia',
        mammogramDescription:
          'Imazhe me rreze X të gjirit të përdorura për të ekzaminuar kancerin e gjirit.',
         endoscopy: 'Endoskopia',
        endoscopyDescription:
          'Procedura për të ekzaminuar brendësinë e traktit tuaj tretës.',
         testNotFound: 'Testi nuk u gjet',
          learnMore: 'Mëso më shumë: ',
          concernedXrayTitle: 'I shqetësuar për ekspozimin ndaj rrezeve X?',
          askAugustAITitle: 'Pyet <b>August AI</b> privatisht.',
        },
      be: {
        title: 'Тэсты і працэдуры',
        description:
          'Знайдзіце падрабязную інфармацыю аб медыцынскіх тэстах і працэдурах, у тым ліку пра тое, чаго чакаць і як падрыхтавацца.',
        searchPlaceholder: 'Пошук тэстаў і працэдур...',
         browseByLetter: 'Прагляд па літарах',
          noTestsFound: (letter) =>
          `Не знойдзена тэстаў, якія пачынаюцца з '${letter.toUpperCase()}'`,
        tryAnother:
          'Калі ласка, паспрабуйце іншую літару або выкарыстоўвайце функцыю пошуку.',
        home: 'Галоўная',
         originalSource: 'Арыгінальная крыніца: ',
        commonTestsTitle: 'Агульныя тэсты і працэдуры',
        commonTestsDescription:
          'Знайдзіце падрабязную інфармацыю аб часта выконваемых медыцынскіх тэстах і працэдурах.',
        completeBloodCount: 'Поўны аналіз крыві (ПАК)',
        completeBloodCountDescription:
          'Вымярае розныя кампаненты вашай крыві, уключаючы чырвоныя і белыя крывяныя клеткі.',
        mriScan: 'МРТ',
        mriScanDescription:
          'Падрабязны тэст візуалізацыі, у якім выкарыстоўваюцца магнітныя палі і радыёхвалі для стварэння малюнкаў органаў.',
        ctScan: 'КТ',
        ctScanDescription:
          'Палепшаны рэнтген, які робіць падрабязныя здымкі органаў і структур унутры вашага цела.',
        colonoscopy: 'Калонаскапія',
        colonoscopyDescription:
          'Абследаванне тоўстай кішкі для выяўлення анамалій і правядзення абследавання на рак.',
        echocardiogram: 'Эхакардыяграма',
        echocardiogramDescription:
          'Ультрагукавое даследаванне, якое правярае структуру і функцыю вашага сэрца.',
        stressTest: 'Стрэс-тэст',
         stressTestDescription:
          'Вымярае, як працуе ваша сэрца падчас фізічнай актыўнасці.',
         mammogram: 'Мамаграфія',
        mammogramDescription:
          'Рэнтгенаўскія здымкі малочнай залозы, якія выкарыстоўваюцца для скрынінгу рака малочнай залозы.',
        endoscopy: 'Эндаскапія',
        endoscopyDescription:
          'Працэдура для абследавання ўнутранай часткі вашага стрававальнага гасцінца.',
         testNotFound: 'Тэст не знойдзены',
          learnMore: 'Даведацца больш: ',
          concernedXrayTitle: 'Хвалюецеся з-за ўздзеяння рэнтгенаўскіх прамянёў?',
          askAugustAITitle: 'Спытайце ў <b>August AI</b> прыватна.',
        },
        bs: {
            title: 'Testovi i procedure',
            description:
              'Pronađite detaljne informacije o medicinskim testovima i procedurama, uključujući šta očekivati i kako se pripremiti.',
            searchPlaceholder: 'Pretražite testove i procedure...',
            browseByLetter: 'Pretražite po slovu',
             noTestsFound: (letter) =>
              `Nema testova koji počinju sa '${letter.toUpperCase()}'`,
             tryAnother:
              'Molimo pokušajte drugo slovo ili koristite funkciju pretrage.',
            home: 'Početna',
            originalSource: 'Originalni izvor: ',
            commonTestsTitle: 'Uobičajeni testovi i procedure',
            commonTestsDescription:
              'Pronađite detaljne informacije o često izvođenim medicinskim testovima i procedurama.',
              completeBloodCount: 'Kompletna krvna slika (KKS)',
            completeBloodCountDescription:
              'Mjeri različite komponente vaše krvi, uključujući crvena i bijela krvna zrnca.',
            mriScan: 'MRI skeniranje',
            mriScanDescription:
              'Detaljan test snimanja koji koristi magnetna polja i radio valove za stvaranje slika organa.',
            ctScan: 'CT skeniranje',
            ctScanDescription:
              'Napredni rendgenski snimak koji snima detaljne slike organa i struktura unutar vašeg tijela.',
            colonoscopy: 'Kolonoskopija',
            colonoscopyDescription:
              'Pregled debelog crijeva radi otkrivanja abnormalnosti i obavljanja pregleda za rak.',
            echocardiogram: 'Eho kardiogram',
            echocardiogramDescription:
              'Ultrazvučni test koji provjerava strukturu i funkciju vašeg srca.',
            stressTest: 'Test opterećenja',
            stressTestDescription:
              'Mjeri kako vaše srce radi tokom fizičke aktivnosti.',
            mammogram: 'Mamogram',
            mammogramDescription:
              'Rentgensko snimanje dojke koje se koristi za pregled raka dojke.',
            endoscopy: 'Endoskopija',
            endoscopyDescription:
              'Postupak za pregled unutrašnjosti vašeg probavnog trakta.',
            testNotFound: 'Test nije pronađen',
             learnMore: 'Saznajte više: ',
             concernedXrayTitle: 'Zabrinuti zbog izloženosti X-zracima?',
             askAugustAITitle: 'Pitajte <b>August AI</b> privatno.',
          },
           gd: {
            title: 'Deuchainnean agus modhan-obrach',
            description:
              'Lorg fiosrachadh mionaideach mu dheuchainnean meidigeach agus modhan-obrach, a’ gabhail a-steach na tha ri shùileachadh agus mar a dh’ullaicheas tu.',
            searchPlaceholder: 'Lorg deuchainnean agus modhan-obrach...',
            browseByLetter: 'Brabhsaich a rèir litir',
            noTestsFound: (letter) =>
              `Cha deach deuchainnean a lorg a’ tòiseachadh le '${letter.toUpperCase()}'`,
            tryAnother:
                'Feuch litir eile no cleachd an gnìomh rannsachaidh.',
            home: 'Dachaigh',
            originalSource: 'Tùs tùsail: ',
            commonTestsTitle: 'Deuchainnean agus modhan-obrach cumanta',
            commonTestsDescription:
              'Lorg fiosrachadh mionaideach mu dheuchainnean meidigeach agus modhan-obrach a thathas a’ dèanamh gu tric.',
            completeBloodCount: 'Àireamh fala iomlan (CBC)',
            completeBloodCountDescription:
              'A’ tomhas diofar phàirtean den fhuil agad, a’ gabhail a-steach ceallan fala dearga is geal.',
            mriScan: 'Sgan MRI',
            mriScanDescription:
              'Deuchainn ìomhaighean mionaideach a bhios a’ cleachdadh raointean magnetach agus tonnan rèidio gus dealbhan de dh’organan a chruthachadh.',
            ctScan: 'Sgan CT',
            ctScanDescription:
              'X-ghath adhartach a bheir dealbhan mionaideach de dh’organan agus structaran taobh a-staigh do bhodhaig.',
            colonoscopy: 'Colonoscopy',
            colonoscopyDescription:
              'Sgrùdadh air a’ ghalair mhòr airson ana-cainnt a lorg agus sgrìonadh a dhèanamh airson aillse.',
              echocardiogram: 'Echocardiogram',
            echocardiogramDescription:
              'Deuchainn ultrasound a bhios a’ sgrùdadh structar agus gnìomh do chridhe.',
            stressTest: 'Deuchainn cuideim',
            stressTestDescription:
              'A’ tomhas mar a tha do chridhe a’ coileanadh rè gnìomhachd chorporra.',
            mammogram: 'Mammogram',
             mammogramDescription:
              'Ìomhaighean x-ghath den bhroilleach a thathas a’ cleachdadh gus aillse broilleach a sgrìonadh.',
             endoscopy: 'Endoscopy',
            endoscopyDescription:
              'Modh-obrach gus sgrùdadh a dhèanamh air taobh a-staigh do thracaigeadair cnàmhaidh.',
            testNotFound: 'Cha deach deuchainn a lorg',
            learnMore: 'Ionnsaich tuilleadh: ',
            concernedXrayTitle: 'Dragh mu nochdadh X-ghath?',
            askAugustAITitle: 'Faighnich gu prìobhaideach do <b>August AI</b>.',
          },
           lb: {
            title: 'Tester a Prozeduren',
            description:
              'Fannt detailléiert Informatiounen iwwer medizinesch Tester a Prozeduren, inklusiv wat ze erwaarden ass a wéi Dir Iech virbereet.',
            searchPlaceholder: 'Sich no Tester a Prozeduren...',
            browseByLetter: 'Sich no Buschtaf',
           noTestsFound: (letter) =>
              `Keng Tester fonnt, déi mat '${letter.toUpperCase()}' ufänken`,
            tryAnother:
              'Probéiert w.e.g. en anere Buschtaf oder benotzt d\'Sichfunktioun.',
            home: 'Doheem',
            originalSource: 'Originalquell: ',
            commonTestsTitle: 'Gemeinsam Tester a Prozeduren',
            commonTestsDescription:
              'Fannt detailléiert Informatiounen iwwer dacks duerchgefouert medizinesch Tester a Prozeduren.',
             completeBloodCount: 'Komplett Bluttzuel (CBC)',
            completeBloodCountDescription:
                'Moosst verschidde Komponente vun Ärem Blutt, dorënner rout a wäiss Bluttzellen.',
            mriScan: 'MRI Scan',
            mriScanDescription:
                'Detailléiert Bildgebungstest deen magnetesch Felder a Radiowellen benotzt fir Biller vun Organer ze kreéieren.',
            ctScan: 'CT Scan',
            ctScanDescription:
                'Fortgeschratt Röntgenstrahlung déi detailléiert Biller vun Organer a Strukturen an Ärem Kierper mécht.',
            colonoscopy: 'Koloskopie',
            colonoscopyDescription:
               'Untersuchung vum groussen Daarm fir Anomalien z\'entdecken a Kriibs Screening auszeféieren.',
            echocardiogram: 'Echokardiogramm',
            echocardiogramDescription:
                'Ultraschalltest deen d\'Struktur an d\'Funktioun vun Ärem Häerz kontrolléiert.',
            stressTest: 'Stresstest',
            stressTestDescription:
                'Moosst wéi Äert Häerz wärend der kierperlecher Aktivitéit funktionéiert.',
            mammogram: 'Mammogramm',
            mammogramDescription:
                'Röntgenbild vum Broscht, déi benotzt gëtt fir Broschtkriibs ze screenen.',
             endoscopy: 'Endoskopie',
            endoscopyDescription:
              'Prozedur fir d\'Innere vun Ärem Verdauungstrakt ze ënnersichen.',
            testNotFound: 'Test net fonnt',
            learnMore: 'Léier méi: ',
            concernedXrayTitle: 'Besuergt iwwer Röntgenstrahlung?',
            askAugustAITitle: 'Fro <b>August AI</b> privat.',
          },
            mk: {
            title: 'Тестови и процедури',
            description:
              'Најдете детални информации за медицински тестови и процедури, вклучувајќи што да очекувате и како да се подготвите.',
            searchPlaceholder: 'Пребарај тестови и процедури...',
             browseByLetter: 'Пребарај по буква',
             noTestsFound: (letter) =>
              `Не се пронајдени тестови што започнуваат со '${letter.toUpperCase()}'`,
            tryAnother:
                'Ве молиме обидете се со друга буква или користете ја функцијата за пребарување.',
              home: 'Дома',
            originalSource: 'Оригинален извор: ',
            commonTestsTitle: 'Вообичаени тестови и процедури',
            commonTestsDescription:
              'Најдете детални информации за често изведуваните медицински тестови и процедури.',
                completeBloodCount: 'Комплетна крвна слика (ККС)',
                completeBloodCountDescription:
                  'Мери различни компоненти на вашата крв, вклучувајќи црвени и бели крвни зрнца.',
              mriScan: 'МНР скен',
              mriScanDescription:
                'Детален тест за снимање што користи магнетни полиња и радио бранови за да креира слики од органите.',
             ctScan: 'КТ скен',
            ctScanDescription:
                'Напредна рентгенска снимка која прави детални слики од органите и структурите во вашето тело.',
              colonoscopy: 'Колоноскопија',
              colonoscopyDescription:
                'Испитување на дебелото црево за откривање на абнормалности и изведување на скрининг за рак.',
                echocardiogram: 'Ехокардиограм',
            echocardiogramDescription:
                  'Ултразвучен тест кој ја проверува структурата и функцијата на вашето срце.',
             stressTest: 'Стрес тест',
            stressTestDescription:
                 'Мери како вашето срце работи за време на физичка активност.',
             mammogram: 'Мамограм',
            mammogramDescription:
                'Рентгенско снимање на дојката што се користи за скрининг на рак на дојка.',
             endoscopy: 'Ендоскопија',
            endoscopyDescription:
                'Постапка за преглед на внатрешноста на вашиот дигестивен тракт.',
            testNotFound: 'Тест не е пронајден',
            learnMore: 'Дознајте повеќе: ',
            concernedXrayTitle: 'Загрижени за изложеност на Х-зраци?',
            askAugustAITitle: 'Прашајте го <b>August AI</b> приватно.',
          },
          sr: {
             title: 'Тестови и процедуре',
            description:
              'Пронађите детаљне информације о медицинским тестовима и процедурама, укључујући шта да очекујете и како да се припремите.',
            searchPlaceholder: 'Претражите тестове и процедуре...',
             browseByLetter: 'Прегледај по слову',
            noTestsFound: (letter) =>
              `Нису пронађени тестови који почињу са '${letter.toUpperCase()}'`,
             tryAnother:
                'Молимо покушајте са другим словом или користите функцију претраге.',
              home: 'Почетна',
            originalSource: 'Оригинални извор: ',
            commonTestsTitle: 'Уобичајени тестови и процедуре',
            commonTestsDescription:
              'Пронађите детаљне информације о често извођеним медицинским тестовима и процедурама.',
              completeBloodCount: 'Комплетна крвна слика (ККС)',
            completeBloodCountDescription:
              'Мери различите компоненте ваше крви, укључујући црвена и бела крвна зрнца.',
              mriScan: 'МРИ скенирање',
            mriScanDescription:
                'Детаљан тест снимања који користи магнетна поља и радио таласе за креирање слика органа.',
            ctScan: 'ЦТ скенирање',
           ctScanDescription:
                'Напредни рендгенски снимак који снима детаљне слике органа и структура унутар вашег тела.',
              colonoscopy: 'Колоноскопија',
              colonoscopyDescription:
                'Преглед дебелог црева ради откривања абнормалности и обављања прегледа за рак.',
                echocardiogram: 'Ехокардиограм',
           echocardiogramDescription:
                'Ултразвучни тест који проверава структуру и функцију вашег срца.',
            stressTest: 'Тест оптерећења',
            stressTestDescription:
                'Мери како ваше срце ради током физичке активности.',
             mammogram: 'Мамограм',
           mammogramDescription:
              'Рендгенско снимање дојке које се користи за скрининг рака дојке.',
            endoscopy: 'Ендоскопија',
            endoscopyDescription:
              'Процедура за преглед унутрашњости вашег дигестивног тракта.',
             testNotFound: 'Тест није пронађен',
              learnMore: 'Сазнајте више: ',
              concernedXrayTitle: 'Забринути због изложености Х-зрацима?',
              askAugustAITitle: 'Питајте <b>August AI</b> приватно.',
          },
          cy: {
            title: 'Profion a Gweithdrefnau',
            description:
                'Dod o hyd i wybodaeth fanwl am brofion a gweithdrefnau meddygol, gan gynnwys beth i’w ddisgwyl a sut i baratoi.',
            searchPlaceholder: 'Chwilio am brofion a gweithdrefnau...',
            browseByLetter: 'Pori yn ôl Llythyren',
            noTestsFound: (letter) =>
              `Ni ddarganfuwyd unrhyw brofion yn dechrau gyda '${letter.toUpperCase()}'`,
            tryAnother:
              'Rhowch gynnig ar lythyren arall neu defnyddiwch y swyddogaeth chwilio.',
            home: 'Cartref',
            originalSource: 'Ffynhonnell wreiddiol: ',
            commonTestsTitle: 'Profion a Gweithdrefnau Cyffredin',
            commonTestsDescription:
                'Dod o hyd i wybodaeth fanwl am brofion a gweithdrefnau meddygol a gyflawnir yn aml.',
            completeBloodCount: 'Cyfrif Gwaed Cyflawn (CBC)',
            completeBloodCountDescription:
                'Yn mesur gwahanol gydrannau eich gwaed, gan gynnwys celloedd gwaed coch a gwyn.',
            mriScan: 'Sgan MRI',
            mriScanDescription:
                'Prawf delweddu manwl sy’n defnyddio meysydd magnetig a thonnau radio i greu lluniau o organau.',
            ctScan: 'Sgan CT',
            ctScanDescription:
                'Pelydr-X uwch sy’n tynnu lluniau manwl o organau a strwythurau y tu mewn i’ch corff.',
            colonoscopy: 'Colonosgopi',
            colonoscopyDescription:
                'Archwiliad o’r coluddyn mawr i ganfod annormaleddau a chynnal sgrinio canser.',
            echocardiogram: 'Echocardiogram',
            echocardiogramDescription:
                'Prawf uwchsain sy’n gwirio strwythur a swyddogaeth eich calon.',
            stressTest: 'Prawf Straen',
            stressTestDescription:
                'Yn mesur sut mae eich calon yn perfformio yn ystod gweithgaredd corfforol.',
            mammogram: 'Mammogram',
            mammogramDescription:
                'Delweddu pelydr-X o’r fron a ddefnyddir i sgrinio ar gyfer canser y fron.',
            endoscopy: 'Endosgopi',
            endoscopyDescription:
                'Gweithdrefn i archwilio tu mewn eich llwybr treulio.',
            testNotFound: 'Prawf heb ei ddarganfod',
            learnMore: 'Dysgu mwy: ',
            concernedXrayTitle: 'Pryderus am amlygiad i belydrau-X?',
            askAugustAITitle: 'Gofynnwch i <b>August AI</b> yn breifat.',
            },
          vi: {
            title: 'Kiểm tra và Thủ thuật',
            description:
              'Tìm thông tin chi tiết về các xét nghiệm và thủ thuật y tế, bao gồm những điều cần biết và cách chuẩn bị.',
            searchPlaceholder: 'Tìm kiếm xét nghiệm và thủ thuật...',
            browseByLetter: 'Duyệt theo Chữ cái',
            noTestsFound: (letter) =>
              `Không tìm thấy xét nghiệm nào bắt đầu bằng '${letter.toUpperCase()}'`,
            tryAnother:
              'Vui lòng thử một chữ cái khác hoặc sử dụng chức năng tìm kiếm.',
            home: 'Trang chủ',
            originalSource: 'Nguồn gốc: ',
            commonTestsTitle: 'Các Xét nghiệm và Thủ thuật Phổ biến',
            commonTestsDescription:
              'Tìm thông tin chi tiết về các xét nghiệm và thủ thuật y tế thường được thực hiện.',
            completeBloodCount: 'Tổng phân tích tế bào máu (CBC)',
            completeBloodCountDescription:
              'Đo các thành phần khác nhau của máu, bao gồm cả hồng cầu và bạch cầu.',
            mriScan: 'Chụp MRI',
            mriScanDescription:
              'Xét nghiệm hình ảnh chi tiết sử dụng từ trường và sóng vô tuyến để tạo ảnh các cơ quan.',
            ctScan: 'Chụp CT',
            ctScanDescription:
              'Chụp X-quang nâng cao chụp ảnh chi tiết các cơ quan và cấu trúc bên trong cơ thể.',
            colonoscopy: 'Nội soi đại tràng',
            colonoscopyDescription:
              'Kiểm tra đại tràng để phát hiện các bất thường và sàng lọc ung thư.',
            echocardiogram: 'Điện tâm đồ',
            echocardiogramDescription:
              'Xét nghiệm siêu âm kiểm tra cấu trúc và chức năng của tim.',
            stressTest: 'Kiểm tra gắng sức',
            stressTestDescription:
              'Đo lường tim hoạt động như thế nào trong quá trình hoạt động thể chất.',
            mammogram: 'Chụp nhũ ảnh',
            mammogramDescription:
              'Chụp X-quang vú được sử dụng để sàng lọc ung thư vú.',
            endoscopy: 'Nội soi',
            endoscopyDescription:
              'Thủ thuật để kiểm tra bên trong đường tiêu hóa.',
            testNotFound: 'Không tìm thấy xét nghiệm',
            learnMore: 'Tìm hiểu thêm: ',
            concernedXrayTitle: 'Lo lắng về việc tiếp xúc với tia X?',
            askAugustAITitle: 'Hỏi <b>August AI</b> một cách riêng tư.',
          },
          th: {
            title: 'การทดสอบและขั้นตอน',
            description:
              'ค้นหาข้อมูลรายละเอียดเกี่ยวกับการทดสอบและขั้นตอนทางการแพทย์ รวมถึงสิ่งที่คาดหวังและวิธีการเตรียมตัว',
            searchPlaceholder: 'ค้นหาการทดสอบและขั้นตอน...',
            browseByLetter: 'เรียกดูตามตัวอักษร',
            noTestsFound: (letter) =>
              `ไม่พบการทดสอบที่ขึ้นต้นด้วย '${letter.toUpperCase()}'`,
            tryAnother:
              'โปรดลองใช้อักษรอื่นหรือใช้ฟังก์ชันการค้นหา',
            home: 'หน้าหลัก',
            originalSource: 'แหล่งที่มาดั้งเดิม: ',
            commonTestsTitle: 'การทดสอบและขั้นตอนทั่วไป',
            commonTestsDescription:
              'ค้นหาข้อมูลรายละเอียดเกี่ยวกับการทดสอบและขั้นตอนทางการแพทย์ที่ดำเนินการบ่อยครั้ง',
            completeBloodCount: 'การตรวจนับเม็ดเลือดอย่างสมบูรณ์ (CBC)',
            completeBloodCountDescription:
              'วัดองค์ประกอบต่างๆ ของเลือด รวมถึงเซลล์เม็ดเลือดแดงและเซลล์เม็ดเลือดขาว',
            mriScan: 'การสแกน MRI',
            mriScanDescription:
              'การทดสอบภาพขั้นสูงที่ใช้สนามแม่เหล็กและคลื่นวิทยุเพื่อสร้างภาพของอวัยวะ',
            ctScan: 'การสแกน CT',
            ctScanDescription:
              'การเอกซเรย์ขั้นสูงที่ถ่ายภาพรายละเอียดของอวัยวะและโครงสร้างภายในร่างกายของคุณ',
            colonoscopy: 'การส่องกล้องตรวจลำไส้ใหญ่',
            colonoscopyDescription:
              'การตรวจลำไส้ใหญ่เพื่อตรวจหาความผิดปกติและทำการตรวจคัดกรองมะเร็ง',
            echocardiogram: 'การตรวจหัวใจด้วยคลื่นเสียงความถี่สูง',
            echocardiogramDescription:
              'การทดสอบด้วยคลื่นเสียงความถี่สูงที่ตรวจสอบโครงสร้างและการทำงานของหัวใจ',
            stressTest: 'การทดสอบความเครียด',
            stressTestDescription:
              'วัดว่าหัวใจของคุณทำงานอย่างไรในระหว่างทำกิจกรรมทางกาย',
            mammogram: 'การตรวจแมมโมแกรม',
            mammogramDescription:
              'ภาพถ่ายรังสีเอกซ์ของเต้านมที่ใช้ในการตรวจคัดกรองมะเร็งเต้านม',
            endoscopy: 'การส่องกล้อง',
            endoscopyDescription:
              'ขั้นตอนการตรวจสอบภายในระบบทางเดินอาหารของคุณ',
             testNotFound: 'ไม่พบการทดสอบ',
            learnMore: 'เรียนรู้เพิ่มเติม: ',
            concernedXrayTitle: 'กังวลเกี่ยวกับการได้รับรังสีเอกซ์?',
            askAugustAITitle: 'ถาม <b>August AI</b> อย่างเป็นส่วนตัว',
          },
           id: {
            title: 'Tes dan Prosedur',
            description:
              'Temukan informasi terperinci tentang tes dan prosedur medis, termasuk apa yang diharapkan dan cara mempersiapkannya.',
            searchPlaceholder: 'Cari tes dan prosedur...',
            browseByLetter: 'Telusuri Berdasarkan Huruf',
            noTestsFound: (letter) =>
              `Tidak ada tes yang ditemukan dimulai dengan '${letter.toUpperCase()}'`,
            tryAnother:
              'Silakan coba huruf lain atau gunakan fungsi pencarian.',
            home: 'Beranda',
             originalSource: 'Sumber asli: ',
            commonTestsTitle: 'Tes dan Prosedur Umum',
            commonTestsDescription:
              'Temukan informasi terperinci tentang tes dan prosedur medis yang sering dilakukan.',
              completeBloodCount: 'Hitung Darah Lengkap (CBC)',
            completeBloodCountDescription:
              'Mengukur berbagai komponen darah Anda, termasuk sel darah merah dan putih.',
            mriScan: 'Pemindaian MRI',
            mriScanDescription:
              'Tes pencitraan terperinci yang menggunakan medan magnet dan gelombang radio untuk membuat gambar organ.',
            ctScan: 'Pemindaian CT',
            ctScanDescription:
              'Rontgen tingkat lanjut yang mengambil gambar detail organ dan struktur di dalam tubuh Anda.',
            colonoscopy: 'Kolonoskopi',
            colonoscopyDescription:
              'Pemeriksaan usus besar untuk mendeteksi kelainan dan melakukan pemeriksaan kanker.',
              echocardiogram: 'Ekokardiogram',
            echocardiogramDescription:
              'Tes ultrasound yang memeriksa struktur dan fungsi jantung Anda.',
            stressTest: 'Tes Stres',
            stressTestDescription:
              'Mengukur bagaimana kinerja jantung Anda selama aktivitas fisik.',
            mammogram: 'Mammogram',
            mammogramDescription:
              'Pencitraan X-ray payudara yang digunakan untuk menyaring kanker payudara.',
            endoscopy: 'Endoskopi',
             endoscopyDescription:
              'Prosedur untuk memeriksa bagian dalam saluran pencernaan Anda.',
            testNotFound: 'Tes tidak ditemukan',
             learnMore: 'Pelajari lebih lanjut: ',
             concernedXrayTitle: 'Khawatir tentang paparan sinar X?',
             askAugustAITitle: 'Tanyakan kepada <b>August AI</b> secara pribadi.',
            },
            ms: {
                title: 'Ujian dan Prosedur',
                description:
                  'Cari maklumat terperinci mengenai ujian dan prosedur perubatan, termasuk perkara yang diharapkan dan cara membuat persediaan.',
                searchPlaceholder: 'Cari ujian dan prosedur...',
                 browseByLetter: 'Semak Imbas Mengikut Abjad',
               noTestsFound: (letter) =>
                `Tiada ujian ditemui bermula dengan '${letter.toUpperCase()}'`,
               tryAnother:
                'Sila cuba huruf lain atau gunakan fungsi carian.',
               home: 'Laman Utama',
               originalSource: 'Sumber asal: ',
               commonTestsTitle: 'Ujian dan Prosedur Biasa',
              commonTestsDescription:
                  'Cari maklumat terperinci mengenai ujian dan prosedur perubatan yang sering dilakukan.',
                 completeBloodCount: 'Kiraan Darah Lengkap (CBC)',
                 completeBloodCountDescription:
                  'Mengukur komponen darah yang berbeza, termasuk sel darah merah dan putih.',
                mriScan: 'Imbasan MRI',
              mriScanDescription:
                  'Ujian pengimejan terperinci yang menggunakan medan magnet dan gelombang radio untuk membuat gambar organ.',
              ctScan: 'Imbasan CT',
              ctScanDescription:
                  'X-ray lanjutan yang mengambil gambar terperinci organ dan struktur di dalam badan anda.',
                colonoscopy: 'Kolonoskopi',
                colonoscopyDescription:
                  'Pemeriksaan usus besar untuk mengesan keabnormalan dan melakukan pemeriksaan kanser.',
              echocardiogram: 'Ekokardiogram',
               echocardiogramDescription:
                  'Ujian ultrasound yang memeriksa struktur dan fungsi jantung anda.',
               stressTest: 'Ujian Tekanan',
              stressTestDescription:
                  'Mengukur prestasi jantung anda semasa aktiviti fizikal.',
               mammogram: 'Mamogram',
               mammogramDescription:
                  'Pengimejan X-ray payudara yang digunakan untuk menyaring kanser payudara.',
               endoscopy: 'Endoskopi',
                endoscopyDescription:
                  'Prosedur untuk memeriksa bahagian dalam saluran penghadaman anda.',
               testNotFound: 'Ujian tidak ditemui',
                learnMore: 'Ketahui lebih lanjut: ',
                concernedXrayTitle: 'Risau tentang pendedahan sinar-X?',
                askAugustAITitle: 'Tanya <b>August AI</b> secara peribadi.',
            },
           tl: {
                title: 'Mga Pagsusuri at Pamamaraan',
                description:
                  'Maghanap ng detalyadong impormasyon tungkol sa mga medikal na pagsusuri at pamamaraan, kabilang ang kung ano ang aasahan at kung paano maghanda.',
                searchPlaceholder: 'Maghanap ng mga pagsusuri at pamamaraan...',
               browseByLetter: 'Mag-browse ayon sa Letra',
               noTestsFound: (letter) =>
                  `Walang mga pagsusuri na natagpuan na nagsisimula sa '${letter.toUpperCase()}'`,
                tryAnother:
                  'Pakisubukan ang isa pang letra o gamitin ang function ng paghahanap.',
               home: 'Tahanan',
               originalSource: 'Orihinal na pinagmulan: ',
               commonTestsTitle: 'Mga Karaniwang Pagsusuri at Pamamaraan',
               commonTestsDescription:
                  'Maghanap ng detalyadong impormasyon tungkol sa mga medikal na pagsusuri at pamamaraan na madalas isinasagawa.',
                completeBloodCount: 'Kumpletong Bilang ng Dugo (CBC)',
                completeBloodCountDescription:
                  'Sinusukat ang iba\'t ibang bahagi ng iyong dugo, kabilang ang mga pulang selula ng dugo at puting selula ng dugo.',
                mriScan: 'MRI Scan',
                 mriScanDescription:
                  'Detalyadong pagsusuri sa pag-imaging na gumagamit ng magnetic field at radio wave upang makalikha ng mga larawan ng mga organ.',
                 ctScan: 'CT Scan',
              ctScanDescription:
                  'Advanced na X-ray na kumukuha ng mga detalyadong imahe ng mga organ at istruktura sa loob ng iyong katawan.',
                 colonoscopy: 'Colonoscopy',
              colonoscopyDescription:
                  'Pagsusuri sa malaking bituka para sa mga abnormalidad at pagsasagawa ng mga pagsusuri sa kanser.',
               echocardiogram: 'Echocardiogram',
               echocardiogramDescription:
                  'Ultrasound test na sumusuri sa istruktura at function ng iyong puso.',
               stressTest: 'Stress Test',
              stressTestDescription:
                  'Sinusukat kung paano gumagana ang iyong puso sa panahon ng pisikal na aktibidad.',
               mammogram: 'Mammogram',
               mammogramDescription:
                  'X-ray imaging ng suso na ginagamit upang mag-screen para sa kanser sa suso.',
              endoscopy: 'Endoscopy',
             endoscopyDescription:
                  'Pamamaraan upang suriin ang loob ng iyong digestive tract.',
               testNotFound: 'Hindi nahanap ang test',
               learnMore: 'Matuto pa: ',
               concernedXrayTitle: 'Nag-aalala tungkol sa pagkakalantad sa X-ray?',
               askAugustAITitle: 'Magtanong sa <b>August AI</b> nang pribado.',
            },
           bn: {
                title: 'পরীক্ষা এবং পদ্ধতি',
                description:
                  'কি আশা করা যায় এবং কীভাবে প্রস্তুতি নিতে হয় সহ চিকিৎসা পরীক্ষা এবং পদ্ধতি সম্পর্কে বিস্তারিত তথ্য সন্ধান করুন।',
                searchPlaceholder: 'পরীক্ষা এবং পদ্ধতি অনুসন্ধান করুন...',
               browseByLetter: 'অক্ষর দ্বারা ব্রাউজ করুন',
               noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}' অক্ষর দিয়ে শুরু হওয়া কোনো পরীক্ষা পাওয়া যায়নি`,
                tryAnother:
                  'অনুগ্রহ করে অন্য একটি অক্ষর চেষ্টা করুন বা অনুসন্ধান ফাংশন ব্যবহার করুন।',
               home: 'হোম',
               originalSource: 'মূল উৎস: ',
               commonTestsTitle: 'সাধারণ পরীক্ষা এবং পদ্ধতি',
               commonTestsDescription:
                  'প্রায়শই সঞ্চালিত চিকিৎসা পরীক্ষা এবং পদ্ধতি সম্পর্কে বিস্তারিত তথ্য খুঁজুন।',
                completeBloodCount: 'সম্পূর্ণ রক্ত ​​গণনা (সিবিসি)',
              completeBloodCountDescription:
                  'লাল এবং সাদা রক্ত কোষ সহ আপনার রক্তের বিভিন্ন উপাদান পরিমাপ করে।',
                 mriScan: 'এমআরআই স্ক্যান',
                mriScanDescription:
                  'বিস্তারিত ইমেজিং পরীক্ষা যা অঙ্গগুলির ছবি তৈরি করতে চৌম্বক ক্ষেত্র এবং রেডিও তরঙ্গ ব্যবহার করে।',
                 ctScan: 'সিটি স্ক্যান',
               ctScanDescription:
                  'উন্নত এক্স-রে যা আপনার শরীরের ভিতরের অঙ্গ এবং কাঠামোগুলির বিস্তারিত ছবি তোলে।',
              colonoscopy: 'কলোনোস্কোপি',
              colonoscopyDescription:
                  'অস্বাভাবিকতা সনাক্ত করতে এবং ক্যান্সার স্ক্রীনিং করার জন্য বৃহৎ অন্ত্রের পরীক্ষা।',
                echocardiogram: 'ইকোকার্ডিওগ্রাম',
              echocardiogramDescription:
                  'আল্ট্রাসাউন্ড পরীক্ষা যা আপনার হৃদয়ের গঠন এবং কার্যকারিতা পরীক্ষা করে।',
               stressTest: 'স্ট্রেস টেস্ট',
               stressTestDescription:
                  'শারীরিক কার্যকলাপের সময় আপনার হৃদস্পন্দন কেমন কাজ করে তা পরিমাপ করে।',
                mammogram: 'ম্যামোগ্রাম',
               mammogramDescription:
                  'স্তন ক্যান্সারের স্ক্রীনিংয়ের জন্য ব্যবহৃত স্তনের এক্স-রে ইমেজিং।',
                endoscopy: 'এন্ডোস্কোপি',
                endoscopyDescription:
                  'আপনার পাচনতন্ত্রের অভ্যন্তরভাগ পরীক্ষা করার পদ্ধতি।',
                testNotFound: 'পরীক্ষা পাওয়া যায়নি',
                 learnMore: 'আরও জানুন: ',
                 concernedXrayTitle: 'এক্স-রে এক্সপোজার নিয়ে উদ্বিগ্ন?',
                 askAugustAITitle: '<b>August AI</b> কে ব্যক্তিগতভাবে জিজ্ঞাসা করুন।',
            },
           ur: {
            title: 'ٹیسٹ اور طریقہ کار',
            description:
              'طبی ٹیسٹوں اور طریقہ کار کے بارے میں تفصیلی معلومات تلاش کریں، بشمول کیا توقع کی جائے اور کیسے تیاری کی جائے۔',
            searchPlaceholder: 'ٹیسٹ اور طریقہ کار تلاش کریں...',
            browseByLetter: 'حروف تہجی کے لحاظ سے براؤز کریں',
            noTestsFound: (letter) =>
              `کوئی ٹیسٹ نہیں ملا جو '${letter.toUpperCase()}' سے شروع ہوتا ہو۔`,
            tryAnother: 'براہ کرم کوئی اور حرف آزمائیں یا تلاش فنکشن استعمال کریں۔',
            home: 'ہوم',
             originalSource: 'اصل ماخذ: ',
            commonTestsTitle: 'عام ٹیسٹ اور طریقہ کار',
             commonTestsDescription:
              'عام طور پر کیے جانے والے طبی ٹیسٹوں اور طریقہ کار کے بارے میں تفصیلی معلومات تلاش کریں۔',
            completeBloodCount: 'مکمل بلڈ کاؤنٹ (سی بی سی)',
            completeBloodCountDescription:
              'آپ کے خون کے مختلف اجزاء کی پیمائش کرتا ہے، بشمول سرخ اور سفید خون کے خلیات۔',
            mriScan: 'ایم آر آئی اسکین',
            mriScanDescription:
              'تفصیلی امیجنگ ٹیسٹ جو اعضاء کی تصاویر بنانے کے لیے مقناطیسی فیلڈز اور ریڈیو لہروں کا استعمال کرتا ہے۔',
            ctScan: 'سی ٹی اسکین',
            ctScanDescription:
              'جدید ترین ایکسرے جو آپ کے جسم کے اندر اعضاء اور ڈھانچے کی تفصیلی تصاویر لیتا ہے۔',
            colonoscopy: 'Colonoscopy',
            colonoscopyDescription:
              'بڑی آنت کا معائنہ بے قاعدگیوں کا پتہ لگانے اور کینسر کی اسکریننگ کرنے کے لیے۔',
            echocardiogram: 'ایکوکارڈیوگرام',
            echocardiogramDescription:
              'الٹراساؤنڈ ٹیسٹ جو آپ کے دل کی ساخت اور فعل کی جانچ کرتا ہے۔',
            stressTest: 'سٹریس ٹیسٹ',
            stressTestDescription:
              'پیمائش کرتا ہے کہ آپ کا دل جسمانی سرگرمی کے دوران کیسا کام کرتا ہے۔',
             mammogram: 'میموگرام',
            mammogramDescription:
              'چھاتی کا ایکسرے امیجنگ چھاتی کے کینسر کی اسکریننگ کے لیے استعمال کیا جاتا ہے۔',
              endoscopy: 'Endoscopy',
            endoscopyDescription:
              'آپ کے نظام انہضام کے اندرونی حصے کی جانچ کرنے کا طریقہ کار۔',
            testNotFound: 'ٹیسٹ نہیں ملا',
             learnMore: 'مزید جانیں: ',
             concernedXrayTitle: 'ایکس رے کی نمائش کے بارے میں فکر مند؟',
             askAugustAITitle: '<b>August AI</b> سے نجی طور پر پوچھیں۔',
            },
            ta: {
                title: 'சோதனைகள் மற்றும் நடைமுறைகள்',
                description:
                  'மருத்துவ பரிசோதனைகள் மற்றும் நடைமுறைகள் பற்றிய விரிவான தகவல்களைக் கண்டறியவும், எதிர்பார்க்க வேண்டியவை மற்றும் எவ்வாறு தயாராவது என்பது உட்பட.',
                searchPlaceholder: 'சோதனைகள் மற்றும் நடைமுறைகள் தேடவும்...',
                browseByLetter: 'எழுத்தைப் பயன்படுத்தி தேடவும்',
                noTestsFound: (letter) => `'${letter.toUpperCase()}' என்ற எழுத்தில் தொடங்கும் சோதனைகள் எதுவும் கிடைக்கவில்லை`,
                tryAnother: 'வேறு எழுத்தை முயற்சிக்கவும் அல்லது தேடல் வசதியைப் பயன்படுத்தவும்.',
                home: 'முகப்பு',
                originalSource: 'மூல ஆதாரம்: ',
                commonTestsTitle: 'மிகவும் பரிசோதனைகள் மற்றும் நடைமுறைகள்',
                commonTestsDescription:
                  'அடிக்கடி செய்யக்கூடிய மருத்துவ பரிசோதனைகள் மற்றும் நடைமுறைகள் பற்றிய விரிவான தகவல்களைக் கண்டறியவும்.',
                completeBloodCount: 'முழுமையான இரத்த எண்ணிக்கை (சிபிசி)',
                completeBloodCountDescription:
                  'சிவப்பு மற்றும் வெள்ளை இரத்த அணுக்கள் உட்பட உங்கள் இரத்தத்தின் பல்வேறு கூறுகளை அளவிடுகிறது.',
                mriScan: 'எம்ஆர்ஐ ஸ்கேன்',
                mriScanDescription:
                  'உறுப்புகளின் படங்களை உருவாக்க காந்தப்புலங்களையும் கதிரியக்க அலைகளையும் பயன்படுத்தும் விரிவான இமேஜிங் சோதனை.',
                ctScan: 'சிடி ஸ்கேன்',
                ctScanDescription:
                  'உங்கள் உடலுக்குள் உள்ள உறுப்புகள் மற்றும் கட்டமைப்புகளின் விரிவான படங்களை எடுக்கும் மேம்பட்ட எக்ஸ்-ரே.',
                colonoscopy: 'பெருங்குடல் ஆய்வு',
                colonoscopyDescription:
                  'குடல் பெருங்குடல் அசாதாரணங்கள் மற்றும் புற்றுநோய் பரிசோதனைகளை கண்டறிய.',
                echocardiogram: 'எக்கோ கார்டியோகிராம்',
                echocardiogramDescription:
                  'உங்கள் இதயத்தின் அமைப்பு மற்றும் செயல்பாட்டைச் சரிபார்க்கும் அல்ட்ராசவுண்ட் சோதனை.',
                stressTest: 'அழுத்த சோதனை',
                stressTestDescription:
                  'உடல் செயல்பாடுகளின் போது உங்கள் இதயம் எவ்வாறு செயல்படுகிறது என்பதை அளவிடுகிறது.',
                mammogram: 'மேமோகிராம்',
                mammogramDescription:
                  'மார்பக புற்றுநோய்க்கான சோதனையாகப் பயன்படுத்தப்படும் மார்பகத்தின் எக்ஸ்-ரே படங்கள்.',
                endoscopy: 'எண்டோஸ்கோபி',
                endoscopyDescription: 'உங்கள் செரிமானப் பாதையின் உட்புறத்தை ஆராய்வதற்கான செயல்முறை.',
                testNotFound: 'சோதனை கிடைக்கவில்லை',
                learnMore: 'மேலும் அறிக: ',
              },
              te: {
                title: 'పరీక్షలు మరియు విధానాలు',
                description:
                  'వైద్య పరీక్షలు మరియు విధానాల గురించి, ఏమి ఆశించాలో మరియు ఎలా సిద్ధం చేయాలో సహా వివరణాత్మక సమాచారాన్ని కనుగొనండి.',
                searchPlaceholder: 'పరీక్షలు మరియు విధానాలను శోధించండి...',
                browseByLetter: 'అక్షరం ద్వారా బ్రౌజ్ చేయండి',
                noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}'తో ప్రారంభమయ్యే పరీక్షలు కనుగొనబడలేదు`,
                tryAnother:
                  'దయచేసి వేరే అక్షరాన్ని ప్రయత్నించండి లేదా శోధన ఫంక్షన్‌ను ఉపయోగించండి.',
                home: 'హోమ్',
                originalSource: 'అసలు మూలం: ',
                commonTestsTitle: 'సాధారణ పరీక్షలు మరియు విధానాలు',
                commonTestsDescription:
                  'తరచుగా నిర్వహించే వైద్య పరీక్షలు మరియు విధానాల గురించి వివరణాత్మక సమాచారాన్ని కనుగొనండి.',
                completeBloodCount: 'పూర్తి రక్త గణన (CBC)',
                completeBloodCountDescription:
                  'ఎర్ర మరియు తెల్ల రక్త కణాలతో సహా మీ రక్తం యొక్క వివిధ భాగాలను కొలుస్తుంది.',
                mriScan: 'MRI స్కాన్',
                mriScanDescription:
                  'అవయవాల చిత్రాలను రూపొందించడానికి అయస్కాంత క్షేత్రాలు మరియు రేడియో తరంగాలను ఉపయోగించే వివరణాత్మక ఇమేజింగ్ పరీక్ష.',
                ctScan: 'CT స్కాన్',
                ctScanDescription:
                  'మీ శరీరం లోపల అవయవాలు మరియు నిర్మాణాల వివరణాత్మక చిత్రాలను తీసే అధునాతన ఎక్స్-రే.',
                colonoscopy: 'పెద్దప్రేగు శోధన పరీక్ష',
                colonoscopyDescription:
                  'అసాధారణతలను గుర్తించడానికి మరియు క్యాన్సర్ స్క్రీనింగ్ చేయడానికి పెద్ద ప్రేగు యొక్క పరీక్ష.',
                echocardiogram: 'ఎకోకార్డియోగ్రామ్',
                echocardiogramDescription:
                  'మీ గుండె నిర్మాణం మరియు పనితీరును తనిఖీ చేసే అల్ట్రాసౌండ్ పరీక్ష.',
                stressTest: 'ఒత్తిడి పరీక్ష',
                stressTestDescription: 'శారీరక శ్రమ సమయంలో మీ గుండె ఎలా పనిచేస్తుందో కొలుస్తుంది.',
                mammogram: 'మామోగ్రామ్',
                mammogramDescription:
                  'రొమ్ము క్యాన్సర్‌ను గుర్తించడానికి ఉపయోగించే రొమ్ము యొక్క ఎక్స్-రే ఇమేజింగ్.',
                endoscopy: 'ఎండోస్కోపీ',
                endoscopyDescription: 'మీ జీర్ణ వాహిక లోపలి భాగాన్ని పరిశీలించడానికి చేసే ప్రక్రియ.',
                testNotFound: 'పరీక్ష కనుగొనబడలేదు',
                learnMore: 'మరింత తెలుసుకోండి: ',
                concernedXrayTitle: 'ఎక్స్-రే బహిర్గతం గురించి ఆందోళన?',
                askAugustAITitle: '<b>August AI</b> ని గోప్యంగా అడగండి.',
              },
              mr: {
                title: 'चाचण्या आणि प्रक्रिया',
                description:
                  'काय अपेक्षित आहे आणि तयारी कशी करावी यासह वैद्यकीय चाचण्या आणि प्रक्रियांबद्दल तपशीलवार माहिती मिळवा.',
                searchPlaceholder: 'चाचण्या आणि प्रक्रिया शोधा...',
                browseByLetter: 'अक्षराने ब्राउझ करा',
                noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}' ने सुरू होणारी कोणतीही चाचणी आढळली नाही`,
                tryAnother:
                  'कृपया दुसरे अक्षर वापरून पहा किंवा शोध कार्य वापरा.',
                 home: 'मुख्यपृष्ठ',
                originalSource: 'मूळ स्त्रोत: ',
                commonTestsTitle: 'सामान्य चाचण्या आणि प्रक्रिया',
                commonTestsDescription:
                  'वारंवार केल्या जाणाऱ्या वैद्यकीय चाचण्या आणि प्रक्रियांबद्दल तपशीलवार माहिती मिळवा.',
                 completeBloodCount: 'संपूर्ण रक्त गणना (CBC)',
                completeBloodCountDescription:
                  'लाल आणि पांढऱ्या रक्त पेशींसह तुमच्या रक्तातील विविध घटकांचे मोजमाप करते.',
                mriScan: 'एमआरआय स्कॅन',
                mriScanDescription:
                  'अवयवांची चित्रे तयार करण्यासाठी चुंबकीय क्षेत्र आणि रेडिओ लहरींचा वापर करणारे तपशीलवार इमेजिंग चाचणी.',
                ctScan: 'सीटी स्कॅन',
                ctScanDescription:
                  'प्रगत एक्स-रे जे तुमच्या शरीरातील अवयव आणि रचनांची तपशीलवार चित्रे घेते.',
                colonoscopy: 'कोलोनोस्कोपी',
                colonoscopyDescription:
                  'असामान्यते शोधण्यासाठी आणि कर्करोगाची तपासणी करण्यासाठी मोठ्या आतड्याची तपासणी.',
                echocardiogram: 'इकोकार्डियोग्राम',
                echocardiogramDescription:
                  'अल्ट्रासाऊंड चाचणी जी तुमच्या हृदयाची रचना आणि कार्य तपासते.',
                stressTest: 'ताण चाचणी',
                stressTestDescription:
                  'शारीरिक हालचाली दरम्यान तुमचे हृदय कसे कार्य करते याचे मोजमाप करते.',
                mammogram: 'स्तनाचा एक्स-रे',
                mammogramDescription:
                  'स्तनाचा कर्करोग तपासण्यासाठी वापरले जाणारे स्तनाचे एक्स-रे इमेजिंग.',
                endoscopy: 'एंडोस्कोपी',
                endoscopyDescription: 'तुमच्या पचनमार्गाच्या आतल्या भागाची तपासणी करण्याची प्रक्रिया.',
                testNotFound: 'चाचणी आढळली नाही',
                 learnMore: 'अधिक जाणून घ्या: ',
                 concernedXrayTitle: 'एक्स-रे प्रदर्शनाबद्दल काळजीत आहात?',
                 askAugustAITitle: '<b>August AI</b> ला खाजगीरित्या विचारा.',
              },
                gu: {
                  title: 'પરીક્ષણો અને પ્રક્રિયાઓ',
                  description:
                    'તબીબી પરીક્ષણો અને પ્રક્રિયાઓ વિશે વિગતવાર માહિતી મેળવો, જેમાં શું અપેક્ષા રાખવી અને કેવી રીતે તૈયારી કરવી તે શામેલ છે.',
                  searchPlaceholder: 'પરીક્ષણો અને પ્રક્રિયાઓ શોધો...',
                   browseByLetter: 'અક્ષર દ્વારા બ્રાઉઝ કરો',
                  noTestsFound: (letter) =>
                    `કોઈપણ પરીક્ષણો '${letter.toUpperCase()}' થી શરૂ થતા નથી`,
                  tryAnother:
                    'કૃપા કરીને અન્ય અક્ષર અજમાવો અથવા શોધ કાર્યનો ઉપયોગ કરો.',
                  home: 'હોમ',
                  originalSource: 'મૂળ સ્ત્રોત: ',
                  commonTestsTitle: 'સામાન્ય પરીક્ષણો અને પ્રક્રિયાઓ',
                  commonTestsDescription:
                    'વારંવાર કરવામાં આવતા તબીબી પરીક્ષણો અને પ્રક્રિયાઓ વિશે વિગતવાર માહિતી મેળવો.',
                  completeBloodCount: 'સંપૂર્ણ રક્ત ગણતરી (CBC)',
                  completeBloodCountDescription:
                    'લાલ અને સફેદ રક્ત કોશિકાઓ સહિત તમારા લોહીના વિવિધ ઘટકોને માપે છે.',
                  mriScan: 'એમઆરઆઈ સ્કેન',
                  mriScanDescription:
                    'વિગતવાર ઇમેજિંગ પરીક્ષણ જે અંગોના ચિત્રો બનાવવા માટે ચુંબકીય ક્ષેત્રો અને રેડિયો તરંગોનો ઉપયોગ કરે છે.',
                  ctScan: 'સીટી સ્કેન',
                  ctScanDescription:
                    'અદ્યતન એક્સ-રે જે તમારા શરીરની અંદરના અંગો અને માળખાના વિગતવાર ચિત્રો લે છે.',
                  colonoscopy: 'કોલોનોસ્કોપી',
                  colonoscopyDescription:
                    'અસામાન્યતા શોધવા અને કેન્સર સ્ક્રીનીંગ કરવા માટે મોટા આંતરડાની તપાસ.',
                  echocardiogram: 'ઇકોકાર્ડિયોગ્રામ',
                  echocardiogramDescription:
                    'અલ્ટ્રાસાઉન્ડ ટેસ્ટ જે તમારા હૃદયની રચના અને કાર્યને તપાસે છે.',
                  stressTest: 'સ્ટ્રેસ ટેસ્ટ',
                  stressTestDescription:
                    'શારીરિક પ્રવૃત્તિ દરમિયાન તમારું હૃદય કેવી રીતે કાર્ય કરે છે તે માપે છે.',
                  mammogram: 'મેમોગ્રામ',
                  mammogramDescription:
                    'સ્તન કેન્સરની તપાસ માટે વપરાતી સ્તનની એક્સ-રે ઇમેજિંગ.',
                  endoscopy: 'એન્ડોસ્કોપી',
                 endoscopyDescription:
                    'તમારા પાચનતંત્રની અંદરની તપાસ કરવાની પ્રક્રિયા.',
                   testNotFound: 'પરીક્ષણ મળ્યું નથી',
                   learnMore: 'વધુ જાણો: ',
                   concernedXrayTitle: 'એક્સ-રે એક્સપોઝર વિશે ચિંતિત?',
                   askAugustAITitle: '<b>August AI</b> ને ખાનગી રીતે પૂછો.',
                },
               kn: {
                 title: 'ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಕಾರ್ಯವಿಧಾನಗಳು',
                description:
                  'ಏನು ನಿರೀಕ್ಷಿಸಬೇಕೆಂದು ಮತ್ತು ಹೇಗೆ ಸಿದ್ಧಪಡಿಸಬೇಕೆಂದು ಒಳಗೊಂಡಂತೆ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಕಾರ್ಯವಿಧಾನಗಳ ಬಗ್ಗೆ ವಿವರವಾದ ಮಾಹಿತಿಯನ್ನು ಹುಡುಕಿ.',
                searchPlaceholder: 'ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಕಾರ್ಯವಿಧಾನಗಳನ್ನು ಹುಡುಕಿ...',
                browseByLetter: 'ಅಕ್ಷರದ ಮೂಲಕ ಬ್ರೌಸ್ ಮಾಡಿ',
                noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}' ನಿಂದ ಪ್ರಾರಂಭವಾಗುವ ಯಾವುದೇ ಪರೀಕ್ಷೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ`,
                 tryAnother:
                  'ದಯವಿಟ್ಟು ಇನ್ನೊಂದು ಅಕ್ಷರವನ್ನು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಹುಡುಕಾಟ ಕಾರ್ಯವನ್ನು ಬಳಸಿ.',
                home: 'ಮುಖಪುಟ',
                originalSource: 'ಮೂಲ ಆಕರ: ',
                commonTestsTitle: 'ಸಾಮಾನ್ಯ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಕಾರ್ಯವಿಧಾನಗಳು',
                commonTestsDescription:
                  'ಸಾಮಾನ್ಯವಾಗಿ ನಡೆಸಲಾಗುವ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಕಾರ್ಯವಿಧಾನಗಳ ಬಗ್ಗೆ ವಿವರವಾದ ಮಾಹಿತಿಯನ್ನು ಹುಡುಕಿ.',
                  completeBloodCount: 'ಸಂಪೂರ್ಣ ರಕ್ತದ ಎಣಿಕೆ (ಸಿಬಿಸಿ)',
                 completeBloodCountDescription:
                   'ಕೆಂಪು ಮತ್ತು ಬಿಳಿ ರಕ್ತ ಕಣಗಳು ಸೇರಿದಂತೆ ನಿಮ್ಮ ರಕ್ತದ ವಿವಿಧ ಅಂಶಗಳನ್ನು ಅಳೆಯುತ್ತದೆ.',
                 mriScan: 'ಎಂಆರ್ಐ ಸ್ಕ್ಯಾನ್',
                mriScanDescription:
                   'ಅಂಗಗಳ ಚಿತ್ರಗಳನ್ನು ರಚಿಸಲು ಮ್ಯಾಗ್ನೆಟಿಕ್ ಫೀಲ್ಡ್‌ಗಳು ಮತ್ತು ರೇಡಿಯೋ ತರಂಗಗಳನ್ನು ಬಳಸುವ ವಿವರವಾದ ಇಮೇಜಿಂಗ್ ಪರೀಕ್ಷೆ.',
                 ctScan: 'ಸಿಟಿ ಸ್ಕ್ಯಾನ್',
                ctScanDescription:
                  'ನಿಮ್ಮ ದೇಹದೊಳಗಿನ ಅಂಗಗಳು ಮತ್ತು ರಚನೆಗಳ ವಿವರವಾದ ಚಿತ್ರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಸುಧಾರಿತ ಎಕ್ಸರೆ.',
                colonoscopy: 'ಕೊಲೊನೋಸ್ಕೋಪಿ',
                colonoscopyDescription:
                  'ಅಸಹಜತೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ಕ್ಯಾನ್ಸರ್ ಪರೀಕ್ಷೆಗಳನ್ನು ಮಾಡಲು ದೊಡ್ಡ ಕರುಳಿನ ಪರೀಕ್ಷೆ.',
                 echocardiogram: 'ಎಕೋಕಾರ್ಡಿಯೋಗ್ರಾಮ್',
                echocardiogramDescription:
                  'ನಿಮ್ಮ ಹೃದಯದ ರಚನೆ ಮತ್ತು ಕಾರ್ಯವನ್ನು ಪರೀಕ್ಷಿಸುವ ಅಲ್ಟ್ರಾಸೌಂಡ್ ಪರೀಕ್ಷೆ.',
                stressTest: 'ಒತ್ತಡ ಪರೀಕ್ಷೆ',
                stressTestDescription:
                   'ದೈಹಿಕ ಚಟುವಟಿಕೆಯ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಹೃದಯ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ಅಳೆಯುತ್ತದೆ.',
                mammogram: 'ಮ್ಯಾಮೊಗ್ರಾಮ್',
                mammogramDescription:
                   'ಸ್ತನ ಕ್ಯಾನ್ಸರ್ ಅನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಬಳಸಲಾಗುವ ಸ್ತನದ ಎಕ್ಸರೆ ಚಿತ್ರಣ.',
                endoscopy: 'ಎಂಡೋಸ್ಕೋಪಿ',
                endoscopyDescription: 'ನಿಮ್ಮ ಜೀರ್ಣಾಂಗವ್ಯೂಹದ ಒಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಲು ಒಂದು ಪ್ರಕ್ರಿಯೆ.',
                  testNotFound: 'ಪರೀಕ್ಷೆ ಕಂಡುಬಂದಿಲ್ಲ',
                learnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ: ',
                concernedXrayTitle: 'ಎಕ್ಸ್-ರೇ ಒಡ್ಡಿಕೊಳ್ಳುವಿಕೆಯ ಬಗ್ಗೆ ಚಿಂತಿತರಾಗಿದ್ದೀರಾ?',
                askAugustAITitle: '<b>August AI</b> ಯನ್ನು ಖಾಸಗಿಯಾಗಿ ಕೇಳಿ.',
              },
                pa: {
                  title: 'ਟੈਸਟ ਅਤੇ ਪ੍ਰਕਿਰਿਆਵਾਂ',
                description:
                   'ਡਾਕਟਰੀ ਜਾਂਚਾਂ ਅਤੇ ਪ੍ਰਕਿਰਿਆਵਾਂ ਬਾਰੇ ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ, ਜਿਸ ਵਿੱਚ ਕੀ ਉਮੀਦ ਕਰਨੀ ਹੈ ਅਤੇ ਕਿਵੇਂ ਤਿਆਰ ਕਰਨਾ ਹੈ ਸ਼ਾਮਲ ਹੈ।',
                   searchPlaceholder: 'ਟੈਸਟਾਂ ਅਤੇ ਪ੍ਰਕਿਰਿਆਵਾਂ ਦੀ ਖੋਜ ਕਰੋ...',
                  browseByLetter: 'ਅੱਖਰ ਦੁਆਰਾ ਬ੍ਰਾਊਜ਼ ਕਰੋ',
                  noTestsFound: (letter) =>
                    `'${letter.toUpperCase()}' ਨਾਲ ਸ਼ੁਰੂ ਹੋਣ ਵਾਲਾ ਕੋਈ ਟੈਸਟ ਨਹੀਂ ਮਿਲਿਆ`,
                  tryAnother:
                    'ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਹੋਰ ਅੱਖਰ ਅਜ਼ਮਾਓ ਜਾਂ ਖੋਜ ਫੰਕਸ਼ਨ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
                  home: 'ਮੁੱਖ',
                  originalSource: 'ਮੂਲ ਸਰੋਤ: ',
                  commonTestsTitle: 'ਆਮ ਟੈਸਟ ਅਤੇ ਪ੍ਰਕਿਰਿਆਵਾਂ',
                  commonTestsDescription:
                    'ਅਕਸਰ ਕੀਤੇ ਜਾਣ ਵਾਲੇ ਡਾਕਟਰੀ ਜਾਂਚਾਂ ਅਤੇ ਪ੍ਰਕਿਰਿਆਵਾਂ ਬਾਰੇ ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ।',
                 completeBloodCount: 'ਪੂਰਨ ਖੂਨ ਗਿਣਤੀ (CBC)',
                  completeBloodCountDescription:
                    'ਲਾਲ ਅਤੇ ਚਿੱਟੇ ਖੂਨ ਦੇ ਸੈੱਲਾਂ ਸਮੇਤ ਤੁਹਾਡੇ ਖੂਨ ਦੇ ਵੱਖ-ਵੱਖ ਹਿੱਸਿਆਂ ਨੂੰ ਮਾਪਦਾ ਹੈ।',
                  mriScan: 'ਐਮਆਰਆਈ ਸਕੈਨ',
                  mriScanDescription:
                    'ਇੱਕ ਵਿਸਤ੍ਰਿਤ ਇਮੇਜਿੰਗ ਟੈਸਟ ਜੋ ਅੰਗਾਂ ਦੀਆਂ ਤਸਵੀਰਾਂ ਬਣਾਉਣ ਲਈ ਚੁੰਬਕੀ ਖੇਤਰਾਂ ਅਤੇ ਰੇਡੀਓ ਤਰੰਗਾਂ ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ।',
                 ctScan: 'ਸੀਟੀ ਸਕੈਨ',
                  ctScanDescription:
                    'ਇੱਕ ਉੱਨਤ ਐਕਸ-ਰੇ ਜੋ ਤੁਹਾਡੇ ਸਰੀਰ ਦੇ ਅੰਦਰ ਅੰਗਾਂ ਅਤੇ ਬਣਤਰਾਂ ਦੀ ਵਿਸਤ੍ਰਿਤ ਤਸਵੀਰ ਲੈਂਦੀ ਹੈ।',
                  colonoscopy: 'ਕੋਲੋਨੋਸਕੋਪੀ',
                  colonoscopyDescription:
                    'ਅਸਧਾਰਨਤਾਵਾਂ ਦਾ ਪਤਾ ਲਗਾਉਣ ਅਤੇ ਕੈਂਸਰ ਸਕ੍ਰੀਨਿੰਗ ਕਰਨ ਲਈ ਵੱਡੀ ਆਂਦਰ ਦੀ ਜਾਂਚ।',
                   echocardiogram: 'ਈਕੋਕਾਰਡੀਓਗ੍ਰਾਮ',
                 echocardiogramDescription:
                    'ਇੱਕ ਅਲਟਰਾਸਾਊਂਡ ਟੈਸਟ ਜੋ ਤੁਹਾਡੇ ਦਿਲ ਦੀ ਬਣਤਰ ਅਤੇ ਕਾਰਜ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ।',
                  stressTest: 'ਸਟ੍ਰੈਸ ਟੈਸਟ',
                  stressTestDescription:
                    'ਮਾਪਦਾ ਹੈ ਕਿ ਸਰੀਰਕ ਗਤੀਵਿਧੀ ਦੌਰਾਨ ਤੁਹਾਡਾ ਦਿਲ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ।',
                  mammogram: 'ਮੈਮੋਗ੍ਰਾਮ',
                   mammogramDescription:
                    'ਮੈਮੋਗ੍ਰਾਮ ਮਾਦਾਵਾਂ ਦੇ ਸਤਨ ਵਿੱਚ ਕੈਂਸਰ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ ਇੱਕ ਐਕਸ-ਰੇ ਟੈਸਟ ਹੈ।',
                  endoscopy: 'ਐਂਡੋਸਕੋਪੀ',
                 endoscopyDescription:
                    'ਤੁਹਾਡੇ ਪਾਚਨ ਟ੍ਰੈਕਟ ਦੇ ਅੰਦਰਲੇ ਹਿੱਸੇ ਦੀ ਜਾਂਚ ਕਰਨ ਦੀ ਇੱਕ ਪ੍ਰਕਿਰਿਆ।',
                testNotFound: 'ਟੈਸਟ ਨਹੀਂ ਮਿਲਿਆ',
                learnMore: 'ਹੋਰ ਜਾਣੋ: ',
                concernedXrayTitle: 'ਐਕਸ-ਰੇ ਐਕਸਪੋਜਰ ਬਾਰੇ ਚਿੰਤਤ?',
                askAugustAITitle: '<b>August AI</b> ਨੂੰ ਨਿੱਜੀ ਤੌਰ \'ਤੇ ਪੁੱਛੋ।',
                },
              ne: {
                title: 'परीक्षण र प्रक्रियाहरू',
                description:
                  'के अपेक्षा गर्ने र कसरी तयारी गर्ने भन्ने सहित चिकित्सा परीक्षण र प्रक्रियाहरूको बारेमा विस्तृत जानकारी पाउनुहोस्।',
                searchPlaceholder: 'परीक्षण र प्रक्रियाहरू खोज्नुहोस्...',
                  browseByLetter: 'अक्षरद्वारा ब्राउज गर्नुहोस्',
                noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}' बाट सुरु हुने कुनै परीक्षणहरू फेला परेनन्`,
                  tryAnother:
                  'कृपया अर्को अक्षर प्रयास गर्नुहोस् वा खोजी प्रकार्य प्रयोग गर्नुहोस्।',
                home: 'होम',
                originalSource: 'मूल स्रोत: ',
                commonTestsTitle: 'सामान्य परीक्षण र प्रक्रियाहरू',
                commonTestsDescription:
                  'बारम्बार गरिने चिकित्सा परीक्षण र प्रक्रियाहरूको बारेमा विस्तृत जानकारी खोज्नुहोस्।',
                 completeBloodCount: 'पूर्ण रक्त गणना (CBC)',
                completeBloodCountDescription:
                   'रातो र सेतो रक्त कोशिकाहरू सहित तपाईंको रगतका विभिन्न घटकहरूलाई मापन गर्दछ।',
                 mriScan: 'एमआरआई स्क्यान',
                mriScanDescription:
                  'अंगहरूको चित्रहरू सिर्जना गर्न चुम्बकीय क्षेत्रहरू र रेडियो तरंगहरू प्रयोग गर्ने विस्तृत इमेजिङ परीक्षण।',
                ctScan: 'सीटी स्क्यान',
                ctScanDescription:
                   'उन्नत एक्स-रे जसले तपाईंको शरीर भित्र अंगहरू र संरचनाहरूको विस्तृत छविहरू लिन्छ।',
                 colonoscopy: 'कोलोनोस्कोपी',
               colonoscopyDescription:
                  'असामान्यतताहरू पत्ता लगाउन र क्यान्सर स्क्रीनिंग गर्न ठूलो आन्द्राको परीक्षण।',
                echocardiogram: 'इकोकार्डियोग्राम',
                echocardiogramDescription:
                 'अल्ट्रासाउन्ड परीक्षण जसले तपाईंको हृदयको संरचना र कार्य जाँच गर्दछ।',
                stressTest: 'तनाव परीक्षण',
                stressTestDescription:
                   'शारीरिक क्रियाकलापको समयमा तपाईंको हृदयले कसरी प्रदर्शन गर्दछ भनेर मापन गर्दछ।',
                mammogram: 'मेमोग्राम',
                mammogramDescription:
                  'स्तन क्यान्सरको जाँच गर्न प्रयोग गरिने स्तनको एक्स-रे इमेजिङ।',
                endoscopy: 'इन्डोस्कोपी',
                endoscopyDescription: 'तपाईंको पाचन पथको भित्री भागको परीक्षण गर्न प्रक्रिया।',
                testNotFound: 'परीक्षण फेला परेन',
                learnMore: 'थप जान्नुहोस्: ',
                concernedXrayTitle: 'एक्स-रे जोखिमको बारेमा चिन्तित?',
                askAugustAITitle: '<b>August AI</b> लाई निजी रूपमा सोध्नुहोस्।',
               },
              my: {
                title: 'စမ်းသပ်မှုများနှင့် လုပ်ထုံးလုပ်နည်းများ',
                description:
                  'ဘာကိုမျှော်လင့်ရမလဲ၊ ဘယ်လိုပြင်ဆင်ရမလဲဆိုတာအပါအဝင် ဆေးစစ်မှုများနှင့် လုပ်ထုံးလုပ်နည်းများအကြောင်း အသေးစိတ်အချက်အလက်များကို ရှာဖွေပါ။',
                searchPlaceholder: 'စမ်းသပ်မှုများနှင့် လုပ်ထုံးလုပ်နည်းများကို ရှာဖွေပါ...',
                  browseByLetter: 'အက္ခရာအလိုက် ကြည့်ရှုပါ',
                 noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}' ဖြင့် စတင်သော စမ်းသပ်မှုများ မတွေ့ပါ။`,
                tryAnother:
                  'အခြားအက္ခရာတစ်ခုကို စမ်းကြည့်ပါ သို့မဟုတ် ရှာဖွေမှု လုပ်ဆောင်ချက်ကို အသုံးပြုပါ။',
                 home: 'ပင်မစာမျက်နှာ',
                 originalSource: 'မူရင်းအရင်းအမြစ်: ',
                commonTestsTitle: 'အသုံးများသော စမ်းသပ်မှုများနှင့် လုပ်ထုံးလုပ်နည်းများ',
                commonTestsDescription:
                  'မကြာခဏပြုလုပ်သော ဆေးဘက်ဆိုင်ရာ စမ်းသပ်မှုများနှင့် လုပ်ထုံးလုပ်နည်းများအကြောင်း အသေးစိတ်အချက်အလက်များကို ရှာဖွေပါ။',
                  completeBloodCount: 'သွေးအရေအတွက် အပြည့်အစုံ (CBC)',
                completeBloodCountDescription:
                  'သွေးနီဥနှင့် သွေးဖြူဥများအပါအဝင် သင့်သွေး၏ မတူညီသောအစိတ်အပိုင်းများကို တိုင်းတာသည်။',
                 mriScan: 'MRI စကင်န်',
                mriScanDescription:
                  'အင်္ဂါအစိတ်အပိုင်းများ၏ပုံရိပ်များကို ဖန်တီးရန် သံလိုက်စက်ကွင်းများနှင့် ရေဒီယိုလှိုင်းများကို အသုံးပြုသည့် အသေးစိတ်ပုံရိပ်ဖော်စမ်းသပ်မှု။',
                ctScan: 'CT စကင်န်',
                ctScanDescription:
                  'သင်၏ခန္ဓာကိုယ်အတွင်းရှိ အင်္ဂါများနှင့် ဖွဲ့စည်းပုံများ၏ အသေးစိတ်ပုံရိပ်များကို ရိုက်ယူသော ခေတ်မီ X-ray။',
                 colonoscopy: 'ကိုလိုနိုစက္ကပီ',
                colonoscopyDescription:
                  'ပုံမှန်မဟုတ်မှုများရှိမရှိ စစ်ဆေးရန်နှင့် ကင်ဆာစစ်ဆေးမှုများပြုလုပ်ရန် အူမကြီးကို စစ်ဆေးခြင်း။',
                  echocardiogram: 'နှလုံးအယ်ကိုစကင်',
                echocardiogramDescription:
                  'သင့်နှလုံး၏ဖွဲ့စည်းပုံနှင့် လုပ်ဆောင်ချက်ကို စစ်ဆေးသည့် အာထရာဆောင်းစစ်ဆေးမှု။',
                stressTest: 'စတြေစ့်စစ်ဆေးမှု',
                stressTestDescription:
                  'ကာယလှုပ်ရှားမှုအတွင်း သင့်နှလုံးမည်သို့အလုပ်လုပ်သည်ကို တိုင်းတာသည်။',
                mammogram: 'မမ်မိုဂရမ်',
                mammogramDescription:
                  'ရင်သားကင်ဆာ ရှိမရှိ စစ်ဆေးရန်အသုံးပြုသည့် ရင်သား၏ ဓာတ်မှန်ရိုက်ခြင်း။',
                endoscopy: 'အသားအိမ်ကြည့်မှန်ပြောင်း',
                  endoscopyDescription:
                  'သင့်အစာခြေလမ်းကြောင်းအတွင်းပိုင်းကို စစ်ဆေးရန် လုပ်ထုံးလုပ်နည်း။',
                testNotFound: 'စမ်းသပ်မှု မတွေ့ရှိပါ။',
                 learnMore: 'ပိုမိုလေ့လာရန်: ',
                 concernedXrayTitle: 'X-ray ထိတွေ့မှုအတွက် စိုးရိမ်နေသလား?',
                 askAugustAITitle: '<b>August AI</b> ကို သီးသန့်မေးပါ။',
               },
                km: {
                    title: 'ការធ្វើតេស្ត និងនីតិវិធី',
                    description:
                      'ស្វែងរកព័ត៌មានលម្អិតអំពីការធ្វើតេស្ត និងនីតិវិធីវេជ្ជសាស្ត្រ រួមទាំងអ្វីដែលត្រូវរំពឹង និងរបៀបរៀបចំខ្លួន។',
                    searchPlaceholder: 'ស្វែងរកការធ្វើតេស្ត និងនីតិវិធី...',
                     browseByLetter: 'រកមើលតាមអក្សរ',
                    noTestsFound: (letter) =>
                      `មិនមានការធ្វើតេស្តណាមួយដែលចាប់ផ្តើមដោយ '${letter.toUpperCase()}' ទេ។`,
                    tryAnother:
                      'សូមសាកល្បងអក្សរផ្សេង ឬប្រើមុខងារស្វែងរក។',
                    home: 'ទំព័រដើម',
                   originalSource: 'ប្រភពដើម៖ ',
                    commonTestsTitle: 'ការធ្វើតេស្ត និងនីតិវិធីទូទៅ',
                    commonTestsDescription:
                      'ស្វែងរកព័ត៌មានលម្អិតអំពីការធ្វើតេស្ត និងនីតិវិធីវេជ្ជសាស្ត្រដែលត្រូវបានអនុវត្តជាញឹកញាប់។',
                     completeBloodCount: 'ការរាប់ឈាមពេញលេញ (CBC)',
                    completeBloodCountDescription:
                      'វាស់សមាសធាតុផ្សេងៗនៃឈាមរបស់អ្នក រួមទាំងកោសិកាឈាមក្រហម និងស។',
                    mriScan: 'ការស្កេន MRI',
                    mriScanDescription:
                      'ការធ្វើតេស្តរូបភាពលម្អិតដែលប្រើប្រាស់ដែនម៉ាញេទិក និងរលកវិទ្យុ ដើម្បីបង្កើតរូបភាពនៃសរីរាង្គ។',
                    ctScan: 'ការស្កេន CT',
                    ctScanDescription:
                      'កាំរស្មី X កម្រិតខ្ពស់ដែលថតរូបភាពលម្អិតនៃសរីរាង្គ និងរចនាសម្ព័ន្ធនៅក្នុងខ្លួនរបស់អ្នក។',
                    colonoscopy: 'ការឆ្លុះពោះវៀនធំ',
                    colonoscopyDescription:
                      'ការពិនិត្យពោះវៀនធំ ដើម្បីរកមើលភាពមិនប្រក្រតី និងធ្វើការពិនិត្យមហារីក។',
                    echocardiogram: 'អេកូសរសៃឈាមបេះដូង',
                    echocardiogramDescription:
                      'ការធ្វើតេស្តអ៊ុលត្រាសោនដែលពិនិត្យមើលរចនាសម្ព័ន្ធ និងមុខងារបេះដូងរបស់អ្នក។',
                    stressTest: 'តេស្តស្ត្រេស',
                    stressTestDescription:
                      'វាស់របៀបដែលបេះដូងរបស់អ្នកដំណើរការក្នុងពេលធ្វើសកម្មភាពរាងកាយ។',
                   mammogram: 'ការថតកាំរស្មីសុដន់',
                    mammogramDescription:
                      'រូបភាពកាំរស្មី X នៃសុដន់ដែលប្រើដើម្បីពិនិត្យរកមហារីកសុដន់។',
                    endoscopy: 'ការឆ្លុះ',
                   endoscopyDescription:
                      'នីតិវិធីដើម្បីពិនិត្យមើលផ្នែកខាងក្នុងនៃបំពង់រំលាយអាហាររបស់អ្នក។',
                    testNotFound: 'ការធ្វើតេស្តមិនត្រូវបានរកឃើញ',
                  learnMore: 'ស្វែងយល់បន្ថែម: ',
                  concernedXrayTitle: 'ខ្វល់ខ្លាចអំពីការប៉ះពាល់នឹងកាំរីអ៊ិចអេទេ?',
                  askAugustAITitle: 'សួរ <b>August AI</b> ជាឯកជន។',
                },
               si: {
                title: 'පරීක්ෂණ සහ ක්‍රියා පටිපාටි',
                 description:
                    'බලාපොරොත්තු විය යුතු දේ සහ සූදානම් වන්නේ කෙසේද යන්න ඇතුළුව වෛද්‍ය පරීක්ෂණ සහ ක්‍රියා පටිපාටි පිළිබඳ සවිස්තරාත්මක තොරතුරු සොයා ගන්න.',
                searchPlaceholder: 'පරීක්ෂණ සහ ක්‍රියා පටිපාටි සොයන්න...',
                 browseByLetter: 'අකුරෙන් පිරික්සන්න',
                 noTestsFound: (letter) =>
                  `'${letter.toUpperCase()}' වලින් ආරම්භ වන පරීක්ෂණ හමු නොවීය`,
                tryAnother:
                  'කරුණාකර වෙනත් අකුරක් උත්සාහ කරන්න හෝ සෙවුම් කාර්යය භාවිතා කරන්න.',
                home: 'මුල් පිටුව',
               originalSource: 'මුල් මූලාශ්‍රය: ',
                commonTestsTitle: 'පොදු පරීක්ෂණ සහ ක්‍රියා පටිපාටි',
                commonTestsDescription:
                  'නිතර සිදුකරන වෛද්‍ය පරීක්ෂණ සහ ක්‍රියා පටිපාටි පිළිබඳ සවිස්තරාත්මක තොරතුරු සොයා ගන්න.',
                  completeBloodCount: 'සම්පූර්ණ රුධිර ගණනය (CBC)',
                completeBloodCountDescription:
                  'රතු සහ සුදු රුධිරාණු ඇතුළුව ඔබේ රුධිරයේ විවිධ සංරචක මනිනු ලැබේ.',
                 mriScan: 'MRI ස්කෑන්',
                 mriScanDescription:
                  'අවයවවල පින්තූර සෑදීමට චුම්බක ක්ෂේත්‍ර සහ රේඩියෝ තරංග භාවිතා කරන සවිස්තරාත්මක රූප පරීක්ෂණය.',
                ctScan: 'CT ස්කෑන්',
                 ctScanDescription:
                  'ඔබේ ශරීරය තුළ ඇති අවයව සහ ව්‍යුහයන්ගේ සවිස්තරාත්මක පින්තූර ගන්නා උසස් X-ray.',
               colonoscopy: 'කොලොනොස්කොපි',
                colonoscopyDescription:
                  'අසාමාන්‍යතා සොයා බැලීම සහ පිළිකා පරීක්ෂණ සිදු කිරීම සඳහා මහා බඩවැල පරීක්ෂා කිරීම.',
                echocardiogram: 'එකෝකාඩියෝග්‍රෑම්',
                echocardiogramDescription:
                   'ඔබේ හදවතේ ව්‍යුහය සහ ක්‍රියාකාරිත්වය පරීක්ෂා කරන අල්ට්රා සවුන්ඩ් පරීක්ෂණය.',
                 stressTest: 'ආතති පරීක්ෂණය',
                stressTestDescription:
                   'ශාරීරික ක්‍රියාකාරකම් වලදී ඔබේ හදවත ක්‍රියා කරන ආකාරය මනිනු ලැබේ.',
                 mammogram: 'මැමෝග්‍රෑම්',
                mammogramDescription:
                   'පියයුරු පිළිකා සඳහා පරීක්ෂා කිරීමට භාවිතා කරන පියයුරු වල X-ray රූප.',
                endoscopy: 'එන්ඩොස්කොපි',
                endoscopyDescription:
                    'ඔබේ ආහාර ජීර්ණ පද්ධතියේ අභ්‍යන්තරය පරීක්ෂා කිරීමේ ක්‍රියා පටිපාටිය.',
                   testNotFound: 'පරීක්ෂණය හමු නොවීය',
                   learnMore: 'තව දැනගන්න: ',
                   concernedXrayTitle: 'එක්ස්-කිරණ බලපාම ගැන සැලකිලිමත්ද?',
                   askAugustAITitle: '<b>August AI</b> ට පුද්ගලිකව ඇසුවිලි කරන්න.',
                },
                ml: {
                    title: 'പരിശോധനകളും നടപടിക്രമങ്ങളും',
                    description:
                      'എന്താണ് പ്രതീക്ഷിക്കേണ്ടതെന്നും എങ്ങനെ തയ്യാറാകണമെന്നും ഉൾപ്പെടെയുള്ള മെഡിക്കൽ പരിശോധനകളെയും നടപടിക്രമങ്ങളെയും കുറിച്ചുള്ള വിശദമായ വിവരങ്ങൾ കണ്ടെത്തുക.',
                    searchPlaceholder: 'പരിശോധനകളും നടപടിക്രമങ്ങളും തിരയുക...',
                    browseByLetter: 'അക്ഷരം അനുസരിച്ച് ബ്രൗസ് ചെയ്യുക',
                    noTestsFound: (letter) =>
                      `'${letter.toUpperCase()}' എന്ന അക്ഷരത്തിൽ തുടങ്ങുന്ന പരിശോധനകൾ കണ്ടെത്തിയില്ല`,
                    tryAnother:
                      'മറ്റൊരു അക്ഷരം ശ്രമിക്കുക അല്ലെങ്കിൽ തിരയൽ ഫംഗ്ഷൻ ഉപയോഗിക്കുക.',
                    home: 'ഹോം',
                    originalSource: 'യഥാർത്ഥ ഉറവിടം: ',
                    commonTestsTitle: 'സാധാരണ പരിശോധനകളും നടപടിക്രമങ്ങളും',
                    commonTestsDescription:
                      'പതിവായി ചെയ്യുന്ന മെഡിക്കൽ പരിശോധനകളെയും നടപടിക്രമങ്ങളെയും കുറിച്ചുള്ള വിശദമായ വിവരങ്ങൾ കണ്ടെത്തുക.',
                    completeBloodCount: 'മുഴുവൻ രക്തകോശങ്ങളുടെ എണ്ണം (CBC)',
                    completeBloodCountDescription:
                      'ചുവന്ന രക്താണുക്കൾ, വെളുത്ത രക്താണുക്കൾ എന്നിവയുൾപ്പെടെ നിങ്ങളുടെ രക്തത്തിലെ വിവിധ ഘടകങ്ങളെ അളക്കുന്നു.',
                    mriScan: 'എംആർഐ സ്കാൻ',
                    mriScanDescription:
                      'അവയവങ്ങളുടെ ചിത്രങ്ങൾ സൃഷ്ടിക്കുന്നതിന് കാന്തികക്ഷേത്രങ്ങളും റേഡിയോ തരംഗങ്ങളും ഉപയോഗിക്കുന്ന വിശദമായ ഇമേജിംഗ് പരിശോധന.',
                    ctScan: 'സിടി സ്കാൻ',
                    ctScanDescription:
                      'നിങ്ങളുടെ ശരീരത്തിനുള്ളിലെ അവയവങ്ങളുടെയും ഘടനകളുടെയും വിശദമായ ചിത്രങ്ങൾ എടുക്കുന്ന ഒരു വിപുലമായ എക്സ്-റേ.',
                    colonoscopy: 'കോളനോസ്കോപ്പി',
                    colonoscopyDescription:
                      'അസാധാരണത്വങ്ങൾ കണ്ടെത്താനും കാൻസർ സ്ക്രീനിംഗ് നടത്താനും വൻകുടൽ പരിശോധന.',
                    echocardiogram: 'എക്കോകാർഡിയോഗ്രാം',
                    echocardiogramDescription:
                      'നിങ്ങളുടെ ഹൃദയത്തിന്റെ ഘടനയും പ്രവർത്തനവും പരിശോധിക്കുന്ന അൾട്രാസൗണ്ട് പരിശോധന.',
                    stressTest: 'സ്ട്രെസ് ടെസ്റ്റ്',
                    stressTestDescription:
                      'ശാരീരിക പ്രവർത്തന വേളയിൽ നിങ്ങളുടെ ഹൃദയം എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് അളക്കുന്നു.',
                    mammogram: 'മാമോഗ്രാം',
                    mammogramDescription:
                      'സ്തനാർബുദത്തിനായി സ്ക്രീൻ ചെയ്യാൻ ഉപയോഗിക്കുന്ന സ്തനത്തിന്റെ എക്സ്-റേ ഇമേജിംഗ്.',
                    endoscopy: 'എൻഡോസ്കോപ്പി',
                    endoscopyDescription: 'നിങ്ങളുടെ ദഹനനാളത്തിന്റെ ഉൾഭാഗം പരിശോധിക്കുന്നതിനുള്ള നടപടിക്രമം.',
                    testNotFound: 'പരിശോധന കണ്ടെത്തിയില്ല',
                    learnMore: 'കൂടുതലറിയുക: ',
                    concernedXrayTitle: 'എക്സ്-റേ എക്സ്പോഷര് ബന്ധപ്പെട്ട് ആശങ്കയുണ്ടോ?',
                    askAugustAITitle: '<b>August AI</b> യോട് സ്വകാര്യമായി ചോദിക്കൂ.',
                  },
                  mn: {
                    title: 'Шалгалтууд болон журам',
                    description:
                      'Эмнэлгийн шинжилгээ, журмын талаар юу хүлээх, хэрхэн бэлтгэх талаар дэлгэрэнгүй мэдээллийг олж мэдээрэй.',
                    searchPlaceholder: 'Шалгалтууд болон журмыг хайх...',
                    browseByLetter: 'Үсгээр хайх',
                    noTestsFound: (letter) =>
                      `'${letter.toUpperCase()}' үсгээр эхэлсэн шинжилгээ олдсонгүй`,
                    tryAnother: 'Өөр үсэг туршиж үзэх эсвэл хайлтын функцийг ашиглана уу.',
                    home: 'Нүүр',
                    originalSource: 'Эх сурвалж: ',
                    commonTestsTitle: 'Нийтлэг шалгалтууд болон журам',
                    commonTestsDescription:
                      'Түгээмэл хийгддэг эмнэлгийн шинжилгээ, журмын талаар дэлгэрэнгүй мэдээллийг олж мэдээрэй.',
                    completeBloodCount: 'Цусны дэлгэрэнгүй шинжилгээ (CBC)',
                    completeBloodCountDescription:
                      'Улаан, цагаан эс зэрэг цусан дахь янз бүрийн бүрэлдэхүүн хэсгүүдийг хэмждэг.',
                    mriScan: 'MRI скан',
                    mriScanDescription:
                      'Соронзон орон ба радио долгионыг ашиглан эрхтний зургийг бүтээдэг нарийвчилсан дүрслэл шинжилгээ.',
                    ctScan: 'КТ скан',
                    ctScanDescription:
                      'Таны биеийн доторх эрхтэн, бүтцийн нарийвчилсан зургийг авдаг дэвшилтэт рентген. ',
                    colonoscopy: 'Колоноскопи',
                    colonoscopyDescription:
                      'Хэвийн бус байдлыг илрүүлэх, хорт хавдрын шинжилгээ хийлгэхийн тулд бүдүүн гэдсийг шалгана.',
                    echocardiogram: 'Эхокардиограмм',
                    echocardiogramDescription:
                      'Зүрхний бүтэц, үйл ажиллагааг шалгадаг хэт авиан шинжилгээ.',
                    stressTest: 'Стрессийн тест',
                    stressTestDescription:
                      'Биеийн хүчний үед зүрх хэрхэн ажиллаж байгааг хэмждэг.',
                    mammogram: 'Маммограм',
                    mammogramDescription:
                      'Хөхний хорт хавдрыг илрүүлэхэд ашигладаг хөхний рентген зураг.',
                    endoscopy: 'Эндоскопи',
                    endoscopyDescription:
                      'Хоол боловсруулах замын дотор талыг шалгах журам.',
                    testNotFound: 'Шинжилгээ олдсонгүй',
                    learnMore: 'Дэлгэрэнгүйг: ',
                    concernedXrayTitle: 'Рентгенийн туяанд өртчих байх вий гэж санаа зовж байна уу?',
                    askAugustAITitle: '<b>August AI</b>-аас хувийн байдлаар асуугаарай.',
                  },
                  jv: {
                    title: 'Tes lan Prosedur',
                    description:
                      'Goleki informasi rinci babagan tes lan prosedur medis, kalebu apa sing bakal diarepake lan carane nyiyapake.',
                    searchPlaceholder: 'Goleki tes lan prosedur...',
                    browseByLetter: 'Telusuri miturut aksara',
                    noTestsFound: (letter) =>
                      `Ora ditemokake tes sing diwiwiti karo '${letter.toUpperCase()}'`,
                    tryAnother:
                      'Coba aksara liyane utawa gunakake fungsi telusuran.',
                    home: 'Omah',
                    originalSource: 'Sumber asli: ',
                    commonTestsTitle: 'Tes lan Prosedur Umum',
                    commonTestsDescription:
                      'Temokake informasi rinci babagan tes lan prosedur medis sing asring ditindakake.',
                    completeBloodCount: 'Cacah Getih Lengkap (CBC)',
                    completeBloodCountDescription:
                      'Ngukur macem-macem komponen getih, kalebu sel getih abang lan putih.',
                    mriScan: 'Pindai MRI',
                    mriScanDescription:
                      'Tes pencitraan rinci sing nggunakake medan magnet lan gelombang radio kanggo nggawe gambar organ.',
                    ctScan: 'Pindai CT',
                    ctScanDescription:
                      'X-ray canggih sing njupuk gambar rinci organ lan struktur ing njero awak.',
                    colonoscopy: 'Kolonoskopi',
                    colonoscopyDescription:
                      'Pemeriksaan usus gedhe kanggo ndeteksi kelainan lan nindakake skrining kanker.',
                    echocardiogram: 'Ekokardiogram',
                    echocardiogramDescription:
                      'Tes ultrasonik sing mriksa struktur lan fungsi jantung.',
                    stressTest: 'Tes Stres',
                    stressTestDescription:
                      'Ngukur kepiye jantung sampeyan nindakake sajrone aktivitas fisik.',
                    mammogram: 'Mamografi',
                    mammogramDescription:
                      'Pencitraan sinar-X saka payudara sing digunakake kanggo nyaring kanker payudara.',
                    endoscopy: 'Endoskopi',
                    endoscopyDescription:
                      'Prosedur kanggo mriksa njero saluran pencernaan.',
                    testNotFound: 'Tes ora ditemokake',
                    learnMore: 'Sinau luwih lengkap: ',
                    concernedXrayTitle: 'Kuwatir babagan paparan sinar X?',
                    askAugustAITitle: 'Takon marang <b>August AI</b> kanthi pribadi.',
                  },
                    su: {
                     title: 'Tés jeung Prosedur',
                    description:
                      'Panggihan inpormasi lengkep ngeunaan tés médis sareng prosedur, kalebet naon anu bakal diarepkeun sareng kumaha nyiapkeun.',
                    searchPlaceholder: 'Milarian tés sareng prosedur...',
                    browseByLetter: 'Pilah dumasar hurup',
                    noTestsFound: (letter) =>
                      `Teu aya tés anu dipendakan dimimitian ku '${letter.toUpperCase()}'`,
                     tryAnother:
                      'Mangga cobian hurup anu sanés atanapi anggo fungsi pamilarian.',
                    home: 'Imah',
                    originalSource: 'Sumber asli: ',
                    commonTestsTitle: 'Tés sareng Prosedur Umum',
                    commonTestsDescription:
                      'Panggihan inpormasi lengkep ngeunaan tés médis sareng prosedur anu sering dilakukeun.',
                    completeBloodCount: 'Jumlah Getih Lengkap (CBC)',
                     completeBloodCountDescription:
                      'Ngukur rupa-rupa komponén getih anjeun, kalebet sél getih beureum sareng bodas.',
                    mriScan: 'Pindai MRI',
                    mriScanDescription:
                      'Tés pencitraan lengkep anu ngagunakeun medan magnét sareng gelombang radio pikeun nyiptakeun gambar organ.',
                    ctScan: 'Pindai CT',
                    ctScanDescription:
                      'X-ray canggih anu nyandak gambar lengkep organ sareng struktur di jero awak.',
                    colonoscopy: 'Kolonoskopi',
                    colonoscopyDescription:
                      'Pamariksaan peujit badag pikeun ngadeteksi anomali sareng ngalakukeun pamariksaan kanker.',
                     echocardiogram: 'Ékokardiogram',
                    echocardiogramDescription:
                      'Tes ultrasound anu mariksa struktur sareng fungsi jantung anjeun.',
                    stressTest: 'Tés Stress',
                     stressTestDescription:
                      'Ngukur kumaha jantung anjeun ngalakukeun salami aktivitas fisik.',
                    mammogram: 'Mamogram',
                    mammogramDescription:
                      'Gambar sinar-X tina payudara anu dianggo pikeun nyaring kanker payudara.',
                     endoscopy: 'Éndoskopi',
                    endoscopyDescription:
                      'Prosedur pikeun nguji bagian jero saluran pencernaan.',
                    testNotFound: 'Tés teu kapendak',
                     learnMore: 'Diajar langkung seueur: ',
                     concernedXrayTitle: 'Hariwang ngeunaan paparan sinar X?',
                     askAugustAITitle: 'Tanya ka <b>August AI</b> sacara pribadi.',
                  },
                    sw: {
                     title: 'Uchunguzi na Taratibu',
                     description:
                      'Pata maelezo ya kina kuhusu vipimo na taratibu za kimatibabu, ikiwa ni pamoja na nini cha kutarajia na jinsi ya kujiandaa.',
                    searchPlaceholder: 'Tafuta vipimo na taratibu...',
                    browseByLetter: 'Vinjari kwa herufi',
                    noTestsFound: (letter) =>
                      `Hakuna vipimo vilivyopatikana vinavyoanzia na '${letter.toUpperCase()}'`,
                    tryAnother:
                      'Tafadhali jaribu herufi nyingine au tumia kipengele cha utafutaji.',
                    home: 'Nyumbani',
                    originalSource: 'Chanzo cha asili: ',
                    commonTestsTitle: 'Uchunguzi na Taratibu za Kawaida',
                    commonTestsDescription:
                      'Pata maelezo ya kina kuhusu vipimo na taratibu za kimatibabu zinazofanywa mara kwa mara.',
                    completeBloodCount: 'Hesabu Kamili ya Damu (CBC)',
                    completeBloodCountDescription:
                      'Hupima vipengele mbalimbali vya damu yako, ikiwa ni pamoja na chembe nyekundu na nyeupe za damu.',
                    mriScan: 'Uchunguzi wa MRI',
                    mriScanDescription:
                      'Uchunguzi wa kina wa upigaji picha ambao hutumia sehemu za sumaku na mawimbi ya redio ili kuunda picha za viungo.',
                    ctScan: 'Uchunguzi wa CT',
                    ctScanDescription:
                      'X-ray ya hali ya juu ambayo hupiga picha za kina za viungo na miundo ndani ya mwili wako.',
                    colonoscopy: 'Uchunguzi wa koloni',
                    colonoscopyDescription:
                      'Uchunguzi wa utumbo mpana ili kugundua hitilafu na kufanya uchunguzi wa saratani.',
                    echocardiogram: 'Ekokadiogramu',
                    echocardiogramDescription:
                      'Uchunguzi wa ultrasound unaoangalia muundo na utendaji wa moyo wako.',
                    stressTest: 'Uchunguzi wa Mkazo',
                    stressTestDescription:
                      'Hupima jinsi moyo wako unavyofanya kazi wakati wa mazoezi ya mwili.',
                    mammogram: 'Mammogram',
                    mammogramDescription:
                      'Upigaji picha wa X-ray wa matiti unaotumika kuchunguza saratani ya matiti.',
                    endoscopy: 'Endoscopy',
                    endoscopyDescription:
                      'Utaratibu wa kuchunguza ndani ya njia yako ya chakula.',
                      testNotFound: 'Jaribio halikupatikana',
                      learnMore: 'Jifunze zaidi: ',
                      concernedXrayTitle: 'Una wasiwasi kuhusu mfiduo wa X-ray?',
                      askAugustAITitle: 'Uliza <b>August AI</b> kwa faragha.',
                   },
                    he: {
                     title: 'בדיקות והליכים',
                     description:
                      'מצא מידע מפורט על בדיקות והליכים רפואיים, כולל למה לצפות וכיצד להתכונן.',
                    searchPlaceholder: 'חפש בדיקות והליכים...',
                    browseByLetter: 'עיין לפי אות',
                    noTestsFound: (letter) =>
                      `לא נמצאו בדיקות שמתחילות באות '${letter.toUpperCase()}'`,
                    tryAnother:
                      'נסה אות אחרת או השתמש בפונקציית החיפוש.',
                      home: 'בית',
                      originalSource: 'מקור מקורי: ',
                    commonTestsTitle: 'בדיקות והליכים נפוצים',
                    commonTestsDescription:
                      'מצא מידע מפורט על בדיקות והליכים רפואיים המבוצעים בתדירות גבוהה.',
                      completeBloodCount: 'ספירת דם מלאה (CBC)',
                    completeBloodCountDescription:
                      'מודד מרכיבים שונים בדם שלך, כולל כדוריות דם אדומות ולבנות.',
                    mriScan: 'סריקת MRI',
                     mriScanDescription:
                      'בדיקת הדמיה מפורטת המשתמשת בשדות מגנטיים ובגלי רדיו ליצירת תמונות של איברים.',
                    ctScan: 'סריקת CT',
                     ctScanDescription:
                      'צילום רנטגן מתקדם המצלם תמונות מפורטות של איברים ומבנים בתוך גופך.',
                    colonoscopy: 'קולונוסקופיה',
                    colonoscopyDescription:
                      'בדיקה של המעי הגס לאיתור חריגות ולביצוע בדיקות סרטן.',
                    echocardiogram: 'אקו לב',
                    echocardiogramDescription:
                      'בדיקת אולטרסאונד הבודקת את המבנה והתפקוד של הלב שלך.',
                    stressTest: 'בדיקת מאמץ',
                    stressTestDescription:
                      'מודד כיצד הלב שלך מתפקד במהלך פעילות גופנית.',
                    mammogram: 'ממוגרפיה',
                      mammogramDescription:
                      'הדמיית רנטגן של השד המשמשת לסינון סרטן השד.',
                    endoscopy: 'אנדוסקופיה',
                    endoscopyDescription:
                      'הליך לבדיקת החלק הפנימי של מערכת העיכול שלך.',
                    testNotFound: 'לא נמצאה בדיקה',
                    learnMore: 'למידע נוסף: ',
                    concernedXrayTitle: 'חושש מחשיפה לקרני רנטגן?',
                    askAugustAITitle: 'שאל את <b>August AI</b> באופן פרטי.',
                    },
                    fa: {
                        title: 'آزمایشات و روش‌ها',
                      description:
                        'اطلاعات دقیقی در مورد آزمایشات و روش‌های پزشکی، از جمله انتظارات و نحوه آماده شدن، بیابید.',
                      searchPlaceholder: 'جستجوی آزمایشات و روش‌ها...',
                       browseByLetter: 'مرور بر اساس حرف',
                      noTestsFound: (letter) =>
                       `هیچ آزمایشی با شروع '${letter.toUpperCase()}' یافت نشد`,
                      tryAnother:
                        'لطفاً حرف دیگری را امتحان کنید یا از عملکرد جستجو استفاده کنید.',
                      home: 'صفحه اصلی',
                       originalSource: 'منبع اصلی: ',
                      commonTestsTitle: 'آزمایشات و روش‌های رایج',
                        commonTestsDescription:
                        'اطلاعات دقیقی در مورد آزمایشات و روش‌های پزشکی که اغلب انجام می‌شوند، بیابید.',
                        completeBloodCount: 'شمارش کامل خون (CBC)',
                        completeBloodCountDescription:
                        'اجزای مختلف خون شما، از جمله گلبول‌های قرمز و سفید را اندازه‌گیری می‌کند.',
                        mriScan: 'اسکن MRI',
                      mriScanDescription:
                        'آزمایش تصویربرداری دقیق که از میدان‌های مغناطیسی و امواج رادیویی برای ایجاد تصاویر از اندام‌ها استفاده می‌کند.',
                      ctScan: 'سی تی اسکن',
                        ctScanDescription:
                        'اشعه ایکس پیشرفته که تصاویر دقیقی از اندام‌ها و ساختارهای داخل بدن شما می‌گیرد.',
                        colonoscopy: 'کولونوسکوپی',
                        colonoscopyDescription:
                        'بررسی روده بزرگ برای تشخیص ناهنجاری‌ها و انجام غربالگری سرطان.',
                        echocardiogram: 'اکوکاردیوگرام',
                        echocardiogramDescription:
                        'تست اولتراسوند که ساختار و عملکرد قلب شما را بررسی می‌کند.',
                       stressTest: 'تست استرس',
                        stressTestDescription:
                        'اندازه می‌گیرد که قلب شما در طول فعالیت بدنی چگونه عمل می‌کند.',
                        mammogram: 'ماموگرافی',
                         mammogramDescription:
                        'تصویربرداری با اشعه ایکس از پستان که برای غربالگری سرطان پستان استفاده می‌شود.',
                       endoscopy: 'اندوسکوپی',
                       endoscopyDescription:
                        'روشی برای بررسی قسمت داخلی دستگاه گوارش شما.',
                        testNotFound: 'تستی یافت نشد',
                      learnMore: 'بیشتر بدانید: ',
                      concernedXrayTitle: 'نگران قرار گرفتن در معرض اشعه ایکس؟',
                      askAugustAITitle: 'از <b>August AI</b> به‌صورت خصوصی بپرسید.',
                    },
                   tr: {
                        title: 'Testler ve Prosedürler',
                        description:
                          'Ne beklemeniz gerektiğini ve nasıl hazırlanacağınızı da içeren tıbbi testler ve prosedürler hakkında ayrıntılı bilgi bulun.',
                        searchPlaceholder: 'Testleri ve prosedürleri ara...',
                       browseByLetter: 'Harfe göre göz at',
                        noTestsFound: (letter) =>
                          `'${letter.toUpperCase()}' ile başlayan test bulunamadı`,
                        tryAnother:
                          'Lütfen başka bir harf deneyin veya arama işlevini kullanın.',
                        home: 'Ana Sayfa',
                        originalSource: 'Orijinal kaynak: ',
                        commonTestsTitle: 'Yaygın Testler ve Prosedürler',
                        commonTestsDescription:
                          'Sık uygulanan tıbbi testler ve prosedürler hakkında ayrıntılı bilgi bulun.',
                         completeBloodCount: 'Tam Kan Sayımı (CBC)',
                       completeBloodCountDescription:
                          'Kırmızı ve beyaz kan hücreleri dahil olmak üzere kanınızın farklı bileşenlerini ölçer.',
                       mriScan: 'MRI Taraması',
                        mriScanDescription:
                          'Organların görüntülerini oluşturmak için manyetik alanlar ve radyo dalgaları kullanan ayrıntılı görüntüleme testi.',
                        ctScan: 'BT Taraması',
                        ctScanDescription:
                          'Vücudunuzun içindeki organların ve yapıların ayrıntılı görüntülerini alan gelişmiş bir X-ışınıdır.',
                       colonoscopy: 'Kolonoskopi',
                       colonoscopyDescription:
                          'Anormallikleri tespit etmek ve kanser taraması yapmak için kalın bağırsağın incelenmesi.',
                       echocardiogram: 'Ekokardiyogram',
                        echocardiogramDescription:
                          'Kalbinizin yapısını ve işlevini kontrol eden ultrason testi.',
                        stressTest: 'Stres Testi',
                       stressTestDescription:
                          'Fiziksel aktivite sırasında kalbinizin nasıl performans gösterdiğini ölçer.',
                       mammogram: 'Mamografi',
                        mammogramDescription:
                          'Meme kanseri taraması için kullanılan meme röntgeni görüntülemesi.',
                        endoscopy: 'Endoskopi',
                       endoscopyDescription:
                          'Sindirim sisteminizin içini inceleme prosedürü.',
                        testNotFound: 'Test bulunamadı',
                         learnMore: 'Daha fazla bilgi edinin: ',
                         concernedXrayTitle: 'X-ışını maruziyeti konusunda endişeli misiniz?',
                         askAugustAITitle: '<b>August AI</b>\'ye özel olarak sorun.',
                    },
                  af: {
                     title: 'Toetse en Prosedures',
                    description:
                      'Vind gedetailleerde inligting oor mediese toetse en prosedures, insluitend wat om te verwag en hoe om voor te berei.',
                    searchPlaceholder: 'Soek toetse en prosedures...',
                      browseByLetter: 'Blaai volgens letter',
                    noTestsFound: (letter) =>
                      `Geen toetse gevind wat met '${letter.toUpperCase()}' begin nie`,
                      tryAnother:
                      'Probeer asseblief \'n ander letter of gebruik die soekfunksie.',
                    home: 'Tuis',
                    originalSource: 'Oorspronklike bron: ',
                    commonTestsTitle: 'Algemene Toetse en Prosedures',
                    commonTestsDescription:
                      'Vind gedetailleerde inligting oor mediese toetse en prosedures wat gereeld uitgevoer word.',
                       completeBloodCount: 'Volledige Bloedtelling (CBC)',
                      completeBloodCountDescription:
                        'Meet verskillende komponente van jou bloed, insluitend rooi en wit bloedselle.',
                      mriScan: 'MRI-skandering',
                      mriScanDescription:
                        'Gedetailleerde beeldtoets wat magnetiese velde en radiogolwe gebruik om beelde van organe te skep.',
                     ctScan: 'CT-skandering',
                     ctScanDescription:
                        'Gevorderde X-straal wat gedetailleerde beelde neem van organe en strukture binne jou liggaam.',
                     colonoscopy: 'Kolonoskopie',
                    colonoscopyDescription:
                        'Ondersoek van die dikderm om abnormaliteite op te spoor en kankerondersoeke uit te voer.',
                     echocardiogram: 'Ekkokardiogram',
                    echocardiogramDescription:
                        'Ultrasoniese toets wat die struktuur en funksie van jou hart nagaan.',
                     stressTest: 'Strestoets',
                    stressTestDescription:
                        'Meet hoe jou hart presteer tydens fisieke aktiwiteit.',
                     mammogram: 'Mammogram',
                     mammogramDescription:
                        'X-straalbeelding van die bors wat gebruik word om vir borskanker te sif.',
                     endoscopy: 'Endoskopie',
                     endoscopyDescription:
                        'Prosedure om die binnekant van jou spysverteringskanaal te ondersoek.',
                     testNotFound: 'Toets nie gevind nie',
                      learnMore: 'Leer meer: ',
                      concernedXrayTitle: 'Besorg oor X-straalblootstelling?',
                      askAugustAITitle: 'Vra <b>August AI</b> privaat.',
                    },
                   am: {
                     title: 'ሙከራዎች እና ሂደቶች',
                    description:
                      'ምን እንደሚጠበቅ እና እንዴት መዘጋጀት እንዳለብዎ ጨምሮ ስለ ህክምና ሙከራዎች እና ሂደቶች ዝርዝር መረጃ ያግኙ።',
                    searchPlaceholder: 'ሙከራዎችን እና ሂደቶችን ይፈልጉ...',
                      browseByLetter: 'በፊደል ያስሱ',
                    noTestsFound: (letter) =>
                      `በ'${letter.toUpperCase()}' የሚጀምሩ ሙከራዎች አልተገኙም`,
                    tryAnother:
                      'እባክዎ ሌላ ፊደል ይሞክሩ ወይም የፍለጋ ተግባሩን ይጠቀሙ።',
                    home: 'ቤት',
                    originalSource: 'ዋና ምንጭ፡ ',
                    commonTestsTitle: 'የተለመዱ ሙከራዎች እና ሂደቶች',
                    commonTestsDescription:
                      'ብዙ ጊዜ ስለሚደረጉ የሕክምና ሙከራዎች እና ሂደቶች ዝርዝር መረጃ ያግኙ።',
                    completeBloodCount: 'የተሟላ የደም ብዛት (ሲቢሲ)',
                    completeBloodCountDescription:
                      'ቀይ እና ነጭ የደም ሴሎችን ጨምሮ የደምዎን የተለያዩ ክፍሎች ይለካል።',
                    mriScan: 'ኤምአርአይ ስካን',
                    mriScanDescription:
                      'የአካል ክፍሎችን ምስሎችን ለመፍጠር መግነጢሳዊ መስኮችን እና የሬዲዮ ሞገዶችን የሚጠቀም ዝርዝር የምስል ሙከራ።',
                    ctScan: 'ሲቲ ስካን',
                    ctScanDescription:
                      'በሰውነትዎ ውስጥ ያሉ የአካል ክፍሎች እና አወቃቀሮች ዝርዝር ምስሎችን የሚያነሳ የላቀ ኤክስ ሬይ።',
                    colonoscopy: 'ኮሎኖስኮፒ',
                    colonoscopyDescription:
                      'ያልተለመዱ ነገሮችን ለመለየት እና የካንሰር ምርመራዎችን ለማካሄድ የአንጀትን ምርመራ።',
                    echocardiogram: 'ኢኮካርዲዮግራም',
                    echocardiogramDescription:
                      'የልብዎን መዋቅር እና ተግባር የሚፈትሽ የአልትራሳውንድ ምርመራ።',
                    stressTest: 'የጭንቀት ሙከራ',
                    stressTestDescription:
                      'በአካላዊ እንቅስቃሴ ጊዜ ልብዎ እንዴት እንደሚሰራ ይለካል።',
                    mammogram: 'ማሞግራም',
                     mammogramDescription:
                      'የጡት ካንሰርን ለመመርመር የሚያገለግል የጡት ኤክስሬይ ምስል ነው።',
                    endoscopy: 'ኢንዶስኮፒ',
                    endoscopyDescription: 'የምግብ መፍጫ ስርዓትዎን ውስጡን ለመመርመር የሚደረግ አሰራር።',
                    testNotFound: 'ሙከራ አልተገኘም',
                     learnMore: 'ተጨማሪ ለመረዳት: ',
                     concernedXrayTitle: 'ስለ ኤክስሬይ መጋለጥ ተጨንቀዋል?',
                     askAugustAITitle: '<b>August AI</b>ን በግል ጠይቅ።',
                    },

                    so: {
                        title: 'Baaritaanno iyo Habraacyo',
                        description:
                          'Ka hel macluumaad faahfaahsan oo ku saabsan baaritaannada caafimaadka iyo habraacyada, oo ay ku jiraan waxa la filayo iyo sida loo diyaargaroobo.',
                        searchPlaceholder: 'Raadi baaritaanno iyo habraacyo...',
                        browseByLetter: 'Ku dhex baadho Warqad',
                        noTestsFound: (letter) =>
                          `Ma jiro baaritaan laga helay oo ka bilaabmaya '${letter.toUpperCase()}'`,
                        tryAnother: 'Fadlan isku day warqad kale ama isticmaal shaqada raadinta.',
                        home: 'Hoyga',
                        originalSource: 'Xigasho asalka ah: ',
                        commonTestsTitle: 'Baaritaanno iyo Habraacyo Guud',
                        commonTestsDescription:
                          'Ka hel macluumaad faahfaahsan oo ku saabsan baaritaannada iyo habraacyada caafimaad ee si joogto ah loo sameeyo.',
                        completeBloodCount: 'Tirinta Dhiigga oo Dhamaystiran (CBC)',
                        completeBloodCountDescription:
                          'Wuxuu cabbiraa qaybaha kala duwan ee dhiigaaga, oo ay ku jiraan unugyada dhiigga cas iyo kuwa cad.',
                        mriScan: 'Baaritaanka MRI',
                        mriScanDescription:
                          'Baaritaan sawireed faahfaahsan oo isticmaalaya beeraha magnetic iyo hirar raadiyaha si loo abuuro sawirro xubnaha.',
                        ctScan: 'Baaritaanka CT',
                        ctScanDescription:
                          'Raajo horumarsan oo qaada sawiro faahfaahsan oo xubnaha iyo qaab-dhismeedyada ku jira jidhkaaga.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Baaritaanka mindhicirka weyn si loo ogaado cilladaha iyo in la sameeyo baaritaannada kansarka.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Baaritaanka Ultrasound-ka kaas oo hubiya qaab-dhismeedka iyo shaqada wadnahaaga.',
                        stressTest: 'Imtixaanka Cadaadiska',
                        stressTestDescription:
                          'Wuxuu cabbiraa sida wadnahaagu u qabto inta lagu jiro dhaqdhaqaaqa jirka.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'Sawirka raajada ee naaska loo isticmaalo in lagu ogaado kansarka naasaha.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription: 'Nidaamka lagu baaro gudaha mareenkaaga dheefshiidka.',
                        testNotFound: 'Imtixaanka lama helin',
                        learnMore: 'Wax badan ka baro: ',
                        concernedXrayTitle: 'Ma ka welwelsan tahay soo-gaadhista Raajada?',
                        askAugustAITitle: 'Weydii <b>August AI</b> si gaar ah.',
                      },
                      yo: {
                         title: 'Awọn Idanwo ati Ilana',
                        description:
                          'Wa alaye ni kikun nipa awọn idanwo iṣoogun ati awọn ilana, pẹlu ohun ti o le reti ati bi o ṣe le mura.',
                        searchPlaceholder: 'Wa awọn idanwo ati awọn ilana...',
                        browseByLetter: 'Ṣawakiri nipasẹ Lẹta',
                        noTestsFound: (letter) =>
                          `Ko si awọn idanwo ti a rii ti o bẹrẹ pẹlu '${letter.toUpperCase()}'`,
                        tryAnother:
                          'Jọwọ gbiyanju lẹta miiran tabi lo iṣẹ wiwa.',
                        home: 'Ile',
                        originalSource: 'Orisun akọkọ: ',
                         commonTestsTitle: 'Awọn Idanwo ati Ilana Ti o wọpọ',
                        commonTestsDescription:
                          'Wa alaye ni kikun nipa awọn idanwo iṣoogun ati awọn ilana ti a ṣe nigbagbogbo.',
                        completeBloodCount: 'Kika Ẹjẹ Pipe (CBC)',
                        completeBloodCountDescription:
                          'Ṣe iwọn awọn paati oriṣiriṣi ti ẹjẹ rẹ, pẹlu awọn sẹẹli ẹjẹ pupa ati funfun.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Idanwo aworan alaye ti o nlo awọn aaye oofa ati awọn igbi redio lati ṣẹda awọn aworan ti awọn ara.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'X-ray ti o ni ilọsiwaju ti o ya awọn aworan alaye ti awọn ara ati awọn ẹya inu ara rẹ.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Ṣayẹwo ifun nla fun awọn ajeji ati ṣe awọn ayẹwo akàn.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Idanwo olutirasandi ti o ṣayẹwo eto ati iṣẹ ti ọkan rẹ.',
                        stressTest: 'Idanwo Ipa',
                        stressTestDescription:
                          'Ṣe iwọn bi ọkan rẹ ṣe n ṣiṣẹ lakoko iṣẹ ṣiṣe ti ara.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'X-ray aworan ti ọmu ti a lo lati ṣayẹwo fun akàn igbaya.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                          'Ilana lati ṣe ayẹwo inu apa ounjẹ rẹ.',
                        testNotFound: 'Idanwo ko ri',
                        learnMore: 'Kọ ẹkọ diẹ sii: ',
                        concernedXrayTitle: 'Ṣe o ni aniyan nipa ifihan si X-ray?',
                        askAugustAITitle: 'Beere lọ wọ <b>August AI</b> ni ikọ kọ.',
                      },
                       zu: {
                            title: 'Izivivinyo Nezinqubo',
                        description:
                            'Thola imininingwane eningiliziwe mayelana nokuhlolwa kwezokwelapha nezinqubo, okuhlanganisa nokuthi yini ongayilindela nokuthi ungazilungiselela kanjani.',
                        searchPlaceholder: 'Sesha izivivinyo nezinqubo...',
                        browseByLetter: 'Dlulisa amehlo ngencwadi',
                        noTestsFound: (letter) =>
                          `Azikho izivivinyo ezitholakele eziqala ngo-'${letter.toUpperCase()}'`,
                          tryAnother:
                          'Sicela uzame enye incwadi noma usebenzise umsebenzi wokusesha.',
                        home: 'Ikhaya',
                        originalSource: 'Umthombo wokuqala: ',
                        commonTestsTitle: 'Izivivinyo Nezinqubo Ezivamile',
                        commonTestsDescription:
                            'Thola imininingwane eningiliziwe mayelana nokuhlolwa kwezokwelapha nezinqubo ezenziwa njalo.',
                        completeBloodCount: 'Ukubalwa Okugcwele Kwegazi (CBC)',
                        completeBloodCountDescription:
                            'Ilinganisa izinto ezihlukahlukene zegazi lakho, okuhlanganisa amangqamuzana abomvu nabamhlophe egazi.',
                        mriScan: 'I-MRI Scan',
                        mriScanDescription:
                            'Ukuhlolwa kokuthwebula okuningiliziwe okusebenzisa amandla kazibuthe kanye namagagasi omsakazo ukudala izithombe zezitho zomzimba.',
                        ctScan: 'I-CT Scan',
                        ctScanDescription:
                            'I-X-ray ethuthukisiwe ethatha izithombe ezinemininingwane yezitho zomzimba kanye nezakhiwo ezingaphakathi komzimba wakho.',
                        colonoscopy: 'I-Colonoscopy',
                        colonoscopyDescription:
                            'Ukuhlolwa kwamathumbu amakhulu ukuze kutholwe ukungahambi kahle nokwenza izivivinyo zomdlavuza.',
                        echocardiogram: 'I-Echocardiogram',
                        echocardiogramDescription:
                            'Ukuhlolwa kwe-ultrasound okuhlola isakhiwo nomsebenzi wenhliziyo yakho.',
                        stressTest: 'Ukuhlolwa Kwengcindezi',
                        stressTestDescription:
                            'Ilinganisa ukuthi inhliziyo yakho isebenza kanjani ngesikhathi sokwenza umsebenzi womzimba.',
                        mammogram: 'I-Mammogram',
                        mammogramDescription:
                            'I-X-ray imaging yesifuba esetshenziselwa ukuhlola umdlavuza webele.',
                        endoscopy: 'I-Endoscopy',
                        endoscopyDescription:
                            'Inqubo yokuhlola ingaphakathi lomgudu wakho wokugaya ukudla.',
                        testNotFound: 'Ukuhlolwa akutholakalanga',
                        learnMore: 'Funda kabanzi: ',
                        concernedXrayTitle: 'Ukhathazekile ngokuchayeka emisebeni ye-X-ray?',
                        askAugustAITitle: 'Buza ku-<b>August AI</b> ngasese.',
                      },
                      ha: {
                        title: 'Gwaje-gwaje da Hanyoyi',
                        description:
                          'Nemo cikakkun bayanai game da gwaje-gwajen likita da hanyoyin aiki, gami da abin da za ku iya tsammani da yadda za ku shirya.',
                        searchPlaceholder: 'Nemo gwaje-gwaje da hanyoyin aiki...',
                        browseByLetter: 'Bincika ta Harafi',
                        noTestsFound: (letter) =>
                          `Ba a sami gwaje-gwaje da suka fara da '${letter.toUpperCase()}'`,
                        tryAnother:
                          'Da fatan za a gwada wata harafi ko amfani da aikin bincike.',
                        home: 'Gida',
                        originalSource: 'Tushen asali: ',
                         commonTestsTitle: 'Gwaje-gwaje da Hanyoyi Na gama-gari',
                        commonTestsDescription:
                          'Nemo cikakkun bayanai game da gwaje-gwajen likita da hanyoyin aiki da ake yawan yi.',
                        completeBloodCount: 'Cikakken Ƙidayar Jini (CBC)',
                        completeBloodCountDescription:
                          'Yana auna sassa daban-daban na jinin ku, gami da jajayen ƙwayoyin jini da fararen ƙwayoyin jini.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Gwaji mai zurfi wanda ke amfani da filayen maganadisu da raƙuman rediyo don ƙirƙirar hotuna na gabobin jiki.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'X-ray mai ci gaba wanda ke ɗaukar cikakkun hotuna na gabobin jiki da gine-gine a cikin jikin ku.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Binciken hanji don gano abubuwan da ba su dace ba da kuma gudanar da gwaje-gwajen cutar kansa.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Gwaji na duban dan tayi wanda ke duba tsarin da aikin zuciyar ku.',
                        stressTest: 'Gwajin Damuwa',
                        stressTestDescription:
                          'Yana auna yadda zuciyarka ke aiki yayin ayyukan motsa jiki.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'X-ray hoto na nono da ake amfani da shi don bincika cutar kansar nono.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                          'Hanyar da za a bincika cikin ciki na narkewar abinci.',
                        testNotFound: 'Ba a sami gwaji ba',
                         learnMore: 'Ƙara koyo: ',
                         concernedXrayTitle: 'Kuna damuwa game da bayyanar X-ray?',
                         askAugustAITitle: 'Tambayi <b>August AI</b> a asirce.',
                      },
                      ig: {
                          title: 'Nnwale na Usoro',
                        description:
                          'Chọta ozi zuru ezu gbasara nnwale ahụike na usoro, gụnyere ihe ị ga-atụ anya ya na otu esi akwado.',
                        searchPlaceholder: 'Chọọ nnwale na usoro...',
                        browseByLetter: 'Nyochaa site na Akwụkwọ ozi',
                         noTestsFound: (letter) =>
                          `Ọ dịghị nnwale achọtara na-amalite na '${letter.toUpperCase()}'`,
                          tryAnother:
                          'Biko gbalịa akwụkwọ ozi ọzọ ma ọ bụ jiri ọrụ nchọta.',
                        home: 'Ụlọ',
                         originalSource: 'Isi mmalite: ',
                        commonTestsTitle: 'Nnwale na Usoro A na-ahụkarị',
                        commonTestsDescription:
                          'Chọta ozi zuru ezu gbasara nnwale ahụike na usoro a na-eme ugboro ugboro.',
                        completeBloodCount: 'Ọnụọgụ Ọbara zuru oke (CBC)',
                        completeBloodCountDescription:
                          'Na-atụ ihe dị iche iche dị n\'ọbara gị, gụnyere ọbara uhie na ọbara ọcha.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Nnwale ihe onyonyo zuru ezu nke na-eji oghere magnetik na redio iji mepụta onyonyo nke akụkụ ahụ.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'X-ray dị elu nke na-ewere onyonyo zuru ezu nke akụkụ ahụ na ihe ndị dị n\'ime ahụ gị.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Nnyocha nke eriri afọ buru ibu iji chọpụta ihe ndị na-adịghị mma na ime nyocha ọrịa kansa.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Nnwale ultrasound nke na-elele nhazi na ọrụ nke obi gị.',
                        stressTest: 'Nnwale nrụgide',
                        stressTestDescription:
                          'Na-atụ otú obi gị si arụ ọrụ n\'oge mmega ahụ.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'X-ray onyonyo nke ara a na-eji enyocha ọrịa kansa ara.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                          'Usoro iji nyochaa ime akụkụ mgbari nri gị.',
                         testNotFound: 'Nnwale ahụ achọtaghị',
                         learnMore: 'Mụtakwuo: ',
                         concernedXrayTitle: 'Ị na-echegbu maka ikpughe na X-ray?',
                         askAugustAITitle: 'Jụọ <b>August AI</b> na nzuzo.',
                      },
                      rw: {
                        title: 'Ibizamiro na Gahunda',
                        description:
                          'Shakisha amakuru arambuye kubizamini by’ubuvuzi na gahunda, harimo ibyo kwitega n’uburyo bwo kwitegura.',
                        searchPlaceholder: 'Shakisha ibizamini na gahunda...',
                        browseByLetter: 'Reba ukurikije inyuguti',
                        noTestsFound: (letter) =>
                          `Nta bizamiro bibonetse bitangirira kuri '${letter.toUpperCase()}'`,
                        tryAnother:
                          'Nyamuneka gerageza indi nyuguti cyangwa ukoreshe igikorwa cyo gushakisha.',
                        home: 'Ahabanza',
                        originalSource: 'Inkomoko y\'umwimerere: ',
                        commonTestsTitle: 'Ibizamiro Bisanzwe na Gahunda',
                        commonTestsDescription:
                          'Shakisha amakuru arambuye ku bizamiro n\'imikorere y\'ubuvuzi bikunze gukorwa.',
                        completeBloodCount: 'Kubara Kw\'amaraso Kuzuye (CBC)',
                        completeBloodCountDescription:
                          'Ipima ibice bitandukanye by\'amaraso yawe, harimo uturemangingo tw\'amaraso atukura n\'umweru.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Ikizamini gishushanya cyane gikoresha imirima ya magnetiki n\'umuraba wa radio kugira ngo hashyirweho ishusho y\'ingingo.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'Ray x-ray yateye imbere ifata amashusho arambuye y\'ingingo n\'ibyubakwa imbere mu mubiri wawe.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Gusuzuma igifu kinini kugirango hamenyekane ibintu bidasanzwe no gukora isuzuma ry\'indwara ya kanseri.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Ikizamini cya ultrasound kigenzura imiterere n\'imikorere y\'umutima wawe.',
                        stressTest: 'Ikizamini cya Stress',
                        stressTestDescription:
                          'Ipima uburyo umutima wawe ukora mugihe cyo gukora imyitozo ngororamubiri.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'Amashusho ya X-ray y\'ibere akoreshwa mugusuzuma kanseri y\'ibere.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                          'Uburyo bwo gusuzuma imbere y\'imiyoboro yawe y\'igogora.',
                        testNotFound: 'Ikizamini nticyabonetse',
                        learnMore: 'Menya byinshi: ',
                        concernedXrayTitle: 'Urashaka kubaza ku gukurura X-ray?',
                        askAugustAITitle: 'Baza <b>August AI</b> mu rwego rw\'ibanga.',
                      },
                       om: {
                         title: 'Qormaata fi Tartiiba Hojii',
                        description:
                          'Odeeffannoo bal\'aa waa\'ee qormaata fayyaa fi tartiiba hojii argadhu, dabalatee waan eeggamu fi akkamitti qophaa\'uu akka qabdu.',
                        searchPlaceholder: 'Qormaata fi tartiiba hojii barbaadi...',
                        browseByLetter: 'Qubee Dubbisuun',
                        noTestsFound: (letter) =>
                          `Qormaanni qubee '${letter.toUpperCase()}' tiin jalqabu hin argamne`,
                          tryAnother:
                          'Maaloo qubee biraa yaali ykn itti fayyadamaa tooftaa barbaaduu.',
                        home: 'Garaa',
                        originalSource: 'Madda jalqabaa: ',
                        commonTestsTitle: 'Qormaata fi Tartiiba Hojii Beekamoo',
                        commonTestsDescription:
                          'Odeeffannoo bal\'aa waa\'ee qormaata fayyaa fi tartiiba hojii yeroo baay\'ee raawwatamuu argadhu.',
                          completeBloodCount: 'Lakkoofsa Dhiigaa Guutuu (CBC)',
                        completeBloodCountDescription:
                           'Gosa dhiigaa kee garaagaraa kanneen akka dhiiga diimaa fi adii ni madaala.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                            'Qormaata suuraa bal\'aa kan saaxileeydha maagneetii fi raadiyoo fayyadamuudhaan suuraa qaamotaa uumuu.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'Raajii X-ray kan guddisee suuraa bal\'aa qaamotaa fi caasaa qaama kee keessatti fudhatu.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Qorannaa mar\'imaaniin furdaa keessatti fudhatama gochaa yoo rakkoo jiru argatan akkasumas qormaata kaansarii.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Qormaata Ultrasound-ii kan caasaa fi hojii onnee keetii ilaaluu.',
                        stressTest: 'Qormaata Dhiphinaa',
                        stressTestDescription:
                          'Akkamitti onneen kee yeroo sochii qaamaa hojjettu hojjetu ni madaala.',
                          mammogram: 'Mammogram',
                        mammogramDescription:
                          'Suuraa raajii X-ray kan harmaa kan kaansarii harmaa sakatta\'uuf fayyadu.',
                          endoscopy: 'Endoscopy',
                        endoscopyDescription:
                           'Tartiiba keessa karaa madaala gootuu kee qorachuuf godhamu.',
                          testNotFound: 'Qormaanni hin argamne',
                        learnMore: 'Caalatti baradhu: ',
                        concernedXrayTitle: 'Saaxila X-ray waa\'ee yaaddofteettaa?',
                        askAugustAITitle: '<b>August AI</b> dhuunfaan gaafadhu.',
                        },
                      sn: {
                        title: 'Miedzo neMaitiro',
                        description:
                          'Tsvaga ruzivo rwakadzama nezvekuongororwa kwekurapa uye maitiro, kusanganisira zvekutarisira uye nzira yekugadzirira.',
                        searchPlaceholder: 'Tsvaga miedzo nemaitiro...',
                        browseByLetter: 'Bhrawuza neTsamba',
                        noTestsFound: (letter) =>
                          `Hapana miedzo yakawanikwa inotanga na '${letter.toUpperCase()}'`,
                          tryAnother:
                          'Ndapota edza imwe tsamba kana shandisa basa rekutsvaga.',
                        home: 'Kumba',
                        originalSource: 'Manyuko ekutanga: ',
                        commonTestsTitle: 'Miedzo Inowanzoitwa neMaitiro',
                        commonTestsDescription:
                          'Tsvaga ruzivo rwakadzama nezvekurapa uye maitiro anowanzoitwa.',
                        completeBloodCount: 'Kuverengwa Kweropa Kwakakwana (CBC)',
                        completeBloodCountDescription:
                          'Inoyera zvikamu zvakasiyana-siyana zvemuropa mako, zvinosanganisira masero matsvuku neropa jena.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Kuedzwa kwekuongorora kwakadzama kunoshandisa magineti nemasaisai eredhiyo kugadzira mifananidzo yenzvimbo dzemuviri.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'Advanced X-ray inotora mifananidzo yakadzama yenzvimbo dzemuviri nezvivakwa mukati memuviri wako.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'Kuongororwa kwematumbu makuru kuti aonekwe kusanzwisisika uye kuita kuongororwa kwekenza.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Kuedzwa kweultrasound kunotarisa chimiro uye kushanda kwemoyo wako.',
                        stressTest: 'Stress Test',
                        stressTestDescription:
                          'Inoyera kuti moyo wako unoita sei panguva yekuita maekisesaizi.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'X-ray imaging yezamu inoshandiswa kuongorora cancer yemazamu.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                          'Maitiro ekuongorora mukati meiyo nzira yako yekugaya.',
                          testNotFound: 'Muedzo hauna kuwanikwa',
                         learnMore: 'Dzidza zvimwe: ',
                         concernedXrayTitle: 'Une hanya nezve kuratidzwa kweX-ray?',
                         askAugustAITitle: 'Bvunza <b>August AI</b> muchivande.',
                      },
                        ht: {
                        title: 'Tès ak Pwosedi',
                        description:
                          'Jwenn enfòmasyon detaye sou tès ak pwosedi medikal, ki gen ladan sa pou w atann ak kijan pou prepare.',
                        searchPlaceholder: 'Chèche tès ak pwosedi...',
                        browseByLetter: 'Navige pa Lèt',
                        noTestsFound: (letter) =>
                          `Pa gen okenn tès yo jwenn ki kòmanse ak '${letter.toUpperCase()}'`,
                        tryAnother:
                          'Tanpri eseye yon lòt lèt oswa itilize fonksyon rechèch la.',
                        home: 'Akèy',
                         originalSource: 'Sous orijinal: ',
                        commonTestsTitle: 'Tès ak Pwosedi Komen',
                        commonTestsDescription:
                          'Jwenn enfòmasyon detaye sou tès ak pwosedi medikal yo fè souvan.',
                        completeBloodCount: 'Konplè San Konte (CBC)',
                        completeBloodCountDescription:
                          'Mezire diferan konpozan nan san ou, ki gen ladan selil san wouj ak blan.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Tès imaj detaye ki itilize chan mayetik ak onn radyo pou kreye foto ògàn yo.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'Yon radyografi avanse ki pran imaj detaye sou ògàn ak estrikti andedan kò ou.',
                        colonoscopy: 'Kolonoskopi',
                        colonoscopyDescription:
                          'Egzamen gwo trip la pou detekte anomali epi fè egzamen kansè.',
                        echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'Tès ultrason ki tcheke estrikti ak fonksyon kè ou.',
                        stressTest: 'Tès Estrès',
                        stressTestDescription:
                          'Mezire kijan kè ou fè pandan aktivite fizik.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'Imaj radyografi nan tete yo itilize pou fè tès depistaj kansè nan tete.',
                        endoscopy: 'Andoskopi',
                        endoscopyDescription:
                          'Pwosedi pou egzamine andedan aparèy dijestif ou.',
                        testNotFound: 'Tès pa jwenn',
                        learnMore: 'Aprann plis: ',
                        concernedXrayTitle: 'Ou gen enkyetid sou ekspozisyon X-ray?',
                        askAugustAITitle: 'Mande <b>August AI</b> nan sekrè.',
                      },
                      mi: {
                          title: 'Ngā Whakamātautau me ngā Tikanga',
                        description:
                          'Kimihia ngā mōhiohio taipitopito e pā ana ki ngā whakamātautau me ngā tikanga hauora, tae atu ki ngā mea hei tūmanako me pēhea te whakarite.',
                        searchPlaceholder: 'Rapua ngā whakamātautau me ngā tikanga...',
                        browseByLetter: 'Tirotiro mā te Pūāhua',
                        noTestsFound: (letter) =>
                          `Kāore he whakamātautau i kitea e tīmata ana ki te '${letter.toUpperCase()}'`,
                        tryAnother:
                          'Tena koa whakamātau ki tētahi atu pūāhua, ki te whakamahi rānei i te mahi rapu.',
                        home: 'Hau Kāinga',
                        originalSource: 'Puna tuatahi: ',
                        commonTestsTitle: 'Ngā Whakamātautau me ngā Tikanga Noa',
                        commonTestsDescription:
                          'Kimihia ngā mōhiohio taipitopito e pā ana ki ngā whakamātautau me ngā tikanga hauora e whakamahia nuitia ana.',
                          completeBloodCount: 'Te Tatauranga Toto Katoa (CBC)',
                        completeBloodCountDescription:
                          'Inenga ngā wāhanga rerekē o tō toto, tae atu ki ngā pūtau toto whero me ngā pūtau toto mā.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'He whakamātautau whakaahua taipitopito e whakamahi ana i ngā ārai autō me ngā ngaru reo irirangi hei hanga pikitia o ngā okana.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'He hihi-x ahumahi matatau e tango ana i ngā pikitia taipitopito o ngā okana me ngā hanganga kei roto i tō tinana.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'He tirotiro i te whēkau nui ki te kimi i ngā āhua rerekē me te whakahaere i ngā whakamātautau mate pukupuku.',
                         echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                           'He whakamātautau ultrasound e tirotiro ana i te hanganga me te mahi o tō ngākau.',
                        stressTest: 'Whakamātautau Whakawerawera',
                        stressTestDescription:
                            'Inenga te āhua o tō ngākau i te wā e korikori ana koe.',
                        mammogram: 'Mammogram',
                        mammogramDescription:
                          'Ngā whakaahua hihi-x o te u e whakamahia ana hei tirotiro mō te mate pukupuku u.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                          'He tikanga hei tirotiro i roto o tō kōpūngia.',
                         testNotFound: 'Kāore i kitea te whakamātautau',
                         learnMore: 'Ako atu anō: ',
                         concernedXrayTitle: 'He atahua koe mō te whakakitenga X-ray?',
                         askAugustAITitle: 'Pātai ki a <b>August AI</b> huna ai.',
                      },
                       haw: {
                         title: 'Nā Hoʻāʻo a me nā Hana',
                        description:
                          'E huli i ka ʻike kikoʻī e pili ana i nā hoʻāʻo lapaʻau a me nā hana, me nā mea e manaʻo ai a pehea e hoʻomākaukau ai.',
                        searchPlaceholder: 'Huli i nā hoʻāʻo a me nā hana...',
                        browseByLetter: 'Huli ma ka Huapalapala',
                         noTestsFound: (letter) =>
                           `ʻAʻohe hoʻāʻo i loaʻa e hoʻomaka ana me ka '${letter.toUpperCase()}'`,
                        tryAnother:
                          'E ʻoluʻolu e hoʻāʻo i kekahi huapalapala ʻē aʻe a i ʻole e hoʻohana i ka hana huli.',
                        home: 'Home',
                         originalSource: 'Kumu mua: ',
                        commonTestsTitle: 'Nā Hoʻāʻo a me nā Hana maʻamau',
                        commonTestsDescription:
                          'E huli i ka ʻike kikoʻī e pili ana i nā hoʻāʻo lapaʻau a me nā hana i hana pinepine ʻia.',
                           completeBloodCount: 'Ka Helu Helu Koko Piha (CBC)',
                        completeBloodCountDescription:
                          'Ana i nā ʻāpana like ʻole o kou koko, e komo pū ana me nā koko ʻulaʻula a keʻokeʻo.',
                        mriScan: 'MRI Scan',
                        mriScanDescription:
                          'Hoʻāʻo kiʻi kikoʻī e hoʻohana ana i nā māla magnetic a me nā hawewe lekiō e hana i nā kiʻi o nā mea ola.',
                        ctScan: 'CT Scan',
                        ctScanDescription:
                          'ʻO ka X-ray holomua e kiʻi ana i nā kiʻi kikoʻī o nā mea ola a me nā hale i loko o kou kino.',
                        colonoscopy: 'Colonoscopy',
                        colonoscopyDescription:
                          'ʻO ka nānā ʻana i ka ʻōpū nui no nā mea ʻino a me ka hana ʻana i nā hoʻokolohua maʻi kanesa.',
                         echocardiogram: 'Echocardiogram',
                        echocardiogramDescription:
                          'ʻO ka hoʻāʻo ultrasound e nānā ana i ka hoʻolālā a me ka hana o kou puʻuwai.',
                        stressTest: 'Hoʻāʻo Koʻikoʻi',
                        stressTestDescription:
                          'Ana i ka hana o kou puʻuwai i ka wā e hana kino ai.',
                        mammogram: 'Mammogram',
                         mammogramDescription:
                          'ʻO nā kiʻi X-ray o ka umauma i hoʻohana ʻia no ka nānā ʻana i ka maʻi kanesa o ka umauma.',
                        endoscopy: 'Endoscopy',
                        endoscopyDescription:
                            'Ke kaʻina hana e nānā i loko o kāu ʻōnaehana hoʻoheheʻe.',
                         testNotFound: 'ʻAʻole i loaʻa ka hoʻāʻo',
                         learnMore: 'E aʻo hou: ',
                         concernedXrayTitle: 'Makemake ʻoe e nīnau no ka hōʻike X-ray?',
                         askAugustAITitle: 'Nīnau iā <b>August AI</b> huna.',
                      },
                       la: {
                           title: 'Experimenta et rationes',
                        description:
                            'Reperio singula de probat medicinae et rationes, comprehendo quid exspectare et quomodo parare.',
                        searchPlaceholder: 'Quarere experimenta et rationes...',
                        browseByLetter: 'Per Litteram Browse',
                        noTestsFound: (letter) =>
                            `Nulla experimenta inventa incipiens cum '${letter.toUpperCase()}'`,
                          tryAnother:
                            'Quaeso experiri aliam litteram vel utere munus inquisitionis.',
                        home: 'Domus',
                         originalSource: 'Original source: ',
                        commonTestsTitle: 'Communia Experimenta et Rationes',
                        commonTestsDescription:
                          'Reperio singula de probat medicinae et rationes saepe peractae.',
                            completeBloodCount: 'Plena Sanguinis Comes (CBC)',
                            completeBloodCountDescription:
                              'Mensurat diversas partes sanguinis tui, inter cellulas sanguinis rubras et albas.',
                          mriScan: 'MRI Scan',
                        mriScanDescription:
                            'Testis imaginatio accurata quae campis magneticis et undis radiophonicis utitur ad imagines organorum creandas.',
                        ctScan: 'CT Scan',
                          ctScanDescription:
                             'Advanced X-ray quae imagines accuratas organorum et structurarum in corpore tuo accipit.',
                        colonoscopy: 'Colonoscopy',
                          colonoscopyDescription:
                            'Examinatio intestini crassi ad abnormitates detegendas et tentationes cancri faciendas.',
                          echocardiogram: 'Echocardiogram',
                          echocardiogramDescription:
                            'Testis ultrasound, qui structuram cordis tui et functionem eius inspicit.',
                          stressTest: 'Testis Stress',
                         stressTestDescription:
                            'Mensurat quomodo cor tuum in actione physica perficiat.',
                            mammogram: 'Mammogram',
                         mammogramDescription:
                            'Imagines X-ray mammarum ad protegendum pro cancro mammarum adhibitae.',
                            endoscopy: 'Endoscopy',
                            endoscopyDescription:
                              'Ratio ad interiorem tractus digestivorum tuorum examinandam.',
                         testNotFound: 'Testis non invenitur',
                            learnMore: 'Disce plus: ',
                            concernedXrayTitle: 'Sollicitus es de expositione X-ray?',
                            askAugustAITitle: 'Interroga <b>August AI</b> secreto.',
                       }
    };

    export default translationStrings;