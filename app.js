import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    window.showToast("Устанавливаем обновление...", "info");
                    setTimeout(() => window.location.reload(true), 1500);
                }
            });
        });
    });
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!refreshing) { refreshing = true; window.location.reload(true); } });
}

setTimeout(() => { const loader = document.getElementById('global-loader'); if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 500); } }, 2000);

const dict = {
    ru: { "loading_data": "Загрузка...", "pending_title": "Заявка на рассмотрении", "pending_desc": "Ожидайте подтверждения.", "logout_btn": "Выйти", "loading_events": "Загрузка встреч...", "all_year": "Весь<br>год", "loading_feed": "Загрузка ленты...", "my_report": "Мой отчет", "participated": "Служил(а)", "hours_label": "Часы", "studies_label": "Изучения", "credit_label": "Кредит", "fill_btn": "Заполнить", "this_week": "На этой неделе", "loading_duties": "Загрузка...", "active_tasks": "Активные задания", "no_active_tasks": "Нет активных заданий", "archive_title": "Архив", "history_empty": "История пуста", "my_territories": "Мои участки", "request_btn": "Попросить", "no_territories": "У вас пока нет участков", "profile_group": "Группа", "profile_overseer": "Ответственный", "language": "Язык / Jazyk", "profile_logout": "Выйти из аккаунта", "my_archive": "Мой архив", "loading_archive": "Загрузка...", "alert_no_notifications": "Уведомления не поддерживаются.", "alert_notifications_blocked": "Уведомления заблокированы!", "toast_notifications_enabled": "Уведомления включены!", "submit_report": "Отправить отчет", "alert_report_empty": "Заполните поля!", "saving": "Сохранение...", "saved": "Сохранено:", "success": "Успешно", "change": "Изменить", "error_network": "Ошибка сети!", "access_denied": "ДОСТУП ЗАКРЫТ", "no_group": "Без группы", "no_duties": "На этой неделе дежурств нет", "duty_reminder": "Ваша группа дежурит в эти выходные!", "cleaning_weekend": "Уборка в эти выходные!", "no_active_territories": "Нет активных участков", "territory_num": "Участок №", "active": "Активен", "assistant_for": "Помощник у", "speech": "Выступление", "assistant_short": "Пом:", "lesson": "Урок", "no_tasks_upcoming": "Нет активных заданий", "new_task_toast": "Новое задание", "delete": "Удалить", "new_badge": "Новое", "new_announcement_toast": "Новое объявление!", "create_announcement": "Создать объявление", "write_text_ru": "Текст (на русском)...", "write_text_cs": "Текст (на чешском)...", "publish": "Опубликовать", "no_news": "Объявлений нет", "today_badge": "СЕГОДНЯ", "group_short": "Гр.", "leader_short": "Вед:", "today_event_toast": "📅 Сегодня:", "no_events_today": "Событий нет", "loading": "Загрузка...", "archive_empty": "Архив пуст", "unknown": "Неизвестно", "error_loading": "Ошибка", "alert_add_text_photo": "Добавьте текст или фото!", "alert_publish_error": "Ошибка публикации!", "confirm_delete_news": "Удалить объявление?", "confirm_delete_task": "Удалить задание?", "admin_title": "Панель Администратора", "back_home": "На главную", "users_title": "Пользователи", "autosave_data": "Автосохранение данных", "cong_name_label": "Название собрания", "cong_name_placeholder": "Центральное", "requests_title": "Заявки", "active_users": "Активные", "search_placeholder": "Поиск...", "th_name_gender": "Имя и Пол", "th_pin": "ПИН", "th_group": "Группа", "th_school": "Школа", "th_status": "Статус в собрании", "th_responsible": "Ответственный за", "th_manage": "Управление", "error_save": "Ошибка сохранения!", "alert_pin_length": "ПИН: 6 цифр!", "error_save_pin": "Ошибка ПИН-кода!", "error_update_role": "Ошибка обновления роли!", "confirm_block": "Заблокировать?", "confirm_delete_profile": "Удалить профиль?", "error_general": "Ошибка!", "confirm_reject": "Отклонить заявку?", "error_delete": "Ошибка удаления", "status_pending": "Ожидает", "btn_approve": "Одобрить", "btn_reject": "Отклонить", "btn_unblock": "Разблокировать", "btn_block": "Заблокировать", "btn_delete": "Удалить", "gender_boy": "Брат", "gender_girl": "Сестра", "role_publisher": "Возвещатель", "role_pioneer": "Пионер", "role_ms": "Помощник собр.", "role_elder": "Старейшина", "role_admin": "Админ", "role_group": "Группа", "role_terr": "Участки", "role_school": "Школа", "no_new_requests": "Нет новых заявок", "no_active_users": "Нет пользователей", "cat_reading_db": "Чтение Библии", "cat_conversation": "Разговор", "cat_interest": "Интерес", "cat_disciples": "Подготавливайте", "cat_beliefs": "Взгляды", "cat_talk_db": "Речь", "open_map": "Открыть карту", "no_map": "Нет карты", "opt_cleaning": "Уборка зала", "opt_special_event": "Специальное событие", "all_groups": "Все", "congregation_label": "Собрание", "scan_qr": "Отсканируйте код", "days_short": "дн.", "return_terr_btn": "Сдать", "no_translation": "Нет перевода", "stand_title": "Служение со стендом", "stand_apply": "Подать заявку", "stand_signup": "Записаться", "stand_pending": "Заявка отправлена", "stand_month_shifts": "Смен в этом месяце", "stand_upcoming": "Ближайшие записи", "stand_no_records": "Нет записей", "zoom_error": "Zoom не настроен", "zoom_click_hint": "Нажми<br>на ZOOM", "zoom_launch": "ЗАПУСТИТЬ", "months": ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"], "days": ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"], "info_title": "Информация", "in_development": "В разработке", "meeting_program": "Программа", "no_schedule": "Нет программ", "chairman": "Председатель", "treasures_title": "Сокровища из слова бога", "talk_10_min": "Речь 10 мин.", "spiritual_gems": "Духовные жемчужины", "bible_reading": "Чтение Библии", "ministry_skills": "Оттачиваем навыки", "christian_living": "Христианская жизнь", "congregation_bible_study": "Изучение Библии", "reader": "Чтец", "closing_prayer": "Заключительная молитва", "part": "Задание", "start_conversation": "Начинайте разговор", "develop_interest": "Развивайте интерес", "make_disciples": "Подготавливайте учеников", "explain_beliefs": "Объясняйте взгляды", "local_needs": "Местные потребности", "current_week": "АКТУАЛЬНАЯ", "future_week": "БУДУЩАЯ", "public_talk": "Публичная речь", "weekend_meeting": "Выходные (Публичная речь)", "watchtower_study": "Изучение Сторожевой Башни", "opening_song": "Вступительные слова / Песня", "duties_schedule": "График дежурств", "new_message": "Новое сообщение", "msg_understood": "Понятно" },
    cs: { "loading_data": "Načítání...", "pending_title": "Žádost se vyřizuje", "pending_desc": "Čekejte na potvrzení.", "logout_btn": "Odejít", "loading_events": "Načítání schůzek...", "all_year": "Celý<br>rok", "loading_feed": "Načítání...", "my_report": "Moje zpráva", "participated": "Ve službě", "hours_label": "Hodiny", "studies_label": "Studia", "credit_label": "Kredit", "fill_btn": "Vyplnit", "this_week": "Tento týden", "loading_duties": "Načítání...", "active_tasks": "Aktivní úkoly", "no_active_tasks": "Žádné aktivní úkoly", "archive_title": "Archiv", "history_empty": "Historie je prázdná", "my_territories": "Moje obvody", "request_btn": "Požádat", "no_territories": "Žádné obvody", "profile_group": "Skupina", "profile_overseer": "Dozorce", "language": "Jazyk / Язык", "profile_logout": "Odhlásit se", "my_archive": "Můj archiv", "loading_archive": "Načítání...", "alert_no_notifications": "Oznámení nejsou podporována.", "alert_notifications_blocked": "Oznámení blokována!", "toast_notifications_enabled": "Oznámení zapnuta!", "submit_report": "Odeslat zprávu", "alert_report_empty": "Zadejte údaje!", "saving": "Ukládání...", "saved": "Uloženo:", "success": "Úspěšně", "change": "Změnit", "error_network": "Chyba sítě!", "access_denied": "PŘÍSTUP ODEPŘEN", "no_group": "Bez skupiny", "no_duties": "Žádné služby", "duty_reminder": "Vaše skupina má službu!", "cleaning_weekend": "Úklid tento víkend!", "no_active_territories": "Žádné aktivní obvody", "territory_num": "Obvod č.", "active": "Aktivní", "assistant_for": "Pomocník u", "speech": "Proslov", "assistant_short": "Pom:", "lesson": "Lekce", "no_tasks_upcoming": "Žádné aktivní úkoly", "new_task_toast": "Nový úkol", "delete": "Smazat", "new_badge": "Nové", "new_announcement_toast": "Nové oznámení!", "create_announcement": "Vytvořit oznámení", "write_text_ru": "Text (Ruština)...", "write_text_cs": "Text (Čeština)...", "publish": "Publikovat", "no_news": "Žádná oznámení", "today_badge": "DNES", "group_short": "Sk.", "leader_short": "Ved:", "today_event_toast": "📅 Dnes:", "no_events_today": "Žádné události", "loading": "Načítání...", "archive_empty": "Archiv prázdný", "unknown": "Neznámé", "error_loading": "Chyba", "alert_add_text_photo": "Přidejte text nebo fotku!", "alert_publish_error": "Chyba publikování!", "confirm_delete_news": "Smazat oznámení?", "confirm_delete_task": "Smazat úkol?", "admin_title": "Panel administrátora", "back_home": "Zpět", "users_title": "Uživatelé", "autosave_data": "Auto ukládání", "cong_name_label": "Název sboru", "cong_name_placeholder": "Centrální", "requests_title": "Žádosti", "active_users": "Aktivní", "search_placeholder": "Hledat...", "th_name_gender": "Jméno a Pohlaví", "th_pin": "PIN", "th_group": "Skupina", "th_school": "Škola", "th_status": "Status", "th_responsible": "Zodpovědný za", "th_manage": "Správa", "error_save": "Chyba ukládání!", "alert_pin_length": "PIN: 6 číslic!", "error_save_pin": "Chyba PINu!", "error_update_role": "Chyba role!", "confirm_block": "Zablokovat?", "confirm_delete_profile": "Smazat profil?", "error_general": "Chyba!", "confirm_reject": "Zamítnout žádost?", "error_delete": "Chyba mazání", "status_pending": "Čeká", "btn_approve": "Schválit", "btn_reject": "Zamítnout", "btn_unblock": "Odblokovat", "btn_block": "Zablokovat", "btn_delete": "Smazat", "gender_boy": "Bratr", "gender_girl": "Sestra", "role_publisher": "Zvěstovatel", "role_pioneer": "Průkopník", "role_ms": "Služební pom.", "role_elder": "Starší", "role_admin": "Admin", "role_group": "Skupina", "role_terr": "Obvody", "role_school": "Škola", "no_new_requests": "Žádné žádosti", "no_active_users": "Žádní uživatelé", "cat_reading_db": "Čtení Bible", "cat_conversation": "Rozhovor", "cat_interest": "Zájem", "cat_disciples": "Čiňte učedníky", "cat_beliefs": "Přesvědčení", "cat_talk_db": "Proslov", "open_map": "Otevřít mapu", "no_map": "Bez mapy", "opt_cleaning": "Úklid sálu", "opt_special_event": "Zvláštní událost", "all_groups": "Společné", "congregation_label": "Sbor", "scan_qr": "Naskenujte kód", "days_short": "dní", "return_terr_btn": "Odevzdat", "no_translation": "Bez překladu", "stand_title": "Služba se stojanem", "stand_apply": "Požádat", "stand_signup": "Zapsat se", "stand_pending": "Žádost odeslána", "stand_month_shifts": "Služeb v měsíci", "stand_upcoming": "Tvé služby", "stand_no_records": "Žádné zápisy", "zoom_error": "Zoom není", "zoom_click_hint": "Klikni<br>na ZOOM", "zoom_launch": "SPUSTIT", "months": ["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"], "days": ["Ne","Po","Út","St","Čt","Pá","So"], "info_title": "Informace", "in_development": "Ve vývoji", "meeting_program": "Program", "no_schedule": "Žádné programy", "chairman": "Předsedající", "treasures_title": "Poklady z Božího slova", "talk_10_min": "Proslov 10 min.", "spiritual_gems": "Hledání drahokamů", "bible_reading": "Čtení Bible", "ministry_skills": "Zlepšujme se", "christian_living": "Křesťanský život", "congregation_bible_study": "Sborové studium", "reader": "Čte", "closing_prayer": "Závěrečná modlitba", "part": "Úkol", "start_conversation": "Zahájení rozhovoru", "develop_interest": "Rozvíjení zájmu", "make_disciples": "Činění učedníků", "explain_beliefs": "Vysvětlování víry", "local_needs": "Místní potřeby", "current_week": "AKTUÁLNÍ", "future_week": "BUDOUCÍ", "public_talk": "Veřejná přednáška", "weekend_meeting": "Víkend (Přednáška)", "watchtower_study": "Studium Strážné věže", "opening_song": "Úvodní píseň", "duties_schedule": "Rozpis služeb", "new_message": "Nová zpráva", "msg_understood": "Rozumím" }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';
