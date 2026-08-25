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
        "duties_schedule": "График дежурств", "new_message": "Новое сообщение", "msg_understood": "Понятно",
        "dow_1": "ПН", "dow_2": "ВТ", "dow_3": "СР", "dow_4": "ЧТ", "dow_5": "ПТ", "dow_6": "СБ", "dow_7": "ВС"
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
        "duties_schedule": "Rozpis služeb", "new_message": "Nová zpráva", "msg_understood": "Rozumím",
        "dow_1": "PO", "dow_2": "ÚT", "dow_3": "ST", "dow_4": "ČT", "dow_5": "PÁ", "dow_6": "SO", "dow_7": "NE"
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

        let html = '<div class="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">';
        reports.forEach((r, index) => {
            const isParticipated = r.participated ? 'Да' : 'Нет';
            const hours = r.hours || 0;
            const studies = r.studies || 0;
            const credit = r.credit || r.pubs || 0; 
            
            const [year, monthNum] = r.month.split('-');
            const monthName = window.t('months')[parseInt(monthNum, 10) - 1];

            // Чередуем фон для зебры (белый / светло-серый)
            const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-slate-50';

            html += `
                <div class="${bgClass} border-b border-slate-100 p-3 last:border-0">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-black text-slate-800 text-sm uppercase tracking-widest">${monthName} ${year}</span>
                        <button id="btn-edit-${r.id}" onclick="toggleEditHours('${r.id}', true)" class="text-[#373F43] hover:text-slate-800 text-[10px] font-black uppercase tracking-widest bg-slate-200/50 hover:bg-slate-200 px-2 py-1 rounded transition-colors outline-none">Изменить</button>
                    </div>
                    
                    <div class="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider pr-1">
                        <span>Служил: <strong class="text-slate-800 font-black">${isParticipated}</strong></span>
                        <span>Часы: <strong class="text-slate-800 font-black">${hours}</strong></span>
                        <span>Изуч: <strong class="text-slate-800 font-black">${studies}</strong></span>
                        <span>Кредит: <strong class="text-slate-800 font-black">${credit}</strong></span>
                    </div>

                    <div id="form-edit-${r.id}" class="hidden mt-2 pt-2 border-t border-slate-200/50 flex-row gap-2 items-center">
                        <input type="number" id="input-hours-${r.id}" value="${hours}" min="0" class="w-16 bg-white border border-slate-300 rounded-md text-center font-black text-slate-800 text-sm outline-none focus:border-[#373F43]">
                        <button onclick="saveNewHours('${r.id}')" class="bg-[#373F43] hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors shadow-sm outline-none flex-grow">Сохранить</button>
                        <button onclick="toggleEditHours('${r.id}', false)" class="text-slate-400 hover:text-slate-600 font-black px-2 transition-colors outline-none">✕</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

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

// --- ЛОГИКА ПОЛНОГО КАЛЕНДАРЯ В МОДАЛЬНОМ ОКНЕ ---
let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth();
let calSelectedDay = null;
let calAllEvents = {};
let calUnsub = null;

window.openFullCalendarModal = () => {
    const modal = document.getElementById('full-calendar-modal');
    if (modal) {
        modal.classList.replace('hidden', 'flex');
        initFullCalendar();
    }
};

window.closeFullCalendarModal = () => {
    const modal = document.getElementById('full-calendar-modal');
    if (modal) modal.classList.replace('flex', 'hidden');
    if (calUnsub) { calUnsub(); calUnsub = null; }
};

function initFullCalendar() {
    calCurrentYear = new Date().getFullYear();
    calCurrentMonth = new Date().getMonth();
    const now = new Date();
    calSelectedDay = now.getDate();
    
    const displayYearEl = document.getElementById('display-year');
    if (displayYearEl) displayYearEl.innerText = calCurrentYear;
    
    renderCalMonths();
    
    if (!calUnsub) {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        calUnsub = onSnapshot(q, (snapshot) => {
            calAllEvents = {};
            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                if (!ev.date) return;
                const parts = ev.date.split('-');
                if (parts.length < 3) return;
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const d = parseInt(parts[2], 10);
                if (!calAllEvents[y]) calAllEvents[y] = {};
                if (!calAllEvents[y][m]) calAllEvents[y][m] = {};
                if (!calAllEvents[y][m][d]) calAllEvents[y][m][d] = [];
                calAllEvents[y][m][d].push(ev);
            });
            renderCalDays();
            renderCalSelectedEvents();
        });
    } else {
        renderCalDays();
        renderCalSelectedEvents();
    }
}

window.changeCalendarYear = (dir) => {
    calCurrentYear += dir;
    const displayYearEl = document.getElementById('display-year');
    if (displayYearEl) displayYearEl.innerText = calCurrentYear;
    calSelectedDay = null;
    renderCalMonths();
    renderCalDays();
    renderCalSelectedEvents();
};

window.selectCalMonth = (mIdx) => {
    calCurrentMonth = mIdx;
    const now = new Date();
    if (calCurrentYear === now.getFullYear() && calCurrentMonth === now.getMonth()) calSelectedDay = now.getDate();
    else calSelectedDay = 1;
    renderCalMonths();
    renderCalDays();
    renderCalSelectedEvents();
};

window.selectCalDay = (d) => {
    calSelectedDay = d;
    renderCalDays();
    renderCalSelectedEvents();
};

function renderCalMonths() {
    const grid = document.getElementById('months-grid');
    if (!grid) return;
    let html = '';
    const monthsNames = window.t('months');
    for (let i = 0; i < 12; i++) {
        const isSelected = (i === calCurrentMonth);
        const bgClass = isSelected ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50';
        html += `
            <button onclick="window.selectCalMonth(${i})" class="${bgClass} aspect-square rounded-md flex items-center justify-center font-black text-[9px] md:text-xs uppercase tracking-widest transition-colors outline-none w-full">
                ${monthsNames[i]}
            </button>
        `;
    }
    grid.innerHTML = html;
}

function renderCalDays() {
    const grid = document.getElementById('days-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
    const shift = firstDay === 0 ? 6 : firstDay - 1;
    const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    const now = new Date();
    for (let i = 0; i < shift; i++) { grid.innerHTML += `<div></div>`; }
    for (let d = 1; d <= totalDays; d++) {
        const dateObj = new Date(calCurrentYear, calCurrentMonth, d);
        const dow = dateObj.getDay();
        const isWeekend = (dow === 0 || dow === 6);
        const isToday = (d === now.getDate() && calCurrentMonth === now.getMonth() && calCurrentYear === now.getFullYear());
        const isSelected = (d === calSelectedDay);
        const dayEvents = (calAllEvents[calCurrentYear] && calAllEvents[calCurrentYear][calCurrentMonth] && calAllEvents[calCurrentYear][calCurrentMonth][d]) || [];
        const hasSpecial = dayEvents.some(e => e.isSpecial);
        const hasNormal = dayEvents.length > 0;
        let dotHtml = '';
        if (hasNormal) {
            const dotColor = hasSpecial ? 'bg-rose-500' : 'bg-sky-500';
            dotHtml = `<div class="w-1.5 h-1.5 rounded-full ${dotColor} absolute bottom-1 shadow-sm"></div>`;
        }
        let bgClass = 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100';
        if (isSelected) bgClass = 'bg-slate-800 border-slate-800 text-white shadow-inner';
        else if (isToday) bgClass = 'bg-white border-emerald-500 text-emerald-600';
        else if (hasSpecial) bgClass = 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200';
        else if (isWeekend) bgClass = 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300';
        grid.innerHTML += `
            <button onclick="window.selectCalDay(${d})" class="rounded-md border flex flex-col items-center justify-center text-xs md:text-sm font-black relative cursor-pointer transition-colors outline-none w-full h-full ${bgClass}">
                ${d}
                ${dotHtml}
            </button>
        `;
    }
}

function renderCalSelectedEvents() {
    const list = document.getElementById('events-panel-list');
    const title = document.getElementById('selected-date-title');
    if (!list || !title) return;
    if (!calSelectedDay) {
        title.innerText = window.t('archive_title');
        list.innerHTML = `<p class="text-[10px] text-slate-400 text-center italic py-4">Выберите день</p>`;
        return;
    }
    const monthsNames = window.t('months');
    title.innerText = `${calSelectedDay} ${monthsNames[calCurrentMonth]} ${calCurrentYear}`;
    const dayEvents = (calAllEvents[calCurrentYear] && calAllEvents[calCurrentYear][calCurrentMonth] && calAllEvents[calCurrentYear][calCurrentMonth][calSelectedDay]) || [];
    if (dayEvents.length === 0) {
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full opacity-50 py-4">
                <svg class="w-6 h-6 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${window.t('no_events_this_day') || 'В этот день событий нет'}</p>
            </div>
        `;
        return;
    }
    let html = '';
    dayEvents.forEach(ev => {
        const groupHtml = ev.group !== "Все" && ev.group !== "Všechny" ? `<span class="text-[8px] font-bold text-slate-300 uppercase tracking-widest border border-slate-600 bg-slate-700 px-1.5 py-0.5 rounded">${window.t('group_short')} ${ev.group}</span>` : '';
        html += `
            <div class="flex flex-col p-3 bg-slate-800 border border-slate-700 rounded-md shadow-sm">
                <div class="flex justify-between items-start mb-1.5 gap-2">
                    <span class="font-black text-white text-xs md:text-sm leading-tight">${ev.title} ${ev.isSpecial ? '⭐' : ''}</span>
                    ${groupHtml}
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-[10px] md:text-xs font-mono font-bold text-slate-400">${ev.time || ''}</span>
                    ${ev.leader ? `<span class="text-[9px] uppercase font-bold text-emerald-400 tracking-widest">${window.t('leader_short')} ${ev.leader}</span>` : ''}
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

window.closeModals = () => {
    const m1 = document.getElementById('profile-modal'); if(m1) m1.classList.replace('flex', 'hidden');
    const m2 = document.getElementById('report-history-modal'); if(m2) m2.classList.replace('flex', 'hidden');
    const m3 = document.getElementById('duties-modal'); if(m3) m3.classList.replace('flex', 'hidden');
    const m4 = document.getElementById('user-msg-modal'); if(m4) m4.classList.replace('flex', 'hidden');
    const m5 = document.getElementById('take-terr-modal'); if(m5) m5.classList.replace('flex', 'hidden');
    const m6 = document.getElementById('info-details-modal'); if(m6) m6.classList.replace('flex', 'hidden');
    const m7 = document.getElementById('task-info-modal'); if(m7) m7.classList.replace('flex', 'hidden');
    const m8 = document.getElementById('full-calendar-modal'); if(m8) m8.classList.replace('flex', 'hidden');
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
    if(container && container.firstElementChild) {
        const scrollAmount = container.firstElementChild.offsetWidth + 16;
        container.scrollBy({ left: scrollAmount * dir, behavior: 'smooth' }); 
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
        // Скроллим ТОЛЬКО горизонтальный контейнер, не трогая вертикальный экран!
        container.scrollTo({ 
            left: activeCard.offsetLeft, 
            behavior: 'smooth' 
        });
    }
};

window.switchTab = function(tabId, btnElement) {
    // 1. Скрываем все вкладки, показываем выбранную
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none'; // Прячем надежно
    });
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = ''; // Показываем
    }
    
    // 2. ГАСИМ ВСЕ КНОПКИ (Делаем иконки серыми, прячем линии)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const indicator = btn.querySelector('.active-indicator');
        const icon = btn.querySelector('.nav-icon');
        
        if (indicator) {
            indicator.style.opacity = '0'; // Жестко прячем линию
        }
        if (icon) {
            icon.classList.remove('text-white');
            icon.classList.add('text-slate-500');
        }
    });
    
    // 3. ИЩЕМ АКТИВНУЮ КНОПКУ (Даже если она вызвана при загрузке страницы)
    let activeBtn = btnElement;
    if (!activeBtn) {
        activeBtn = document.querySelector(`nav button[onclick*="${tabId}"]`);
    }
    
    // 4. ЗАЖИГАЕМ АКТИВНУЮ КНОПКУ (Линия появляется, иконка белеет)
    if (activeBtn) {
        const indicator = activeBtn.querySelector('.active-indicator');
        const icon = activeBtn.querySelector('.nav-icon');
        
        if (indicator) {
            indicator.style.opacity = '1'; // Жестко показываем линию
        }
        if (icon) {
            icon.classList.remove('text-slate-500');
            icon.classList.add('text-white');
        }
    }

    // 5. Скролл для заданий
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

window.loadProfileData = async function() {
    const pName = document.getElementById('profile-name');
    const pGroup = document.getElementById('profile-group');
    const pOverseer = document.getElementById('profile-overseer');

    if(pName) pName.innerText = currentUserData.name || "Имя";
    let roles = currentUserData.roles || ["Возвещатель"];
    const rolesContainer = document.getElementById('profile-roles-container');
    
    if (rolesContainer) {
        rolesContainer.innerHTML = roles.map(r => {
            // Исключаем лишнее, что не нужно показывать в бейджах
            if(["Ответственный за участки", "Ответственный за школу", "Участник школы", "Надзиратель группы", "Служение со стендом"].includes(r)) return '';
            // Выводим только жирный серый текст
            return `<span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${r}</span>`;
        }).filter(Boolean).join('<span class="text-slate-300 mx-2 text-[10px]">•</span>'); // Соединяем точечками
    }
    
    onSnapshot(doc(db, "settings", "congregation"), (docSnap) => {
        const congEl = document.getElementById('profile-congregation');
        const dashZoomId = document.getElementById('dash-zoom-id');
        const dashZoomPass = document.getElementById('dash-zoom-pass');
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if(congEl) congEl.innerText = data.name || "МАРИАНСКИЕ ЛАЗНЕ";
            if(typeof currentZoomData !== 'undefined') {
                currentZoomData.id = data.zoomId || "";
                currentZoomData.pass = data.zoomPass || "";
            }
            if (dashZoomId) dashZoomId.innerText = data.zoomId || "-";
            if (dashZoomPass) dashZoomPass.innerText = data.zoomPass || "-";
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
    } catch(e) { console.error(e); }
};

// ============================================
// ВИДЖЕТ СТЕНДОВ (ЧИСТЫЙ И ИСПРАВЛЕННЫЙ КОД)
// ============================================
function renderStandCard() {
    const container = document.getElementById('stand-widget-container');
    if (!container) return;
    if (unsubStandReqs) unsubStandReqs();
    if (unsubStands) unsubStands();

    unsubStandReqs = onSnapshot(query(collection(db, "requests"), where("userId", "==", userId), where("type", "==", "stand")), (snap) => {
        isStandReqPending = !snap.empty;
        updateStandWidgetUI();
    });

    // Скачиваем все смены месяца, чтобы скрипт мог сопоставить тебя и напарника
    const today = new Date();
    const firstDayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    
    unsubStands = onSnapshot(query(collection(db, "stands"), where("date", ">=", firstDayStr)), (snap) => {
        window.allStandsData = [];
        snap.forEach(doc => window.allStandsData.push(doc.data()));
        updateStandWidgetUI(); 
    });
}

window.updateStandWidgetUI = function() {
    const container = document.getElementById('stand-widget-container');
    if (!container) return;

    const roles = currentUserData.roles || [];
    const isApprovedForStand = roles.includes('Служение со стендом') || roles.includes('Владелец') || roles.includes('Админ');

    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];

    // Вытаскиваем из общей базы только ТВОИ смены
    const allStands = window.allStandsData || [];
    const myStandsList = allStands.filter(s => s.userId === userId);

    let upcomingShifts = [];
    let monthCount = 0;
    const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    myStandsList.forEach(data => {
        if (data.date.startsWith(currentMonthPrefix)) monthCount++;
        if (data.date >= todayStr) upcomingShifts.push(data);
    });
    
    upcomingShifts.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    const nextShifts = upcomingShifts.slice(0, 4); // Показываем до 4 ближайших смен
    let buttonHtml = '';
    let contentHtml = '';

    if (isApprovedForStand) {
        buttonHtml = `<button onclick="window.location.href='stands.html'" class="w-full bg-teal-400 hover:bg-teal-600 text-white font-black py-3 rounded-md text-xs uppercase tracking-widest outline-none transition-colors mb-4 shadow-sm">${window.t('stand_signup')}</button>`;
        
        let progressPercent = (monthCount / 50) * 100;
        if (progressPercent > 100) progressPercent = 100;

        // Линия таймлайна (в один ряд, без рамочек у цифры)
        const statsHtml = `
            <div class="flex items-center gap-3 w-full mb-5">
                <div class="flex-grow bg-white border border-slate-200 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                    <div class="bg-slate-800 h-2.5 rounded-full transition-all duration-1000" style="width: ${progressPercent}%"></div>
                </div>
                <span class="font-black text-slate-800 text-xl leading-none w-6 text-center">${monthCount}</span>
            </div>
        `;

        if (nextShifts.length > 0) {
            // Группируем смены по дням
            const grouped = {};
            nextShifts.forEach(shift => {
                if(!grouped[shift.date]) grouped[shift.date] = [];
                grouped[shift.date].push(shift);
            });

            let shiftsListHtml = '';
            Object.keys(grouped).forEach(dateStr => {
                const shifts = grouped[dateStr];
                const parts = dateStr.split('-');
                const dayNum = parseInt(parts[2], 10);
                const monthIndex = parseInt(parts[1], 10) - 1;
                const monthNameArr = window.t('months');
                const monthName = (Array.isArray(monthNameArr) && monthNameArr[monthIndex]) ? monthNameArr[monthIndex] : parts[1];

                shiftsListHtml += `
                    <div class="mb-4 last:mb-0">
                        <!-- Шапка с датой -->
                        <div class="flex items-center gap-2 mb-2">
                            <div class="w-8 h-8 bg-slate-800 text-white rounded flex flex-col items-center justify-center shrink-0 shadow-sm">
                                <span class="text-[7px] uppercase font-bold leading-none mb-0.5 tracking-widest">${monthName}</span>
                                <span class="text-sm font-black leading-none">${dayNum}</span>
                            </div>
                            <div class="h-[1px] bg-slate-200 flex-grow"></div>
                        </div>
                        
                        <!-- Плиточки смен выровнены по левому краю -->
                        <div class="flex flex-col gap-2">
                `;

                shifts.forEach(shift => {
                    // Ищем, записан ли кто-то еще на это же время и место
                    const partner = allStands.find(s => s.date === shift.date && s.location === shift.location && s.time === shift.time && s.userId !== userId);
                    
                    const partnerHtml = partner 
                        ? `<span class="text-[11px] font-black text-slate-700 truncate w-full text-right">${partner.userName}</span>` 
                        : `<span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-max">Свободно</span>`;

                    const locName = shift.location && shift.location !== "undefined" ? shift.location : "ML - CupVital";

                    shiftsListHtml += `
                        <div class="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded-md shadow-sm transition-colors hover:bg-white">
                            <div class="flex flex-col min-w-0 flex-grow">
                                <span class="font-black text-slate-800 text-[11px] md:text-xs truncate w-full">${locName}</span>
                                <span class="text-[10px] font-bold text-slate-500 font-mono mt-0.5">${shift.time}</span>
                            </div>
                            <div class="flex flex-col items-end justify-center min-w-0 shrink-0 ml-2 w-1/2">
                                <span class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Напарник</span>
                                ${partnerHtml}
                            </div>
                        </div>
                    `;
                });

                shiftsListHtml += `</div></div>`;
            });

            contentHtml = `${statsHtml}<div class="mt-2"><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">${window.t('stand_upcoming')}</p>${shiftsListHtml}</div>`;
        } else {
            // Часики, если смен нет
            contentHtml = `${statsHtml}<div class="w-full p-6 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center rounded-md mt-2 shadow-sm"><svg class="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${window.t('stand_no_records')}</p></div>`;
        }
    } else {
        if (isStandReqPending) {
            buttonHtml = `<div class="w-full bg-teal-400 text-white font-black py-3.5 rounded-md text-xs uppercase tracking-widest text-center shadow-sm opacity-80">Заявка на рассмотрении</div>`;
            contentHtml = ``;
        } else {
            buttonHtml = `<button onclick="requestStand(this)" class="w-full bg-teal-400 hover:bg-teal-600 text-white font-black py-3.5 rounded-md text-xs uppercase tracking-widest outline-none transition-colors shadow-sm">${window.t('stand_apply')}</button>`;
            contentHtml = ``;
        }
    }

    container.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden w-full shadow-sm flex flex-col">
            <div class="relative w-full h-32 bg-slate-200 overflow-hidden shrink-0">
                <img src="bg-day-clear.webp" id="stand-dynamic-bg-img" alt="Стенд" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500">
            </div>
            <div class="p-4 flex flex-col empty:hidden">
                ${buttonHtml}
                ${contentHtml}
            </div>
        </div>
    `;

    if (typeof updateStandWeather === 'function') {
        setTimeout(updateStandWeather, 100);
    }
};

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

// ============================================
// ГЕНЕРАТОР КАРТОЧЕК РАСПИСАНИЯ
// ============================================
function buildScheduleCards(d, myName, currentWeekStr) {
    const weekLabel = weekToDateString(d.realWeekId || d.weekId);
    const isCurrentWeek = (d.realWeekId || d.weekId.split('-')[0]+'-'+d.weekId.split('-')[1]) === currentWeekStr;
    const isPastWeek = (d.realWeekId || d.weekId.split('-')[0]+'-'+d.weekId.split('-')[1]) < currentWeekStr;
    
    const weekStatus = isCurrentWeek ? window.t('current_week') : (isPastWeek ? "ПРОШЛАЯ" : window.t('future_week'));
    const statusColor = isCurrentWeek ? 'text-emerald-600' : (isPastWeek ? 'text-slate-400' : 'text-slate-500');
    const pastCardClass = isPastWeek ? 'opacity-50 grayscale' : '';
    
    // 🔥 НОВАЯ СИСТЕМА НУМЕРАЦИИ
    let currentNumber = 1;

    // Функция, которая крутит счетчик или берет точный номер из базы
    const getNextNum = (explicitNum) => {
        if (explicitNum && !isNaN(parseInt(explicitNum, 10))) {
            currentNumber = parseInt(explicitNum, 10);
        }
        return currentNumber++;
    };

    // 🔥 ИЗМЕНЕНИЕ: Функция скрывает строку, но СЧЕТЧИК ВСЕ РАВНО КРУТИТСЯ
    const rowNumbered = (title, person, explicitNum = null) => {
        const num = getNextNum(explicitNum); // Номер прокручивается ВСЕГДА!
        if(!person || person.trim() === '') return ''; // Но сам пункт скрывается, если он пуст
        
        const isMe = person === myName;
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';

        return `
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${num}. ${translateDbString(title)}</span>
                <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${person}</span>
            </div>
        `;
    };

    const rowUnnumbered = (title, person) => {
        if(!person || person.trim() === '') return ''; 
        const isMe = person === myName;
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';

        return `
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${translateDbString(title)}</span>
                <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${person}</span>
            </div>
        `;
    };

    const buildHeader = (title, bgColor, safeClass, iconSvg) => `
        <div class="w-full rounded-md shadow-sm mt-2 mb-1.5 ${safeClass} flex items-center px-3 py-1.5 min-h-[28px]" style="background-color: ${bgColor};">
            <div class="flex items-center justify-center text-white/90 w-4 h-4 shrink-0">${iconSvg}</div>
            <div class="text-white text-[10px] md:text-xs font-black uppercase tracking-widest leading-none ml-1.5 flex items-center h-full pt-[1px]">${title}</div>
        </div>
    `;

    const iconTreasure = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
    const iconMinistry = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
    const iconLiving = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
    const iconWeekend = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

    // --- СОКРОВИЩА ИЗ СЛОВА БОГА ---
    let treasure1 = '';
    const t1Num = getNextNum(); // Обязательно крутим счетчик для первого пункта
    if (d.mw_treasure_name && d.mw_treasure_name.trim() !== '') {
        const treasure1Me = d.mw_treasure_name === myName;
        const t1TitleColor = treasure1Me ? 'font-black text-black' : 'font-bold text-slate-800';
        const t1NameColor = treasure1Me ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
        const t1Title = translateDbString(d.mw_treasure_title || window.t('talk_10_min'));
        treasure1 = `
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${t1TitleColor} leading-tight">${t1Num}. ${t1Title}</span>
                <span class="text-[13px] md:text-sm ${t1NameColor} mt-0.5 ml-4">${d.mw_treasure_name}</span>
            </div>
        `;
    }

    const treasure2 = rowNumbered(window.t('spiritual_gems'), d.mw_gems_name);
    const treasure3 = rowNumbered(window.t('bible_reading'), d.mw_reading_name);

    const treasuresContent = treasure1 + treasure2 + treasure3;
    const treasuresBlock = treasuresContent ? `${buildHeader(window.t('treasures_title'), '#0d9488', 'h-treasure', iconTreasure)}${treasuresContent}` : '';

    // --- ОТТАЧИВАЕМ НАВЫКИ СЛУЖЕНИЯ ---
    const minRowsRaw = (d.ministryParts || []).map((m) => {
        const num = getNextNum(m.taskNumber); // 🔥 БЕРЕМ ОРИГИНАЛЬНЫЙ НОМЕР ИЗ БАЗЫ!
        if(!m.student || m.student.trim() === '') return ''; 

        const isMe = (m.student === myName || m.assistant === myName);
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
        const assistStr = m.assistant && m.assistant !== "Без помощника" ? ` <span class="opacity-70 ml-1">(${window.t('assistant_short')} ${m.assistant})</span>` : '';
        const translatedType = translateDbString(m.type || window.t('part'));
        
        let description = "";
        if (m.type === "Чтение Библии" || m.type === "Čtení Bible") description = "Это учебное задание назначается брату. Цель — зачитать назначенный отрывок из Библии четко, с правильным смысловым ударением, интонацией и естественностью. Вступление и заключение делать не нужно.";
        else if (m.type === "Начинайте разговор" || m.type === "Zahájení rozhovoru") description = "Это учебное задание может назначаться как брату, так и сестре. Цель — показать, как можно начать беседу с человеком в служении, используя предложенную тему для разговора.";
        else if (m.type === "Развивайте интерес" || m.type === "Rozvíjení zájmu") description = "Это учебное задание может назначаться как брату, так и сестре. Учащийся должен показать, как продолжить разговор с человеком, который проявил интерес во время предыдущей беседы.";
        else if (m.type === "Подготавливайте учеников" || m.type === "Pomáhej lidem stát se učedníky" || m.type === "Činění učedníků") description = "Это учебное задание назначается брату или сестре. Учащемуся необходимо показать, как проводить изучение Библии, используя основную публикацию для служения.";
        else if (m.type === "Объясняйте свои взгляды" || m.type === "Vysvětlování své víry") description = "Если это задание преподносится в виде речи, оно поручается брату. Если в виде сценки — брату или сестре. Цель — показать, как тактично и ясно объяснить библейскую истину.";
        else if (m.type === "Речь" || m.type === "Proslov" || m.type === "Речь 10 мин." || m.type === "Proslov 10 min.") description = "Это учебное задание поручается брату. Речь должна быть основана на указанном материале и преподнесена так, чтобы собрание извлекло из нее практическую пользу.";
        
        const descHtml = description ? `<div class="mt-4 pt-3 border-t border-slate-200/60"><div class="text-[11px] font-medium text-slate-500 leading-relaxed">${description}</div></div>` : "";
        const extraInfo = m.lesson 
            ? `<span class="font-black text-slate-800 block mb-3 text-base">${translatedType}</span><span class="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 self-start inline-block">${window.t('lesson')} ${m.lesson}</span>${descHtml}` 
            : `<span class="font-black text-slate-800 text-base">${translatedType}</span>${descHtml}`;

        const safeHtml = encodeURIComponent(extraInfo);

        return `
            <div data-info="${safeHtml}" onclick="window.openTaskInfoModal(decodeURIComponent(this.getAttribute('data-info')))" style="-webkit-tap-highlight-color: transparent;" class="flex items-center justify-between py-2.5 px-2 border-b border-slate-200/50 last:border-0 hover:bg-slate-300/20 transition-colors cursor-pointer group rounded-lg">
                <div class="flex flex-col min-w-0 pointer-events-none">
                    <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${num}. ${translatedType}</span>
                    <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${m.student}${assistStr}</span>
                </div>
                <div class="shrink-0 ml-3 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
        `;
    }).join('');

    const minRows = minRowsRaw ? `<div class="flex flex-col mt-1.5 mb-2 mx-0">${minRowsRaw}</div>` : '';
    const ministryBlock = minRows ? `${buildHeader(window.t('ministry_skills'), '#d97706', 'h-ministry', iconMinistry)}${minRows}` : '';

    // --- ХРИСТИАНСКАЯ ЖИЗНЬ ---
    const livRows = (d.livingParts || []).map((m) => {
        return rowNumbered(m.title, m.name); // Счетчики продолжают крутиться
    }).join('');

    let cbsRow = '';
    const cbsNum = getNextNum(); // Прокручиваем счетчик для Изучения Библии
    if (d.mw_cbs_conductor && d.mw_cbs_conductor.trim() !== '') {
        const isCbsMe = (d.mw_cbs_conductor === myName || d.mw_cbs_reader === myName);
        const cbsTitleColor = isCbsMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const cbsNameColor = isCbsMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
        const readStr = d.mw_cbs_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.mw_cbs_reader})</span>` : '';

        cbsRow = `
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${cbsTitleColor} leading-tight">${cbsNum}. ${window.t('congregation_bible_study')} ${d.mw_cbs_material ? `<span class="text-xs font-normal text-slate-500 ml-1">(${d.mw_cbs_material})</span>` : ''}</span>
                <span class="text-[13px] md:text-sm ${cbsNameColor} mt-0.5 ml-4">${d.mw_cbs_conductor}${readStr}</span>
            </div>
        `;
    }

    const livingContent = livRows + cbsRow;
    const livingBlock = livingContent ? `${buildHeader(window.t('christian_living'), '#b91c1c', 'h-living', iconLiving)}${livingContent}` : '';

    // --- ВЫХОДНЫЕ ---
    let we_talk = '';
    if (d.we_talk_speaker && d.we_talk_speaker.trim() !== '') {
        const weTalkMe = d.we_talk_speaker === myName;
        const wtTitleColor = weTalkMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const wtNameColor = weTalkMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
        const talkTitle = translateDbString(d.we_talk_title || window.t('public_talk'));

        we_talk = `
            <div class="flex flex-col py-3 px-3 bg-slate-50/80 border border-slate-200/80 shadow-sm rounded-xl mt-2.5 mb-2 mx-0">
                <span class="text-[15px] md:text-base ${wtTitleColor} uppercase leading-snug mb-1">${talkTitle}</span>
                <span class="text-[13px] md:text-sm ${wtNameColor} ml-1">${d.we_talk_speaker}</span>
            </div>
        `;
    }

    let wtStudyRow = '';
    if (d.we_wt_conductor && d.we_wt_conductor.trim() !== '') {
        const isWtMe = (d.we_wt_conductor === myName || d.we_wt_reader === myName);
        const wtStudyTitleColor = isWtMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const wtStudyNameColor = isWtMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
        const we_wt_read_str = d.we_wt_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.we_wt_reader})</span>` : '';

        wtStudyRow = `
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg mt-1.5">
                <span class="text-[13px] md:text-sm ${wtStudyTitleColor} leading-tight">${window.t('watchtower_study')}</span>
                <span class="text-[13px] md:text-sm ${wtStudyNameColor} mt-0.5 ml-4">${d.we_wt_conductor}${we_wt_read_str}</span>
            </div>
        `;
    }

    const weekendContent = we_talk + wtStudyRow + rowUnnumbered(window.t('closing_prayer'), d.we_prayer_name);
    let weekendBlock = '';
    if (weekendContent || (d.we_opening_name && d.we_opening_name.trim() !== '')) {
        weekendBlock = `
            <div class="flex-1 flex flex-col space-y-0 bg-white rounded-xl shadow-sm p-3 border border-slate-200 mt-2 md:mt-0 relative">
                ${buildHeader(window.t('weekend_meeting'), '#475569', 'h-weekend', iconWeekend)}
                ${rowUnnumbered(window.t('opening_song'), d.we_opening_name)}
                ${we_talk}
                ${wtStudyRow}
                ${rowUnnumbered(window.t('closing_prayer'), d.we_prayer_name)}
            </div>
        `;
    }

    // --- ОБСЛУЖИВАНИЕ (Дежурства) ---
    const iconKey = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" title="Распорядитель"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>`;
    const iconVideo = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" title="Видео"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`;
    const iconSound = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" title="Звук"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`;

    const dutyRow = (person, iconSvg) => {
        if (!person || person.trim() === '') return '';
        const isMe = person === myName;
        const iconColor = isMe ? 'text-[#2dd4bf]' : 'text-slate-400';
        const nameColor = isMe ? 'text-indigo-600' : 'text-slate-800';
        return `<div class="flex items-center gap-1.5"><div class="${iconColor} shrink-0 transition-colors">${iconSvg}</div> <span class="text-[13px] md:text-sm font-bold ${nameColor} truncate">${person}</span></div>`;
    };

    let dutiesArr = [];
    if (d.duty_attendant_1) dutiesArr.push(dutyRow(d.duty_attendant_1, iconKey));
    if (d.duty_attendant_2) dutiesArr.push(dutyRow(d.duty_attendant_2, iconKey));
    if (d.duty_sound_1) dutiesArr.push(dutyRow(d.duty_sound_1, iconVideo));
    if (d.duty_sound_2) dutiesArr.push(dutyRow(d.duty_sound_2, iconSound));

    let dutiesBlock = '';
    if (dutiesArr.length > 0) {
        dutiesBlock = `
            <div class="mt-3 flex flex-wrap items-center justify-start gap-x-5 gap-y-2 border-2 border-dashed border-slate-300 bg-transparent rounded-xl p-3 mx-1 mb-2">
                ${dutiesArr.join('')}
            </div>
        `;
    }

    return `
        <div class="w-[calc(100vw-32px)] md:w-full shrink-0 snap-center snap-always scroll-mt-40 flex flex-col bg-transparent pb-2 px-0 ${pastCardClass} ${isCurrentWeek ? 'current-week-marker' : ''}">
            
            <div class="flex flex-col gap-1 pb-1 mb-2 mx-1">
                <div class="flex items-center justify-between w-full">
                    <span class="text-base md:text-lg font-black text-black uppercase tracking-widest">${weekLabel}</span>
                    <span class="text-xs md:text-sm font-black ${statusColor} uppercase tracking-widest">${weekStatus}</span>
                </div>
            </div>

            <div class="inner-week-columns flex flex-col md:flex-row gap-0 md:gap-4 w-full px-1">
                <div class="flex-1 flex flex-col space-y-0 pb-4 md:pb-0">
                    ${rowUnnumbered(window.t('chairman'), d.mw_chairman_name)}
                    ${treasuresBlock}
                    ${ministryBlock}
                    ${livingBlock}
                    ${rowUnnumbered(window.t('closing_prayer'), d.mw_prayer_name)}
                </div>

                ${weekendBlock ? `<div class="md:hidden w-full border-t-2 border-slate-200 border-dashed my-2"></div>${weekendBlock}` : ''}
            </div>

            ${dutiesBlock}
        </div>
    `;
}

