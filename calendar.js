import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
        "admin_title": "Панель Администратора",
        "back_home": "На главную",
        "btn_back": "Назад",
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
        "calendar_title": "Календарь Событий - GRO-UP",
        "calendar_h1": "Календарь",
        "calendar_subtitle": "График событий собрания",
        "create_meeting": "Создать встречу",
        "event_type": "Тип события",
        "opt_regular": "Обычная встреча",
        "opt_special": "Особое событие (важно)",
        "event_name": "Название",
        "ph_meeting": "Встреча для проповеди",
        "event_date": "Дата",
        "event_time": "Время",
        "event_group_label": "Группа (пусто = для всех)",
        "ph_group": "Например: 5",
        "leaders_queue": "Ведущие (авто-очередь)",
        "loading_brothers": "Загрузка братьев...",
        "repeat_weekly": "Повторять еженедельно",
        "how_many_weeks": "На сколько недель?",
        "publish_btn": "Опубликовать",
        "meeting_schedule": "График встреч",
        "show_other_groups": "Показать другие группы",
        "alert_fill_name_date": "Заполните название и дату!",
        "generating": "Генерация...",
        "success_with_tick": "Успешно! ✔️",
        "general_group": "Общее",
        "leader_label": "Ведущий:",
        "title_special_event": "Особое событие",
        "foreign_event": "Чужое",
        "no_events_group": "Событий для вашей группы не найдено.",
        "no_brothers_found": "Братья не найдены",
        "confirm_delete_event": "Удалить встречу из календаря?"
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
        "admin_title": "Panel administrátora",
        "back_home": "Na hlavní stránku",
        "btn_back": "Zpět",
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
        "calendar_title": "Kalendář událostí - GRO-UP",
        "calendar_h1": "Kalendář",
        "calendar_subtitle": "Rozvrh událostí sboru",
        "create_meeting": "Vytvořit schůzku",
        "event_type": "Typ události",
        "opt_regular": "Běžná schůzka",
        "opt_special": "Zvláštní událost (důležité)",
        "event_name": "Název",
        "ph_meeting": "Schůzka před službou",
        "event_date": "Datum",
        "event_time": "Čas",
        "event_group_label": "Skupina (prázdné = pro všechny)",
        "ph_group": "Například: 5",
        "leaders_queue": "Vedoucí (auto-fronta)",
        "loading_brothers": "Načítání bratrů...",
        "repeat_weekly": "Opakovat týdně",
        "how_many_weeks": "Na kolik týdnů?",
        "publish_btn": "Publikovat",
        "meeting_schedule": "Rozvrh schůzek",
        "show_other_groups": "Zobrazit ostatní skupiny",
        "alert_fill_name_date": "Vyplňte název a datum!",
        "generating": "Generování...",
        "success_with_tick": "Úspěšně! ✔️",
        "general_group": "Společné",
        "leader_label": "Vedoucí:",
        "title_special_event": "Zvláštní událost",
        "foreign_event": "Cizí",
        "no_events_group": "Pro vaši skupinu nebyly nalezeny žádné události.",
        "no_brothers_found": "Bratři nebyli nalezeni",
        "confirm_delete_event": "Smazat schůzku z kalendáře?"
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

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder')));
    });
    document.querySelectorAll('[data-lang-title]').forEach(el => {
        el.setAttribute('title', window.t(el.getAttribute('data-lang-title')));
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
const currentUserId = localStorage.getItem('userId');

if (!currentUserId) window.location.href = 'login.html';

let myGroup = "Все"; 
let isFullAdmin = false;
let allEventsData = []; 

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const userData = docSnap.data();
    const roles = userData.roles || [];
    
    myGroup = userData.group || "Все"; 
    isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';

    if (allEventsData.length > 0) renderEvents();
});

const timeInput = document.getElementById('event-time');
if (timeInput) {
    timeInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, ''); 
        if (v.length > 2) v = v.substring(0, 2) + ':' + v.substring(2, 4);
        e.target.value = v;
    });
}

onSnapshot(collection(db, "users"), (snapshot) => {
    const list = document.getElementById('leaders-list');
    if (!list) return;
    
    let usersArr = [];
    
    snapshot.forEach(d => { 
        const u = d.data();
        if(u.status === 'active' && u.gender === 'boy') usersArr.push(u.name); 
    });
    usersArr.sort();

    let html = '';
    usersArr.forEach(name => { 
        html += `
        <label class="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <input type="checkbox" value="${name}" class="leader-checkbox accent-rose-600 w-4 h-4 rounded cursor-pointer">
            <span class="text-xs font-bold text-slate-700 select-none">${name}</span>
        </label>
        `; 
    });
    
    list.innerHTML = html || `<p class="text-xs text-slate-400 italic">${window.t('no_brothers_found')}</p>`;
});

