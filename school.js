import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ЕДИНЫЙ ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ (добавлены слова для статистики)
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
        "slip_header": "НАША ХРИСТИАНСКАЯ ЖИЗНЬ И СЛУЖЕНИЕ",
        "slip_name": "Имя:",
        "slip_partner": "Помощник:",
        "slip_date": "Дата:",
        "slip_lesson": "Урок в тетради:",
        "slip_notes": "Примечания для учащегося: Материал для задания и номер урока находятся в рабочей тетради.",
        "btn_stats": "Статистика",
        "school_stats": "Статистика школы",
        "student_progress": "Успеваемость учеников",
        "total_performances": "Всего заданий:",
        "no_performances": "Еще не выступал",
        "last_perf": "Последнее:"
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
        "slip_header": "ÚKOL NA SHROMÁŽDĚNÍ NÁŠ KŘESŤANSKÝ ŽIVOT A SLUŽBA",
        "slip_name": "Jméno:",
        "slip_partner": "Partner:",
        "slip_date": "Datum:",
        "slip_lesson": "Bod v pracovním sešitě:",
        "slip_notes": "Poznámky pro studenta: Podklady pro svůj úkol a číslo studijní lekce najdeš v Pracovním sešitě.",
        "btn_stats": "Statistika",
        "school_stats": "Statistika školy",
        "student_progress": "Pokrok studentů",
        "total_performances": "Celkem úkolů:",
        "no_performances": "Zatím nevystupoval",
        "last_perf": "Poslední:"
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

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    if (!isSchool) window.location.href = 'index.html';
});

const taskNumSelect = document.getElementById('task-number');
if (taskNumSelect) {
    for (let i = 1; i <= 20; i++) taskNumSelect.innerHTML += `<option value="${i}">${i}</option>`;
}
const taskLessonSelect = document.getElementById('task-lesson');
if (taskLessonSelect) {
    for (let i = 1; i <= 12; i++) taskLessonSelect.innerHTML += `<option value="${i}">${i}</option>`;
}

let allSchoolStudents = [];
let allTasksCache = []; 

onSnapshot(collection(db, "users"), (snapshot) => {
    allSchoolStudents = [];
    snapshot.forEach(d => {
        const u = d.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Участник школы')) {
            allSchoolStudents.push({ id: d.id, name: u.name, gender: u.gender });
        }
    });
    allSchoolStudents.sort((a, b) => a.name.localeCompare(b.name));

    const select = document.getElementById('student-select');
    if (!select) return;

    let html = `<option value="" disabled selected>${window.t('loading_students')}</option>`;
    allSchoolStudents.forEach(s => {
        html += `<option value="${s.id}|${s.name}|${s.gender}">${s.name}</option>`;
    });
    select.innerHTML = html || `<option value="" disabled>${window.t('no_students_found')}</option>`;
});

const studentSelectEl = document.getElementById('student-select');
if (studentSelectEl) {
    studentSelectEl.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (!selectedValue) return;

        const [selectedId, selectedName, selectedGender] = selectedValue.split('|');
        const assistantSelect = document.getElementById('assistant-select');
        const categorySelect = document.getElementById('task-category');
        const talkOption = document.getElementById('cat-talk'); 
        const readOption = document.getElementById('cat-reading'); 

        assistantSelect.disabled = false;
        let astHtml = `<option value="Без помощника">${window.t('no_assistant')}</option>`;
        allSchoolStudents.forEach(s => {
            if (s.gender === selectedGender && s.id !== selectedId) {
                astHtml += `<option value="${s.name}">${s.name}</option>`;
            }
        });
        assistantSelect.innerHTML = astHtml;

        if (selectedGender === 'girl') {
            if(talkOption) { talkOption.disabled = true; talkOption.innerText = window.t('err_talk_girls'); }
            if(readOption) { readOption.disabled = true; readOption.innerText = window.t('err_reading_girls'); }
            if (categorySelect && (categorySelect.value === 'РЕЧЬ' || categorySelect.value === 'ЧТЕНИЕ БИБЛИИ')) categorySelect.value = '';
        } else {
            if(talkOption) { talkOption.disabled = false; talkOption.innerText = window.t('cat_talk_db'); }
            if(readOption) { readOption.disabled = false; readOption.innerText = window.t('cat_reading_db'); }
        }

        const hintBox = document.getElementById('student-history-hint');
        hintBox.classList.remove('hidden');
        
        const userTasks = allTasksCache.filter(t => t.userId === selectedId);
        
        if (userTasks.length === 0) {
            hintBox.innerHTML = window.t('not_performed_yet');
        } else {
            userTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastTask = userTasks[0];
            const lastDate = new Date(lastTask.date).toLocaleDateString(localeFormat, { day: 'numeric', month: 'long' });
            
            let catStr = lastTask.category;
            if (catStr === 'ЧТЕНИЕ БИБЛИИ') catStr = window.t('cat_reading_db').replace('📖 ','');
            if (catStr === 'НАЧИНАЙТЕ РАЗГОВОР') catStr = window.t('cat_conversation').replace('🗣️ ','');
            if (catStr === 'РАЗВИВАЙТЕ ИНТЕРЕС') catStr = window.t('cat_interest').replace('🌱 ','');
            if (catStr === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') catStr = window.t('cat_disciples').replace('👥 ','');
            if (catStr === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') catStr = window.t('cat_beliefs').replace('💡 ','');
            if (catStr === 'РЕЧЬ') catStr = window.t('cat_talk_db').replace('🎙️ ','');

            hintBox.innerHTML = `${window.t('last_performance')} <span class="text-emerald-600">${lastDate} (${catStr})</span>`;
        }
    });
}

