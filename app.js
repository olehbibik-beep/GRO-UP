import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

const dict = {
    ru: {
        "loading_data": "Загрузка данных...",
        "pending_title": "Заявка на рассмотрении",
        "pending_desc": "Ожидайте подтверждения администратора.",
        "logout_btn": "Выйти",
        "loading_events": "Загрузка встреч...",
        "all_year": "Весь<br>год",
        "loading_feed": "Загрузка ленты...",
        "my_report": "Мой отчет",
        "participated": "Служил(а)",
        "hours_label": "Часы<br>&nbsp;",
        "studies_label": "Изучения<br>Библии",
        "credit_label": "Кредит<br>&nbsp;",
        "fill_btn": "Заполнить",
        "this_week": "На этой неделе",
        "loading_duties": "Загрузка...",
        "active_tasks": "Активные задания",
        "no_active_tasks": "Нет активных заданий",
        "archive_title": "Архив",
        "history_empty": "История пуста",
        "my_territories": "Мои участки",
        "request_btn": "Попросить",
        "no_territories": "У вас пока нет участков",
        "profile_group": "Группа",
        "profile_overseer": "Ответственный",
        "language": "Язык / Jazyk",
        "profile_logout": "Выйти из аккаунта",
        "my_archive": "Мой архив",
        "loading_archive": "Загрузка...",
        "alert_no_notifications": "Уведомления не поддерживаются на этом устройстве.",
        "alert_notifications_blocked": "Уведомления заблокированы браузером!\n\nРазрешите их в настройках.",
        "toast_notifications_enabled": "Уведомления успешно включены!",
        "submit_report": "Отправить отчет",
        "alert_report_empty": "Отметьте галочку 'Служил(а)' или введите часы!",
        "saving": "Сохранение...",
        "saved": "Сохранено:",
        "success": "Успешно",
        "change": "Изменить",
        "error_network": "Ошибка сети!",
        "access_denied": "ДОСТУП ЗАКРЫТ",
        "no_group": "Без группы",
        "no_duties": "Нет дежурств",
        "duty_reminder": "Напоминание: Ваша группа дежурит в эти выходные!",
        "cleaning_weekend": "Уборка",
        "no_active_territories": "У вас пока нет активных участков",
        "territory_num": "Участок №",
        "active": "Активен",
        "assistant_for": "Помощник у",
        "speech": "Выступление",
        "assistant_short": "Пом:",
        "lesson": "Урок",
        "no_tasks_upcoming": "У тебя пока нет активных заданий",
        "new_task_toast": "У вас новое задание",
        "delete": "Удалить",
        "new_badge": "Новое",
        "new_announcement_toast": "📢 Новое объявление в ленте!",
        "create_announcement": "Создать объявление",
        "write_text_ru": "Текст (на русском)...",
        "write_text_cs": "Текст (на чешском)...",
        "publish": "Опубликовать",
        "no_news": "Актуальных объявлений нет",
        "today_badge": "СЕГОДНЯ",
        "group_short": "Гр.",
        "leader_short": "Вед:",
        "today_event_toast": "📅 Сегодня:",
        "no_events_today": "На сегодня событий нет",
        "loading": "Загрузка...",
        "archive_empty": "Архив пуст",
        "unknown": "Неизвестно",
        "error_loading": "Ошибка загрузки",
        "alert_add_text_photo": "Добавьте текст или фото!",
        "alert_publish_error": "Ошибка публикации! Проверьте правила Storage.",
        "confirm_delete_news": "Удалить это объявление?",
        "confirm_delete_task": "Точно удалить это задание?",
        "admin_title": "Панель Администратора",
        "back_home": "На главную",
        "users_title": "Пользователи",
        "autosave_data": "Автосохранение данных",
        "cong_name_label": "Название собрания (Увидят все)",
        "cong_name_placeholder": "Например: Центральное",
        "requests_title": "Заявки",
        "active_users": "Активные",
        "search_placeholder": "Поиск...",
        "th_name_gender": "Имя и Пол",
        "th_pin": "ПИН",
        "th_group": "Группа",
        "th_school": "Школа",
        "th_status": "Статус в собрании",
        "th_responsible": "Ответственный за",
        "th_manage": "Управление",
        "error_save": "Ошибка сохранения!",
        "alert_pin_length": "ПИН-код должен состоять ровно из 6 цифр!",
        "error_save_pin": "Ошибка при сохранении ПИН-кода!",
        "error_update_role": "Ошибка при обновлении роли!",
        "confirm_block": "Заблокировать пользователя?",
        "confirm_delete_profile": "ВНИМАНИЕ! Удалить профиль?",
        "error_general": "Ошибка!",
        "confirm_reject": "Точно отклонить заявку и удалить данные?",
        "error_delete": "Ошибка удаления",
        "status_pending": "Ожидает",
        "btn_approve": "Одобрить",
        "btn_reject": "Отклонить",
        "btn_unblock": "Разблокировать",
        "btn_block": "Заблокировать",
        "btn_delete": "Удалить",
        "gender_boy": "Брат",
        "gender_girl": "Сестра",
        "role_publisher": "Возвещатель",
        "role_pioneer": "Пионер",
        "role_ms": "Помощник собр.",
        "role_elder": "Старейшина",
        "role_admin": "Админ",
        "role_group": "Группа",
        "role_terr": "Участки",
        "role_school": "Школа",
        "no_new_requests": "Нет новых заявок",
        "no_active_users": "Нет активных пользователей",
        "cat_reading_db": "📖 Чтение Библии",
        "cat_conversation": "🗣️ Разговор",
        "cat_interest": "🌱 Интерес",
        "cat_disciples": "👥 Подготавливайте",
        "cat_beliefs": "💡 Взгляды",
        "cat_talk_db": "🎙️ Речь",
        "open_map": "Открыть карту",
        "no_map": "Нет карты",
        "opt_cleaning": "🧹 Уборка зала",
        "opt_special_event": "⭐ Специальное событие",
        "all_groups": "Все",
        "congregation_label": "Собрание",
        "scan_qr": "Отсканируйте код",
        "days_short": "дн.",
        "return_terr_btn": "Сдать",
        "no_translation": "Нет перевода",
        "stand_title": "Служение со стендом",
        "stand_apply": "Подать заявку",
        "stand_signup": "Записаться",
        "stand_pending": "Заявка отправлена",
        "stand_month_shifts": "Смен в этом месяце",
        "stand_upcoming": "Твои ближайшие записи",
        "stand_no_records": "Нет записей",
        "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    },
    cs: {
        "loading_data": "Načítání dat...",
        "pending_title": "Žádost se vyřizuje",
        "pending_desc": "Čekejte na potvrzení administrátorem.",
        "logout_btn": "Odejít",
        "loading_events": "Načítání schůzek...",
        "all_year": "Celý<br>rok",
        "loading_feed": "Načítání příspěvků...",
        "my_report": "Moje zpráva",
        "participated": "Ve službě",
        "hours_label": "Hodiny<br>&nbsp;",
        "studies_label": "Biblická<br>studia",
        "credit_label": "Kredit<br>&nbsp;",
        "fill_btn": "Vyplnit",
        "this_week": "Tento týden",
        "loading_duties": "Načítání...",
        "active_tasks": "Aktivní úkoly",
        "no_active_tasks": "Žádné aktivní úkoly",
        "archive_title": "Archiv",
        "history_empty": "Historie je prázdná",
        "my_territories": "Moje obvody",
        "request_btn": "Požádat",
        "no_territories": "Zatím nemáte žádné obvody",
        "profile_group": "Skupina",
        "profile_overseer": "Dozorce",
        "language": "Jazyk / Язык",
        "profile_logout": "Odhlásit se",
        "my_archive": "Můj archiv",
        "loading_archive": "Načítání...",
        "alert_no_notifications": "Oznámení nejsou na tomto zařízení podporována.",
        "alert_notifications_blocked": "Oznámení jsou blokována prohlížečem!\n\nPovolte je v nastavení.",
        "toast_notifications_enabled": "Oznámení byla úspěšně zapnuta!",
        "submit_report": "Odeslat zprávu",
        "alert_report_empty": "Zaškrtněte 'Ve službě' nebo zadejte hodiny!",
        "saving": "Ukládání...",
        "saved": "Uloženo:",
        "success": "Úspěšně",
        "change": "Změnit",
        "error_network": "Chyba sítě!",
        "access_denied": "PŘÍSTUP ODEPŘEN",
        "no_group": "Bez skupiny",
        "no_duties": "Žádné služby",
        "duty_reminder": "Připomenutí: Vaše skupina má tento víkend službu!",
        "cleaning_weekend": "Úklid",
        "no_active_territories": "Zatím nemáte žádné aktivní obvody",
        "territory_num": "Obvod č.",
        "active": "Aktivní",
        "assistant_for": "Pomocník u",
        "speech": "Proslov",
        "assistant_short": "Pom:",
        "lesson": "Lekce",
        "no_tasks_upcoming": "Zatím nemáte žádné aktivní úkoly",
        "new_task_toast": "Máte nový úkol",
        "delete": "Smazat",
        "new_badge": "Nové",
        "new_announcement_toast": "📢 Nové oznámení v kanálu!",
        "create_announcement": "Vytvořit oznámení",
        "write_text_ru": "Text (Ruština)...",
        "write_text_cs": "Text (Čeština)...",
        "publish": "Publikovat",
        "no_news": "Žádná aktuální oznámení",
        "today_badge": "DNES",
        "group_short": "Sk.",
        "leader_short": "Ved:",
        "today_event_toast": "📅 Dnes:",
        "no_events_today": "Dnes nejsou žádné události",
        "loading": "Načítání...",
        "archive_empty": "Archiv je prázdný",
        "unknown": "Neznámé",
        "error_loading": "Chyba načítání",
        "alert_add_text_photo": "Přidejte text nebo fotku!",
        "alert_publish_error": "Chyba publikování! Zkontrolujte pravidla Storage.",
        "confirm_delete_news": "Smazat toto oznámení?",
        "confirm_delete_task": "Opravdu smazat tento úkol?",
        "admin_title": "Panel administrátora",
        "back_home": "Na hlavní stránku",
        "users_title": "Uživatelé",
        "autosave_data": "Automatické ukládání dat",
        "cong_name_label": "Název sboru (Uvidí všichni)",
        "cong_name_placeholder": "Například: Centrální",
        "requests_title": "Žádosti",
        "active_users": "Aktivní",
        "search_placeholder": "Hledat...",
        "th_name_gender": "Jméno a Pohlaví",
        "th_pin": "PIN",
        "th_group": "Skupina",
        "th_school": "Škola",
        "th_status": "Status ve sboru",
        "th_responsible": "Zodpovědný za",
        "th_manage": "Správa",
        "error_save": "Chyba při ukládání!",
        "alert_pin_length": "PIN kód musí mít přesně 6 číslic!",
        "error_save_pin": "Chyba při ukládání PIN kódu!",
        "error_update_role": "Chyba při aktualizaci role!",
        "confirm_block": "Zablokovat uživatele?",
        "confirm_delete_profile": "POZOR! Smazat profil?",
        "error_general": "Chyba!",
        "confirm_reject": "Opravdu zamítnout žádost a smazat data?",
        "error_delete": "Chyba při mazání",
        "status_pending": "Čeká",
        "btn_approve": "Schválit",
        "btn_reject": "Zamítnout",
        "btn_unblock": "Odblokovat",
        "btn_block": "Zablokovat",
        "btn_delete": "Smazat",
        "gender_boy": "Bratr",
        "gender_girl": "Sestra",
        "role_publisher": "Zvěstovatel",
        "role_pioneer": "Průkopník",
        "role_ms": "Služební pom.",
        "role_elder": "Starší",
        "role_admin": "Admin",
        "role_group": "Skupina",
        "role_terr": "Obvody",
        "role_school": "Škola",
        "no_new_requests": "Žádné nové žádosti",
        "no_active_users": "Žádní aktivní uživatelé",
        "cat_reading_db": "📖 Čtení Bible",
        "cat_conversation": "🗣️ Rozhovor",
        "cat_interest": "🌱 Zájem",
        "cat_disciples": "👥 Čiňte učedníky",
        "cat_beliefs": "💡 Přesvědčení",
        "cat_talk_db": "🎙️ Proslov",
        "open_map": "Otevřít mapu",
        "no_map": "Bez mapy",
        "opt_cleaning": "🧹 Úklid sálu",
        "opt_special_event": "⭐ Zvláštní událost",
        "all_groups": "Vše",
        "congregation_label": "Sbor",
        "scan_qr": "Naskenujte kód",
        "days_short": "dní",
        "return_terr_btn": "Odevzdat",
        "no_translation": "Bez překladu",
        "stand_title": "Služba se stojanem",
        "stand_apply": "Požádat",
        "stand_signup": "Zapsat se",
        "stand_pending": "Žádost odeslána",
        "stand_month_shifts": "Služeb v tomto měsíci",
        "stand_upcoming": "Tvé nejbližší služby",
        "stand_no_records": "Žádné zápisy",
        "months": ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"],
        "days": ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key; 
};

window.changeLanguage = (lang) => {
    localStorage.setItem('app_lang', lang);
    location.reload(); 
};

const applyTranslations = () => {
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = currentLang;

    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        el.innerHTML = window.t(key);
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}

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
try {
    messaging = getMessaging(app);
} catch (e) {
    console.warn("Push-уведомления не поддерживаются в этом браузере.");
}

try {
    enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {}

const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = 'login.html';
    throw new Error("No user ID found"); 
}

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

window.scrollNews = (offset) => {
    const container = document.getElementById('content-news');
    if (container) container.scrollBy({ left: offset, behavior: 'smooth' });
};

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'warning' ? 'bg-amber-500' : 'bg-slate-800';
    toast.className = `${bgColor} text-white px-4 py-3 rounded-md shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

window.setupNotifications = async () => {
    const pushBtn = document.getElementById('push-btn');
    if (!messaging) return alert("❌ Ваше устройство или браузер не поддерживает Push-уведомления.");

    try {
        if (!('Notification' in window)) return alert("❌ " + window.t('alert_no_notifications'));
        
        if (pushBtn) pushBtn.innerHTML = '⏳'; 

        let permission = Notification.permission;
        
        if (permission === 'denied') {
            throw new Error("Уведомления заблокированы! Разрешите их в настройках телефона.");
        }
        
        if (permission !== 'granted') {
            const req = Notification.requestPermission();
            permission = (req instanceof Promise) ? await req : await new Promise(res => Notification.requestPermission(res));
        }
        
        if (permission !== 'granted') throw new Error("Нет разрешения на пуши");

        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            registration = await navigator.serviceWorker.register('./sw.js');
        }

        const token = await getToken(messaging, { 
            vapidKey: 'BEdzEcHp_7Ero4qy1TulERNB7KDAymZBty7omUcHU2SNlMGTAwPM_MAO7qriZsmL-8ehVsU5pX2OtemKQhC-Tqk',
            serviceWorkerRegistration: registration 
        });

        if (token) {
            await updateDoc(doc(db, "users", userId), { pushToken: token });
            window.showToast("✅ " + window.t('toast_notifications_enabled'));
            if (pushBtn) pushBtn.style.display = 'none';
        } else {
            throw new Error("Сбой Google FCM: токен пуст.");
        }
    } catch (error) { 
        if (error.message.includes('active service worker')) {
            alert("⏳ Настраиваем связь...\n\nПриложение сейчас перезагрузится. После этого нажмите на колокольчик еще раз!");
            window.location.reload();
        } else {
            alert("❌ ОШИБКА: " + error.message); 
            console.error(error); 
            if (pushBtn) pushBtn.innerHTML = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`;
        }
    }
};

