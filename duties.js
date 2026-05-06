import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ЕДИНЫЙ ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ
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
        // Дежурства
        "duties_title": "График Дежурств - GRO-UP",
        "duties_h1": "График",
        "manage_duties": "Управление дежурствами",
        "assign_title": "Назначить",
        "duty_type_label": "Тип дежурства",
        "opt_cleaning": "🧹 Уборка зала",
        "opt_special_event": "⭐ Специальное событие",
        "start_group_label": "Начальная группа (можно 1, 2)",
        "ph_group_example": "Например: 1, 2",
        "start_monday_label": "С понедельника (Дата начала)",
        "auto_distribute": "Авто-раскидать на месяц",
        "how_many_weeks": "На сколько недель?",
        "btn_assign": "Назначить",
        "current_schedule": "Текущий график",
        "alert_select_monday": "Выберите дату понедельника!",
        "generating": "Генерация...",
        "success_with_tick": "Успешно! ✔️",
        "confirm_delete_duty": "Удалить дежурство из графика?",
        "all_groups": "Все",
        "no_duties_planned": "Предстоящих дежурств нет."
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
        // Дежурства
        "duties_title": "Rozpis služeb - GRO-UP",
        "duties_h1": "Rozpis",
        "manage_duties": "Správa služeb",
        "assign_title": "Přiřadit",
        "duty_type_label": "Typ služby",
        "opt_cleaning": "🧹 Úklid sálu",
        "opt_special_event": "⭐ Zvláštní událost",
        "start_group_label": "Počáteční skupina (lze 1, 2)",
        "ph_group_example": "Například: 1, 2",
        "start_monday_label": "Od pondělí (Datum začátku)",
        "auto_distribute": "Rozdělit na měsíc",
        "how_many_weeks": "Na kolik týdnů?",
        "btn_assign": "Přiřadit",
        "current_schedule": "Aktuální rozpis",
        "alert_select_monday": "Vyberte datum pondělí!",
        "generating": "Generování...",
        "success_with_tick": "Úspěšně! ✔️",
        "confirm_delete_duty": "Odstranit službu z rozpisu?",
        "all_groups": "Vše",
        "no_duties_planned": "Nejsou naplánovány žádné služby."
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

let isFullAdmin = false;

// 1. ПРОВЕРКА ПРАВ
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('duties.html') && !isOverseer) window.location.href = 'index.html';
});

// 2. СОХРАНЕНИЕ
document.getElementById('save-duty-btn').addEventListener('click', async (e) => {
    const type = document.getElementById('duty-type').value; // Всегда пишем в базу русские значения!
    const groupVal = document.getElementById('duty-group').value.trim() || "Все"; // Всегда пишем в базу "Все"
    const dateStr = document.getElementById('duty-date').value;
    
    const isRecurring = document.getElementById('duty-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('duty-weeks').value) : 1;

    if (!dateStr) return alert(window.t('alert_select_monday'));

    const btn = e.target;
    btn.innerText = window.t('generating'); btn.disabled = true;

    try {
        const baseDate = new Date(dateStr);
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); 
        baseDate.setDate(diff);

        let groupQueue = [groupVal];
        if (groupVal !== "Все") {
            groupQueue = groupVal.split(',').map(g => g.trim()).filter(g => g);
        }

        for (let i = 0; i < weeksCount; i++) {
            const startDate = new Date(baseDate);
            startDate.setDate(startDate.getDate() + (i * 7));
            
            const assignedGroup = groupQueue[i % groupQueue.length];

            // Сохраняем в базу ТОЛЬКО СЫРЫЕ данные (даты генерируем при отрисовке)
            await addDoc(collection(db, "duties"), {
                type: type, 
                group: assignedGroup,
                dateRange: "deprecated", // Оставил для старых версий, больше не используется
                rawDate: startDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('duty-group').value = '';
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = window.t('success_with_tick');
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = window.t('btn_assign'); 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { alert(window.t('error_network')); btn.disabled = false; btn.innerText = window.t('btn_assign'); }
});

// 3. ОТРИСОВКА И АВТОУДАЛЕНИЕ ПРОШЛЫХ
const q = query(collection(db, "duties"), orderBy("rawDate", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('duties-list');
    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);
    
    let renderedCount = 0;

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        
        const dutyStart = new Date(d.rawDate); dutyStart.setHours(0,0,0,0);
        const dutyEnd = new Date(dutyStart); dutyEnd.setDate(dutyStart.getDate() + 6); dutyEnd.setHours(23,59,59,999);

        // 🔥 АВТОУДАЛЕНИЕ ПРОШЛОЙ НЕДЕЛИ
        if (dutyEnd.getTime() < today.getTime()) {
            if (isFullAdmin) deleteDoc(doc(db, "duties", docSnap.id)); 
            return;
        }

        renderedCount++;
        
        // ДИНАМИЧЕСКИ ГЕНЕРИРУЕМ ДАТУ НА ТЕКУЩЕМ ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ!
        const startDay = dutyStart.getDate();
        const endDay = dutyEnd.getDate();
        const endMonth = dutyEnd.toLocaleDateString(localeFormat, { month: 'long' });
        let localizedDateRange = `${startDay} - ${endDay} ${endMonth}`;
        
        if (dutyStart.getMonth() !== dutyEnd.getMonth()) {
            const startMonth = dutyStart.toLocaleDateString(localeFormat, { month: 'short' });
            localizedDateRange = `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
        }

        // Перевод типа дежурства и группы
        let typeStr = d.type;
        if (typeStr === 'Уборка зала') typeStr = window.t('opt_cleaning').replace('🧹 ','');
        if (typeStr === 'Специальное событие') typeStr = window.t('opt_special_event').replace('⭐ ','');
        
        const groupStr = d.group === "Все" ? window.t('all_groups') : `${window.t('group_short')} ${d.group}`;

        html += `
            <div class="flex items-center justify-between p-4 border-b border-slate-100 transition-colors bg-white hover:bg-slate-50">
                <div class="flex items-center w-full min-w-0 pr-4">
                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2 truncate">
                            <h3 class="font-black text-slate-800 text-sm truncate">${typeStr}</h3>
                            <span class="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-md font-black uppercase shrink-0">${groupStr}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-0.5 truncate">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">📅 ${localizedDateRange}</p>
                        </div>
                    </div>
                </div>
                <button onclick="deleteDuty('${docSnap.id}')" class="text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 transition-colors p-2 rounded-lg text-lg outline-none border border-slate-100" title="${window.t('delete')}">🗑️</button>
            </div>
        `;
    });

    if(list) list.innerHTML = html || `<p class="text-slate-400 italic p-6 text-center text-sm">${window.t('no_duties_planned')}</p>`;
});

window.deleteDuty = (id) => {
    if (confirm(window.t('confirm_delete_duty'))) deleteDoc(doc(db, "duties", id));
};
