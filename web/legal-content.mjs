import { texts } from './src/i18n.mjs';
import { locales } from './src/locale.mjs';

const documents = {
  "zh-Hans": {
    "headings": [
      "服务提供者",
      "软件与设计",
      "比赛数据保留在你的设备上",
      "数据控制者",
      "浏览器本地存储",
      "GitHub Pages",
      "联系与权利"
    ],
    "imprint": [
      "用于Jugger比赛计时和计分的移动网页应用，网址为juggermaster.github.io。本应用为独立开发，并非Jugger社区的官方应用。",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. 旗帜、犬头骨和图标均为自行绘制的几何图形。不加载外部插图、队伍标志或字体文件。声音在浏览器中合成。"
    ],
    "privacy": [
      "更新日期：21.10.2026。本说明适用于juggermaster.github.io上的JUGGERMASTER。",
      "JUGGERMASTER在浏览器本地保存队伍名称和颜色、得分、石数、获胜局数、时间、声音设置、语言和外观，以及最多30步的修改记录。这些数据不会发送到我们的服务器。没有账户、同步、分析、广告、外部字体服务或跟踪Cookie。",
      "应用使用localStorage保存设置和比赛状态。Service Worker和Cache Storage会自动保存所有文件，方便以后离线打开同一网址。应用可能请求浏览器提供持久存储。此存储用于你所要求的比赛功能和离线使用（德国TDDDG第25条第2款第2项）。",
      "数据将保留到重置、删除网站数据或浏览器清理存储时。服务器上没有副本。清除浏览器数据也会删除比赛和离线文件。确认“新比赛”会替换当前比赛，但保留队伍和声音设置。",
      "应用通过GitHub Pages在juggermaster.github.io提供。在线加载时，GitHub会处理提供服务所需的IP地址、时间、请求网址和浏览器HTTP信息等连接数据。我们的目的是依据GDPR第6条第1款(f)项安全提供应用。已保存的比赛不会上传。",
      "GitHub出于安全目的记录访问者的IP地址，包括未登录GitHub的访问者。技术数据按其隐私条款处理；我们不为其日志设定固定保存期限。比赛的本地存储与此分开。",
      "托管提供者为GitHub；根据适用条款，涉及GitHub, Inc.或GitHub B.V.。数据可能在欧盟/欧洲经济区以外处理，特别是在美国。其隐私声明说明相关角色、保存原则和传输保障，包括在适用时采用的欧盟—美国数据隐私框架及标准合同条款。",
      "托管详情与提供者联系方式：{github}。托管连接在在线加载时建立。其他外部信息网页只有点击链接后才会连接。",
      "如果你发送电子邮件，我们会为回复而处理数据（GDPR第6条第1款(f)项；合同相关问题在适用时依据(b)项）。邮件在上述邮箱中处理，不再需要用于答复、举证或法定保存时即删除。",
      "在符合GDPR条件时，你享有访问、更正、删除、限制处理、数据可携带和反对的权利。你可以撤回同意，对今后生效。请通过上述联系方式联系。我们无法访问仅保存在你设备上的比赛。你可以向监管机构投诉，特别是下萨克森州的{authority}。应用不进行画像或产生法律效力的自动化决策。"
    ]
  },
  "zh-Hant": {
    "headings": [
      "服務提供者",
      "軟體與設計",
      "比賽資料保留在你的裝置上",
      "資料控管者",
      "瀏覽器本機儲存",
      "GitHub Pages",
      "聯絡與權利"
    ],
    "imprint": [
      "用於Jugger比賽計時和計分的行動網頁應用程式，網址為juggermaster.github.io。本應用程式為獨立開發，並非Jugger社群的官方應用程式。",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. 旗幟、犬頭骨和圖示均為自行繪製的幾何圖形。不載入外部插圖、隊伍標誌或字型檔案。聲音在瀏覽器中合成。"
    ],
    "privacy": [
      "更新日期：21.10.2026。本說明適用於juggermaster.github.io上的JUGGERMASTER。",
      "JUGGERMASTER在瀏覽器本機儲存隊伍名稱和顏色、得分、石數、獲勝局數、時間、聲音設定、語言和外觀，以及最多30步的修改紀錄。這些資料不會傳送到我們的伺服器。沒有帳號、同步、分析、廣告、外部字型服務或追蹤Cookie。",
      "應用程式使用localStorage儲存設定和比賽狀態。Service Worker和Cache Storage會自動儲存所有檔案，方便日後離線開啟同一網址。應用程式可能要求瀏覽器提供永久儲存空間。此儲存用於你所要求的比賽功能和離線使用（德國TDDDG第25條第2項第2款）。",
      "資料會保留到重設、刪除網站資料或瀏覽器清理儲存空間時。伺服器上沒有副本。清除瀏覽器資料也會刪除比賽和離線檔案。確認「新比賽」會取代目前比賽，但保留隊伍和聲音設定。",
      "應用程式透過GitHub Pages在juggermaster.github.io提供。線上載入時，GitHub會處理提供服務所需的IP位址、時間、要求網址及瀏覽器HTTP資訊等連線資料。我們的目的是依據GDPR第6條第1項(f)款安全提供應用程式。已儲存的比賽不會上傳。",
      "GitHub出於安全目的記錄訪客的IP位址，包括未登入GitHub的訪客。技術資料依其隱私條款處理；我們不為其日誌設定固定保存期限。比賽的本機儲存與此分開。",
      "託管提供者為GitHub；依適用條款，涉及GitHub, Inc.或GitHub B.V.。資料可能在歐盟/歐洲經濟區以外處理，尤其在美國。其隱私聲明說明相關角色、保存原則與傳輸保障，包括在適用時採用的歐盟—美國資料隱私框架及標準契約條款。",
      "託管詳情與提供者聯絡方式：{github}。託管連線在線上載入時建立。其他外部資訊網頁只有點擊連結後才會連線。",
      "如果你傳送電子郵件，我們會為回覆而處理資料（GDPR第6條第1項(f)款；合約相關問題在適用時依據(b)款）。郵件在上述信箱中處理，不再需要用於答覆、舉證或法定保存時即刪除。",
      "符合GDPR條件時，你享有查閱、更正、刪除、限制處理、資料可攜和反對的權利。你可以撤回同意，對日後生效。請透過上述聯絡方式聯絡。我們無法存取僅儲存在你裝置上的比賽。你可以向監管機關申訴，特別是下薩克森邦的{authority}。應用程式不進行剖析或具有法律效力的自動化決策。"
    ]
  },
  "ja": {
    "headings": [
      "提供者",
      "ソフトウェアとデザイン",
      "試合データは端末内に保存",
      "データ管理者",
      "ブラウザーのローカル保存",
      "GitHub Pages",
      "お問い合わせと権利"
    ],
    "imprint": [
      "juggermaster.github.ioでJuggerの時間と得点を記録するモバイルウェブアプリです。独自に開発したもので、Juggerコミュニティの公式アプリではありません。",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. 旗、犬の頭蓋骨、アイコンは独自の幾何学的な図案です。外部のイラスト、チームロゴ、フォントファイルは読み込みません。音はブラウザー内で合成します。"
    ],
    "privacy": [
      "更新日：21.10.2026。この説明はjuggermaster.github.ioのJUGGERMASTERに適用されます。",
      "JUGGERMASTERはチーム名と色、得点、ストーン、獲得セット、時間、音の設定、言語、表示設定、および最大30段階の修正履歴をブラウザー内に保存します。これらのデータは当方のサーバーに送信されません。アカウント、同期、アクセス解析、広告、外部フォントサービス、追跡Cookieはありません。",
      "設定と試合状況にはlocalStorageを使います。Service WorkerとCache Storageがすべてのファイルを自動保存し、同じアドレスを後でオフラインでも開けるようにします。ブラウザーに永続ストレージを要求する場合があります。この保存は、利用者が求めた試合機能とオフライン利用のためのものです（ドイツTDDDG第25条第2項第2号）。",
      "データはリセット、サイトデータの削除、またはブラウザーによるストレージ整理まで残ります。サーバー側のコピーはありません。ブラウザーデータを削除すると試合とオフラインファイルも削除されます。「新しい試合」の確認後は現在の試合が置き換わり、チームと音の設定は残ります。",
      "アプリはGitHub Pagesを通じてjuggermaster.github.ioで配信されます。オンライン読み込み時、GitHubはIPアドレス、時刻、要求URL、ブラウザーのHTTP情報など、配信に必要な接続情報を処理します。当方の目的は安全な配信で、根拠はGDPR第6条第1項(f)です。保存済みの試合はアップロードされません。",
      "GitHubはアカウントの有無にかかわらず、セキュリティーのために訪問者のIPアドレスを記録します。技術情報はGitHubのプライバシー条件に従って処理され、当方はそのログの固定保存期間を定めません。試合のローカル保存は別の処理です。",
      "配信事業者はGitHubで、適用条件に応じてGitHub, Inc.またはGitHub B.V.が関与します。米国を含むEU/EEA域外で処理される可能性があります。方針では各役割、保存原則、適用に応じたEU-US Data Privacy Frameworkや標準契約条項などの移転保護措置が説明されています。",
      "事業者の詳細と連絡先：{github}。配信先への接続はオンライン読み込み時に発生します。その他の外部情報サイトにはリンクを押した後にのみ接続します。",
      "メールをいただいた場合、回答のためにデータを処理します（GDPR第6条第1項(f)、契約に関する問い合わせでは該当する場合に(b)）。記載のメールボックスで対応し、問い合わせへの対応、証明、法定保存のために必要でなくなった時点で削除します。",
      "GDPRの条件に従い、開示、訂正、削除、処理の制限、データポータビリティー、異議申立ての権利があります。同意は将来に向けて撤回できます。記載の連絡先へお問い合わせください。当方は端末内だけに保存された試合にアクセスできません。監督機関、特にニーダーザクセン州の{authority}に苦情を申し立てることができます。アプリはプロファイリングや法的効果のある自動意思決定を行いません。"
    ]
  },
  "ko": {
    "headings": [
      "서비스 제공자",
      "소프트웨어 및 디자인",
      "경기는 내 기기에 저장됩니다",
      "개인정보 처리 책임자",
      "브라우저 로컬 저장소",
      "GitHub Pages",
      "문의 및 권리"
    ],
    "imprint": [
      "juggermaster.github.io에서 Jugger 경기 시간과 점수를 기록하는 모바일 웹 앱입니다. 독립적으로 제작했으며 Jugger 커뮤니티의 공식 앱은 아닙니다.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. 국기, 개 두개골, 아이콘은 직접 만든 기하학적 그림입니다. 외부 삽화, 팀 로고 또는 글꼴 파일을 불러오지 않습니다. 소리는 브라우저에서 합성합니다."
    ],
    "privacy": [
      "업데이트: 21.10.2026. 이 안내는 juggermaster.github.io의 JUGGERMASTER에 적용됩니다.",
      "JUGGERMASTER는 팀 이름과 색상, 점수, 스톤, 승리한 세트, 시간, 소리 설정, 언어, 화면 설정과 최대 30단계의 수정 기록을 브라우저에 로컬로 저장합니다. 이 데이터는 당사 서버로 전송되지 않습니다. 계정, 동기화, 분석, 광고, 외부 글꼴 서비스, 추적 쿠키가 없습니다.",
      "설정과 경기 상태는 localStorage에 저장됩니다. Service Worker와 Cache Storage는 모든 파일을 자동으로 저장하여 나중에 같은 주소를 오프라인으로 열 수 있게 합니다. 앱이 브라우저의 영구 저장소를 요청할 수 있습니다. 이 저장은 사용자가 요청한 경기 기능과 오프라인 사용을 위한 것입니다(독일 TDDDG 제25조 제2항 제2호).",
      "데이터는 초기화, 사이트 데이터 삭제 또는 브라우저의 저장소 정리 시까지 남습니다. 서버 사본은 없습니다. 브라우저 데이터를 지우면 경기와 오프라인 파일도 삭제됩니다. ‘새 경기’를 확인하면 현재 경기는 교체되고 팀과 소리 설정은 유지됩니다.",
      "앱은 GitHub Pages를 통해 juggermaster.github.io에서 제공됩니다. 온라인으로 불러올 때 GitHub는 IP 주소, 시간, 요청 주소와 브라우저 HTTP 정보 등 제공에 필요한 연결 정보를 처리합니다. 당사의 목적은 GDPR 제6조 제1항 (f)에 따른 안전한 제공입니다. 저장된 경기는 업로드하지 않습니다.",
      "GitHub는 계정이 없는 방문자의 IP 주소도 보안을 위해 기록합니다. 기술 정보는 GitHub의 개인정보 조건에 따라 처리하며, 당사는 그 로그의 고정 보관 기간을 정하지 않습니다. 경기의 로컬 저장은 별개입니다.",
      "호스팅 제공자는 GitHub이며 적용 조건에 따라 GitHub, Inc. 또는 GitHub B.V.가 관여합니다. 미국 등 EU/EEA 밖에서 처리될 수 있습니다. 정책에는 역할, 보관 원칙, 해당하는 경우 EU-US Data Privacy Framework 및 표준계약조항 등 이전 보호조치가 설명되어 있습니다.",
      "제공자 정보 및 연락처: {github}. 호스팅 연결은 온라인으로 불러올 때 이루어집니다. 다른 외부 정보 사이트에는 링크를 누른 후에만 연결됩니다.",
      "이메일을 보내면 답변을 위해 데이터를 처리합니다(GDPR 제6조 제1항 (f), 계약 관련 문의에는 해당하는 경우 (b)). 안내된 메일함에서 메시지를 처리하고 문의 대응, 증명 또는 법정 보관에 더 이상 필요하지 않으면 삭제합니다.",
      "GDPR의 요건에 따라 열람, 정정, 삭제, 처리 제한, 데이터 이동 및 이의 제기 권리가 있습니다. 동의는 향후에 대해 철회할 수 있습니다. 안내된 연락처로 문의하세요. 당사는 기기에만 저장된 경기에 접근할 수 없습니다. 감독기관, 특히 니더작센주의 {authority}에 민원을 제기할 수 있습니다. 앱은 프로파일링이나 법적 효력을 갖는 자동화된 결정을 하지 않습니다."
    ]
  },
  "uk": {
    "headings": [
      "Постачальник",
      "Програмне забезпечення та оформлення",
      "Матч залишається на вашому пристрої",
      "Контролер даних",
      "Локальне сховище браузера",
      "GitHub Pages",
      "Контакти та права"
    ],
    "imprint": [
      "Мобільний вебзастосунок для відліку часу й очок у Jugger на juggermaster.github.io. Незалежна реалізація; це не офіційний застосунок спільноти Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Прапори, собачий череп та піктограми — власні геометричні малюнки. Зовнішні ілюстрації, логотипи команд і файли шрифтів не завантажуються. Звуки синтезуються у браузері."
    ],
    "privacy": [
      "Оновлено: 21.10.2026. Ця інформація описує JUGGERMASTER на juggermaster.github.io.",
      "JUGGERMASTER локально зберігає у браузері назви й кольори команд, очки, камені, виграні сети, час, налаштування звуку, мову та оформлення, включно з 30 кроками виправлення. Ці дані не надсилаються на наш сервер. Немає облікових записів, синхронізації, аналітики, реклами, зовнішніх сервісів шрифтів або відстежувальних cookies.",
      "Застосунок використовує localStorage для налаштувань і стану матчу. Service Worker і Cache Storage автоматично зберігають усі файли, щоб згодом відкрити ту саму адресу офлайн. Застосунок може запитати постійне сховище браузера. Зберігання забезпечує запитані вами гру й офлайн-користування (§ 25 абз. 2 п. 2 TDDDG).",
      "Дані залишаються до скидання, видалення даних сайту або очищення браузером. Серверної копії немає. Очищення даних браузера також видаляє матчі й офлайн-файли. Підтвердження «Новий матч» замінює поточний матч зі збереженням команд і налаштувань звуку.",
      "Застосунок розміщено на juggermaster.github.io через GitHub Pages. Під час онлайн-завантаження GitHub обробляє потрібні дані: IP-адресу, час, запитану адресу та HTTP-інформацію браузера. Наша мета — безпечне надання за ст. 6 п. 1 підп. f GDPR. Збережені матчі на сервер не завантажуються.",
      "GitHub реєструє IP-адреси відвідувачів для безпеки, зокрема без облікового запису GitHub. Технічні дані обробляються за його умовами конфіденційності; ми не встановлюємо фіксованого строку для його журналів. Локальне зберігання матчів відокремлене.",
      "Постачальник хостингу — GitHub; за відповідними умовами беруть участь GitHub, Inc. або GitHub B.V. Можлива обробка поза ЄС/ЄЕЗ, зокрема у США. Політика описує ролі, зберігання й гарантії передачі, включно із застосовними EU-US Data Privacy Framework та стандартними договірними положеннями.",
      "Подробиці й контакти постачальника: {github}. З’єднання з хостингом виникає під час онлайн-завантаження. Інші зовнішні інформаційні сторінки викликаються лише після переходу за посиланням.",
      "Якщо ви пишете електронною поштою, дані обробляються для відповіді (ст. 6 п. 1 підп. f GDPR; у договірних питаннях за потреби підп. b). Повідомлення обробляється у вказаній скриньці й видаляється, коли більше не потрібне для запиту, доказів або зберігання за законом.",
      "Згідно з GDPR ви маєте права на доступ, виправлення, видалення, обмеження обробки, перенесення даних і заперечення. Згоду можна відкликати на майбутнє. Звертайтеся за вказаними контактами. Ми не маємо доступу до матчів, збережених лише на вашому пристрої. Можна подати скаргу наглядовому органу, зокрема {authority} у Нижній Саксонії. Застосунок не здійснює профілювання або автоматизованих рішень з юридичними наслідками."
    ]
  },
  "he": {
    "headings": [
      "ספק השירות",
      "תוכנה ועיצוב",
      "המשחק נשאר במכשיר שלך",
      "האחראי לעיבוד הנתונים",
      "אחסון מקומי בדפדפן",
      "GitHub Pages",
      "יצירת קשר וזכויות"
    ],
    "imprint": [
      "יישום אינטרנט לנייד למדידת זמן וניקוד ב־Jugger בכתובת juggermaster.github.io. מימוש עצמאי; זה אינו היישום הרשמי של קהילת Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. הדגלים, גולגולת הכלב והסמלים הם איורים גאומטריים מקוריים שלנו. לא נטענים איורים חיצוניים, סמלי קבוצות או קובצי גופנים. הצלילים מסונתזים בדפדפן."
    ],
    "privacy": [
      "עודכן: 21.10.2026. מידע זה מתאר את JUGGERMASTER בכתובת juggermaster.github.io.",
      "JUGGERMASTER שומר מקומית בדפדפן שמות וצבעי קבוצות, נקודות, אבנים, מערכות שנוצחו, זמנים, הגדרות צליל, שפה ומראה, כולל עד 30 צעדי תיקון. הנתונים האלה אינם נשלחים לשרת שלנו. אין חשבונות, סנכרון, ניתוח שימוש, פרסומות, שירותי גופנים חיצוניים או עוגיות מעקב.",
      "היישום משתמש ב־localStorage לשמירת ההגדרות ומצב המשחק. Service Worker ו־Cache Storage שומרים אוטומטית את כל הקבצים כדי שיהיה אפשר לפתוח שוב את אותה הכתובת ללא חיבור. היישום עשוי לבקש אחסון קבוע בדפדפן. האחסון משמש להפעלת המשחק ולשימוש ללא חיבור שביקשת (§ 25, סעיף קטן 2, פסקה 2 של TDDDG).",
      "הנתונים נשארים עד לאיפוס, למחיקת נתוני האתר או לניקוי האחסון בידי הדפדפן. אין עותק בשרת. מחיקת נתוני הדפדפן מסירה גם משחקים וקבצים לשימוש ללא חיבור. אישור ״משחק חדש״ מחליף את המשחק הנוכחי ושומר את הקבוצות ואת הגדרות הצליל.",
      "היישום מתארח ב־juggermaster.github.io דרך GitHub Pages. בטעינה מקוונת GitHub מעבד נתוני חיבור נחוצים: כתובת IP, זמן, הכתובת המבוקשת ומידע HTTP של הדפדפן. מטרתנו היא אספקה מאובטחת לפי סעיף 6(1)(f) ל־GDPR. משחקים שמורים אינם מועלים לשרת.",
      "GitHub מתעד כתובות IP של מבקרים לצורכי אבטחה, גם ללא חשבון GitHub. המידע הטכני מעובד לפי תנאי הפרטיות שלו; איננו קובעים תקופת שמירה קבועה ליומניו. אחסון המשחקים המקומי נפרד.",
      "ספק האירוח הוא GitHub; לפי התנאים החלים מעורבות GitHub, Inc. או GitHub B.V. ייתכן עיבוד מחוץ לאיחוד האירופי ולאזור הכלכלי האירופי, ובפרט בארצות הברית. המדיניות מתארת תפקידים, שמירה והגנות להעברה, כולל מסגרת פרטיות הנתונים של האיחוד האירופי וארצות הברית וסעיפים חוזיים סטנדרטיים כאשר הם חלים.",
      "פרטים ודרכי קשר לספק: {github}. חיבור האירוח נוצר בטעינה מקוונת. דפי מידע חיצוניים אחרים נפתחים רק לאחר לחיצה על הקישורים שלהם.",
      "אם נשלח אלינו דוא״ל, הנתונים מעובדים לצורך מתן מענה (סעיף 6(1)(f) ל־GDPR; בשאלות חוזיות, לפי העניין, סעיף קטן (b)). ההודעה מטופלת בתיבת הדואר המצוינת ונמחקת כשאינה נחוצה עוד לטיפול בפנייה, להוכחה או לשמירה הנדרשת בחוק.",
      "בכפוף לתנאי ה־GDPR עומדות לך זכויות לעיון, לתיקון, למחיקה, להגבלת עיבוד, לניידות נתונים ולהתנגדות. אפשר לבטל הסכמה לגבי העתיד. ניתן לפנות באמצעות פרטי הקשר המצוינים. אין לנו גישה למשחקים השמורים רק במכשיר שלך. אפשר להגיש תלונה לרשות פיקוח, ובפרט ל־{authority} בסקסוניה התחתונה. היישום אינו מבצע אפיון או קבלת החלטות אוטומטית בעלת השלכות משפטיות."
    ]
  },
  "lv": {
    "headings": [
      "Pakalpojuma sniedzējs",
      "Programmatūra un dizains",
      "Spēle paliek tavā ierīcē",
      "Datu pārzinis",
      "Pārlūka vietējā krātuve",
      "GitHub Pages",
      "Saziņa un tiesības"
    ],
    "imprint": [
      "Mobilā tīmekļa lietotne Jugger laika un punktu skaitīšanai vietnē juggermaster.github.io. Neatkarīgs risinājums; tā nav oficiāla Jugger kopienas lietotne.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Karogi, suņa galvaskauss un ikonas ir pašu ģeometriski zīmējumi. Netiek ielādētas ārējas ilustrācijas, komandu logotipi vai fontu faili. Skaņas tiek sintezētas pārlūkā."
    ],
    "privacy": [
      "Atjaunināts: 21.10.2026. Šī informācija apraksta JUGGERMASTER vietnē juggermaster.github.io.",
      "JUGGERMASTER pārlūkā lokāli saglabā komandu nosaukumus un krāsas, punktus, akmeņus, uzvarētos setus, laikus, skaņas iestatījumus, valodu un izskatu, arī līdz 30 labojumu soļiem. Šie dati netiek sūtīti uz mūsu serveri. Nav kontu, sinhronizācijas, analītikas, reklāmu, ārēju fontu pakalpojumu vai izsekošanas sīkdatņu.",
      "Lietotne izmanto localStorage iestatījumiem un spēles stāvoklim. Service Worker un Cache Storage automātiski saglabā visus failus, lai to pašu adresi vēlāk varētu atvērt bezsaistē. Lietotne var lūgt pastāvīgu pārlūka krātuvi. Šī glabāšana kalpo tavam pieprasītajam spēles darbam un bezsaistes lietošanai (§ 25 2. daļas 2. punkts TDDDG).",
      "Dati paliek līdz atiestatīšanai, vietnes datu dzēšanai vai pārlūka krātuves tīrīšanai. Servera kopijas nav. Pārlūka datu dzēšana izdzēš arī spēles un bezsaistes failus. Apstiprinot «Jauna spēle», pašreizējā spēle tiek aizstāta, saglabājot komandas un skaņas iestatījumus.",
      "Lietotne ir pieejama juggermaster.github.io, izmantojot GitHub Pages. Ielādējot tiešsaistē, GitHub apstrādā nepieciešamos savienojuma datus: IP adresi, laiku, pieprasīto adresi un pārlūka HTTP informāciju. Mūsu mērķis ir droša nodrošināšana, pamatojoties uz VDAR 6. panta 1. punkta f) apakšpunktu. Saglabātās spēles netiek augšupielādētas.",
      "GitHub drošības nolūkos reģistrē apmeklētāju IP adreses arī bez GitHub konta. Tehniskos datus apstrādā saskaņā ar saviem privātuma noteikumiem; mēs nenosakām fiksētu termiņu tā žurnāliem. Spēļu vietējā glabāšana ir nodalīta.",
      "Pakalpojuma sniedzējs ir GitHub; saskaņā ar piemērojamiem noteikumiem iesaistās GitHub, Inc. vai GitHub B.V. Iespējama apstrāde ārpus ES/EEZ, īpaši ASV. Paziņojumā aprakstītas lomas, glabāšana un pārsūtīšanas garantijas, tostarp attiecīgā gadījumā ES un ASV datu privātuma regulējums un standarta līguma klauzulas.",
      "Sniedzēja informācija un kontakti: {github}. Savienojums ar mitināšanu rodas, ielādējot tiešsaistē. Citas ārējās informācijas lapas tiek atvērtas tikai pēc to saišu nospiešanas.",
      "Ja nosūti e-pastu, datus apstrādājam atbildes sniegšanai (VDAR 6. panta 1. punkta f), līgumiskos jautājumos attiecīgā gadījumā b) apakšpunkts). Ziņa tiek apstrādāta norādītajā pastkastē un dzēsta, kad vairs nav vajadzīga jautājuma risināšanai, pierādījumiem vai likumā noteiktai glabāšanai.",
      "Saskaņā ar VDAR pastāv tiesības piekļūt datiem, tos labot, dzēst, ierobežot apstrādi, pārnest un iebilst. Piekrišanu var atsaukt turpmākai darbībai. Izmanto norādīto kontaktu. Mums nav piekļuves spēlēm, kas glabājas tikai tavā ierīcē. Vari iesniegt sūdzību uzraudzības iestādei, īpaši {authority} Lejassaksijā. Lietotne neveic profilēšanu vai automatizētus lēmumus ar juridiskām sekām."
    ]
  },
  "lt": {
    "headings": [
      "Paslaugos teikėjas",
      "Programinė įranga ir dizainas",
      "Rungtynės lieka tavo įrenginyje",
      "Duomenų valdytojas",
      "Vietinė naršyklės saugykla",
      "GitHub Pages",
      "Kontaktai ir teisės"
    ],
    "imprint": [
      "Mobilioji žiniatinklio programėlė Jugger laikui ir taškams skaičiuoti adresu juggermaster.github.io. Savarankiškas įgyvendinimas; tai nėra oficiali Jugger bendruomenės programėlė.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Vėliavos, šuns kaukolė ir piktogramos yra pačių sukurti geometriniai piešiniai. Neįkeliamos išorinės iliustracijos, komandų logotipai ar šriftų failai. Garsai sintetinami naršyklėje."
    ],
    "privacy": [
      "Atnaujinta: 21.10.2026. Ši informacija aprašo JUGGERMASTER adresu juggermaster.github.io.",
      "JUGGERMASTER vietoje naršyklėje saugo komandų pavadinimus ir spalvas, taškus, akmenis, laimėtus setus, laikus, garso nustatymus, kalbą ir išvaizdą, įskaitant iki 30 taisymo žingsnių. Šie duomenys neperduodami mūsų serveriui. Nėra paskyrų, sinchronizavimo, analizės, reklamos, išorinių šriftų paslaugų ar sekimo slapukų.",
      "Nustatymams ir rungtynėms naudojama localStorage. Service Worker ir Cache Storage automatiškai išsaugo visus failus, kad tą patį adresą būtų galima atverti be ryšio. Programėlė gali prašyti nuolatinės naršyklės saugyklos. Saugojimas skirtas tavo prašytam žaidimui ir naudojimui be ryšio (§ 25 2 dalies 2 punktas TDDDG).",
      "Duomenys lieka iki atkūrimo į pradinę būseną, svetainės duomenų ištrynimo ar naršyklės atliekamo valymo. Serverio kopijos nėra. Naršyklės duomenų išvalymas pašalina ir rungtynes bei failus darbui be ryšio. Patvirtinus „Naujos rungtynės“, esamos rungtynės pakeičiamos, išsaugant komandas ir garso nustatymus.",
      "Programėlė pasiekiama juggermaster.github.io per GitHub Pages. Įkeliant internetu GitHub tvarko būtinus ryšio duomenis: IP adresą, laiką, prašomą adresą ir naršyklės HTTP informaciją. Mūsų tikslas – saugus pateikimas pagal BDAR 6 straipsnio 1 dalies f punktą. Išsaugotos rungtynės neįkeliamos.",
      "GitHub saugumo tikslais registruoja lankytojų IP adresus ir be GitHub paskyros. Techninius duomenis tvarko pagal savo privatumo sąlygas; jo žurnalams nenustatome fiksuoto saugojimo termino. Vietinis rungtynių saugojimas atskiras.",
      "Paslaugos teikėjas yra GitHub; pagal taikomas sąlygas dalyvauja GitHub, Inc. arba GitHub B.V. Galimas tvarkymas už ES/EEE ribų, ypač JAV. Pranešime aprašomi vaidmenys, saugojimas ir perdavimo garantijos, įskaitant taikomą ES ir JAV duomenų privatumo sistemą bei standartines sutarčių sąlygas.",
      "Teikėjo informacija ir kontaktai: {github}. Prieiga prie prieglobos atsiranda įkeliant internetu. Kiti išoriniai informaciniai puslapiai pasiekiami tik paspaudus jų nuorodas.",
      "Jei parašai el. laišką, duomenis tvarkome atsakymui pateikti (BDAR 6 straipsnio 1 dalies f punktas, sutartiniams klausimams atitinkamai b punktas). Laiškas tvarkomas nurodytoje pašto dėžutėje ir ištrinamas, kai nebereikalingas užklausai, įrodymams ar teisiniam saugojimui.",
      "Pagal BDAR turi teisę susipažinti, ištaisyti, ištrinti, apriboti tvarkymą, perkelti duomenis ir nesutikti. Sutikimą galima atšaukti ateičiai. Naudok nurodytus kontaktus. Negalime pasiekti vien tavo įrenginyje saugomų rungtynių. Gali skųstis priežiūros institucijai, ypač {authority} Žemutinėje Saksonijoje. Programėlė neprofiliuoja ir nepriima automatinių sprendimų, turinčių teisinių pasekmių."
    ]
  },
  "ru": {
    "headings": [
      "Поставщик",
      "Программное обеспечение и оформление",
      "Матч остаётся на вашем устройстве",
      "Ответственный за обработку",
      "Локальное хранилище браузера",
      "GitHub Pages",
      "Контакты и права"
    ],
    "imprint": [
      "Мобильное веб-приложение для отсчёта времени и очков в Jugger на juggermaster.github.io. Независимая реализация; не является официальным приложением сообщества Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Флаги, собачий череп и значки — собственные геометрические рисунки. Внешние иллюстрации, логотипы команд и файлы шрифтов не загружаются. Звуки синтезируются в браузере."
    ],
    "privacy": [
      "Обновлено: 21.10.2026. Здесь описывается JUGGERMASTER на juggermaster.github.io.",
      "JUGGERMASTER хранит в браузере названия и цвета команд, очки, камни, выигранные сеты, время, настройки звука, язык и оформление, включая до 30 шагов исправления. Эти сведения не передаются на наш сервер. Нет аккаунтов, синхронизации, аналитики, рекламы, внешних сервисов шрифтов и отслеживающих cookies.",
      "Приложение использует localStorage для настроек и матча. Service Worker и Cache Storage автоматически сохраняют все файлы, чтобы позже открыть тот же адрес офлайн. Может запрашиваться постоянное хранилище браузера. Хранение служит запрошенной вами работе игры и офлайн-использованию (§ 25 абз. 2 п. 2 TDDDG).",
      "Данные сохраняются до сброса, удаления данных сайта или очистки браузером. Серверной копии нет. Очистка браузера удаляет также матчи и офлайн-файлы. Подтверждение «Новый матч» заменяет текущий матч, сохраняя команды и настройки звука.",
      "Приложение размещено на juggermaster.github.io через GitHub Pages. При загрузке онлайн GitHub обрабатывает необходимые данные: IP-адрес, время, запрошенный адрес и HTTP-информацию браузера. Наша цель — безопасная доставка на основании ст. 6 п. 1 подп. f GDPR. Сохранённые матчи не загружаются на сервер.",
      "GitHub регистрирует IP-адреса посетителей для безопасности, в том числе без аккаунта GitHub. Технические данные обрабатываются по его условиям конфиденциальности; мы не устанавливаем фиксированный срок для его журналов. Локальное хранение матчей отделено от этого.",
      "Поставщик хостинга — GitHub; по применимым условиям участвуют GitHub, Inc. или GitHub B.V. Возможна обработка за пределами ЕС/ЕЭЗ, особенно в США. Политика описывает роли, хранение и гарантии передачи, включая применимые EU-US Data Privacy Framework и стандартные договорные положения.",
      "Подробности и контакты поставщика: {github}. Соединение с хостингом возникает при загрузке онлайн. Другие внешние информационные страницы вызываются только после перехода по ссылке.",
      "Если вы пишете по электронной почте, сведения обрабатываются для ответа (ст. 6 п. 1 подп. f GDPR; для договорных вопросов при необходимости подп. b). Сообщение обрабатывается через указанный почтовый ящик и удаляется, когда больше не нужно для обращения, доказательств или обязательного хранения по закону.",
      "Согласно GDPR вы имеете права доступа, исправления, удаления, ограничения, переноса данных и возражения. Согласие можно отозвать на будущее. Обращайтесь по указанным контактам. У нас нет доступа к матчам, сохранённым только на вашем устройстве. Можно подать жалобу надзорному органу, в частности {authority}, в Нижней Саксонии. Приложение не выполняет профилирование и автоматические решения с юридическими последствиями."
    ]
  },
  "cs": {
    "headings": [
      "Poskytovatel",
      "Software a vzhled",
      "Zápas zůstává na vašem zařízení",
      "Správce údajů",
      "Místní úložiště prohlížeče",
      "GitHub Pages",
      "Kontakt a práva"
    ],
    "imprint": [
      "Mobilní webová aplikace pro měření času a bodů v Juggeru na juggermaster.github.io. Samostatná realizace; nejde o oficiální aplikaci komunity Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Vlajky, psí lebka a ikony aplikace jsou vlastní geometrické kresby. Nenačítají se externí ilustrace, týmová loga ani soubory písem. Zvuky vznikají synteticky v prohlížeči."
    ],
    "privacy": [
      "Aktualizováno: 21.10.2026. Tyto informace popisují JUGGERMASTER na juggermaster.github.io.",
      "JUGGERMASTER ukládá místně v prohlížeči názvy a barvy týmů, body, kameny, vyhrané sety, herní časy, zvuková nastavení, jazyk a vzhled včetně až 30 kroků oprav. Tyto údaje neposílá na náš server. Neexistují účty, synchronizace, analytika, reklamy, externí služby písem ani sledovací cookies.",
      "Aplikace používá localStorage pro nastavení a stav zápasu. Service Worker a Cache Storage automaticky ukládají všechny soubory, aby šlo stejnou adresu později otevřít offline. Aplikace může požádat o trvalé úložiště. Ukládání slouží vámi požadovanému provozu hry a offline použití (§ 25 odst. 2 bod 2 TDDDG).",
      "Údaje zůstávají do resetu, smazání dat webu nebo vyčištění úložiště prohlížečem. Serverová kopie neexistuje. Smazání dat prohlížeče odstraní také zápasy a offline soubory. Potvrzení „Nový zápas“ nahradí aktuální zápas a ponechá týmy a nastavení zvuku.",
      "Aplikace je dostupná na juggermaster.github.io přes GitHub Pages. Při online načítání GitHub zpracovává nezbytné údaje: IP adresu, čas, požadovanou adresu a HTTP informace prohlížeče. Naším účelem je bezpečné poskytování podle čl. 6 odst. 1 písm. f GDPR. Uložené zápasy se neodesílají.",
      "GitHub zaznamenává IP adresy návštěvníků pro bezpečnost i bez účtu GitHub. Technické údaje zpracovává podle svých podmínek ochrany soukromí; neurčujeme pevnou dobu uchování jeho logů. Místní ukládání zápasů je oddělené.",
      "Poskytovatelem je GitHub; podle platných podmínek se účastní GitHub, Inc. nebo GitHub B.V. Je možné zpracování mimo EU/EHP, zejména v USA. Zásady popisují role, uchování a záruky předávání, včetně příslušného EU-US Data Privacy Framework a standardních smluvních doložek.",
      "Podrobnosti a kontakt poskytovatele: {github}. Hostingové připojení vzniká při online načítání. Ostatní externí informační stránky se kontaktují až po kliknutí na odkaz.",
      "Při e-mailu zpracováváme vaše údaje k zodpovězení dotazu (čl. 6 odst. 1 písm. f GDPR; u smluvních dotazů případně písm. b). Zpráva se vyřizuje v uvedené schránce a smaže se, jakmile není potřeba pro dotaz, dokazování nebo zákonné uchování.",
      "Podle GDPR máte práva na přístup, opravu, výmaz, omezení, přenositelnost a námitku. Souhlas lze odvolat do budoucna. Použijte uvedený kontakt. Nemáme přístup k zápasům uloženým jen na vašem zařízení. Můžete podat stížnost dozorovému úřadu, zejména {authority}, v Dolním Sasku. Aplikace neprovádí profilování ani automatická rozhodnutí s právními účinky."
    ]
  },
  "hu": {
    "headings": [
      "Szolgáltató",
      "Szoftver és megjelenés",
      "A mérkőzés a készülékeden marad",
      "Adatkezelő",
      "Helyi böngészőtárhely",
      "GitHub Pages",
      "Kapcsolat és jogok"
    ],
    "imprint": [
      "Mobil webalkalmazás a Jugger játékidejének és pontjainak mérésére a juggermaster.github.io címen. Önálló megvalósítás; nem a Jugger-közösség hivatalos alkalmazása.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. A zászlók, a kutyakoponya és az ikonok saját geometriai rajzok. Nem töltünk be külső illusztrációkat, csapatlogókat vagy betűkészletfájlokat. A hangok szintetikusan, a böngészőben készülnek."
    ],
    "privacy": [
      "Frissítve: 21.10.2026. Ez a tájékoztató a juggermaster.github.io címen működő JUGGERMASTERre vonatkozik.",
      "A JUGGERMASTER a böngészőben helyben tárolja a csapatneveket és színeket, pontokat, köveket, nyert szetteket, játékidőket, hangbeállításokat, nyelvet és megjelenést, legfeljebb 30 javítási lépéssel. Ezeket nem küldi a szerverünkre. Nincsenek fiókok, szinkronizálás, elemzés, reklámok, külső betűkészlet-szolgáltatások vagy követősütik.",
      "Az alkalmazás localStorage-ot használ a beállításokhoz és az álláshoz. A Service Worker és a Cache Storage automatikusan menti az összes fájlt, hogy ugyanaz a cím később offline is megnyitható legyen. Tartós böngészőtárhelyet is kérhet. A tárolás az általad kért játékot és offline használatot szolgálja (TDDDG 25. § (2) bekezdés 2. pont).",
      "Az adatok visszaállításig, a webhelyadatok törléséig vagy a böngésző takarításáig maradnak meg. Nincs szerveres másolat. A böngészőadatok törlése a játékokat és az offline fájlokat is eltávolítja. Az „Új mérkőzés” megerősítése lecseréli az aktuális állást, de megtartja a csapatokat és a hangbeállításokat.",
      "Az alkalmazás a juggermaster.github.io címen, GitHub Pages szolgáltatáson érhető el. Online betöltéskor a GitHub kezeli a szükséges kapcsolatadatokat: IP-cím, idő, kért cím és a böngésző HTTP-adatai. Célunk a biztonságos szolgáltatás a GDPR 6. cikk (1) f) alapján. A mentett mérkőzéseket nem töltjük fel.",
      "A GitHub biztonsági célból naplózza a látogatók IP-címét, GitHub-fiók nélkül is. A technikai adatokat saját adatvédelmi feltételei szerint kezeli; naplóihoz nem mi határozunk meg rögzített tárolási időt. A helyi mérkőzéstárolás ettől elkülönül.",
      "A szolgáltató a GitHub; az alkalmazandó feltételek szerint a GitHub, Inc. vagy GitHub B.V. vesz részt. EU/EGT-n kívüli, különösen amerikai adatkezelés is lehetséges. A tájékoztató ismerteti a szerepeket, megőrzést és továbbítási garanciákat, ideértve adott esetben az EU-US Data Privacy Frameworköt és általános szerződési feltételeket.",
      "A szolgáltató részletei és elérhetősége: {github}. A szolgáltatói kapcsolat online betöltéskor jön létre. Más külső tájékoztató oldalak csak a hivatkozásuk megnyitásakor érhetők el.",
      "E-mail esetén a válaszadáshoz kezeljük adataidat (GDPR 6. cikk (1) f); szerződéses ügyekben adott esetben b)). A levél a megadott postafiókba kerül, és töröljük, ha már nem szükséges az ügyhöz, bizonyításhoz vagy jogszabályi megőrzéshez.",
      "A GDPR szerint hozzáférést, helyesbítést, törlést, korlátozást, adathordozhatóságot és tiltakozást kérhetsz. A hozzájárulás a jövőre nézve visszavonható. Használd a megadott elérhetőséget. A kizárólag az eszközödön tárolt mérkőzésekhez nem férünk hozzá. Felügyeleti hatóságnál panaszt tehetsz, különösen Alsó-Szászországban: {authority}. Az alkalmazás nem végez profilalkotást vagy joghatású automatizált döntést."
    ]
  },
  "ro": {
    "headings": [
      "Furnizor",
      "Software și design",
      "Meciul rămâne pe dispozitivul tău",
      "Operator de date",
      "Stocare locală în browser",
      "GitHub Pages",
      "Contact și drepturi"
    ],
    "imprint": [
      "Aplicație web mobilă pentru măsurarea timpului și punctelor la Jugger pe juggermaster.github.io. Implementare independentă; nu este o aplicație oficială a comunității Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Steagurile, craniul canin și pictogramele sunt desene geometrice proprii. Nu sunt încărcate ilustrații externe, sigle de echipe sau fișiere de fonturi. Sunetele sunt sintetizate în browser."
    ],
    "privacy": [
      "Actualizat: 21.10.2026. Aceste informații descriu JUGGERMASTER la juggermaster.github.io.",
      "JUGGERMASTER salvează local în browser numele și culorile echipelor, punctele, pietrele, seturile câștigate, timpii, reglajele sonore, limba și aspectul, inclusiv până la 30 de pași de corectare. Nu trimite aceste date la serverul nostru. Nu există conturi, sincronizare, analiză, reclame, servicii externe de fonturi sau cookie-uri de urmărire.",
      "Aplicația folosește localStorage pentru setări și meci. Un Service Worker și Cache Storage salvează automat toate fișierele pentru a redeschide aceeași adresă offline. Se poate solicita stocare persistentă. Stocarea deservește jocul și folosirea offline cerute de tine (§ 25 alin. 2 nr. 2 TDDDG).",
      "Datele rămân până la resetare, ștergerea datelor site-ului sau curățarea browserului. Nu există copie pe server. Ștergerea datelor browserului elimină și meciurile și fișierele offline. Confirmarea „Meci nou” înlocuiește meciul curent, păstrând echipele și setările sonore.",
      "Aplicația este găzduită la juggermaster.github.io prin GitHub Pages. La încărcarea online, GitHub prelucrează datele necesare: IP, ora, adresa cerută și informații HTTP ale browserului. Scopul nostru este furnizarea sigură, în baza art. 6 alin. 1 lit. f RGPD. Meciurile salvate nu sunt încărcate.",
      "GitHub înregistrează IP-urile vizitatorilor pentru securitate, inclusiv fără cont GitHub. Prelucrează datele tehnice conform politicii sale; nu stabilim o durată fixă pentru jurnalele sale. Salvarea locală a meciurilor este separată.",
      "Furnizorul este GitHub; potrivit condițiilor aplicabile participă GitHub, Inc. sau GitHub B.V. Este posibilă prelucrarea în afara UE/SEE, în special în SUA. Politica descrie rolurile, păstrarea și garanțiile de transfer, inclusiv EU-US Data Privacy Framework și clauzele contractuale standard unde se aplică.",
      "Detalii și contactul furnizorului: {github}. Conexiunea de găzduire apare la încărcarea online. Alte site-uri informative externe sunt contactate doar după apăsarea linkurilor.",
      "Dacă trimiți e-mail, procesăm datele pentru a răspunde (articolul 6 alineatul 1 litera f RGPD; la întrebări contractuale, după caz, litera b). Mesajul este tratat în căsuța indicată și șters când nu mai este necesar pentru cerere, dovezi sau obligații legale de păstrare.",
      "Conform RGPD ai drepturi de acces, rectificare, ștergere, restricționare, portabilitate și opoziție. Consimțământul poate fi retras pentru viitor. Folosește contactul indicat. Nu putem accesa meciurile păstrate doar pe dispozitivul tău. Poți reclama unei autorități de supraveghere, în special {authority}, din Saxonia Inferioară. Aplicația nu face profilare sau decizii automate cu efect juridic."
    ]
  },
  "sv": {
    "headings": [
      "Utgivare",
      "Programvara och utformning",
      "Matchen stannar på din enhet",
      "Personuppgiftsansvarig",
      "Lokal webbläsarlagring",
      "GitHub Pages",
      "Kontakt och rättigheter"
    ],
    "imprint": [
      "Mobil webbapp för tidtagning och poäng i Jugger på juggermaster.github.io. En fristående lösning; ingen officiell app från Juggergemenskapen.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Flaggor, hundskalle och appikoner är egna geometriska teckningar. Inga externa illustrationer, laglogotyper eller typsnittsfiler hämtas. Ljuden skapas syntetiskt i webbläsaren."
    ],
    "privacy": [
      "Uppdaterad: 21.10.2026. Informationen gäller JUGGERMASTER på juggermaster.github.io.",
      "JUGGERMASTER sparar lagnamn och färger, poäng, stenar, vunna set, speltider, ljudreglage, språk och utseende lokalt i webbläsaren, inklusive upp till 30 rättelsesteg. Appen skickar inte dessa uppgifter till vår server. Det finns inga konton, synkronisering, analys, reklam, externa typsnittstjänster eller spårningskakor.",
      "Appen använder localStorage för inställningar och match. En Service Worker och Cache Storage sparar automatiskt alla appfiler så att samma adress kan öppnas offline. Appen kan begära beständig lagring. Lagringen används för det spel och offlinebruk du begärt (§ 25, stycke 2, nr 2 TDDDG).",
      "Uppgifterna finns kvar tills de återställs, webbplatsdata raderas eller webbläsaren städar lagringen. Ingen serverkopia finns. Rensning av webbläsardata tar även bort matcher och offlinefiler. Att bekräfta ”Ny match” ersätter aktuell match men behåller lag- och ljudinställningar.",
      "Appen finns på juggermaster.github.io via GitHub Pages. Vid hämtning online behandlar GitHub nödvändiga anslutningsuppgifter: IP-adress, tid, begärd adress och webbläsarens HTTP-information. Vårt ändamål är säker leverans enligt GDPR artikel 6.1 f. Sparade matcher laddas inte upp.",
      "GitHub loggar besökares IP-adresser av säkerhetsskäl, även utan GitHub-konto. Tekniska uppgifter behandlas enligt GitHubs integritetsvillkor; vi bestämmer ingen fast lagringstid för deras loggar. Lokal matchlagring är separat.",
      "Värdtjänsten är GitHub; GitHub, Inc. eller GitHub B.V. medverkar enligt gällande villkor. Behandling utanför EU/EES, särskilt i USA, är möjlig. Policyn beskriver roller, lagring och överföringsskydd, bland annat EU-US Data Privacy Framework och standardavtalsklausuler där de är tillämpliga.",
      "Detaljer och kontakt till leverantören: {github}. Anslutningen till värdtjänsten sker vid hämtning online. Andra externa informationssidor kontaktas först när deras länkar följs.",
      "Om du mejlar behandlar vi uppgifterna för att svara (artikel 6.1 f GDPR; vid avtalsfrågor vid behov artikel 6.1 b). Meddelandet hanteras via angiven brevlåda och raderas när det inte längre behövs för frågan, bevisning eller lagstadgade lagringskrav.",
      "Enligt GDPR finns rätt till tillgång, rättelse, radering, begränsning, dataportabilitet och invändning. Samtycke kan återkallas för framtiden. Använd angiven kontakt. Vi har inte tillgång till matcher som bara sparats på din enhet. Du kan klaga hos en tillsynsmyndighet, särskilt {authority}, i Niedersachsen. Appen gör ingen profilering eller automatiska beslut med rättsliga följder."
    ]
  },
  "fi": {
    "headings": [
      "Palveluntarjoaja",
      "Ohjelmisto ja ulkoasu",
      "Ottelu pysyy laitteellasi",
      "Rekisterinpitäjä",
      "Selaimen paikallinen tallennus",
      "GitHub Pages",
      "Yhteydenotto ja oikeudet"
    ],
    "imprint": [
      "Mobiiliverkkosovellus Juggerin ajanottoon ja pisteisiin osoitteessa juggermaster.github.io. Itsenäinen toteutus, ei Jugger-yhteisön virallinen sovellus.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Liput, koirankallo ja sovelluskuvakkeet ovat omia geometrisia piirroksia. Ulkoisia kuvia, joukkuelogoja tai kirjasintiedostoja ei ladata. Äänet muodostetaan synteettisesti selaimessa."
    ],
    "privacy": [
      "Päivitetty 21.10.2026. Nämä tiedot koskevat JUGGERMASTERia osoitteessa juggermaster.github.io.",
      "JUGGERMASTER tallentaa joukkueiden nimet ja värit, pisteet, kivet, voitetut erät, peliajat, ääniasetukset, kielen ja ulkoasun paikallisesti selaimeen sekä enintään 30 korjausaskelta. Tietoja ei lähetetä palvelimellemme. Tilejä, synkronointia, analytiikkaa, mainontaa, ulkoisia kirjasinpalveluja tai seurantaevästeitä ei ole.",
      "Sovellus käyttää localStoragea asetuksiin ja otteluun. Service Worker ja Cache Storage tallentavat kaikki tiedostot automaattisesti, jotta saman osoitteen voi avata myöhemmin ilman verkkoa. Sovellus voi pyytää pysyvää selaintallennusta. Tallennus palvelee pyytämääsi pelaamista ja offline-käyttöä (§ 25, 2 momentti, 2 kohta TDDDG).",
      "Tiedot säilyvät nollaukseen, sivustotietojen poistamiseen tai selaimen tekemään siivoukseen asti. Palvelinkopiota ei ole. Selaintietojen poistaminen poistaa myös ottelut ja offline-tiedostot. Uuden ottelun vahvistaminen korvaa nykyisen ottelun mutta säilyttää joukkue- ja ääniasetukset.",
      "Sovellus julkaistaan osoitteessa juggermaster.github.io GitHub Pagesin kautta. Verkosta ladattaessa GitHub käsittelee tarvittavia yhteystietoja: IP-osoitetta, aikaa, pyydettyä osoitetta ja selaimen HTTP-tietoja. Tarkoituksemme on turvallinen jakelu GDPR:n 6 artiklan 1 kohdan f alakohdan perusteella. Tallennettuja otteluja ei lähetetä.",
      "GitHub kirjaa vierailijoiden IP-osoitteet turvallisuussyistä myös ilman GitHub-tiliä. Teknisiä tietoja käsitellään sen tietosuojaehtojen mukaan; emme määritä lokien kiinteää säilytysaikaa. Paikallinen ottelutallennus on erillinen.",
      "Palveluntarjoaja on GitHub; ehtoihin osallistuvat GitHub, Inc. tai GitHub B.V. Tietoja voidaan käsitellä EU/ETA-alueen ulkopuolella, etenkin Yhdysvalloissa. Seloste kuvaa roolit, säilytyksen ja siirtosuojat, kuten soveltuvin osin EU-US Data Privacy Frameworkin ja vakiosopimuslausekkeet.",
      "Palveluntarjoajan tiedot ja yhteystiedot: {github}. Yhteys syntyy ladattaessa verkosta. Muihin ulkoisiin tietosivuihin otetaan yhteys vasta niiden linkkejä painettaessa.",
      "Jos lähetät sähköpostia, käsittelemme tietojasi vastaamista varten (GDPR:n 6 artiklan 1 kohdan f alakohta; sopimusasioissa tarvittaessa b alakohta). Viesti käsitellään mainitussa postilaatikossa ja poistetaan, kun sitä ei enää tarvita asian hoitoon, näyttöön tai lakisääteiseen säilyttämiseen.",
      "GDPR:n mukaan sinulla on oikeus saada pääsy tietoihin, oikaista, poistaa, rajoittaa käsittelyä, siirtää tiedot ja vastustaa käsittelyä. Suostumuksen voi peruuttaa tulevaisuutta varten. Käytä mainittua yhteystietoa. Emme pääse vain laitteellesi tallennettuihin otteluihin. Voit valittaa valvontaviranomaiselle, erityisesti Ala-Saksin viranomaiselle {authority}. Sovellus ei tee profilointia eikä oikeusvaikutteisia automaattisia päätöksiä."
    ]
  },
  "pl": {
    "headings": [
      "Usługodawca",
      "Oprogramowanie i projekt",
      "Mecz pozostaje na Twoim urządzeniu",
      "Administrator danych",
      "Lokalna pamięć przeglądarki",
      "GitHub Pages",
      "Kontakt i prawa"
    ],
    "imprint": [
      "Mobilna aplikacja internetowa do pomiaru czasu i punktów Jugger pod adresem juggermaster.github.io. Samodzielna realizacja; nie jest oficjalną aplikacją społeczności Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Flagi, psia czaszka i ikony są własnymi rysunkami geometrycznymi. Aplikacja nie ładuje zewnętrznych ilustracji, logotypów drużyn ani plików czcionek. Dźwięki są syntezowane w przeglądarce."
    ],
    "privacy": [
      "Aktualizacja: 21.10.2026. Informacje dotyczą JUGGERMASTER pod adresem juggermaster.github.io.",
      "JUGGERMASTER zapisuje lokalnie w przeglądarce nazwy i kolory drużyn, punkty, kamienie, wygrane sety, czasy gry, ustawienia dźwięku, język i wygląd, w tym do 30 kroków korekty. Nie przesyła tych danych na serwer. Nie ma kont, synchronizacji, analityki, reklam, zewnętrznych usług czcionek ani śledzących plików cookie.",
      "Aplikacja używa localStorage dla ustawień i stanu meczu. Service Worker i Cache Storage automatycznie zapisują wszystkie pliki, by później otworzyć ten sam adres offline. Aplikacja może poprosić o trwałą pamięć przeglądarki. Zapis służy zamówionej obsłudze gry i pracy offline (§ 25 ust. 2 pkt 2 TDDDG).",
      "Dane pozostają do ich wyzerowania, usunięcia danych witryny lub oczyszczenia pamięci przez przeglądarkę. Nie ma kopii na serwerze. Usunięcie danych przeglądarki usuwa również mecze i pliki offline. Potwierdzenie „Nowy mecz” zastępuje bieżący mecz z zachowaniem drużyn i ustawień dźwięku.",
      "Aplikacja jest udostępniana pod juggermaster.github.io przez GitHub Pages. Podczas ładowania online GitHub przetwarza niezbędne dane połączenia: IP, czas, żądany adres i informacje HTTP przeglądarki. Naszym celem jest bezpieczne udostępnianie na podstawie art. 6 ust. 1 lit. f RODO. Zapisane mecze nie są przesyłane.",
      "GitHub zapisuje adresy IP odwiedzających dla bezpieczeństwa, także bez konta GitHub. Dane techniczne przetwarza zgodnie ze swoją polityką; nie ustalamy stałego okresu przechowywania jego logów. Lokalny zapis meczów jest odrębny.",
      "Dostawcą hostingu jest GitHub; zgodnie z warunkami uczestniczą GitHub, Inc. lub GitHub B.V. Możliwe jest przetwarzanie poza UE/EOG, zwłaszcza w USA. Polityka opisuje role, przechowywanie i zabezpieczenia transferów, w tym odpowiednio EU-US Data Privacy Framework i standardowe klauzule umowne.",
      "Szczegóły i kontakt do dostawcy: {github}. Połączenie hostingowe powstaje podczas ładowania online. Inne zewnętrzne strony informacyjne otwierane są dopiero po kliknięciu ich linków.",
      "Jeśli napiszesz e-mail, przetwarzamy dane, aby odpowiedzieć (art. 6 ust. 1 lit. f RODO; przy pytaniach umownych ewentualnie lit. b). Wiadomość obsługuje wskazana skrzynka; zostanie usunięta, gdy nie będzie już potrzebna do sprawy, celów dowodowych lub prawnego obowiązku przechowywania.",
      "Na zasadach RODO masz prawa dostępu, sprostowania, usunięcia, ograniczenia, przenoszenia danych i sprzeciwu. Zgody można cofnąć na przyszłość. Użyj wskazanego kontaktu. Nie mamy dostępu do meczów zapisanych wyłącznie na Twoim urządzeniu. Możesz złożyć skargę do organu nadzorczego, w szczególności {authority}, w Dolnej Saksonii. Aplikacja nie prowadzi profilowania ani automatycznych decyzji o skutkach prawnych."
    ]
  },
  "pt": {
    "headings": [
      "Fornecedor",
      "Software e desenho",
      "O jogo fica no teu dispositivo",
      "Responsável pelo tratamento",
      "Armazenamento local do navegador",
      "GitHub Pages",
      "Contacto e direitos"
    ],
    "imprint": [
      "Aplicação web móvel para medir tempo e pontos de Jugger em juggermaster.github.io. Implementação independente; não é uma aplicação oficial da comunidade Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Bandeiras, crânio canino e ícones são desenhos geométricos próprios. Não são carregadas ilustrações externas, logótipos de equipas nem ficheiros de tipos de letra. Os sons são gerados sinteticamente no navegador."
    ],
    "privacy": [
      "Atualizado em 21.10.2026. Esta informação descreve JUGGERMASTER em juggermaster.github.io.",
      "JUGGERMASTER guarda localmente no navegador nomes e cores das equipas, pontos, pedras, sets ganhos, tempos, definições de som, idioma e aparência, incluindo até 30 passos de correção. Não envia esses dados ao nosso servidor. Não há contas, sincronização, análise, publicidade, serviços externos de tipos de letra nem cookies de rastreio.",
      "A aplicação usa localStorage para definições e estado do jogo. Um Service Worker e Cache Storage guardam automaticamente todos os ficheiros para abrir o mesmo endereço offline. A aplicação pode pedir armazenamento persistente. Esta gravação serve o funcionamento e uso offline pedidos por ti (§ 25, n.º 2, ponto 2 TDDDG).",
      "Os dados permanecem até serem repostos, apagados os dados do site ou limpos pelo navegador. Não há cópia no servidor. Apagar dados do navegador elimina jogos e ficheiros offline. Confirmar «Novo jogo» substitui o jogo atual, mantendo equipas e definições de som.",
      "A aplicação é alojada em juggermaster.github.io através do GitHub Pages. Ao carregar online, o GitHub trata os dados necessários: IP, hora, endereço pedido e informações HTTP do navegador. A nossa finalidade é disponibilizar a aplicação em segurança, nos termos do artigo 6.º, n.º 1, alínea f do RGPD. Os jogos guardados não são enviados.",
      "O GitHub regista os IP dos visitantes por segurança, mesmo sem conta GitHub. Trata os dados técnicos segundo a sua política; não fixamos um prazo de conservação para os seus registos. O armazenamento local dos jogos é separado.",
      "O fornecedor é o GitHub; conforme as condições aplicáveis intervêm GitHub, Inc. ou GitHub B.V. Pode haver tratamento fora da UE/EEE, nomeadamente nos EUA. A política descreve os papéis, a conservação e as garantias de transferência, incluindo o Quadro de Privacidade de Dados UE-EUA e cláusulas contratuais-tipo quando aplicáveis.",
      "Detalhes e contactos do fornecedor: {github}. A ligação ao alojamento ocorre ao carregar online. Outros sites informativos externos só são contactados ao seguir os respetivos links.",
      "Se enviares um e-mail, tratamos os dados para responder (artigo 6.º, n.º 1, alínea f do RGPD; em pedidos contratuais, quando aplicável, alínea b). A mensagem é tratada na caixa indicada e apagada quando já não for necessária para o pedido, prova ou obrigações legais de conservação.",
      "Nos termos do RGPD existem direitos de acesso, retificação, apagamento, limitação, portabilidade e oposição. Os consentimentos podem ser retirados para o futuro. Usa o contacto indicado. Não temos acesso aos jogos guardados apenas no teu dispositivo. Podes reclamar a uma autoridade de controlo, nomeadamente {authority}, na Baixa Saxónia. A aplicação não faz definição de perfis nem decisões automatizadas com efeitos jurídicos."
    ]
  },
  "nl": {
    "headings": [
      "Aanbieder",
      "Software en vormgeving",
      "Je wedstrijd blijft op je apparaat",
      "Verwerkingsverantwoordelijke",
      "Lokale browseropslag",
      "GitHub Pages",
      "Contact en rechten"
    ],
    "imprint": [
      "Mobiele webapp voor Jugger-tijdmeting en scores op juggermaster.github.io. Een zelfstandige uitvoering; geen officiële app van de Juggergemeenschap.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Vlaggen, hondenschedel en appiconen zijn eigen geometrische tekeningen. Er worden geen externe illustraties, teamlogo’s of lettertypebestanden geladen. Geluiden worden synthetisch in de browser gemaakt."
    ],
    "privacy": [
      "Bijgewerkt: 21.10.2026. Deze informatie beschrijft JUGGERMASTER op juggermaster.github.io.",
      "JUGGERMASTER bewaart teamnamen en kleuren, punten, stenen, gewonnen sets, speeltijden, geluidsinstellingen, taal en weergave lokaal in je browser, inclusief maximaal 30 herstelstappen. De app verstuurt deze gegevens niet naar onze server. Er zijn geen accounts, synchronisatie, analyse, advertenties, externe lettertypediensten of trackingcookies.",
      "De app gebruikt localStorage voor instellingen en wedstrijdgegevens. Een Service Worker en Cache Storage bewaren automatisch alle appbestanden om hetzelfde adres later offline te openen. De app kan om blijvende browseropslag vragen. Deze opslag dient het gevraagde spelgebruik en offlinegebruik (§ 25, lid 2, nr. 2 TDDDG).",
      "Gegevens blijven tot herstel, verwijdering van websitegegevens of opslagopruiming door de browser. Er is geen serverkopie. Browsergegevens wissen verwijdert ook wedstrijden en offlinebestanden. Bevestigen van ‘Nieuwe wedstrijd’ vervangt de huidige wedstrijd en bewaart teams en geluidsinstellingen.",
      "De app wordt via GitHub Pages aangeboden op juggermaster.github.io. Bij online laden verwerkt GitHub noodzakelijke verbindingsgegevens: IP-adres, tijd, opgevraagd adres en HTTP-informatie van de browser. Ons doel is veilige beschikbaarstelling op grond van artikel 6 lid 1 onder f AVG. Opgeslagen wedstrijden worden niet geüpload.",
      "GitHub registreert IP-adressen van bezoekers voor beveiliging, ook zonder GitHub-account. Technische gegevens worden volgens GitHubs privacyvoorwaarden verwerkt; wij bepalen geen vaste bewaartermijn voor die logboeken. Lokale wedstrijdopslag staat hiervan los.",
      "De hostingaanbieder is GitHub; afhankelijk van de voorwaarden zijn GitHub, Inc. of GitHub B.V. betrokken. Verwerking buiten de EU/EER, vooral in de VS, is mogelijk. De privacyverklaring beschrijft rollen, bewaring en doorgiftewaarborgen, waaronder waar toepasselijk het EU-US Data Privacy Framework en standaardcontractbepalingen.",
      "Details en contactgegevens van de aanbieder: {github}. Hostingverbindingen ontstaan bij online laden. Andere externe informatiesites worden pas na het volgen van hun links benaderd.",
      "Als je e-mailt, verwerken we je gegevens om te antwoorden (artikel 6, lid 1, onder f AVG; bij contractvragen eventueel onder b). Het bericht wordt via de genoemde mailbox verwerkt en verwijderd zodra het niet meer nodig is voor de vraag, bewijsvoering of wettelijke bewaarplichten.",
      "Volgens de AVG heb je rechten op inzage, correctie, verwijdering, beperking, overdraagbaarheid en bezwaar. Toestemming kan voor de toekomst worden ingetrokken. Gebruik de genoemde contactgegevens. We hebben geen toegang tot wedstrijden die alleen op je apparaat staan. Je kunt klagen bij een toezichthouder, met name {authority}, in Nedersaksen. De app doet geen profilering of geautomatiseerde beslissingen met rechtsgevolgen."
    ]
  },
  "da": {
    "headings": [
      "Udbyder",
      "Software og design",
      "Kampen bliver på din enhed",
      "Dataansvarlig",
      "Lokal browserlagring",
      "GitHub Pages",
      "Kontakt og rettigheder"
    ],
    "imprint": [
      "Mobil webapp til tidtagning og point i Jugger på juggermaster.github.io. En selvstændig løsning; ikke en officiel app fra Jugger-fællesskabet.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Flag, hundekranium og appikoner er egne geometriske tegninger. Ingen eksterne illustrationer, holdlogoer eller skrifttypefiler hentes. Lydene dannes syntetisk i browseren."
    ],
    "privacy": [
      "Opdateret: 21.10.2026. Disse oplysninger vedrører JUGGERMASTER på juggermaster.github.io.",
      "JUGGERMASTER gemmer holdnavne og farver, point, sten, vundne sæt, spilletider, lydindstillinger, sprog og visning lokalt i browseren, inklusive op til 30 rettelsestrin. Appen sender ikke disse data til vores server. Der er ingen konti, synkronisering, analyse, reklamer, eksterne skrifttjenester eller sporingscookies.",
      "Appen bruger localStorage til indstillinger og kampstatus. En Service Worker og Cache Storage gemmer automatisk alle appfiler, så samme adresse kan åbnes offline. Appen kan anmode om vedvarende browserlagring. Lagringen tjener den ønskede kampdrift og offlinebrug (§ 25, stk. 2, nr. 2 TDDDG).",
      "Data bevares indtil nulstilling, sletning af webstedsdata eller browserens oprydning. Der er ingen serverkopi. Sletning af browserdata fjerner også kampe og offlinefiler. Bekræftelse af »Ny kamp« erstatter kampen, men bevarer hold og lydindstillinger.",
      "Appen hostes på juggermaster.github.io via GitHub Pages. Ved online indlæsning behandler GitHub nødvendige forbindelsesdata: IP-adresse, tidspunkt, ønsket adresse og browserens HTTP-oplysninger. Vores formål er sikker levering efter GDPR artikel 6, stk. 1, litra f. Gemte kampe uploades ikke.",
      "GitHub logger besøgendes IP-adresser af sikkerhedshensyn, også uden GitHub-konto. Tekniske data behandles efter GitHubs privatlivsvilkår; vi fastsætter ingen bestemt opbevaringstid for deres logs. Lokal kampopbevaring er adskilt herfra.",
      "Hostingudbyderen er GitHub; GitHub, Inc. eller GitHub B.V. indgår efter de gældende vilkår. Behandling uden for EU/EØS, især i USA, er mulig. Privatlivspolitikken beskriver roller, opbevaring og overførselsgarantier, herunder EU-US Data Privacy Framework og standardkontraktbestemmelser, hvor de gælder.",
      "Oplysninger og kontakt til udbyderen: {github}. Hostingforbindelsen opstår ved online indlæsning. Andre eksterne informationssider kontaktes først ved klik på deres links.",
      "Ved e-mail behandler vi dine oplysninger for at svare (artikel 6, stk. 1, litra f GDPR; ved kontraktspørgsmål eventuelt litra b). Beskeden behandles via den angivne postkasse og slettes, når den ikke længere er nødvendig for henvendelsen, dokumentation eller lovpligtig opbevaring.",
      "Efter GDPR har du rettigheder til indsigt, berigtigelse, sletning, begrænsning, dataportabilitet og indsigelse. Samtykke kan trækkes tilbage for fremtiden. Brug den angivne kontakt. Vi kan ikke tilgå kampe, der kun ligger på din enhed. Du kan klage til en tilsynsmyndighed, især {authority}, i Niedersachsen. Appen laver ingen profilering eller automatiske afgørelser med retsvirkning."
    ]
  },
  "es": {
    "headings": [
      "Proveedor",
      "Software y diseño",
      "El partido se queda en tu dispositivo",
      "Responsable",
      "Almacenamiento local del navegador",
      "GitHub Pages",
      "Contacto y derechos"
    ],
    "imprint": [
      "Aplicación web móvil para medir tiempo y puntos de Jugger en juggermaster.github.io. Implementación independiente; no es una aplicación oficial de la comunidad Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Banderas, cráneo canino e iconos son dibujos geométricos propios. No se cargan ilustraciones externas, logotipos de equipos ni archivos de fuentes. Los sonidos se generan sintéticamente en el navegador."
    ],
    "privacy": [
      "Actualizado: 21.10.2026. Esta información describe JUGGERMASTER en juggermaster.github.io.",
      "JUGGERMASTER guarda localmente en el navegador nombres y colores de equipos, puntos, piedras, sets ganados, tiempos, controles de sonido, idioma y apariencia, incluidos hasta 30 pasos de corrección. No envía estos datos a nuestro servidor. No hay cuentas, sincronización, análisis, publicidad, servicios externos de fuentes ni cookies de seguimiento.",
      "La aplicación usa localStorage para ajustes y estado del partido. Un Service Worker y Cache Storage guardan automáticamente todos los archivos para poder abrir la misma dirección sin conexión. Puede solicitar almacenamiento persistente. Este almacenamiento sirve al funcionamiento y uso offline solicitados por ti (§ 25, apartado 2, número 2 TDDDG).",
      "Los datos se conservan hasta restablecerlos, borrar los datos del sitio o una limpieza del navegador. No existe copia en el servidor. Borrar los datos del navegador elimina también partidos y archivos offline. Confirmar «Nuevo partido» sustituye el partido actual y mantiene equipos y ajustes de sonido.",
      "La aplicación se aloja en juggermaster.github.io mediante GitHub Pages. Al cargar online, GitHub trata los datos de conexión necesarios: IP, hora, dirección solicitada e información HTTP del navegador. Nuestra finalidad es la entrega segura, basada en el artículo 6.1.f del RGPD. No se suben los partidos guardados.",
      "GitHub registra las IP de los visitantes por seguridad, también sin una cuenta de GitHub. Trata los datos técnicos conforme a sus condiciones de privacidad; no fijamos un plazo de conservación para sus registros. El almacenamiento local de partidos es independiente.",
      "El proveedor es GitHub; según las condiciones aplicables intervienen GitHub, Inc. o GitHub B.V. Puede haber tratamiento fuera de la UE/EEE, en particular en EE. UU. Su política describe funciones, conservación y garantías de transferencia, incluidos el Marco de Privacidad de Datos UE-EE. UU. y las cláusulas contractuales tipo cuando procedan.",
      "Detalles y contactos del proveedor: {github}. La conexión al alojamiento se produce al cargar online. Los demás sitios informativos externos solo se contactan al pulsar sus enlaces.",
      "Si escribes por correo, tratamos tus datos para responder (artículo 6, apartado 1, letra f del RGPD; para consultas contractuales, en su caso, letra b). El mensaje se gestiona en el buzón indicado y se borra cuando deja de ser necesario para la consulta, las pruebas o las obligaciones legales de conservación.",
      "Conforme al RGPD puedes ejercer derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición. Puedes retirar consentimientos para el futuro. Usa el contacto indicado. No podemos acceder a los partidos guardados solo en tu dispositivo. Puedes reclamar ante una autoridad de protección de datos, en particular {authority}, de Baja Sajonia. La aplicación no realiza perfiles ni decisiones automatizadas con efectos jurídicos."
    ]
  },
  "fr": {
    "headings": [
      "Éditeur",
      "Logiciel et conception",
      "Votre match reste sur votre appareil",
      "Responsable du traitement",
      "Stockage local du navigateur",
      "GitHub Pages",
      "Contact et droits"
    ],
    "imprint": [
      "Application web mobile de mesure du temps et des points au Jugger sur juggermaster.github.io. Réalisation indépendante ; ce n’est pas une application officielle de la communauté Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Drapeaux, crâne canin et icônes sont nos propres dessins géométriques. Aucune illustration externe, aucun logo d’équipe ni fichier de police n’est chargé. Les sons sont synthétisés dans le navigateur."
    ],
    "privacy": [
      "Mise à jour : 21.10.2026. Ces informations concernent JUGGERMASTER sur juggermaster.github.io.",
      "JUGGERMASTER conserve localement dans le navigateur les noms et couleurs des équipes, points, pierres, sets gagnés, temps de jeu, réglages sonores, langue et apparence, ainsi que jusqu’à 30 étapes de correction. Ces données ne sont pas envoyées à notre serveur. Il n’existe ni comptes, synchronisation, analyse, publicité, services de polices externes, ni cookies de suivi.",
      "L’application utilise localStorage pour les réglages et le match. Un Service Worker et Cache Storage enregistrent automatiquement tous les fichiers pour rouvrir la même adresse hors ligne. Un stockage persistant peut être demandé. Ce stockage sert au jeu et à l’usage hors ligne que vous avez demandés (§ 25, alinéa 2, numéro 2 TDDDG).",
      "Les données restent jusqu’à leur réinitialisation, l’effacement des données du site ou le nettoyage par le navigateur. Aucune copie serveur n’existe. Effacer les données du navigateur supprime aussi matchs et fichiers hors ligne. Confirmer « Nouveau match » remplace le match en cours et conserve équipes et réglages sonores.",
      "L’application est hébergée sur juggermaster.github.io via GitHub Pages. Lors du chargement en ligne, GitHub traite les données nécessaires : adresse IP, heure, adresse demandée et informations HTTP du navigateur. Notre finalité est une fourniture sûre, fondée sur l’article 6, paragraphe 1, point f du RGPD. Aucun match enregistré n’est téléversé.",
      "GitHub journalise les adresses IP des visiteurs pour la sécurité, même sans compte GitHub. Les données techniques sont traitées selon ses conditions de confidentialité ; nous ne fixons pas de durée pour ses journaux. Le stockage local des matchs reste distinct.",
      "L’hébergeur est GitHub ; GitHub, Inc. ou GitHub B.V. interviennent selon les conditions applicables. Un traitement hors UE/EEE, notamment aux États-Unis, est possible. Sa politique décrit les rôles, la conservation et les garanties de transfert, dont le cadre UE-États-Unis de protection des données et les clauses contractuelles types lorsqu’ils s’appliquent.",
      "Détails et contacts de l’hébergeur : {github}. La connexion d’hébergement intervient au chargement en ligne. Les autres sites d’information externes ne sont contactés qu’après un clic sur leur lien.",
      "En cas de courriel, nous traitons vos données pour répondre (article 6, paragraphe 1, point f du RGPD ; éventuellement point b pour une demande contractuelle). Le message est traité dans la boîte indiquée et supprimé lorsqu’il n’est plus nécessaire à la demande, à la preuve ou aux obligations légales de conservation.",
      "Dans les conditions du RGPD, vous disposez de droits d’accès, rectification, effacement, limitation, portabilité et opposition. Les consentements peuvent être retirés pour l’avenir. Utilisez le contact indiqué. Nous n’avons aucun accès aux matchs stockés uniquement sur votre appareil. Vous pouvez saisir une autorité de contrôle, notamment {authority}, en Basse-Saxe. L’application ne fait ni profilage ni décision automatisée produisant des effets juridiques."
    ]
  },
  "it": {
    "headings": [
      "Fornitore",
      "Software e progettazione",
      "La partita resta sul tuo dispositivo",
      "Titolare del trattamento",
      "Memoria locale del browser",
      "GitHub Pages",
      "Contatti e diritti"
    ],
    "imprint": [
      "Applicazione web mobile per misurare tempo e punti di Jugger su juggermaster.github.io. Realizzazione indipendente; non è un’app ufficiale della comunità Jugger.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Bandiere, teschio canino e icone sono disegni geometrici propri. Non vengono caricati illustrazioni esterne, loghi di squadre o file di caratteri. I suoni sono sintetizzati nel browser."
    ],
    "privacy": [
      "Aggiornamento: 21.10.2026. Queste informazioni riguardano JUGGERMASTER su juggermaster.github.io.",
      "JUGGERMASTER salva nel browser nomi e colori delle squadre, punti, pietre, set vinti, tempi, regolazioni del suono, lingua e aspetto, compresi fino a 30 passaggi di correzione. Non invia questi dati al nostro server. Non ci sono account, sincronizzazione, analisi, pubblicità, servizi di caratteri esterni o cookie di tracciamento.",
      "L’app usa localStorage per impostazioni e partita. Un Service Worker e Cache Storage salvano automaticamente tutti i file per riaprire lo stesso indirizzo offline. Può essere richiesta memoria persistente. Il salvataggio serve al gioco e all’uso offline richiesti (§ 25, comma 2, numero 2 TDDDG).",
      "I dati restano fino al ripristino, alla cancellazione dei dati del sito o alla pulizia del browser. Non esiste copia sul server. Cancellare i dati del browser elimina anche partite e file offline. Confermare « Nuova partita » sostituisce la partita corrente mantenendo squadre e impostazioni sonore.",
      "L’app è ospitata su juggermaster.github.io tramite GitHub Pages. Durante il caricamento online GitHub tratta i dati necessari: IP, orario, indirizzo richiesto e informazioni HTTP del browser. La nostra finalità è fornire l’app in sicurezza, ai sensi dell’articolo 6, paragrafo 1, lettera f del GDPR. Le partite salvate non vengono caricate.",
      "GitHub registra gli IP dei visitatori per sicurezza, anche senza account GitHub. Tratta i dati tecnici secondo la propria informativa; non fissiamo un periodo per i suoi registri. Il salvataggio locale delle partite è separato.",
      "Il fornitore è GitHub; secondo le condizioni applicabili intervengono GitHub, Inc. o GitHub B.V. È possibile un trattamento fuori dall’UE/SEE, soprattutto negli Stati Uniti. L’informativa descrive ruoli, conservazione e garanzie di trasferimento, inclusi il quadro UE-USA per la protezione dei dati e le clausole contrattuali tipo ove applicabili.",
      "Dettagli e contatti del fornitore: {github}. La connessione all’hosting avviene caricando online. Gli altri siti informativi esterni vengono contattati solo seguendo i collegamenti.",
      "Se invii un’e-mail, trattiamo i tuoi dati per rispondere (articolo 6, paragrafo 1, lettera f del GDPR; eventualmente lettera b per richieste contrattuali). Il messaggio passa dalla casella indicata ed è cancellato quando non serve più per la richiesta, la prova o gli obblighi legali di conservazione.",
      "Secondo il GDPR puoi avere diritti di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. I consensi possono essere revocati per il futuro. Usa il contatto indicato. Non abbiamo accesso alle partite conservate solo sul dispositivo. Puoi presentare reclamo a un’autorità di controllo, in particolare {authority}, in Bassa Sassonia. L’app non effettua profilazione né decisioni automatizzate con effetti giuridici."
    ]
  },
  "de": {
    "headings": [
      "Anbieter",
      "Verwendete Software und Gestaltung",
      "Spielstände bleiben auf deinem Gerät",
      "Verantwortlicher",
      "Lokaler Browserspeicher",
      "GitHub Pages",
      "Kontaktaufnahme und Rechte"
    ],
    "imprint": [
      "Mobile Webapp zur Jugger-Spielzeit- und Punktmessung unter juggermaster.github.io. Eine eigenständige Umsetzung; keine offizielle App der Jugger-Gemeinschaft.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Flaggen, Hundeschädel und App-Symbole sind eigene geometrische Darstellungen. Es werden keine externen Illustrationen, Teamlogos oder Fontdateien geladen. Die Klänge entstehen synthetisch im Browser."
    ],
    "privacy": [
      "Stand: 21. Oktober 2026. Diese Hinweise beschreiben JUGGERMASTER unter juggermaster.github.io.",
      "Teamnamen, Teamfarben, Punkte, Steine, gewonnene Sätze, Spielzeiten, Klangregler, Sprache und Darstellung speichert JUGGERMASTER lokal im Browser. Auch die letzten bis zu 30 Korrekturschritte liegen dort. Die App überträgt diese Inhalte nicht an unseren Server. Es gibt keine Konten, Synchronisierung, Analyse-, Werbe- oder externen Schriftendienste und keine Tracking-Cookies.",
      "Die App nutzt localStorage für Einstellungen und Spielstand. Ein Service Worker und Cache Storage speichern automatisch sämtliche App-Dateien, damit derselbe Seitenaufruf später offline funktioniert. Die App kann dauerhaften Browserspeicher anfragen. Diese Speicherung dient dem von dir angeforderten Spielbetrieb einschließlich Offline-Nutzung (§ 25 Abs. 2 Nr. 2 TDDDG).",
      "Die Daten bleiben bis zum Zurücksetzen oder Löschen der Website-Daten beziehungsweise einer Speicherbereinigung durch den Browser erhalten. Es gibt keine Serverkopie. Browserdaten zu löschen entfernt auch gespeicherte Spielstände und Offline-Dateien. „Neues Spiel“ ersetzt nach Bestätigung den aktuellen Spielstand; Team- und Klangeinstellungen bleiben erhalten.",
      "Die App wird unter juggermaster.github.io über GitHub Pages bereitgestellt. Beim Online-Abruf verarbeitet GitHub die zur Auslieferung erforderlichen Verbindungsdaten wie IP-Adresse, Abrufzeit, angeforderte Adresse und HTTP-Informationen des Browsers. Unser Zweck ist die sichere Bereitstellung der App auf Grundlage von Art. 6 Abs. 1 Buchst. f DSGVO. Gespeicherte Spielstände werden dabei nicht hochgeladen.",
      "GitHub protokolliert Besucher-IP-Adressen zu Sicherheitszwecken, auch ohne GitHub-Anmeldung. GitHub verarbeitet technische Daten nach seinen Datenschutzbedingungen; wir legen keine feste Speicherfrist für dessen Protokolle fest. Die lokale Spielstandspeicherung ist davon getrennt.",
      "Hosting-Anbieter ist GitHub; nach den jeweiligen Bedingungen sind GitHub, Inc. beziehungsweise GitHub B.V. beteiligt. Eine Verarbeitung außerhalb der EU/des EWR, insbesondere in den USA, ist möglich. GitHub beschreibt in seiner Datenschutzerklärung die jeweiligen Rollen, Aufbewahrungsgrundsätze und Übermittlungsgarantien, darunter je nach Anwendbarkeit das EU-US Data Privacy Framework und Standardvertragsklauseln.",
      "Einzelheiten und Kontaktmöglichkeiten zum Hosting-Anbieter: {github}. Die Hosting-Verbindung entsteht beim Online-Laden. Andere externe Informationsseiten werden erst nach Anklicken ihrer Links aufgerufen.",
      "Bei einer E-Mail verarbeiten wir deine Angaben zur Beantwortung der Anfrage (Art. 6 Abs. 1 Buchst. f DSGVO, bei Vertragsanfragen gegebenenfalls Buchst. b). Die Nachricht wird über das oben genannte E-Mail-Postfach verarbeitet und gelöscht, sobald sie nicht mehr zur Bearbeitung, Nachweisführung oder aufgrund gesetzlicher Pflichten benötigt wird.",
      "Nach Maßgabe der DSGVO bestehen Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Einwilligungen können für die Zukunft widerrufen werden. Wende dich an die genannte Kontaktadresse. Auf deine ausschließlich lokal gespeicherten Spielstände haben wir keinen Zugriff. Du kannst dich bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere beim {authority}. Die App betreibt kein Profiling und trifft keine automatisierten Entscheidungen mit rechtlicher Wirkung."
    ]
  },
  "en": {
    "headings": [
      "Provider",
      "Software and design",
      "Your match stays on your device",
      "Controller",
      "Local browser storage",
      "GitHub Pages",
      "Contact and rights"
    ],
    "imprint": [
      "Mobile web app for Jugger match timing and scoring at juggermaster.github.io. An independent implementation; not an official Jugger community app.",
      "JUGGERMASTER: {projectLicense}; Framework7 9.2.0: {license}; {thirdParty}. Flags, canine skull and app icons are our own geometric drawings. The app loads no external illustrations, team logos or font files. Sounds are generated synthetically in the browser."
    ],
    "privacy": [
      "Updated 21 October 2026. These notes describe JUGGERMASTER at juggermaster.github.io.",
      "JUGGERMASTER stores team names and colours, points, stones, won sets, match times, sound settings, language and appearance locally in your browser, including up to 30 recent undo steps. The app does not send these records to our server. It has no accounts, synchronisation, analytics, advertising, external font services or tracking cookies.",
      "The app uses localStorage for settings and match state. A service worker and Cache Storage automatically save all app files so that the same address can be opened offline later. The app may request persistent browser storage. This storage serves the match operation and offline use you requested (section 25(2)(2) TDDDG).",
      "Records remain until reset, deletion of site data or browser storage cleanup. There is no server backup. Clearing site data also removes saved matches and offline files. Confirming “New match” replaces the current match while retaining team and sound settings.",
      "The app is hosted at juggermaster.github.io through GitHub Pages. Online requests involve GitHub processing connection data needed for delivery, such as IP address, request time, requested address and browser HTTP information. Our purpose is secure delivery of the app, based on Article 6(1)(f) GDPR. Saved matches are not uploaded.",
      "GitHub logs visitor IP addresses for security, including visitors without a GitHub account. GitHub processes technical data under its privacy terms; we do not set a fixed retention period for its logs. Local match storage is separate.",
      "The hosting provider is GitHub; GitHub, Inc. or GitHub B.V. are involved under the applicable terms. Processing outside the EU/EEA, particularly in the USA, is possible. GitHub's privacy statement describes the relevant roles, retention principles and transfer safeguards, including the EU-US Data Privacy Framework and standard contractual clauses where applicable.",
      "Hosting details and provider contacts: {github}. Hosting connections occur when loading online. Other external information sites are contacted only after following their links.",
      "If you email us, we process your message to answer the enquiry (Article 6(1)(f) GDPR, or Article 6(1)(b) for contractual enquiries). Email is handled through the address above and deleted when no longer needed for the enquiry, evidence or legal retention duties.",
      "Under the GDPR you may have rights of access, correction, erasure, restriction, portability and objection. Consent may be withdrawn for the future. Contact the address above. We cannot access match records stored only on your device. You may complain to a supervisory authority, including the {authority}. The app performs no profiling or automated decisions with legal effects."
    ]
  }
};