window.t = (key) => (dict[currentLang] && dict[currentLang][key]) ? dict[currentLang][key] : key;

function translateDbString(str) {
    if (!str) return '';
    const map = { "Начинайте разговор": "start_conversation", "Zahájení rozhovoru": "start_conversation", "Развивайте интерес": "develop_interest", "Rozvíjení zájmu": "develop_interest", "Подготавливайте учеников": "make_disciples", "Činění učedníků": "make_disciples", "Объясняйте свои взгляды": "explain_beliefs", "Vysvětlování své víry": "explain_beliefs", "Местные потребности": "local_needs", "Místní потребности": "local_needs", "Речь 10 мин.": "talk_10_min", "Proslov 10 min.": "talk_10_min" };
    return map[str] ? window.t(map[str]) : str;
}

window.changeLanguage = (lang) => { localStorage.setItem('app_lang', lang); location.reload(); };

const applyTranslations = () => {
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = currentLang;
    document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = window.t(el.getAttribute('data-lang')));
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder'))));
    document.querySelectorAll('[data-lang-title]').forEach(el => el.setAttribute('title', window.t(el.getAttribute('data-lang-title'))));
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyTranslations); else applyTranslations();

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

let messaging = null; try { messaging = getMessaging(app); } catch (e) {}
try { enableIndexedDbPersistence(db).catch(() => {}); } catch (e) {}

const userId = localStorage.getItem('userId');
if (!userId) window.location.href = 'login.html';

const TOP_ROLES = ["Владелец", "Админ"]; 
let hasFullAccess = false;
let currentUserData = null;
let currentZoomData = { id: "", pass: "" }; 

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
window.openQrModal = () => document.getElementById('qr-modal').classList.replace('hidden', 'flex');
window.openDutiesModal = () => document.getElementById('duties-modal').classList.replace('hidden', 'flex');
window.openInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('hidden', 'flex');
window.closeInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('flex', 'hidden');

window.closeModals = () => {
    ['profile-modal', 'report-history-modal', 'duties-modal', 'user-msg-modal', 'take-terr-modal', 'info-details-modal', 'task-info-modal'].forEach(id => {
        const m = document.getElementById(id); if(m) m.classList.replace('flex', 'hidden');
    });
};
window.closeQrModal = () => document.getElementById('qr-modal').classList.replace('flex', 'hidden');

window.logout = async () => {
    if (confirm("Выйти из аккаунта? / Odhlásit se?")) {
        if (userId) { try { await updateDoc(doc(db, "users", userId), { pushToken: "" }); } catch (e) {} }
        localStorage.clear(); window.location.href = 'login.html'; 
    }
};

window.scrollNews = (offset) => document.getElementById('content-news')?.scrollBy({ left: offset, behavior: 'smooth' });
window.scrollProgram = (dir) => { 
    const container = document.getElementById('meeting-program-list');
    if(container) container.scrollBy({ left: container.clientWidth * dir, behavior: 'smooth' }); 
};

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'warning' ? 'bg-amber-500' : (type === 'success' ? 'bg-emerald-500' : 'bg-slate-800');
    toast.className = `${bgColor} text-white px-5 py-4 rounded-xl shadow-lg text-base font-black text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 5000);
};

window.zoomStateReady = false;
window.handleZoomClick = (event) => {
    event.preventDefault();
    const zoomBtn = document.getElementById('zoom-btn-element');
    const hiddenInfo = document.getElementById('zoom-info-hidden');
    const revealedInfo = document.getElementById('zoom-info-revealed');
    
    if (!window.zoomStateReady) {
        if(zoomBtn) { zoomBtn.classList.remove('bg-[#10b981]'); zoomBtn.classList.add('bg-[#34d399]'); }
        if(hiddenInfo) { hiddenInfo.classList.add('hidden'); hiddenInfo.classList.remove('flex'); }
        if(revealedInfo) { revealedInfo.classList.remove('hidden'); revealedInfo.classList.add('flex'); }
        window.zoomStateReady = true; setTimeout(() => {
            window.zoomStateReady = false;
            if(zoomBtn) { zoomBtn.classList.add('bg-[#10b981]'); zoomBtn.classList.remove('bg-[#34d399]'); }
            if(hiddenInfo) { hiddenInfo.classList.remove('hidden'); hiddenInfo.classList.add('flex'); }
            if(revealedInfo) { revealedInfo.classList.add('hidden'); revealedInfo.classList.remove('flex'); }
        }, 10000);
    } else {
        if (!currentZoomData || !currentZoomData.id || currentZoomData.id === '-') { alert(window.t('zoom_error')); return; }
        window.location.href = `https://zoom.us/j/${currentZoomData.id.replace(/\s/g, '')}${currentZoomData.pass ? '?pwd=' + currentZoomData.pass : ''}`;
    }
};

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const dbMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const currentMonthStr = d.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
const monthLabel = document.getElementById('current-month-label');
if (monthLabel) monthLabel.innerText = currentMonthStr;

