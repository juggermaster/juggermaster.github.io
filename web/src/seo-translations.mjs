const rows = {
  "de": ["Jugger-Spielassistent","Jugger-Taktgeber und Steinezähler für Training und Turniere. Punkte, Sätze und Spielzeit verwalten; nach erstem Laden offline im Browser nutzbar."],
  "en": ["Jugger Game Assistant","Jugger Game Assistant for training and tournaments. Stone counter, beat timer, scores and sets; works offline after the first online load."],
  "es": ["Asistente de partidos de Jugger","Asistente de Jugger para entrenamientos y torneos. Cuenta piedras, marca el ritmo y registra puntos y sets. Funciona sin conexión tras la primera carga."],
  "fr": ["Assistant de match de Jugger","Assistant de Jugger pour entraînements et tournois : rythme, pierres, scores et sets. Utilisable hors connexion après un premier chargement en ligne."],
  "it": ["Assistente di gioco per Jugger","Assistente di Jugger per allenamenti e tornei: ritmo, pietre, punteggi e set. Utilizzabile offline dopo il primo caricamento online."],
  "pt": ["Assistente de jogo de Jugger","Assistente de Jugger para treinos e torneios: ritmo, pedras, pontos e sets. Funciona sem ligação após o primeiro carregamento online."],
  "nl": ["Jugger-wedstrijdassistent","Jugger-assistent voor trainingen en toernooien. Tel stenen, geef het ritme aan en houd punten en sets bij. Offline na de eerste keer online laden."],
  "da": ["Jugger-kampassistent","Jugger-assistent til træning og turneringer. Hold styr på sten, rytme, point og sæt. Virker offline efter første indlæsning med internet."],
  "sv": ["Jugger-matchassistent","Jugger-assistent för träning och turneringar. Räkna stenar, håll takten och följ poäng och set. Fungerar offline efter första laddningen online."],
  "fi": ["Jugger-otteluavustaja","Jugger-avustaja harjoituksiin ja turnauksiin. Kivilaskuri, rytmi, pisteet ja erät selaimessa. Toimii offline-tilassa ensimmäisen verkkolatauksen jälkeen."],
  "pl": ["Asystent meczu Juggera","Asystent Juggera na treningi i turnieje. Licznik kamieni, rytm, punkty i sety w przeglądarce. Działa offline po pierwszym wczytaniu z internetem."],
  "cs": ["Asistent hry Jugger","Asistent Juggeru pro tréninky a turnaje. Počítání kamenů, rytmus, skóre a sety v prohlížeči. Po prvním načtení online funguje i bez připojení."],
  "hu": ["Jugger-mérkőzésasszisztens","Jugger-asszisztens edzésekhez és tornákhoz. Kőszámláló, ütemjelző, pontok és szettek a böngészőben. Az első online betöltés után offline is működik."],
  "ro": ["Asistent de joc Jugger","Asistent Jugger pentru antrenamente și turnee. Numără pietrele, menține ritmul și urmărește punctele și seturile. Funcționează offline după prima încărcare online."],
  "lv": ["Jugger spēles palīgs","Jugger palīgs treniņiem un turnīriem. Akmeņu skaitītājs, ritms, punkti un seti pārlūkā. Pēc pirmās ielādes tiešsaistē darbojas arī bez interneta."],
  "lt": ["Jugger žaidimo pagalbininkas","Jugger pagalbininkas treniruotėms ir turnyrams. Akmenų skaitiklis, ritmas, taškai ir setai naršyklėje. Po pirmo įkėlimo internetu veikia ir be ryšio."],
  "ru": ["Помощник для игры в джаггер","Помощник для тренировок и турниров по джаггеру: счётчик камней, ритм, очки и сеты. Работает без интернета после первой загрузки онлайн."],
  "uk": ["Помічник для гри в джагер","Помічник для тренувань і турнірів із джагеру: лічильник каменів, ритм, очки та сети. Працює без інтернету після першого завантаження онлайн."],
  "he": ["עוזר למשחקי ג׳אגר","עוזר ג׳אגר לאימונים ולטורנירים: ספירת אבנים, קצב, נקודות ומערכות בדפדפן. פועל גם ללא אינטרנט לאחר הטעינה הראשונה עם חיבור לרשת."],
  "ja": ["ジャガー試合アシスタント","練習や大会向けのジャガー試合アシスタント。石のカウント、拍子、得点、セットをブラウザーで管理。初回オンライン読み込み後はオフラインでも利用できます。"],
  "ko": ["저거 경기 도우미","훈련과 대회를 위한 저거 경기 도우미. 브라우저에서 스톤, 박자, 점수와 세트를 관리합니다. 처음 온라인으로 불러온 뒤에는 오프라인에서도 사용할 수 있습니다."],
  "zh-Hans": ["Jugger 比赛助手","适用于训练和锦标赛的 Jugger 比赛助手。在浏览器中管理石数、节拍、得分和局数。首次联网加载完成后即可离线使用，无需安装。"],
  "zh-Hant": ["Jugger 比賽助手","適用於訓練和錦標賽的 Jugger 比賽助手。在瀏覽器中管理石數、節拍、得分和局數。首次連網載入完成後即可離線使用，無需安裝。"]
};

export const seoTexts = Object.fromEntries(Object.entries(rows).map(([language, [appAssistant, appDescription]]) => [language, {
  appAssistant, appTitle: `JUGGERMASTER – ${appAssistant}`, appDescription
}]));