if (messaging) {
    try {
        onMessage(messaging, (payload) => {
            if (payload && payload.notification) {
                window.showToast(`🔔 ${payload.notification.title}`, 'info');
            }
        });
    } catch (e) {}
}

const TOP_ROLES = ["Владелец", "Админ"]; 
const OVERSEER_ROLES = ["Владелец", "Админ", "Надзиратель группы"];
let currentUserData = null; 
let hasFullAccess = false;
let currentZoomData = { id: "", pass: "" }; 

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const dbMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const currentMonthStr = d.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
const monthLabel = document.getElementById('current-month-label');
if (monthLabel) monthLabel.innerText = currentMonthStr;

window.switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) targetTab.classList.add('active');

    document.querySelectorAll('.nav-icon-container').forEach(icon => {
        icon.classList.remove('bg-slate-700', 'text-white', 'shadow-inner');
        icon.classList.add('text-slate-500');
    });
    
    if(btnElement) {
        const icon = btnElement.querySelector('.nav-icon-container');
        icon.classList.remove('text-slate-500'); 
        icon.classList.add('bg-slate-700', 'text-white', 'shadow-inner');
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

        let showAdminMenu = false;
        if (userRoles.some(r => TOP_ROLES.includes(r))) hasFullAccess = true;
        else hasFullAccess = false;

        const setAdminLink = (id, condition) => {
            const btn = document.getElementById(id);
            if (btn) {
                if (condition) { btn.classList.remove('hidden'); btn.classList.add('flex'); showAdminMenu = true; }
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
            if(showAdminMenu || userRoles.includes("Ответственный за стенды")) { profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('grid'); } 
            else { profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('grid'); }
        }

        try { loadPersonalData(); } catch(e) { console.error("Error:", e); }
        try { loadProfileData(); } catch(e) { console.error("Error:", e); }
        
        renderStandCard();

        window.hideGlobalLoader();
    }
});

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