export function translatedLegal(contact) {
  const result = { impressum: {}, datenschutz: {} };
  for (const [language, doc] of Object.entries(documents)) {
    const t = key => texts[language][key], h = doc.headings;
    if (h.length !== 7 || doc.imprint.length !== 2 || doc.privacy.length !== 10) throw Error(`Incomplete legal translation: ${language}`);
    const links = { license: '<a href="__ASSETS__/LICENSE-Framework7.txt">MIT</a>', projectLicense: '<a href="./LICENSE.txt">MIT</a>', thirdParty: `<a href="./lizenzen.html">${t('licenses')}</a>`, github: `<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noreferrer">GitHub (${t('privacy')})</a>`, authority: '<a href="https://www.lfd.niedersachsen.de/" rel="noreferrer">Landesbeauftragter für den Datenschutz Niedersachsen</a>' };
    const paragraph = value => `<p>${value.replaceAll('JUGGERMASTER', '<strong>JUGGERMASTER</strong>').replace(/\{(license|projectLicense|thirdParty|github|authority)\}/g, (_, key) => links[key])}</p>`;
    const heading = value => `<h2>${value}</h2>`;
    const dir = locales[language].dir || 'ltr', p = doc.privacy;
    result.impressum[language] = { title: t('imprint'), dir, body: `<h1>${t('imprint')}</h1>${heading(h[0])}${contact}${heading('JUGGERMASTER')}${paragraph(doc.imprint[0])}${heading(h[1])}${paragraph(doc.imprint[1])}` };
    result.datenschutz[language] = { title: t('privacy'), dir, body: `<h1>${t('privacy')}</h1>${paragraph(p[0])}${heading(h[2])}${paragraph(p[1])}${heading(h[3])}${contact}${heading(h[4])}${paragraph(p[2])}${paragraph(p[3])}${heading(h[5])}${paragraph(p[4])}${paragraph(p[5])}${heading('GitHub')}${paragraph(p[6])}${paragraph(p[7])}${heading(h[6])}${paragraph(p[8])}${paragraph(p[9])}` };
  }
  return result;
}
