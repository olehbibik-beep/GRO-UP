import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ЕДИНЫЙ ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ (С ФРАЗАМИ ДЛЯ УЧАСТКОВ)
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
        // Календарь
        "calendar_title": "Календарь Событий - GRO-UP",
        "calendar_h1": "Календарь",
        "calendar_subtitle": "График событий собрания",
        "create_meeting": "Создать встречу",
        "event_type": "Тип события",
        "opt_regular": "🔵 Обычная встреча",
        "opt_special": "🔴 Особое событие (важно)",
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
        "confirm_delete_event": "Удалить встречу из календаря?",
        // Отчеты
        "reports_title": "Отчеты - GRO-UP",
        "reports_summary": "Сводка отчетов",
        "loading_access": "Загрузка доступа...",
        "users_link": "Пользователи",
        "submitted_reports": "Сдали отчеты",
        "total_hours": "Итого часов",
        "all_months": "Все месяцы",
        "print_btn": "Распечатать",
        "th_publisher": "Возвещатель",
        "th_participated": "Служил",
        "th_hours": "Часы",
        "th_studies": "Изучения",
        "th_credit": "Кредит",
        "th_month": "Месяц",
        "all_groups_full_access": "Все группы (Полный доступ)",
        "overseer_access": "Доступ надзирателя",
        "no_reports_found": "Отчеты не найдены.",
        // Школа
        "school_title": "Управление Школой - GRO-UP",
        "school_h1": "Школа",
        "manage_tasks": "Управление заданиями",
        "assign_title": "Назначить",
        "student_label": "Ученик",
        "loading_students": "Загрузка учеников...",
        "assistant_label": "Помощник (Напарник)",
        "select_student_first": "Сначала выберите ученика",
        "task_num": "№ Зад.",
        "task_type": "Тип",
        "opt_select": "Выберите...",
        "cat_reading_db": "📖 Чтение Библии",
        "cat_conversation": "🗣️ Разговор",
        "cat_interest": "🌱 Интерес",
        "cat_disciples": "👥 Подготавливайте",
        "cat_beliefs": "💡 Взгляды",
        "cat_talk_db": "🎙️ Речь",
        "task_lesson": "Урок",
        "task_date": "Дата",
        "btn_assign": "Назначить",
        "schedule_title": "График выступлений",
        "no_students_found": "Нет участников школы",
        "no_assistant": "Без помощника",
        "err_talk_girls": "❌ Речь (Только братья)",
        "err_reading_girls": "❌ Чтение Библии (Братья)",
        "not_performed_yet": "⚠️ <span class='text-rose-500'>Еще не выступал(а)</span>",
        "last_performance": "💡 Последнее выступление:",
        "alert_fill_all": "Пожалуйста, заполните все обязательные поля!",
        "success_assigned": "Успешно назначено! ✔️",
        "no_assigned_tasks": "Нет назначенных заданий.",
        "num_symbol": "№",
        // Участки
        "terr_title": "Управление Участками - GRO-UP",
        "terr_h1": "Участки",
        "manage_terr": "Управление территориями",
        "issue_terr": "Выдать участок",
        "to_whom": "Кому выдать",
        "terr_number_label": "Номер участка",
        "ph_terr_num": "Например: 105",
        "in_progress": "В работе",
        "ph_search_terr": "Поиск по имени или №...",
        "th_number": "Номер",
        "th_taken": "Взят",
        "th_action": "Действие",
        "no_new_requests_terr": "Нет новых запросов",
        "title_issue_terr": "Выдать участок",
        "select_publisher": "Выберите возвещателя...",
        "alert_select_user_num": "Выберите пользователя и введите номер!",
        "success_tick": "Успешно! ✔️",
        "btn_returned": "Сдан ✖",
        "all_terr_free": "Все участки свободны.",
        "confirm_return": "Отметить участок как сданный?",
        "confirm_delete_request": "Удалить этот запрос?"
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
        // Календарь
        "calendar_title": "Kalendář událostí - GRO-UP",
        "calendar_h1": "Kalendář",
        "calendar_subtitle": "Rozvrh událostí sboru",
        "create_meeting": "Vytvořit schůzku",
        "event_type": "Typ události",
        "opt_regular": "🔵 Běžná schůzka",
        "opt_special": "🔴 Zvláštní událost (důležité)",
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
        "confirm_delete_event": "Smazat schůzku z kalendáře?",
        // Отчеты
        "reports_title": "Zprávy - GRO-UP",
        "reports_summary": "Souhrn zpráv",
        "loading_access": "Načítání přístupu...",
        "users_link": "Uživatelé",
        "submitted_reports": "Odevzdali zprávy",
        "total_hours": "Celkem hodin",
        "all_months": "Všechny měsíce",
        "print_btn": "Vytisknout",
        "th_publisher": "Zvěstovatel",
        "th_participated": "Služba",
        "th_hours": "Hodiny",
        "th_studies": "Studia",
        "th_credit": "Kredit",
        "th_month": "Měsíc",
        "all_groups_full_access": "Všechny skupiny (Plný přístup)",
        "overseer_access": "Přístup dozorce",
        "no_reports_found": "Nebyly nalezeny žádné zprávy.",
        // Школа
        "school_title": "Správa školy - GRO-UP",
        "school_h1": "Škola",
        "manage_tasks": "Správa úkolů",
        "assign_title": "Přiřadit",
        "student_label": "Student",
        "loading_students": "Načítání studentů...",
        "assistant_label": "Pomocník (Společník)",
        "select_student_first": "Nejprve vyberte studenta",
        "task_num": "Úkol č.",
        "task_type": "Typ",
        "opt_select": "Vyberte...",
        "cat_reading_db": "📖 Čtení Bible",
        "cat_conversation": "🗣️ Rozhovor",
        "cat_interest": "🌱 Zájem",
        "cat_disciples": "👥 Čiňte učedníky",
        "cat_beliefs": "💡 Přesvědčení",
        "cat_talk_db": "🎙️ Proslov",
        "task_lesson": "Lekce",
        "task_date": "Datum",
        "btn_assign": "Přiřadit",
        "schedule_title": "Rozvrh projevů",
        "no_students_found": "Žádní studenti",
        "no_assistant": "Bez pomocníka",
        "err_talk_girls": "❌ Proslov (Pouze bratři)",
        "err_reading_girls": "❌ Čtení Bible (Bratři)",
        "not_performed_yet": "⚠️ <span class='text-rose-500'>Zatím nevystupoval(a)</span>",
        "last_performance": "💡 Poslední vystoupení:",
        "alert_fill_all": "Prosím, vyplňte všechna povinná pole!",
        "success_assigned": "Úspěšně přiřazeno! ✔️",
        "no_assigned_tasks": "Žádné přiřazené úkoly.",
        "num_symbol": "č.",
        // Участки
        "terr_title": "Správa obvodů - GRO-UP",
        "terr_h1": "Obvody",
        "manage_terr": "Správa území",
        "issue_terr": "Vydat obvod",
        "to_whom": "Komu vydat",
        "terr_number_label": "Číslo obvodu",
        "ph_terr_num": "Například: 105",
        "in_progress": "V práci",
        "ph_search_terr": "Hledat podle jména nebo č...",
        "th_number": "Číslo",
        "th_taken": "Vydáno",
        "th_action": "Akce",
        "no_new_requests_terr": "Žádné nové žádosti",
        "title_issue_terr": "Vydat obvod",
        "select_publisher": "Vyberte zvěstovatele...",
        "alert_select_user_num": "Vyberte uživatele a zadejte číslo!",
        "success_tick": "Úspěšně! ✔️",
        "btn_returned": "Vrácen ✖",
        "all_terr_free": "Všechny obvody jsou volné.",
        "confirm_return": "Označit obvod jako vrácený?",
        "confirm_delete_request": "Smazat tuto žádost?"
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

