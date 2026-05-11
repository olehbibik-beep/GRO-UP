import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

const dict = {
    ru: {
        "loading_data": "Загрузка данных...", "pending_title": "Заявка на рассмотрении", "pending_desc": "Ожидайте подтверждения администратора.",
        "logout_btn": "Выйти", "loading_events": "Загрузка встреч...", "all_year": "Весь<br>год", "loading_feed": "Загрузка ленты...",
        "my_report": "Мой отчет", "participated": "Служил(а)", "hours_label": "Часы<br>&nbsp;", "studies_label": "Изучения<br>Библии", "credit_label": "Кредит<br>&nbsp;",
        "fill_btn": "Заполнить", "this_week": "На этой неделе", "loading_duties": "Загрузка...", "active_tasks": "Активные задания",
        "no_active_tasks": "Нет активных заданий", "archive_title": "Архив", "history_empty": "История пуста", "my_territories": "Мои участки",
        "request_btn": "Попросить", "no_territories": "У вас пока нет участков", "profile_group": "Группа", "profile_overseer": "Ответственный",
        "language": "Язык / Jazyk", "profile_logout": "Выйти из аккаунта", "my_archive": "Мой архив", "loading_archive": "Загрузка...",
        "alert_no_notifications": "Уведомления не поддерживаются на этом устройстве.", "alert_notifications_blocked": "Уведомления заблокированы браузером!\n\nРазрешите их в настройках.",
        "toast_notifications_enabled": "Уведомления успешно включены!", "submit_report": "Отправить отчет", "alert_report_empty": "Отметьте галочку 'Служил(а)' или введите часы!",
        "saving": "Сохранение...", "saved": "Сохранено:", "success": "Успешно", "change": "Изменить", "error_network": "Ошибка сети!",
        "access_denied": "ДОСТУП ЗАКРЫТ", "no_group": "Без группы", "no_duties": "Нет дежурств", "duty_reminder": "Напоминание: Ваша группа дежурит в эти выходные!",
        "cleaning_weekend": "Уборка", "no_active_territories": "У вас пока нет активных участков", "territory_num": "Участок №",
        "active": "Активен", "assistant_for": "Помощник у", "speech": "Выступление", "assistant_short": "Пом:", "lesson": "Урок",
        "no_tasks_upcoming": "У тебя пока нет активных заданий", "new_task_toast": "У вас новое задание", "delete": "Удалить",
        "new_badge": "Новое", "new_announcement_toast": "📢 Новое объявление в ленте!", "create_announcement": "Создать объявление",
        "write_text_ru": "Текст (на русском)...", "write_text_cs": "Текст (на чешском)...", "publish": "Опубликовать", "no_news": "Актуальных объявлений нет",
        "today_badge": "СЕГОДНЯ", "group_short": "Гр.", "leader_short": "Вед:", "today_event_toast": "📅 Сегодня:", "no_events_today": "На сегодня событий нет",
        "loading": "Загрузка...", "archive_empty": "Архив пуст", "unknown": "Неизвестно", "error_loading": "Ошибка загрузки",
        "alert_add_text_photo": "Добавьте текст или фото!", "alert_publish_error": "Ошибка публикации! Проверьте правила Storage.",
        "confirm_delete_news": "Удалить это объявление?", "confirm_delete_task": "Точно удалить это задание?", "admin_title": "Панель Администратора",
        "back_home": "На главную", "users_title": "Пользователи", "autosave_data": "Автосохранение данных", "cong_name_label": "Название собрания (Увидят все)",
        "cong_name_placeholder": "Например: Центральное", "requests_title": "Заявки", "active_users": "Активные", "search_placeholder": "Поиск...",
        "th_name_gender": "Имя и Пол", "th_pin": "ПИН", "th_group": "Группа", "th_school": "Школа", "th_status": "Статус в собрании",
        "th_responsible": "Ответственный за", "th_manage": "Управление", "error_save": "Ошибка сохранения!", "alert_pin_length": "ПИН-код должен состоять ровно из 6 цифр!",
        "error_save_pin": "Ошибка при сохранении ПИН-кода!", "error_update_role": "Ошибка при обновлении роли!", "confirm_block": "Заблокировать пользователя?",
        "confirm_delete_profile": "ВНИМАНИЕ! Удалить профиль?", "error_general": "Ошибка!", "confirm_reject": "Точно отклонить заявку и удалить данные?",
        "error_delete": "Ошибка удаления", "status_pending": "Ожидает", "btn_approve": "Одобрить", "btn_reject": "Отклонить", "btn_unblock": "Разблокировать",
        "btn_block": "Заблокировать", "btn_delete": "Удалить", "gender_boy": "Брат", "gender_girl": "Сестра", "role_publisher": "Возвещатель",
        "role_pioneer": "Пионер", "role_ms": "Помощник собр.", "role_elder": "Старейшина", "role_admin": "Админ", "role_group": "Группа",
        "role_terr": "Участки", "role_school": "Школа", "no_new_requests": "Нет новых заявок", "no_active_users": "Нет активных пользователей",
        "cat_reading_db": "📖 Чтение Библии", "cat_conversation": "🗣️ Разговор", "cat_interest": "🌱 Интерес", "cat_disciples": "👥 Подготавливайте",
        "cat_beliefs": "💡 Взгляды", "cat_talk_db": "🎙️ Речь", "open_map": "Открыть карту", "no_map": "Нет карты", "opt_cleaning": "🧹 Уборка зала",
        "opt_special_event": "⭐ Специальное событие", "all_groups": "Все", "congregation_label": "Собрание", "scan_qr": "Отсканируйте код",
        "days_short": "дн.", "return_terr_btn": "Сдать", "no_translation": "Нет перевода", "stand_title": "Служение со стендом",
        "stand_apply": "Подать заявку", "stand_signup": "Записаться", "stand_pending": "Заявка отправлена", "stand_month_shifts": "Смен в этом месяце",
        "stand_upcoming": "Твои ближайшие записи", "stand_no_records": "Нет записей", "zoom_error": "Zoom не настроен", "zoom_click_hint": "Нажми<br>на ZOOM",
        "zoom_launch": "ЗАПУСК", "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], 
        "info_title": "Информация", "suggest_title": "Идеи и предложения", "suggest_placeholder": "Заголовок / Текст предложения...",
        "suggest_btn": "Отправить", "suggest_empty": "Пока нет предложений."
    },
    cs: {
        "loading_data": "Načítání dat...", "pending_title": "Žádost se vyřizuje", "pending_desc": "Čekejte na potvrzení administrátorem.",
        "logout_btn": "Odejít", "loading_events": "Načítání schůzek...", "all_year": "Celý<br>rok", "loading_feed": "Načítání příspěvků...",
        "my_report": "Moje zpráva", "participated": "Ve službě", "hours_label": "Hodiny<br>&nbsp;", "studies_label": "Biblická<br>studia", "credit_label": "Kredit<br>&nbsp;",
        "fill_btn": "Vyplnit", "this_week": "Tento týden", "loading_duties": "Načítání...", "active_tasks": "Aktivní úkoly",
        "no_active_tasks": "Žádné aktivní úkoly", "archive_title": "Archiv", "history_empty": "Historie je prázdná", "my_territories": "Moje obvody",
        "request_btn": "Požádat", "no_territories": "Zatím nemáte žádné obvody", "profile_group": "Skupina", "profile_overseer": "Dozorce",
        "language": "Jazyk / Язык", "profile_logout": "Odhlásit se", "my_archive": "Můj archiv", "loading_archive": "Načítání...",
        "alert_no_notifications": "Oznámení nejsou na tomto zařízení podporována.", "alert_notifications_blocked": "Oznámení jsou blokována prohlížečem!\n\nPovolte je v nastavení.",
        "toast_notifications_enabled": "Oznámení byla úspěšně zapnuta!", "submit_report": "Odeslat zprávu", "alert_report_empty": "Zaškrtněte 'Ve službě' nebo zadejte hodiny!",
        "saving": "Ukládání...", "saved": "Uloženo:", "success": "Úspěšně", "change": "Změnit", "error_network": "Chyba sítě!",
        "access_denied": "PŘÍSTUP ODEPŘEN", "no_group": "Bez skupiny", "no_duties": "Žádné služby", "duty_reminder": "Připomenutí: Vaše skupina má tento víkend službu!",
        "cleaning_weekend": "Úklid", "no_active_territories": "Zatím nemáte žádné aktivní obvody", "territory_num": "Obvod č.",
        "active": "Aktivní", "assistant_for": "Pomocník u", "speech": "Proslov", "assistant_short": "Pom:", "lesson": "Lekce",
        "no_tasks_upcoming": "Zatím nemáte žádné aktivní úkoly", "new_task_toast": "Máte nový úkol", "delete": "Smazat",
        "new_badge": "Nové", "new_announcement_toast": "📢 Nové oznámení v kanálu!", "create_announcement": "Vytvořit oznámení",
        "write_text_ru": "Text (Ruština)...", "write_text_cs": "Text (Čeština)...", "publish": "Publikovat", "no_news": "Žádná aktuální oznámení",
        "today_badge": "DNES", "group_short": "Sk.", "leader_short": "Ved:", "today_event_toast": "📅 Dnes:", "no_events_today": "Dnes nejsou žádné události",
        "loading": "Načítání...", "archive_empty": "Archiv je prázdný", "unknown": "Neznámé", "error_loading": "Chyba načítání",
        "alert_add_text_photo": "Přidejte text nebo fotku!", "alert_publish_error": "Chyba publikování! Zkontrolujte pravidla Storage.",
        "confirm_delete_news": "Smazat toto oznámení?", "confirm_delete_task": "Opravdu smazat tento úkol?", "admin_title": "Panel administrátora",
        "back_home": "Na hlavní stránku", "users_title": "Uživatelé", "autosave_data": "Automatické ukládání dat", "cong_name_label": "Název sboru (Uvidí všichni)",
        "cong_name_placeholder": "Například: Centrální", "requests_title": "Žádosti", "active_users": "Aktivní", "search_placeholder": "Hledat...",
        "th_name_gender": "Jméno a Pohlaví", "th_pin": "PIN", "th_group": "Skupina", "th_school": "Škola", "th_status": "Status ve sboru",
        "th_responsible": "Zodpovědný za", "th_manage": "Správa", "error_save": "Chyba při ukládání!", "alert_pin_length": "PIN kód musí mít přesně 6 číslic!",
        "error_save_pin": "Chyba při ukládání PIN kódu!", "error_update_role": "Chyba při aktualizaci role!", "confirm_block": "Zablokovat uživatele?",
        "confirm_delete_profile": "POZOR! Smazat profil?", "error_general": "Chyba!", "confirm_reject": "Opravdu zamítnout žádost a smazat data?",
        "error_delete": "Chyba při mazání", "status_pending": "Čeká", "btn_approve": "Schválit", "btn_reject": "Zamítnout", "btn_unblock": "Odblokovat",
        "btn_block": "Zablokovat", "btn_delete": "Smazat", "gender_boy": "Bratr", "gender_girl": "Sestra", "role_publisher": "Zvěstovatel",
        "role_pioneer": "Průkopník", "role_ms": "Služební pom.", "role_elder": "Starší", "role_admin": "Admin", "role_group": "Skupina",
        "role_terr": "Obvody", "role_school": "Škola", "no_new_requests": "Žádné nové žádosti", "no_active_users": "Žádní aktivní uživatelé",
        "cat_reading_db": "📖 Čtení Bible", "cat_conversation": "🗣️ Rozhovor", "cat_interest": "🌱 Zájem", "cat_disciples": "👥 Čiňte učedníky",
        "cat_beliefs": "💡 Přesvědčení", "cat_talk_db": "🎙️ Proslov", "open_map": "Otevřít mapu", "no_map": "Bez mapy", "opt_cleaning": "🧹 Úklid sálu",
        "opt_special_event": "⭐ Zvláštní událost", "all_groups": "Společné", "congregation_label": "Sbor", "scan_qr": "Naskenujte kód",
        "days_short": "dní", "return_terr_btn": "Odevzdat", "no_translation": "Bez překladu", "stand_title": "Služba se stojanem",
        "stand_apply": "Požádat", "stand_signup": "Zapsat se", "stand_pending": "Žádost odeslána", "stand_month_shifts": "Služeb v tomto měsíci",
        "stand_upcoming": "Tvé nejbližší služby", "stand_no_records": "Žádné zápisy", "zoom_error": "Zoom není nastaven", "zoom_click_hint": "Klikni<br>na ZOOM",
        "zoom_launch": "SPUSTIT", "months": ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"],
        "days": ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"], 
        "info_title": "Informace", "suggest_title": "Nápady a návrhy", "suggest_placeholder": "Nadpis / Text návrhu...",
        "suggest_btn": "Odeslat", "suggest_empty": "Zatím žádné návrhy."
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => dict[currentLang][key] || key;

window.changeLanguage = (lang) => {
    localStorage.setItem('app_lang', lang);
    location.reload(); 
};

const applyTranslations = () => {
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = currentLang;
    document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = window.t(el.getAttribute('data-lang')));
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder'))));
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyTranslations);
else applyTranslations();

const firebaseConfig = {
    apiKey: "AIzaSyCwflIUs2AnBRIIxrssVpbpykHwG2436q0",
    authDomain: "gro-uping.firebaseapp.com",
    projectId: "gro-uping",
    storageBucket: "gro-uping.firebasestorage.app",
    messagingSenderId: "819938349545",
    appId: "1:819938349545:web:a00c3bef66d99f5b6cfb78"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); 

let messaging = null;
try { messaging = getMessaging(app); } catch (e) { console.warn("Push unsupported."); }
try { enableIndexedDbPersistence(db).catch(() => {}); } catch (e) {}

const userId = localStorage.getItem('userId');
if (!userId) window.location.href = 'login.html';

let isLoaderHidden = false;
window.hideGlobalLoader = () => {
    if (isLoaderHidden) return;
    isLoaderHidden = true;
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
};
setTimeout(window.hideGlobalLoader, 2500);

window.scrollNews = (offset) => { document.getElementById('content-news')?.scrollBy({ left: offset, behavior: 'smooth' }); };

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'warning' ? 'bg-amber-500' : 'bg-slate-800';
    toast.className = `${bgColor} text-white px-4 py-3 rounded-md shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 5000);
};

window.setupNotifications = async () => {
    const pushBtn = document.getElementById('push-btn');
    if (!messaging) return alert("❌ Ваше устройство или браузер не поддерживает Push-уведомления.");
    try {
        if (!('Notification' in window)) return alert("❌ " + window.t('alert_no_notifications'));
        if (pushBtn) pushBtn.innerHTML = '⏳'; 
        let permission = Notification.permission;
        if (permission === 'denied') throw new Error("Уведомления заблокированы! Разрешите их в настройках телефона.");
        if (permission !== 'granted') {
            const req = Notification.requestPermission();
            permission = (req instanceof Promise) ? await req : await new Promise(res => Notification.requestPermission(res));
        }
        if (permission !== 'granted') throw new Error("Нет разрешения на пуши");
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) registration = await navigator.serviceWorker.register('./sw.js');
        const token = await getToken(messaging, { vapidKey: 'BEdzEcHp_7Ero4qy1TulERNB7KDAymZBty7omUcHU2SNlMGTAwPM_MAO7qriZsmL-8ehVsU5pX2OtemKQhC-Tqk', serviceWorkerRegistration: registration });
        if (token) {
            await updateDoc(doc(db, "users", userId), { pushToken: token });
            window.showToast("✅ " + window.t('toast_notifications_enabled'));
            if (pushBtn) pushBtn.style.display = 'none';
        } else throw new Error("Сбой Google FCM: токен пуст.");
    } catch (error) { 
        if (error.message.includes('active service worker')) {
            alert("⏳ Настраиваем связь...\n\nПриложение сейчас перезагрузится. После этого нажмите на колокольчик еще раз!");
            window.location.reload();
        } else {
            alert("❌ ОШИБКА: " + error.message); 
            if (pushBtn) pushBtn.innerHTML = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`;
        }
    }
};