document.getElementById('save-event-btn').addEventListener('click', async (e) => {
    const category = document.getElementById('event-category').value; 
    const title = document.getElementById('event-title').value.trim();
    const dateStr = document.getElementById('event-date').value;
    const timeStr = document.getElementById('event-time').value || "";
    const groupVal = document.getElementById('event-group').value.trim();
    
    const selectedLeaders = Array.from(document.querySelectorAll('.leader-checkbox:checked')).map(cb => cb.value);
    
    const isRecurring = document.getElementById('event-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('event-weeks').value) : 1;

    if (!title || !dateStr) return alert(window.t('alert_fill_name_date'));

    const btn = e.target;
    btn.innerText = window.t('generating'); btn.disabled = true;

    try {
        const baseDate = new Date(dateStr);

        for (let i = 0; i < weeksCount; i++) {
            const evDate = new Date(baseDate);
            evDate.setDate(evDate.getDate() + (i * 7)); 
            
            const yyyy = evDate.getFullYear();
            const mm = String(evDate.getMonth() + 1).padStart(2, '0');
            const dd = String(evDate.getDate()).padStart(2, '0');
            const newDateStr = `${yyyy}-${mm}-${dd}`;

            let leaderForWeek = "";
            if (selectedLeaders.length > 0) {
                leaderForWeek = selectedLeaders[i % selectedLeaders.length];
            }

            await addDoc(collection(db, "events"), {
                title: title,
                date: newDateStr,
                time: timeStr,
                group: groupVal || "Все",
                leader: leaderForWeek,
                category: category, 
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('event-title').value = '';
        document.querySelectorAll('.leader-checkbox').forEach(cb => cb.checked = false);
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = window.t('success_with_tick');
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = window.t('publish_btn'); 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { alert(window.t('error_network')); btn.disabled = false; }
});

window.renderEvents = () => {
    const list = document.getElementById('events-list');
    const showAllCb = document.getElementById('show-all-events-cb');
    const showAll = showAllCb ? showAllCb.checked : false;
    
    let html = '';
    const today = new Date(); 
    today.setHours(0,0,0,0);
    let activeCount = 0;

    allEventsData.forEach(docSnap => {
        const ev = docSnap.data();
        const evDate = new Date(ev.date);
        const evGroup = ev.group || "Все";

        if (evDate < today) {
            if (isFullAdmin) deleteDoc(doc(db, "events", docSnap.id));
            return; 
        }

        const isMyGroupOrAll = (evGroup === "Все" || evGroup == myGroup);
        
        if (isMyGroupOrAll || showAll) {
            activeCount++;
            
            const isOtherGroup = !isMyGroupOrAll;
            const opacityClass = isOtherGroup ? "opacity-50 hover:opacity-100 bg-slate-50" : "bg-white";
            const niceDate = evDate.toLocaleDateString(localeFormat, { day: 'numeric', month: 'long', year: 'numeric' });
            
            const groupBadge = evGroup !== "Все" 
                ? `<span class="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] px-2 py-0.5 rounded-md font-black uppercase shrink-0">${window.t('group_short')} ${evGroup}</span>` 
                : `<span class="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-black uppercase shrink-0">${window.t('general_group')}</span>`;
            
            const timeHtml = ev.time ? `<span class="text-xs font-mono font-black text-slate-400 mr-3 shrink-0">${ev.time}</span>` : '';
            const leaderHtml = ev.leader ? `<div class="text-[10px] uppercase font-bold text-slate-400 mt-1 truncate">${window.t('leader_label')} <span class="text-rose-500 font-black">${ev.leader}</span></div>` : '';
            
            // Замена эмодзи "⭐" на SVG-звездочку
            const specialBadge = ev.category === 'special' 
                ? `<svg class="w-3.5 h-3.5 text-rose-500 ml-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" title="${window.t('title_special_event')}"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>` 
                : '';

            const canDelete = isFullAdmin || isMyGroupOrAll;

            // Замена эмодзи "🗑️" на SVG-корзину
            const deleteBtn = canDelete 
                ? `<button onclick="deleteEvent('${docSnap.id}')" class="text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded-lg transition-colors p-2 outline-none" title="${window.t('delete')}"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>` 
                : `<span class="text-[10px] text-slate-400 font-bold uppercase p-2">${window.t('foreign_event')}</span>`;

            html += `
                <div class="flex items-center justify-between p-4 border-b border-slate-100 transition-colors ${opacityClass}">
                    <div class="flex items-center w-full min-w-0 pr-4">
                        ${timeHtml}
                        <div class="flex flex-col min-w-0">
                            <div class="flex items-center gap-2 truncate">
                                <h3 class="font-black text-slate-800 text-sm truncate">${ev.title}${specialBadge}</h3>
                                ${groupBadge}
                            </div>
                            <div class="flex items-center gap-2 mt-0.5 truncate">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">📅 ${niceDate}</p>
                            </div>
                            ${leaderHtml}
                        </div>
                    </div>
                    ${deleteBtn}
                </div>
            `;
        }
    });

    if(list) list.innerHTML = html || `<p class="text-slate-400 italic p-6 text-center text-sm">${window.t('no_events_group')}</p>`;
};

const q = query(collection(db, "events"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    allEventsData = snapshot.docs;
    renderEvents();
});

const showAllCb = document.getElementById('show-all-events-cb');
if(showAllCb) showAllCb.addEventListener('change', renderEvents);

window.deleteEvent = (id) => {
    if (confirm(window.t('confirm_delete_event'))) deleteDoc(doc(db, "events", id));
};
