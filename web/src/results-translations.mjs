const keys = ['resultHistory', 'resultsTitle', 'emptyResults', 'archiveStorage'];
const rows = {
  de: ['Verlauf', 'Spielergebnisse', 'Noch keine abgeschlossenen Spiele.', 'Spielergebnisse werden nur in diesem Browser gespeichert. Bei vollem Speicher werden die ältesten entfernt. Gelöschte Website-Daten löschen auch den Verlauf.'],
  en: ['History', 'Match results', 'No completed matches yet.', 'Results are stored only in this browser. When storage is full, the oldest are removed. Clearing site data also clears the history.'],
  es: ['Historial', 'Resultados', 'Aún no hay partidos terminados.', 'Los resultados solo se guardan en este navegador. Si se llena el almacenamiento, se eliminan los más antiguos. Borrar los datos del sitio borra el historial.'],
  fr: ['Historique', 'Résultats des matchs', 'Aucun match terminé.', 'Les résultats sont enregistrés uniquement dans ce navigateur. Les plus anciens sont retirés si le stockage est plein. Effacer les données du site efface aussi l’historique.'],
  it: ['Cronologia', 'Risultati delle partite', 'Nessuna partita conclusa.', 'I risultati sono salvati solo in questo browser. A spazio esaurito vengono rimossi i più vecchi. Cancellare i dati del sito elimina la cronologia.'],
  pt: ['Histórico', 'Resultados dos jogos', 'Ainda não há jogos terminados.', 'Os resultados são guardados apenas neste navegador. Com o armazenamento cheio, os mais antigos são removidos. Apagar os dados do site apaga o histórico.'],
  nl: ['Geschiedenis', 'Wedstrijdresultaten', 'Nog geen voltooide wedstrijden.', 'Resultaten worden alleen in deze browser opgeslagen. Bij volle opslag worden de oudste verwijderd. Wissen van sitegegevens wist ook de geschiedenis.'],
  da: ['Historik', 'Kampresultater', 'Ingen afsluttede kampe endnu.', 'Resultater gemmes kun i denne browser. Når lageret er fuldt, fjernes de ældste. Sletning af webstedsdata sletter også historikken.'],
  sv: ['Historik', 'Matchresultat', 'Inga avslutade matcher ännu.', 'Resultaten sparas bara i denna webbläsare. När lagringen är full tas de äldsta bort. Radering av webbplatsdata raderar även historiken.'],
  fi: ['Historia', 'Ottelutulokset', 'Ei vielä päättyneitä otteluita.', 'Tulokset tallennetaan vain tähän selaimeen. Tilan täyttyessä vanhimmat poistetaan. Sivustotietojen poistaminen poistaa myös historian.'],
  pl: ['Historia', 'Wyniki meczów', 'Brak zakończonych meczów.', 'Wyniki są zapisywane tylko w tej przeglądarce. Gdy pamięć się zapełni, najstarsze są usuwane. Usunięcie danych witryny usuwa historię.'],
  cs: ['Historie', 'Výsledky zápasů', 'Zatím žádné dokončené zápasy.', 'Výsledky se ukládají pouze v tomto prohlížeči. Při zaplnění úložiště se odstraní nejstarší. Vymazání dat webu odstraní i historii.'],
  hu: ['Előzmények', 'Mérkőzéseredmények', 'Még nincs befejezett mérkőzés.', 'Az eredmények csak ebben a böngészőben tárolódnak. Ha megtelik a tárhely, a legrégebbiek törlődnek. A webhelyadatok törlése az előzményeket is törli.'],
  ro: ['Istoric', 'Rezultatele meciurilor', 'Niciun meci încheiat încă.', 'Rezultatele sunt salvate doar în acest browser. Când spațiul se umple, cele mai vechi sunt eliminate. Ștergerea datelor site-ului șterge și istoricul.'],
  lv: ['Vēsture', 'Spēļu rezultāti', 'Vēl nav pabeigtu spēļu.', 'Rezultāti tiek glabāti tikai šajā pārlūkā. Ja krātuve ir pilna, vecākie tiek dzēsti. Vietnes datu dzēšana izdzēš arī vēsturi.'],
  lt: ['Istorija', 'Rungtynių rezultatai', 'Baigtų rungtynių dar nėra.', 'Rezultatai saugomi tik šioje naršyklėje. Užpildžius saugyklą, seniausi pašalinami. Išvalius svetainės duomenis ištrinama ir istorija.'],
  ru: ['История', 'Результаты матчей', 'Завершённых матчей пока нет.', 'Результаты хранятся только в этом браузере. При заполнении хранилища удаляются самые старые. Очистка данных сайта удаляет и историю.'],
  uk: ['Історія', 'Результати матчів', 'Завершених матчів ще немає.', 'Результати зберігаються лише в цьому браузері. Коли сховище заповнене, найстаріші видаляються. Очищення даних сайту видаляє історію.'],
  he: ['היסטוריה', 'תוצאות משחקים', 'עדיין אין משחקים שהסתיימו.', 'התוצאות נשמרות רק בדפדפן זה. כשהאחסון מלא, התוצאות הישנות ביותר מוסרות. מחיקת נתוני האתר מוחקת גם את ההיסטוריה.'],
  ja: ['履歴', '試合結果', '終了した試合はまだありません。', '結果はこのブラウザーにのみ保存されます。容量がいっぱいになると古い結果から削除されます。サイトデータを削除すると履歴も消去されます。'],
  ko: ['기록', '경기 결과', '아직 종료된 경기가 없습니다.', '결과는 이 브라우저에만 저장됩니다. 저장 공간이 가득 차면 오래된 결과부터 삭제됩니다. 사이트 데이터를 지우면 기록도 삭제됩니다.'],
  'zh-Hans': ['历史', '比赛结果', '暂无已结束的比赛。', '结果仅保存在此浏览器中。存储空间满时会移除最旧的结果。清除网站数据也会清除历史。'],
  'zh-Hant': ['歷史', '比賽結果', '暫無已結束的比賽。', '結果僅儲存在此瀏覽器中。儲存空間滿時會移除最舊的結果。清除網站資料也會清除歷史。']
};
export const resultTexts = Object.fromEntries(Object.entries(rows).map(([language, values]) => [language, Object.fromEntries(keys.map((key, index) => [key, values[index]]))]));

