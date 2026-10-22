import { texts } from './src/i18n.mjs';
import { locales } from './src/locale.mjs';

// Offline use, timing, signals, saved state, foreground playback.
const paragraphs = {
  ru: [
    `Откройте страницу онлайн и дождитесь исчезновения сообщения о сохранении офлайн-файлов. После этого тот же адрес можно открыть без сети. Установка не требуется. Язык выбирается по настройкам браузера; вручную выбранный флаг сохраняется.`,
    `Камень — один удар ритма, обычно каждые 1,5 секунды. 100 камней — 2:30 активной игры; паузы не учитываются. Камень по металлу, гонг и барабан — разные звуки одних часов. Очко обычно завершает розыгрыш. В Golden Jugg решает следующее очко; в сетах действуют выбранные цели.`,
    `Прослушивание ритма повторяется с выбранным интервалом и останавливается повторным нажатием. Регуляторы работают во время воспроизведения, не расходуя камни. При Jugg и конце периода по умолчанию звучат три быстрых удара; можно выбрать от одного до десяти. Каждый сохраняет полное затухание и может накладываться на другие. Конечные удары не расходуют камни. Громкости регулируются отдельно.`,
    `Команды, настройки, счёт и до 30 шагов отмены хранятся только в этом браузере. Восстановленный матч приостановлен. Режим, лимит и правила сетов действуют со следующего матча. Обновления загружаются полностью и принимаются при остановленном воспроизведении. Очистка данных браузера удаляет матчи и офлайн-файлы; серверной копии нет.`,
    `Во время игры и прослушивания приложение просит оставить экран включённым. При отказе показывается сообщение. Держите приложение на переднем плане: смена приложения, звонок или прерывание звука приостанавливает матч. Звук при заблокированном экране не гарантируется. Перед игрой проверьте динамик и задержку Bluetooth.`,
  ],
  uk: [
    `Відкрийте сторінку онлайн і дочекайтеся зникнення повідомлення про збереження офлайн-файлів. Після цього ту саму адресу можна відкрити без мережі. Встановлення не потрібне. Мова залежить від налаштувань браузера; обраний вручну прапор зберігається.`,
    `Камінь — один удар ритму, зазвичай кожні 1,5 секунди. 100 каменів — 2:30 активної гри; паузи не враховуються. Камінь по металу, гонг і барабан — різні звуки одного годинника. Очко зазвичай завершує розіграш. У Golden Jugg вирішує наступне очко; у сетах діють обрані цілі.`,
    `Прослуховування ритму повторюється з обраним інтервалом і зупиняється повторним натисканням. Регулятори працюють під час відтворення без витрати каменів. При Jugg і в кінці періоду зазвичай звучать три швидкі удари; можна обрати від одного до десяти. Кожен зберігає повне згасання і може накладатися на інші. Кінцеві удари не витрачають каменів. Гучності регулюються окремо.`,
    `Команди, налаштування, рахунок і до 30 кроків скасування зберігаються лише в цьому браузері. Відновлений матч призупинено. Режим, ліміт і правила сетів діють із наступного матчу. Оновлення завантажуються повністю й приймаються після зупинки відтворення. Очищення даних браузера видаляє матчі та офлайн-файли; серверної копії немає.`,
    `Під час гри та прослуховування застосунок просить залишити екран увімкненим. Про відмову повідомляється. Тримайте застосунок на передньому плані: перемикання, дзвінок чи переривання звуку призупиняє матч. Звук із заблокованим екраном не гарантовано. Перед грою перевірте динамік і затримку Bluetooth.`,
  ],
  he: [
    `פתחו את הדף עם חיבור לרשת והמתינו עד שהודעת שמירת הקבצים תיעלם. אחר כך אפשר לפתוח את אותה כתובת ללא רשת. אין צורך בהתקנה. השפה נבחרת לפי הגדרות הדפדפן; בחירת דגל ידנית נשמרת.`,
    `אבן היא פעימה אחת, בדרך כלל בכל 1.5 שניות. 100 אבנים הן 2:30 דקות של משחק פעיל; הפסקות אינן נספרות. אבן על פח, גונג ותוף הם צלילים חלופיים של אותו שעון. נקודה מסיימת בדרך כלל מהלך. ב־Golden Jugg הנקודה הבאה מכריעה; במערכות חלים היעדים שנבחרו.`,
    `הדגמת הקצב חוזרת במרווח שנבחר ונעצרת בלחיצה נוספת. הבקרים פועלים בזמן ההשמעה בלי לצרוך אבנים. אחרי Jugg ובסוף פרק נשמעות כברירת מחדל שלוש מכות מהירות; אפשר לבחור אחת עד עשר. כל מכה שומרת על מלוא הדעיכה ויכולה לחפוף לאחרות. מכות הסיום אינן צורכות אבנים. שתי עוצמות השמע נפרדות.`,
    `הקבוצות, ההגדרות, התוצאה ועד 30 צעדי ביטול נשמרים רק בדפדפן הזה. משחק ששוחזר נשאר מושהה. מצב המשחק, המגבלה וכללי המערכות חלים במשחק הבא. עדכונים יורדים במלואם ומתקבלים כשההשמעה עצורה. מחיקת נתוני הדפדפן מוחקת גם משחקים וקבצים ללא רשת; אין עותק בשרת.`,
    `בזמן משחק והדגמת קצב האפליקציה מבקשת להשאיר את המסך ער. סירוב מוצג בהודעה. השאירו את האפליקציה בחזית: מעבר לאפליקציה אחרת, שיחה או הפרעת שמע משהים את המשחק. אין הבטחה לצליל כשהמסך נעול. בדקו את הרמקול ואת השהיית ה־Bluetooth לפני משחק.`,
  ],
  ja: [
    `オンラインでページを開き、オフライン保存のメッセージが消えるまで待ちます。その後は同じアドレスを通信なしで開けます。インストールは不要です。ブラウザーの言語設定を使い、手動で選んだ旗は保存されます。`,
    `石1つは拍子1回で、通常は1.5秒です。100石は実プレー時間2分30秒に相当し、停止時間は含みません。石と金属板、ゴング、太鼓は同じ時計の異なる音です。得点すると通常はそのプレーが終わります。Golden Juggは次の得点で決着し、セット制では設定した目標を使います。`,
    `拍子の試聴は設定間隔で繰り返し、再度押すと停止します。再生中も調整でき、試聴では石を消費しません。Juggやピリオド終了時は標準で素早い3打、設定で1～10打が鳴ります。各打音の余韻は最後まで続き、重なります。終了打音は石を消費しません。2つの音量は別々に調整します。`,
    `チーム、設定、得点、最大30回の取り消し履歴は、このブラウザーだけに保存します。再表示時は一時停止状態です。試合形式、石の上限、セット規則は次の試合から適用します。更新はすべてダウンロード後、再生停止中に受け入れます。ブラウザーデータを消すと試合とオフラインファイルも消えます。サーバー上の控えはありません。`,
    `試合中と試聴中は画面の点灯維持を要求します。拒否された場合は案内を表示します。アプリを前面に保ってください。アプリ切り替え、着信、音声の中断で試合は停止します。ロック画面での再生は保証されません。試合前にスピーカーとBluetoothの遅延を確認してください。`,
  ],
  ko: [
    `온라인으로 페이지를 열고 오프라인 저장 메시지가 사라질 때까지 기다리세요. 이후 같은 주소를 네트워크 없이 열 수 있습니다. 설치는 필요 없습니다. 브라우저에 설정된 언어를 사용하며, 직접 고른 국기는 저장됩니다.`,
    `스톤 하나는 박자 한 번이며 보통 1.5초입니다. 100스톤은 실제 경기 시간 2분 30초이고 일시정지 시간은 포함하지 않습니다. 철판에 부딪히는 돌, 징, 북은 같은 시계의 다른 소리입니다. 득점하면 보통 해당 플레이가 끝납니다. Golden Jugg에서는 다음 득점으로 승패가 결정되고 세트는 설정한 목표를 따릅니다.`,
    `박자 미리 듣기는 설정한 간격으로 반복되며 다시 누르면 멈춥니다. 재생 중에도 조절할 수 있고 스톤을 사용하지 않습니다. Jugg와 피리어드 종료 시 기본으로 빠른 세 번의 타격이 울리며 1~10회로 설정할 수 있습니다. 각 타격의 잔향은 끝까지 이어지고 서로 겹칩니다. 종료 타격은 스톤을 사용하지 않습니다. 두 음량은 각각 조절합니다.`,
    `팀, 설정, 점수와 최대 30단계 실행 취소 기록은 이 브라우저에만 저장됩니다. 다시 열면 경기는 일시정지 상태입니다. 경기 방식, 스톤 제한과 세트 규칙은 다음 경기부터 적용됩니다. 업데이트는 모두 내려받은 뒤 재생이 멈춘 상태에서 적용합니다. 브라우저 데이터를 삭제하면 경기와 오프라인 파일도 사라집니다. 서버 사본은 없습니다.`,
    `경기와 미리 듣기 중 화면을 켜진 상태로 유지하도록 요청합니다. 거부되면 안내가 표시됩니다. 앱을 앞에 두세요. 앱 전환, 전화나 소리 중단은 경기를 일시정지합니다. 잠금 화면 재생은 보장되지 않습니다. 경기 전에 스피커와 Bluetooth 지연을 확인하세요.`,
  ],
  'zh-Hans': [
    `联网打开页面，等待离线保存提示消失。之后可以断网重新打开同一地址，无须安装。默认采用浏览器设置的语言；手动选择的旗帜会保存。`,
    `一石代表一次节拍，通常为1.5秒。100石等于2分30秒的实际比赛时间，暂停不计时。石击铁板、锣和鼓是同一计时器的不同声音。得分通常结束当前回合。Golden Jugg以下一次得分决胜；按盘比赛遵循设定的目标。`,
    `节拍试听按设定间隔循环，再次点击停止。播放时可以调节，试听不消耗比赛石数。Jugg或每节结束时默认快速击打三次，可设置为一至十次。各次打击完整衰减并可重叠，结束打击不消耗石数。两种音量分别调整。`,
    `队伍、设置、比分和最多30步撤销记录仅存于此浏览器。重新打开时比赛保持暂停。模式、石数上限和盘数规则从下一场生效。更新完整下载后，在停止播放时确认应用。清除浏览器数据会删除比赛和离线文件，服务器没有备份。`,
    `比赛和试听时，应用请求屏幕保持常亮；如被拒绝，会显示提示。请保持应用在前台。切换应用、来电或音频中断会暂停比赛，不保证锁屏后继续发声。比赛前请检查扬声器及Bluetooth延迟。`,
  ],
  'zh-Hant': [
    `連網開啟頁面，等待離線儲存提示消失。之後可以斷網重新開啟同一地址，無須安裝。預設採用瀏覽器設定的語言；手動選擇的旗幟會儲存。`,
    `一石代表一次節拍，通常為1.5秒。100石等於2分30秒的實際比賽時間，暫停不計時。石擊鐵板、鑼和鼓是同一計時器的不同聲音。得分通常結束目前回合。Golden Jugg以下一次得分決勝；按盤比賽遵循設定的目標。`,
    `節拍試聽按設定間隔循環，再次點選停止。播放時可以調整，試聽不消耗比賽石數。Jugg或每節結束時預設快速擊打三次，可設定為一至十次。各次打擊完整衰減並可重疊，結束打擊不消耗石數。兩種音量分別調整。`,
    `隊伍、設定、比分和最多30步復原紀錄僅存於此瀏覽器。重新開啟時比賽保持暫停。模式、石數上限和盤數規則從下一場生效。更新完整下載後，在停止播放時確認套用。清除瀏覽器資料會刪除比賽和離線檔案，伺服器沒有備份。`,
    `比賽和試聽時，應用程式要求螢幕保持常亮；若被拒絕，會顯示提示。請保持應用程式在前景。切換應用程式、來電或音訊中斷會暫停比賽，不保證鎖定螢幕後繼續發聲。比賽前請檢查喇叭及Bluetooth延遲。`,
  ],
  fi: [
    `Avaa sivu verkossa ja odota, että offline-tallennuksen ilmoitus poistuu. Sen jälkeen voit avata saman osoitteen ilman verkkoa. Asennusta ei tarvita. Kieli valitaan selaimen asetuksista; käsin valittu lippu muistetaan.`,
    `Yksi kivi on yksi tahdin isku, tavallisesti 1,5 sekuntia. 100 kiveä on 2:30 aktiivista peliaikaa; taukoja ei lasketa. Kivi metallilevyyn, gongi ja rumpu ovat saman kellon vaihtoehtoisia ääniä. Piste päättää yleensä pelivuoron. Golden Juggissa seuraava piste ratkaisee; erissä käytetään valittuja tavoitteita.`,
    `Tahdin esikuuntelu toistuu valitulla välillä ja pysähtyy uudella painalluksella. Säätimet toimivat toiston aikana kuluttamatta kiviä. Juggin tai jakson lopun jälkeen kuuluu oletuksena kolme nopeaa iskua; voit valita yhdestä kymmeneen. Iskujen jälkisoinnit saavat limittyä. Loppuiskut eivät kuluta kiviä. Molemmilla äänillä on oma voimakkuus.`,
    `Joukkueet, asetukset, pisteet ja enintään 30 kumoamisaskelta tallennetaan vain tähän selaimeen. Palautettu ottelu on tauolla. Pelitapa, kiviraja ja eräsäännöt koskevat seuraavaa ottelua. Päivitykset ladataan kokonaan ja otetaan käyttöön toiston ollessa pysäytetty. Selaintietojen tyhjennys poistaa ottelut ja offline-tiedostot; palvelinkopiota ei ole.`,
    `Pelin ja esikuuntelun aikana sovellus pyytää pitämään näytön päällä. Hylkäyksestä näytetään ilmoitus. Pidä sovellus etualalla: sovelluksen vaihto, puhelu tai äänen keskeytys pysäyttää ottelun. Ääntä lukitulla näytöllä ei taata. Tarkista kaiutin ja Bluetooth-viive ennen peliä.`,
  ],
  pl: [
    `Otwórz stronę online i poczekaj, aż zniknie komunikat zapisywania plików offline. Potem ten sam adres można otworzyć bez sieci. Instalacja nie jest potrzebna. Język wynika z ustawień przeglądarki; ręcznie wybrana flaga zostaje zapisana.`,
    `Kamień oznacza jedno uderzenie rytmu, zwykle co 1,5 sekundy. 100 kamieni to 2:30 aktywnej gry; pauzy się nie liczą. Kamień na blasze, gong i bęben to różne dźwięki tego samego zegara. Punkt zwykle kończy akcję. W Golden Jugg decyduje następny punkt; w setach obowiązują wybrane cele.`,
    `Odsłuch rytmu powtarza się z wybranym odstępem i kończy po ponownym naciśnięciu. Suwaki działają na żywo bez zużywania kamieni. Po Jugg i na końcu części domyślnie słychać trzy szybkie uderzenia; można wybrać od jednego do dziesięciu. Każde zachowuje wybrzmiewanie i może nakładać się na inne. Uderzenia końcowe nie zużywają kamieni. Obie głośności są osobne.`,
    `Drużyny, ustawienia, wynik i do 30 cofnięć są zapisywane tylko w tej przeglądarce. Przywrócony mecz jest wstrzymany. Tryb, limit i zasady setów dotyczą następnego meczu. Aktualizacje są pobierane w całości i przyjmowane po zatrzymaniu odtwarzania. Wyczyszczenie danych przeglądarki usuwa mecze i pliki offline; nie ma kopii na serwerze.`,
    `Podczas gry i odsłuchu aplikacja prosi o utrzymanie włączonego ekranu. Odmowa powoduje wyświetlenie komunikatu. Trzymaj aplikację na pierwszym planie: zmiana aplikacji, połączenie lub przerwanie dźwięku wstrzymuje mecz. Dźwięk przy zablokowanym ekranie nie jest gwarantowany. Przed grą sprawdź głośnik i opóźnienie Bluetooth.`,
  ],
  cs: [
    `Otevřete stránku online a počkejte, až zmizí zpráva o ukládání offline souborů. Potom lze stejnou adresu otevřít bez sítě. Instalace není nutná. Jazyk se řídí nastavením prohlížeče; ručně vybraná vlajka se uloží.`,
    `Kámen znamená jeden úder rytmu, obvykle každých 1,5 sekundy. 100 kamenů je 2:30 čistého herního času; pauzy se nepočítají. Kámen na plech, gong a buben jsou různé zvuky stejných hodin. Bod obvykle ukončí rozehru. V Golden Jugg rozhoduje další bod; sety se řídí zvolenými cíli.`,
    `Poslech rytmu se opakuje ve zvoleném intervalu a zastaví dalším stiskem. Ovládání funguje během přehrávání a nespotřebovává kameny. Při Jugg a na konci části zazní běžně tři rychlé údery; lze vybrat jeden až deset. Každý si zachová dozvuk a může se překrývat s dalšími. Závěrečné údery nespotřebovávají kameny. Obě hlasitosti jsou samostatné.`,
    `Týmy, nastavení, skóre a až 30 kroků zpět se ukládají jen do tohoto prohlížeče. Obnovený zápas zůstává pozastavený. Režim, limit a pravidla setů platí od příštího zápasu. Aktualizace se stáhnou celé a přijmou při zastaveném přehrávání. Smazání dat prohlížeče odstraní zápasy i offline soubory; serverová kopie neexistuje.`,
    `Při hře a poslechu aplikace žádá o zapnutou obrazovku. Odmítnutí se zobrazí ve zprávě. Nechte aplikaci v popředí: přepnutí aplikace, hovor nebo přerušení zvuku pozastaví zápas. Zvuk při zamčené obrazovce není zaručen. Před zápasem zkontrolujte reproduktor a zpoždění Bluetooth.`,
  ],
  hu: [
    `Nyisd meg az oldalt online, és várd meg, amíg eltűnik az offline mentés üzenete. Ezután ugyanaz a cím hálózat nélkül is megnyitható. Telepítés nem szükséges. A nyelv a böngésző beállítását követi; a kézzel választott zászlót az app megjegyzi.`,
    `Egy kő egy ütemütés, általában 1,5 másodperc. 100 kő 2:30 tiszta játékidő; a szünet nem számít. A kő lemezre, a gong és a dob ugyanannak az órának különböző hangjai. A pont általában lezárja a menetet. Golden Juggban a következő pont dönt; a szetteknél a beállított célok érvényesek.`,
    `Az ütempróba a választott időközzel ismétlődik, újabb érintésre leáll. A szabályzók lejátszás közben működnek, kövek felhasználása nélkül. Jugg és szakaszvég után alapból három gyors ütés szól; egytől tízig választható. Mindegyik teljesen lecsenghet és átfedheti a többit. A végjel nem használ fel köveket. A két hangerő külön állítható.`,
    `A csapatok, beállítások, eredmény és legfeljebb 30 visszavonási lépés csak ebben a böngészőben marad. A helyreállított mérkőzés szünetel. A mód, korlát és szettszabályok a következő mérkőzéstől érvényesek. A frissítés teljesen letöltődik, átvétele leállított lejátszásnál történik. A böngészőadatok törlése a játékokat és az offline fájlokat is törli; nincs szerveres másolat.`,
    `Játék és ütempróba közben az app a kijelző ébren tartását kéri. Elutasításkor üzenet jelenik meg. Maradjon az app előtérben: alkalmazásváltás, hívás vagy hangmegszakítás szünetelteti a mérkőzést. Zárolt kijelzőn a hang nem garantált. Játék előtt ellenőrizd a hangszórót és a Bluetooth késését.`,
  ],
  ro: [
    `Deschide pagina online și așteaptă dispariția mesajului de salvare offline. Apoi poți redeschide aceeași adresă fără rețea. Instalarea nu este necesară. Limba urmează setările browserului; alegerea manuală a unui steag este păstrată.`,
    `O piatră înseamnă o bătaie a ritmului, în mod normal la 1,5 secunde. 100 de pietre înseamnă 2:30 de joc efectiv; pauzele nu contează. Piatra pe tablă, gongul și toba sunt sunete diferite ale aceluiași ceas. Un punct încheie de regulă faza. În Golden Jugg decide următorul punct; seturile folosesc obiectivele alese.`,
    `Ascultarea ritmului se repetă la intervalul ales și se oprește la o nouă apăsare. Reglajele funcționează în direct fără consum de pietre. La Jugg și finalul perioadei se aud implicit trei bătăi rapide; se pot alege între una și zece. Fiecare își păstrează rezonanța și se poate suprapune celorlalte. Bătăile finale nu consumă pietre. Cele două volume sunt independente.`,
    `Echipele, setările, scorul și până la 30 de pași de anulare rămân doar în acest browser. Meciul restaurat este în pauză. Modul, limita și regulile seturilor se aplică meciului următor. Actualizările se descarcă integral și se acceptă cu redarea oprită. Ștergerea datelor browserului elimină meciurile și fișierele offline; nu există copie pe server.`,
    `În joc și la ascultare, aplicația cere menținerea ecranului activ. Un refuz este anunțat. Ține aplicația în prim-plan: schimbarea aplicației, un apel sau întreruperea audio pune meciul în pauză. Sunetul cu ecranul blocat nu este garantat. Verifică difuzorul și întârzierea Bluetooth înainte de joc.`,
  ],
  lv: [
    `Atver lapu tiešsaistē un gaidi, līdz pazūd bezsaistes saglabāšanas paziņojums. Pēc tam to pašu adresi vari atvērt bez tīkla. Nekas nav jāinstalē. Valoda seko pārlūka iestatījumiem; manuāli izvēlētais karogs tiek saglabāts.`,
    `Viens akmens ir viens ritma sitiens, parasti ik pēc 1,5 sekundēm. 100 akmeņi ir 2:30 aktīva spēles laika; pauzes neskaita. Akmens pret metālu, gongs un bungas ir viena pulksteņa dažādas skaņas. Punkts parasti beidz izspēli. Golden Jugg izšķir nākamais punkts; setiem izmanto izvēlētos mērķus.`,
    `Ritma paraugs atkārtojas izvēlētajā intervālā un apstājas pēc atkārtota nospiediena. Regulēšana darbojas atskaņošanas laikā, netērējot akmeņus. Pie Jugg un perioda beigās pēc noklusējuma skan trīs ātri sitieni; var izvēlēties vienu līdz desmit. Katrs saglabā pilnu izskaņu un var pārklāt citus. Beigu sitieni netērē akmeņus. Abi skaļumi ir atsevišķi.`,
    `Komandas, iestatījumi, rezultāts un līdz 30 atsaukšanas soļiem glabājas tikai šajā pārlūkā. Atjaunota spēle ir pauzēta. Režīms, limits un setu noteikumi attiecas uz nākamo spēli. Atjauninājumus lejupielādē pilnībā un pieņem ar apturētu atskaņošanu. Pārlūka datu dzēšana noņem spēles un bezsaistes failus; servera kopijas nav.`,
    `Spēles un klausīšanās laikā lietotne prasa turēt ekrānu ieslēgtu. Atteikums tiek parādīts paziņojumā. Turi lietotni priekšplānā: lietotnes maiņa, zvans vai skaņas pārtraukums pauzē spēli. Skaņa ar bloķētu ekrānu netiek garantēta. Pirms spēles pārbaudi skaļruni un Bluetooth aizturi.`,
  ],
  lt: [
    `Atverk puslapį prisijungęs prie tinklo ir palauk, kol dings pranešimas apie saugojimą darbui be ryšio. Tada tą patį adresą galima atverti be tinklo. Diegti nereikia. Kalba parenkama pagal naršyklę; ranka pasirinkta vėliava įsimenama.`,
    `Vienas akmuo yra vienas ritmo dūžis, paprastai kas 1,5 sekundės. 100 akmenų sudaro 2:30 grynojo žaidimo laiko; pauzės neskaičiuojamos. Akmuo į skardą, gongas ir būgnas yra to paties laikrodžio skirtingi garsai. Taškas paprastai užbaigia ataką. Golden Jugg lemia kitas taškas; setams taikomi pasirinkti tikslai.`,
    `Ritmo peržiūra kartojasi pasirinktu tarpu ir sustoja paspaudus dar kartą. Slankikliai veikia grojant ir nenaudoja akmenų. Po Jugg ar kėlinio pabaigos paprastai skamba trys greiti dūžiai; galima rinktis nuo vieno iki dešimties. Kiekvienas išlaiko aidą ir gali persidengti su kitais. Pabaigos dūžiai nenaudoja akmenų. Abu garsumai atskiri.`,
    `Komandos, nustatymai, rezultatas ir iki 30 atšaukimo žingsnių išsaugomi tik šioje naršyklėje. Atkurtos rungtynės būna pristabdytos. Režimas, riba ir setų taisyklės taikomos kitoms rungtynėms. Atnaujinimai parsiunčiami visiškai ir priimami sustabdžius atkūrimą. Išvalius naršyklės duomenis dingsta rungtynės ir failai darbui be ryšio; serverio kopijos nėra.`,
    `Žaidžiant ar klausant prašoma išlaikyti ekraną įjungtą. Apie atsisakymą parodomas pranešimas. Laikyk programėlę priekiniame plane: programėlės pakeitimas, skambutis ar garso pertrūkis pristabdo rungtynes. Garsas užrakintame ekrane negarantuojamas. Prieš žaidimą patikrink garsiakalbį ir Bluetooth delsą.`,
  ],
  es: [
    `Abre la página con conexión y espera a que desaparezca el aviso de guardado offline. Después puedes volver a abrir la misma dirección sin red. No hace falta instalar nada. Se elige el idioma configurado en el navegador; una selección manual de bandera queda guardada.`,
    `Una piedra equivale a un golpe del ritmo y normalmente dura 1,5 segundos. 100 piedras son 2:30 de juego efectivo; las pausas no cuentan. Piedra sobre chapa, gong y tambor son sonidos alternativos del mismo reloj. Un punto termina normalmente la jugada. En Golden Jugg decide el siguiente punto; en sets se aplican los objetivos configurados.`,
    `La escucha del ritmo se repite al intervalo elegido y se detiene al pulsar de nuevo; los controles actúan en directo y no consumen piedras. Tras un Jugg o fin de periodo suenan por defecto tres golpes rápidos; puedes elegir de uno a diez. Cada golpe conserva su resonancia y se superpone a los demás. Los golpes finales no consumen piedras. Los dos volúmenes se ajustan por separado.`,
    `Equipos, ajustes, marcador y hasta 30 pasos para deshacer se guardan solo en este navegador. Al abrir de nuevo, el partido está en pausa. Los cambios de modo, límite y sets se aplican al siguiente partido. Las actualizaciones se descargan completas y se aceptan con la reproducción parada. Borrar datos del navegador elimina también partidas y archivos offline; no hay copia en el servidor.`,
    `Durante el juego y la escucha se solicita mantener la pantalla encendida. Si el navegador no lo permite, aparece un aviso. Mantén la app en primer plano; cambiar de app, una llamada o una interrupción de audio pausa el partido. No se garantiza sonido con la pantalla bloqueada. Comprueba el altavoz y la latencia Bluetooth antes de jugar.`,
  ],
  fr: [
    `Ouvrez la page en ligne et attendez la disparition du message d’enregistrement hors ligne. Vous pourrez ensuite rouvrir la même adresse sans réseau. Aucune installation n’est nécessaire. La langue suit les préférences du navigateur ; un choix manuel de drapeau est mémorisé.`,
    `Une pierre correspond à un coup du rythme, normalement toutes les 1,5 seconde. 100 pierres représentent 2 min 30 de jeu effectif ; les pauses ne comptent pas. Pierre sur tôle, gong et tambour sont des sons alternatifs du même chronomètre. Un point termine normalement l’engagement. En Golden Jugg, le prochain point décide du match ; les sets suivent les objectifs choisis.`,
    `L’écoute du rythme se répète à l’intervalle choisi et s’arrête en appuyant à nouveau. Les réglages agissent en direct sans consommer de pierres. Après un Jugg ou une fin de période, trois coups rapides retentissent par défaut, avec un choix de un à dix. Chaque coup conserve sa résonance et peut se superposer aux autres. Ces coups ne consomment pas de pierres. Les deux volumes sont indépendants.`,
    `Équipes, réglages, score et jusqu’à 30 annulations sont enregistrés uniquement dans ce navigateur. Le match restauré reste en pause. Mode, limite et règles des sets s’appliquent au prochain match. Les mises à jour sont téléchargées entièrement et acceptées à l’arrêt. Effacer les données du navigateur supprime matchs et fichiers hors ligne ; aucune copie serveur n’existe.`,
    `Pendant le jeu ou l’écoute, l’app demande de garder l’écran allumé. Un message signale un refus. Gardez l’app au premier plan : changement d’app, appel ou interruption audio met le match en pause. Le son avec l’écran verrouillé n’est pas garanti. Vérifiez haut-parleur et latence Bluetooth avant de jouer.`,
  ],
  it: [
    `Apri la pagina online e attendi che scompaia l’avviso di salvataggio offline. Poi potrai riaprire lo stesso indirizzo senza rete. Non serve installare nulla. La lingua segue le preferenze del browser; una bandiera scelta manualmente viene ricordata.`,
    `Una pietra corrisponde a un colpo, normalmente ogni 1,5 secondi. 100 pietre sono 2:30 di gioco effettivo; le pause non contano. Pietra su lamiera, gong e tamburo sono suoni alternativi dello stesso timer. Un punto conclude normalmente l’azione. In Golden Jugg decide il punto successivo; nei set valgono gli obiettivi impostati.`,
    `L’ascolto del ritmo si ripete all’intervallo scelto e si ferma premendo di nuovo. I controlli funzionano in diretta senza consumare pietre. Dopo un Jugg o a fine periodo suonano normalmente tre colpi rapidi; se ne possono scegliere da uno a dieci. Ogni colpo mantiene il proprio decadimento e si sovrappone agli altri. I colpi finali non consumano pietre. I due volumi sono separati.`,
    `Squadre, impostazioni, punteggio e fino a 30 annullamenti restano solo in questo browser. Una partita ripristinata è sempre in pausa. Modalità, limite e regole dei set valgono dalla prossima partita. Gli aggiornamenti vengono scaricati interamente e accettati a riproduzione ferma. Cancellare i dati del browser elimina anche partite e file offline; non esiste copia sul server.`,
    `Durante il gioco e l’ascolto viene richiesto di tenere acceso lo schermo. Un avviso segnala un rifiuto. Tieni l’app in primo piano: un cambio di app, una chiamata o un’interruzione audio mette la partita in pausa. Il suono a schermo bloccato non è garantito. Controlla altoparlante e ritardo Bluetooth prima di giocare.`,
  ],
  pt: [
    `Abre a página online e espera que o aviso de gravação offline desapareça. Depois podes reabrir o mesmo endereço sem rede. Não precisas de instalar nada. O idioma segue as preferências do navegador; uma bandeira escolhida manualmente fica guardada.`,
    `Uma pedra corresponde a uma batida, normalmente a cada 1,5 segundos. 100 pedras são 2:30 de jogo efetivo; as pausas não contam. Pedra na chapa, gongo e tambor são sons alternativos do mesmo relógio. Um ponto termina normalmente a jogada. No Golden Jugg decide o ponto seguinte; nos sets valem os objetivos configurados.`,
    `A audição do ritmo repete-se no intervalo escolhido e para ao tocar novamente. Os controlos funcionam em direto sem gastar pedras. Após um Jugg ou no fim de um período soam três batidas rápidas por defeito; podes escolher de uma a dez. Cada batida mantém o decaimento e sobrepõe-se às outras. As batidas finais não gastam pedras. Os dois volumes são independentes.`,
    `Equipas, definições, pontuação e até 30 passos de desfazer ficam apenas neste navegador. Ao reabrir, o jogo está pausado. Modo, limite e regras dos sets aplicam-se ao próximo jogo. As atualizações são descarregadas por completo e aceites com a reprodução parada. Apagar os dados do navegador remove jogos e ficheiros offline; não há cópia no servidor.`,
    `Durante o jogo e a audição é pedido que o ecrã fique ligado. Um aviso indica uma recusa. Mantém a app em primeiro plano: mudar de app, receber uma chamada ou interromper o áudio pausa o jogo. Não se garante som com o ecrã bloqueado. Verifica o altifalante e o atraso Bluetooth antes de jogar.`,
  ],
  nl: [
    `Open de pagina online en wacht tot de melding over offlinebestanden verdwijnt. Daarna kun je hetzelfde adres zonder netwerk openen. Installeren is niet nodig. De taal volgt de browserinstellingen; een handmatig gekozen vlag wordt onthouden.`,
    `Een steen is één ritmeslag, normaal elke 1,5 seconde. 100 stenen zijn 2:30 actieve speeltijd; pauzes tellen niet mee. Steen op metaal, gong en trommel zijn verschillende geluiden van dezelfde klok. Een punt beëindigt normaal de spelbeurt. Bij Golden Jugg beslist het volgende punt; bij sets gelden de ingestelde doelen.`,
    `De ritmevoorvertoning herhaalt op het gekozen interval en stopt bij opnieuw drukken. Regelaars werken direct en verbruiken geen stenen. Na een Jugg of periode-einde klinken standaard drie snelle slagen; kies één tot tien. Elke slag behoudt zijn uitklank en kan andere overlappen. Eindslagen tellen niet als stenen. Beide volumes stel je apart in.`,
    `Teams, instellingen, score en tot 30 herstelstappen worden alleen in deze browser bewaard. Een heropende wedstrijd staat op pauze. Modus, limiet en setregels gelden vanaf de volgende wedstrijd. Updates worden volledig opgehaald en overgenomen wanneer afspelen is gestopt. Browsergegevens wissen verwijdert ook wedstrijden en offlinebestanden; er is geen serverkopie.`,
    `Tijdens spelen en luisteren vraagt de app het scherm wakker te houden. Bij weigering verschijnt een melding. Houd de app op de voorgrond: een appwissel, oproep of geluidsonderbreking pauzeert de wedstrijd. Geluid bij vergrendeld scherm is niet gegarandeerd. Controleer luidspreker en Bluetoothvertraging voor de wedstrijd.`,
  ],
  da: [
    `Åbn siden online, og vent til beskeden om offlinelagring forsvinder. Derefter kan samme adresse åbnes uden net. Installation er ikke nødvendig. Sproget følger browserens indstillinger; et manuelt valgt flag huskes.`,
    `En sten er ét taktslag, normalt hvert 1,5 sekund. 100 sten svarer til 2:30 effektiv spilletid; pauser tæller ikke. Sten på metal, gong og tromme er forskellige lyde til samme ur. Et point afslutter normalt et spiltræk. I Golden Jugg afgør næste point kampen; sæt følger de valgte mål.`,
    `Taktprøven gentages med det valgte interval og stoppes ved et nyt tryk. Indstillinger virker under afspilning uden at bruge sten. Ved Jugg og periodeslut lyder som standard tre hurtige slag; vælg et til ti. Hvert slag beholder sin efterklang og kan overlappe andre. Slutslag tæller ikke som sten. De to lydstyrker indstilles hver for sig.`,
    `Hold, indstillinger, stilling og op til 30 fortrydelsestrin gemmes kun i denne browser. Ved genåbning er kampen på pause. Spiltype, grænse og sætregler gælder fra næste kamp. Opdateringer hentes helt og accepteres, når afspilningen er stoppet. Sletning af browserdata fjerner kampe og offlinefiler; ingen serverkopi findes.`,
    `Under spil og taktprøve anmodes om at holde skærmen tændt. Afvisning vises som en besked. Hold appen i forgrunden: appskift, opkald og lydafbrydelse sætter kampen på pause. Lyd med låst skærm garanteres ikke. Kontrollér højttaler og Bluetoothforsinkelse inden kamp.`,
  ],
  sv: [
    `Öppna sidan online och vänta tills meddelandet om offlinelagring försvinner. Sedan kan samma adress öppnas utan nät. Ingen installation krävs. Språket följer webbläsarens inställningar; en manuellt vald flagga sparas.`,
    `En sten är ett taktslag, normalt var 1,5 sekund. 100 stenar motsvarar 2:30 effektiv speltid; pauser räknas inte. Sten mot plåt, gong och trumma är olika ljud för samma klocka. En poäng avslutar normalt spelomgången. I Golden Jugg avgör nästa poäng; set följer de valda målen.`,
    `Taktprovet upprepas med valt intervall och stoppas med ett nytt tryck. Reglagen fungerar direkt utan att använda stenar. Vid Jugg och periodslut hörs tre snabba slag som standard; välj ett till tio. Varje slag behåller sin efterklang och kan överlappa andra. Slutslag räknas inte som stenar. De två volymerna ställs in separat.`,
    `Lag, inställningar, poäng och upp till 30 ångrasteg sparas bara i denna webbläsare. En återställd match är pausad. Läge, gräns och setregler gäller från nästa match. Uppdateringar hämtas helt och godkänns när uppspelningen stoppats. Att rensa webbläsardata tar bort matcher och offlinefiler; ingen serverkopia finns.`,
    `Under spel och taktprov begär appen att skärmen hålls vaken. Ett meddelande visas vid avslag. Håll appen i förgrunden: appbyte, samtal och ljudavbrott pausar matchen. Ljud med låst skärm garanteras inte. Kontrollera högtalare och Bluetoothfördröjning före match.`,
  ]
};

export function translatedHelp() {
  return Object.fromEntries(Object.entries(paragraphs).map(([language, p]) => {
    const t = key => texts[language][key];
    const step = keys => keys.map(t).join(' → ');
    const body = `<h1>${t('help')}</h1><p>${p[0]}</p><h2>${t('prepareMatch')}</h2><p>${step(['setupTab', 'nameTeamA', 'nameTeamB', 'gameMode', 'stonesPerPeriod', 'newMatch'])}</p><p>${t('settingsNote')}</p><h2>${t('match')}</h2><p>${p[1]}</p><p>${step(['startMatch', 'pauseMatch', 'resumeMatch'])} · ${t('undo')}</p><h2>${t('sound')}</h2><p>${step(['previewBeat', 'stopBeat'])}</p><p>${p[2]}</p><p>${p[4]}</p><h2>${t('offlineReady')}</h2><p>${p[3]}</p>`;
    return [language, { title: t('help'), body, dir: locales[language].dir || 'ltr' }];
  }));
}