window.scrollToCurrentWeek = () => {
    const container = document.getElementById('meeting-program-list');
    if (!container || container.offsetParent === null) return; 
    let activeCard = container.querySelector('.current-week-marker') || Array.from(container.children).find(card => !card.classList.contains('grayscale'));
    if (!activeCard && container.children.length > 0) activeCard = container.children.length > 1 ? container.children[container.children.length - 2] : container.lastElementChild;
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
};

window.switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabId}`)?.classList.add('active');
    document.querySelectorAll('.nav-icon-container').forEach(icon => { icon.classList.remove('bg-slate-700', 'text-white', 'shadow-inner'); icon.classList.add('text-slate-500'); });
    if(!btnElement) btnElement = document.querySelector(`nav button[onclick="switchTab('${tabId}', this)"]`);
    if(btnElement) { const icon = btnElement.querySelector('.nav-icon-container'); if(icon) { icon.classList.remove('text-slate-500'); icon.classList.add('bg-slate-700', 'text-white', 'shadow-inner'); } }
    if (tabId === 'tasks') setTimeout(() => { if (window.scrollToCurrentWeek) window.scrollToCurrentWeek(); }, 50);
};

window.submitReport = async () => {
    const fs = document.getElementById('report-fieldset'); const btn = document.getElementById('submit-report-btn');
    if (!fs || !btn) return;
    if (fs.disabled) {
        fs.disabled = false; fs.classList.remove('opacity-50', 'grayscale-[50%]'); btn.classList.replace('bg-slate-800', 'bg-ui-report'); btn.innerText = window.t('submit_report');
    } else {
        const participated = document.getElementById('rep-participated')?.checked || false;
        const hours = document.getElementById('rep-hours')?.value || "";
        const studies = document.getElementById('rep-studies')?.value || "";
        const credit = document.getElementById('rep-credit')?.value || "";
        if (!participated && hours === "") return alert(window.t('alert_report_empty'));
        btn.innerText = window.t('saving'); btn.disabled = true;
        try {
            await setDoc(doc(db, "reports", `${userId}_${strictMonthId}`), { userId, userName: currentUserData.name, group: currentUserData.group || window.t('no_group'), month: dbMonthKey, participated, hours: Number(hours), studies: Number(studies), credit: Number(credit), submittedAt: new Date().toISOString() });
            const log = document.getElementById('last-report-log'); if(log) log.innerText = `${window.t('saved')} ${new Date().toLocaleString(localeFormat)}`;
            btn.classList.replace('bg-ui-report', 'bg-ui-success'); btn.innerText = window.t('success');
            setTimeout(() => { fs.disabled = true; fs.classList.add('opacity-50', 'grayscale-[50%]'); btn.classList.replace('bg-ui-success', 'bg-slate-800'); btn.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>${window.t('change')}`; btn.disabled = false; }, 2000);
        } catch (e) { alert(window.t('error_network')); btn.disabled = false; btn.innerText = window.t('submit_report'); }
    }
};

