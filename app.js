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
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(true); }
    });
}

setTimeout(() => {
    const loader = document.getElementById('global-loader');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.style.display = 'none', 500); }
}, 2000);

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
        "access_denied": "ДОСТУП ЗАКРЫТ", "no_group": "Без группы", "no_duties": "На этой неделе дежурств нет", "duty_reminder": "Напоминание: Ваша группа дежурит в эти выходные!",
        "cleaning_weekend": "Уборка в эти выходные!", "no_active_territories": "У вас пока нет активных участков", "territory_num": "Участок №",
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
        "zoom_launch": "ЗАПУСТИТЬ", "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], "info_title": "Информация", "in_development": "Раздел в разработке",
        "meeting_program": "Программа", "no_schedule": "Нет опубликованных программ",
        "chairman": "Председатель", "treasures_title": "Сокровища из слова бога", "talk_10_min": "Речь 10 мин.",
        "spiritual_gems": "Духовные жемчужины", "bible_reading": "Чтение Библии", "ministry_skills": "Оттачиваем навыки служения",
        "christian_living": "Христианская жизнь", "congregation_bible_study": "Изучение Библии", "reader": "Чтец",
        "closing_prayer": "Заключительная молитва", "part": "Задание", "start_conversation": "Начинайте разговор",
        "develop_interest": "Развивайте интерес", "make_disciples": "Подготавливайте учеников", "explain_beliefs": "Объясняйте свои взгляды",
        "local_needs": "Местные потребности", "current_week": "АКТУАЛЬНАЯ", "future_week": "БУДУЩАЯ",
        "public_talk": "Публичная речь", "weekend_meeting": "Выходные (Публичная речь)", "watchtower_study": "Изучение Сторожевой Башни", "opening_song": "Вступительные слова / Песня",
        "duties_schedule": "График дежурств", "new_message": "Новое сообщение", "msg_understood": "Понятно"
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
        "access_denied": "PŘÍSTUP ODEPŘEN", "no_group": "Bez skupiny", "no_duties": "Tento týden nejsou žádné služby",
        "duty_reminder": "Připomenutí: Vaše skupina má tento víkend službu!", "cleaning_weekend": "Úklid tento víkend!",
        "no_active_territories": "Zatím nemáte žádné aktivní obvody", "territory_num": "Obvod č.",
        "active": "Aktivní", "assistant_for": "Pomocník u", "speech": "Proslov", "assistant_short": "Pom:", "lesson": "Lekce",
        "no_tasks_upcoming": "Zatím nemáte žádné aktivní úkoly", "new_task_toast": "Máte nový úkol", "delete": "Smazat",
        "new_badge": "Nové", "new_announcement_toast": "📢 Nové oznámení v kanálu!", "create_announcement": "Vytvořit oznámení",
        "write_text_ru": "Text (Ruština)...", "write_text_cs": "Text (Čeština)...", "publish": "Publikovat", "no_news": "Žádná aktuální oznámení",
        "today_badge": "DNES", "group_short": "Sk.", "leader_short": "Ved:", "today_event_toast": "📅 Dnes:", "no_events_today": "Dnes nejsou žádné události",
        "loading": "Načítání...", "archive_empty": "Archiv je prázdný", "unknown": "Neznámé", "error_loading": "Chyba načítání",
        "alert_add_text_photo": "Přidejte text nebo fotku!", "alert_publish_error": "Chyba publikování! Zkontrolujte pravidla Storage.",
        "confirm_delete_news": "Smazat toto oznámení?", "confirm_delete_task": "Opravdu smazat tento úkol?", "admin_title": "Panel administrátora",
        "back_home": "Na hlavní stránku", "users_title": "Uživatelé", "autosave_data": "Automatické ukládání dat",
        "cong_name_label": "Název sboru (Uvidí všichni)", "cong_name_placeholder": "Například: Centrální", "requests_title": "Žádosti",
        "active_users": "Aktivní", "search_placeholder": "Hledat...", "th_name_gender": "Jméno a Pohlaví", "th_pin": "PIN",
        "th_group": "Skupina", "th_school": "Škola", "th_status": "Status ve sboru", "th_responsible": "Zodpovědný za",
        "th_manage": "Správa", "error_save": "Chyba při ukládání!", "alert_pin_length": "PIN kód musí mít přesně 6 číslic!",
        "error_save_pin": "Chyba při ukládání PIN kódu!", "error_update_role": "Chyba při aktualizaci role!", "confirm_block": "Zablokovat uživatele?",
        "confirm_delete_profile": "POZOR! Smazat profil?", "error_general": "Chyba!", "confirm_reject": "Opravdu zamítnout žádost a smazat data?",
        "error_delete": "Chyba při mazání", "status_pending": "Čeká", "btn_approve": "Schválit", "btn_reject": "Zamítnout",
        "btn_unblock": "Odblokovat", "btn_block": "Zablokovat", "btn_delete": "Smazat", "gender_boy": "Bratr", "gender_girl": "Sestra",
        "role_publisher": "Zvěstovatel", "role_pioneer": "Průkopník", "role_ms": "Služební pom.", "role_elder": "Starší",
        "role_admin": "Admin", "role_group": "Skupina", "role_terr": "Obvody", "role_school": "Škola", "no_new_requests": "Žádné nové žádosti",
        "no_active_users": "Žádní aktivní uživatelé",
        "cat_reading_db": "📖 Čtení Bible", "cat_conversation": "🗣️ Rozhovor", "cat_interest": "🌱 Zájem", "cat_disciples": "👥 Čiňte učedníky",
        "cat_beliefs": "💡 Přesvědčení", "cat_talk_db": "🎙️ Proslov", "open_map": "Otevřít mapu", "no_map": "Bez mapy", "opt_cleaning": "🧹 Úklid sálu",
        "opt_special_event": "⭐ Zvláštní událost", "all_groups": "Společné", "congregation_label": "Sbor", "scan_qr": "Naskenujte kód",
        "days_short": "dní", "return_terr_btn": "Odevzdat", "no_translation": "Bez překladu", "stand_title": "Služba se stojanem",
        "stand_apply": "Požádat", "stand_signup": "Zapsat se", "stand_pending": "Žádost odeslána", "stand_month_shifts": "Služeb v tomto měsíci",
        "stand_upcoming": "Tvé nejbližší služby", "stand_no_records": "Žádné zápisy", "zoom_error": "Zoom není nastaven", "zoom_click_hint": "Klikni<br>na ZOOM",
        "zoom_launch": "SPUSTIT", "months": ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"],
        "days": ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"], "info_title": "Informace", "in_development": "Sekce ve vývoji",
        "meeting_program": "Program", "no_schedule": "Žádné publikované programy",
        "chairman": "Předsedající", "treasures_title": "Poklady z Božího slova", "talk_10_min": "Proslov 10 min.",
        "spiritual_gems": "Hledání duchovních drahokamů", "bible_reading": "Čtení Bible", "ministry_skills": "Zlepšujme se ve službě",
        "christian_living": "Křesťanský život", "congregation_bible_study": "Sborové studium Bible", "reader": "Čte",
        "closing_prayer": "Závěrečná modlitba", "part": "Úkol", "start_conversation": "Zahájení rozhovoru",
        "develop_interest": "Rozvíjení zájmu", "make_disciples": "Činění učedníků", "explain_beliefs": "Vysvětlování své víry",
        "local_needs": "Místní potřeby", "current_week": "AKTUÁLNÍ", "future_week": "BUDOUCÍ",
        "public_talk": "Veřejná přednáška", "weekend_meeting": "Víkend (Veřejná přednáška)", "watchtower_study": "Studium Strážné věže", "opening_song": "Úvodní slova / Píseň",
        "duties_schedule": "Rozpis služeb", "new_message": "Nová zpráva", "msg_understood": "Rozumím"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => (dict[currentLang] && dict[currentLang][key]) ? dict[currentLang][key] : key;

function translateDbString(str) {
    if (!str) return '';
    const map = {
        "Начинайте разговор": "start_conversation", "Zahájení rozhovoru": "start_conversation",
        "Развивайте интерес": "develop_interest", "Rozvíjení zájmu": "develop_interest",
        "Подготавливайте учеников": "make_disciples", "Činění učedníků": "make_disciples",
        "Объясняйте свои взгляды": "explain_beliefs", "Vysvětlování své víry": "explain_beliefs",
        "Местные потребности": "local_needs", "Místní потребности": "local_needs",
        "Речь 10 мин.": "talk_10_min", "Proslov 10 min.": "talk_10_min"
    };
    if (map[str]) return window.t(map[str]);
    return str;
}

window.changeLanguage = (lang) => {
    localStorage.setItem('app_lang', lang);
    location.reload(); 
};

const applyTranslations = () => {
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = currentLang;
    document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = window.t(el.getAttribute('data-lang')));
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder'))));
    document.querySelectorAll('[data-lang-title]').forEach(el => el.setAttribute('title', window.t(el.getAttribute('data-lang-title'))));
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
try { messaging = getMessaging(app); } catch (e) {}
try { enableIndexedDbPersistence(db).catch(() => {}); } catch (e) {}

const userId = localStorage.getItem('userId');

if (!userId) {
    window.location.href = 'login.html';
}

