const keys = ['resultHistory', 'resultsTitle', 'emptyResults', 'archiveStorage'];
const rows = {
  de: ['Verlauf', 'Spielergebnisse', 'Noch keine abgeschlossenen Spiele.', 'Die letzten 20 Spielergebnisse mit Datum und Teamnamen werden nur in diesem Browser gespeichert. Beim Löschen der Website-Daten werden sie entfernt.'],
  en: ['History', 'Match results', 'No completed matches yet.', 'The last 20 match results with dates and team names are saved only in this browser. Clearing site data removes them.'],
  es: ['Historial', 'Resultados', 'Aún no hay partidos terminados.', 'Los últimos 20 resultados con fecha y nombres de equipos solo se guardan en este navegador. Borrar los datos del sitio los elimina.'],
  fr: ['Historique', 'Résultats des matchs', 'Aucun match terminé.', 'Les 20 derniers résultats avec dates et noms des équipes sont enregistrés uniquement dans ce navigateur. Effacer les données du site les supprime.'],
  it: ['Cronologia', 'Risultati delle partite', 'Nessuna partita conclusa.', 'Gli ultimi 20 risultati con date e nomi delle squadre sono salvati solo in questo browser. Cancellando i dati del sito vengono eliminati.'],
  pt: ['Histórico', 'Resultados dos jogos', 'Ainda não há jogos terminados.', 'Os últimos 20 resultados com datas e nomes das equipas são guardados apenas neste navegador. Apagar os dados do site remove-os.'],
  nl: ['Geschiedenis', 'Wedstrijdresultaten', 'Nog geen voltooide wedstrijden.', 'De laatste 20 resultaten met datums en teamnamen worden alleen in deze browser opgeslagen. Wissen van sitegegevens verwijdert ze.'],
  da: ['Historik', 'Kampresultater', 'Ingen afsluttede kampe endnu.', 'De seneste 20 resultater med datoer og holdnavne gemmes kun i denne browser. Sletning af webstedsdata fjerner dem.'],
  sv: ['Historik', 'Matchresultat', 'Inga avslutade matcher ännu.', 'De senaste 20 resultaten med datum och lagnamn sparas bara i denna webbläsare. Radering av webbplatsdata tar bort dem.'],
  fi: ['Historia', 'Ottelutulokset', 'Ei vielä päättyneitä otteluita.', 'Viimeiset 20 tulosta päivämäärineen ja joukkueiden nimineen tallennetaan vain tähän selaimeen. Sivustotietojen poistaminen poistaa ne.'],
  pl: ['Historia', 'Wyniki meczów', 'Brak zakończonych meczów.', 'Ostatnie 20 wyników z datami i nazwami drużyn zapisuje się tylko w tej przeglądarce. Usunięcie danych witryny je usuwa.'],
  cs: ['Historie', 'Výsledky zápasů', 'Zatím žádné dokončené zápasy.', 'Posledních 20 výsledků s daty a názvy týmů se ukládá pouze v tomto prohlížeči. Vymazání dat webu je odstraní.'],
  hu: ['Előzmények', 'Mérkőzéseredmények', 'Még nincs befejezett mérkőzés.', 'Az utolsó 20 eredmény dátummal és csapatnevekkel csak ebben a böngészőben tárolódik. A webhelyadatok törlése eltávolítja őket.'],
  ro: ['Istoric', 'Rezultatele meciurilor', 'Niciun meci încheiat încă.', 'Ultimele 20 de rezultate cu date și nume de echipe sunt salvate numai în acest browser. Ștergerea datelor site-ului le elimină.'],
  lv: ['Vēsture', 'Spēļu rezultāti', 'Vēl nav pabeigtu spēļu.', 'Pēdējie 20 rezultāti ar datumiem un komandu nosaukumiem tiek glabāti tikai šajā pārlūkā. Dzēšot vietnes datus, tie tiek noņemti.'],
  lt: ['Istorija', 'Rungtynių rezultatai', 'Baigtų rungtynių dar nėra.', 'Paskutiniai 20 rezultatų su datomis ir komandų pavadinimais saugomi tik šioje naršyklėje. Išvalius svetainės duomenis jie pašalinami.'],
  ru: ['История', 'Результаты матчей', 'Завершённых матчей пока нет.', 'Последние 20 результатов с датами и названиями команд хранятся только в этом браузере. Очистка данных сайта удаляет их.'],
  uk: ['Історія', 'Результати матчів', 'Завершених матчів ще немає.', 'Останні 20 результатів із датами та назвами команд зберігаються лише в цьому браузері. Очищення даних сайту видаляє їх.'],
  he: ['היסטוריה', 'תוצאות משחקים', 'עדיין אין משחקים שהסתיימו.', '20 התוצאות האחרונות עם תאריכים ושמות קבוצות נשמרות רק בדפדפן זה. מחיקת נתוני האתר מסירה אותן.'],
  ja: ['履歴', '試合結果', '終了した試合はまだありません。', '日付とチーム名を含む直近20試合の結果は、このブラウザーにのみ保存されます。サイトデータを削除すると結果も削除されます。'],
  ko: ['기록', '경기 결과', '아직 종료된 경기가 없습니다.', '날짜와 팀 이름이 포함된 최근 경기 결과 20개는 이 브라우저에만 저장됩니다. 사이트 데이터를 삭제하면 결과도 삭제됩니다.'],
  'zh-Hans': ['历史', '比赛结果', '暂无已结束的比赛。', '最近20场比赛结果及日期和队名仅保存在此浏览器中。清除网站数据也会删除这些结果。'],
  'zh-Hant': ['歷史', '比賽結果', '暫無已結束的比賽。', '最近20場比賽結果及日期和隊名僅儲存在此瀏覽器中。清除網站資料也會刪除這些結果。']
};
export const resultTexts = Object.fromEntries(Object.entries(rows).map(([language, values]) => [language, Object.fromEntries(keys.map((key, index) => [key, values[index]]))]));
