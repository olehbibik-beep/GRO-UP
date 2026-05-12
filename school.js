import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "school_title": "Управление Школой - GRO-UP", "school_h1": "Школа", "manage_tasks": "Управление заданиями", 
        "btn_stats": "Статистика", "schedule_title": "Назначенные задания", "loading": "Загрузка...", 
        "no_assigned_tasks": "Нет назначенных заданий.", "lesson": "Урок", "num_symbol": "№", 
        "assistant_short": "Пом:", "slip_header": "НАША ХРИСТИАНСКАЯ ЖИЗНЬ И СЛУЖЕНИЕ", 
        "slip_name": "Имя:", "slip_partner": "Помощник:", "slip_date": "Дата:", 
        "slip_notes": "Примечания для учащегося: Материал для задания и номер урока находятся в рабочей тетради.",
        "btn_back": "Назад", "back_home": "На главную", "assign_title": "Назначить", "ministry_skills": "Навыки служения",
        "student_label": "Ученик", "loading_students": "Ученик...", "assistant_label": "Помощник",
        "select_student_first": "Помощник...", "task_num": "№ Зад.", "task_type": "Тип",
        "opt_select": "Тип задания...", "cat_reading_db": "Чтение Библии", "cat_conversation": "Начинайте разговор",
        "cat_interest": "Развивайте интерес", "cat_disciples": "Подготавливайте учеников", "cat_beliefs": "Объясняйте свои взгляды",
        "cat_talk_db": "Речь", "task_lesson": "Урок", "task_date": "Дата выступления", "btn_assign": "Назначить",
        "no_students_found": "Нет участников школы", "no_assistant": "Без помощника",
        "err_talk_girls": "❌ Речь (Только братья)", "err_reading_girls": "❌ Чтение Библии (Братья)",
        "not_performed_yet": "⚠️ <span class='text-rose-500'>Еще не выступал(а)</span>", "last_performance": "💡 Последнее:",
        "alert_fill_all": "Пожалуйста, заполните все поля (Дата, Номер, Тип, Урок, Ученик)!", "success_assigned": "Добавлено!",
        "error_save": "Ошибка сохранения!", "saving": "...", "delete": "Удалить", "confirm_delete_task": "Точно удалить это задание?"
    },
    cs: {
        "school_title": "Správa školy - GRO-UP", "school_h1": "Škola", "manage_tasks": "Správa úkolů", 
        "btn_stats": "Statistika", "schedule_title": "Přiřazené úkoly", "loading": "Načítání...", 
        "no_assigned_tasks": "Žádné přiřazené úkoly.", "lesson": "Lekce", "num_symbol": "č.", 
        "assistant_short": "Pom:", "slip_header": "ÚKOL NA SHROMÁŽDĚNÍ NÁŠ KŘESŤANSKÝ ŽIVOT A SLUŽBA", 
        "slip_name": "Jméno:", "slip_partner": "Partner:", "slip_date": "Datum:", 
        "slip_notes": "Poznámky pro studenta: Podklady pro svůj úkol a číslo studijní lekce najdeš v Pracovním sešitě.",
        "btn_back": "Zpět", "back_home": "Na hlavní stránku", "assign_title": "Přiřadit", "ministry_skills": "Zlepšujme se ve službě",
        "student_label": "Student", "loading_students": "Student...", "assistant_label": "Pomocník",
        "select_student_first": "Pomocník...", "task_num": "Úkol č.", "task_type": "Typ",
        "opt_select": "Typ úkolu...", "cat_reading_db": "Čtení Bible", "cat_conversation": "Zahájení rozhovoru",
        "cat_interest": "Rozvíjení zájmu", "cat_disciples": "Čiňte učedníky", "cat_beliefs": "Vysvětlování své víry",
        "cat_talk_db": "Proslov", "task_lesson": "Lekce", "task_date": "Datum", "btn_assign": "Přiřadit",
        "no_students_found": "Žádní studenti", "no_assistant": "Bez pomocníka",
        "err_talk_girls": "❌ Proslov (Pouze bratři)", "err_reading_girls": "❌ Čtení Bible (Bratři)",
        "not_performed_yet": "⚠️ <span class='text-rose-500'>Zatím nevystupoval(a)</span>", "last_performance": "💡 Poslední:",
        "alert_fill_all": "Prosím, vyplňte všechna pole!", "success_assigned": "Přidáno!",
        "error_save": "Chyba při ukládání!", "saving": "...", "delete": "Smazat", "confirm_delete_task": "Opravdu smazat tento úkol?"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => dict[currentLang][key] || key;

function translateDbString(str) {
    if (!str) return '';
    const map = {
        "Начинайте разговор": "Zahájení rozhovoru",
        "Развивайте интерес": "Rozvíjení zájmu",
        "Подготавливайте учеников": "Činění učedníků",
        "Объясняйте свои взгляды": "Vysvětlování své víry",
        "Речь": "Proslov",
        "Чтение Библии": "Čtení Bible"
    };
    if (currentLang === 'cs' && map[str]) return map[str];
    return str;
}

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-slate-800 text-white px-4 py-3 rounded-md shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
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
            const lastDate = new Date(lastTask.date).toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' });
            
            let catStr = translateDbString(lastTask.category);

            hintBox.innerHTML = `${window.t('last_performance')} <span class="text-emerald-600">${lastDate} (${catStr})</span>`;
        }
    });
}