// ============================================
// ФУНКЦИЯ СОХРАНЕНИЯ РАСПИСАНИЯ В PNG
// ============================================
window.downloadScheduleAsPNG = async () => {
    if (typeof window.html2canvas !== 'function') {
        alert("Подождите пару секунд, инструмент загружается...");
        return;
    }

    const originalContainer = document.getElementById('meeting-program-list');
    
    if (!originalContainer || originalContainer.children.length === 0 || originalContainer.innerText.includes('Нет опубликованных')) {
        alert("Нет расписания для сохранения!");
        return;
    }

    // --- ПОЛНОЭКРАННАЯ ФИРМЕННАЯ ЗАГРУЗКА С ЛОГОТИПОМ ---
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-teal-50 transition-opacity duration-300';
    overlay.innerHTML = `
        <img src="icon-512.png" alt="GRO-UP" class="w-24 h-24 rounded-2xl object-contain shadow-xl mb-6 animate-pulse">
        <div class="w-20 h-[4px] bg-slate-300/40 rounded-full overflow-hidden mb-4">
            <div class="w-full h-full segmented-loader-line"></div>
        </div>
        <p class="text-teal-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Создание PNG...</p>
    `;
    document.body.appendChild(overlay);

    await new Promise(r => setTimeout(r, 100));

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '850px'; 
    tempDiv.style.backgroundColor = '#f1f5f9'; 
    tempDiv.style.padding = '30px';
    tempDiv.style.display = 'grid';
    tempDiv.style.gridTemplateColumns = '1fr 1fr'; 
    tempDiv.style.gap = '20px'; 
    tempDiv.style.fontFamily = 'sans-serif';
    tempDiv.style.alignItems = 'start'; 

    try {
        const titleContainer = document.createElement('div');
        titleContainer.style.gridColumn = '1 / -1'; 
        titleContainer.style.textAlign = 'center';
        titleContainer.style.marginBottom = '10px';
        titleContainer.innerHTML = `
            <h2 style="font-weight: 900; font-size: 26px; color: #0f172a; margin: 0; line-height: 1.2; text-transform: uppercase;">Программа встреч</h2>
            <span style="font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Сгенерировано в GRO-UP</span>
        `;
        tempDiv.appendChild(titleContainer);

        const sectionHeader = (title, bgColor, iconSvg) => {
            return `<div style="margin-top:6px; margin-bottom:6px; background:${bgColor}; border-radius: 6px; padding: 6px 10px; display: table; width: 100%;">
                        <div style="display: table-cell; vertical-align: middle; width: 14px;">${iconSvg}</div>
                        <div style="display: table-cell; vertical-align: middle; color:white; font-weight:900; font-size:11px; text-transform:uppercase; letter-spacing: 0.5px; padding-left: 6px;">${title}</div>
                    </div>`;
        };

        const iconTreasure = `<svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
        const iconMinistry = `<svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
        const iconLiving = `<svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
        const iconWeekend = `<svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

        let cardsAdded = 0;
        Array.from(originalContainer.children).forEach(card => {
            if (card.tagName === 'P') return; 
            if (card.classList.contains('opacity-50') || card.classList.contains('grayscale')) return;

            const clone = card.cloneNode(true);
            
            clone.className = clone.className
                .replace(/w-\[calc\(100vw-32px\)\]/g, '')
                .replace(/md:w-full/g, '')
                .replace(/snap-center/g, '')
                .replace(/snap-always/g, '')
                .replace(/scroll-mt-40/g, '')
                .replace(/shrink-0/g, '');
                
            clone.style.width = '100%';
            clone.style.backgroundColor = '#ffffff'; 
            clone.style.border = '1px solid #cbd5e1';
            clone.style.borderRadius = '16px';
            clone.style.padding = '16px';
            clone.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            
            clone.classList.remove('current-week-marker');

            const headersToReplace = [
                { selector: '.h-treasure', title: window.t('treasures_title'), color: '#0d9488', icon: iconTreasure },
                { selector: '.h-ministry', title: window.t('ministry_skills'), color: '#d97706', icon: iconMinistry },
                { selector: '.h-living', title: window.t('christian_living'), color: '#b91c1c', icon: iconLiving },
                { selector: '.h-weekend', title: window.t('weekend_meeting'), color: '#475569', icon: iconWeekend }
            ];

            headersToReplace.forEach(hData => {
                const el = clone.querySelector(hData.selector);
                if (el) {
                    el.outerHTML = sectionHeader(hData.title, hData.color, hData.icon);
                }
            });
            
            const innerGrid = clone.querySelector('.inner-week-columns');
            if(innerGrid) {
                innerGrid.className = '';
                innerGrid.style.display = 'flex';
                innerGrid.style.flexDirection = 'column'; 
                innerGrid.style.gap = '16px';
                innerGrid.style.width = '100%';
                
                const mobileDivider = innerGrid.querySelector('.border-dashed');
                if (mobileDivider) mobileDivider.remove();
            }

            const infoIcons = clone.querySelectorAll('[title="Информация"]');
            infoIcons.forEach(icon => icon.remove());

            tempDiv.appendChild(clone);
            cardsAdded++;
        });

        if (cardsAdded === 0) {
            overlay.remove();
            alert("Нет актуальных или будущих расписаний для сохранения!");
            return;
        }

        document.body.appendChild(tempDiv);

        const canvas = await window.html2canvas(tempDiv, {
            scale: 2, 
            backgroundColor: '#f1f5f9',
            useCORS: true, 
            logging: false
        });
        
        const link = document.createElement('a');
        link.download = `Расписание_Собрания_${new Date().toLocaleDateString('ru-RU')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        window.showToast("Картинка сохранена! ✅", "success");

    } catch (e) {
        console.error(e);
        alert("Ошибка при создании картинки.");
    } finally {
        overlay.remove();
        if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
        }
    }
};


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

    // 🔥 ИСПРАВЛЕННЫЕ КАРТОЧКИ УЧАСТКОВ
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
                
                const takenDate = new Date(terr.issuedAt || new Date());
                const now = new Date();
                const daysTotal = 90; 
                const daysPassed = Math.floor((now - takenDate) / (1000 * 60 * 60 * 24));
                let daysLeft = daysTotal - daysPassed;
                if (daysLeft < 0) daysLeft = 0;
                
                const progressPercent = Math.min(100, Math.max(0, (daysPassed / daysTotal) * 100));
                const takenStr = takenDate.toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' });
                
                let progressColor = 'bg-emerald-400';
                if (daysLeft <= 30) progressColor = 'bg-amber-400'; 
                if (daysLeft <= 10) progressColor = 'bg-rose-500';  

                const mapData = window.allMapsCache ? window.allMapsCache[String(terr.number)] : null;
                const hasPolygon = mapData && mapData.polygon;
                const hasUrl = mapData && mapData.url;
                
                let clickAction = '';
                if (hasPolygon) clickAction = `onclick="window.openTerritoryMap('${terr.number}')"`;
                else if (hasUrl) clickAction = `onclick="window.open('${mapData.url}', '_blank')"`;
                else clickAction = `onclick="alert('Для этого участка нет карты или ссылки')"`;

                const cityStr = mapData && mapData.city && mapData.city !== "Без города" 
                    ? `<span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-1">${mapData.city}</span>` 
                    : '';

                html += `
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col mt-4 transition-shadow hover:shadow-md">
                    <div class="flex">
                        <div class="flex-grow p-4 pr-2 flex flex-col justify-center">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Участок №</span>
                            <h4 class="font-black text-slate-800 text-2xl leading-none">${terr.number}</h4>
                            ${cityStr}
                        </div>
                        <div ${clickAction} class="w-20 md:w-24 shrink-0 flex flex-col items-center justify-center cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border-l border-slate-100 p-2">
                            <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span class="text-[8px] font-bold uppercase tracking-widest">Карта</span>
                        </div>
                    </div>

                    <div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div class="flex-grow">
                            <div class="flex justify-between items-center mb-1.5">
                                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Взят: ${takenStr}</span>
                            </div>
                            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden shadow-inner">
                                <div class="${progressColor} h-1.5 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                            </div>
                        </div>
                        <button onclick="window.markTerritoryReturned('${docSnap.id}')" class="shrink-0 w-1/4 min-w-[70px] bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 hover:border-rose-200 font-black uppercase tracking-widest px-2 py-2 rounded-lg text-[9px] transition-colors outline-none shadow-sm">
                            Сдать
                        </button>
                    </div>
                </div>
                `;
            });

            if (activeCount === 0) container.innerHTML = `<p class="text-slate-400 text-sm italic py-4 text-center border border-slate-200 rounded-xl w-full">${window.t('no_active_territories')}</p>`;
            else container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${html}</div>`;
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

// Глобальные функции для чистого окна новостей
    window.openNewsModal = (text, imageUrl) => {
        const imgContainer = document.getElementById('news-modal-image-container');
        const imgTag = document.getElementById('news-modal-image');
        const textContainer = document.getElementById('news-modal-text-container');
        const textTag = document.getElementById('news-modal-text');
        
        // Показываем текст только если он есть
        if (text && text.trim() !== '') {
            if (textTag) textTag.innerText = text;
            if (textContainer) textContainer.classList.remove('hidden');
        } else {
            if (textTag) textTag.innerText = '';
            if (textContainer) textContainer.classList.add('hidden');
        }
        
        // Показываем картинку только если она есть
        if (imageUrl && imageUrl.trim() !== '') {
            imgTag.src = imageUrl;
            imgContainer.classList.remove('hidden');
        } else {
            imgTag.src = '';
            imgContainer.classList.add('hidden');
        }
        
        document.getElementById('news-details-modal')?.classList.replace('hidden', 'flex');
    };

    window.closeNewsModal = () => {
        document.getElementById('news-details-modal')?.classList.replace('flex', 'hidden');
    };

    const originalCloseModals = window.closeModals;
    window.closeModals = () => {
        if(originalCloseModals) originalCloseModals();
        window.closeNewsModal();
    };

    // Свежая логика рендера новостей (Чистые плитки)
    try {
        const newsQuery = query(collection(db, "section_content"), orderBy("createdAt", "desc"));
        onSnapshot(newsQuery, (snapshot) => {
            const contentNews = document.getElementById('content-news');
            const adminContainer = document.getElementById('admin-news-creator');
            if (!contentNews) return; 

            const now = new Date().getTime();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const isNewsAdmin = currentUserData.roles && (currentUserData.roles.includes('Админ') || currentUserData.roles.includes('Владелец') || currentUserData.roles.includes('Старейшина'));

            let validNews = [];

            snapshot.forEach(docSnap => {
                const item = docSnap.data();
                if(item.section === 'news') {
                    const itemTime = new Date(item.createdAt).getTime();
                    if (now - itemTime < oneWeek) {
                        let displayText = ''; let shouldShow = false;
                        const hasRu = !!item.text_ru; const hasCs = !!item.text_cs;
                        const hasLegacyText = !!item.text && !hasRu && !hasCs; 
                        const hasImg = !!item.imageUrl;

                        if (hasLegacyText) { displayText = item.text; shouldShow = true; } 
                        else if (currentLang === 'ru') { if (hasRu) { displayText = item.text_ru; shouldShow = true; } else if (!hasRu && !hasCs && hasImg) { shouldShow = true; } } 
                        else if (currentLang === 'cs') { if (hasCs) { displayText = item.text_cs; shouldShow = true; } else if (!hasRu && !hasCs && hasImg) { shouldShow = true; } }

                        if (shouldShow) {
                            validNews.push({ id: docSnap.id, data: item, text: displayText });
                        }
                    }
                }
            });

            // 1. РИСУЕМ КВАДРАТЫ
            let newsHTML = '';
            const totalSlots = validNews.length === 0 ? 8 : Math.max(8, Math.ceil(validNews.length / 4) * 4);

            for (let i = 0; i < totalSlots; i++) {
                if (i < validNews.length) {
                    const n = validNews[i];
                    const safeText = (n.text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
                    const safeImage = (n.data.imageUrl || '');
                    const hasImage = !!safeImage;

                    const bgStyle = hasImage ? `background-image: url('${safeImage}'); background-size: cover; background-position: center; border: none;` : 'background-color: white;';
                    
                    const deleteBtn = isNewsAdmin ? `<button onclick="event.stopPropagation(); window.deleteNews('${n.id}')" class="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1 bg-white/90 backdrop-blur-sm rounded-full transition-colors outline-none z-20 shadow-sm"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>` : '';

                    let innerContent = '';
                    // Если картинки НЕТ, показываем текст. Если картинка ЕСТЬ - плитка будет абсолютно чистой (как в Инстаграм)
                    if (!hasImage) {
                        const previewText = n.text ? n.text.replace(/\n/g, ' ') : '';
                        innerContent = `<div class="w-full h-full p-2 flex items-start justify-start"><p class="text-[8px] md:text-[9px] font-bold leading-tight text-slate-700 line-clamp-4 break-words">${previewText}</p></div>`;
                    }

                    newsHTML += `
                        <div onclick="window.openNewsModal('${safeText}', '${safeImage}')" 
                             class="aspect-square rounded-xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:scale-[0.95] transition-transform" 
                             style="${bgStyle}">
                            ${deleteBtn}
                            ${innerContent}
                        </div>
                    `;
                } else {
                    newsHTML += `
                        <div class="aspect-square bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center opacity-50">
                            <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </div>
                    `;
                }
            }

            contentNews.innerHTML = newsHTML;

            // 2. РИСУЕМ ФОРМУ СОЗДАНИЯ (ТОЛЬКО ДЛЯ АДМИНА)
            if (adminContainer) {
                if (isNewsAdmin) {
                    let textAreaHtml = '';
                    if (currentLang === 'ru') textAreaHtml = `<textarea id="news-input-ru" rows="2" placeholder="${window.t('write_text_ru')}" class="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none font-medium text-slate-700 custom-scrollbar mb-2 shadow-sm focus:border-sky-400"></textarea>`;
                    else textAreaHtml = `<textarea id="news-input-cs" rows="2" placeholder="${window.t('write_text_cs')}" class="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none font-medium text-slate-700 custom-scrollbar mb-2 shadow-sm focus:border-sky-400"></textarea>`;

                    adminContainer.innerHTML = `
                        <div class="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col relative shadow-sm mb-2">
                            <p class="p-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0 mb-2">
                                <svg class="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                                ${window.t('create_announcement')}
                            </p>
                            ${textAreaHtml}
                            <div id="image-preview-container" class="hidden relative w-full shrink-0 mb-3 mt-1">
                                <img id="image-preview" src="" class="h-24 w-full object-cover rounded-lg border border-slate-200 shadow-sm">
                                <button onclick="window.removeImage()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center outline-none shadow-md hover:bg-red-600 transition-colors"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div class="flex items-center justify-between gap-2 shrink-0 mt-auto pt-2 border-t border-slate-200/60">
                                <label class="cursor-pointer bg-white border border-slate-200 text-slate-500 hover:text-sky-500 rounded-lg transition-colors flex items-center justify-center w-12 h-10 shrink-0 shadow-sm"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><input type="file" id="news-image" accept="image/*" class="hidden" onchange="window.previewImage(this)"></label>
                                <button onclick="window.publishNews()" id="publish-news-btn" class="bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-4 rounded-lg flex-grow transition-colors h-10 outline-none shadow-sm uppercase tracking-widest">${window.t('publish')}</button>
                            </div>
                        </div>
                    `;
                } else {
                    adminContainer.innerHTML = '';
                }
            }
        });
    } catch(e) { console.error("News error:", e); }

};

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
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(globalAvailableMapInstance);
        
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
    btn.disabled = true; btn.innerText = '...';
    try { 
        // ЖЕСТКАЯ ПРОВЕРКА В БАЗЕ: не находится ли участок уже в статусе active?
        const activeCheck = await getDocs(query(collection(db, "territories"), where("number", "==", Number(num)), where("status", "==", "active")));
        if (!activeCheck.empty) {
            alert('Извините, этот участок уже кто-то взял! (или он уже у вас)');
            btn.disabled = false; btn.innerText = 'ВЗЯТЬ УЧАСТОК';
            window.closeTakeTerrModal();
            return;
        }

        await addDoc(collection(db, "territories"), { number: Number(num), userId: userId, userName: currentUserData.name, status: "active", issuedAt: new Date().toISOString() }); 
        window.showToast(`Участок №${num} закреплен! ✅`, 'success'); 
        window.closeTakeTerrModal(); 
    } 
    catch (e) { alert('Ошибка сети!'); btn.disabled = false; btn.innerText = 'ВЗЯТЬ УЧАСТОК'; }
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
    } catch (e) { 
        alert("ОШИБКА: " + e.message); 
        if(btn) { btn.innerText = window.t('publish'); btn.disabled = false; } 
    }
};

window.deleteNews = async (id) => {
    if (confirm(window.t('confirm_delete_news'))) { try { await deleteDoc(doc(db, "section_content", id)); } catch (e) { alert(window.t('error_network')); } }
};

// ============================================
// ФИРМЕННАЯ ТЯНУЧКА ОБНОВЛЕНИЯ (PULL-TO-REFRESH)
// ============================================
const initPullToRefresh = () => {
    const ptrEl = document.getElementById('custom-ptr');
    const ptrIcon = document.getElementById('ptr-icon');
    const ptrText = document.getElementById('ptr-text');
    const mainDash = document.getElementById('main-dashboard');
    
    if (!mainDash || !ptrEl) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    
    // НАСТРОЙКА: Насколько пикселей нужно потянуть вниз, чтобы обновить
    // Увеличь эту цифру, если хочешь, чтобы тянуть нужно было еще длиннее
    const triggerDistance = 150; 

    mainDash.addEventListener('touchstart', (e) => {
        if (mainDash.scrollTop <= 0) {
            startY = e.touches[0].clientY;
            isPulling = false;
            ptrEl.style.transition = 'none';
        }
    }, { passive: true });

    mainDash.addEventListener('touchmove', (e) => {
        if (startY === 0) return;
        if (mainDash.scrollTop > 0) return; // Если прокрутили вниз, отменяем
        
        currentY = e.touches[0].clientY;
        let distance = currentY - startY;

        if (distance > 0) {
            isPulling = true;
            
            // Замедление (сопротивление тяге, чтобы чувствовалось упруго)
            let pullDistance = distance * 0.35; 
            
            ptrEl.style.transform = `translateY(${pullDistance - 80}px)`; // -80 чтобы начинал выезжать из-за края

            if (pullDistance > triggerDistance) {
                ptrIcon.style.transform = 'rotate(180deg)';
                ptrText.innerText = "Отпустите для обновления";
            } else {
                ptrIcon.style.transform = 'rotate(0deg)';
                ptrText.innerText = "Потяните сильнее";
            }
        }
    }, { passive: true });

    mainDash.addEventListener('touchend', () => {
        if (isPulling) {
            ptrEl.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
            let pullDistance = (currentY - startY) * 0.35;
            
            if (pullDistance > triggerDistance) {
                ptrText.innerText = "Обновление...";
                ptrIcon.style.transform = 'rotate(0deg)';
                ptrIcon.classList.add('animate-spin');
                ptrIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />`;
                ptrEl.style.transform = `translateY(20px)`;
                
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                // Если не дотянули - прячем обратно
                ptrEl.style.transform = `translateY(-150%)`;
            }
        }
        startY = 0;
        currentY = 0;
        isPulling = false;
    }, { passive: true });
};

