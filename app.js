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

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');

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
        
        window.showToast("Часы успешно обновлены! ✅", "success");
        window.openReportHistory(); 
    } catch(e) {
        alert("Ошибка при обновлении часов. Проверьте интернет.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

window.sendCorrection = async (reportId) => {
    const text = prompt("Опишите корректировку (Например: Забыл добавить 2 часа и 1 изучение):");
    if (!text || !text.trim()) return;

    try {
        await updateDoc(doc(db, "reports", reportId), {
            correction: text.trim(),
            correctionDate: new Date().toISOString()
        });
        window.showToast("Корректировка отправлена секретарю! ✅", "success");
        window.openReportHistory(); 
    } catch(e) {
        alert("Ошибка при отправке корректировки. Проверьте интернет.");
    }
};

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
    if (confirm("Выйти из аккаунта? / Odhlásit se?")) {
        const uid = localStorage.getItem('userId');
        if (uid) { 
            try { await updateDoc(doc(db, "users", uid), { pushToken: "" }); } catch (e) {} 
        }
        localStorage.clear(); 
        window.location.href = 'login.html'; 
    }
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
    const bgColor = type === 'warning' ? 'bg-amber-500' : (type === 'success' ? 'bg-emerald-500' : 'bg-slate-800');
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
            window.showToast("✅ " + window.t('toast_notifications_enabled'), "success");
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

    upcomingShifts.sort((a, b) => a.date.localeCompare(b.date));

    let shiftsHtml = '';
    if (upcomingShifts.length > 0) {
        shiftsHtml = upcomingShifts.slice(0, 3).map(shift => {
            const d = new Date(shift.date);
            const dateStr = d.toLocaleDateString(localStorage.getItem('app_lang') === 'cs' ? 'cs-CZ' : 'ru-RU', { day: 'numeric', month: 'short' });
            
            return `
                <div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div class="flex flex-col">
                        <span class="font-bold text-slate-800 text-sm">${dateStr}</span>
                        <span class="text-[10px] text-slate-500 uppercase font-black tracking-widest">${shift.time}</span>
                    </div>
                    <span class="text-xs font-bold text-theme-modBtnText truncate pl-4 text-right max-w-[50%]">${shift.point || 'Стенд'}</span>
                </div>
            `;
        }).join('');
    } else {
        shiftsHtml = '<p class="text-slate-400 text-sm italic py-4 text-center">У вас пока нет записей</p>';
    }

    let btnHtml = '';
    if (isApprovedForStand) {
        btnHtml = `<button onclick="window.location.href='stand.html'" class="w-full bg-theme-modBtnBg hover:bg-theme-modBtnHover text-theme-modBtnText font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-colors shadow-sm outline-none mb-5">Записаться</button>`;
    } else if (isStandReqPending) {
        btnHtml = `<button disabled class="w-full bg-slate-100 text-slate-400 font-black uppercase tracking-widest py-3 rounded-xl text-xs shadow-sm outline-none mb-5 cursor-not-allowed">Заявка на рассмотрении</button>`;
    } else {
        btnHtml = `<button onclick="requestStand(this)" class="w-full bg-theme-modBtnBg hover:bg-theme-modBtnHover text-theme-modBtnText font-black uppercase tracking-widest py-3 rounded-xl text-xs transition-colors shadow-sm outline-none mb-5">Подать заявку</button>`;
    }

    container.innerHTML = `
        <div class="bg-theme-card p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-black text-theme-text flex items-center gap-2 text-xl">
                    <svg class="w-6 h-6 text-theme-modIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span data-lang="stand_ministry">Служение со стендом</span>
                </h3>
            </div>
            ${btnHtml}
            <div class="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-3">
                <span>Смен в этом месяце</span>
                <span class="bg-theme-modBtnBg text-theme-modBtnText px-2 py-0.5 rounded font-black">${monthCount}</span>
            </div>
            <div id="stand-shifts-list" class="space-y-2">
                ${shiftsHtml}
            </div>
        </div>
    `;
}

window.requestStand = async (btn) => {
    btn.innerText = "..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "stand", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.classList.replace('bg-theme-modBtnBg', 'bg-emerald-500');
        btn.classList.replace('text-theme-modBtnText', 'text-white');
        btn.innerHTML = `✅ ${window.t('success')}`;
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-100'); 
            btn.classList.replace('text-white', 'text-slate-400'); 
            btn.innerText = window.t('stand_pending'); 
        }, 2000);
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
    
    let partCounter = 1;

    const row = (title, person) => {
        if(!person && !title) return '';
        const isMe = person === myName;
        const titleColor = isMe ? 'font-black text-black' : 'font-bold text-slate-800';
        const nameColor = isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';

        return `
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
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
            <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
                <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${translateDbString(title)}</span>
                <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${person || '-'}</span>
            </div>
        `;
    };

    const buildHeader = (title, bgColor, safeClass, iconSvg) => `
        <div class="w-full rounded-md shadow-sm mt-2 mb-1.5 ${safeClass} flex items-center gap-1.5 px-3 py-1.5 min-h-[28px]" style="background-color: ${bgColor};">
            <div class="flex items-center justify-center text-white/90 w-4 h-4 shrink-0">${iconSvg}</div>
            <div class="text-white text-[10px] md:text-xs font-black uppercase tracking-widest leading-none ml-1.5 flex items-center h-full pt-[1px]">${title}</div>
        </div>
    `;

    const iconTreasure = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
    const iconMinistry = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
    const iconLiving = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
    const iconWeekend = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

    const treasure1Me = d.mw_treasure_name === myName;
    const t1TitleColor = treasure1Me ? 'font-black text-black' : 'font-bold text-slate-800';
    const t1NameColor = treasure1Me ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const t1Title = translateDbString(d.mw_treasure_title || window.t('talk_10_min'));
    
    const treasure1 = `
        <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
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
        if (m.type === "Чтение Библии" || m.type === "Čtení Bible") description = "Это учебное задание назначается учащемуся мужского пола. Учащийся зачитывает назначенный отрывок. Вступление и заключение не требуются. Цель председателя встречи — помочь учащимся читать грамотно, бегло, в естественной манере, с пониманием, правильной интонацией, паузами и правильно делать смысловое ударение. Поскольку библейские отрывки могут быть разной длины, при назначении этого задание руководителю встречи нужно учитывать способности учащегося.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Начинайте разговор" || m.type === "Zahájení rozhovoru") description = "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим или членом его семьи. Участники могут сидеть или стоять.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Развивайте интерес" || m.type === "Rozvíjení zájmu") description = "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим. Участники могут сидеть или стоять. Учащемуся необходимо продемонстрировать, как продолжить предыдущую беседу.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Подготавливайте учеников" || m.type === "Pomáhej lidem stát se učedníky" || m.type === "Činění učedníků") description = "Это учебное задание поручается учащемуся мужского или женского пола. Помощник должен быть одного пола с выступающим. Участники могут сидеть или стоять. Если демонстрируется часть изучения, которое уже проводится, нет необходимости делать вступление или заключение. Необязательно зачитывать весь рассматриваемый материал, хотя это и допускается.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Объясняйте свои взгляды" || m.type === "Vysvětlování své víry") description = "Если это задание преподносится в виде речи, оно поручается учащемуся мужского пола. Если в виде демонстрации — мужского или женского пола. Помощник должен быть одного пола с выступающим или членом его семьи. Учащемуся нужно ясно и тактично ответить на вопрос по теме, используя информацию из ссылки к заданию. Учащийся может сам решить, будет ли он ссылаться на указанную публикацию.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";
        else if (m.type === "Речь" || m.type === "Proslov" || m.type === "Речь 10 мин." || m.type === "Proslov 10 min.") description = "Это учебное задание поручается учащемуся мужского пола и преподносится в виде речи, обращённой к собранию. Учащемуся нужно обратить внимание на то, как применить материал в служении. Он может обсудить примеры или использовать любой из дополнительных стихов, приведённых в уроке.<br><br><b>Указания для встречи «Наша христианская жизнь и служение»</b>";

        const descHtml = description ? `<div class="mt-4 pt-3 border-t border-slate-100"><div class="text-[12px] md:text-sm font-medium text-slate-500 leading-relaxed">${description}</div></div>` : "";
        
        const extraInfo = m.lesson 
            ? `<span class="font-black text-slate-800 block mb-3 text-base md:text-lg">${translatedType}</span><span class="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 self-start inline-block">Урок ${m.lesson}</span>${descHtml}` 
            : `<span class="font-black text-slate-800 text-base md:text-lg">${translatedType}</span>${descHtml}`;

        const safeHtml = extraInfo.replace(/"/g, '&quot;');

        return `
            <div data-info="${safeHtml}" onclick="openTaskInfoModal(this.getAttribute('data-info'))" style="-webkit-tap-highlight-color: transparent;" class="flex items-center justify-between py-2.5 px-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group">
                <div class="flex flex-col min-w-0 pointer-events-none">
                    <span class="text-[13px] md:text-sm ${titleColor} leading-tight">${partCounter++}. ${translatedType}</span>
                    <span class="text-[13px] md:text-sm ${nameColor} mt-0.5 ml-4">${m.student || '-'}${assistStr}</span>
                </div>
                <div class="shrink-0 ml-3 text-slate-300 group-hover:text-indigo-400 transition-colors pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
        `;
    }).join('');

    const minRows = minRowsRaw ? `<div class="flex flex-col bg-white rounded-xl mt-1.5 mb-2 mx-0 overflow-hidden shadow-sm border border-slate-200/80">${minRowsRaw}</div>` : '';

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
        <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg">
            <span class="text-[13px] md:text-sm ${cbsTitleColor} leading-tight">${cbsNum}. ${window.t('congregation_bible_study')} ${d.mw_cbs_material ? `<span class="text-xs font-normal text-slate-500 ml-1">(${d.mw_cbs_material})</span>` : ''}</span>
            <span class="text-[13px] md:text-sm ${cbsNameColor} mt-0.5 ml-4">${d.mw_cbs_conductor || '-'}${readStr}</span>
        </div>
    `;

    const weTalkMe = d.we_talk_speaker === myName;
    const wtTitleColor = weTalkMe ? 'font-black text-black' : 'font-bold text-slate-800';
    const wtNameColor = weTalkMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const talkTitle = translateDbString(d.we_talk_title || window.t('public_talk'));

    const we_talk = `
        <div class="flex flex-col py-1.5 px-3 bg-white/60 hover:bg-white border border-slate-200/50 shadow-sm rounded-xl mt-1.5 mb-1 mx-0">
            <span class="text-[13px] md:text-sm ${wtTitleColor} uppercase leading-tight">${talkTitle}</span>
            <span class="text-[13px] md:text-sm ${wtNameColor} mt-0.5 ml-4">${d.we_talk_speaker || '-'}</span>
        </div>
    `;

    const isWtMe = (d.we_wt_conductor === myName || d.we_wt_reader === myName);
    const wtStudyTitleColor = isWtMe ? 'font-black text-black' : 'font-bold text-slate-800';
    const wtStudyNameColor = isWtMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-600';
    const we_wt_read_str = d.we_wt_reader ? ` <span class="opacity-70 ml-1">(${window.t('reader')} ${d.we_wt_reader})</span>` : '';

    const wtStudyRow = `
        <div class="flex flex-col py-1 px-1 bg-transparent hover:bg-slate-300/20 transition-colors rounded-lg mt-1.5">
            <span class="text-[13px] md:text-sm ${wtStudyTitleColor} leading-tight">${window.t('watchtower_study')}</span>
            <span class="text-[13px] md:text-sm ${wtStudyNameColor} mt-0.5 ml-4">${d.we_wt_conductor || '-'}${we_wt_read_str}</span>
        </div>
    `;

    const attendantsArr = [d.duty_attendant_1, d.duty_attendant_2].filter(Boolean);
    const soundsArr = [d.duty_sound_1, d.duty_sound_2].filter(Boolean);
    let dutiesBlock = '';

    if (attendantsArr.length > 0 || soundsArr.length > 0) {
        dutiesBlock = `
            <div class="mt-3 grid grid-cols-2 gap-2 text-center bg-slate-200/60 rounded-xl p-2.5 mx-0 mb-2">
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
        <div class="w-[calc(100vw-32px)] md:w-full shrink-0 snap-center snap-always scroll-mt-40 flex flex-col bg-transparent pb-2 px-0 ${pastCardClass} ${isCurrentWeek ? 'current-week-marker' : ''}">
            
            <div class="flex flex-col gap-1 pb-2 mb-3 mx-1 border-b border-slate-300">
                <div class="flex items-center justify-between w-full">
                    <span class="text-base md:text-lg font-black text-black uppercase tracking-widest">${weekLabel}</span>
                    <span class="text-xs md:text-sm font-black ${statusColor} uppercase tracking-widest">${weekStatus}</span>
                </div>
            </div>

            <div class="inner-week-columns flex flex-col md:flex-row gap-0 md:gap-4 w-full px-1">
                
                <div class="flex-1 flex flex-col space-y-0 pb-4 md:pb-0">
                    ${rowUnnumbered(window.t('chairman'), d.mw_chairman_name)}

                    ${buildHeader(window.t('treasures_title'), '#0d9488', 'h-treasure', iconTreasure)}
                    ${treasure1}
                    ${treasure2}
                    ${treasure3}

                    ${buildHeader(window.t('ministry_skills'), '#d97706', 'h-ministry', iconMinistry)}
                    ${minRows}

                    ${buildHeader(window.t('christian_living'), '#b91c1c', 'h-living', iconLiving)}
                    ${livRows}
                    ${cbsRow}

                    ${rowUnnumbered(window.t('closing_prayer'), d.mw_prayer_name)}
                </div>

                <div class="md:hidden w-full border-t-2 border-slate-200 border-dashed my-2"></div>

                <div class="flex-1 flex flex-col space-y-0 pt-2 md:pt-0">
                    ${buildHeader(window.t('weekend_meeting'), '#475569', 'h-weekend', iconWeekend)}
                    ${rowUnnumbered(window.t('opening_song'), d.we_opening_name)}
                    ${we_talk}
                    ${wtStudyRow}
                    ${rowUnnumbered(window.t('closing_prayer'), d.we_prayer_name)}
                </div>
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

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300';
    overlay.innerHTML = `
        <div class="bg-white px-10 py-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center">
            <div class="w-24 h-[4px] bg-slate-100 rounded-full overflow-hidden mb-4">
                <div class="w-full h-full segmented-loader-line"></div>
            </div>
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Создание PNG...</p>
        </div>
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

        const iconTreasure = `<svg style="width:14px;height:14px;color:white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
        const iconMinistry = `<svg style="width:14px;height:14px;color:white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
        const iconLiving = `<svg style="width:14px;height:14px;color:white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
        const iconWeekend = `<svg style="width:14px;height:14px;color:white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

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
        
        window.showToast("Картинка сохранена!", "success");

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

const initPullToRefresh = () => {
    const ptrEl = document.getElementById('custom-ptr');
    const ptrIcon = document.getElementById('ptr-icon');
    const ptrText = document.getElementById('ptr-text');
    const mainDash = document.getElementById('main-dashboard');
    
    if (!mainDash || !ptrEl) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    
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
        if (mainDash.scrollTop > 0) return; 
        
        currentY = e.touches[0].clientY;
        let distance = currentY - startY;

        if (distance > 0) {
            isPulling = true;
            
            let pullDistance = distance * 0.35; 
            
            ptrEl.style.transform = `translateY(${pullDistance - 80}px)`; 

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
                ptrEl.style.transform = `translateY(-150%)`;
            }
        }
        startY = 0;
        currentY = 0;
        isPulling = false;
    }, { passive: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPullToRefresh);
} else {
    initPullToRefresh();
}
window.openInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('hidden', 'flex');
window.closeInfoDetailsModal = () => document.getElementById('info-details-modal')?.classList.replace('flex', 'hidden');