window.joinZoom = (event) => {
    event.preventDefault(); 
    if (!currentZoomData || !currentZoomData.id || currentZoomData.id === '-') {
        return alert(window.t('zoom_error') || 'Zoom не настроен администратором');
    }
    const cleanId = currentZoomData.id.replace(/\s/g, '');
    const pass = currentZoomData.pass || '';
    const webUrl = `https://zoom.us/j/${cleanId}${pass ? '?pwd=' + pass : ''}`;
    window.location.href = webUrl;
};

// 🔥 ЖИВОЙ ВИДЖЕТ СТЕНДОВ С ЗАГЛУШКОЙ UNDEFINED
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
        if (data.date >= firstDayStr) monthCount++;
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
        buttonHtml = `<button onclick="window.location.href='stands.html'" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none transition-colors mt-4 shadow-sm">${window.t('stand_signup') || 'Записаться'}</button>`;
        
        let progressColor = 'bg-emerald-500';
        let txtColor = 'text-emerald-700';
        if (monthCount >= 20) { progressColor = 'bg-rose-500'; txtColor = 'text-rose-700'; }
        else if (monthCount >= 10) { progressColor = 'bg-amber-500'; txtColor = 'text-amber-700'; }
        
        let progressPercent = (monthCount / 50) * 100;
        if (progressPercent > 100) progressPercent = 100;

        const statsHtml = `
            <div class="mt-4 pt-4 border-t border-slate-100">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('stand_month_shifts') || 'Смен в этом месяце'}</span>
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
                
                // Защита: чтобы не было undefined если локация отсутствует в старой базе
                const locName = shift.location && shift.location !== "undefined" ? shift.location : "ML - CupVital";
                
                // Защита для месяцев (на случай если словарь загружен некорректно)
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

            contentHtml = `
                <div class="mt-3">
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">${window.t('stand_upcoming') || 'Твои ближайшие записи'}</p>
                    ${shiftsListHtml}
                </div>
                ${statsHtml}
            `;
        } else {
            contentHtml = `
                <div class="w-full p-6 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center rounded-md mt-3 shadow-sm">
                    <svg class="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${window.t('stand_no_records') || 'Нет записей'}</p>
                </div>
                ${statsHtml}
            `;
        }

    } else {
        if (isStandReqPending) {
            buttonHtml = `<button disabled class="w-full bg-slate-100 text-slate-400 font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none mt-3 shadow-sm">${window.t('stand_pending') || 'Заявка отправлена'}</button>`;
        } else {
            buttonHtml = `<button onclick="requestStand(this)" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none transition-colors mt-3 shadow-sm">${window.t('stand_apply') || 'Подать заявку'}</button>`;
        }
        
        contentHtml = `
            <div class="w-full h-24 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-md mt-3 shadow-sm">
                <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="bg-white rounded-md border border-slate-200 overflow-hidden p-4 w-full mb-6 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 class="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                    <svg class="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    ${window.t('stand_title') || 'Служение со стендом'}
                </h3>
            </div>
            ${contentHtml}
            ${buttonHtml}
        </div>
    `;
}

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
                    if (String(d.group) === String(myGroup)) {
                        myDutyFound = true;
                    }
                }
            });

            const dayOfWeek = today.getDay();
            const isCleaningDay = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);

            if (!currentDuty) {
                container.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-2">${window.t('no_duties')}</p>`;
            } else {
                const myGroup = currentUserData ? currentUserData.group : window.t('no_group');
                const isMyGroup = String(currentDuty.group) === String(myGroup);
                
                let badgeClass = isMyGroup ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200';
                
                let alertHtml = '';
                if (isMyGroup && isCleaningDay) {
                    badgeClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                    alertHtml = `<p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 animate-pulse flex items-center gap-1"><svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span class="truncate">${window.t('cleaning_weekend')}</span></p>`;
                }

                let typeStr = currentDuty.type;
                if (typeStr === 'Уборка зала') typeStr = window.t('opt_cleaning').replace('🧹 ','');
                if (typeStr === 'Специальное событие') typeStr = window.t('opt_special_event').replace('⭐ ','');
                
                const groupStr = currentDuty.group === "Все" || currentDuty.group === window.t('all_groups') ? window.t('all_groups') : `${window.t('group_short')} ${currentDuty.group}`;

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
                    <div class="flex items-center justify-between w-full h-full">
                        <div class="flex flex-col justify-center pr-2 min-w-0">
                            <span class="text-sm md:text-base font-black text-slate-800 leading-tight truncate">${typeStr}</span>
                            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">${localizedDateRange}</span>
                            ${alertHtml}
                        </div>
                        <div class="flex items-center justify-center px-4 py-2 rounded-md border ${badgeClass} h-full min-h-[48px] shrink-0">
                            <span class="text-sm md:text-base font-black uppercase tracking-widest">${groupStr}</span>
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
            mapSnap.forEach(d => {
                allMapsCache[d.id] = { url: d.data().url, imageUrl: d.data().imageUrl };
            });
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
                    if (!isNaN(t)) {
                        diffDays = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
                    }
                }
                
                let barColor = "bg-emerald-500";
                let textColor = "text-emerald-600";
                let progress = (diffDays / 90) * 100;
                if (progress > 100) progress = 100;
                if (progress < 2) progress = 2; 

                if (diffDays >= 90) {
                    barColor = "bg-red-500";
                    textColor = "text-red-600";
                } else if (diffDays >= 30) {
                    barColor = "bg-amber-500";
                    textColor = "text-amber-600";
                }

                const mapData = allMapsCache[String(terr.number)];
                const mapUrl = mapData ? mapData.url : null;
                const mapImg = mapData ? mapData.imageUrl : null;
                
                let mapArea = '';
                if (mapUrl && mapImg) {
                    mapArea = `<div class="w-full h-32 bg-slate-50 flex items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${mapUrl}', '_blank')">
                        <img src="${mapImg}" class="absolute inset-0 w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-slate-900/30 flex flex-col items-center justify-center">
                            <svg class="w-8 h-8 text-white drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span class="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md">${window.t('open_map') || 'Открыть карту'}</span>
                        </div>
                    </div>`;
                } else if (mapUrl) {
                    mapArea = `<div class="w-full h-24 bg-slate-50 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-colors" onclick="window.open('${mapUrl}', '_blank')">
                            <svg class="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span class="absolute bottom-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">${window.t('open_map') || 'Открыть карту'}</span>
                       </div>`;
                } else {
                    mapArea = `<div class="w-full h-24 bg-slate-50 flex items-center justify-center relative">
                            <svg class="w-8 h-8 text-slate-300 absolute opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span class="absolute bottom-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('no_map') || 'Нет карты'}</span>
                       </div>`;
                }

                html += `
                    <div class="bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                        <div class="p-3 flex flex-col bg-white border-b border-slate-100">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-black text-slate-800 text-sm">${window.t('territory_num') || 'Участок №'} ${terr.number}</h3>
                                <button onclick="markTerritoryReturned('${docSnap.id}')" class="text-[9px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-md uppercase transition-colors outline-none shadow-sm">${window.t('return_terr_btn') || 'Сдать'}</button>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                                    <div class="${barColor} h-1.5 rounded-full transition-all" style="width: ${progress}%"></div>
                                </div>
                                <span class="${textColor} text-[9px] font-black uppercase tracking-widest shrink-0 leading-none">${diffDays} ${window.t('days_short') || 'дн.'}</span>
                            </div>
                        </div>
                        ${mapArea}
                    </div>
                `;
            });
            
            if (activeCount === 0) {
                container.innerHTML = `<p class="text-slate-400 text-sm italic py-4 text-center border border-slate-200 rounded-md w-full">${window.t('no_active_territories') || 'У вас пока нет активных участков'}</p>`;
            } else {
                container.innerHTML = html;
            }
        });
    } catch(e) {}

    try {
        const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
        onSnapshot(eventsQuery, (snapshot) => {
            const container = document.getElementById('calendar-events');
            if (!container) return; 
            let html = '';
            
            const now = new Date();
            const tzOffset = now.getTimezoneOffset() * 60000;
            const todayStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                
                if (ev.date === todayStr) {
                    let isPastEvent = false;
                    let displayTime = ev.time || "";
                    
                    if (displayTime) {
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

                    const evGroup = ev.group || window.t('no_group');
                    const groupBadge = evGroup !== window.t('no_group') 
                        ? `<div class="flex items-center justify-center px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md shrink-0 ml-auto">
                             <span class="text-xs md:text-sm font-black uppercase tracking-widest text-slate-700">${window.t('group_short')} ${evGroup}</span>
                           </div>` 
                        : '';
                    const activeClass = isPastEvent ? "bg-slate-50 text-slate-400 border-b border-slate-200" : "bg-white text-slate-800 border-b border-slate-100";
                    const timeColor = isPastEvent ? "text-slate-400" : "text-rose-500";
                    const leaderColor = isPastEvent ? "text-slate-400" : "text-rose-600";
                    
                    const dayNum = ev.date ? parseInt(ev.date.split('-')[2], 10) : now.getDate();

                    html += `
                        <div class="flex items-center p-3 w-full cursor-default ${activeClass}">
                            <div class="flex items-center gap-3 w-full">
                                <div class="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 border border-slate-200 rounded-md shrink-0">
                                    <span class="text-[8px] uppercase font-bold text-slate-400 leading-none mb-1 tracking-widest">${window.t('today_badge')}</span>
                                    <span class="text-xl font-black text-slate-700 leading-none">${dayNum}</span>
                                </div>
                                <div class="flex flex-col flex-grow truncate min-w-0">
                                    <div class="flex items-center gap-2 truncate">
                                        ${displayTime ? `<span class="text-sm font-black shrink-0 ${timeColor}">${displayTime}</span>` : ''}
                                        <span class="font-black text-sm md:text-base truncate text-slate-800">${ev.title}</span>
                                    </div>
                                    ${ev.leader ? `<span class="text-[10px] md:text-xs uppercase font-bold text-slate-500 truncate mt-0.5">${window.t('leader_short')} <b class="${leaderColor}">${ev.leader}</b></span>` : ''}
                                </div>
                                ${groupBadge}
                            </div>
                        </div>
                    `;

                    if (!isPastEvent && !sessionStorage.getItem('event_toast_' + docSnap.id)) {
                        window.showToast(`${window.t('today_event_toast')} ${ev.title} ${displayTime ? ' ' + displayTime : ''}`, 'info');
                        sessionStorage.setItem('event_toast_' + docSnap.id, 'true');
                    }
                }
            });

            container.innerHTML = html || `<p class="p-4 text-xs text-slate-400 italic text-center">${window.t('no_events_today')}</p>`;
        });
    } catch(e) {}
}

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
window.openReportHistory = () => document.getElementById('report-history-modal').classList.replace('hidden', 'flex');
window.openQrModal = () => document.getElementById('qr-modal').classList.replace('hidden', 'flex');