const exportKeys = ["emailResults","csvDate","csvPoints","csvSets","resultsEmailBody","csvDownloaded","csvExportFailed"];
const exportRows = {
  "de": ["CSV per E-Mail","Datum (UTC)","Punkte","Sätze","Hier ist der Spielverlauf aus JUGGERMASTER.","CSV {file} heruntergeladen. Bitte im geöffneten Mailprogramm als Anhang hinzufügen.","CSV konnte nicht bereitgestellt werden. Bitte erneut versuchen."],
  "en": ["CSV via email","Date (UTC)","Points","Sets","Here are the match results from JUGGERMASTER.","CSV {file} downloaded. Attach it in your email app.","Could not prepare the CSV. Please try again."],
  "es": ["CSV por correo","Fecha (UTC)","Puntos","Sets","Estos son los resultados de JUGGERMASTER.","CSV {file} descargado. Adjúntalo en tu aplicación de correo.","No se pudo preparar el CSV. Inténtalo de nuevo."],
  "fr": ["CSV par e-mail","Date (UTC)","Points","Manches","Voici les résultats de JUGGERMASTER.","CSV {file} téléchargé. Ajoutez-le en pièce jointe dans votre messagerie.","Impossible de préparer le CSV. Réessayez."],
  "it": ["CSV via email","Data (UTC)","Punti","Set","Ecco i risultati di JUGGERMASTER.","CSV {file} scaricato. Allegalo nella tua app email.","Impossibile preparare il CSV. Riprova."],
  "pt": ["CSV por email","Data (UTC)","Pontos","Sets","Aqui estão os resultados do JUGGERMASTER.","CSV {file} descarregado. Anexa-o na tua aplicação de email.","Não foi possível preparar o CSV. Tenta novamente."],
  "nl": ["CSV per e-mail","Datum (UTC)","Punten","Sets","Hier zijn de wedstrijdresultaten uit JUGGERMASTER.","CSV {file} gedownload. Voeg het toe als bijlage in je mailprogramma.","CSV maken is mislukt. Probeer opnieuw."],
  "da": ["CSV via e-mail","Dato (UTC)","Point","Sæt","Her er resultaterne fra JUGGERMASTER.","CSV {file} downloadet. Vedhæft filen i dit mailprogram.","CSV kunne ikke oprettes. Prøv igen."],
  "sv": ["CSV via e-post","Datum (UTC)","Poäng","Set","Här är resultaten från JUGGERMASTER.","CSV {file} hämtad. Bifoga filen i ditt e-postprogram.","Kunde inte skapa CSV. Försök igen."],
  "fi": ["CSV sähköpostiin","Päivä (UTC)","Pisteet","Erät","Tässä ovat JUGGERMASTER-ottelutulokset.","CSV {file} ladattu. Liitä se sähköpostiviestiin.","CSV-tiedostoa ei voitu luoda. Yritä uudelleen."],
  "pl": ["CSV e-mailem","Data (UTC)","Punkty","Sety","Oto wyniki z JUGGERMASTER.","Pobrano CSV {file}. Dodaj plik jako załącznik w programie pocztowym.","Nie udało się przygotować CSV. Spróbuj ponownie."],
  "cs": ["CSV e-mailem","Datum (UTC)","Body","Sety","Zde jsou výsledky z JUGGERMASTER.","CSV {file} byl stažen. Přiložte ho v e-mailové aplikaci.","CSV se nepodařilo připravit. Zkuste to znovu."],
  "hu": ["CSV e-mailben","Dátum (UTC)","Pontok","Szetek","Íme a JUGGERMASTER mérkőzéseredményei.","CSV {file} letöltve. Csatold a levelezőprogramban.","A CSV nem készíthető el. Próbáld újra."],
  "ro": ["CSV prin email","Data (UTC)","Puncte","Seturi","Acestea sunt rezultatele din JUGGERMASTER.","CSV {file} descărcat. Atașează-l în aplicația de email.","CSV nu a putut fi pregătit. Încearcă din nou."],
  "lv": ["CSV e-pastā","Datums (UTC)","Punkti","Seti","Šeit ir JUGGERMASTER spēļu rezultāti.","CSV {file} lejupielādēts. Pievieno to e-pasta pielikumā.","Neizdevās sagatavot CSV. Mēģini vēlreiz."],
  "lt": ["CSV el. paštu","Data (UTC)","Taškai","Setai","Štai JUGGERMASTER rungtynių rezultatai.","CSV {file} atsisiųstas. Pridėkite jį prie el. laiško.","Nepavyko paruošti CSV. Bandykite dar kartą."],
  "ru": ["CSV по почте","Дата (UTC)","Очки","Сеты","Результаты матчей из JUGGERMASTER.","CSV {file} скачан. Добавьте его как вложение в почтовой программе.","Не удалось подготовить CSV. Повторите попытку."],
  "uk": ["CSV поштою","Дата (UTC)","Очки","Сети","Результати матчів із JUGGERMASTER.","CSV {file} завантажено. Додайте його як вкладення в поштовій програмі.","Не вдалося підготувати CSV. Спробуйте ще раз."],
  "he": ["CSV בדוא״ל","תאריך (UTC)","נקודות","מערכות","אלו תוצאות המשחקים מתוך JUGGERMASTER.","CSV {file} הורד. יש לצרף אותו כקובץ בתוכנת הדוא״ל.","לא ניתן להכין את ה-CSV. נסו שוב."],
  "ja": ["CSVをメール送信","日時 (UTC)","得点","セット","JUGGERMASTERの試合結果です。","CSV {file} をダウンロードしました。メールアプリで添付してください。","CSVを作成できませんでした。もう一度お試しください。"],
  "ko": ["CSV 이메일","날짜 (UTC)","점수","세트","JUGGERMASTER 경기 결과입니다.","CSV {file} 다운로드됨. 이메일 앱에서 첨부하세요.","CSV를 준비하지 못했습니다. 다시 시도하세요."],
  "zh-Hans": ["邮件发送CSV","日期 (UTC)","得分","局数","这是JUGGERMASTER的比赛结果。","CSV {file} 已下载。请在邮件应用中将其添加为附件。","无法准备CSV，请重试。"],
  "zh-Hant": ["郵件寄送CSV","日期 (UTC)","得分","局數","這是JUGGERMASTER的比賽結果。","CSV {file} 已下載。請在郵件應用程式中將其加入附件。","無法準備CSV，請重試。"]
};
for (const [language, values] of Object.entries(exportRows)) Object.assign(resultTexts[language], Object.fromEntries(exportKeys.map((key, index) => [key, values[index]])));
