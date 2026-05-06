import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

// 🔥 ЕДИНЫЙ ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ ДЛЯ ВСЕГО ПРИЛОЖЕНИЯ
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
        "no_duties": "На этой неделе дежурств нет",
        "duty_reminder": "Напоминание: Ваша группа дежурит в эти выходные!",
        "cleaning_weekend": "Уборка в эти выходные!",
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
        "write_text": "Напишите текст...",
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
        // Админка
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
        // Для перевода заданий на главном экране
        "cat_reading_db": "📖 Чтение Библии",
        "cat_conversation": "🗣️ Разговор",
        "cat_interest": "🌱 Интерес",
        "cat_disciples": "👥 Подготавливайте",
        "cat_beliefs": "💡 Взгляды",
        "cat_talk_db": "🎙️ Речь",
        // Для карт
        "open_map": "Открыть карту",
        "no_map": "Нет карты"
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
        "no_duties": "Tento týden nejsou žádné služby",
        "duty_reminder": "Připomenutí: Vaše skupina má tento víkend službu!",
        "cleaning_weekend": "Úklid tento víkend!",
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
        "write_text": "Napište text...",
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
        // Админка
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
        // Для перевода заданий на главном экране
        "cat_reading_db": "📖 Čtení Bible",
        "cat_conversation": "🗣️ Rozhovor",
        "cat_interest": "🌱 Zájem",
        "cat_disciples": "👥 Čiňte učedníky",
        "cat_beliefs": "💡 Přesvědčení",
        "cat_talk_db": "🎙️ Proslov",
        // Для карт
        "open_map": "Otevřít mapu",
        "no_map": "Bez mapy"
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

// Принудительно применяем перевод к HTML
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
// ============================================

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
const messaging = getMessaging(app);

enableIndexedDbPersistence(db).catch(() => {});

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

window.scrollNews = (offset) => {
    const container = document.getElementById('content-news');
    if (container) container.scrollBy({ left: offset, behavior: 'smooth' });
};

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'warning' ? 'bg-amber-500' : 'bg-indigo-600';
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

window.setupNotifications = async () => {
    try {
        if (!('Notification' in window)) return alert("❌ " + window.t('alert_no_notifications'));
        
        const pushBtn = document.getElementById('push-btn');
        if (pushBtn) pushBtn.innerHTML = '⏳'; 

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            alert("Шаг 1: iOS разрешил пуши!"); // Проверка 1
            
            const registration = await navigator.serviceWorker.ready;
            alert("Шаг 2: Service Worker найден!"); // Проверка 2
            
            alert("Шаг 3: Ждем токен от Firebase (может занять 5-10 сек)..."); // Проверка 3
            
            const token = await getToken(messaging, { 
                vapidKey: 'BEdzEcHp_7Ero4qy1TulERNB7KDAymZBty7omUcHU2SNlMGTAwPM_MAO7qriZsmL-8ehVsU5pX2OtemKQhC-Tqk',
                serviceWorkerRegistration: registration 
            });
            
            alert("Шаг 4: Токен получен!"); // Проверка 4
            
            if (token) {
                await updateDoc(doc(db, "users", userId), { pushToken: token });
                window.showToast("✅ " + window.t('toast_notifications_enabled'));
                if (pushBtn) pushBtn.style.display = 'none';
            } else {
                alert("⚠️ Ошибка: Токен пустой.");
                if (pushBtn) pushBtn.innerHTML = `🔔`;
            }
        } else {
            alert("🔒 Разрешение не получено. Статус: " + permission);
            if (pushBtn) pushBtn.innerHTML = `🔔`;
        }
    } catch (error) { 
        alert("❌ ОШИБКА: " + error.message); 
        console.error(error); 
        const pushBtn = document.getElementById('push-btn');
        if (pushBtn) pushBtn.innerHTML = `🔔`;
    }
};