if (messaging) {
    try { onMessage(messaging, (payload) => { if (payload && payload.notification) window.showToast(`🔔 ${payload.notification.title}`, 'info'); }); } catch (e) {}
}

const TOP_ROLES = ["Владелец", "Админ"]; 
let currentUserData = null; 
let hasFullAccess = false;
let currentZoomData = { id: "", pass: "" }; 

window.zoomStateReady = false;
window.handleZoomClick = (event) => {
    event.preventDefault();
    if (!window.zoomStateReady) {
        document.getElementById('zoom-info-hidden').classList.add('hidden');
        document.getElementById('zoom-info-hidden').classList.remove('flex');
        document.getElementById('zoom-info-revealed').classList.remove('hidden');
        document.getElementById('zoom-info-revealed').classList.add('flex');
        window.zoomStateReady = true;
        setTimeout(resetZoomUI, 10000);
    } else {
        if (!currentZoomData || !currentZoomData.id || currentZoomData.id === '-') {
            alert(window.t('zoom_error')); resetZoomUI(); return;
        }
        const cleanId = currentZoomData.id.replace(/\s/g, '');
        const pass = currentZoomData.pass || '';
        window.location.href = `https://zoom.us/j/${cleanId}${pass ? '?pwd=' + pass : ''}`;
        setTimeout(resetZoomUI, 2000);
    }
};