window.openReportHistory = async () => {
    const modal = document.getElementById('report-history-modal'); if (modal) modal.classList.replace('hidden', 'flex');
    const container = document.getElementById('report-history-list') || document.getElementById('archive-list'); if (!container) return;
    container.innerHTML = `<p class="text-center py-6 text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">${window.t('loading_archive')}</p>`;
    try {
        const snapshot = await getDocs(query(collection(db, "reports"), where("userId", "==", userId)));
        let reports = []; snapshot.forEach(docSnap => reports.push({ id: docSnap.id, ...docSnap.data() }));
        reports.sort((a, b) => b.month.localeCompare(a.month));
        if (reports.length === 0) { container.innerHTML = `<p class="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">${window.t('archive_empty')}</p>`; return; }
        
        let html = '';
        reports.forEach(r => {
            const [year, monthNum] = r.month.split('-'); const monthName = window.t('months')[parseInt(monthNum, 10) - 1];
            html += `
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm relative">
                    <h4 class="font-black text-slate-800 text-sm uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">${monthName} ${year}</h4>
                    <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        <div class="flex justify-between border-b border-slate-100 pb-1">Служил(а): <span class="font-black text-slate-800">${r.participated ? 'Да' : 'Нет'}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1">Часы: <span class="font-black text-slate-800">${r.hours || 0}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1">Изучения: <span class="font-black text-slate-800">${r.studies || 0}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1">Кредит: <span class="font-black text-slate-800">${r.credit || r.pubs || 0}</span></div>
                    </div>
                    <button id="btn-edit-${r.id}" onclick="toggleEditHours('${r.id}', true)" class="text-[10px] bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 font-black uppercase tracking-widest px-3 py-2 rounded-lg w-full transition-colors mt-2 shadow-sm outline-none">Изменить часы</button>
                    <div id="form-edit-${r.id}" class="hidden mt-2 flex gap-2">
                        <input type="number" id="input-hours-${r.id}" value="${r.hours || 0}" min="0" class="w-16 bg-white border border-slate-300 rounded-lg text-center font-black text-slate-800 text-sm outline-none focus:border-indigo-500 shadow-inner">
                        <button onclick="saveNewHours('${r.id}')" class="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors shadow-sm outline-none">Сохранить</button>
                        <button onclick="toggleEditHours('${r.id}', false)" class="w-10 bg-slate-200 hover:bg-slate-300 text-slate-500 font-black rounded-lg transition-colors shadow-sm outline-none flex items-center justify-center">✕</button>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
    } catch (error) { container.innerHTML = `<p class="text-center py-6 text-red-500 text-xs font-bold uppercase tracking-widest">Ошибка загрузки</p>`; }
};

window.toggleEditHours = (id, show) => {
    if (show) { document.getElementById(`btn-edit-${id}`).classList.add('hidden'); document.getElementById(`form-edit-${id}`).classList.remove('hidden'); document.getElementById(`form-edit-${id}`).classList.add('flex'); } 
    else { document.getElementById(`btn-edit-${id}`).classList.remove('hidden'); document.getElementById(`form-edit-${id}`).classList.add('hidden'); document.getElementById(`form-edit-${id}`).classList.remove('flex'); }
};

window.saveNewHours = async (reportId) => {
    const inputEl = document.getElementById(`input-hours-${reportId}`); if (!inputEl) return;
    const hoursNum = Number(inputEl.value); if (isNaN(hoursNum) || hoursNum < 0) return alert("Введите корректное число.");
    const btn = inputEl.nextElementSibling; const originalText = btn.innerText; btn.innerText = '...'; btn.disabled = true;
    try {
        await updateDoc(doc(db, "reports", reportId), { hours: hoursNum, participated: hoursNum > 0, updatedAt: new Date().toISOString() });
        window.showToast("Часы обновлены! ✅", "success"); window.openReportHistory(); 
    } catch(e) { alert("Ошибка сети."); btn.innerText = originalText; btn.disabled = false; }
};

window.sendCorrection = async (reportId) => {
    const text = prompt("Опишите корректировку:"); if (!text || !text.trim()) return;
    try { await updateDoc(doc(db, "reports", reportId), { correction: text.trim(), correctionDate: new Date().toISOString() }); window.showToast("Отправлено! ✅", "success"); window.openReportHistory(); } 
    catch(e) { alert("Ошибка сети."); }
};

let unsubMessages = null; window.activeMessageId = null;
function listenForMessages() {
    if (unsubMessages) unsubMessages();
    unsubMessages = onSnapshot(query(collection(db, "user_messages"), where("userId", "==", userId), where("read", "==", false)), (msgSnap) => {
        if (!msgSnap.empty) {
            window.activeMessageId = msgSnap.docs[0].id;
            const modal = document.getElementById('user-msg-modal'); const content = document.getElementById('user-msg-content');
            if(modal && content) { content.innerText = msgSnap.docs[0].data().message; modal.classList.replace('hidden', 'flex'); }
        }
    });
}
window.markMessageRead = async () => {
    if(window.activeMessageId) {
        const btn = document.getElementById('user-msg-close-btn'); const originalText = btn.innerText; btn.innerText = "..."; btn.disabled = true;
        try { await updateDoc(doc(db, "user_messages", window.activeMessageId), { read: true }); document.getElementById('user-msg-modal').classList.replace('flex', 'hidden'); window.activeMessageId = null; } catch(e) {}
        btn.innerText = originalText; btn.disabled = false;
    }
};

window.setupNotifications = async () => {
    const pushBtn = document.getElementById('push-btn');
    if (!messaging) return alert("❌ Ваше устройство не поддерживает Push-уведомления.");
    try {
        if (!('Notification' in window)) return alert("❌ " + window.t('alert_no_notifications'));
        if (pushBtn) pushBtn.innerHTML = '⏳'; 
        let permission = Notification.permission;
        if (permission === 'denied') throw new Error("Уведомления заблокированы в настройках.");
        if (permission !== 'granted') { const req = Notification.requestPermission(); permission = (req instanceof Promise) ? await req : await new Promise(res => Notification.requestPermission(res)); }
        if (permission !== 'granted') throw new Error("Нет разрешения");
        let registration = await navigator.serviceWorker.getRegistration() || await navigator.serviceWorker.register('./sw.js');
        const token = await getToken(messaging, { vapidKey: 'BEdzEcHp_7Ero4qy1TulERNB7KDAymZBty7omUcHU2SNlMGTAwPM_MAO7qriZsmL-8ehVsU5pX2OtemKQhC-Tqk', serviceWorkerRegistration: registration });
        if (token) { await updateDoc(doc(db, "users", userId), { pushToken: token }); window.showToast("✅ " + window.t('toast_notifications_enabled'), "success"); if (pushBtn) pushBtn.style.display = 'none'; } else throw new Error("Сбой FCM.");
    } catch (error) { 
        if (error.message.includes('active service worker')) { alert("⏳ Перезагрузка для связи..."); window.location.reload(); } 
        else { alert("❌ ОШИБКА: " + error.message); if (pushBtn) pushBtn.innerHTML = `🔔`; }
    }
};

if (messaging) {
    try { onMessage(messaging, (payload) => { 
        const title = payload.notification?.title || payload.data?.title || "Уведомление"; const body = payload.notification?.body || payload.data?.body || "";
        window.showToast(`🔔 ${title}\n${body}`, 'info'); 
        if (Notification.permission === 'granted') new Notification(title, { body: body, icon: 'icon-512.png' });
    }); } catch (e) {}
}

// === КОНЕЦ ПЕРВОЙ ЧАСТИ ===
// === НАЧАЛО ВТОРОЙ ЧАСТИ ===

window.getISOWeekString = function(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1)); const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

window.weekToDateString = function(weekId) {
    if(!weekId) return "";
    const [year, weekStr] = weekId.split('-W'); const w = parseInt(weekStr, 10); const y = parseInt(year, 10);
    const simpleDate = new Date(y, 0, 1 + (w - 1) * 7); const day = simpleDate.getDay();
    const diff = simpleDate.getDate() - day + (day === 0 ? -6 : 1); const monday = new Date(simpleDate.setDate(diff));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    const m1 = window.t('months') ? window.t('months')[monday.getMonth()] : monday.getMonth()+1;
    const m2 = window.t('months') ? window.t('months')[sunday.getMonth()] : sunday.getMonth()+1;
    return monday.getMonth() === sunday.getMonth() ? `${monday.getDate()} - ${sunday.getDate()} ${m1}` : `${monday.getDate()} ${m1} - ${sunday.getDate()} ${m2}`;
};

window.buildScheduleCards = function(d, myName, currentWeekStr) {
    const weekLabel = window.weekToDateString(d.realWeekId || d.weekId);
    const isCurrentWeek = (d.realWeekId || d.weekId.split('-')[0]+'-'+d.weekId.split('-')[1]) === currentWeekStr;
    const isPastWeek = (d.realWeekId || d.weekId.split('-')[0]+'-'+d.weekId.split('-')[1]) < currentWeekStr;
    const weekStatus = isCurrentWeek ? window.t('current_week') : (isPastWeek ? "ПРОШЛАЯ" : window.t('future_week'));
    const statusColor = isCurrentWeek ? 'text-emerald-600' : (isPastWeek ? 'text-slate-400' : 'text-slate-500');
    let partCounter = 1;

    const row = (title, person) => {
        if(!person && !title) return ''; const isMe = person === myName;
        return `<div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg"><span class="text-[13px] md:text-sm ${isMe ? 'font-black text-black' : 'font-bold text-slate-800'} leading-tight">${partCounter++}. ${translateDbString(title)}</span><span class="text-[13px] md:text-sm ${isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${person || '-'}</span></div>`;
    };
    const rowUnnumbered = (title, person) => {
        if(!person && !title) return ''; const isMe = person === myName;
        return `<div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg"><span class="text-[13px] md:text-sm ${isMe ? 'font-black text-black' : 'font-bold text-slate-800'} leading-tight">${translateDbString(title)}</span><span class="text-[13px] md:text-sm ${isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${person || '-'}</span></div>`;
    };
    const buildHeader = (title, bgColor, safeClass, iconSvg) => `<div class="w-full rounded-md shadow-sm mt-2 mb-1.5 ${safeClass} flex items-center gap-1.5 px-3 py-1.5 min-h-[28px]" style="background-color: ${bgColor};"><div class="flex items-center justify-center text-white/90 w-4 h-4 shrink-0">${iconSvg}</div><div class="text-white text-[10px] md:text-xs font-black uppercase tracking-widest leading-none ml-1.5 flex items-center h-full pt-[1px]">${title}</div></div>`;

    const iconTreasure = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
    const iconMinistry = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
    const iconLiving = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
    const iconWeekend = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

    const treasure1Me = d.mw_treasure_name === myName;
    const treasure1 = `<div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg"><span class="text-[13px] md:text-sm ${treasure1Me ? 'font-black text-black' : 'font-bold text-slate-800'} leading-tight">${partCounter++}. ${translateDbString(d.mw_treasure_title || window.t('talk_10_min'))}</span><span class="text-[13px] md:text-sm ${treasure1Me ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${d.mw_treasure_name || '-'}</span></div>`;
    const treasure2 = row(window.t('spiritual_gems'), d.mw_gems_name);
    const treasure3 = row(window.t('bible_reading'), d.mw_reading_name);

    const minRowsRaw = (d.ministryParts || []).map((m) => {
        if(!m.student && !m.assistant && !m.type) return '';
        const isMe = (m.student === myName || m.assistant === myName);
        const translatedType = translateDbString(m.type || window.t('part'));
        let description = "";
        if (m.type === "Чтение Библии" || m.type === "Čtení Bible") description = "Это учебное задание назначается учащемуся мужского пола. Учащийся зачитывает назначенный отрывок. Вступление и заключение не требуются.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Начинайте разговор" || m.type === "Zahájení rozhovoru") description = "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим или членом его семьи.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Развивайте интерес" || m.type === "Rozvíjení zájmu") description = "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Подготавливайте учеников" || m.type === "Pomáhej lidem stát se učedníky" || m.type === "Činění učedníků") description = "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Объясняйте свои взгляды" || m.type === "Vysvětlování své víry") description = "Если это задание преподносится в виде речи, оно поручается учащемуся мужского пола. Если в виде демонстрации — мужского или женского пола.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Речь" || m.type === "Proslov" || m.type === "Речь 10 мин." || m.type === "Proslov 10 min.") description = "Это учебное задание поручается учащемуся мужского пола и преподносится в виде речи, обращённой к собранию.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";

        const descHtml = description ? `<div class="mt-4 pt-3 border-t border-slate-100"><div class="text-[12px] md:text-sm font-medium text-slate-500 leading-relaxed">${description}</div></div>` : "";
        const extraInfo = m.lesson ? `<span class="font-black text-slate-800 block mb-3 text-base md:text-lg">${translatedType}</span><span class="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 self-start inline-block">Урок ${m.lesson}</span>${descHtml}` : `<span class="font-black text-slate-800 text-base md:text-lg">${translatedType}</span>${descHtml}`;
        return `<div data-info="${extraInfo.replace(/"/g, '&quot;')}" onclick="openTaskInfoModal(this.getAttribute('data-info'))" class="flex items-center justify-between py-2.5 px-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer group"><div class="flex flex-col min-w-0 pointer-events-none"><span class="text-[13px] md:text-sm ${isMe ? 'font-black text-black' : 'font-bold text-slate-800'} leading-tight">${partCounter++}. ${translatedType}</span><span class="text-[13px] md:text-sm ${isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${m.student || '-'}${m.assistant ? ` <span class="opacity-70 ml-1">(${window.t('assistant_short')} ${m.assistant})</span>` : ''}</span></div><div class="shrink-0 ml-3 text-slate-300 group-hover:text-indigo-400 pointer-events-none"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div></div>`;
    }).join('');

    const livRows = (d.livingParts || []).map((m) => { if(!m.title && !m.name) return ''; return row(m.title, m.name); }).join('');
    const isCbsMe = (d.mw_cbs_conductor === myName || d.mw_cbs_reader === myName);
    const cbsRow = `<div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg"><span class="text-[13px] md:text-sm ${isCbsMe ? 'font-black text-black' : 'font-bold text-slate-800'} leading-tight">${partCounter++}. ${window.t('congregation_bible_study')} ${d.mw_cbs_material ? `<span class="text-xs font-normal text-slate-500 ml-1">(${d.mw_cbs_material})</span>` : ''}</span><span class="text-[13px] md:text-sm ${isCbsMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${d.mw_cbs_conductor || '-'}${d.mw_cbs_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.mw_cbs_reader})</span>` : ''}</span></div>`;
    const we_talk = `<div class="flex flex-col py-1.5 px-3 bg-white/60 hover:bg-white border border-slate-200/50 shadow-sm rounded-xl mt-1.5 mb-1 mx-0"><span class="text-[13px] md:text-sm ${d.we_talk_speaker === myName ? 'font-black text-black' : 'font-bold text-slate-800'} uppercase leading-tight">${translateDbString(d.we_talk_title || window.t('public_talk'))}</span><span class="text-[13px] md:text-sm ${d.we_talk_speaker === myName ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${d.we_talk_speaker || '-'}</span></div>`;
    const wtStudyRow = `<div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg mt-1.5"><span class="text-[13px] md:text-sm ${(d.we_wt_conductor === myName || d.we_wt_reader === myName) ? 'font-black text-black' : 'font-bold text-slate-800'} leading-tight">${window.t('watchtower_study')}</span><span class="text-[13px] md:text-sm ${(d.we_wt_conductor === myName || d.we_wt_reader === myName) ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'} mt-0.5 ml-4">${d.we_wt_conductor || '-'}${d.we_wt_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.we_wt_reader})</span>` : ''}</span></div>`;

    const attendantsArr = [d.duty_attendant_1, d.duty_attendant_2].filter(Boolean);
    const soundsArr = [d.duty_sound_1, d.duty_sound_2].filter(Boolean);
    let dutiesBlock = '';
    if (attendantsArr.length > 0 || soundsArr.length > 0) {
        dutiesBlock = `<div class="mt-3 grid grid-cols-2 gap-2 text-center bg-slate-200/60 rounded-xl p-2.5 mx-0 mb-2">${attendantsArr.length > 0 ? `<div class="flex flex-col items-center justify-center"><span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Распорядители</span><span class="text-[10px] md:text-xs font-bold text-slate-800 leading-tight mt-0.5">${attendantsArr.join('<br>')}</span></div>` : '<div></div>'}${soundsArr.length > 0 ? `<div class="flex flex-col items-center justify-center border-l border-slate-300"><span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Звук / Видео</span><span class="text-[10px] md:text-xs font-bold text-slate-800 leading-tight mt-0.5">${soundsArr.join('<br>')}</span></div>` : '<div></div>'}</div>`;
    }

    return `
        <div class="w-[calc(100vw-32px)] md:w-full shrink-0 snap-center snap-always scroll-mt-40 flex flex-col bg-transparent pb-2 px-0 ${isPastWeek ? 'opacity-50 grayscale' : ''} ${isCurrentWeek ? 'current-week-marker' : ''}">
            <div class="flex flex-col gap-1 pb-2 mb-3 mx-1 border-b border-slate-300"><div class="flex items-center justify-between w-full"><span class="text-base md:text-lg font-black text-black uppercase tracking-widest">${weekLabel}</span><span class="text-xs md:text-sm font-black ${statusColor} uppercase tracking-widest">${weekStatus}</span></div></div>
            <div class="inner-week-columns flex flex-col md:flex-row gap-0 md:gap-4 w-full px-1">
                <div class="flex-1 flex flex-col space-y-0 pb-4 md:pb-0">
                    ${rowUnnumbered(window.t('chairman'), d.mw_chairman_name)}
                    ${buildHeader(window.t('treasures_title'), '#0d9488', 'h-treasure', iconTreasure)}
                    ${treasure1}${treasure2}${treasure3}
                    ${buildHeader(window.t('ministry_skills'), '#d97706', 'h-ministry', iconMinistry)}
                    ${minRowsRaw ? `<div class="flex flex-col bg-white rounded-xl mt-1.5 mb-2 mx-0 overflow-hidden shadow-sm border border-slate-200/80">${minRowsRaw}</div>` : ''}
                    ${buildHeader(window.t('christian_living'), '#b91c1c', 'h-living', iconLiving)}
                    ${livRows}${cbsRow}
                    ${rowUnnumbered(window.t('closing_prayer'), d.mw_prayer_name)}
                </div>
                <div class="md:hidden w-full border-t-2 border-slate-200 border-dashed my-2"></div>
                <div class="flex-1 flex flex-col space-y-0 pt-2 md:pt-0">
                    ${buildHeader(window.t('weekend_meeting'), '#475569', 'h-weekend', iconWeekend)}
                    ${rowUnnumbered(window.t('opening_song'), d.we_opening_name)}
                    ${we_talk}${wtStudyRow}
                    ${rowUnnumbered(window.t('closing_prayer'), d.we_prayer_name)}
                </div>
            </div>
            ${dutiesBlock}
        </div>
    `;
};

window.downloadScheduleAsPNG = async () => {
    if (typeof window.html2canvas !== 'function') return alert("Загрузка...");
    const originalContainer = document.getElementById('meeting-program-list');
    if (!originalContainer || originalContainer.innerText.includes('Нет опубликованных')) return alert("Нет расписания!");
    
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm';
    overlay.innerHTML = `<div class="bg-white px-10 py-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center"><p class="text-indigo-600 text-sm font-black uppercase tracking-widest animate-pulse">Создание PNG...</p></div>`;
    document.body.appendChild(overlay);

    await new Promise(r => setTimeout(r, 100));

    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0;width:850px;background-color:#f1f5f9;padding:30px;display:grid;grid-template-columns:1fr 1fr;gap:20px;font-family:sans-serif;align-items:start;'; 

    try {
        tempDiv.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; margin-bottom: 10px;"><h2 style="font-weight: 900; font-size: 26px; color: #0f172a; margin: 0; line-height: 1.2; text-transform: uppercase;">Программа встреч</h2><span style="font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Сгенерировано в GRO-UP</span></div>`;

        let cardsAdded = 0;
        Array.from(originalContainer.children).forEach(card => {
            if (card.tagName === 'P' || card.classList.contains('opacity-50')) return;
            const clone = card.cloneNode(true);
            clone.className = clone.className.replace(/w-\[calc\(100vw-32px\)\]|md:w-full|snap-center|snap-always|scroll-mt-40|shrink-0|current-week-marker/g, '');
            clone.style.cssText = 'width:100%;background-color:#ffffff;border:1px solid #cbd5e1;border-radius:16px;padding:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);';
            
            ['.h-treasure', '.h-ministry', '.h-living', '.h-weekend'].forEach((sel, i) => {
                const el = clone.querySelector(sel);
                if (el) el.outerHTML = `<div style="margin-top:6px; margin-bottom:6px; background:${['#0d9488','#d97706','#b91c1c','#475569'][i]}; border-radius: 6px; padding: 6px 10px; display: table; width: 100%;"><div style="display: table-cell; vertical-align: middle; width: 14px;"></div><div style="display: table-cell; vertical-align: middle; color:white; font-weight:900; font-size:11px; text-transform:uppercase; letter-spacing: 0.5px; padding-left: 6px;">ЗАГОЛОВОК</div></div>`;
            });
            
            const innerGrid = clone.querySelector('.inner-week-columns');
            if(innerGrid) { innerGrid.className = ''; innerGrid.style.cssText = 'display:flex;flex-direction:column;gap:16px;width:100%;'; clone.querySelector('.border-dashed')?.remove(); }
            clone.querySelectorAll('[title="Информация"]').forEach(icon => icon.remove());
            
            tempDiv.appendChild(clone); cardsAdded++;
        });

        if (cardsAdded === 0) throw new Error("Пусто");
        document.body.appendChild(tempDiv);
        const canvas = await window.html2canvas(tempDiv, { scale: 2, backgroundColor: '#f1f5f9', useCORS: true, logging: false });
        const link = document.createElement('a'); link.download = `Расписание_${new Date().toLocaleDateString('ru-RU')}.png`; link.href = canvas.toDataURL('image/png'); link.click();
        window.showToast("Картинка сохранена! ✅", "success");
    } catch (e) { alert("Ошибка при создании картинки."); } finally { overlay.remove(); tempDiv.remove(); }
};

let isStandReqPending = false; let myStands = []; let unsubStandReqs = null; let unsubStands = null;

window.renderStandCard = function() {
    const container = document.getElementById('stand-widget-container'); if (!container) return;
    if (unsubStandReqs) unsubStandReqs(); if (unsubStands) unsubStands();
    unsubStandReqs = onSnapshot(query(collection(db, "requests"), where("userId", "==", userId), where("type", "==", "stand")), (snap) => { isStandReqPending = !snap.empty; window.updateStandWidgetUI(); });
    unsubStands = onSnapshot(query(collection(db, "stands"), where("userId", "==", userId)), (snap) => { myStands = []; snap.forEach(doc => myStands.push(doc.data())); window.updateStandWidgetUI(); });
};

window.updateStandWidgetUI = function() {
    const container = document.getElementById('stand-widget-container'); if (!container) return;
    const isAppr = currentUserData?.roles?.some(r=>['Служение со стендом','Владелец','Админ'].includes(r));
    const today = new Date(); const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const firstDayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    let upcoming = []; let count = 0;

    myStands.forEach(d => { if (d.date >= firstDayStr && d.date.startsWith(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)) count++; if (d.date >= todayStr) upcoming.push(d); });
    upcoming.sort((a, b) => a.date.localeCompare(b.date));

    let html = upcoming.length > 0 ? upcoming.slice(0, 3).map(s => `<div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100"><div class="flex flex-col"><span class="font-bold text-slate-800 text-sm">${new Date(s.date).toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' })}</span><span class="text-[10px] text-slate-500 uppercase font-black tracking-widest">${s.time}</span></div><span class="text-xs font-bold text-theme-modBtnText truncate pl-4 text-right max-w-[50%]">${s.point || 'Стенд'}</span></div>`).join('') : '<p class="text-slate-400 text-sm italic py-4 text-center">Нет записей</p>';
    let btnHtml = isAppr ? `<button onclick="window.location.href='stand.html'" class="w-full bg-theme-modBtnBg hover:bg-theme-modBtnHover text-theme-modBtnText font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-colors shadow-sm outline-none mb-5">Записаться</button>` : (isStandReqPending ? `<button disabled class="w-full bg-slate-100 text-slate-400 font-black uppercase tracking-widest py-3 rounded-xl text-xs shadow-sm outline-none mb-5 cursor-not-allowed">Заявка на рассмотрении</button>` : `<button onclick="requestStand(this)" class="w-full bg-theme-modBtnBg hover:bg-theme-modBtnHover text-theme-modBtnText font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-colors shadow-sm outline-none mb-5">Подать заявку</button>`);

    container.innerHTML = `<div class="bg-theme-card p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm"><div class="flex justify-between items-center mb-4"><h3 class="font-black text-theme-text flex items-center gap-2 text-xl"><svg class="w-6 h-6 text-theme-modIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><span data-lang="stand_ministry">Служение со стендом</span></h3></div>${btnHtml}<div class="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-3"><span>Смен в этом месяце</span><span class="bg-theme-modBtnBg text-theme-modBtnText px-2 py-0.5 rounded font-black">${count}</span></div><div id="stand-shifts-list" class="space-y-2">${html}</div></div>`;
};

window.requestStand = async (btn) => {
    btn.innerText = "..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "stand", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.classList.replace('bg-theme-modBtnBg', 'bg-emerald-500'); btn.classList.replace('text-theme-modBtnText', 'text-white'); btn.innerHTML = `✅ ${window.t('success')}`;
        setTimeout(() => { btn.classList.replace('bg-emerald-500', 'bg-slate-100'); btn.classList.replace('text-white', 'text-slate-400'); btn.innerText = window.t('stand_pending'); }, 2000);
    } catch (e) { alert(window.t('error_network')); btn.innerText = window.t('stand_apply'); btn.disabled = false; }
};

window.availableTerritoriesData = []; window.allMapPolygons = []; window.isAvailableMapView = false; let globalAvailableMapInstance = null; let globalAvailableLayerGroup = null;

window.openTakeTerrModal = async () => {
    document.getElementById('take-terr-modal').classList.replace('hidden', 'flex');
    const listContainer = document.getElementById('available-terr-list'); listContainer.innerHTML = `<p class="text-xs italic text-slate-400 text-center py-4 font-bold uppercase tracking-widest animate-pulse">${window.t('loading')}</p>`;
    window.isAvailableMapView = true; document.getElementById('available-terr-map-container')?.classList.remove('hidden'); listContainer.classList.add('hidden');
    
    try {
        const activeSnap = await getDocs(query(collection(db, "territories"), where("status", "==", "active"))); const activeNumbers = []; activeSnap.forEach(doc => activeNumbers.push(Number(doc.data().number))); window.activeTerritoriesCount = activeNumbers.length;
        const returnedSnap = await getDocs(query(collection(db, "territories"), where("status", "==", "returned"))); const lastWorkedMap = {}; returnedSnap.forEach(doc => { const d = doc.data(); if(d.returnedAt) { const dDate = new Date(d.returnedAt).getTime(); if(!lastWorkedMap[d.number] || lastWorkedMap[d.number] < dDate) lastWorkedMap[d.number] = dDate; } });
        
        window.availableTerritoriesData = []; window.allMapPolygons = []; window.cooldownTerritoriesCount = 0; const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000; const now = Date.now(); let hasAnyPolygon = false; 

        Object.keys(window.allMapsCache).forEach(numStr => {
            const num = Number(numStr); const mapData = window.allMapsCache[numStr]; let lastW = lastWorkedMap[num] || 0; let status = 'available'; let isFire = false;
            if (activeNumbers.includes(num)) { status = 'active'; } else if (lastW > 0 && (now - lastW) < ninetyDaysMs) { status = 'cooldown'; window.cooldownTerritoriesCount++; } else { isFire = (lastW === 0) || ((now - lastW) > ninetyDaysMs); status = isFire ? 'fire' : 'available'; window.availableTerritoriesData.push({ num: num, url: mapData.url, city: mapData.city, polygon: mapData.polygon, lastWorked: lastW, isFire: isFire }); }
            if (mapData.polygon) { hasAnyPolygon = true; window.allMapPolygons.push({ num: num, city: mapData.city, polygon: mapData.polygon, status: status }); }
        });

        const toggleBtn = document.getElementById('toggle-terr-view-btn');
        if (toggleBtn) {
            if (hasAnyPolygon) { toggleBtn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> Списком`; toggleBtn.className = "bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-colors outline-none shadow-sm flex items-center gap-1.5 border border-slate-300"; toggleBtn.classList.remove('hidden'); setTimeout(() => window.renderGlobalAvailableMap(), 100); } 
            else { toggleBtn.classList.add('hidden'); window.isAvailableMapView = false; document.getElementById('available-terr-map-container')?.classList.add('hidden'); listContainer.classList.remove('hidden'); }
        }
        window.renderAvailableTerritoriesUI(); 
    } catch (e) { listContainer.innerHTML = `<p class="text-xs font-bold text-red-500 text-center py-4">Ошибка загрузки</p>`; }
};

window.toggleAvailableView = () => {
    window.isAvailableMapView = !window.isAvailableMapView; const list = document.getElementById('available-terr-list'); const mapContainer = document.getElementById('available-terr-map-container'); const btn = document.getElementById('toggle-terr-view-btn');
    if (window.isAvailableMapView) { list.classList.add('hidden'); mapContainer.classList.remove('hidden'); btn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> Списком`; btn.className = "bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-colors outline-none shadow-sm flex items-center gap-1.5 border border-slate-300"; window.renderGlobalAvailableMap(); } 
    else { mapContainer.classList.add('hidden'); list.classList.remove('hidden'); btn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> На карте`; btn.className = "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-colors outline-none shadow-sm flex items-center gap-1.5 border border-indigo-200"; }
};

window.focusOnTerritoryOnMap = (numStr) => {
    document.getElementById('take-terr-modal').classList.replace('hidden', 'flex');
    document.getElementById('available-terr-list')?.classList.add('hidden'); document.getElementById('available-terr-map-container')?.classList.remove('hidden');
    const toggleBtn = document.getElementById('toggle-terr-view-btn'); if (toggleBtn) toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> Списком`;
    setTimeout(() => { if(globalAvailableMapInstance) globalAvailableMapInstance.invalidateSize(); const poly = window.terrMapPolygons?.[numStr]; if (poly) { globalAvailableMapInstance.flyToBounds(poly.getBounds(), { padding: [30, 30], duration: 0.5 }); poly.fire('click'); } else { alert("Участок не найден на карте!"); } }, 100);
};

window.renderGlobalAvailableMap = () => {
    if (!globalAvailableMapInstance) { globalAvailableMapInstance = L.map('available-terr-map', { attributionControl: false }).setView([49.974, 12.700], 12); L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(globalAvailableMapInstance); globalAvailableMapInstance.on('movestart zoomstart', () => { globalAvailableMapInstance.closePopup(); }); }
    setTimeout(() => {
        globalAvailableMapInstance.invalidateSize(); if (globalAvailableLayerGroup) globalAvailableMapInstance.removeLayer(globalAvailableLayerGroup); globalAvailableLayerGroup = L.layerGroup().addTo(globalAvailableMapInstance);
        if (!document.getElementById('terr-label-style')) document.head.insertAdjacentHTML('beforeend', `<style id="terr-label-style">.terr-map-label { background: #334155 !important; border: 2px solid #ffffff !important; border-radius: 50% !important; color: #ffffff !important; font-weight: 900; font-size: 12px; text-shadow: none !important; box-shadow: 0px 2px 4px rgba(0,0,0,0.3) !important; width: 28px !important; height: 28px !important; line-height: 24px !important; text-align: center !important; padding: 0 !important; white-space: nowrap !important; } .terr-map-label::before { display: none !important; }</style>`);
        
        const cityBoundary = [[49.762638, 12.404806], [49.733720, 12.413257], [49.706275, 12.442696], [49.692883, 12.483003], [49.685730, 12.520048], [49.659490, 12.524038], [49.637595, 12.525053], [49.620210, 12.537888], [49.605940, 12.563586], [49.608063, 12.584177], [49.609018, 12.614063], [49.607108, 12.659840], [49.608868, 12.701759], [49.613171, 12.744105], [49.623351, 12.790354], [49.620677, 12.811054], [49.630270, 12.854405], [49.643882, 12.860074], [49.647625, 12.869134], [49.646347, 12.901715], [49.641114, 12.949541], [49.639451, 12.964528], [49.638745, 13.026727], [49.636160, 13.043097], [49.622405, 13.066341], [49.620638, 13.077260], [49.642093, 13.082883], [49.652862, 13.067399], [49.661167, 13.061963], [49.684710, 13.042125], [49.696519, 13.057605], [49.711157, 13.049344], [49.737032, 13.075511], [49.745860, 13.090464], [49.758391, 13.088168], [49.767682, 13.074769], [49.771180, 13.065581], [49.776888, 13.066254], [49.782047, 13.068638], [49.784766, 13.069866], [49.785789, 13.071170], [49.786017, 13.073924], [49.788125, 13.077771], [49.788716, 13.080709], [49.790221, 13.081899], [49.792451, 13.080407], [49.793940, 13.079845], [49.794734, 13.080809], [49.796182, 13.084925], [49.796243, 13.088396], [49.796493, 13.090975], [49.797423, 13.092379], [49.798288, 13.093284], [49.798938, 13.093896], [49.802714, 13.097843], [49.803922, 13.097765], [49.804300, 13.095917], [49.803761, 13.092835], [49.811132, 13.086538], [49.828153, 13.067798], [49.841433, 13.040319], [49.848450, 12.997812], [49.854120, 12.979033], [49.856936, 12.954019], [49.855896, 12.941722], [49.853831, 12.924183], [49.849221, 12.903905], [49.851137, 12.888613], [49.853205, 12.877172], [49.862712, 12.868898], [49.872234, 12.873504], [49.874074, 12.878526], [49.877967, 12.891579], [49.886986, 12.896973], [49.894926, 12.900252], [49.902971, 12.907937], [49.906174, 12.926354], [49.913779, 12.933967], [49.916793, 12.944688], [49.920883, 12.958058], [49.918926, 12.962926], [49.915415, 12.969016], [49.915449, 12.979913], [49.917970, 12.987808], [49.922365, 12.990560], [49.928565, 12.988663], [49.934970, 12.980036], [49.941487, 12.957473], [49.947034, 12.950448], [49.954511, 12.947171], [49.965853, 12.948901], [49.971373, 12.952215], [49.977745, 12.965412], [49.978775, 12.995759], [49.985707, 13.012018], [49.991920, 13.016657], [49.998658, 13.013203], [50.000668, 13.006235], [50.000446, 12.979959], [50.003458, 12.940115], [50.005655, 12.913972], [50.006518, 12.896448], [50.008018, 12.883788], [50.011389, 12.870988], [50.016578, 12.861334], [50.042324, 12.859146], [50.047436, 12.850052], [50.048259, 12.808401], [50.052522, 12.787885], [50.051300, 12.768339], [50.050447, 12.758568], [50.057922, 12.744062], [50.059510, 12.737128], [50.059853, 12.727839], [50.053037, 12.703228], [50.043466, 12.693114], [50.030028, 12.689805], [50.018791, 12.683851], [50.017013, 12.675724], [50.018933, 12.655038], [50.020765, 12.623165], [50.023575, 12.596141], [50.034415, 12.588492], [50.041073, 12.581870], [50.049509, 12.573893], [50.053277, 12.566160], [50.049356, 12.552020], [50.038839, 12.547940], [50.033051, 12.550032], [50.029773, 12.546458], [50.026140, 12.537401], [50.018102, 12.527514], [50.010528, 12.523957], [50.006796, 12.508941], [49.981593, 12.489888], [49.972102, 12.499310], [49.969792, 12.493562], [49.966777, 12.493795], [49.961852, 12.490864], [49.960622, 12.491437], [49.958438, 12.490433], [49.957892, 12.488292], [49.958453, 12.483193], [49.958025, 12.480578], [49.956466, 12.477640], [49.953216, 12.474882], [49.952305, 12.475075], [49.948291, 12.469947], [49.946787, 12.469745], [49.943096, 12.472102], [49.938454, 12.474968], [49.935506, 12.478642], [49.936539, 12.493798], [49.933198, 12.493167], [49.932545, 12.498164], [49.927585, 12.512151], [49.927584, 12.522963], [49.924634, 12.538534], [49.922711, 12.544699], [49.920400, 12.547813], [49.916179, 12.548351], [49.913048, 12.549166], [49.909827, 12.551128], [49.903146, 12.550917], [49.895473, 12.545024], [49.891335, 12.540008], [49.890924, 12.535302], [49.883408, 12.524112], [49.880116, 12.520458], [49.877058, 12.518639], [49.869078, 12.518578], [49.861422, 12.514108], [49.858686, 12.510673], [49.857488, 12.507820], [49.857009, 12.497694], [49.855010, 12.498489], [49.847481, 12.499572], [49.837469, 12.497958], [49.841975, 12.483019], [49.833212, 12.473006], [49.823528, 12.475038], [49.814792, 12.472150], [49.810171, 12.465074], [49.787588, 12.471540], [49.762638, 12.404806]];
        L.polygon(cityBoundary, { color: '#3b82f6', weight: 4, fill: false, dashArray: '10, 10', interactive: false }).addTo(globalAvailableLayerGroup);
        
        let bounds = L.latLngBounds(); let hasPolys = false; let currentlyHighlighted = null; window.terrMapPolygons = {}; 
        window.allMapPolygons.forEach(m => {
            hasPolys = true; const latlngs = m.polygon.map(p => [p.lat, p.lng]);
            let polyColor = '#64748b'; let fillOp = 0.0; let dashArr = '3, 4'; let weight = 2; let statusText = ''; let btnHtml = '';

            if (m.status === 'active') { statusText = '<span class="text-slate-500 flex items-center justify-center gap-1.5 mt-2 text-[11px] bg-slate-100 py-1 rounded-md">🚧 Копаем... 👷‍♂️</span>'; polyColor = '#475569'; fillOp = 0.25; } 
            else if (m.status === 'cooldown') { statusText = '<span class="text-purple-500 flex items-center justify-center gap-1.5 mt-2 text-[11px] bg-purple-50 py-1 rounded-md">⏳ Спит... 🛌</span>'; polyColor = '#94a3b8'; fillOp = 0.2; } 
            else if (m.status === 'fire') { statusText = '<span class="text-rose-500 mt-1 block">Свободен (Рекомендуем)</span>'; btnHtml = `<button onclick="takeTerritory(${m.num}, this)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg shadow-md active:scale-95 transition-all mt-2 outline-none">ВЗЯТЬ УЧАСТОК</button>`; } 
            else { statusText = '<span class="text-emerald-500 mt-1 block">Свободен</span>'; btnHtml = `<button onclick="takeTerritory(${m.num}, this)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg shadow-md active:scale-95 transition-all mt-2 outline-none">ВЗЯТЬ УЧАСТОК</button>`; }

            const defaultStyle = { color: polyColor, weight: weight, dashArray: dashArr, fillColor: polyColor, fillOpacity: fillOp, opacity: 0.9 };
            const poly = L.polygon(latlngs, defaultStyle); window.terrMapPolygons[m.num] = poly;
            poly.bindTooltip(String(m.num), { permanent: true, direction: 'center', className: 'terr-map-label' });
            poly.bindPopup(`<div class="text-center p-1.5 min-w-[140px] font-sans"><span class="block font-black text-2xl text-slate-800 leading-none mb-1">№ ${m.num}</span><span class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">${m.city}</span><span class="block text-[9px] font-black uppercase tracking-widest border-t border-slate-100 pt-1">${statusText}</span>${btnHtml}</div>`, { autoPan: false });
            poly.on('click', function () { if (currentlyHighlighted) { currentlyHighlighted.poly.setStyle(currentlyHighlighted.defaultStyle); } poly.setStyle({ fillOpacity: Math.max(fillOp, 0.15), color: '#10b981', weight: 3, dashArray: '' }); currentlyHighlighted = { poly: poly, defaultStyle: defaultStyle }; });
            poly.on('popupclose', function () { poly.setStyle(defaultStyle); if (currentlyHighlighted && currentlyHighlighted.poly === poly) currentlyHighlighted = null; });
            poly.addTo(globalAvailableLayerGroup); bounds.extend(poly.getBounds());
        });
        if (hasPolys) globalAvailableMapInstance.fitBounds(bounds, { padding: [30, 30] });
    }, 100);
};

window.renderAvailableTerritoriesUI = () => {
    const listContainer = document.getElementById('available-terr-list'); let filtered = window.availableTerritoriesData; filtered.sort((a, b) => a.num - b.num);
    const totalMaps = Object.keys(window.allMapsCache).length; const availableMaps = window.availableTerritoriesData.length; const takenMaps = window.activeTerritoriesCount || 0; const completedMaps = window.cooldownTerritoriesCount || 0; 
    let statsHtml = `<div class="grid grid-cols-4 gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-4 text-center text-[8px] font-black uppercase tracking-widest text-slate-500 shadow-inner shrink-0"><div><span class="block text-slate-400 text-[7px] mb-0.5">В базе</span><span class="text-slate-800 text-xs font-black">${totalMaps}</span></div><div class="border-l border-slate-200"><span class="block text-slate-400 text-[7px] mb-0.5">В работе</span><span class="text-indigo-600 text-xs font-black">${takenMaps}</span></div><div class="border-l border-slate-200"><span class="block text-slate-400 text-[7px] mb-0.5">Пройдено</span><span class="text-purple-600 text-xs font-black">${completedMaps}</span></div><div class="border-l border-slate-200"><span class="block text-slate-400 text-[7px] mb-0.5">Свободно</span><span class="text-emerald-600 text-xs font-black">${availableMaps}</span></div></div>`;
    let gridHtml = filtered.length === 0 ? `<p class="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-8">Все участки разобраны!</p>` : '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">' + filtered.map(m => `<div ${m.polygon ? `onclick="focusOnTerritoryOnMap('${m.num}')"` : (m.url ? `onclick="window.open('${m.url}', '_blank')"` : `onclick="alert('Нет карты')" `)} class="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all active:scale-[0.98] group"><div class="flex flex-col text-left pr-2"><span class="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md w-max mb-1.5 shadow-sm">№ ${m.num}</span><span class="font-black text-slate-700 text-sm md:text-base leading-tight">${m.city || 'Без города'}</span></div><div class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors"><svg class="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg></div></div>`).join('') + '</div>';
    listContainer.innerHTML = statsHtml + gridHtml;
};

window.takeTerritory = async (num, btn) => {
    btn.disabled = true; btn.innerText = '...';
    try { await addDoc(collection(db, "territories"), { number: Number(num), userId: userId, userName: currentUserData.name, status: "active", issuedAt: new Date().toISOString() }); window.showToast(`Участок №${num} закреплен! ✅`, 'success'); window.closeModals(); } 
    catch (e) { alert('Ошибка сети!'); btn.disabled = false; btn.innerText = 'ВЗЯТЬ'; }
};

let selectedImageFile = null;
window.previewImage = (input) => { if (input.files && input.files[0]) { selectedImageFile = input.files[0]; const reader = new FileReader(); reader.onload = (e) => { document.getElementById('image-preview').src = e.target.result; document.getElementById('image-preview-container').classList.remove('hidden'); }; reader.readAsDataURL(selectedImageFile); } };
window.removeImage = () => { selectedImageFile = null; document.getElementById('news-image').value = ''; document.getElementById('image-preview-container').classList.add('hidden'); };
window.openTaskInfoModal = (htmlContent) => { const modal = document.getElementById('task-info-modal'); const contentEl = document.getElementById('task-info-content'); if (modal && contentEl) { contentEl.innerHTML = htmlContent; modal.classList.replace('hidden', 'flex'); } };
window.closeTaskInfoModal = () => document.getElementById('task-info-modal')?.classList.replace('flex', 'hidden');

window.publishNews = async () => {
    const inputRu = document.getElementById('news-input-ru'); const inputCs = document.getElementById('news-input-cs');
    const textRu = inputRu ? inputRu.value.trim() : ''; const textCs = inputCs ? inputCs.value.trim() : '';
    if (!textRu && !textCs && !selectedImageFile) return alert(window.t('alert_add_text_photo'));
    const btn = document.getElementById('publish-news-btn'); if(btn) { btn.innerText = window.t('loading'); btn.disabled = true; }
    try {
        let imageUrl = ""; if (selectedImageFile) { const storageRef = ref(storage, 'news/' + Date.now() + '_' + selectedImageFile.name); await uploadBytes(storageRef, selectedImageFile); imageUrl = await getDownloadURL(storageRef); }
        await addDoc(collection(db, "section_content"), { section: 'news', text_ru: textRu, text_cs: textCs, text: textRu || textCs, imageUrl: imageUrl, createdAt: new Date().toISOString() });
        if(inputRu) inputRu.value = ''; if(inputCs) inputCs.value = ''; removeImage();
        if(btn) { btn.innerHTML = `✅ ${window.t('success')}`; setTimeout(() => { btn.innerText = window.t('publish'); btn.disabled = false; }, 2000); }
    } catch (e) { alert(window.t('alert_publish_error')); if(btn) { btn.innerText = window.t('publish'); btn.disabled = false; } }
};

window.deleteNews = async (id) => { if (confirm(window.t('confirm_delete_news'))) { try { await deleteDoc(doc(db, "section_content", id)); } catch (e) { alert(window.t('error_network')); } } };

const initPullToRefresh = () => {
    const ptrEl = document.getElementById('custom-ptr'); const ptrIcon = document.getElementById('ptr-icon'); const ptrText = document.getElementById('ptr-text'); const mainDash = document.getElementById('main-dashboard');
    if (!mainDash || !ptrEl) return; let startY = 0; let currentY = 0; let isPulling = false; const triggerDistance = 150; 
    mainDash.addEventListener('touchstart', (e) => { if (mainDash.scrollTop <= 0) { startY = e.touches[0].clientY; isPulling = false; ptrEl.style.transition = 'none'; } }, { passive: true });
    mainDash.addEventListener('touchmove', (e) => {
        if (startY === 0 || mainDash.scrollTop > 0) return; currentY = e.touches[0].clientY; let distance = currentY - startY;
        if (distance > 0) { isPulling = true; let pullDistance = distance * 0.35; ptrEl.style.transform = `translateY(${pullDistance - 80}px)`; 
            if (pullDistance > triggerDistance) { ptrIcon.style.transform = 'rotate(180deg)'; ptrText.innerText = "Отпустите для обновления"; } else { ptrIcon.style.transform = 'rotate(0deg)'; ptrText.innerText = "Потяните сильнее"; }
        }
    }, { passive: true });
    mainDash.addEventListener('touchend', () => {
        if (isPulling) {
            ptrEl.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'; let pullDistance = (currentY - startY) * 0.35;
            if (pullDistance > triggerDistance) { ptrText.innerText = "Обновление..."; ptrIcon.style.transform = 'rotate(0deg)'; ptrIcon.classList.add('animate-spin'); ptrEl.style.transform = `translateY(20px)`; setTimeout(() => window.location.reload(), 500); } 
            else { ptrEl.style.transform = `translateY(-150%)`; }
        }
        startY = 0; currentY = 0; isPulling = false;
    }, { passive: true });
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPullToRefresh); else initPullToRefresh();

// ФУНКЦИЯ, КОТОРАЯ ЗАПУСКАЕТ ВСЕ ОСТАЛЬНЫЕ (САМАЯ ВАЖНАЯ)
if (userId) {
    onSnapshot(doc(db, "users", userId), async (docSnap) => {
        if (!docSnap.exists()) { if (navigator.onLine) window.logout(); return; }
        currentUserData = docSnap.data();
        const pendingScreen = document.getElementById('pending-screen'); const mainDashboard = document.getElementById('main-dashboard');
        if (currentUserData.status === 'pending') { if(pendingScreen) { pendingScreen.classList.remove('hidden'); pendingScreen.classList.add('flex'); } if(mainDashboard) mainDashboard.style.display = 'none'; } 
        else if (currentUserData.status === 'blocked') { document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">${window.t('access_denied')}</h1></div>`; } 
        else {
            if(pendingScreen) { pendingScreen.classList.add('hidden'); pendingScreen.classList.remove('flex'); } if(mainDashboard) mainDashboard.style.display = 'block';
            let userRoles = currentUserData.roles || [];
            const pushBtn = document.getElementById('push-btn'); if (pushBtn && messaging) { if (Notification.permission !== 'granted' || !currentUserData.pushToken) pushBtn.style.display = 'flex'; else pushBtn.style.display = 'none'; }
            hasFullAccess = userRoles.some(r => TOP_ROLES.includes(r));
            const setAdminLink = (id, condition) => { const btn = document.getElementById(id); if (btn) { if (condition) { btn.classList.remove('hidden'); btn.classList.add('flex'); } else { btn.classList.add('hidden'); btn.classList.remove('flex'); } } };
            setAdminLink('profile-admin-btn', hasFullAccess); setAdminLink('profile-reports-btn', hasFullAccess || userRoles.includes("Надзиратель группы")); setAdminLink('profile-calendar-btn', hasFullAccess || userRoles.includes("Надзиратель группы")); setAdminLink('profile-duties-btn', hasFullAccess || userRoles.includes("Надзиратель группы")); setAdminLink('profile-terr-btn', hasFullAccess || userRoles.includes("Ответственный за участки")); setAdminLink('profile-school-btn', hasFullAccess || userRoles.includes("Ответственный за школу")); setAdminLink('profile-stand-admin-btn', hasFullAccess || userRoles.includes("Ответственный за стенды")); setAdminLink('profile-schedule-btn', hasFullAccess || userRoles.includes("Ответственный за график"));
            const profileAdminLinks = document.getElementById('profile-admin-links'); if(profileAdminLinks) { if(hasFullAccess || userRoles.includes("Ответственный за стенды") || userRoles.includes("Ответственный за график") || userRoles.includes("Надзиратель группы") || userRoles.includes("Ответственный за участки") || userRoles.includes("Ответственный за школу")) { profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('grid'); } else { profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('grid'); } }
            try { loadPersonalData(); } catch(e) {} try { loadProfileData(); } catch(e) {}
            window.renderStandCard(); listenForMessages(); 
            if(!document.querySelector('.tab-content.active')) window.switchTab('home');
        }
    });
}
// === КОНЕЦ ФАЙЛА app.js ===