const assignBtn = document.getElementById('assign-btn');
if (assignBtn) {
    assignBtn.addEventListener('click', async (e) => {
        const studentData = document.getElementById('student-select').value;
        const assistantName = document.getElementById('assistant-select').value;
        const tNum = document.getElementById('task-number').value;
        const tCat = document.getElementById('task-category').value;
        const tLes = document.getElementById('task-lesson').value;
        const tDate = document.getElementById('task-date').value;

        if (!studentData || !tNum || !tCat || !tLes || !tDate) {
            return alert(window.t('alert_fill_all'));
        }

        const btn = e.target;
        btn.innerText = window.t('saving'); btn.disabled = true;

        const [userId, userName, userGender] = studentData.split('|');
        const iconUrl = "https://olehbibik-beep.github.io/GRO-UP/icon-512.png";

        try {
            await addDoc(collection(db, "personal_tasks"), {
                userId: userId,
                userName: userName,
                assistant: assistantName === "Без помощника" ? "" : assistantName,
                taskNumber: tNum,
                category: tCat,
                lesson: tLes,
                date: tDate,
                notificationIcon: iconUrl,
                notificationBadge: iconUrl,
                createdAt: new Date().toISOString()
            });

            document.getElementById('student-select').value = '';
            document.getElementById('assistant-select').innerHTML = `<option value="" selected>${window.t('select_student_first')}</option>`;
            document.getElementById('assistant-select').disabled = true;
            document.getElementById('task-number').value = '';
            document.getElementById('task-category').value = '';
            document.getElementById('task-lesson').value = '';
            document.getElementById('task-date').value = '';
            document.getElementById('student-history-hint').classList.add('hidden');
            
            btn.classList.replace('bg-slate-800', 'bg-emerald-500');
            btn.innerText = window.t('success_assigned');
            setTimeout(() => { 
                btn.classList.replace('bg-emerald-500', 'bg-slate-800');
                btn.innerText = window.t('btn_assign'); 
                btn.disabled = false; 
            }, 2000);
        } catch (error) { 
            alert(window.t('error_save')); 
            btn.disabled = false; 
            btn.innerText = window.t('btn_assign'); 
        }
    });
}