window.closeModals = () => {
    const m1 = document.getElementById('profile-modal');
    if(m1) m1.classList.replace('flex', 'hidden');
    
    const m2 = document.getElementById('report-history-modal');
    if(m2) m2.classList.replace('flex', 'hidden');
};

window.closeQrModal = () => document.getElementById('qr-modal').classList.replace('flex', 'hidden');

window.logout = async () => {
    const uid = localStorage.getItem('userId');
    if (uid) {
        try { await updateDoc(doc(db, "users", uid), { pushToken: "" }); } catch (e) {}
    }
    localStorage.clear(); 
    window.location.href = 'login.html'; 
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
    const inputRu = document.getElementById('news-input-ru');
    const inputCs = document.getElementById('news-input-cs');
    const textRu = inputRu ? inputRu.value.trim() : '';
    const textCs = inputCs ? inputCs.value.trim() : '';

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

        await addDoc(collection(db, "section_content"), {
            section: 'news',
            text_ru: textRu,
            text_cs: textCs,
            text: textRu || textCs, 
            imageUrl: imageUrl,
            createdAt: new Date().toISOString()
        });
        
        if(inputRu) inputRu.value = '';
        if(inputCs) inputCs.value = '';
        removeImage();
        
        if(btn) {
            btn.innerHTML = `<svg class="w-4 h-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>${window.t('success')}`;
            setTimeout(() => { btn.innerText = window.t('publish'); btn.disabled = false; }, 2000);
        }
    } catch (e) { 
        console.log(e);
        alert(window.t('alert_publish_error')); 
        if(btn) { btn.innerText = window.t('publish'); btn.disabled = false; }
    }
};

window.deleteNews = async (id) => {
    if (confirm(window.t('confirm_delete_news'))) {
        try { await deleteDoc(doc(db, "section_content", id)); } 
        catch (e) { alert(window.t('error_network')); }
    }
};