function getISOWeekString(dateString) {
    const dateObj = new Date(dateString);
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
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
        const oldHtml = btn.innerHTML;
        btn.innerHTML = `<span class="animate-spin mr-1">↻</span> ${window.t('saving')}`; 
        btn.disabled = true;

        const [userId, userName, userGender] = studentData.split('|');

        try {
            await addDoc(collection(db, "personal_tasks"), {
                userId: userId,
                userName: userName,
                assistant: assistantName === "Без помощника" ? "" : assistantName,
                taskNumber: tNum,
                category: tCat,
                lesson: tLes,
                date: tDate,
                weekId: getISOWeekString(tDate), // 🔥 МАГИЯ СВЯЗИ С РАСПИСАНИЕМ
                createdAt: new Date().toISOString()
            });

            document.getElementById('student-select').value = '';
            document.getElementById('assistant-select').innerHTML = `<option value="" selected>${window.t('select_student_first')}</option>`;
            document.getElementById('assistant-select').disabled = true;
            document.getElementById('task-number').value = '';
            document.getElementById('task-category').value = '';
            document.getElementById('task-lesson').value = '';
            document.getElementById('student-history-hint').classList.add('hidden');
            
            btn.classList.replace('bg-indigo-50', 'bg-emerald-50');
            btn.classList.replace('text-indigo-600', 'text-emerald-600');
            btn.classList.replace('border-indigo-100', 'border-emerald-200');
            btn.innerHTML = `✅ ${window.t('success_assigned')}`;
            
            setTimeout(() => { 
                btn.classList.replace('bg-emerald-50', 'bg-indigo-50');
                btn.classList.replace('text-emerald-600', 'text-indigo-600');
                btn.classList.replace('border-emerald-200', 'border-indigo-100');
                btn.innerHTML = oldHtml; 
                btn.disabled = false; 
            }, 2000);
        } catch (error) { 
            alert(window.t('error_save')); 
            btn.disabled = false; 
            btn.innerHTML = oldHtml; 
        }
    });
}

const q = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('tasks-list');
    const printArea = document.getElementById('print-area');
    allTasksCache = []; 
    
    if (snapshot.empty) {
        if(list) list.innerHTML = `<p class="text-slate-400 italic p-6 text-center text-sm bg-white rounded-xl border border-slate-200 shadow-sm">${window.t('no_assigned_tasks')}</p>`;
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

        const astHtml = t.assistant && t.assistant !== "Без помощника" ? `<span class="text-[10px] md:text-xs text-slate-500 font-bold block mt-0.5">${window.t('assistant_short')} <span class="text-jw-ministry">${t.assistant}</span></span>` : '';

        let catStr = translateDbString(t.category);

        html += `
            <div class="p-3 md:p-4 rounded-xl border relative overflow-hidden transition-all ${opacityClass}">
                <button onclick="deleteTask('${docSnap.id}')" class="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors z-10 outline-none" title="${window.t('delete')}">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                
                <div class="flex items-center justify-between mb-2 pr-8 border-b border-slate-100 pb-2">
                    <span class="font-black text-slate-800 text-sm md:text-base leading-tight truncate w-full">${t.userName}</span>
                    <span class="text-[9px] font-bold text-jw-ministry bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">${window.t('lesson')} ${t.lesson}</span>
                </div>
                
                <div class="flex items-center justify-between gap-2">
                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-1.5">
                            <span class="font-black text-slate-400 text-xs">${t.taskNumber}.</span>
                            <span class="font-bold text-slate-600 text-xs md:text-sm truncate">${catStr}</span>
                        </div>
                        ${astHtml}
                    </div>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200 px-2 py-1 rounded-md shadow-sm shrink-0">${tDate.toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' })}</span>
                </div>
            </div>
        `;

        // КАРТОЧКИ ДЛЯ ПЕЧАТИ
        if (!isPast) {
            const formattedDate = `${tDate.getDate()}.${tDate.getMonth() + 1}.${tDate.getFullYear()}`;
            printHtml += `
                <div style="break-inside: avoid; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; font-family: sans-serif; background-color: #f8fafc; position: relative; margin-bottom: 10px;">
                    <div style="position: absolute; top: 20px; right: 20px; background-color: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; border: 1px solid #fde68a;">
                        ${window.t('lesson')} ${t.lesson}
                    </div>
                    
                    <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b; font-weight: 900; text-transform: uppercase;">
                        ${t.taskNumber}. ${catStr}
                    </h3>
                    <p style="margin: 0 0 16px 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        ${window.t('slip_header')}
                    </p>

                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; font-size: 14px; margin-bottom: 16px;">
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_name')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${t.userName}</div>
                        
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_partner')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${t.assistant && t.assistant !== "Без помощника" ? t.assistant : '-'}</div>
                        
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_date')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${formattedDate}</div>
                    </div>

                    <div style="background-color: #ffffff; padding: 12px; border-radius: 6px; font-size: 10px; color: #475569; line-height: 1.4; border: 1px solid #e2e8f0;">
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