function resetZoomUI() {
    window.zoomStateReady = false;
    const hidden = document.getElementById('zoom-info-hidden');
    const revealed = document.getElementById('zoom-info-revealed');
    if(hidden) { hidden.classList.remove('hidden'); hidden.classList.add('flex'); }
    if(revealed) { revealed.classList.add('hidden'); revealed.classList.remove('flex'); }
}

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const dbMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const currentMonthStr = d.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
const monthLabel = document.getElementById('current-month-label');
if (monthLabel) monthLabel.innerText = currentMonthStr;

window.switchTab = (tabId, btnElement) => {
    localStorage.setItem('activeTab', tabId);
    
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('.nav-icon-container').forEach(icon => {
        icon.classList.remove('bg-slate-700', 'text-white', 'shadow-inner');
        icon.classList.add('text-slate-500');
    });
    
    if(!btnElement) {
        btnElement = document.querySelector(`nav button[onclick="switchTab('${tabId}', this)"]`);
    }
    
    if(btnElement) {
        const icon = btnElement.querySelector('.nav-icon-container');
        if(icon) {
            icon.classList.remove('text-slate-500'); 
            icon.classList.add('bg-slate-700', 'text-white', 'shadow-inner');
        }
    }
};

window.submitReport = async () => {
    const fs = document.getElementById('report-fieldset');
    const btn = document.getElementById('submit-report-btn');
    if (!fs || !btn) return;
    if (fs.disabled) {
        fs.disabled = false;
        fs.classList.remove('opacity-50', 'grayscale-[50%]');
        btn.classList.replace('bg-slate-800', 'bg-ui-report');
        btn.innerText = window.t('submit_report');
    } else {
        const participated = document.getElementById('rep-participated')?.checked || false;
        const hours = document.getElementById('rep-hours')?.value || "";
        const studies = document.getElementById('rep-studies')?.value || "";
        const credit = document.getElementById('rep-credit')?.value || "";
        if (!participated && hours === "") return alert(window.t('alert_report_empty'));
        btn.innerText = window.t('saving'); btn.disabled = true;
        try {
            await setDoc(doc(db, "reports", `${userId}_${strictMonthId}`), {
                userId, userName: currentUserData.name, group: currentUserData.group || window.t('no_group'), month: dbMonthKey,
                participated, hours: Number(hours), studies: Number(studies), credit: Number(credit), submittedAt: new Date().toISOString()
            });
            const log = document.getElementById('last-report-log');
            if(log) log.innerText = `${window.t('saved')} ${new Date().toLocaleString(localeFormat)}`;
            btn.classList.replace('bg-ui-report', 'bg-ui-success');
            btn.innerText = window.t('success');
            setTimeout(() => {
                fs.disabled = true;
                fs.classList.add('opacity-50', 'grayscale-[50%]');
                btn.classList.replace('bg-ui-success', 'bg-slate-800');
                btn.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>${window.t('change')}`;
                btn.disabled = false;
            }, 2000);
        } catch (e) { alert(window.t('error_network')); btn.disabled = false; btn.innerText = window.t('submit_report'); }
    }
};

let isStandReqPending = false;
let myStands = [];
let unsubStandReqs = null;
let unsubStands = null;

onSnapshot(doc(db, "users", userId), async (docSnap) => {
    if (!docSnap.exists()) { if (navigator.onLine) window.logout(); return; }
    currentUserData = docSnap.data();

    const pendingScreen = document.getElementById('pending-screen');
    const mainDashboard = document.getElementById('main-dashboard');

    if (currentUserData.status === 'pending') {
        if(pendingScreen) { pendingScreen.classList.remove('hidden'); pendingScreen.classList.add('flex'); }
        if(mainDashboard) { mainDashboard.style.display = 'none'; }
        window.hideGlobalLoader();
    } else if (currentUserData.status === 'blocked') {
        document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">${window.t('access_denied')}</h1></div>`;
        window.hideGlobalLoader();
    } else {
        if(pendingScreen) { pendingScreen.classList.add('hidden'); pendingScreen.classList.remove('flex'); }
        if(mainDashboard) { mainDashboard.style.display = 'block'; }
        
        let userRoles = currentUserData.roles || [];
        const pushBtn = document.getElementById('push-btn');
        if (pushBtn) {
            if (!currentUserData.pushToken && messaging) pushBtn.style.display = 'flex';
            else pushBtn.style.display = 'none';
        }

        hasFullAccess = userRoles.some(r => TOP_ROLES.includes(r));
        const setAdminLink = (id, condition) => {
            const btn = document.getElementById(id);
            if (btn) {
                if (condition) { btn.classList.remove('hidden'); btn.classList.add('flex'); }
                else { btn.classList.add('hidden'); btn.classList.remove('flex'); }
            }
        };

        setAdminLink('profile-admin-btn', hasFullAccess);
        setAdminLink('profile-reports-btn', hasFullAccess || userRoles.includes("Надзиратель группы"));
        setAdminLink('profile-calendar-btn', hasFullAccess || userRoles.includes("Надзиратель группы"));
        setAdminLink('profile-duties-btn', hasFullAccess || userRoles.includes("Надзиратель группы"));
        setAdminLink('profile-terr-btn', hasFullAccess || userRoles.includes("Ответственный за участки"));
        setAdminLink('profile-school-btn', hasFullAccess || userRoles.includes("Ответственный за школу"));
        setAdminLink('profile-stand-admin-btn', hasFullAccess || userRoles.includes("Ответственный за стенды"));

        const profileAdminLinks = document.getElementById('profile-admin-links');
        if(profileAdminLinks) {
            if(hasFullAccess || userRoles.includes("Ответственный за стенды") || userRoles.includes("Надзиратель группы") || userRoles.includes("Ответственный за участки") || userRoles.includes("Ответственный за школу")) { 
                profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('grid'); 
            } else { 
                profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('grid'); 
            }
        }

        try { loadPersonalData(); } catch(e) {}
        try { loadProfileData(); } catch(e) {}
        renderStandCard();
        
        const savedTab = localStorage.getItem('activeTab') || 'home';
        window.switchTab(savedTab);
        window.hideGlobalLoader();
    }
});

// 🔥 ЛОГИКА ДЛЯ ИДЕЙ (SUGGESTIONS)
window.submitSuggestion = async () => {
    const input = document.getElementById('suggest-input');
    const text = input.value.trim();
    if (!text) return;
    const btn = document.getElementById('submit-suggest-btn');
    btn.disabled = true;
    try {
        await addDoc(collection(db, "suggestions"), {
            text: text,
            userName: currentUserData.name,
            createdAt: new Date().toISOString()
        });
        input.value = '';
        window.showToast(window.t('success'));
    } catch (e) {
        alert(window.t('error_network'));
    }
    btn.disabled = false;
};

window.deleteSuggestion = async (id) => {
    if (confirm("Удалить это предложение?")) {
        await deleteDoc(doc(db, "suggestions", id));
    }
};

onSnapshot(query(collection(db, "suggestions"), orderBy("createdAt", "desc")), (snap) => {
    const list = document.getElementById('suggestions-list');
    if (!list) return;
    let html = '';
    snap.forEach(docSnap => {
        const data = docSnap.data();
        const d = new Date(data.createdAt);
        const dateStr = `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        
        let delBtn = '';
        if (currentUserData && currentUserData.roles && (currentUserData.roles.includes('Админ') || currentUserData.roles.includes('Владелец'))) {
            delBtn = `<button onclick="deleteSuggestion('${docSnap.id}')" class="text-slate-300 hover:text-red-500 outline-none ml-2 transition-colors">✖</button>`;
        }

        html += `
            <div class="bg-slate-50 p-3 rounded-md border border-slate-100 flex flex-col mb-2">
                <div class="flex justify-between items-start mb-1">
                    <span class="font-black text-xs text-indigo-600">${data.userName}</span>
                    <div class="flex items-center">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${dateStr}</span>
                        ${delBtn}
                    </div>
                </div>
                <p class="text-sm font-medium text-slate-700 whitespace-pre-wrap">${data.text}</p>
            </div>
        `;
    });
    list.innerHTML = html || `<p class="text-slate-400 text-sm italic text-center py-2">${window.t('suggest_empty')}</p>`;
});
// ----------------------------------------------------

async function loadProfileData() {
    const pName = document.getElementById('profile-name');
    const pGroup = document.getElementById('profile-group');
    const pOverseer = document.getElementById('profile-overseer');

    if(pName) pName.innerText = currentUserData.name || "Имя";
    let roles = currentUserData.roles || ["Возвещатель"];
    const rolesContainer = document.getElementById('profile-roles-container');
    if (rolesContainer) {
        rolesContainer.innerHTML = roles.map(r => {
            let colorClass = "bg-slate-100 text-slate-500 border border-slate-200"; 
            if(r === "Старейшина") colorClass = "bg-amber-100 text-amber-700 border border-amber-200";
            else if(r === "Помощник собрания") colorClass = "bg-sky-100 text-sky-700 border border-sky-200";
            else if(r === "Пионер") colorClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
            else if(r === "Админ" || r === "Владелец") colorClass = "bg-rose-100 text-rose-700 border border-rose-200";
            if(["Ответственный за участки", "Ответственный за школу", "Участник школы", "Надзиратель группы"].includes(r)) return '';
            return `<span class="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${colorClass}">${r}</span>`;
        }).join('');
    }
    
    onSnapshot(doc(db, "settings", "congregation"), (docSnap) => {
        const congEl = document.getElementById('profile-congregation');
        const dashZoomId = document.getElementById('dash-zoom-id');
        const dashZoomPass = document.getElementById('dash-zoom-pass');
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if(congEl) congEl.innerText = data.name || "МАРИАНСКИЕ ЛАЗНЕ";
            currentZoomData.id = data.zoomId || "";
            currentZoomData.pass = data.zoomPass || "";
            if (dashZoomId) dashZoomId.innerText = currentZoomData.id || "-";
            if (dashZoomPass) dashZoomPass.innerText = currentZoomData.pass || "-";
        }
    });

    const myGroup = currentUserData.group || window.t('no_group');
    if(pGroup) pGroup.innerText = `№ ${myGroup}`;
    try {
        if (myGroup !== window.t('no_group') && pOverseer) {
            const q = query(collection(db, "users"), where("group", "==", myGroup), where("roles", "array-contains", "Надзиратель группы"));
            const snap = await getDocs(q);
            pOverseer.innerText = snap.empty ? "-" : snap.docs[0].data().name;
        } else if (pOverseer) { pOverseer.innerText = "-"; }
    } catch(e) {}
}

function renderStandCard() {
    const container = document.getElementById('stand-widget-container');
    if (!container) return;
    if (unsubStandReqs) unsubStandReqs();
    if (unsubStands) unsubStands();

    unsubStandReqs = onSnapshot(query(collection(db, "requests"), where("userId", "==", userId), where("type", "==", "stand")), (snap) => {
        isStandReqPending = !snap.empty;
        updateStandWidgetUI();
    });
    unsubStands = onSnapshot(query(collection(db, "stands"), where("userId", "==", userId)), (snap) => {
        myStands = [];
        snap.forEach(doc => myStands.push(doc.data()));
        updateStandWidgetUI();
    });
}

function updateStandWidgetUI() {
    const container = document.getElementById('stand-widget-container');
    if (!container) return;

    const roles = currentUserData.roles || [];
    const isApprovedForStand = roles.includes('Служение со стендом') || roles.includes('Владелец') || roles.includes('Админ');

    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
    const firstDayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

    let upcomingShifts = [];
    let monthCount = 0;

    myStands.forEach(data => {
        if (data.date >= firstDayStr && data.date.startsWith(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)) monthCount++;
        if (data.date >= todayStr) upcomingShifts.push(data);
    });
    
    upcomingShifts.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    const nextShifts = upcomingShifts.slice(0, 3);
    let buttonHtml = '';
    let contentHtml = '';

    if (isApprovedForStand) {
        buttonHtml = `<button onclick="window.location.href='stands.html'" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none transition-colors mt-4 shadow-sm">${window.t('stand_signup')}</button>`;
        
        let progressColor = 'bg-emerald-500';
        let txtColor = 'text-emerald-700';
        if (monthCount >= 20) { progressColor = 'bg-rose-500'; txtColor = 'text-rose-700'; }
        else if (monthCount >= 10) { progressColor = 'bg-amber-500'; txtColor = 'text-amber-700'; }
        
        let progressPercent = (monthCount / 50) * 100;
        if (progressPercent > 100) progressPercent = 100;

        const statsHtml = `
            <div class="mt-4 pt-4 border-t border-slate-100">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('stand_month_shifts')}</span>
                    <span class="${txtColor} font-black text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-sm">${monthCount}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                    <div class="${progressColor} h-1.5 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;

        if (nextShifts.length > 0) {
            let shiftsListHtml = '';
            nextShifts.forEach(shift => {
                if (!shift || !shift.date) return;
                const parts = shift.date.split('-');
                if (parts.length < 3) return;

                const dayNum = parseInt(parts[2], 10);
                const monthIndex = parseInt(parts[1], 10) - 1;
                const locName = shift.location && shift.location !== "undefined" ? shift.location : "ML - CupVital";
                const monthNameArr = window.t('months');
                const monthName = (Array.isArray(monthNameArr) && monthNameArr[monthIndex]) ? monthNameArr[monthIndex] : parts[1];

                shiftsListHtml += `
                    <div class="w-full bg-slate-50 border border-slate-200 flex items-center p-2 rounded-md mb-2 last:mb-0 shadow-sm hover:bg-white transition-colors">
                        <div class="flex flex-col items-center justify-center w-10 h-10 bg-slate-800 text-white rounded border border-slate-700 shrink-0 shadow-inner">
                            <span class="text-[7px] uppercase font-bold leading-none mb-0.5 tracking-widest">${monthName}</span>
                            <span class="text-base font-black leading-none">${dayNum}</span>
                        </div>
                        <div class="ml-3 flex flex-col truncate w-full">
                            <p class="font-black text-slate-800 text-xs truncate leading-tight">${locName}</p>
                            <p class="text-[10px] font-bold text-slate-500 mt-0.5 font-mono">${shift.time}</p>
                        </div>
                    </div>
                `;
            });
            contentHtml = `<div class="mt-3"><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">${window.t('stand_upcoming')}</p>${shiftsListHtml}</div>${statsHtml}`;
        } else {
            contentHtml = `<div class="w-full p-6 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center rounded-md mt-3 shadow-sm"><svg class="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${window.t('stand_no_records')}</p></div>${statsHtml}`;
        }
    } else {
        if (isStandReqPending) buttonHtml = `<button disabled class="w-full bg-slate-100 text-slate-400 font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none mt-3 shadow-sm">${window.t('stand_pending')}</button>`;
        else buttonHtml = `<button onclick="requestStand(this)" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none transition-colors mt-3 shadow-sm">${window.t('stand_apply')}</button>`;
        contentHtml = `<div class="w-full h-24 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-md mt-3 shadow-sm"><svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>`;
    }

    container.innerHTML = `
        <div class="bg-white rounded-md border border-slate-200 overflow-hidden p-4 w-full mb-6 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                    <svg class="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    ${window.t('stand_title')}
                </h3>
            </div>
            ${contentHtml}
            ${buttonHtml}
        </div>
    `;
}

window.requestStand = async (btn) => {
    btn.innerText = "..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "stand", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerHTML = `✅ ${window.t('success')}`;
        setTimeout(() => { btn.classList.replace('bg-emerald-500', 'bg-slate-100'); btn.classList.replace('text-white', 'text-slate-400'); btn.innerText = window.t('stand_pending'); }, 2000);
    } catch (e) { alert(window.t('error_network')); btn.innerText = window.t('stand_apply'); btn.disabled = false; }
};

function loadPersonalData() {
    onSnapshot(doc(db, "reports", `${userId}_${strictMonthId}`), (docSnap) => {
        if (docSnap.exists()) {
            const r = docSnap.data();
            const repP = document.getElementById('rep-participated'); if(repP) repP.checked = r.participated || false;
            const repH = document.getElementById('rep-hours'); if(repH) repH.value = r.hours || '';
            const repS = document.getElementById('rep-studies'); if(repS) repS.value = r.studies || '';
            const repC = document.getElementById('rep-credit'); if(repC) repC.value = r.credit || r.pubs || ''; 
            const log = document.getElementById('last-report-log'); if(log) log.innerText = `${window.t('saved')} ${new Date(r.submittedAt).toLocaleString(localeFormat)}`;
            const btn = document.getElementById('submit-report-btn');
            if(btn && document.getElementById('report-fieldset')?.disabled) {
                btn.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>${window.t('change')}`;
            }
        }
    });

    try {
        const dutiesQuery = query(collection(db, "duties"), orderBy("rawDate", "asc"));
        onSnapshot(dutiesQuery, (snapshot) => {
            const container = document.getElementById('dashboard-duties');
            if (!container) return;
            const today = new Date(); today.setHours(0,0,0,0);
            let currentDuty = null;
            let myDutyFound = false;

            snapshot.forEach(docSnap => {
                const d = docSnap.data();
                const dutyStart = new Date(d.rawDate); dutyStart.setHours(0,0,0,0);
                const dutyEnd = new Date(dutyStart); dutyEnd.setDate(dutyStart.getDate() + 6); dutyEnd.setHours(23,59,59,999);
                if (today.getTime() >= dutyStart.getTime() && today.getTime() <= dutyEnd.getTime()) {
                    currentDuty = d;
                    const myGroup = currentUserData ? currentUserData.group : window.t('no_group');
                    if (String(d.group) === String(myGroup)) myDutyFound = true;
                }
            });

            const dayOfWeek = today.getDay();
            const isCleaningDay = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);

            if (!currentDuty) {
                container.innerHTML = `<p class="text-[9px] text-slate-400 italic text-center py-2">${window.t('no_duties')}</p>`;
            } else {
                const myGroup = currentUserData ? currentUserData.group : window.t('no_group');
                const isMyGroup = String(currentDuty.group) === String(myGroup);
                let badgeClass = isMyGroup ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200';
                let alertHtml = '';
                if (isMyGroup && isCleaningDay) {
                    badgeClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                    alertHtml = `<p class="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1 animate-pulse flex items-center gap-1 truncate"><svg class="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span class="truncate">${window.t('cleaning_weekend')}</span></p>`;
                }

                let typeStr = currentDuty.type;
                if (typeStr === 'Уборка зала') typeStr = window.t('opt_cleaning').replace('🧹 ','');
                if (typeStr === 'Специальное событие') typeStr = window.t('opt_special_event').replace('⭐ ','');
                
                const rawGroup = String(currentDuty.group);
                const groupStr = (rawGroup === "Все" || rawGroup === "Všechny" || rawGroup === window.t('all_groups')) ? window.t('all_groups') : rawGroup;

                const dutyStart = new Date(currentDuty.rawDate); dutyStart.setHours(0,0,0,0);
                const dutyEnd = new Date(dutyStart); dutyEnd.setDate(dutyStart.getDate() + 6);
                const startDay = dutyStart.getDate();
                const endDay = dutyEnd.getDate();
                const endMonth = dutyEnd.toLocaleDateString(localeFormat, { month: 'long' });
                let localizedDateRange = `${startDay} - ${endDay} ${endMonth}`;
                if (dutyStart.getMonth() !== dutyEnd.getMonth()) {
                    const startMonth = dutyStart.toLocaleDateString(localeFormat, { month: 'short' });
                    localizedDateRange = `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
                }

                container.innerHTML = `
                    <div class="flex items-center w-full h-full gap-3 pl-2">
                        <div class="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-md border ${badgeClass} shrink-0 bg-slate-50 shadow-inner">
                            <span class="text-[7px] md:text-[8px] uppercase font-bold text-slate-400 leading-none mb-0.5 tracking-widest">${window.t('group_short')}</span>
                            <span class="text-lg md:text-xl font-black leading-none">${groupStr}</span>
                        </div>
                        <div class="flex flex-col justify-center min-w-0 flex-grow pr-2">
                            <span class="text-xs md:text-sm font-black text-slate-800 leading-tight truncate w-full">${typeStr}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate w-full">${localizedDateRange}</span>
                            ${alertHtml}
                        </div>
                    </div>
                `;
            }
            if (myDutyFound && isCleaningDay && !sessionStorage.getItem('duty_toast_shown')) {
                window.showToast(window.t('duty_reminder'), 'warning');
                sessionStorage.setItem('duty_toast_shown', 'true');
            }
        });
    } catch(e) {}

    try {
        let allMapsCache = {};
        onSnapshot(collection(db, "territory_maps"), (mapSnap) => {
            allMapsCache = {};
            mapSnap.forEach(d => { allMapsCache[d.id] = { url: d.data().url, imageUrl: d.data().imageUrl }; });
        });

        const terrQuery = query(collection(db, "territories"), where("userId", "==", userId));
        onSnapshot(terrQuery, (snapshot) => {
            const container = document.getElementById('territories-container');
            if(!container) return;
            let html = '';
            let activeCount = 0;

            snapshot.forEach(docSnap => {
                const terr = docSnap.data();
                if (terr.status === 'returned') return;
                activeCount++;
                let diffDays = 0;
                if (terr.issuedAt) {
                    const t = new Date(terr.issuedAt).getTime();
                    if (!isNaN(t)) diffDays = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
                }
                let barColor = "bg-emerald-500";
                let textColor = "text-emerald-600";
                let progress = (diffDays / 90) * 100;
                if (progress > 100) progress = 100;
                if (progress < 2) progress = 2; 
                if (diffDays >= 90) { barColor = "bg-red-500"; textColor = "text-red-600"; } 
                else if (diffDays >= 30) { barColor = "bg-amber-500"; textColor = "text-amber-600"; }

                const mapData = allMapsCache[String(terr.number)];
                const mapUrl = mapData ? mapData.url : null;
                const mapImg = mapData ? mapData.imageUrl : null;
                let mapArea = '';
                if (mapUrl && mapImg) {
                    mapArea = `<div class="w-full h-32 bg-slate-50 flex items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${mapUrl}', '_blank')"><img src="${mapImg}" class="absolute inset-0 w-full h-full object-cover" /><div class="absolute inset-0 bg-slate-900/30 flex flex-col items-center justify-center"><svg class="w-8 h-8 text-white drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg><span class="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md">${window.t('open_map')}</span></div></div>`;
                } else if (mapUrl) {
                    mapArea = `<div class="w-full h-24 bg-slate-50 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-colors" onclick="window.open('${mapUrl}', '_blank')"><svg class="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg><span class="absolute bottom-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">${window.t('open_map')}</span></div>`;
                } else {
                    mapArea = `<div class="w-full h-24 bg-slate-50 flex items-center justify-center relative"><svg class="w-8 h-8 text-slate-300 absolute opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg><span class="absolute bottom-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('no_map')}</span></div>`;
                }

                html += `
                    <div class="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                        <div class="p-3 flex flex-col bg-white border-b border-slate-100">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-black text-slate-800 text-sm">${window.t('territory_num')} ${terr.number}</h3>
                                <button onclick="markTerritoryReturned('${docSnap.id}')" class="text-[9px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-md uppercase transition-colors outline-none shadow-sm">${window.t('return_terr_btn')}</button>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                                    <div class="${barColor} h-1.5 rounded-full transition-all" style="width: ${progress}%"></div>
                                </div>
                                <span class="${textColor} text-[9px] font-black uppercase tracking-widest shrink-0 leading-none">${diffDays} ${window.t('days_short')}</span>
                            </div>
                        </div>
                        ${mapArea}
                    </div>
                `;
            });
            if (activeCount === 0) container.innerHTML = `<p class="text-slate-400 text-sm italic py-4 text-center border border-slate-200 rounded-md w-full">${window.t('no_active_territories')}</p>`;
            else container.innerHTML = html;
        });
    } catch(e) {}

    window.markTerritoryReturned = async (id) => {
        if (confirm('Точно сдать этот участок?')) { 
            try {
                await updateDoc(doc(db, "territories", id), { status: 'returned', returnedAt: new Date().toISOString() });
                window.showToast("Участок сдан! ✅");
            } catch (e) { alert("Ошибка сети!"); }
        }
    };

    try {
        const tasksQuery = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
        onSnapshot(tasksQuery, (snapshot) => {
            const upList = document.getElementById('upcoming-tasks-list');
            const pastList = document.getElementById('past-tasks-list');
            if(!upList || !pastList) return;
            upList.innerHTML = ''; pastList.innerHTML = '';
            
            let upCount = 0, pastCount = 0;
            const today = new Date(); today.setHours(0,0,0,0);
            
            snapshot.forEach(docSnap => {
                const task = docSnap.data();
                if (task.userId === userId || task.assistant === currentUserData.name) {
                    const taskDate = new Date(task.date);
                    const isPast = taskDate < today;
                    const isAssistant = task.assistant === currentUserData.name;
                    const opacityClass = isPast ? "opacity-60 grayscale bg-slate-50 border-slate-200" : "bg-white border-slate-200 shadow-sm";
                    let roleText = isAssistant ? `${window.t('assistant_for')} <span class="text-sky-600 ml-1 truncate">${task.userName}</span>` : `${window.t('speech')} ${task.assistant ? `<span class="text-slate-500 text-[10px] md:text-xs block mt-0.5 truncate">${window.t('assistant_short')} <span class="text-sky-600">${task.assistant}</span></span>` : ''}`;
                    let catStr = task.category || task.title || "";
                    if (catStr === 'ЧТЕНИЕ БИБЛИИ') catStr = window.t('cat_reading_db').replace('📖 ','');
                    if (catStr === 'НАЧИНАЙТЕ РАЗГОВОР') catStr = window.t('cat_conversation').replace('🗣️ ','');
                    if (catStr === 'РАЗВИВАЙТЕ ИНТЕРЕС') catStr = window.t('cat_interest').replace('🌱 ','');
                    if (catStr === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') catStr = window.t('cat_disciples').replace('👥 ','');
                    if (catStr === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') catStr = window.t('cat_beliefs').replace('💡 ','');
                    if (catStr === 'РЕЧЬ') catStr = window.t('cat_talk_db').replace('🎙️ ','');

                    const cardHtml = `
                        <div class="p-4 rounded-md border ${opacityClass} mb-3 relative overflow-hidden transition-all">
                            <div class="flex items-center gap-3">
                                <div class="flex flex-col items-center justify-center w-12 h-12 ${isPast ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-sky-50 border-sky-100 text-sky-500'} rounded border shrink-0">
                                    <span class="text-[8px] uppercase font-bold leading-none mb-0.5 tracking-widest">${taskDate.toLocaleDateString(localeFormat, { month: 'short' }).replace('.', '')}</span>
                                    <span class="text-xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-sky-700'}">${taskDate.getDate()}</span>
                                </div>
                                <div class="min-w-0 flex flex-col justify-center gap-1 w-full">
                                    <h3 class="font-black text-slate-800 text-sm leading-tight">${roleText}</h3>
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-1.5 min-w-0">
                                            <span class="font-black ${isPast ? 'text-slate-500' : 'text-sky-700'} text-[9px] uppercase tracking-wide leading-tight truncate">${catStr}</span>
                                        </div>
                                        ${task.lesson ? `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded shrink-0">${window.t('lesson')} ${task.lesson}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    if (!isPast) { 
                        upCount++; upList.innerHTML += cardHtml; 
                        if (!sessionStorage.getItem('task_toast_' + docSnap.id)) {
                            window.showToast(`📚 ${window.t('new_task_toast')} ${task.category || task.title}`, 'info');
                            sessionStorage.setItem('task_toast_' + docSnap.id, 'true');
                        }
                    } else { pastCount++; pastList.innerHTML += cardHtml; }
                }
            });
            if (upCount === 0) upList.innerHTML = `<p class="text-slate-400 text-sm italic py-2 text-center border border-slate-200 rounded-md">${window.t('no_tasks_upcoming')}</p>`;
            if (pastCount === 0) pastList.innerHTML = `<p class="text-slate-400 text-sm italic py-2 text-center">${window.t('history_empty')}</p>`;
        });
    } catch(e){}

    try {
        const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
        onSnapshot(eventsQuery, (snapshot) => {
            const container = document.getElementById('calendar-events');
            if (!container) return; 
            
            const now = new Date();
            const tzOffset = now.getTimezoneOffset() * 60000;
            const todayStr = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];

            let todayEvents = [];
            let futureEvents = [];

            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                ev.id = docSnap.id;
                if (ev.date === todayStr) {
                    todayEvents.push(ev);
                } else if (ev.date > todayStr) {
                    futureEvents.push(ev);
                }
            });

            let eventsToRender = [];
            let isShowingFuture = false;

            if (todayEvents.length > 0) {
                eventsToRender = todayEvents;
            } else if (futureEvents.length > 0) {
                isShowingFuture = true;
                const nextDate = futureEvents[0].date;
                eventsToRender = futureEvents.filter(e => e.date === nextDate);
            }

            let html = '';
            if (eventsToRender.length > 0) {
                eventsToRender.forEach(ev => {
                    let isPastEvent = false;
                    let displayTime = ev.time || "";
                    
                    if (!isShowingFuture && displayTime) {
                        let hours = 0, minutes = 0;
                        if (!displayTime.includes(':') && displayTime.length >= 3) {
                            if (displayTime.length === 4) displayTime = displayTime.substring(0, 2) + ':' + displayTime.substring(2, 4);
                            else if (displayTime.length === 3) displayTime = '0' + displayTime.substring(0, 1) + ':' + displayTime.substring(1, 3);
                        }
                        if (displayTime.includes(':')) {
                            [hours, minutes] = displayTime.split(':');
                            const eventExactTime = new Date();
                            eventExactTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                            if (now.getTime() > eventExactTime.getTime() + (1.5 * 60 * 60 * 1000)) isPastEvent = true;
                        }
                    }

                    let evGroup = ev.group || window.t('no_group');
                    if (evGroup === "Все" || evGroup === "Všechny") evGroup = window.t('all_groups');
                    const hasGroup = evGroup !== window.t('no_group');
                    
                    const activeClass = isPastEvent ? "bg-slate-50 border-b border-slate-200 opacity-60 grayscale" : "bg-white border-b border-slate-100";
                    const timeColor = isPastEvent ? "text-slate-400" : (isShowingFuture ? "text-indigo-500" : "text-rose-500");
                    const leaderColor = isPastEvent ? "text-slate-400" : "text-indigo-600";
                    const titleColor = isPastEvent ? "text-slate-500" : "text-slate-800";
                    
                    const dateObj = new Date(ev.date);
                    const dayNum = dateObj.getDate();
                    const monthIndex = dateObj.getMonth();
                    
                    const monthNameArr = window.t('months');
                    const badgeText = isShowingFuture 
                        ? ((Array.isArray(monthNameArr) && monthNameArr[monthIndex]) ? monthNameArr[monthIndex] : ev.date.split('-')[1])
                        : window.t('today_badge');

                    const badgeBg = isShowingFuture ? "bg-indigo-600 text-white" : "bg-slate-800 text-white";

                    html += `
                        <div class="flex items-center p-3 w-full cursor-default ${activeClass}">
                            <div class="flex items-center gap-1.5 shrink-0 mr-3">
                                <div class="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 ${badgeBg} rounded-md shadow-inner shrink-0">
                                    <span class="text-[7px] md:text-[8px] uppercase font-bold text-slate-300 leading-none mb-0.5 tracking-widest">${badgeText}</span>
                                    <span class="text-lg md:text-xl font-black leading-none">${dayNum}</span>
                                </div>
                                ${hasGroup ? `
                                <div class="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-100 border border-slate-200 text-slate-600 rounded-md shrink-0">
                                    <span class="text-[7px] md:text-[8px] uppercase font-bold text-slate-400 leading-none mb-0.5 tracking-widest">${window.t('group_short')}</span>
                                    <span class="text-sm md:text-lg font-black leading-none">${evGroup}</span>
                                </div>` : ''}
                            </div>
                            <div class="flex flex-col flex-grow truncate min-w-0">
                                <div class="flex items-center gap-1.5 truncate">
                                    ${displayTime ? `<span class="text-xs md:text-sm font-black shrink-0 ${timeColor}">${displayTime}</span>` : ''}
                                    <span class="font-black text-sm md:text-base truncate ${titleColor}">${ev.title} ${ev.isSpecial ? '⭐' : ''}</span>
                                </div>
                                ${ev.leader ? `<span class="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 truncate mt-0.5">${window.t('leader_short')} <b class="${leaderColor}">${ev.leader}</b></span>` : ''}
                            </div>
                        </div>
                    `;

                    if (!isPastEvent && !isShowingFuture && !sessionStorage.getItem('event_toast_' + ev.id)) {
                        window.showToast(`${window.t('today_event_toast')} ${ev.title} ${displayTime ? ' ' + displayTime : ''}`, 'info');
                        sessionStorage.setItem('event_toast_' + ev.id, 'true');
                    }
                });
                container.innerHTML = html;
            } else {
                container.innerHTML = `<p class="p-4 text-xs text-slate-400 italic text-center">${window.t('no_events_today')}</p>`;
            }
        });
    } catch(e) {}

    try {
        const newsQuery = query(collection(db, "section_content"), orderBy("createdAt", "desc"));
        onSnapshot(newsQuery, (snapshot) => {
            let newsHTML = ``; 
            const now = new Date().getTime();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const oneDay = 24 * 60 * 60 * 1000;
            const isNewsAdmin = currentUserData.roles && (currentUserData.roles.includes('Админ') || currentUserData.roles.includes('Владелец') || currentUserData.roles.includes('Старейшина'));

            snapshot.forEach(docSnap => {
                const item = docSnap.data();
                if(item.section === 'news') {
                    const itemTime = new Date(item.createdAt).getTime();
                    if (now - itemTime < oneWeek) {
                        const isNew = (now - itemTime) < oneDay;
                        
                        // 🔥 КНОПКА УДАЛЕНИЯ ВНИЗУ КАК СТРОКА
                        const deleteBtn = isNewsAdmin ? `<button onclick="deleteNews('${docSnap.id}')" class="text-[9px] text-red-400 hover:text-red-600 font-bold uppercase tracking-widest bg-red-50 hover:bg-red-100 border-t border-red-100 px-2 py-1.5 w-full transition-colors outline-none flex items-center justify-center gap-1 shrink-0"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>${window.t('delete')}</button>` : '';
                        
                        let displayText = ''; let shouldShow = false;
                        const hasRu = !!item.text_ru; const hasCs = !!item.text_cs;
                        const hasLegacyText = !!item.text && !hasRu && !hasCs; 
                        const hasImg = !!item.imageUrl;

                        if (hasLegacyText) { displayText = item.text; shouldShow = true; } 
                        else if (currentLang === 'ru') { if (hasRu) { displayText = item.text_ru; shouldShow = true; } else if (!hasRu && !hasCs && hasImg) { shouldShow = true; } } 
                        else if (currentLang === 'cs') { if (hasCs) { displayText = item.text_cs; shouldShow = true; } else if (!hasRu && !hasCs && hasImg) { shouldShow = true; } }

                        if (!shouldShow) return; 

                        const bgCardClass = isNew ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 opacity-90 border-slate-200";
                        const newBadge = isNew ? `<span class="absolute top-2 left-2 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm z-10">${window.t('new_badge')}</span>` : '';

                        let contentHtml = '';
                        if (!displayText && !item.imageUrl) {
                            contentHtml = `<div class="flex flex-col items-center justify-center flex-grow py-6 text-slate-300"><svg class="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span class="text-[10px] font-black uppercase tracking-widest opacity-50">${window.t('no_translation')}</span></div>`;
                        } else {
                            const imgClass = displayText ? "h-20 md:h-24" : "flex-grow h-full";
                            const textPadding = item.imageUrl ? "p-3 pb-4" : "p-4";
                            
                            const imgHtml = item.imageUrl ? `<img src="${item.imageUrl}" class="w-full ${imgClass} object-cover shrink-0 cursor-pointer" onclick="window.open('${item.imageUrl}', '_blank')">` : '';
                            const textHtml = displayText ? `<div class="${textPadding} flex-grow overflow-y-auto custom-scrollbar flex flex-col justify-start"><p class="text-slate-800 whitespace-pre-wrap text-xs md:text-sm leading-snug font-black">${displayText}</p></div>` : '';
                            
                            contentHtml = imgHtml + textHtml;
                        }

                        newsHTML += `
                        <div class="w-[180px] h-[180px] md:w-[220px] md:h-[220px] shrink-0 snap-center rounded-md border transition-all flex flex-col overflow-hidden relative ${bgCardClass}">
                            ${newBadge}
                            <div class="flex-grow flex flex-col overflow-hidden w-full justify-start items-start">
                                ${contentHtml}
                            </div>
                            ${deleteBtn}
                        </div>`;

                        if (isNew && !sessionStorage.getItem('news_toast_' + docSnap.id)) { window.showToast(window.t('new_announcement_toast'), 'info'); sessionStorage.setItem('news_toast_' + docSnap.id, 'true'); }
                    }
                }
            });

            if (isNewsAdmin) {
                let textAreaHtml = '';
                if (currentLang === 'ru') textAreaHtml = `<textarea id="news-input-ru" rows="2" placeholder="${window.t('write_text_ru')}" class="w-full bg-white border-b border-slate-200 p-2 text-[10px] outline-none focus:border-indigo-400 resize-none font-medium text-slate-700 flex-grow custom-scrollbar"></textarea>`;
                else textAreaHtml = `<textarea id="news-input-cs" rows="2" placeholder="${window.t('write_text_cs')}" class="w-full bg-slate-50 border-b border-slate-200 p-2 text-[10px] outline-none focus:border-indigo-400 resize-none font-medium text-slate-700 flex-grow custom-scrollbar"></textarea>`;

                newsHTML += `<div class="w-[180px] h-[180px] md:w-[220px] md:h-[220px] shrink-0 snap-center rounded-md border border-dashed border-slate-400 bg-slate-100/50 flex flex-col relative overflow-hidden"><p class="p-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center flex items-center justify-center gap-1 shrink-0"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>${window.t('create_announcement')}</p>${textAreaHtml}<div class="flex items-center justify-between p-2 gap-1.5 shrink-0"><label class="cursor-pointer bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 rounded transition-colors flex items-center justify-center w-8 h-6 shrink-0 shadow-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg><input type="file" id="news-image" accept="image/*" class="hidden" onchange="previewImage(this)"></label><button onclick="publishNews()" id="publish-news-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-bold px-2 rounded flex-grow transition-colors h-6 outline-none shadow-sm">${window.t('publish')}</button></div><div id="image-preview-container" class="hidden absolute inset-x-0 bottom-0 top-8 bg-white z-20 shrink-0"><img id="image-preview" src="" class="h-full w-full object-cover border-t border-slate-200"><button onclick="removeImage()" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center outline-none"><svg class="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div></div>`;
            }

            const contentNews = document.getElementById('content-news');
            if(contentNews) contentNews.innerHTML = newsHTML || `<div class="w-full h-32 shrink-0 p-6 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center mx-4 md:mx-0 shadow-sm"><p class="text-slate-400 italic text-sm text-center">${window.t('no_news')}</p></div>`;
        });
    } catch(e) {}
}

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
window.openReportHistory = () => document.getElementById('report-history-modal').classList.replace('hidden', 'flex');
window.openQrModal = () => document.getElementById('qr-modal').classList.replace('hidden', 'flex');
window.closeModals = () => {
    const m1 = document.getElementById('profile-modal'); if(m1) m1.classList.replace('flex', 'hidden');
    const m2 = document.getElementById('report-history-modal'); if(m2) m2.classList.replace('flex', 'hidden');
};
window.closeQrModal = () => document.getElementById('qr-modal').classList.replace('flex', 'hidden');