// ГЛОБАЛЬНЫЕ ФУНКЦИИ ОКНА И НАВИГАЦИИ
window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
// --- ЛОГИКА АРХИВА ОТЧЕТОВ И КОРРЕКТИРОВОК ---
window.openReportHistory = async () => {
    const modal = document.getElementById('report-history-modal');
    if (modal) modal.classList.replace('hidden', 'flex');

    const container = document.getElementById('report-history-list') || document.getElementById('archive-list');
    if (!container) return;

    container.innerHTML = `<p class="text-center py-6 text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">${window.t('loading_archive') || 'Загрузка...'}</p>`;

    try {
        const q = query(collection(db, "reports"), where("userId", "==", userId));
        const snapshot = await getDocs(q);

        let reports = [];
        snapshot.forEach(docSnap => {
            reports.push({ id: docSnap.id, ...docSnap.data() });
        });

        reports.sort((a, b) => b.month.localeCompare(a.month));

        if (reports.length === 0) {
            container.innerHTML = `<p class="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">${window.t('archive_empty') || 'Архив пуст'}</p>`;
            return;
        }

        let html = '';
        reports.forEach(r => {
            const isParticipated = r.participated ? 'Да' : 'Нет';
            const hours = r.hours || 0;
            const studies = r.studies || 0;
            const credit = r.credit || r.pubs || 0; 
            
            const [year, monthNum] = r.month.split('-');
            const monthName = window.t('months')[parseInt(monthNum, 10) - 1];

            html += `
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm relative">
                    <h4 class="font-black text-slate-800 text-sm uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">${monthName} ${year}</h4>
                    <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        <div class="flex justify-between border-b border-slate-100 pb-1">Служил(а): <span class="font-black text-slate-800">${isParticipated}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1">Часы: <span class="font-black text-slate-800">${hours}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1">Изучения: <span class="font-black text-slate-800">${studies}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1">Кредит: <span class="font-black text-slate-800">${credit}</span></div>
                    </div>
                    
                    <button id="btn-edit-${r.id}" onclick="toggleEditHours('${r.id}', true)" class="text-[10px] bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 font-black uppercase tracking-widest px-3 py-2 rounded-lg w-full transition-colors mt-2 shadow-sm outline-none">Изменить часы</button>

                    <div id="form-edit-${r.id}" class="hidden mt-2 flex gap-2">
                        <input type="number" id="input-hours-${r.id}" value="${hours}" min="0" class="w-16 bg-white border border-slate-300 rounded-lg text-center font-black text-slate-800 text-sm outline-none focus:border-indigo-500 shadow-inner">
                        <button onclick="saveNewHours('${r.id}')" class="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors shadow-sm outline-none">Сохранить</button>
                        <button onclick="toggleEditHours('${r.id}', false)" class="w-10 bg-slate-200 hover:bg-slate-300 text-slate-500 font-black rounded-lg transition-colors shadow-sm outline-none flex items-center justify-center">✕</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="text-center py-6 text-red-500 text-xs font-bold uppercase tracking-widest">Ошибка загрузки данных</p>`;
    }
};

// Функция скрытия/показа встроенного редактора
window.toggleEditHours = (id, show) => {
    if (show) {
        document.getElementById(`btn-edit-${id}`).classList.add('hidden');
        document.getElementById(`form-edit-${id}`).classList.remove('hidden');
        document.getElementById(`form-edit-${id}`).classList.add('flex');
    } else {
        document.getElementById(`btn-edit-${id}`).classList.remove('hidden');
        document.getElementById(`form-edit-${id}`).classList.add('hidden');
        document.getElementById(`form-edit-${id}`).classList.remove('flex');
    }
};

// Функция сохранения новых часов напрямую
window.saveNewHours = async (reportId) => {
    const inputEl = document.getElementById(`input-hours-${reportId}`);
    if (!inputEl) return;
    
    const val = inputEl.value;
    if (val === '') return;
    
    const hoursNum = Number(val);
    if (isNaN(hoursNum) || hoursNum < 0) {
        alert("Пожалуйста, введите корректное число.");
        return;
    }

    const btn = inputEl.nextElementSibling;
    const originalText = btn.innerText;
    btn.innerText = '...';
    btn.disabled = true;

    try {
        await updateDoc(doc(db, "reports", reportId), {
            hours: hoursNum,
            participated: hoursNum > 0 ? true : false,
            updatedAt: new Date().toISOString()
        });
        
        window.showToast("Часы успешно обновлены! ✅");
        window.openReportHistory(); // Сразу перерисовываем архив, чтобы показать новые цифры
    } catch(e) {
        alert("Ошибка при обновлении часов. Проверьте интернет.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
};
// --- КОНЕЦ БЛОКА АРХИВА ---

// Функция прямой перезаписи часов
window.sendCorrection = async (reportId) => {
    const newHours = prompt("Введите новое количество часов (это число заменит старое):");
    
    // Если пользователь нажал "Отмена" или ничего не ввел
    if (newHours === null || newHours.trim() === "") return;

    const hoursNum = Number(newHours);
    
    // Проверка на дурака (если ввели буквы)
    if (isNaN(hoursNum) || hoursNum < 0) {
        alert("Пожалуйста, введите корректное число.");
        return;
    }

    try {
        // Перезаписываем часы. Если часов больше 0, автоматически ставим галочку "Служил(а)"
        await updateDoc(doc(db, "reports", reportId), {
            hours: hoursNum,
            participated: hoursNum > 0 ? true : false,
            updatedAt: new Date().toISOString()
        });
        
        window.showToast("Часы успешно обновлены! ✅");
        window.openReportHistory(); // Сразу перерисовываем архив, чтобы показать новые цифры
    } catch(e) {
        alert("Ошибка при обновлении часов. Проверьте интернет.");
    }
};
// --- КОНЕЦ БЛОКА АРХИВА ---

// Функция отправки корректировки
window.sendCorrection = async (reportId) => {
    const text = prompt("Опишите корректировку (Например: Забыл добавить 2 часа и 1 изучение):");
    if (!text || !text.trim()) return;

    try {
        // Записываем корректировку прямо в документ отчета
        await updateDoc(doc(db, "reports", reportId), {
            correction: text.trim(),
            correctionDate: new Date().toISOString()
        });
        window.showToast("Корректировка отправлена секретарю! ✅");
        window.openReportHistory(); // Обновляем модальное окно, чтобы показать статус
    } catch(e) {
        alert("Ошибка при отправке корректировки. Проверьте интернет.");
    }
};
// --- КОНЕЦ БЛОКА АРХИВА ---
window.openQrModal = () => document.getElementById('qr-modal').classList.replace('hidden', 'flex');
window.openDutiesModal = () => document.getElementById('duties-modal').classList.replace('hidden', 'flex');
window.openInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('hidden', 'flex');
window.closeInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('flex', 'hidden');

window.closeModals = () => {
    const m1 = document.getElementById('profile-modal'); if(m1) m1.classList.replace('flex', 'hidden');
    const m2 = document.getElementById('report-history-modal'); if(m2) m2.classList.replace('flex', 'hidden');
    const m3 = document.getElementById('duties-modal'); if(m3) m3.classList.replace('flex', 'hidden');
    const m4 = document.getElementById('user-msg-modal'); if(m4) m4.classList.replace('flex', 'hidden');
    const m5 = document.getElementById('take-terr-modal'); if(m5) m5.classList.replace('flex', 'hidden');
    const m6 = document.getElementById('info-details-modal'); if(m6) m6.classList.replace('flex', 'hidden');
    const m7 = document.getElementById('task-info-modal'); if(m7) m7.classList.replace('flex', 'hidden');
};
window.closeQrModal = () => document.getElementById('qr-modal').classList.replace('flex', 'hidden');

window.logout = async () => {
    const uid = localStorage.getItem('userId');
    if (uid) { try { await updateDoc(doc(db, "users", uid), { pushToken: "" }); } catch (e) {} }
    localStorage.clear(); window.location.href = 'login.html'; 
};

window.scrollNews = (offset) => { document.getElementById('content-news')?.scrollBy({ left: offset, behavior: 'smooth' }); };
window.scrollProgram = (dir) => { 
    const container = document.getElementById('meeting-program-list');
    if(container) {
        const scrollAmount = container.clientWidth * dir;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' }); 
    }
};

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'warning' ? 'bg-amber-500' : 'bg-slate-800';
    toast.className = `${bgColor} text-white px-5 py-4 rounded-xl shadow-lg text-base font-black text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
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
        if (permission === 'denied') throw new Error("Уведомления заблокированы! Разрешите их в настройках телефона (браузера).");
        if (permission !== 'granted') {
            const req = Notification.requestPermission();
            permission = (req instanceof Promise) ? await req : await new Promise(res => Notification.requestPermission(res));
        }
        if (permission !== 'granted') throw new Error("Нет разрешения на пуши");
        
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) registration = await navigator.serviceWorker.register('./sw.js');
        
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
            if (pushBtn) pushBtn.innerHTML = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`;
        }
    }
};

if (messaging) {
    try { 
        onMessage(messaging, (payload) => { 
            const title = payload.notification?.title || payload.data?.title || "Уведомление";
            const body = payload.notification?.body || payload.data?.body || "";
            window.showToast(`🔔 ${title}\n${body}`, 'info'); 
            if (Notification.permission === 'granted') new Notification(title, { body: body, icon: 'icon-512.png' });
        }); 
    } catch (e) {}
}

const TOP_ROLES = ["Владелец", "Админ"]; 
let currentUserData = null; 
let hasFullAccess = false;
let currentZoomData = { id: "", pass: "" }; 

window.zoomStateReady = false;
window.handleZoomClick = (event) => {
    event.preventDefault();
    const zoomBtn = document.getElementById('zoom-btn-element');
    const hiddenInfo = document.getElementById('zoom-info-hidden');
    const revealedInfo = document.getElementById('zoom-info-revealed');
    
    if (!window.zoomStateReady) {
        if(zoomBtn) {
            zoomBtn.classList.remove('bg-[#10b981]');
            zoomBtn.classList.add('bg-[#34d399]');
        }
        if(hiddenInfo) { hiddenInfo.classList.add('hidden'); hiddenInfo.classList.remove('flex'); }
        if(revealedInfo) { revealedInfo.classList.remove('hidden'); revealedInfo.classList.add('flex'); }
        
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
    const zoomBtn = document.getElementById('zoom-btn-element');
    const hiddenInfo = document.getElementById('zoom-info-hidden');
    const revealedInfo = document.getElementById('zoom-info-revealed');
    
    if(zoomBtn) {
        zoomBtn.classList.add('bg-[#10b981]');
        zoomBtn.classList.remove('bg-[#34d399]');
    }
    if(hiddenInfo) { hiddenInfo.classList.remove('hidden'); hiddenInfo.classList.add('flex'); }
    if(revealedInfo) { revealedInfo.classList.add('hidden'); revealedInfo.classList.remove('flex'); }
}

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const dbMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const currentMonthStr = d.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
const monthLabel = document.getElementById('current-month-label');
if (monthLabel) monthLabel.innerText = currentMonthStr;

window.scrollToCurrentWeek = () => {
    const container = document.getElementById('meeting-program-list');
    if (!container || container.offsetParent === null) return; 

    let activeCard = container.querySelector('.current-week-marker');
    if (!activeCard) {
        const allCards = Array.from(container.children);
        activeCard = allCards.find(card => !card.classList.contains('grayscale'));
    }
    if (!activeCard && container.children.length > 0) {
        const len = container.children.length;
        activeCard = len > 1 ? container.children[len - 2] : container.lastElementChild;
    }
    if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
};

window.switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('.nav-icon-container').forEach(icon => {
        icon.classList.remove('bg-slate-700', 'text-white', 'shadow-inner');
        icon.classList.add('text-slate-500');
    });
    
    if(!btnElement) btnElement = document.querySelector(`nav button[onclick="switchTab('${tabId}', this)"]`);
    if(btnElement) {
        const icon = btnElement.querySelector('.nav-icon-container');
        if(icon) {
            icon.classList.remove('text-slate-500'); 
            icon.classList.add('bg-slate-700', 'text-white', 'shadow-inner');
        }
    }

    if (tabId === 'tasks') {
        setTimeout(() => {
            if (window.scrollToCurrentWeek) window.scrollToCurrentWeek();
        }, 50);
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

let unsubMessages = null;
window.activeMessageId = null;

function listenForMessages() {
    if (unsubMessages) unsubMessages();
    unsubMessages = onSnapshot(query(collection(db, "user_messages"), where("userId", "==", userId), where("read", "==", false)), (msgSnap) => {
        if (!msgSnap.empty) {
            const msgDoc = msgSnap.docs[0]; 
            window.activeMessageId = msgDoc.id;
            const modal = document.getElementById('user-msg-modal');
            const content = document.getElementById('user-msg-content');
            if(modal && content) {
                content.innerText = msgDoc.data().message;
                modal.classList.replace('hidden', 'flex');
            }
        }
    });
}

window.markMessageRead = async () => {
    if(window.activeMessageId) {
        const btn = document.getElementById('user-msg-close-btn');
        const originalText = btn.innerText;
        btn.innerText = "...";
        btn.disabled = true;
        try {
            await updateDoc(doc(db, "user_messages", window.activeMessageId), { read: true });
            document.getElementById('user-msg-modal').classList.replace('flex', 'hidden');
            window.activeMessageId = null;
        } catch(e) { console.error("Ошибка при пометке сообщения", e); }
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

let isStandReqPending = false;
let myStands = [];
let unsubStandReqs = null;
let unsubStands = null;

if (userId) {
    onSnapshot(doc(db, "users", userId), async (docSnap) => {
        if (!docSnap.exists()) { if (navigator.onLine) window.logout(); return; }
        currentUserData = docSnap.data();

        const pendingScreen = document.getElementById('pending-screen');
        const mainDashboard = document.getElementById('main-dashboard');

        if (currentUserData.status === 'pending') {
            if(pendingScreen) { pendingScreen.classList.remove('hidden'); pendingScreen.classList.add('flex'); }
            if(mainDashboard) { mainDashboard.style.display = 'none'; }
        } else if (currentUserData.status === 'blocked') {
            document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">${window.t('access_denied')}</h1></div>`;
        } else {
            if(pendingScreen) { pendingScreen.classList.add('hidden'); pendingScreen.classList.remove('flex'); }
            if(mainDashboard) { mainDashboard.style.display = 'block'; }
            
            let userRoles = currentUserData.roles || [];
            const pushBtn = document.getElementById('push-btn');
            if (pushBtn && messaging) {
                if (Notification.permission !== 'granted' || !currentUserData.pushToken) { pushBtn.style.display = 'flex'; } 
                else { pushBtn.style.display = 'none'; }
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
            setAdminLink('profile-schedule-btn', hasFullAccess || userRoles.includes("Ответственный за график"));

            const profileAdminLinks = document.getElementById('profile-admin-links');
            if(profileAdminLinks) {
                if(hasFullAccess || userRoles.includes("Ответственный за стенды") || userRoles.includes("Ответственный за график") || userRoles.includes("Надзиратель группы") || userRoles.includes("Ответственный за участки") || userRoles.includes("Ответственный за школу")) { 
                    profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('grid'); 
                } else { 
                    profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('grid'); 
                }
            }

            try { loadPersonalData(); } catch(e) {}
            try { loadProfileData(); } catch(e) {}
            renderStandCard();
            listenForMessages(); 
            
            if(!document.querySelector('.tab-content.active')) {
                window.switchTab('home');
            }
        }
    });
}

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
            let iconHtml = ""; 

            if(r === "Старейшина") colorClass = "bg-amber-100 text-amber-700 border border-amber-200";
            else if(r === "Помощник собрания") colorClass = "bg-sky-100 text-sky-700 border border-sky-200";
            else if(r === "Пионер") colorClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
            else if(r === "Админ" || r === "Владелец") colorClass = "bg-rose-100 text-rose-700 border border-rose-200";
            else if(r === "Ответственный за график") colorClass = "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200";
            else if(r === "Надзиратель группы") colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
            else if(r === "Ответственный за участки") colorClass = "bg-teal-100 text-teal-700 border border-teal-200";
            else if(r === "Ответственный за школу") colorClass = "bg-indigo-100 text-indigo-700 border border-indigo-200";
            else if(r === "Ответственный за стенды") colorClass = "bg-blue-100 text-blue-700 border border-blue-200";
            else if(r === "Служение со стендом") {
                colorClass = "bg-indigo-100 text-indigo-700 border-indigo-200";
                iconHtml = `<svg class="w-3 h-3 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 4h10v14H7V4zM10 8h4M10 12h4" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M10 21v-3m4 3v-3" /></svg>`;
            }

            // Скрываем только "Участник школы", так как это есть у всех и просто засоряет интерфейс
            if(r === "Участник школы") return '';
            
            return `<span class="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${colorClass}">${iconHtml}${r}</span>`;
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
        contentHtml = `<div class="w-full h-24 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-md mt-3 shadow-sm"><svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>`;
    }

    container.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden p-4 w-full shadow-sm">
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

function getISOWeekString(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function weekToDateString(weekId) {
    if(!weekId) return "";
    const [year, weekStr] = weekId.split('-W');
    const w = parseInt(weekStr, 10);
    const y = parseInt(year, 10);
    const simpleDate = new Date(y, 0, 1 + (w - 1) * 7);
    const day = simpleDate.getDay();
    const diff = simpleDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(simpleDate.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const m1 = window.t('months') ? window.t('months')[monday.getMonth()] : monday.getMonth()+1;
    const m2 = window.t('months') ? window.t('months')[sunday.getMonth()] : sunday.getMonth()+1;

    if (monday.getMonth() === sunday.getMonth()) {
        return `${monday.getDate()} - ${sunday.getDate()} ${m1}`;
    } else {
        return `${monday.getDate()} ${m1} - ${sunday.getDate()} ${m2}`;
    }
}

function buildScheduleCards(d, myName, currentWeekStr) {
    const weekLabel = weekToDateString(d.realWeekId || d.weekId);
    const isCurrentWeek = (d.realWeekId || d.weekId.split('-')[0]+'-'+d.weekId.split('-')[1]) === currentWeekStr;
    const isPastWeek = (d.realWeekId || d.weekId.split('-')[0]+'-'+d.weekId.split('-')[1]) < currentWeekStr;
    
    // Статусы и цвета
    const weekStatus = isCurrentWeek ? window.t('current_week') : (isPastWeek ? "ПРОШЛАЯ" : window.t('future_week'));
    const statusColor = isCurrentWeek ? 'text-emerald-600' : (isPastWeek ? 'text-slate-400' : 'text-slate-500');
    const pastCardClass = isPastWeek ? 'opacity-50 grayscale' : '';
    
    let partCounter = 1;

    // ИКОНКА "i" (ВЫЗЫВАЕТСЯ ТОЛЬКО ДЛЯ ШКОЛЫ СЛУЖЕНИЯ)
    const getInfoIcon = (infoHtml) => {
        const safeHtml = infoHtml.replace(/"/g, '&quot;');
        return `
            <div class="shrink-0 ml-2 p-1.5" data-info="${safeHtml}" onclick="openTaskInfoModal(this.getAttribute('data-info'))" title="Информация">
                <svg class="w-4 h-4 text-slate-400 hover:text-indigo-500 transition-colors pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        `;
    };

    const row = (title, person) => {
        if(!person && !title) return '';
        const isMe = person === myName;
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';

        return `
            <div class="flex flex-col py-1 px-2 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${partCounter++}. ${translateDbString(title)}</span>
                <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${person || '-'}</span>
            </div>
        `;
    };

    const rowUnnumbered = (title, person) => {
        if(!person && !title) return '';
        const isMe = person === myName;
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';

        return `
            <div class="flex flex-col py-1 px-2 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${translateDbString(title)}</span>
                <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${person || '-'}</span>
            </div>
        `;
    };

    const treasure1Me = d.mw_treasure_name === myName;
    const t1TitleColor = treasure1Me ? 'font-black text-black' : 'font-bold text-slate-800';
    const t1NameColor = treasure1Me ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const t1Title = translateDbString(d.mw_treasure_title || window.t('talk_10_min'));
    
    const treasure1 = `
        <div class="flex flex-col py-1 px-2 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
            <span class="text-[13px] md:text-sm ${t1TitleColor} leading-tight">${partCounter++}. ${t1Title}</span>
            <span class="text-[13px] md:text-sm ${t1NameColor} mt-0.5 ml-4">${d.mw_treasure_name || '-'}</span>
        </div>
    `;

    const treasure2 = row(window.t('spiritual_gems'), d.mw_gems_name);
    const treasure3 = row(window.t('bible_reading'), d.mw_reading_name);

    const minRowsRaw = (d.ministryParts || []).map((m) => {
        if(!m.student && !m.assistant && !m.type) return '';
        const isMe = (m.student === myName || m.assistant === myName);
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
        const assistStr = m.assistant ? ` <span class="opacity-70 ml-1">(${window.t('assistant_short')} ${m.assistant})</span>` : '';
        const translatedType = translateDbString(m.type || window.t('part'));
        
        let description = "";
        
        if (m.type === "Чтение Библии" || m.type === "Čtení Bible") {
            description = currentLang === 'ru'
                ? "Это учебное задание назначается учащемуся мужского пола. Учащийся зачитывает назначенный отрывок. Вступление и заключение не требуются. Цель председателя встречи — помочь учащимся читать грамотно, бегло, в естественной манере, с пониманием, правильной интонацией, паузами и правильно делать смысловое ударение. Поскольку библейские отрывки могут быть разной длины, при назначении этого задание руководителю встречи нужно учитывать способности учащегося. <div class='mt-2 font-bold'>Указания для встречи «Наша христианская жизнь и служение»</div>"
                : "CZ";
        } else if (m.type === "Начинайте разговор" || m.type === "Zahájení rozhovoru") {
            description = currentLang === 'ru' 
                ? "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим или членом его семьи. Участники могут сидеть или стоять. (Больше о содержании и ситуации в этом задании смотрите в абзацах 12 и 13.) <div class='mt-2 font-bold'>Указания для встречи «Наша христианская жизнь и служение»</div>"
                : "CZ";
        } else if (m.type === "Развивайте интерес" || m.type === "Rozvíjení zájmu") {
            description = currentLang === 'ru'
                ? "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим (km 5/97 7). Участники могут сидеть или стоять. Учащемуся необходимо продемонстрировать, как продолжить предыдущую беседу. (Больше о содержании и ситуации в этом задании смотрите в абзацах 12 и 13.) <div class='mt-2 font-bold'>Указания для встречи «Наша христианская жизнь и служение»</div>"
                : "CZ";
        } else if (m.type === "Подготавливайте учеников" || m.type === "Pomáhej lidem stát se učedníky" || m.type === "Činění učedníků") {
            description = currentLang === 'ru'
                ? "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим (km 5/97 7). Участники могут сидеть или стоять. Если демонстрируется часть изучения, которое уже проводится, нет необходимости делать вступление или заключение, за исключением случаев, когда учащийся работает над соответствующими уроками. Необязательно зачитывать весь рассматриваемый материал, хотя это и допускается. <div class='mt-2 font-bold'>Указания для встречи «Наша христианская жизнь и служение»</div>"
                : "CZ";
        } else if (m.type === "Объясняйте свои взгляды" || m.type === "Vysvětlování své víry") {
            description = currentLang === 'ru'
                ? "Если это задание преподносится в виде речи, оно поручается учащемуся мужского пола. Если задание преподносится в виде демонстрации, оно назначается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим или членом его семьи. Учащемуся нужно ясно и тактично ответить на вопрос по теме, используя информацию из ссылки к заданию. Учащийся может сам решить, будет ли он ссылаться на указанную публикацию. <div class='mt-2 font-bold'>Указания для встречи «Наша христианская жизнь и служение»</div>"
                : "CZ";
        } else if (m.type === "Речь" || m.type === "Proslov" || m.type === "Речь 10 мин." || m.type === "Proslov 10 min.") {
            description = currentLang === 'ru'
                ? "Это учебное задание поручается учащемуся мужского пола и преподносится в виде речи, обращённой к собранию. Если речь основана на пунктах из Приложения А брошюры «Любите людей», учащемуся нужно показать, как использовать данные стихи в служении. Например, он может объяснить в каких случаях можно использовать стих, значение стиха и то, как с помощью данного стиха можно рассуждать с человеком. Если речь основана на пункте одного из уроков брошюры «Любите людей», учащемуся нужно обратить внимание на то, как применить этот пункт в служении. Он может обсудить пример, который приводится в первом пункте урока или, если это поможет, использовать любой из дополнительных стихов, приведённых в уроке. <div class='mt-2 font-bold'>Указания для встречи «Наша христианская жизнь и служение»</div>"
                : "CZ";
        }

        const descHtml = description ? `<div class="mt-4 pt-3 border-t border-slate-100"><div class="text-[11px] font-medium text-slate-500 leading-relaxed">${description}</div></div>` : "";

        const extraInfo = m.lesson 
            ? `<span class="font-black text-slate-800 block mb-3 text-base">${translatedType}</span><span class="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 self-start inline-block">${window.t('lesson')} ${m.lesson}</span>${descHtml}` 
            : `<span class="font-black text-slate-800 text-base">${translatedType}</span>${descHtml}`;

        const safeHtml = extraInfo.replace(/"/g, '&quot;');

        return `
            <div data-info="${safeHtml}" onclick="openTaskInfoModal(this.getAttribute('data-info'))" style="-webkit-tap-highlight-color: transparent;" class="flex items-center justify-between py-2.5 px-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group">
                <div class="flex flex-col min-w-0 pointer-events-none">
                    <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${partCounter++}. ${translatedType}</span>
                    <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${m.student || '-'}${assistStr}</span>
                </div>
                <div class="shrink-0 ml-3 text-slate-300 group-hover:text-indigo-400 transition-colors pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        `;
    }).join('');

    const minRows = minRowsRaw ? `
        <div class="flex flex-col bg-white rounded-xl mt-1.5 mb-2 mx-1 overflow-hidden shadow-sm border border-slate-200/80">
            ${minRowsRaw}
        </div>
    ` : '';

    const livRows = (d.livingParts || []).map((m) => {
        if(!m.title && !m.name) return '';
        return row(m.title, m.name);
    }).join('');

    const cbsNum = partCounter++;
    const isCbsMe = (d.mw_cbs_conductor === myName || d.mw_cbs_reader === myName);
    const cbsTitleColor = isCbsMe ? 'font-black text-black' : 'font-bold text-slate-800';
    const cbsNameColor = isCbsMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const readStr = d.mw_cbs_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.mw_cbs_reader})</span>` : '';

    const cbsRow = `
        <div class="flex flex-col py-1 px-2 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
            <span class="text-[13px] md:text-sm ${cbsTitleColor} leading-tight">${cbsNum}. ${window.t('congregation_bible_study')} ${d.mw_cbs_material ? `<span class="text-xs font-normal text-slate-500 ml-1">(${d.mw_cbs_material})</span>` : ''}</span>
            <span class="text-[13px] md:text-sm ${cbsNameColor} mt-0.5 ml-4">${d.mw_cbs_conductor || '-'}${readStr}</span>
        </div>
    `;

    const weTalkMe = d.we_talk_speaker === myName;
    const wtTitleColor = weTalkMe ? 'font-black text-black' : 'font-bold text-slate-800';
    const wtNameColor = weTalkMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const talkTitle = translateDbString(d.we_talk_title || window.t('public_talk'));

    const we_talk = `
        <div class="flex flex-col py-1.5 px-3 bg-white/60 hover:bg-white active:bg-white border border-slate-200/50 shadow-sm transition-colors rounded-xl mt-1.5 mb-1 mx-1">
            <span class="text-[13px] md:text-sm ${wtTitleColor} uppercase leading-tight">${talkTitle}</span>
            <span class="text-[13px] md:text-sm ${wtNameColor} mt-0.5 ml-4">${d.we_talk_speaker || '-'}</span>
        </div>
    `;

    const isWtMe = (d.we_wt_conductor === myName || d.we_wt_reader === myName);
    const wtStudyTitleColor = isWtMe ? 'font-black text-black' : 'font-bold text-slate-800';
    const wtStudyNameColor = isWtMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const we_wt_read_str = d.we_wt_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.we_wt_reader})</span>` : '';

    const wtStudyRow = `
        <div class="flex flex-col py-1 px-2 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg mt-1.5">
            <span class="text-[13px] md:text-sm ${wtStudyTitleColor} leading-tight">${window.t('watchtower_study')}</span>
            <span class="text-[13px] md:text-sm ${wtStudyNameColor} mt-0.5 ml-4">${d.we_wt_conductor || '-'}${we_wt_read_str}</span>
        </div>
    `;

    // === ВЫВОДИМ РАСПОРЯДИТЕЛЕЙ И ЗВУК ВНИЗУ КАРТОЧКИ ===
    const attendantsArr = [d.duty_attendant_1, d.duty_attendant_2].filter(Boolean);
    const soundsArr = [d.duty_sound_1, d.duty_sound_2].filter(Boolean);
    let dutiesBlock = '';

    if (attendantsArr.length > 0 || soundsArr.length > 0) {
        dutiesBlock = `
            <div class="mt-3 grid grid-cols-2 gap-2 text-center bg-slate-200/60 rounded-xl p-2.5 mx-2 mb-2">
                ${attendantsArr.length > 0 ? `
                <div class="flex flex-col items-center justify-center">
                    <span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Распорядители</span>
                    <span class="text-[10px] md:text-xs font-bold text-slate-800 leading-tight mt-0.5">${attendantsArr.join('<br>')}</span>
                </div>` : '<div></div>'}
                
                ${soundsArr.length > 0 ? `
                <div class="flex flex-col items-center justify-center border-l border-slate-300">
                    <span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">Звук / Видео</span>
                    <span class="text-[10px] md:text-xs font-bold text-slate-800 leading-tight mt-0.5">${soundsArr.join('<br>')}</span>
                </div>` : '<div></div>'}
            </div>
        `;
    }

    return `
        <div class="w-[88vw] md:w-[calc(50%-0.75rem)] shrink-0 snap-center flex flex-col bg-transparent pb-2 px-1 ${pastCardClass} ${isCurrentWeek ? 'current-week-marker' : ''}">
            <div class="flex flex-col gap-1 pb-2 mb-1.5 mx-2 border-b border-slate-300">
                <div class="flex items-center justify-between w-full">
                    <span class="text-base md:text-lg font-black text-black uppercase tracking-widest">${weekLabel}</span>
                    <span class="text-xs md:text-sm font-black ${statusColor} uppercase tracking-widest">${weekStatus}</span>
                </div>
            </div>
            
            <div class="flex-grow flex flex-col space-y-0">
                ${rowUnnumbered(window.t('chairman'), d.mw_chairman_name)}

                <div class="bg-[#0d9488] text-white py-1 px-3 mt-1.5 mb-0.5 flex items-center rounded-lg shadow-sm w-full">
                    <span class="text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">${window.t('treasures_title')}</span>
                </div>
                ${treasure1}
                ${treasure2}
                ${treasure3}

                <div class="bg-[#d97706] text-white py-1 px-3 mt-1.5 mb-0.5 flex items-center rounded-lg shadow-sm w-full">
                    <span class="text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">${window.t('ministry_skills')}</span>
                </div>
                
                ${minRows}

                <div class="bg-[#b91c1c] text-white py-1 px-3 mt-1.5 mb-0.5 flex items-center rounded-lg shadow-sm w-full">
                    <span class="text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">${window.t('christian_living')}</span>
                </div>
                ${livRows}
                ${cbsRow}

                ${rowUnnumbered(window.t('closing_prayer'), d.mw_prayer_name)}
            </div>
            ${dutiesBlock}
        </div>

        <div class="w-[88vw] md:w-[calc(50%-0.75rem)] shrink-0 snap-center flex flex-col bg-transparent pb-2 px-1 ${pastCardClass}">
            <div class="flex flex-col gap-1 pb-2 mb-1.5 mx-2 border-b border-slate-300">
                <div class="flex items-center justify-between w-full">
                    <span class="text-base md:text-lg font-black text-black uppercase tracking-widest">${weekLabel}</span>
                    <span class="text-xs md:text-sm font-black ${statusColor} uppercase tracking-widest">${weekStatus}</span>
                </div>
            </div>

            <div class="flex-grow flex flex-col space-y-0">
                <div class="bg-[#475569] text-white py-1 px-3 mt-0 mb-0.5 flex items-center rounded-lg shadow-sm w-full">
                    <span class="text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">${window.t('weekend_meeting')}</span>
                </div>
                
                ${rowUnnumbered(window.t('opening_song'), d.we_opening_name)}
                
                ${we_talk}
                ${wtStudyRow}

                ${rowUnnumbered(window.t('closing_prayer'), d.we_prayer_name)}
            </div>
            ${dutiesBlock}
        </div>
    `;
}

let userMapInstance = null;
let userPolygonLayer = null;


window.addEventListener('popstate', (event) => {
    const modal = document.getElementById('terr-map-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.replace('flex', 'hidden');
    }
});


function loadPersonalData() {
    try {
        onSnapshot(collection(db, "territory_maps"), (mapSnap) => {
            window.allMapsCache = {};
            mapSnap.forEach(d => { 
                window.allMapsCache[d.id] = { 
                    url: d.data().url, 
                    imageUrl: d.data().imageUrl,
                    city: d.data().city || 'Без города',
                    polygon: d.data().polygon || null
                }; 
            });
        });
    } catch(e) {}

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
        onSnapshot(query(collection(db, "meeting_schedules"), where("isPublished", "==", true)), (snapshot) => {
            const container = document.getElementById('meeting-program-list');
            if(!container) return;

            let schedulesMap = {};
            snapshot.forEach(doc => {
                let id = doc.id;
                let data = doc.data();
                data.id = id;
                
                let isLegacy = /^\d{4}-W\d{2}$/.test(id);
                let realWeekId = isLegacy ? id : (id.length > 8 ? id.substring(0, 8) : id);
                data.realWeekId = realWeekId;

                if (id.endsWith('-' + currentLang)) {
                    schedulesMap[realWeekId] = data; 
                } else if (isLegacy && currentLang === 'ru') {
                    if (!schedulesMap[realWeekId]) {
                        schedulesMap[realWeekId] = data; 
                    }
                }
            });
            
            let schedules = Object.values(schedulesMap);
            schedules.sort((a,b) => a.realWeekId.localeCompare(b.realWeekId));

            const currentWeekStr = getISOWeekString(new Date()); 
            
            let html = '';
            schedules.forEach(s => {
                html += buildScheduleCards(s, currentUserData.name, currentWeekStr);
            });

            container.innerHTML = html || `<p class="text-slate-400 text-sm italic text-center py-4 w-full">${window.t('no_schedule')}</p>`;
            
            setTimeout(() => {
                if (window.scrollToCurrentWeek) window.scrollToCurrentWeek();
            }, 300);
        });
    } catch(e) { console.error(e); }

    window.openDutiesModal = () => document.getElementById('duties-modal').classList.replace('hidden', 'flex');

    try {
        const dutiesQuery = query(collection(db, "duties"), orderBy("rawDate", "asc"));
        onSnapshot(dutiesQuery, (snapshot) => {
            const container = document.getElementById('dashboard-duties');
            const fullListContainer = document.getElementById('duties-full-list');
            if (!container) return;
            const today = new Date(); today.setHours(0,0,0,0);
            let currentDuty = null;
            let myDutyFound = false;

            let fullListHtml = '';

            snapshot.forEach(docSnap => {
                const d = docSnap.data();
                
                if (!d.rawDate) return;
                
                // Железобетонный парсинг даты
                const [ry, rm, rd] = d.rawDate.split('-');
                const dutyStart = new Date(ry, rm - 1, rd, 0, 0, 0);
                
                const dutyEnd = new Date(dutyStart); 
                dutyEnd.setDate(dutyStart.getDate() + 6); 
                dutyEnd.setHours(23,59,59,999);
                
                const startDay = dutyStart.getDate();
                const endDay = dutyEnd.getDate();
                const endMonth = dutyEnd.toLocaleDateString(localeFormat, { month: 'long' });
                let dateRangeStr = `${startDay} - ${endDay} ${endMonth}`;
                if (dutyStart.getMonth() !== dutyEnd.getMonth()) {
                    const startMonth = dutyStart.toLocaleDateString(localeFormat, { month: 'short' });
                    dateRangeStr = `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
                }

                let typeStr = d.type;
                if (typeStr === 'Уборка зала' || typeStr === '🧹 Уборка зала') typeStr = window.t('opt_cleaning').replace('🧹 ','');
                if (typeStr === 'Специальное событие' || typeStr === '⭐ Специальное событие') typeStr = window.t('opt_special_event').replace('⭐ ','');
                const groupStr = d.group === "Все" || d.group === window.t('all_groups') ? window.t('all_groups') : d.group;

                const myGroup = currentUserData ? currentUserData.group : window.t('no_group');
                const isMyGroup = String(d.group) === String(myGroup);

                let textClass = isMyGroup ? "text-slate-900 font-black" : "text-slate-600";
                let badgeClass = isMyGroup ? "bg-slate-800 text-white shadow-sm" : "bg-slate-100 text-slate-500 border border-slate-200";

                fullListHtml += `
                    <div class="py-3 border-b border-slate-100 flex justify-between items-center last:border-0">
                        <div class="flex flex-col">
                            <span class="text-sm ${textClass}">${typeStr}</span>
                            <span class="text-[10px] font-bold uppercase tracking-widest opacity-80 ${textClass}">${dateRangeStr}</span>
                        </div>
                        <div class="flex flex-col items-center justify-center px-3 py-1 rounded-md ${badgeClass}">
                            <span class="text-[8px] uppercase font-bold tracking-widest">${window.t('group_short')}</span>
                            <span class="text-base font-black leading-none">${groupStr}</span>
                        </div>
                    </div>
                `;

                if (today.getTime() >= dutyStart.getTime() && today.getTime() <= dutyEnd.getTime()) {
                    currentDuty = d;
                    if (isMyGroup) myDutyFound = true;
                }
            });

            if(fullListContainer) fullListContainer.innerHTML = fullListHtml || `<p class="text-slate-400 italic text-sm text-center">График пуст</p>`;

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
                if (typeStr === 'Уборка зала' || typeStr === '🧹 Уборка зала') typeStr = window.t('opt_cleaning').replace('🧹 ','');
                if (typeStr === 'Специальное событие' || typeStr === '⭐ Специальное событие') typeStr = window.t('opt_special_event').replace('⭐ ','');
                const groupStr = currentDuty.group === "Все" || currentDuty.group === window.t('all_groups') ? window.t('all_groups') : currentDuty.group;

                const [ry, rm, rd] = currentDuty.rawDate.split('-');
                const dutyStart = new Date(ry, rm - 1, rd, 0, 0, 0);
                
                const dutyEnd = new Date(dutyStart); 
                dutyEnd.setDate(dutyStart.getDate() + 6);
                
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
                        <div class="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-lg border ${badgeClass} shrink-0 bg-slate-50 shadow-inner">
                            <span class="text-[7px] md:text-[8px] uppercase font-bold text-slate-400 leading-none mb-0.5 tracking-widest">${window.t('group_short')}</span>
                            <span class="text-lg md:text-xl font-black leading-none">${groupStr}</span>
                        </div>
                        <div class="flex flex-col justify-center min-w-0 flex-grow pr-2">
                            <span class="text-xs md:text-sm font-black text-slate-800 leading-tight truncate w-full">${typeStr}</span>
                            <span class="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-1 truncate w-full">${localizedDateRange}</span>
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

                const mapData = window.allMapsCache[String(terr.number)];
                const hasPolygon = mapData && mapData.polygon;
                const cityStr = mapData && mapData.city && mapData.city !== "Без города" ? `<span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-1">${mapData.city}</span>` : '';

 let mapBtn = '';
                if (hasPolygon) {
                    // НОВАЯ КНОПКА: Перебрасывает на общую карту и центрируется на участке
                    mapBtn = `<button onclick="focusOnTerritoryOnMap('${terr.number}')" class="w-full mt-3 bg-slate-50 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-colors outline-none shadow-sm flex items-center justify-center gap-2 border border-slate-200">Показать на карте <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>`;
                } else if (mapData && mapData.url) {
                    // СТАРАЯ КНОПКА: Остается как есть, если это просто ссылка на сторонний сайт
                    mapBtn = `<button onclick="window.open('${mapData.url}', '_blank')" class="w-full mt-3 bg-slate-50 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-colors outline-none shadow-sm flex items-center justify-center gap-2 border border-slate-200"><svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg> Открыть ссылку</button>`;
                }

                html += `
                    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="font-black text-slate-800 text-lg md:text-xl">${window.t('territory_num')} ${terr.number}</h3>
                                ${cityStr}
                            </div>
                            <button onclick="markTerritoryReturned('${docSnap.id}')" class="text-[9px] font-bold text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-md uppercase transition-colors outline-none shadow-sm">${window.t('return_terr_btn')}</button>
                        </div>
                        
                        <div class="mt-2 flex items-center gap-3">
                            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                                <div class="${barColor} h-1.5 rounded-full transition-all" style="width: ${progress}%"></div>
                            </div>
                            <span class="${textColor} text-[10px] font-black uppercase tracking-widest shrink-0 leading-none">${diffDays} ${window.t('days_short')}</span>
                        </div>
                        
                        ${mapBtn}
                    </div>
                `;
            });
            if (activeCount === 0) container.innerHTML = `<p class="text-slate-400 text-sm italic py-4 text-center border border-slate-200 rounded-xl w-full">${window.t('no_active_territories')}</p>`;
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
                        <div style="border-radius: 0px !important;" class="p-4 border ${opacityClass} mb-3 relative overflow-hidden transition-all flex flex-col justify-between min-h-[90px]">
                            <div class="flex items-center gap-3 w-full">
                                <div style="border-radius: 0px !important;" class="flex flex-col items-center justify-center w-12 h-12 ${isPast ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-sky-50 border-sky-100 text-sky-500'} border shrink-0">
                                    <span class="text-[8px] uppercase font-bold leading-none mb-0.5 tracking-widest">${taskDate.toLocaleDateString(localeFormat, { month: 'short' }).replace('.', '')}</span>
                                    <span class="text-xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-sky-700'}">${taskDate.getDate()}</span>
                                </div>
                                <div class="min-w-0 flex flex-col justify-center gap-1 w-full flex-1">
                                    <h3 class="font-black text-slate-800 text-sm leading-tight truncate w-full">${roleText}</h3>
                                    <div class="flex items-center justify-between gap-2 w-full mt-1">
                                        <div class="flex items-center gap-1.5 min-w-0 w-full truncate">
                                            <span class="font-black ${isPast ? 'text-slate-500' : 'text-sky-700'} text-[10px] md:text-xs uppercase tracking-wide leading-tight truncate">${catStr}</span>
                                        </div>
                                        <span style="border-radius: 0px !important;" class="text-[9px] font-bold text-emerald-700 bg-emerald-100 border-none px-2 py-0.5 shadow-none shrink-0 whitespace-nowrap">${window.t('lesson')} ${task.lesson}</span>
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
            if (upCount === 0) upList.innerHTML = `<p class="text-slate-400 text-sm italic py-2 text-center border border-slate-200 rounded-xl">${window.t('no_tasks_upcoming')}</p>`;
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

            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                ev.id = docSnap.id;
                
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

                    ev.isPastEvent = isPastEvent;
                    ev.displayTime = displayTime;
                    todayEvents.push(ev);
                }
            });

            todayEvents.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

            let html = '';
            const wrapper = container.parentElement;
            const calendarBtn = wrapper.querySelector('button');

            if (todayEvents.length > 0) {
                wrapper.classList.remove('bg-slate-200/80');
                wrapper.classList.add('bg-[#0f172a]'); 
                if (calendarBtn) {
                    calendarBtn.classList.remove('text-slate-500', 'hover:bg-slate-300/50', 'border-l', 'border-slate-800/50', 'border-slate-700/50', 'border-slate-800');
                    calendarBtn.classList.add('text-slate-400', 'hover:bg-slate-800/50');
                }

      todayEvents.forEach(ev => {
                    let evGroup = ev.group || window.t('no_group');
                    if (evGroup === "Все" || evGroup === "Všechny") evGroup = window.t('all_groups');
                    const hasGroup = evGroup !== window.t('no_group');
                    
                    const activeClass = ev.isPastEvent ? "opacity-30 grayscale" : "";
                    const timeColor = ev.isPastEvent ? "text-slate-500" : "text-emerald-400"; 
                    const titleColor = ev.isPastEvent ? "text-slate-500" : "text-white";
                    
                    const dateObj = new Date(ev.date);
                    const dayNum = dateObj.getDate();
                    
                    const leaderHtml = ev.leader ? `<span class="text-[10px] md:text-xs font-bold mt-1 flex items-center gap-1.5 truncate"><span class="text-slate-500 uppercase tracking-widest text-[8px]">${window.t('leader_short')}</span> <span class="text-indigo-300 truncate">${ev.leader}</span></span>` : '';
                    
                    html += `
                        <div class="flex items-center px-4 py-3 w-full bg-transparent cursor-default ${activeClass}">
                            <div class="flex items-center gap-2 shrink-0 mr-3">
                                <div class="flex flex-col items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-white/10 text-white rounded-xl shrink-0 shadow-inner">
                                    <span class="text-[7px] md:text-[8px] uppercase font-bold leading-none mb-0.5 tracking-widest opacity-70">${window.t('today_badge')}</span>
                                    <span class="text-xl font-black leading-none">${dayNum}</span>
                                </div>
                                ${hasGroup ? `
                                <div class="flex flex-col items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-white/10 text-white rounded-xl shrink-0 shadow-inner">
                                    <span class="text-[7px] md:text-[8px] uppercase font-bold leading-none mb-0.5 tracking-widest opacity-70">${window.t('group_short')}</span>
                                    <span class="text-sm md:text-base font-black leading-none">${evGroup}</span>
                                </div>` : ''}
                            </div>
                            <div class="flex flex-col flex-grow min-w-0 pr-2 justify-center">
                                <div class="flex items-start gap-2">
                                    ${ev.displayTime ? `<span class="text-sm md:text-base font-black shrink-0 mt-0.5 ${timeColor}">${ev.displayTime}</span>` : ''}
                                    <span class="font-bold text-sm md:text-base ${titleColor} whitespace-normal leading-tight break-words">${ev.title} ${ev.isSpecial ? '⭐' : ''}</span>
                                </div>
                                ${leaderHtml}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            } else {
                wrapper.classList.remove('bg-[#0f172a]', 'bg-ui-nav');
                wrapper.classList.add('bg-slate-200/80'); 
                if (calendarBtn) {
                    calendarBtn.classList.remove('text-slate-400', 'hover:bg-slate-800/50', 'border-l', 'border-slate-700/50', 'border-slate-800');
                    calendarBtn.classList.add('text-slate-500', 'hover:bg-slate-300/50');
                }
                container.innerHTML = `<p class="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">${window.t('no_events_today')}</p>`;
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
                        const dateStr = new Date(item.createdAt).toLocaleDateString(localeFormat, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                        const deleteBtn = isNewsAdmin ? `<button onclick="deleteNews('${docSnap.id}')" class="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md transition-colors outline-none flex items-center justify-center shrink-0"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>` : '';
                        
                        let displayText = ''; let shouldShow = false;
                        const hasRu = !!item.text_ru; const hasCs = !!item.text_cs;
                        const hasLegacyText = !!item.text && !hasRu && !hasCs; 
                        const hasImg = !!item.imageUrl;

                        if (hasLegacyText) { displayText = item.text; shouldShow = true; } 
                        else if (currentLang === 'ru') { if (hasRu) { displayText = item.text_ru; shouldShow = true; } else if (!hasRu && !hasCs && hasImg) { shouldShow = true; } } 
                        else if (currentLang === 'cs') { if (hasCs) { displayText = item.text_cs; shouldShow = true; } else if (!hasRu && !hasCs && hasImg) { shouldShow = true; } }

                        if (!shouldShow) return; 

                        const bgCardClass = isNew ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 opacity-95 border-slate-200";
                        const newBadge = isNew ? `<span class="absolute top-2 left-2 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm z-10">${window.t('new_badge')}</span>` : '';

                        let contentHtml = '';
                        if (!displayText && !item.imageUrl) {
                            contentHtml = `<div class="flex flex-col items-center justify-center flex-grow py-6 text-slate-300"><svg class="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span class="text-[10px] font-black uppercase tracking-widest opacity-50">${window.t('no_translation')}</span></div>`;
                        } else {
                            const imgHtml = item.imageUrl ? `<img src="${item.imageUrl}" class="w-full h-32 object-cover rounded-lg mb-3 shrink-0 cursor-pointer" onclick="window.open('${item.imageUrl}', '_blank')">` : '';
                            const textHtml = displayText ? `<p class="text-sm font-bold text-slate-800 mb-3 whitespace-pre-wrap flex-grow">${displayText}</p>` : '';
                            contentHtml = textHtml + imgHtml;
                        }

                        newsHTML += `
                            <div class="w-[240px] shrink-0 snap-center rounded-xl border transition-all flex flex-col overflow-hidden relative p-4 ${bgCardClass} min-h-[160px]">
                                ${newBadge}
                                ${contentHtml}
                                <div class="flex justify-between items-center mt-auto pt-2 border-t border-slate-100">
                                    <span class="text-[9px] text-slate-400 font-bold">${dateStr}</span>
                                    ${deleteBtn}
                                </div>
                            </div>
                        `;
                        if (isNew && !sessionStorage.getItem('news_toast_' + docSnap.id)) { window.showToast(window.t('new_announcement_toast'), 'info'); sessionStorage.setItem('news_toast_' + docSnap.id, 'true'); }
                    }
                }
            });

            if (isNewsAdmin) {
                let textAreaHtml = '';
                if (currentLang === 'ru') textAreaHtml = `<textarea id="news-input-ru" rows="2" placeholder="${window.t('write_text_ru')}" class="w-full bg-transparent border-0 p-2 text-sm outline-none resize-none font-medium text-slate-700 flex-grow custom-scrollbar mb-1"></textarea>`;
                else textAreaHtml = `<textarea id="news-input-cs" rows="2" placeholder="${window.t('write_text_cs')}" class="w-full bg-transparent border-0 p-2 text-sm outline-none resize-none font-medium text-slate-700 flex-grow custom-scrollbar mb-1"></textarea>`;

                newsHTML += `
                    <div class="w-[240px] shrink-0 snap-center p-4 rounded-xl border border-dashed border-slate-400 bg-slate-100/50 flex flex-col relative min-h-[160px]">
                        <p class="p-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center flex items-center justify-center gap-1 shrink-0 border-b border-slate-200 pb-2 mb-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            ${window.t('create_announcement')}
                        </p>
                        ${textAreaHtml}
                        <div id="image-preview-container" class="hidden relative w-full shrink-0 mb-2 mt-2">
                            <img id="image-preview" src="" class="h-16 w-full object-cover rounded-lg border border-slate-200">
                            <button onclick="removeImage()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center outline-none shadow-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div class="flex items-center justify-between gap-2 shrink-0 mt-auto pt-2 border-t border-slate-200">
                            <label class="cursor-pointer bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 rounded-md transition-colors flex items-center justify-center w-10 h-8 shrink-0 shadow-sm"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg><input type="file" id="news-image" accept="image/*" class="hidden" onchange="previewImage(this)"></label>
                            <button onclick="publishNews()" id="publish-news-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-4 rounded-md flex-grow transition-colors h-8 outline-none shadow-sm uppercase tracking-widest">${window.t('publish')}</button>
                        </div>
                    </div>
                `;
            }

           const contentNews = document.getElementById('content-news');
            if(contentNews) contentNews.innerHTML = newsHTML || `<div class="w-full h-32 shrink-0 p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mx-4 md:mx-0 shadow-sm"><p class="text-slate-400 italic text-sm text-center">${window.t('no_news')}</p></div>`;
        });
    } catch(e) {}
}

window.availableTerritoriesData = [];
window.currentTerrCityFilter = 'all';
window.showRecommendedTerrOnly = false;

window.openTakeTerrModal = async () => {
    document.getElementById('take-terr-modal').classList.replace('hidden', 'flex');
    const listContainer = document.getElementById('available-terr-list');
    listContainer.innerHTML = `<p class="text-xs italic text-slate-400 text-center py-4 font-bold uppercase tracking-widest animate-pulse">${window.t('loading')}</p>`;
    
    window.isAvailableMapView = true;
    document.getElementById('available-terr-map-container')?.classList.remove('hidden');
    listContainer.classList.add('hidden');

    try {
        const activeSnap = await getDocs(query(collection(db, "territories"), where("status", "==", "active")));
        const activeNumbers = [];
        activeSnap.forEach(doc => activeNumbers.push(Number(doc.data().number)));
        
        window.activeTerritoriesCount = activeNumbers.length;

        const returnedSnap = await getDocs(query(collection(db, "territories"), where("status", "==", "returned")));
        const lastWorkedMap = {};
        returnedSnap.forEach(doc => {
            const d = doc.data();
            if(d.returnedAt) {
                const dDate = new Date(d.returnedAt).getTime();
                if(!lastWorkedMap[d.number] || lastWorkedMap[d.number] < dDate) {
                    lastWorkedMap[d.number] = dDate;
                }
            }
        });

        window.availableTerritoriesData = []; 
        window.allMapPolygons = []; 
        window.cooldownTerritoriesCount = 0;

        const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        let hasAnyPolygon = false; 

        Object.keys(window.allMapsCache).forEach(numStr => {
            const num = Number(numStr);
            const mapData = window.allMapsCache[numStr];
            let lastW = lastWorkedMap[num] || 0; 
            
            let status = 'available';
            let isFire = false;

            if (activeNumbers.includes(num)) {
                status = 'active';
            } else if (lastW > 0 && (now - lastW) < ninetyDaysMs) {
                status = 'cooldown';
                window.cooldownTerritoriesCount++;
            } else {
                isFire = (lastW === 0) || ((now - lastW) > ninetyDaysMs);
                status = isFire ? 'fire' : 'available';
                
                window.availableTerritoriesData.push({ 
                    num: num, 
                    url: mapData.url, 
                    city: mapData.city,
                    polygon: mapData.polygon,
                    lastWorked: lastW,
                    isFire: isFire
                });
            }

            if (mapData.polygon) {
                hasAnyPolygon = true;
                window.allMapPolygons.push({
                    num: num,
                    city: mapData.city,
                    polygon: mapData.polygon,
                    status: status
                });
            }
        });

        const toggleBtn = document.getElementById('toggle-terr-view-btn');
        if (toggleBtn) {
            if (hasAnyPolygon) {
                toggleBtn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> Списком`;
                toggleBtn.className = "bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-colors outline-none shadow-sm flex items-center gap-1.5 border border-slate-300";
                toggleBtn.classList.remove('hidden');
                setTimeout(() => window.renderGlobalAvailableMap(), 100);
            } else {
                toggleBtn.classList.add('hidden');
                window.isAvailableMapView = false;
                document.getElementById('available-terr-map-container')?.classList.add('hidden');
                listContainer.classList.remove('hidden');
            }
        }

        window.renderAvailableTerritoriesUI(); 

    } catch (e) {
        console.error(e);
        listContainer.innerHTML = `<p class="text-xs font-bold uppercase tracking-widest text-red-500 text-center py-4">Ошибка загрузки</p>`;
    }
};

window.isAvailableMapView = false;
let globalAvailableMapInstance = null;
let globalAvailableLayerGroup = null;

window.toggleAvailableView = () => {
    window.isAvailableMapView = !window.isAvailableMapView;
    const list = document.getElementById('available-terr-list');
    const mapContainer = document.getElementById('available-terr-map-container');
    const btn = document.getElementById('toggle-terr-view-btn');

    if (window.isAvailableMapView) {
        list.classList.add('hidden');
        mapContainer.classList.remove('hidden');
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> Списком`;
        btn.className = "bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-colors outline-none shadow-sm flex items-center gap-1.5 border border-slate-300";
        
        window.renderGlobalAvailableMap();
    } else {
        mapContainer.classList.add('hidden');
        list.classList.remove('hidden');
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> На карте`;
        btn.className = "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-colors outline-none shadow-sm flex items-center gap-1.5 border border-indigo-200";
    }
};

// Функция переброса на общую карту с выделением участка
window.focusOnTerritoryOnMap = (numStr) => {
    // 1. Убеждаемся, что модальное окно открыто
    document.getElementById('take-terr-modal').classList.replace('hidden', 'flex');
    
    // 2. ПРИНУДИТЕЛЬНО ПРЯЧЕМ СПИСОК И ПОКАЗЫВАЕМ КАРТУ
    const listEl = document.getElementById('available-terr-list');
    const mapEl = document.getElementById('available-terr-map-container');
    const toggleBtn = document.getElementById('toggle-terr-view-btn');
    
    if (listEl && mapEl) {
        listEl.classList.add('hidden');
        mapEl.classList.remove('hidden');
    }
    
    // Меняем иконку кнопки в шапке обратно на "Списком"
    if (toggleBtn) {
        toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> Списком`;
    }
    
    // 3. Плавно летим к участку и "кликаем" по нему
    setTimeout(() => {
        if(globalAvailableMapInstance) globalAvailableMapInstance.invalidateSize();
        
        const poly = window.terrMapPolygons[numStr];
        if (poly) {
            globalAvailableMapInstance.flyToBounds(poly.getBounds(), { padding: [30, 30], duration: 0.5 });
            poly.fire('click'); // Имитируем клик, чтобы открылась плашка "Взять участок"
        } else {
            alert("Участок не найден на карте!");
        }
    }, 100);
};

// === ФУНКЦИЯ 2: Общая карта свободных участков ===
window.renderGlobalAvailableMap = () => {
    if (!globalAvailableMapInstance) {
        globalAvailableMapInstance = L.map('available-terr-map', { attributionControl: false }).setView([49.974, 12.700], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(globalAvailableMapInstance);
        
        // НОВОЕ: Прятать окошко (плашку) при любом сдвиге или зуме карты, чтобы не мешалось
        globalAvailableMapInstance.on('movestart zoomstart', () => {
            globalAvailableMapInstance.closePopup();
        });
    }

    setTimeout(() => {
        globalAvailableMapInstance.invalidateSize();
        if (globalAvailableLayerGroup) globalAvailableMapInstance.removeLayer(globalAvailableLayerGroup);
        globalAvailableLayerGroup = L.layerGroup().addTo(globalAvailableMapInstance);

        if (!document.getElementById('terr-label-style')) {
            const styleMarkup = `
            <style id="terr-label-style">
                .terr-map-label {
                    background: #334155 !important; 
                    border: 2px solid #ffffff !important; 
                    border-radius: 50% !important; 
                    color: #ffffff !important;
                    font-weight: 900;
                    font-size: 12px;
                    text-shadow: none !important;
                    box-shadow: 0px 2px 4px rgba(0,0,0,0.3) !important;
                    width: 28px !important;
                    height: 28px !important;
                    line-height: 24px !important;
                    text-align: center !important;
                    padding: 0 !important;
                    white-space: nowrap !important;
                }
                .terr-map-label::before { display: none !important; } 
            </style>`;
            document.head.insertAdjacentHTML('beforeend', styleMarkup);
        }

        // === ГРАНИЦЫ СОБРАНИЯ (Mariánské Lázně) ===
        const cityBoundary = [
            [49.762638, 12.404806], [49.733720, 12.413257], [49.706275, 12.442696],
            [49.692883, 12.483003], [49.685730, 12.520048], [49.659490, 12.524038],
            [49.637595, 12.525053], [49.620210, 12.537888], [49.605940, 12.563586],
            [49.608063, 12.584177], [49.609018, 12.614063], [49.607108, 12.659840],
            [49.608868, 12.701759], [49.613171, 12.744105], [49.623351, 12.790354],
            [49.620677, 12.811054], [49.630270, 12.854405], [49.643882, 12.860074],
            [49.647625, 12.869134], [49.646347, 12.901715], [49.641114, 12.949541],
            [49.639451, 12.964528], [49.638745, 13.026727], [49.636160, 13.043097],
            [49.622405, 13.066341], [49.620638, 13.077260], [49.642093, 13.082883],
            [49.652862, 13.067399], [49.661167, 13.061963], [49.684710, 13.042125],
            [49.696519, 13.057605], [49.711157, 13.049344], [49.737032, 13.075511],
            [49.745860, 13.090464], [49.758391, 13.088168], [49.767682, 13.074769],
            [49.771180, 13.065581], [49.776888, 13.066254], [49.782047, 13.068638],
            [49.784766, 13.069866], [49.785789, 13.071170], [49.786017, 13.073924],
            [49.788125, 13.077771], [49.788716, 13.080709], [49.790221, 13.081899],
            [49.792451, 13.080407], [49.793940, 13.079845], [49.794734, 13.080809],
            [49.796182, 13.084925], [49.796243, 13.088396], [49.796493, 13.090975],
            [49.797423, 13.092379], [49.798288, 13.093284], [49.798938, 13.093896],
            [49.802714, 13.097843], [49.803922, 13.097765], [49.804300, 13.095917],
            [49.803761, 13.092835], [49.811132, 13.086538], [49.828153, 13.067798],
            [49.841433, 13.040319], [49.848450, 12.997812], [49.854120, 12.979033],
            [49.856936, 12.954019], [49.855896, 12.941722], [49.853831, 12.924183],
            [49.849221, 12.903905], [49.851137, 12.888613], [49.853205, 12.877172],
            [49.862712, 12.868898], [49.872234, 12.873504], [49.874074, 12.878526],
            [49.877967, 12.891579], [49.886986, 12.896973], [49.894926, 12.900252],
            [49.902971, 12.907937], [49.906174, 12.926354], [49.913779, 12.933967],
            [49.916793, 12.944688], [49.920883, 12.958058], [49.918926, 12.962926],
            [49.915415, 12.969016], [49.915449, 12.979913], [49.917970, 12.987808],
            [49.922365, 12.990560], [49.928565, 12.988663], [49.934970, 12.980036],
            [49.941487, 12.957473], [49.947034, 12.950448], [49.954511, 12.947171],
            [49.965853, 12.948901], [49.971373, 12.952215], [49.977745, 12.965412],
            [49.978775, 12.995759], [49.985707, 13.012018], [49.991920, 13.016657],
            [49.998658, 13.013203], [50.000668, 13.006235], [50.000446, 12.979959],
            [50.003458, 12.940115], [50.005655, 12.913972], [50.006518, 12.896448],
            [50.008018, 12.883788], [50.011389, 12.870988], [50.016578, 12.861334],
            [50.042324, 12.859146], [50.047436, 12.850052], [50.048259, 12.808401],
            [50.052522, 12.787885], [50.051300, 12.768339], [50.050447, 12.758568],
            [50.057922, 12.744062], [50.059510, 12.737128], [50.059853, 12.727839],
            [50.053037, 12.703228], [50.043466, 12.693114], [50.030028, 12.689805],
            [50.018791, 12.683851], [50.017013, 12.675724], [50.018933, 12.655038],
            [50.020765, 12.623165], [50.023575, 12.596141], [50.034415, 12.588492],
            [50.041073, 12.581870], [50.049509, 12.573893], [50.053277, 12.566160],
            [50.049356, 12.552020], [50.038839, 12.547940], [50.033051, 12.550032],
            [50.029773, 12.546458], [50.026140, 12.537401], [50.018102, 12.527514],
            [50.010528, 12.523957], [50.006796, 12.508941], [49.981593, 12.489888],
            [49.972102, 12.499310], [49.969792, 12.493562], [49.966777, 12.493795],
            [49.961852, 12.490864], [49.960622, 12.491437], [49.958438, 12.490433],
            [49.957892, 12.488292], [49.958453, 12.483193], [49.958025, 12.480578],
            [49.956466, 12.477640], [49.953216, 12.474882], [49.952305, 12.475075],
            [49.948291, 12.469947], [49.946787, 12.469745], [49.943096, 12.472102],
            [49.938454, 12.474968], [49.935506, 12.478642], [49.936539, 12.493798],
            [49.933198, 12.493167], [49.932545, 12.498164], [49.927585, 12.512151],
            [49.927584, 12.522963], [49.924634, 12.538534], [49.922711, 12.544699],
            [49.920400, 12.547813], [49.916179, 12.548351], [49.913048, 12.549166],
            [49.909827, 12.551128], [49.903146, 12.550917], [49.895473, 12.545024],
            [49.891335, 12.540008], [49.890924, 12.535302], [49.883408, 12.524112],
            [49.880116, 12.520458], [49.877058, 12.518639], [49.869078, 12.518578],
            [49.861422, 12.514108], [49.858686, 12.510673], [49.857488, 12.507820],
            [49.857009, 12.497694], [49.855010, 12.498489], [49.847481, 12.499572],
            [49.837469, 12.497958], [49.841975, 12.483019], [49.833212, 12.473006],
            [49.823528, 12.475038], [49.814792, 12.472150], [49.810171, 12.465074],
            [49.787588, 12.471540], [49.762638, 12.404806]
        ];

        L.polygon(cityBoundary, {
            color: '#3b82f6', // Яркий синий цвет (чтобы выделялся на фоне серых участков)
            weight: 4,        // Делаем линию достаточно жирной
            fill: false,      // Абсолютно прозрачно внутри!
            dashArray: '10, 10', // Делаем крупный заметный пунктир
            interactive: false // ОЧЕНЬ ВАЖНО: чтобы эта граница не перекрывала клики по мелким участкам!
        }).addTo(globalAvailableLayerGroup);
        
        let bounds = L.latLngBounds();
        let hasPolys = false;
        let currentlyHighlighted = null; 
        
        window.terrMapPolygons = {}; 

        window.allMapPolygons.forEach(m => {
            hasPolys = true;
            const latlngs = m.polygon.map(p => [p.lat, p.lng]);
            
            // БАЗОВЫЕ НАСТРОЙКИ (Для свободных участков)
            let polyColor = '#64748b'; // Серый цвет границы
            let fillOp = 0.0;          // Свободные участки полностью прозрачные
            let dashArr = '3, 4';      // ОЧЕНЬ МЕЛКИЙ ПУНКТИР
            let weight = 2;            
            
            let statusText = '';
            let btnHtml = '';

            // ЗАДАЕМ СТАТУСЫ, ЦВЕТА И ЭМОДЗИ
            if (m.status === 'active') {
                statusText = '<span class="text-slate-500 flex items-center justify-center gap-1.5 mt-2 text-[11px] bg-slate-100 py-1 rounded-md">🚧 Копаем... 👷‍♂️</span>';
                polyColor = '#475569'; // Темно-серый
                fillOp = 0.25;         // Серая заливка для видности!
            } else if (m.status === 'cooldown') {
                statusText = '<span class="text-purple-500 flex items-center justify-center gap-1.5 mt-2 text-[11px] bg-purple-50 py-1 rounded-md">⏳ Спит... 🛌</span>';
                polyColor = '#94a3b8'; // Светло-серый
                fillOp = 0.2;          // Легкая серая заливка
            } else if (m.status === 'fire') {
                statusText = '<span class="text-rose-500 mt-1 block">Свободен (Рекомендуем)</span>';
                btnHtml = `<button onclick="takeTerritory(${m.num}, this)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg shadow-md active:scale-95 transition-all mt-2 outline-none">ВЗЯТЬ УЧАСТОК</button>`;
            } else {
                statusText = '<span class="text-emerald-500 mt-1 block">Свободен</span>';
                btnHtml = `<button onclick="takeTerritory(${m.num}, this)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg shadow-md active:scale-95 transition-all mt-2 outline-none">ВЗЯТЬ УЧАСТОК</button>`;
            }

            const defaultStyle = {
                color: polyColor,       
                weight: weight,              
                dashArray: dashArr,          
                fillColor: polyColor,   
                fillOpacity: fillOp,    
                opacity: 0.9            
            };

            const poly = L.polygon(latlngs, defaultStyle);
            
            window.terrMapPolygons[m.num] = poly;

            poly.bindTooltip(String(m.num), {
                permanent: true,
                direction: 'center',
                className: 'terr-map-label'
            });

            const popupHtml = `
                <div class="text-center p-1.5 min-w-[140px] font-sans">
                    <span class="block font-black text-2xl text-slate-800 leading-none mb-1">№ ${m.num}</span>
                    <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">${m.city}</span>
                    <span class="block text-[9px] font-black uppercase tracking-widest border-t border-slate-100 pt-1">${statusText}</span>
                    ${btnHtml}
                </div>
            `;
            
            // НОВОЕ: autoPan: false отключает бесячий "прыжок" карты при клике на участок
            poly.bindPopup(popupHtml, { autoPan: false });

            // КЛИК: Делаем рамку зеленой и сплошной (если участок свободен)
            poly.on('click', function () {
                if (currentlyHighlighted) {
                    currentlyHighlighted.poly.setStyle(currentlyHighlighted.defaultStyle);
                }
                
                poly.setStyle({
                    fillOpacity: Math.max(fillOp, 0.15), // Оставляем базовую заливку или добавляем зеленую
                    color: '#10b981',    
                    weight: 3,           
                    dashArray: ''        
                });
                
                currentlyHighlighted = { poly: poly, defaultStyle: defaultStyle };
            });

            poly.on('popupclose', function () {
                poly.setStyle(defaultStyle);
                if (currentlyHighlighted && currentlyHighlighted.poly === poly) {
                    currentlyHighlighted = null;
                }
            });

            poly.addTo(globalAvailableLayerGroup);
            bounds.extend(poly.getBounds());
        });

        if (hasPolys) {
            globalAvailableMapInstance.fitBounds(bounds, { padding: [30, 30] });
        }
    }, 100);
};

window.renderAvailableTerritoriesUI = () => {
    const listContainer = document.getElementById('available-terr-list');
    
    let filtered = window.availableTerritoriesData;
    filtered.sort((a, b) => a.num - b.num);

    const totalMaps = Object.keys(window.allMapsCache).length;
    const availableMaps = window.availableTerritoriesData.length;
    const takenMaps = window.activeTerritoriesCount || 0;
    const completedMaps = window.cooldownTerritoriesCount || 0; 

    // Оставляем красивую статистику сверху
    let statsHtml = `
    <div class="grid grid-cols-4 gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-4 text-center text-[8px] font-black uppercase tracking-widest text-slate-500 shadow-inner shrink-0">
        <div>
            <span class="block text-slate-400 text-[7px] mb-0.5">В базе</span>
            <span class="text-slate-800 text-xs font-black">${totalMaps}</span>
        </div>
        <div class="border-l border-slate-200">
            <span class="block text-slate-400 text-[7px] mb-0.5">В работе</span>
            <span class="text-indigo-600 text-xs font-black">${takenMaps}</span>
        </div>
        <div class="border-l border-slate-200">
            <span class="block text-slate-400 text-[7px] mb-0.5">Пройдено</span>
            <span class="text-purple-600 text-xs font-black">${completedMaps}</span>
        </div>
        <div class="border-l border-slate-200">
            <span class="block text-slate-400 text-[7px] mb-0.5">Свободно</span>
            <span class="text-emerald-600 text-xs font-black">${availableMaps}</span>
        </div>
    </div>`;

    let gridHtml = '';
    if (filtered.length === 0) {
        gridHtml = `<p class="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-8">Все доступные участки разобраны или отдыхают!</p>`;
    } else {
        gridHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">';
        filtered.forEach(m => {
            const hasPolygon = !!m.polygon;
            const cityStr = m.city ? m.city : 'Без города';
            
            // Логика: если есть координаты - летим на общую карту. Если просто ссылка - открываем в браузере.
            let clickAction = '';
            if (hasPolygon) {
                clickAction = `onclick="focusOnTerritoryOnMap('${m.num}')"`;
            } else if (m.url) {
                clickAction = `onclick="window.open('${m.url}', '_blank')"`;
            } else {
                clickAction = `onclick="alert('Для этого участка нет карты или ссылки')"`;
            }

            // НОВАЯ КОМПАКТНАЯ КАРТОЧКА (Вся работает как кнопка)
            gridHtml += `
            <div ${clickAction} class="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all active:scale-[0.98] group">
                
                <div class="flex flex-col text-left pr-2">
                    <span class="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md w-max mb-1.5 shadow-sm">№ ${m.num}</span>
                    <span class="font-black text-slate-700 text-sm md:text-base leading-tight">${cityStr}</span>
                </div>
                
                <div class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                    <svg class="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
                
            </div>`;
        });
        gridHtml += '</div>';
    }

    listContainer.innerHTML = statsHtml + gridHtml;
};

window.closeTakeTerrModal = () => {
    const modal = document.getElementById('take-terr-modal');
    if(modal) modal.classList.replace('flex', 'hidden');
};

window.takeTerritory = async (num, btn) => {
    btn.disabled = true;
    btn.innerText = '...';
    try {
        await addDoc(collection(db, "territories"), {
            number: Number(num),
            userId: userId,
            userName: currentUserData.name,
            status: "active",
            issuedAt: new Date().toISOString()
        });
        window.showToast(`Участок №${num} успешно закреплен! ✅`, 'success');
        window.closeTakeTerrModal();
    } catch (e) {
        alert('Ошибка сети!');
        btn.disabled = false;
        btn.innerText = 'ВЗЯТЬ';
    }
};

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
window.openQrModal = () => document.getElementById('qr-modal').classList.replace('hidden', 'flex');

window.closeModals = () => {
    const m1 = document.getElementById('profile-modal'); if(m1) m1.classList.replace('flex', 'hidden');
    const m2 = document.getElementById('report-history-modal'); if(m2) m2.classList.replace('flex', 'hidden');
    const m3 = document.getElementById('duties-modal'); if(m3) m3.classList.replace('flex', 'hidden');
    const m4 = document.getElementById('user-msg-modal'); if(m4) m4.classList.replace('flex', 'hidden');
    const m5 = document.getElementById('take-terr-modal'); if(m5) m5.classList.replace('flex', 'hidden');
    const m6 = document.getElementById('info-details-modal'); if(m6) m6.classList.replace('flex', 'hidden');
    const m7 = document.getElementById('task-info-modal'); if(m7) m7.classList.replace('flex', 'hidden');
};
window.closeQrModal = () => document.getElementById('qr-modal').classList.replace('flex', 'hidden');

window.logout = async () => {
    // Добавлена защита от случайного нажатия!
    if (confirm("Выйти из аккаунта? / Odhlásit se?")) {
        const uid = localStorage.getItem('userId');
        if (uid) { 
            try { await updateDoc(doc(db, "users", uid), { pushToken: "" }); } catch (e) {} 
        }
        localStorage.clear(); 
        window.location.href = 'login.html'; 
    }
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

window.openTaskInfoModal = (htmlContent) => {
    const modal = document.getElementById('task-info-modal');
    const contentEl = document.getElementById('task-info-content');
    if (modal && contentEl) {
        contentEl.innerHTML = htmlContent;
        modal.classList.replace('hidden', 'flex');
    }
};

window.closeTaskInfoModal = () => {
    const modal = document.getElementById('task-info-modal');
    if (modal) modal.classList.replace('flex', 'hidden');
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

let pStart = { x: 0, y: 0 };
let pCurrent = { x: 0, y: 0 };
const mainElem = document.getElementById('main-dashboard');

if (mainElem) {
    mainElem.addEventListener('touchstart', function(e) {
        pStart.x = e.touches[0].screenX;
        pStart.y = e.touches[0].screenY;
    }, {passive: true});

    mainElem.addEventListener('touchmove', function(e) {
        pCurrent.x = e.touches[0].screenX;
        pCurrent.y = e.touches[0].screenY;
    }, {passive: true});

    mainElem.addEventListener('touchend', function(e) {
        if (mainElem.scrollTop <= 0) {
            let yDiff = pCurrent.y - pStart.y;
            let xDiff = Math.abs(pCurrent.x - pStart.x);
            if (yDiff > 120 && xDiff < 50 && pStart.y > 0 && pCurrent.y > 0) {
                const loader = document.getElementById('global-loader');
                if(loader) {
                    loader.style.display = 'flex';
                    loader.style.opacity = '1';
                }
                setTimeout(() => window.location.reload(true), 300);
            }
        }
        pStart = { x: 0, y: 0 };
        pCurrent = { x: 0, y: 0 };
    });
}

// ============================================
// ФУНКЦИЯ СОХРАНЕНИЯ РАСПИСАНИЯ В PNG (2 КОЛОНКИ, ТОЛЬКО АКТУАЛЬНЫЕ)
// ============================================
window.downloadScheduleAsPNG = async () => {
    const originalContainer = document.getElementById('meeting-program-list');
    
    if (!originalContainer || originalContainer.children.length === 0 || originalContainer.innerText.includes('Нет опубликованных')) {
        alert("Нет расписания для сохранения!");
        return;
    }

    // 1. Показываем уведомление
    window.showToast("Создаем картинку, подождите...", "info");

    // 2. Создаем временный невидимый контейнер с CSS Grid (2 колонки)
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '850px'; // Широкий холст для двух колонок
    tempDiv.style.backgroundColor = '#f1f5f9'; // Чуть более серый фон для контраста
    tempDiv.style.padding = '30px';
    tempDiv.style.display = 'grid';
    tempDiv.style.gridTemplateColumns = '1fr 1fr'; // ДВЕ ОДИНАКОВЫЕ КОЛОНКИ
    tempDiv.style.gap = '20px'; // Отступы между карточками
    tempDiv.style.fontFamily = 'sans-serif';
    tempDiv.style.alignItems = 'start'; // Чтобы карточки не растягивались по высоте друг друга

    // 3. Добавляем красивый заголовок (растягиваем его на обе колонки)
    const titleContainer = document.createElement('div');
    titleContainer.style.gridColumn = '1 / -1'; // Занять всю ширину
    titleContainer.style.textAlign = 'center';
    titleContainer.style.marginBottom = '10px';
    titleContainer.innerHTML = `
        <h2 style="font-weight: 900; font-size: 26px; color: #0f172a; margin: 0; line-height: 1.2; text-transform: uppercase;">Программа встреч</h2>
        <span style="font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Сгенерировано в GRO-UP</span>
    `;
    tempDiv.appendChild(titleContainer);

    // 4. Клонируем только АКТУАЛЬНЫЕ карточки
    let cardsAdded = 0;
    Array.from(originalContainer.children).forEach(card => {
        // Пропускаем текст "Загрузка..."
        if (card.tagName === 'P') return; 
        
        // ПРОПУСКАЕМ ПРОШЛЫЕ НЕДЕЛИ (ищем класс opacity-50)
        if (card.classList.contains('opacity-50') || card.classList.contains('grayscale')) {
            return;
        }

        const clone = card.cloneNode(true);
        
        // Убираем мобильные классы ширины, пусть Grid сам управляет шириной
        clone.className = clone.className
            .replace(/w-\[88vw\]/g, '')
            .replace(/md:w-\[calc\(.*\)\]/g, '')
            .replace(/snap-center/g, '')
            .replace(/shrink-0/g, '');
            
        // Задаем стили карточки, чтобы она красиво выделялась на фоне
        clone.style.width = '100%';
        clone.style.backgroundColor = '#ffffff'; 
        clone.style.border = '1px solid #cbd5e1';
        clone.style.borderRadius = '16px';
        clone.style.padding = '16px';
        clone.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        
        // Убираем моргание маркера текущей недели (на картинке оно не нужно)
        clone.classList.remove('current-week-marker');
        
        // Убираем иконки "Инфо" с буквой "i", на картинке на них не нажать
        const infoIcons = clone.querySelectorAll('[title="Информация"]');
        infoIcons.forEach(icon => icon.remove());

        tempDiv.appendChild(clone);
        cardsAdded++;
    });

    // Если нет ни одной актуальной/будущей недели
    if (cardsAdded === 0) {
        alert("Нет актуальных или будущих расписаний для сохранения!");
        return;
    }

    document.body.appendChild(tempDiv);

    try {
        // 5. Делаем скриншот с помощью html2canvas
        const canvas = await window.html2canvas(tempDiv, {
            scale: 2, // Высокое разрешение для четкого текста
            backgroundColor: '#f1f5f9',
            useCORS: true, 
            logging: false
        });
        
        // 6. Скачиваем картинку
        const link = document.createElement('a');
        link.download = `Расписание_Собрания_${new Date().toLocaleDateString('ru-RU')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        window.showToast("Картинка сохранена! ✅", "success");
    } catch (e) {
        console.error(e);
        alert("Ошибка при создании картинки.");
    } finally {
        // Обязательно удаляем временный блок
        if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
        }
    }
};

window.openInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('hidden', 'flex');
window.closeInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('flex', 'hidden');