// === ПРАВИЛЬНАЯ ФУНКЦИЯ ДЛЯ КАРТЫ ЛИЧНОГО УЧАСТКА ===
window.openTerritoryMap = (numStr) => {
    const mapData = window.allMapsCache[numStr];
    if (!mapData || !mapData.polygon) return alert("Для этого участка еще не нарисована карта!");

    document.getElementById('terr-map-title').innerText = `Участок № ${numStr}`;
    document.getElementById('terr-map-modal').classList.replace('hidden', 'flex');

    if (!window.userMapInstance) {
        window.userMapInstance = L.map('user-view-map', { attributionControl: false }).setView([49.974, 12.700], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(window.userMapInstance);
    }

    setTimeout(() => {
        window.userMapInstance.invalidateSize();
        if (window.userPolygonLayer) window.userMapInstance.removeLayer(window.userPolygonLayer);

        const latlngs = mapData.polygon.map(p => [p.lat, p.lng]);
        
        // Координаты, покрывающие весь мир (внешнее кольцо)
        const outerBounds = [
            [90, -180],
            [90, 180],
            [-90, 180],
            [-90, -180]
        ];

        // Создаем полигон с "дыркой" (latlngs вырезается из outerBounds)
        window.userPolygonLayer = L.polygon([outerBounds, latlngs], {
            color: '#10b981',      // Изумрудная граница участка
            weight: 3,
            fillColor: '#0f172a',  // Темно-синяя заливка ВОКРУГ участка
            fillOpacity: 0.6       // Насколько тёмным будет всё вокруг
        }).addTo(window.userMapInstance);

        // Центрируем камеру именно на участке, а не на всём мире
        window.userMapInstance.fitBounds(L.polygon(latlngs).getBounds(), { padding: [20, 20] });
    }, 100);
};

window.closeTerritoryMap = () => {
    document.getElementById('terr-map-modal')?.classList.replace('flex', 'hidden');
};

window.closeTerritoryMap = () => {
    document.getElementById('terr-map-modal')?.classList.replace('flex', 'hidden');
};

// Запускаем при загрузке документа
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPullToRefresh);
} else {
    initPullToRefresh();
}