// ==========================================
// 1. ПРОВЕРКА ПРАВ И ЗАЩИТА СТРАНИЦЫ
// ==========================================
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';
});

// ==========================================
// 2. ЗАГРУЗКА СПИСКА ПОЛЬЗОВАТЕЛЕЙ ДЛЯ СЕЛЕКТА
// ==========================================
onSnapshot(collection(db, "users"), (snapshot) => {
    const select = document.getElementById('user-select');
    if (!select) return;
    
    let users = [];
    snapshot.forEach(d => {
        if(d.data().status === 'active') users.push({ id: d.id, name: d.data().name });
    });
    users.sort((a, b) => a.name.localeCompare(b.name));

    let html = `<option value="" disabled selected>${window.t('select_publisher')}</option>`;
    users.forEach(u => { html += `<option value="${u.id}|${u.name}">${u.name}</option>`; });
    select.innerHTML = html;
});

// ==========================================
// 3. ОТРИСОВКА ЗАПРОСОВ
// ==========================================
onSnapshot(query(collection(db, "requests"), orderBy("createdAt", "desc")), (snapshot) => {
    const list = document.getElementById('requests-list');
    let html = '';
    let count = 0;

    snapshot.forEach(docSnap => {
        const req = docSnap.data();
        if (req.status === 'new') {
            count++;
            const date = new Date(req.createdAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short'});
            
            html += `
                <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors">
                    <div>
                        <p class="text-xs font-bold text-slate-800">${req.userName}</p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">📅 ${date}</p>
                    </div>
                    <div class="flex gap-1.5">
                        <button onclick="prepareIssue('${req.userId}', '${req.userName}', '${docSnap.id}')" title="${window.t('title_issue_terr')}" class="w-7 h-7 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm outline-none text-xs">➕</button>
                        <button onclick="deleteRequest('${docSnap.id}')" title="${window.t('delete')}" class="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm outline-none text-xs">✖</button>
                    </div>
                </div>
            `;
        }
    });

    document.getElementById('requests-count').innerText = count;
    list.innerHTML = html || `<p class="text-slate-400 italic text-xs text-center py-4 bg-slate-50 rounded-xl">${window.t('no_new_requests_terr')}</p>`;
});

window.prepareIssue = async (userId, userName, reqId) => {
    const select = document.getElementById('user-select');
    select.value = `${userId}|${userName}`;
    document.getElementById('territory-number').focus();
    await deleteDoc(doc(db, "requests", reqId));
};

window.deleteRequest = async (id) => {
    if (confirm(window.t('confirm_delete_request'))) await deleteDoc(doc(db, "requests", id));
};

// ==========================================
// 4. ВЫДАЧА УЧАСТКА
// ==========================================
const assignBtn = document.getElementById('assign-btn');
if(assignBtn) {
    assignBtn.addEventListener('click', async (e) => {
        const userData = document.getElementById('user-select').value;
        const terrNum = document.getElementById('territory-number').value.trim();

        if (!userData || !terrNum) return alert(window.t('alert_select_user_num'));

        const btn = e.target;
        btn.innerText = window.t('saving'); btn.disabled = true;

        const [userId, userName] = userData.split('|');

        try {
            await addDoc(collection(db, "territories"), {
                number: Number(terrNum),
                userId: userId,
                userName: userName,
                issuedAt: new Date().toISOString()
            });

            document.getElementById('user-select').value = '';
            document.getElementById('territory-number').value = '';
            
            btn.classList.replace('bg-slate-800', 'bg-emerald-500');
            btn.innerText = window.t('success_tick');
            setTimeout(() => { 
                btn.classList.replace('bg-emerald-500', 'bg-slate-800');
                btn.innerText = window.t('btn_assign'); btn.disabled = false; 
            }, 2000);
        } catch (err) { alert(window.t('error_general')); btn.disabled = false; btn.innerText = window.t('btn_assign'); }
    });
}

// ==========================================
// 5. ТАБЛИЦА ВЫДАННЫХ УЧАСТКОВ
// ==========================================
onSnapshot(query(collection(db, "territories"), orderBy("issuedAt", "desc")), (snapshot) => {
    const list = document.getElementById('territories-list');
    let html = '';

    snapshot.forEach(docSnap => {
        const terr = docSnap.data();
        const date = new Date(terr.issuedAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short', year: 'numeric'});
        
        html += `
            <tr class="hover:bg-slate-50 transition-colors user-row" data-search="${terr.number} ${terr.userName.toLowerCase()}">
                <td class="py-3 px-4 text-center">
                    <span class="bg-emerald-50 text-emerald-700 font-mono font-black border border-emerald-200 px-3 py-1.5 rounded-lg text-sm shadow-sm">${terr.number}</span>
                </td>
                <td class="py-3 px-4 font-bold text-slate-800 text-sm truncate">${terr.userName}</td>
                <td class="py-3 px-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">${date}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="returnTerritory('${docSnap.id}')" class="bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm outline-none">${window.t('btn_returned')}</button>
                </td>
            </tr>
        `;
    });

    if(list) list.innerHTML = html || `<tr><td colspan="4" class="text-slate-400 italic text-sm text-center py-8">${window.t('all_terr_free')}</td></tr>`;
});

// СДАЧА УЧАСТКА
window.returnTerritory = async (id) => {
    if (confirm(window.t('confirm_return'))) {
        await deleteDoc(doc(db, "territories", id));
    }
};

// ПОИСК ПО ТАБЛИЦЕ
const searchEl = document.getElementById('search-terr');
if(searchEl) {
    searchEl.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.user-row');
        rows.forEach(row => {
            if (row.getAttribute('data-search').includes(term)) row.style.display = '';
            else row.style.display = 'none';
        });
    });
}