onMessage(messaging, (payload) => {
    console.log('Пришло уведомление:', payload);
    if (payload && payload.notification) {
        window.showToast(`🔔 ${payload.notification.title}`, 'info');
    }
});

const TOP_ROLES = ["Владелец", "Админ"]; 
const OVERSEER_ROLES = ["Владелец", "Админ", "Надзиратель группы"];
let currentUserData = null; 
let hasFullAccess = false;

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 

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
                userId, userName: currentUserData.name, group: currentUserData.group || window.t('no_group'), month: currentMonthStr,
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
            if (!currentUserData.pushToken) pushBtn.style.display = 'flex';
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

        const profileAdminLinks = document.getElementById('profile-admin-links');
        if(profileAdminLinks) {
            if(showAdminMenu) { profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('grid'); } 
            else { profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('grid'); }
        }

        try { loadPersonalData(); } catch(e) { console.error("Error:", e); }
        try { loadProfileData(); } catch(e) { console.error("Error:", e); }
        
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
        if (congEl) {
            if(docSnap.exists() && docSnap.data().name) congEl.innerText = `${docSnap.data().name}`;
            else congEl.innerText = `МАРИАНСКИЕ ЛАЗНЕ`;
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
                
                let badgeClass = isMyGroup ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200';
                
                let alertHtml = '';
                if (isMyGroup && isCleaningDay) {
                    badgeClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                    alertHtml = `<p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 animate-pulse flex items-center justify-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>${window.t('cleaning_weekend')}</p>`;
                }

                container.innerHTML = `
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-black text-slate-800 truncate pr-2">${currentDuty.type}</span>
                        <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${badgeClass} shrink-0">${window.t('group_short')} ${currentDuty.group}</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">${currentDuty.dateRange}</span>
                    ${alertHtml}
                `;
            }

            if (myDutyFound && isCleaningDay && !sessionStorage.getItem('duty_toast_shown')) {
                window.showToast(window.t('duty_reminder'), 'warning');
                sessionStorage.setItem('duty_toast_shown', 'true');
            }
        });
    } catch(e) {}

    // 🔥 ВОТ ТОТ САМЫЙ КУСОК ДЛЯ УЧАСТКОВ С БАЗОЙ КАРТ
    try {
        let allMapsCache = {};
        onSnapshot(collection(db, "territory_maps"), (mapSnap) => {
            allMapsCache = {};
            mapSnap.forEach(d => allMapsCache[d.id] = d.data().url);
        });

        const terrQuery = query(collection(db, "territories"), where("userId", "==", userId));
        onSnapshot(terrQuery, (snapshot) => {
            const container = document.getElementById('territories-container');
            if(!container) return;
            if (snapshot.empty) return container.innerHTML = `<p class="text-slate-400 text-sm italic py-4 text-center border border-slate-200 rounded-xl">${window.t('no_active_territories')}</p>`;
            
            container.innerHTML = '';
            snapshot.forEach(docSnap => {
                const terr = docSnap.data();
                const mapUrl = allMapsCache[String(terr.number)];
                
                const mapArea = mapUrl 
                    ? `<div class="w-full h-24 bg-slate-50 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-colors" onclick="window.open('${mapUrl}', '_blank')">
                            <svg class="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span class="absolute bottom-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">${window.t('open_map')}</span>
                       </div>`
                    : `<div class="w-full h-24 bg-slate-50 flex items-center justify-center relative">
                            <svg class="w-8 h-8 text-slate-300 absolute opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span class="absolute bottom-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('no_map')}</span>
                       </div>`;

                container.innerHTML += `
                    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                        <div class="p-3 flex justify-between items-center bg-white border-b border-slate-100">
                            <h3 class="font-black text-slate-800 text-sm">${window.t('territory_num')} ${terr.number}</h3>
                            <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase border border-emerald-100">${window.t('active')}</span>
                        </div>
                        ${mapArea}
                    </div>
                `;
            });
        });
    } catch(e) {}

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
                    const opacityClass = isPast ? "opacity-60 grayscale bg-slate-50 border-slate-200" : "bg-white border-slate-200";
                    let roleText = isAssistant 
                        ? `${window.t('assistant_for')} <span class="text-sky-600 ml-1 truncate">${task.userName}</span>` 
                        : `${window.t('speech')} ${task.assistant ? `<span class="text-slate-500 text-[10px] md:text-xs block mt-0.5 truncate">${window.t('assistant_short')} <span class="text-sky-600">${task.assistant}</span></span>` : ''}`;

                    let catStr = task.category || task.title || "";
                    if (catStr === 'ЧТЕНИЕ БИБЛИИ') catStr = window.t('cat_reading_db').replace('📖 ','');
                    if (catStr === 'НАЧИНАЙТЕ РАЗГОВОР') catStr = window.t('cat_conversation').replace('🗣️ ','');
                    if (catStr === 'РАЗВИВАЙТЕ ИНТЕРЕС') catStr = window.t('cat_interest').replace('🌱 ','');
                    if (catStr === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') catStr = window.t('cat_disciples').replace('👥 ','');
                    if (catStr === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') catStr = window.t('cat_beliefs').replace('💡 ','');
                    if (catStr === 'РЕЧЬ') catStr = window.t('cat_talk_db').replace('🎙️ ','');

                    const cardHtml = `
                        <div class="p-4 rounded-lg border ${opacityClass} mb-3 relative overflow-hidden transition-all">
                            <div class="flex items-center gap-3">
                                <div class="flex flex-col items-center justify-center w-12 h-12 ${isPast ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-sky-50 border-sky-100 text-sky-500'} rounded-lg border shrink-0">
                                    <span class="text-[8px] uppercase font-bold leading-none mb-0.5 tracking-widest">${taskDate.toLocaleDateString(localeFormat, { month: 'short' }).replace('.', '')}</span>
                                    <span class="text-xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-sky-700'}">${taskDate.getDate()}</span>
                                </div>
                                <div class="min-w-0 flex flex-col justify-center gap-1 w-full">
                                    <h3 class="font-black text-slate-800 text-sm leading-tight">${roleText}</h3>
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-1.5 min-w-0">
                                            <span class="font-black ${isPast ? 'text-slate-500' : 'text-sky-700'} text-[9px] uppercase tracking-wide leading-tight truncate">${catStr}</span>
                                        </div>
                                        ${task.lesson ? `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">${window.t('lesson')} ${task.lesson}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    if (!isPast) { 
                        upCount++; 
                        upList.innerHTML += cardHtml; 
                        
                        if (!sessionStorage.getItem('task_toast_' + docSnap.id)) {
                            window.showToast(`📚 ${window.t('new_task_toast')} ${task.category || task.title}`, 'info');
                            sessionStorage.setItem('task_toast_' + docSnap.id, 'true');
                        }
                    } 
                    else { 
                        pastCount++; 
                        pastList.innerHTML += cardHtml; 
                    }
                }
            });
            if (upCount === 0) upList.innerHTML = `<p class="text-slate-400 text-sm italic py-2 text-center border border-slate-200 rounded-lg">${window.t('no_tasks_upcoming')}</p>`;
            if (pastCount === 0) pastList.innerHTML = `<p class="text-slate-400 text-sm italic py-2 text-center">${window.t('history_empty')}</p>`;
        });
    } catch(e){}

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
                        const deleteBtn = isNewsAdmin ? `<button onclick="deleteNews('${docSnap.id}')" class="text-[9px] text-red-400 hover:text-red-600 mt-4 font-bold uppercase tracking-widest bg-red-50/50 border border-red-100 px-2 py-2 rounded-lg w-full transition-colors outline-none flex items-center justify-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>${window.t('delete')}</button>` : '';
                        const imgHtml = item.imageUrl ? `<img src="${item.imageUrl}" class="mt-3 rounded-lg max-h-48 w-full object-cover border border-slate-200 cursor-pointer" onclick="window.open('${item.imageUrl}', '_blank')">` : '';

                        const bgCardClass = isNew ? "bg-white border-slate-200" : "bg-slate-50 opacity-90 border-slate-200";
                        const newBadge = isNew ? `<span class="bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block mb-2">${window.t('new_badge')}</span>` : '';

                        newsHTML += `
                        <div class="w-[240px] md:w-[280px] h-auto self-stretch shrink-0 snap-center p-4 rounded-lg border transition-all flex flex-col justify-between ${bgCardClass}">
                            <div>
                                ${newBadge}
                                <p class="text-slate-700 whitespace-pre-wrap text-xs md:text-sm leading-relaxed font-medium">${item.text}</p>
                                ${imgHtml}
                            </div>
                            <div class="mt-auto pt-4">${deleteBtn}</div>
                        </div>`;

                        if (isNew && !sessionStorage.getItem('news_toast_' + docSnap.id)) {
                            window.showToast(window.t('new_announcement_toast'), 'info');
                            sessionStorage.setItem('news_toast_' + docSnap.id, 'true');
                        }
                    }
                }
            });

            if (isNewsAdmin) {
                newsHTML += `
                <div class="w-[240px] md:w-[280px] h-auto self-stretch shrink-0 snap-center p-4 rounded-lg border border-dashed border-slate-400 bg-slate-100/50 flex flex-col justify-center relative">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center flex items-center justify-center gap-1"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>${window.t('create_announcement')}</p>
                    <textarea id="news-input" rows="2" placeholder="${window.t('write_text')}" class="w-full bg-white rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-400 resize-none font-medium text-slate-700 flex-grow"></textarea>
                    <div class="flex items-center justify-between mt-3 gap-2">
                        <label class="cursor-pointer bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 rounded-lg transition-colors flex items-center justify-center w-10 h-8 shrink-0">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <input type="file" id="news-image" accept="image/*" class="hidden" onchange="previewImage(this)">
                        </label>
                        <button onclick="publishNews()" id="publish-news-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 rounded-lg flex-grow transition-colors h-8 outline-none">${window.t('publish')}</button>
                    </div>
                    <div id="image-preview-container" class="hidden mt-3 relative inline-block w-full">
                        <img id="image-preview" src="" class="rounded-lg max-h-20 w-full object-cover border border-slate-200">
                        <button onclick="removeImage()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center outline-none">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>`;
            }

            const contentNews = document.getElementById('content-news');
            if(contentNews) {
                contentNews.innerHTML = newsHTML || `
                <div class="w-full h-32 shrink-0 p-6 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center mx-4 md:mx-0">
                    <p class="text-slate-400 italic text-sm text-center">${window.t('no_news')}</p>
                </div>`;
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
            const todayYear = now.getFullYear();
            const todayMonth = now.getMonth();
            const todayDate = now.getDate();

            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                const evDate = new Date(ev.date);
                const evGroup = ev.group || window.t('no_group');
                
                if (evDate.getFullYear() === todayYear && evDate.getMonth() === todayMonth && evDate.getDate() === todayDate) {
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

                    const groupBadge = evGroup !== window.t('no_group') ? `<span class="bg-transparent border border-current px-1.5 py-0.5 rounded text-[8px] font-bold uppercase leading-none opacity-80">${window.t('group_short')} ${evGroup}</span>` : '';
                    const activeClass = isPastEvent ? "bg-slate-50 text-slate-400 border-b border-slate-200" : "bg-white text-slate-800 border-b border-slate-100";
                    const timeColor = isPastEvent ? "text-slate-400" : "text-rose-500";
                    const leaderColor = isPastEvent ? "text-slate-400" : "text-rose-600";

                    html += `
                        <div class="flex items-center p-3 w-full cursor-default ${activeClass}">
                            <div class="flex items-center gap-3 w-full">
                                <div class="flex flex-col items-center justify-center w-12 shrink-0">
                                    <span class="text-[8px] uppercase font-bold leading-none mb-1 opacity-70">${window.t('today_badge')}</span>
                                    <span class="text-xl font-black leading-none">${evDate.getDate()}</span>
                                </div>
                                <div class="flex flex-col flex-grow truncate min-w-0">
                                    <div class="flex items-center gap-2 truncate">
                                        ${displayTime ? `<span class="text-xs font-bold shrink-0 ${timeColor}">${displayTime}</span>` : ''}
                                        <span class="font-black text-sm truncate">${ev.title}</span>
                                    </div>
                                    <div class="flex items-center gap-2 mt-1 truncate">
                                        ${groupBadge}
                                        ${ev.leader ? `<span class="text-[9px] uppercase font-medium opacity-80 truncate">${window.t('leader_short')} <b class="${leaderColor}">${ev.leader}</b></span>` : ''}
                                    </div>
                                </div>
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

window.requestTerritory = async (btn) => {
    btn.innerText = "..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "territory", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.innerHTML = `<svg class="w-4 h-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>${window.t('success')}`;
        setTimeout(() => { btn.innerText = window.t('request_btn'); btn.disabled = false; }, 3000);
    } catch (e) { alert(window.t('error_network')); btn.innerText = window.t('request_btn'); btn.disabled = false; }
};