window.logout = async () => {
    const uid = localStorage.getItem('userId');
    if (uid) { try { await updateDoc(doc(db, "users", uid), { pushToken: "" }); } catch (e) {} }
    localStorage.clear(); window.location.href = 'login.html'; 
};

let selectedImageFile = null;
window.previewImage = (input) => {
    if (input.files && input.files[0]) {
        selectedImageFile = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-preview-container').classList.remove('hidden');
        };
        reader.readAsDataURL(selectedImageFile);
    }
};

window.removeImage = () => {
    selectedImageFile = null;
    document.getElementById('news-image').value = '';
    document.getElementById('image-preview-container').classList.add('hidden');
};

window.publishNews = async () => {
    const inputRu = document.getElementById('news-input-ru'); const inputCs = document.getElementById('news-input-cs');
    const textRu = inputRu ? inputRu.value.trim() : ''; const textCs = inputCs ? inputCs.value.trim() : '';
    if (!textRu && !textCs && !selectedImageFile) return alert(window.t('alert_add_text_photo'));

    const btn = document.getElementById('publish-news-btn');
    if(btn) { btn.innerText = window.t('loading'); btn.disabled = true; }

    try {
        let imageUrl = "";
        if (selectedImageFile) {
            const fileName = Date.now() + '_' + selectedImageFile.name;
            const storageRef = ref(storage, 'news/' + fileName);
            await uploadBytes(storageRef, selectedImageFile);
            imageUrl = await getDownloadURL(storageRef);
        }

        await addDoc(collection(db, "section_content"), { section: 'news', text_ru: textRu, text_cs: textCs, text: textRu || textCs, imageUrl: imageUrl, createdAt: new Date().toISOString() });
        
        if(inputRu) inputRu.value = ''; if(inputCs) inputCs.value = '';
        removeImage();
        if(btn) {
            btn.innerHTML = `<svg class="w-4 h-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>${window.t('success')}`;
            setTimeout(() => { btn.innerText = window.t('publish'); btn.disabled = false; }, 2000);
        }
    } catch (e) { alert(window.t('alert_publish_error')); if(btn) { btn.innerText = window.t('publish'); btn.disabled = false; } }
};

window.deleteNews = async (id) => {
    if (confirm(window.t('confirm_delete_news'))) { try { await deleteDoc(doc(db, "section_content", id)); } catch (e) { alert(window.t('error_network')); } }
};