// ============================================
// ВИДЖЕТ "МОИ ЦЕЛИ"
// ============================================

window.deleteCompletedGoal = function(index) {
    let history = JSON.parse(localStorage.getItem('completed_goals_data') || '[]');
    if (confirm("Удалить эту цель из истории?")) {
        history.splice(index, 1);
        localStorage.setItem('completed_goals_data', JSON.stringify(history));
        window.renderGoal();
    }
};

window.renderGoal = function() {
    const inputContainer = document.getElementById('goal-input-container');
    const progressContainer = document.getElementById('goal-progress-container');
    const doneBtn = document.getElementById('goal-done-btn');
    const completedList = document.getElementById('completed-goals-list');
    
    if (!inputContainer || !progressContainer) return;

    // 1. Отрисовка Истории
    const historyStr = localStorage.getItem('completed_goals_data');
    let historyHtml = '';
    if (historyStr) {
        const history = JSON.parse(historyStr);
        for (let i = history.length - 1; i >= 0; i--) {
            const g = history[i];
            historyHtml += `
                <div class="bg-amber-50/70 rounded-xl p-3 flex justify-between items-center gap-3 shadow-sm relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-16 h-16 bg-amber-200/40 rounded-full blur-xl"></div>
                    <span class="font-bold text-slate-500 text-xs md:text-sm whitespace-normal leading-tight z-10 break-words flex-grow">${g.text}</span>
                    <button onclick="window.deleteCompletedGoal(${i})" class="w-8 h-8 rounded-lg bg-amber-100/50 hover:bg-rose-100 text-amber-400 hover:text-rose-500 flex items-center justify-center shrink-0 transition-colors z-10 outline-none shadow-sm transition-colors border border-transparent hover:border-rose-200">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            `;
        }
    }
    if (completedList) completedList.innerHTML = historyHtml;

    // 2. Текущая цель
    const goalDataStr = localStorage.getItem('my_goal_data');
    if (!goalDataStr) {
        inputContainer.classList.remove('hidden'); inputContainer.classList.add('flex');
        progressContainer.classList.add('hidden'); progressContainer.classList.remove('flex');
        return;
    }

    const goalData = JSON.parse(goalDataStr);
    inputContainer.classList.add('hidden'); inputContainer.classList.remove('flex');
    progressContainer.classList.remove('hidden'); progressContainer.classList.add('flex');

    const now = new Date().getTime();
    const start = new Date(goalData.startDate).getTime();
    const end = new Date(goalData.targetDate).getTime();
    
    let progress = 0; 
    let daysLeft = 0;

    if (end <= start) { 
        progress = 100; 
    } else {
        progress = ((now - start) / (end - start)) * 100;
        daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    }

    if (progress >= 100) {
        // Вызываем функцию БЕЗ подтверждения, так как время вышло само
        window.finishGoalEarly(false);
        return;
    }

    if (progress < 0) progress = 0;
    if (daysLeft < 0) daysLeft = 0;

    document.getElementById('goal-display-text').innerText = goalData.text;
    const dateObj = new Date(goalData.targetDate);
    document.getElementById('goal-display-date').innerText = ("0" + dateObj.getDate()).slice(-2) + "." + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "." + dateObj.getFullYear();
    
    const daysNum = document.getElementById('goal-display-days-num');
    const daysText = document.getElementById('goal-display-days-text');
    const circle = document.getElementById('goal-circle-progress');
    const knob = document.getElementById('goal-knob-container');

    if (doneBtn) { 
        doneBtn.disabled = false;
        doneBtn.className = "w-12 md:w-16 h-24 md:h-32 shrink-0 bg-slate-100 text-emerald-500 hover:bg-slate-200 rounded-xl flex flex-col items-center justify-center transition-colors outline-none group";
    }
    
    let displayDaysStr = daysLeft.toString();
    if (daysLeft > 30) {
        const m = Math.floor(daysLeft / 30);
        const d = daysLeft % 30;
        displayDaysStr = `${m}/${d}`;
    }
    
    daysNum.innerText = displayDaysStr;
    daysNum.className = "text-xl md:text-2xl font-black text-slate-800 leading-none tracking-tighter mt-1";
    daysText.innerText = "дней";
    daysText.style.display = "block";
    
    const circumference = 238.76;
    const offset = circumference - (progress / 100) * circumference;
    
    circle.style.strokeDashoffset = circumference;
    knob.style.transform = `rotate(0deg)`;
    
    setTimeout(() => {
        circle.style.stroke = '#2dd4bf'; 
        circle.style.strokeDashoffset = offset;
        knob.style.transform = `rotate(${(progress / 100) * 360}deg)`;
    }, 100);
};

