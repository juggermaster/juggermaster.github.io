const labels = {
  de: ['Logo hochladen', 'Logo entfernen', 'Wird automatisch verkleinert.', 'Logo konnte nicht geladen werden. Bitte ein gültiges Bild bis 10 MB wählen.'],
  en: ['Upload logo', 'Remove logo', 'Automatically resized.', 'Could not load the logo. Choose a valid image up to 10 MB.'],
  es: ['Subir logotipo', 'Eliminar logotipo', 'Se reduce automáticamente.', 'No se pudo cargar el logotipo. Elige una imagen válida de hasta 10 MB.'],
  fr: ['Importer un logo', 'Supprimer le logo', 'Redimensionné automatiquement.', 'Impossible de charger le logo. Choisissez une image valide de 10 Mo maximum.'],
  it: ['Carica logo', 'Rimuovi logo', 'Ridimensionato automaticamente.', 'Impossibile caricare il logo. Scegli un’immagine valida fino a 10 MB.'],
  pt: ['Carregar logótipo', 'Remover logótipo', 'Redimensionado automaticamente.', 'Não foi possível carregar o logótipo. Escolhe uma imagem válida até 10 MB.'],
  nl: ['Logo uploaden', 'Logo verwijderen', 'Wordt automatisch verkleind.', 'Het logo kon niet worden geladen. Kies een geldige afbeelding tot 10 MB.'],
  da: ['Upload logo', 'Fjern logo', 'Skaleres automatisk ned.', 'Logoet kunne ikke indlæses. Vælg et gyldigt billede på højst 10 MB.'],
  sv: ['Ladda upp logotyp', 'Ta bort logotyp', 'Förminskas automatiskt.', 'Logotypen kunde inte läsas in. Välj en giltig bild på högst 10 MB.'],
  fi: ['Lataa logo', 'Poista logo', 'Pienennetään automaattisesti.', 'Logoa ei voitu ladata. Valitse kelvollinen, enintään 10 Mt:n kuva.'],
  pl: ['Prześlij logo', 'Usuń logo', 'Automatyczne zmniejszanie.', 'Nie udało się wczytać logo. Wybierz poprawny obraz do 10 MB.'],
  cs: ['Nahrát logo', 'Odstranit logo', 'Automaticky se zmenší.', 'Logo se nepodařilo načíst. Vyberte platný obrázek do 10 MB.'],
  hu: ['Logó feltöltése', 'Logó eltávolítása', 'Automatikus kicsinyítés.', 'A logó nem tölthető be. Válassz egy érvényes, legfeljebb 10 MB-os képet.'],
  ro: ['Încarcă sigla', 'Elimină sigla', 'Se micșorează automat.', 'Sigla nu a putut fi încărcată. Alege o imagine validă de cel mult 10 MB.'],
  lv: ['Augšupielādēt logo', 'Noņemt logo', 'Tiek automātiski samazināts.', 'Logo neizdevās ielādēt. Izvēlies derīgu attēlu līdz 10 MB.'],
  lt: ['Įkelti logotipą', 'Pašalinti logotipą', 'Automatiškai sumažinamas.', 'Nepavyko įkelti logotipo. Pasirinkite tinkamą vaizdą iki 10 MB.'],
  ru: ['Загрузить логотип', 'Удалить логотип', 'Автоматически уменьшается.', 'Не удалось загрузить логотип. Выберите корректное изображение до 10 МБ.'],
  uk: ['Завантажити логотип', 'Видалити логотип', 'Автоматично зменшується.', 'Не вдалося завантажити логотип. Виберіть коректне зображення до 10 МБ.'],
  he: ['העלאת סמל', 'הסרת סמל', 'התמונה מוקטנת אוטומטית.', 'לא ניתן לטעון את הסמל. בחרו תמונה תקינה בגודל של עד 10 MB.'],
  ja: ['ロゴをアップロード', 'ロゴを削除', '自動的に縮小されます。', 'ロゴを読み込めませんでした。10 MB以下の有効な画像を選んでください。'],
  ko: ['로고 업로드', '로고 삭제', '자동으로 축소됩니다.', '로고를 불러올 수 없습니다. 10 MB 이하의 올바른 이미지를 선택하세요.'],
  'zh-Hans': ['上传队标', '移除队标', '自动缩小。', '无法加载队标。请选择不超过10 MB的有效图片。'],
  'zh-Hant': ['上傳隊徽', '移除隊徽', '自動縮小。', '無法載入隊徽。請選擇不超過10 MB的有效圖片。']
};
export const teamTexts = Object.fromEntries(Object.entries(labels).map(([language, [uploadTeamLogo, removeTeamLogo, resized, teamLogoFailed]]) => [language, {
  uploadTeamLogo, removeTeamLogo, teamLogoHint: `PNG, JPG, SVG, WebP, GIF, BMP · max. 10 MB. ${resized}`, teamLogoFailed
}]));

const noColorLabels = {
  de:'Keine Teamfarbe', en:'No team colour', es:'Sin color de equipo', fr:'Sans couleur d’équipe', it:'Nessun colore squadra',
  pt:'Sem cor de equipa', nl:'Geen teamkleur', da:'Ingen holdfarve', sv:'Ingen lagfärg', fi:'Ei joukkueväriä', pl:'Bez koloru drużyny',
  cs:'Bez barvy týmu', hu:'Nincs csapatszín', ro:'Fără culoare de echipă', lv:'Bez komandas krāsas', lt:'Be komandos spalvos',
  ru:'Без цвета команды', uk:'Без кольору команди', he:'ללא צבע קבוצה', ja:'チームカラーなし', ko:'팀 색상 없음',
  'zh-Hans':'不设队伍颜色', 'zh-Hant':'不設隊伍顏色'
};
for (const [language, noTeamColor] of Object.entries(noColorLabels)) teamTexts[language].noTeamColor = noTeamColor;

const removeColorLabels = {
  de:'Teamfarbe entfernen', en:'Remove team colour', es:'Quitar color de equipo', fr:'Retirer la couleur d’équipe', it:'Rimuovi colore squadra',
  pt:'Remover cor da equipa', nl:'Teamkleur verwijderen', da:'Fjern holdfarve', sv:'Ta bort lagfärg', fi:'Poista joukkueväri',
  pl:'Usuń kolor drużyny', cs:'Odstranit barvu týmu', hu:'Csapatszín eltávolítása', ro:'Elimină culoarea echipei', lv:'Noņemt komandas krāsu',
  lt:'Pašalinti komandos spalvą', ru:'Удалить цвет команды', uk:'Видалити колір команди', he:'הסרת צבע קבוצה', ja:'チームカラーを削除',
  ko:'팀 색상 제거', 'zh-Hans':'移除队伍颜色', 'zh-Hant':'移除隊伍顏色'
};
for (const [language, removeTeamColor] of Object.entries(removeColorLabels)) teamTexts[language].removeTeamColor = removeTeamColor;