const q = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('tasks-list');
    const printArea = document.getElementById('print-area');
    allTasksCache = []; 
    
    if (snapshot.empty) {
        if(list) list.innerHTML = `<p class="text-slate-400 italic p-6 text-center text-sm bg-white rounded-xl border border-slate-200">${window.t('no_assigned_tasks')}</p>`;
        if(printArea) printArea.innerHTML = '';
        return;
    }

    let html = '';
    let printHtml = ''; 
    const today = new Date(); today.setHours(0,0,0,0);

    snapshot.forEach(docSnap => {
        const t = docSnap.data();
        allTasksCache.push(t); 
        
        const tDate = new Date(t.date);
        const isPast = tDate < today;
        const opacityClass = isPast ? "opacity-60 grayscale bg-slate-50 border-slate-200" : "bg-white border-slate-200 shadow-sm";

        const astHtml = t.assistant && t.assistant !== "Без помощника" ? `<span class="text-[11px] md:text-xs text-slate-500 font-bold block mt-0.5">${window.t('assistant_short')} <span class="text-sky-600">${t.assistant}</span></span>` : '';

        let catStr = t.category;
        if (catStr === 'ЧТЕНИЕ БИБЛИИ') catStr = window.t('cat_reading_db').replace('📖 ','');
        if (catStr === 'НАЧИНАЙТЕ РАЗГОВОР') catStr = window.t('cat_conversation').replace('🗣️ ','');
        if (catStr === 'РАЗВИВАЙТЕ ИНТЕРЕС') catStr = window.t('cat_interest').replace('🌱 ','');
        if (catStr === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') catStr = window.t('cat_disciples').replace('👥 ','');
        if (catStr === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') catStr = window.t('cat_beliefs').replace('💡 ','');
        if (catStr === 'РЕЧЬ') catStr = window.t('cat_talk_db').replace('🎙️ ','');

        html += `
            <div class="p-4 md:p-5 rounded-xl border relative overflow-hidden transition-all ${opacityClass}">
                <button onclick="deleteTask('${docSnap.id}')" class="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded-lg transition-colors z-10 outline-none" title="${window.t('delete')}">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                
                <div class="flex items-start mb-4 pr-10">
                    <div class="flex gap-3 md:gap-4 items-center">
                        <div class="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 ${isPast ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-sky-50 border-sky-100 text-sky-500'} rounded-lg border shrink-0">
                            <span class="text-[8px] md:text-[9px] uppercase font-bold leading-none mb-1 tracking-widest">${tDate.toLocaleDateString(localeFormat, { month: 'short' }).replace('.', '')}</span>
                            <span class="text-xl md:text-2xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-sky-700'}">${tDate.getDate()}</span>
                        </div>
                        <div class="min-w-0">
                            <h3 class="font-black text-slate-800 text-sm md:text-base leading-tight truncate">${t.userName}</h3>
                            ${astHtml}
                        </div>
                    </div>
                </div>
                
                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-grow min-w-0">
                        <span class="bg-slate-800 text-white px-2 py-1 rounded shadow-sm flex items-center shrink-0">
                            <span class="text-[8px] uppercase tracking-widest font-bold text-slate-400 mr-1">${window.t('num_symbol')}</span>
                            <span class="text-sm font-black leading-none">${t.taskNumber}</span>
                        </span>
                        <span class="font-black text-sky-700 text-[9px] md:text-[10px] uppercase tracking-wide leading-tight whitespace-normal break-words">${catStr}</span>
                    </div>
                    <span class="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded shrink-0 whitespace-nowrap">${window.t('lesson')} ${t.lesson}</span>
                </div>
            </div>
        `;

        // 🔥 КРАСИВЫЕ КАРТОЧКИ ДЛЯ ПЕЧАТИ (как в мобильном приложении)
        if (!isPast) {
            const formattedDate = `${tDate.getDate()}.${tDate.getMonth() + 1}.${tDate.getFullYear()}`;
            printHtml += `
                <div style="break-inside: avoid; border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; font-family: sans-serif; background-color: #f8fafc; position: relative; margin-bottom: 10px;">
                    <div style="position: absolute; top: 20px; right: 20px; background-color: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold;">
                        ${window.t('lesson')} ${t.lesson}
                    </div>
                    
                    <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #1e1b4b; font-weight: 900; text-transform: uppercase;">
                        ${catStr}
                    </h3>
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        ÚKOL NA SHROMÁŽDĚNÍ<br>${window.t('slip_header')}
                    </p>

                    <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; font-size: 14px; margin-bottom: 16px;">
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_name')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${t.userName}</div>
                        
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_partner')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${t.assistant && t.assistant !== "Без помощника" ? t.assistant : '-'}</div>
                        
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_date')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${formattedDate}</div>
                    </div>

                    <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 11px; color: #475569; line-height: 1.4;">
                        <b>${window.t('slip_notes')}</b>
                    </div>
                </div>
            `;
        }
    });

    if(list) list.innerHTML = html;
    if(printArea) printArea.innerHTML = printHtml;
});

window.deleteTask = (id) => {
    if (confirm(window.t('confirm_delete_task'))) {
        deleteDoc(doc(db, "personal_tasks", id));
    }
};