window.startGoal = function() {
    const text = document.getElementById('goal-text').value.trim();
    const dateVal = document.getElementById('goal-date').value;

    if (!text) return alert("Введите, чего вы хотите достичь!");
    if (!dateVal) return alert("Выберите дату!");

    const targetDate = new Date(dateVal);
    targetDate.setHours(23, 59, 59, 999); 
    const now = new Date();

    if (targetDate.getTime() <= now.getTime()) {
        return alert("Дата должна быть в будущем!");
    }

    const goalData = { text: text, targetDate: targetDate.toISOString(), startDate: now.toISOString() };
    localStorage.setItem('my_goal_data', JSON.stringify(goalData));
    window.renderGoal();
};

// Добавили параметр isManual (по умолчанию false)
window.finishGoalEarly = function(isManual = false) {
    if (isManual) {
        if (!confirm("Вы выполнили цель?")) return;
    }

    const goalDataStr = localStorage.getItem('my_goal_data');
    if (goalDataStr) {
        const goalData = JSON.parse(goalDataStr);
        
        const daysNum = document.getElementById('goal-display-days-num');
        const daysText = document.getElementById('goal-display-days-text');
        const circle = document.getElementById('goal-circle-progress');
        const knob = document.getElementById('goal-knob-container');
        const doneBtn = document.getElementById('goal-done-btn');
        
        if (daysNum) {
            daysNum.innerHTML = `<svg class="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
            daysNum.className = "mt-1";
        }
        if (daysText) daysText.style.display = "none";

        if (circle) {
            circle.style.strokeDashoffset = '0';
            circle.style.stroke = '#10b981';
        }
        if (knob) knob.style.transform = 'rotate(360deg)';
        
        if (doneBtn) { 
            // При нажатии кнопка становится полупрозрачной
            doneBtn.className = "w-12 md:w-16 h-24 md:h-32 shrink-0 bg-slate-100 text-emerald-500 rounded-xl flex flex-col items-center justify-center transition-colors outline-none group opacity-50";
            doneBtn.disabled = true;
        }

        setTimeout(() => {
            let history = JSON.parse(localStorage.getItem('completed_goals_data') || '[]');
            history.push(goalData);
            localStorage.setItem('completed_goals_data', JSON.stringify(history));
            
            localStorage.removeItem('my_goal_data');
            document.getElementById('goal-text').value = '';
            document.getElementById('goal-date').value = '';
            window.renderGoal();
        }, 1200);
    }
};

setTimeout(() => { if (window.renderGoal) window.renderGoal(); }, 500);

// ==========================================
// 🌤 ДИНАМИЧЕСКИЙ ФОН ДЛЯ СТЕНДА (УМНЫЙ ПЕРЕКЛЮЧАТЕЛЬ WEBP)
// ==========================================
async function updateStandWeather() {
    const img = document.getElementById('stand-dynamic-bg-img');
    if (!img) return; // Если картинки нет, ничего не делаем

    // Определяем время суток (с 6:00 до 19:59 - день, остальное - ночь)
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20; 

    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.96&longitude=12.70&current_weather=true');
        const data = await res.json();
        const weatherCode = data.current_weather.weathercode;

        applyWeatherTheme(isDay, weatherCode);
    } catch (e) {
        console.log("Нет интернета для погоды, ставим базовое время.");
        applyWeatherTheme(isDay, 0); 
    }
}

function applyWeatherTheme(isDay, code) {
    const img = document.getElementById('stand-dynamic-bg-img');
    if (!img) return;

    let newSrc = 'bg-day-clear.webp'; // По умолчанию ставим ясный день

    if (!isDay) {
        // 🌙 НОЧЬ: всегда показываем ночную картинку
        newSrc = 'bg-night-clear.webp';
    } else {
        // ☀️ ДЕНЬ: проверяем, есть ли дождь
        // Коды дождя по Open-Meteo: 51-67 (морось/дождь), 80-82 (ливень)
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            newSrc = 'bg-day-rain.webp';
        } else {
            // Для ясной, пасмурной и любой другой погоды днем
            newSrc = 'bg-day-clear.webp'; 
        }
    }

    // Если нужный фон уже стоит - ничего не делаем, чтобы не моргало
    if (img.getAttribute('src') === newSrc) return;

    // Плавно меняем картинку
    img.style.opacity = '0.4';
    setTimeout(() => {
        img.src = newSrc;
        img.style.opacity = '1';
    }, 300);
}


// ==========================================
// КОЛЕСО ВРЕМЕНИ (ВКЛАДКА ИНФО)
// ==========================================
const infoMonthsData = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function initInfoWheel(containerId, wheelPosition = 'right') {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = "true";

    const rotator = container.querySelector('.wheel-rotator');
    if (!rotator) return;
    rotator.innerHTML = '';

    const isRight = wheelPosition === 'right';
    let currentRotation = 0;
    let activeIndex = new Date().getMonth();

    infoMonthsData.forEach((month, index) => {
        const item = document.createElement('div');
        item.className = 'wheel-item';

        const dot = document.createElement('div');
        dot.className = 'wheel-dot';

        const text = document.createElement('div');
        text.className = 'wheel-text';
        text.innerText = month;

        item.appendChild(dot);
        item.appendChild(text);

        // Идеальная формула для правильного направления обоих кругов
        const angle = isRight ? -(index * 30) : (index * 30);
        item.style.transform = `rotate(${angle}deg)`;
        rotator.appendChild(item);
    });

    currentRotation = isRight ? (activeIndex * 30) : -(activeIndex * 30);
    updateWheelRotation(rotator, currentRotation);
    updateWheelActiveMonth(rotator, currentRotation, isRight);

    let isDragging = false;
    let startY = 0;
    let lastRotation = currentRotation;

    rotator.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startY = e.clientY;
        rotator.style.transition = 'none';
        e.preventDefault(); 
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        
        currentRotation = lastRotation + (isRight ? -deltaY : deltaY) * 0.4;
        updateWheelRotation(rotator, currentRotation);
        updateWheelActiveMonth(rotator, currentRotation, isRight);
    });

    window.addEventListener('pointerup', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const snapAngle = Math.round(currentRotation / 30) * 30;
        currentRotation = snapAngle;
        lastRotation = currentRotation;
        
        rotator.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        updateWheelRotation(rotator, currentRotation);
        updateWheelActiveMonth(rotator, currentRotation, isRight);
    });
}

function updateWheelRotation(element, angle) {
    element.style.transform = `rotate(${angle}deg)`;
}

function updateWheelActiveMonth(rotator, rotation, isRight) {
    const items = rotator.querySelectorAll('.wheel-item');
    items.forEach(item => item.classList.remove('active'));

    let steps = Math.round(rotation / 30);
    if (!isRight) steps = -steps;
    
    let activeIdx = (0 + steps) % 12;
    if (activeIdx < 0) activeIdx += 12;

    if(items[activeIdx]) items[activeIdx].classList.add('active');
}

// ==========================================
// СИНХРОНИЗАЦИЯ ОСОБЫХ СОБЫТИЙ ИЗ КАЛЕНДАРЯ
// ==========================================
function loadSpecialEventsToInfo() {
    const container = document.getElementById('special-events-list');
    if (!container) return;

    // Вычисляем сегодняшнюю дату в формате YYYY-MM-DD
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];

    // Берем данные из твоей коллекции events
    const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
    
    onSnapshot(eventsQuery, (snapshot) => {
        let html = '';
        let count = 0;
        
        snapshot.forEach(docSnap => {
            const ev = docSnap.data();
            
            // Фильтруем: только будущие/сегодняшние и только ОСОБЫЕ (со звездочкой)
            if (ev.date >= todayStr && ev.isSpecial) {
                count++;
                
                // Форматируем дату для красоты (например "15 МАРТА")
                const dateParts = ev.date.split('-');
                const day = parseInt(dateParts[2], 10);
                const monthIndex = parseInt(dateParts[1], 10) - 1;
                const monthName = infoMonthsData[monthIndex];

                html += `
                    <div class="bg-white border border-slate-200 shadow-md rounded-xl p-3 mb-3 w-full max-w-[220px] text-right pointer-events-auto transition-transform active:scale-95">
                        <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">⭐ ${day} ${monthName}</span>
                        <span class="text-sm font-black text-slate-800 leading-tight block">${ev.title}</span>
                        ${ev.time ? `<span class="text-[10px] font-bold text-slate-400 mt-1 block">${ev.time}</span>` : ''}
                    </div>
                `;
            }
        });
        
        // Если особых событий нет
        if (count === 0) {
            html = `<div class="bg-slate-200/50 rounded-lg px-4 py-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Нет особых событий</div>`;
        }
        
        container.innerHTML = html;
    });
}

// Запускаем оба колеса и синхронизацию
setTimeout(() => {
    initInfoWheel('wheel-campaign', 'right');
    initInfoWheel('wheel-events', 'left');
    loadSpecialEventsToInfo(); // <--- Запускаем подгрузку событий
}, 1000);


// ============================================
// КАСТОМНЫЙ ОФЛАЙН РЕЖИМ (ПЕРЕХВАТЧИК ИНТЕРНЕТА)
// ============================================
const initOfflineScreen = () => {
    const offlineScreen = document.getElementById('offline-screen');
    const updateOnlineStatus = () => {
        if (!offlineScreen) return;
        if (navigator.onLine) {
            offlineScreen.classList.replace('flex', 'hidden');
        } else {
            offlineScreen.classList.replace('hidden', 'flex');
        }
    };




    
    // Слушаем события включения/выключения интернета
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Проверяем статус сразу при загрузке
    updateOnlineStatus();
};

if (document.readyState === 'loading') { 
    document.addEventListener('DOMContentLoaded', initOfflineScreen); 
} else { 
    initOfflineScreen(); 
}

window.openInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('hidden', 'flex');
window.closeInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('flex', 'hidden');