window.openProfileModal = () => {
    const m = document.getElementById('profile-modal');
    if(m) m.classList.replace('hidden', 'flex');
}

window.openReportHistory = () => {
    const m = document.getElementById('report-history-modal');
    if(m) m.classList.replace('hidden', 'flex');

    const list = document.getElementById('report-history-list');
    list.innerHTML = `<p class="text-slate-400 text-sm italic py-4">${window.t('loading')}</p>`;

    const q = query(collection(db, "reports"), where("userId", "==", userId));
    getDocs(q).then(snapshot => {
        if(snapshot.empty) {
            list.innerHTML = `<p class="text-slate-400 text-sm italic py-4">${window.t('archive_empty')}</p>`;
            return;
        }
        
        let reports = [];
        snapshot.forEach(doc => reports.push(doc.data()));
        
        reports.sort((a,b) => {
            const dA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const dB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return dB - dA;
        });

        let html = '';
        reports.forEach(r => {
            const checkIcon = r.participated || r.hours > 0 ? `<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>` : `-`;
            
            const displayMonth = r.month ? formatMonthKey(r.month) : window.t('unknown');
            
            html += `
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-left">
                    <div class="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                        <span class="font-black text-purple-700 text-sm">${displayMonth}</span>
                        <span class="text-[10px] text-slate-400 font-bold">${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString(localeFormat) : ''}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs font-bold text-slate-600">
                        <span class="flex items-center gap-1">${window.t('participated')}: ${checkIcon}</span>
                        <span>${window.t('hours_label').replace('<br>&nbsp;','')} <span class="text-slate-800 font-black text-sm">${r.hours || '-'}</span></span>
                    </div>
                    <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        <span>${window.t('studies_label').replace('<br>',' ')}: ${r.studies || '-'}</span>
                        <span>${window.t('credit_label').replace('<br>&nbsp;','')} ${r.credit || r.pubs || '-'}</span>
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    }).catch(e => {
        list.innerHTML = `<p class="text-red-400 text-sm italic">${window.t('error_loading')}</p>`;
    });
};

window.closeModals = () => {
    const m1 = document.getElementById('profile-modal');
    if(m1) m1.classList.replace('flex', 'hidden');
    
    const m2 = document.getElementById('report-history-modal');
    if(m2) m2.classList.replace('flex', 'hidden');
};

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
    const input = document.getElementById('news-input');
    const text = input ? input.value.trim() : '';
    if (!text && !selectedImageFile) return alert(window.t('alert_add_text_photo'));

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
            text: text,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString()
        });
        
        if(input) input.value = '';
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
