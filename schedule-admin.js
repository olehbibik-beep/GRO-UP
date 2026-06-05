import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "schedule_for": "График для:", "btn_draft": "Сохранить черновик", "btn_publish": "Опубликовать", "btn_delete": "Удалить",
        "btn_print": "Печать", "program_title": "Программа встреч собрания",
        "midweek_meeting": "Будние дни", "chairman_intro": "Председатель / Вступление",
        "treasures_title": "Сокровища из слова бога", "spiritual_gems": "Духовные жемчужины", "bible_reading": "Чтение Библии",
        "ministry_skills": "Навыки служения", "pulled_from_school": "Подтягивается из школы", "christian_living": "Христианская жизнь",
        "congregation_bible_study": "Изучение Библии", "closing_prayer": "Заключительная молитва", "weekend_meeting": "Выходные дни",
        "opening_song": "Вступительные слова / Песня", "public_talk": "Публичная речь", "watchtower_study": "Изучение Сторожевой Башни",
        "add_btn": "+ Добавить", "saving": "Сохранение...", "published": "ОПУБЛИКОВАНО", "draft": "ЧЕРНОВИК", "new_schedule": "НОВЫЙ ГРАФИК",
        "success_pub": "График опубликован!", "success_draft": "Черновик сохранен", "error_save": "Ошибка сохранения!",
        "confirm_del": "Точно удалить этот график навсегда?", "success_del": "График успешно удален!", "error_del": "Ошибка удаления!",
        "part": "Задание", "assistant_short": "Пом:", "conductor": "Ведущий", "reader": "Чтец",
        "months": ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"]
    },
    cs: {
        "schedule_for": "Rozvrh pro:", "btn_draft": "Uložit koncept", "btn_publish": "Publikovat", "btn_delete": "Smazat",
        "btn_print": "Tisk", "program_title": "Program shromáždění sboru",
        "midweek_meeting": "Všední dny", "chairman_intro": "Předsedající / Úvod",
        "treasures_title": "Poklady z Božího slova", "spiritual_gems": "Hledání duchovních drahokamů", "bible_reading": "Čtení Bible",
        "ministry_skills": "Zlepšujme se ve službě", "pulled_from_school": "Načítá se ze školy", "christian_living": "Křesťanský život",
        "congregation_bible_study": "Sborové studium Bible", "closing_prayer": "Závěrečná modlitba", "weekend_meeting": "Víkend",
        "opening_song": "Úvodní slova / Píseň", "public_talk": "Veřejná přednáška", "watchtower_study": "Studium Strážné věže",
        "add_btn": "+ Přidat", "saving": "Ukládání...", "published": "PUBLIKOVÁNO", "draft": "KONCEPT", "new_schedule": "NOVÝ ROZVRH",
        "success_pub": "Rozvrh byl publikován!", "success_draft": "Koncept byl uložen", "error_save": "Chyba při ukládání!",
        "confirm_del": "Opravdu chcete tento rozvrh trvale smazat?", "success_del": "Rozvrh byl úspěšně smazán!", "error_del": "Chyba při mazání!",
        "part": "Úkol", "assistant_short": "Pom:", "conductor": "Předsedající", "reader": "Čte",
        "months": ["Ledna", "Února", "Března", "Dubna", "Května", "Června", "Července", "Srpna", "Září", "Října", "Listopadu", "Prosince"]
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
window.t = (key) => (dict[currentLang] && dict[currentLang][key]) ? dict[currentLang][key] : key;

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => { el.innerHTML = window.t(el.getAttribute('data-lang')); });
};
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', applyTranslations); } 
else { applyTranslations(); }

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
const userId = localStorage.getItem('userId');

if (!userId) window.location.href = 'login.html';

getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const canAccess = roles.includes("Ответственный за график") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!canAccess) window.location.href = 'index.html';
    else {
        loadUsersForDatalists();
        setCurrentWeek();
    }
});

let ministryParts = [];
let livingParts = [];

function getISOWeekString(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); 
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getDateFromWeekString(weekStr) {
    if (!weekStr) return new Date();
    const [year, week] = weekStr.split('-W');
    const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
    const day = simpleDate.getDay();
    const diff = simpleDate.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(simpleDate.setDate(diff));
}

function getNextWeekRaw(currentWeekRaw, offsetWeeks) {
    const d = getDateFromWeekString(currentWeekRaw);
    d.setDate(d.getDate() + offsetWeeks * 7);
    return getISOWeekString(d);
}

// === ИСПРАВЛЕННЫЙ ВЫЗОВ ФУНКЦИИ loadSchedule ===
async function loadSchedule() {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    document.querySelectorAll('.jw-input').forEach(input => input.value = '');
    ministryParts = [];
    livingParts = [];
    document.getElementById('save-status').innerText = "...";

    try {
        const docSnap = await getDoc(doc(db, "meeting_schedules", weekId));
        
        if (docSnap.exists()) {
            const d = docSnap.data();
            
            document.getElementById('delete-btn').classList.remove('hidden');
            document.getElementById('delete-btn').classList.add('inline-block'); // Показываем кнопку удаления

            if(d.isPublished) {
                document.getElementById('save-status').innerText = window.t('published');
                document.getElementById('save-status').classList.replace('text-slate-400', 'text-emerald-500');
            } else {
                document.getElementById('save-status').innerText = window.t('draft');
                document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
            }

            document.getElementById('mw-chairman-name').value = d.mw_chairman_name || '';
            document.getElementById('mw-treasure-title').value = d.mw_treasure_title || '';
            document.getElementById('mw-treasure-name').value = d.mw_treasure_name || '';
            document.getElementById('mw-gems-name').value = d.mw_gems_name || '';
            document.getElementById('mw-reading-name').value = d.mw_reading_name || '';

            ministryParts = d.ministryParts || [];
            
            if (d.livingParts && d.livingParts.length > 0) {
                livingParts = d.livingParts;
            } else if (d.mw_local_name || d.mw_local_title) {
                livingParts = [{
                    title: d.mw_local_title || 'Местные потребности',
                    name: d.mw_local_name || ''
                }];
            } else {
                livingParts = [{title: "Местные потребности", name: ""}];
            }

            document.getElementById('mw-cbs-material').value = d.mw_cbs_material || '';
            document.getElementById('mw-cbs-conductor').value = d.mw_cbs_conductor || '';
            document.getElementById('mw-cbs-reader').value = d.mw_cbs_reader || '';
            document.getElementById('mw-prayer-name').value = d.mw_prayer_name || '';
            document.getElementById('we-opening-name').value = d.we_opening_name || '';
            document.getElementById('we-talk-title').value = d.we_talk_title || '';
            document.getElementById('we-talk-speaker').value = d.we_talk_speaker || '';
            document.getElementById('we-wt-conductor').value = d.we_wt_conductor || '';
            document.getElementById('we-wt-reader').value = d.we_wt_reader || '';
            document.getElementById('we-prayer-name').value = d.we_prayer_name || '';
        } else {
            document.getElementById('delete-btn').classList.add('hidden');
            document.getElementById('delete-btn').classList.remove('inline-block');

            document.getElementById('save-status').innerText = window.t('new_schedule');
            document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
            
            const q = query(collection(db, "personal_tasks"), where("weekId", "==", weekIdRaw));
            const tasksSnap = await getDocs(q);
            
            let fetchedMinistryParts = [];
            let fetchedReadingName = '';

            if (!tasksSnap.empty) {
                let tasksForThisWeek = [];
                tasksSnap.forEach(doc => tasksForThisWeek.push(doc.data()));
                tasksForThisWeek.sort((a,b) => parseInt(a.taskNumber) - parseInt(b.taskNumber));

                tasksForThisWeek.forEach(t => {
                    let cat = t.category;
                    if (cat === 'ЧТЕНИЕ БИБЛИИ' || cat === 'Čtení Bible' || cat === 'Чтение Библии') {
                        fetchedReadingName = t.userName;
                    } else {
                        if (cat === 'НАЧИНАЙТЕ РАЗГОВОР') cat = 'Начинайте разговор';
                        if (cat === 'РАЗВИВАЙТЕ ИНТЕРЕС') cat = 'Развивайте интерес';
                        if (cat === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') cat = 'Подготавливайте учеников';
                        if (cat === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') cat = 'Объясняйте свои взгляды';
                        if (cat === 'РЕЧЬ') cat = 'Речь';

                        fetchedMinistryParts.push({
                            type: cat,
                            student: t.userName,
                            assistant: t.assistant && t.assistant !== "Без помощника" ? t.assistant : ""
                        });
                    }
                });
            }

            if (fetchedReadingName) {
                document.getElementById('mw-reading-name').value = fetchedReadingName;
            }

            ministryParts = fetchedMinistryParts; 

            livingParts = [
                {title: "Местные потребности", name: ""}
            ];
        }
        renderMinistryParts();
        renderLivingParts();
        updateNumeration(); 
    } catch(e) { console.error(e); }
}
// Делаем функцию доступной глобально
window.loadSchedule = loadSchedule;

window.changeWeek = (offset) => {
    const input = document.getElementById('week-selector');
    if (!input.value) return;
    const currentDate = getDateFromWeekString(input.value);
    currentDate.setDate(currentDate.getDate() + (offset * 7));
    input.value = getISOWeekString(currentDate);
    window.loadSchedule(); // <--- Здесь была скрытая ошибка!
};

function setCurrentWeek() {
    const today = new Date();
    document.getElementById('week-selector').value = getISOWeekString(today);
    document.getElementById('schedule-form').classList.remove('hidden');
    
    const langSelector = document.getElementById('schedule-lang');
    if (langSelector) langSelector.value = currentLang;

    window.loadSchedule(); // <--- И здесь!
}

function loadUsersForDatalists() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        const listBrothers = document.getElementById('list-brothers');
        const listSchool = document.getElementById('list-school');
        let brothersHtml = ''; let schoolHtml = '';
        
        let allUsers = [];
        snapshot.forEach(docSnap => allUsers.push(docSnap.data()));
        allUsers.sort((a,b) => a.name.localeCompare(b.name));

        allUsers.forEach(u => {
            if (u.status !== 'active') return;
            if (u.gender === 'boy') brothersHtml += `<option value="${u.name}">`;
            if (u.roles && u.roles.includes('Участник школы')) schoolHtml += `<option value="${u.name}">`;
        });
        listBrothers.innerHTML = brothersHtml; listSchool.innerHTML = schoolHtml;
    });
}

function updateNumeration() {
    let currentNumber = 1;
    document.querySelectorAll('.part-number').forEach(el => {
        el.innerText = `${currentNumber}.`;
        currentNumber++;
    });
}

function renderMinistryParts() {
    const container = document.getElementById('ministry-parts-container');
    if(!container) return;
    let html = '';
    
    if (ministryParts.length === 0) {
        html = `<p class="text-slate-400 text-[10px] italic py-3 text-center border border-slate-200 border-dashed rounded-lg bg-slate-50">${window.t('pulled_from_school')}</p>`;
    } else {
        ministryParts.forEach((part, index) => {
            const assistText = part.assistant ? `<span class="text-slate-400 font-normal mr-1">${window.t('assistant_short')}</span> ${part.assistant}` : `<span class="opacity-50">Без помощника</span>`;
            
            html += `
                <div class="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
                    <div class="flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <span class="part-number text-[11px] font-black text-jw-ministry"></span>
                        <span class="text-[12px] font-bold text-jw-ministry w-full truncate">${part.type || window.t('part')}</span>
                    </div>
                    <div class="flex flex-col md:flex-row gap-2 w-full mt-1">
                        <span class="md:w-1/2 text-[13px] font-black text-slate-800 border-b border-slate-200 pb-0.5 truncate">${part.student || '-'}</span>
                        <span class="md:w-1/2 text-[10px] font-bold text-slate-600 border-b border-slate-200 pb-0.5 truncate">${assistText}</span>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
    updateNumeration();
}

window.addLivingPart = () => {
    saveLivingState();
    livingParts.push({ title: "", name: "" });
    renderLivingParts();
};

window.removeLivingPart = (index) => {
    saveLivingState();
    livingParts.splice(index, 1);
    renderLivingParts();
};

function saveLivingState() {
    const container = document.getElementById('living-parts-container');
    if(!container) return;
    livingParts.forEach((part, index) => {
        const titleEl = document.getElementById(`part-liv-${index}-title`);
        const nameEl = document.getElementById(`part-liv-${index}-name`);
        if(titleEl) part.title = titleEl.value;
        if(nameEl) part.name = nameEl.value;
    });
}

function renderLivingParts() {
    const container = document.getElementById('living-parts-container');
    if(!container) return;
    let html = '';
    livingParts.forEach((part, index) => {
        html += `
            <div class="flex flex-col px-2 relative pr-8 pb-2 border-b border-slate-100 last:border-0 gap-1">
                <div class="flex items-center gap-1.5">
                    <span class="part-number text-[10px] font-black text-jw-living"></span>
                    <input type="text" id="part-liv-${index}-title" list="living-types" class="text-xs font-bold text-jw-living bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full" value="${part.title || ''}" placeholder="Тема пункта...">
                </div>
                <input type="text" id="part-liv-${index}-name" list="list-brothers" class="jw-input mt-1" value="${part.name || ''}" placeholder="Имя брата">
                <button onclick="removeLivingPart(${index})" class="absolute top-2 right-0 text-slate-300 hover:text-red-500 font-black outline-none transition-colors text-lg" title="Удалить">✖</button>
            </div>
        `;
    });
    container.innerHTML = html;
    updateNumeration();
}

window.saveSchedule = async (isPublished) => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    saveLivingState();

    const btn = isPublished ? document.getElementById('publish-btn') : document.getElementById('save-draft-btn');
    const originalSvg = btn.innerHTML;
    btn.innerHTML = `<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`;
    btn.disabled = true;

    const scheduleData = {
        weekId: weekId, 
        realWeekId: weekIdRaw, 
        lang: scheduleLang, 
        isPublished: isPublished,
        updatedAt: new Date().toISOString(),

        mw_chairman_name: document.getElementById('mw-chairman-name').value.trim(),
        mw_treasure_title: document.getElementById('mw-treasure-title').value.trim(),
        mw_treasure_name: document.getElementById('mw-treasure-name').value.trim(),
        mw_gems_name: document.getElementById('mw-gems-name').value.trim(),
        mw_reading_name: document.getElementById('mw-reading-name').value.trim(),

        ministryParts: ministryParts,
        livingParts: livingParts,
        
        mw_cbs_material: document.getElementById('mw-cbs-material').value.trim(),
        mw_cbs_conductor: document.getElementById('mw-cbs-conductor').value.trim(),
        mw_cbs_reader: document.getElementById('mw-cbs-reader').value.trim(),
        mw_prayer_name: document.getElementById('mw-prayer-name').value.trim(),

        we_opening_name: document.getElementById('we-opening-name').value.trim(),
        we_talk_title: document.getElementById('we-talk-title').value.trim(),
        we_talk_speaker: document.getElementById('we-talk-speaker').value.trim(),
        we_wt_conductor: document.getElementById('we-wt-conductor').value.trim(),
        we_wt_reader: document.getElementById('we-wt-reader').value.trim(),
        we_prayer_name: document.getElementById('we-prayer-name').value.trim(),
    };

    try {
        await setDoc(doc(db, "meeting_schedules", weekId), scheduleData);
        window.showToast(isPublished ? window.t('success_pub') : window.t('success_draft'));
        document.getElementById('save-status').innerText = isPublished ? window.t('published') : window.t('draft');
        if(isPublished) document.getElementById('save-status').classList.replace('text-slate-400', 'text-emerald-500');
        else document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
        
        document.getElementById('delete-btn').classList.remove('hidden');
        document.getElementById('delete-btn').classList.add('inline-block');
    } catch (e) { alert(window.t('error_save')); }
    
    btn.innerHTML = originalSvg;
    btn.disabled = false;
};

window.deleteSchedule = async () => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;
    const weekId = `${weekIdRaw}-${scheduleLang}`;

    if(confirm(window.t('confirm_del'))) {
        try {
            await deleteDoc(doc(db, "meeting_schedules", weekId));
            await deleteDoc(doc(db, "meeting_schedules", weekIdRaw)); 
            
            window.showToast(window.t('success_del'));
            window.loadSchedule(); 
        } catch(e) {
            alert(window.t('error_del'));
        }
    }
};

// ==============================
// ЛОГИКА РАСПЕЧАТКИ ГРАФИКА (4 НЕДЕЛИ - НА ВЕСЬ ЛИСТ А4)
// ==============================
function formatWeekForPrint(weekStr) {
    if (!weekStr) return "";
    const [year, week] = weekStr.split('-W');
    const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
    const day = simpleDate.getDay();
    const diff = simpleDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(simpleDate.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const m1 = window.t('months') ? window.t('months')[monday.getMonth()] : monday.getMonth()+1;
    const m2 = window.t('months') ? window.t('months')[sunday.getMonth()] : sunday.getMonth()+1;

    if (monday.getMonth() === sunday.getMonth()) {
        return `${monday.getDate()} - ${sunday.getDate()} ${m1} ${year}`;
    } else {
        return `${monday.getDate()} ${m1} - ${sunday.getDate()} ${m2} ${year}`;
    }
}

function buildCompactWeekHtml(data, weekRaw, isLast = false) {
    const borderStyle = isLast ? 'none' : '2px dashed #cbd5e1'; 
    
    if (!data) return `
        <div style="flex: 1; border-bottom: ${borderStyle}; padding-bottom: 5px; display: flex; flex-direction: column; justify-content: center;">
            <div style="text-align:center; font-weight:900; font-size:16px; margin-bottom:2px; text-transform:uppercase; color: #0f172a;">${formatWeekForPrint(weekRaw)}</div>
            <div style="text-align:center; font-size:13px; color:#94a3b8; font-style: italic;">Нет данных на эту неделю</div>
        </div>`;

    const row = (label, name) => {
        if (!name || name.trim() === '') return '';
        return `<div style="display:flex; justify-content:space-between; margin-bottom: 5px; font-size: 13px; line-height: 1.2;">
                    <span style="color: #475569; padding-right: 6px;">${label}</span>
                    <strong style="color: #0f172a; text-align: right; max-width: 65%; word-break: break-word;">${name}</strong>
                </div>`;
    };

    const sectionHeader = (title, bgColor, iconSvg) => {
        return `<div style="margin-top:6px; margin-bottom:6px; font-weight:900; font-size:12px; background:${bgColor}; color:white; padding:3px 6px; text-transform:uppercase; border-radius: 4px; display: flex; align-items: center; gap: 5px;">
                    ${iconSvg} <span>${title}</span>
                </div>`;
    };

    const iconTreasure = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
    const iconMinistry = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
    const iconLiving = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
    const iconWeekend = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

    let leftCol = '';
    leftCol += row(window.t('chairman_intro'), data.mw_chairman_name);
    
    let treasures = row(data.mw_treasure_title || window.t('part'), data.mw_treasure_name);
    treasures += row(window.t('spiritual_gems'), data.mw_gems_name);
    treasures += row(window.t('bible_reading'), data.mw_reading_name);
    if (treasures.trim()) {
        leftCol += sectionHeader(window.t('treasures_title'), '#0d9488', iconTreasure);
        leftCol += treasures;
    }

    let ministry = '';
    (data.ministryParts || []).forEach(p => {
        if(!p.student || p.student.trim() === '') return;
        let ast = p.assistant && p.assistant !== "Без помощника" ? ` (Пом: ${p.assistant})` : '';
        ministry += row(p.type, `${p.student}${ast}`);
    });
    if (ministry.trim()) {
        leftCol += sectionHeader(window.t('ministry_skills'), '#d97706', iconMinistry);
        leftCol += ministry;
    }

    let living = '';
    (data.livingParts || []).forEach(p => {
        if(!p.name || p.name.trim() === '') return;
        living += row(p.title || window.t('part'), p.name);
    });
    let cbsCond = data.mw_cbs_conductor || '';
    let cbsRead = data.mw_cbs_reader ? ` (${window.t('reader')}: ${data.mw_cbs_reader})` : '';
    if (cbsCond.trim()) {
        living += row(`${window.t('congregation_bible_study')} ${data.mw_cbs_material ? `(${data.mw_cbs_material})` : ''}`, `${cbsCond}${cbsRead}`);
    }
    living += row(window.t('closing_prayer'), data.mw_prayer_name);
    if (living.trim()) {
        leftCol += sectionHeader(window.t('christian_living'), '#b91c1c', iconLiving);
        leftCol += living;
    }

    let rightCol = '';
    rightCol += row(window.t('opening_song'), data.we_opening_name);
    
    if (data.we_talk_speaker && data.we_talk_speaker.trim() !== '') {
        rightCol += sectionHeader(window.t('public_talk'), '#475569', iconWeekend);
        rightCol += row(data.we_talk_title || window.t('public_talk'), data.we_talk_speaker);
    }

    let wt = row(window.t('conductor'), data.we_wt_conductor);
    wt += row(window.t('reader'), data.we_wt_reader);
    if (wt.trim()) {
        rightCol += sectionHeader(window.t('watchtower_study'), '#475569', iconWeekend);
        rightCol += wt;
    }
    rightCol += row(window.t('closing_prayer'), data.we_prayer_name);

    return `
    <div style="flex: 1; border-bottom: ${borderStyle}; padding-bottom: 10px; display: flex; flex-direction: column;">
        <div style="text-align:center; font-weight:900; font-size:16px; margin-bottom:6px; text-transform:uppercase; color: #0f172a;">${formatWeekForPrint(weekRaw)}</div>
        <div style="display:flex; gap:35px; flex: 1;">
            <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-start;">${leftCol}</div>
            <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-start;">${rightCol}</div>
        </div>
    </div>
    `;
}

window.printSchedule = async () => {
    saveLivingState(); 

    const btn = document.getElementById('print-btn');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`;
    btn.disabled = true;

    try {
        const week1Raw = document.getElementById('week-selector').value;
        const week2Raw = getNextWeekRaw(week1Raw, 1);
        const week3Raw = getNextWeekRaw(week1Raw, 2);
        const week4Raw = getNextWeekRaw(week1Raw, 3);
        const lang = document.getElementById('schedule-lang').value || 'ru';

        const week1Data = {
            mw_chairman_name: document.getElementById('mw-chairman-name').value.trim(),
            mw_treasure_title: document.getElementById('mw-treasure-title').value.trim(),
            mw_treasure_name: document.getElementById('mw-treasure-name').value.trim(),
            mw_gems_name: document.getElementById('mw-gems-name').value.trim(),
            mw_reading_name: document.getElementById('mw-reading-name').value.trim(),
            ministryParts: ministryParts,
            livingParts: livingParts,
            mw_cbs_material: document.getElementById('mw-cbs-material').value.trim(),
            mw_cbs_conductor: document.getElementById('mw-cbs-conductor').value.trim(),
            mw_cbs_reader: document.getElementById('mw-cbs-reader').value.trim(),
            mw_prayer_name: document.getElementById('mw-prayer-name').value.trim(),
            we_opening_name: document.getElementById('we-opening-name').value.trim(),
            we_talk_title: document.getElementById('we-talk-title').value.trim(),
            we_talk_speaker: document.getElementById('we-talk-speaker').value.trim(),
            we_wt_conductor: document.getElementById('we-wt-conductor').value.trim(),
            we_wt_reader: document.getElementById('we-wt-reader').value.trim(),
            we_prayer_name: document.getElementById('we-prayer-name').value.trim()
        };

        const getWData = async (raw) => {
            const snap = await getDoc(doc(db, "meeting_schedules", `${raw}-${lang}`));
            return snap.exists() ? snap.data() : null;
        };

        const week2Data = await getWData(week2Raw);
        const week3Data = await getWData(week3Raw);
        const week4Data = await getWData(week4Raw);

        const printHtml = `
            <div style="font-family: sans-serif; color: #000; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;">
                <h1 style="text-align: center; font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px 0; flex-shrink: 0;">${window.t('program_title')}</h1>
                ${buildCompactWeekHtml(week1Data, week1Raw, false)}
                ${buildCompactWeekHtml(week2Data, week2Raw, false)}
                ${buildCompactWeekHtml(week3Data, week3Raw, false)}
                ${buildCompactWeekHtml(week4Data, week4Raw, true)} 
            </div>
        `;

        document.getElementById('print-area').innerHTML = printHtml;

        setTimeout(() => {
            window.print();
            btn.innerHTML = oldHtml;
            btn.disabled = false;
        }, 500);

    } catch (e) {
        console.error(e);
        alert("Ошибка сети. Попробуйте еще раз.");
        btn.innerHTML = oldHtml;
        btn.disabled = false;
    }
};
const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => { el.innerHTML = window.t(el.getAttribute('data-lang')); });
};
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', applyTranslations); } 
else { applyTranslations(); }

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
const userId = localStorage.getItem('userId');

if (!userId) window.location.href = 'login.html';

getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const canAccess = roles.includes("Ответственный за график") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!canAccess) window.location.href = 'index.html';
    else {
        loadUsersForDatalists();
        setCurrentWeek();
    }
});

let ministryParts = [];
let livingParts = [];

function getISOWeekString(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); 
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getDateFromWeekString(weekStr) {
    if (!weekStr) return new Date();
    const [year, week] = weekStr.split('-W');
    const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
    const day = simpleDate.getDay();
    const diff = simpleDate.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(simpleDate.setDate(diff));
}

function getNextWeekRaw(currentWeekRaw, offsetWeeks) {
    const d = getDateFromWeekString(currentWeekRaw);
    d.setDate(d.getDate() + offsetWeeks * 7);
    return getISOWeekString(d);
}

// === ИСПРАВЛЕННЫЙ ВЫЗОВ ФУНКЦИИ loadSchedule ===
async function loadSchedule() {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    document.querySelectorAll('.jw-input').forEach(input => input.value = '');
    ministryParts = [];
    livingParts = [];
    document.getElementById('save-status').innerText = "...";

    try {
        const docSnap = await getDoc(doc(db, "meeting_schedules", weekId));
        
        if (docSnap.exists()) {
            const d = docSnap.data();
            
            document.getElementById('delete-btn').classList.remove('hidden');
            document.getElementById('delete-btn').classList.add('inline-block'); // Показываем кнопку удаления

            if(d.isPublished) {
                document.getElementById('save-status').innerText = window.t('published');
                document.getElementById('save-status').classList.replace('text-slate-400', 'text-emerald-500');
            } else {
                document.getElementById('save-status').innerText = window.t('draft');
                document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
            }

            document.getElementById('mw-chairman-name').value = d.mw_chairman_name || '';
            document.getElementById('mw-treasure-title').value = d.mw_treasure_title || '';
            document.getElementById('mw-treasure-name').value = d.mw_treasure_name || '';
            document.getElementById('mw-gems-name').value = d.mw_gems_name || '';
            document.getElementById('mw-reading-name').value = d.mw_reading_name || '';

            ministryParts = d.ministryParts || [];
            
            if (d.livingParts && d.livingParts.length > 0) {
                livingParts = d.livingParts;
            } else if (d.mw_local_name || d.mw_local_title) {
                livingParts = [{
                    title: d.mw_local_title || 'Местные потребности',
                    name: d.mw_local_name || ''
                }];
            } else {
                livingParts = [{title: "Местные потребности", name: ""}];
            }

            document.getElementById('mw-cbs-material').value = d.mw_cbs_material || '';
            document.getElementById('mw-cbs-conductor').value = d.mw_cbs_conductor || '';
            document.getElementById('mw-cbs-reader').value = d.mw_cbs_reader || '';
            document.getElementById('mw-prayer-name').value = d.mw_prayer_name || '';
            document.getElementById('we-opening-name').value = d.we_opening_name || '';
            document.getElementById('we-talk-title').value = d.we_talk_title || '';
            document.getElementById('we-talk-speaker').value = d.we_talk_speaker || '';
            document.getElementById('we-wt-conductor').value = d.we_wt_conductor || '';
            document.getElementById('we-wt-reader').value = d.we_wt_reader || '';
            document.getElementById('we-prayer-name').value = d.we_prayer_name || '';
        } else {
            document.getElementById('delete-btn').classList.add('hidden');
            document.getElementById('delete-btn').classList.remove('inline-block');

            document.getElementById('save-status').innerText = window.t('new_schedule');
            document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
            
            const q = query(collection(db, "personal_tasks"), where("weekId", "==", weekIdRaw));
            const tasksSnap = await getDocs(q);
            
            let fetchedMinistryParts = [];
            let fetchedReadingName = '';

            if (!tasksSnap.empty) {
                let tasksForThisWeek = [];
                tasksSnap.forEach(doc => tasksForThisWeek.push(doc.data()));
                tasksForThisWeek.sort((a,b) => parseInt(a.taskNumber) - parseInt(b.taskNumber));

                tasksForThisWeek.forEach(t => {
                    let cat = t.category;
                    if (cat === 'ЧТЕНИЕ БИБЛИИ' || cat === 'Čtení Bible' || cat === 'Чтение Библии') {
                        fetchedReadingName = t.userName;
                    } else {
                        if (cat === 'НАЧИНАЙТЕ РАЗГОВОР') cat = 'Начинайте разговор';
                        if (cat === 'РАЗВИВАЙТЕ ИНТЕРЕС') cat = 'Развивайте интерес';
                        if (cat === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') cat = 'Подготавливайте учеников';
                        if (cat === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') cat = 'Объясняйте свои взгляды';
                        if (cat === 'РЕЧЬ') cat = 'Речь';

                        fetchedMinistryParts.push({
                            type: cat,
                            student: t.userName,
                            assistant: t.assistant && t.assistant !== "Без помощника" ? t.assistant : ""
                        });
                    }
                });
            }

            if (fetchedReadingName) {
                document.getElementById('mw-reading-name').value = fetchedReadingName;
            }

            ministryParts = fetchedMinistryParts; 

            livingParts = [
                {title: "Местные потребности", name: ""}
            ];
        }
        renderMinistryParts();
        renderLivingParts();
        updateNumeration(); 
    } catch(e) { console.error(e); }
}
// Делаем функцию доступной глобально
window.loadSchedule = loadSchedule;

window.changeWeek = (offset) => {
    const input = document.getElementById('week-selector');
    if (!input.value) return;
    const currentDate = getDateFromWeekString(input.value);
    currentDate.setDate(currentDate.getDate() + (offset * 7));
    input.value = getISOWeekString(currentDate);
    window.loadSchedule(); // <--- Здесь была скрытая ошибка!
};

function setCurrentWeek() {
    const today = new Date();
    document.getElementById('week-selector').value = getISOWeekString(today);
    document.getElementById('schedule-form').classList.remove('hidden');
    
    const langSelector = document.getElementById('schedule-lang');
    if (langSelector) langSelector.value = currentLang;

    window.loadSchedule(); // <--- И здесь!
}

function loadUsersForDatalists() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        const listBrothers = document.getElementById('list-brothers');
        const listSchool = document.getElementById('list-school');
        let brothersHtml = ''; let schoolHtml = '';
        
        let allUsers = [];
        snapshot.forEach(docSnap => allUsers.push(docSnap.data()));
        allUsers.sort((a,b) => a.name.localeCompare(b.name));

        allUsers.forEach(u => {
            if (u.status !== 'active') return;
            if (u.gender === 'boy') brothersHtml += `<option value="${u.name}">`;
            if (u.roles && u.roles.includes('Участник школы')) schoolHtml += `<option value="${u.name}">`;
        });
        listBrothers.innerHTML = brothersHtml; listSchool.innerHTML = schoolHtml;
    });
}

function updateNumeration() {
    let currentNumber = 1;
    document.querySelectorAll('.part-number').forEach(el => {
        el.innerText = `${currentNumber}.`;
        currentNumber++;
    });
}

function renderMinistryParts() {
    const container = document.getElementById('ministry-parts-container');
    if(!container) return;
    let html = '';
    
    if (ministryParts.length === 0) {
        html = `<p class="text-slate-400 text-[10px] italic py-3 text-center border border-slate-200 border-dashed rounded-lg bg-slate-50">${window.t('pulled_from_school')}</p>`;
    } else {
        ministryParts.forEach((part, index) => {
            const assistText = part.assistant ? `<span class="text-slate-400 font-normal mr-1">${window.t('assistant_short')}</span> ${part.assistant}` : `<span class="opacity-50">Без помощника</span>`;
            
            html += `
                <div class="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
                    <div class="flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <span class="part-number text-[11px] font-black text-jw-ministry"></span>
                        <span class="text-[12px] font-bold text-jw-ministry w-full truncate">${part.type || window.t('part')}</span>
                    </div>
                    <div class="flex flex-col md:flex-row gap-2 w-full mt-1">
                        <span class="md:w-1/2 text-[13px] font-black text-slate-800 border-b border-slate-200 pb-0.5 truncate">${part.student || '-'}</span>
                        <span class="md:w-1/2 text-[10px] font-bold text-slate-600 border-b border-slate-200 pb-0.5 truncate">${assistText}</span>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
    updateNumeration();
}

window.addLivingPart = () => {
    saveLivingState();
    livingParts.push({ title: "", name: "" });
    renderLivingParts();
};

window.removeLivingPart = (index) => {
    saveLivingState();
    livingParts.splice(index, 1);
    renderLivingParts();
};

function saveLivingState() {
    const container = document.getElementById('living-parts-container');
    if(!container) return;
    livingParts.forEach((part, index) => {
        const titleEl = document.getElementById(`part-liv-${index}-title`);
        const nameEl = document.getElementById(`part-liv-${index}-name`);
        if(titleEl) part.title = titleEl.value;
        if(nameEl) part.name = nameEl.value;
    });
}

function renderLivingParts() {
    const container = document.getElementById('living-parts-container');
    if(!container) return;
    let html = '';
    livingParts.forEach((part, index) => {
        html += `
            <div class="flex flex-col px-2 relative pr-8 pb-2 border-b border-slate-100 last:border-0 gap-1">
                <div class="flex items-center gap-1.5">
                    <span class="part-number text-[10px] font-black text-jw-living"></span>
                    <input type="text" id="part-liv-${index}-title" list="living-types" class="text-xs font-bold text-jw-living bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full" value="${part.title || ''}" placeholder="Тема пункта...">
                </div>
                <input type="text" id="part-liv-${index}-name" list="list-brothers" class="jw-input mt-1" value="${part.name || ''}" placeholder="Имя брата">
                <button onclick="removeLivingPart(${index})" class="absolute top-2 right-0 text-slate-300 hover:text-red-500 font-black outline-none transition-colors text-lg" title="Удалить">✖</button>
            </div>
        `;
    });
    container.innerHTML = html;
    updateNumeration();
}

window.saveSchedule = async (isPublished) => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    saveLivingState();

    const btn = isPublished ? document.getElementById('publish-btn') : document.getElementById('save-draft-btn');
    const originalSvg = btn.innerHTML;
    btn.innerHTML = `<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`;
    btn.disabled = true;

    const scheduleData = {
        weekId: weekId, 
        realWeekId: weekIdRaw, 
        lang: scheduleLang, 
        isPublished: isPublished,
        updatedAt: new Date().toISOString(),

        mw_chairman_name: document.getElementById('mw-chairman-name').value.trim(),
        mw_treasure_title: document.getElementById('mw-treasure-title').value.trim(),
        mw_treasure_name: document.getElementById('mw-treasure-name').value.trim(),
        mw_gems_name: document.getElementById('mw-gems-name').value.trim(),
        mw_reading_name: document.getElementById('mw-reading-name').value.trim(),

        ministryParts: ministryParts,
        livingParts: livingParts,
        
        mw_cbs_material: document.getElementById('mw-cbs-material').value.trim(),
        mw_cbs_conductor: document.getElementById('mw-cbs-conductor').value.trim(),
        mw_cbs_reader: document.getElementById('mw-cbs-reader').value.trim(),
        mw_prayer_name: document.getElementById('mw-prayer-name').value.trim(),

        we_opening_name: document.getElementById('we-opening-name').value.trim(),
        we_talk_title: document.getElementById('we-talk-title').value.trim(),
        we_talk_speaker: document.getElementById('we-talk-speaker').value.trim(),
        we_wt_conductor: document.getElementById('we-wt-conductor').value.trim(),
        we_wt_reader: document.getElementById('we-wt-reader').value.trim(),
        we_prayer_name: document.getElementById('we-prayer-name').value.trim(),
    };

    try {
        await setDoc(doc(db, "meeting_schedules", weekId), scheduleData);
        window.showToast(isPublished ? window.t('success_pub') : window.t('success_draft'));
        document.getElementById('save-status').innerText = isPublished ? window.t('published') : window.t('draft');
        if(isPublished) document.getElementById('save-status').classList.replace('text-slate-400', 'text-emerald-500');
        else document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
        
        document.getElementById('delete-btn').classList.remove('hidden');
        document.getElementById('delete-btn').classList.add('inline-block');
    } catch (e) { alert(window.t('error_save')); }
    
    btn.innerHTML = originalSvg;
    btn.disabled = false;
};

window.deleteSchedule = async () => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;
    const weekId = `${weekIdRaw}-${scheduleLang}`;

    if(confirm(window.t('confirm_del'))) {
        try {
            await deleteDoc(doc(db, "meeting_schedules", weekId));
            await deleteDoc(doc(db, "meeting_schedules", weekIdRaw)); 
            
            window.showToast(window.t('success_del'));
            window.loadSchedule(); 
        } catch(e) {
            alert(window.t('error_del'));
        }
    }
};

// ==============================
// ЛОГИКА РАСПЕЧАТКИ ГРАФИКА (4 НЕДЕЛИ - НА ВЕСЬ ЛИСТ А4)
// ==============================
function formatWeekForPrint(weekStr) {
    if (!weekStr) return "";
    const [year, week] = weekStr.split('-W');
    const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
    const day = simpleDate.getDay();
    const diff = simpleDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(simpleDate.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const m1 = window.t('months') ? window.t('months')[monday.getMonth()] : monday.getMonth()+1;
    const m2 = window.t('months') ? window.t('months')[sunday.getMonth()] : sunday.getMonth()+1;

    if (monday.getMonth() === sunday.getMonth()) {
        return `${monday.getDate()} - ${sunday.getDate()} ${m1} ${year}`;
    } else {
        return `${monday.getDate()} ${m1} - ${sunday.getDate()} ${m2} ${year}`;
    }
}

function buildCompactWeekHtml(data, weekRaw, isLast = false) {
    const borderStyle = isLast ? 'none' : '2px dashed #cbd5e1'; 
    
    if (!data) return `
        <div style="flex: 1; border-bottom: ${borderStyle}; padding-bottom: 5px; display: flex; flex-direction: column; justify-content: center;">
            <div style="text-align:center; font-weight:900; font-size:16px; margin-bottom:2px; text-transform:uppercase; color: #0f172a;">${formatWeekForPrint(weekRaw)}</div>
            <div style="text-align:center; font-size:13px; color:#94a3b8; font-style: italic;">Нет данных на эту неделю</div>
        </div>`;

    const row = (label, name) => {
        if (!name || name.trim() === '') return '';
        return `<div style="display:flex; justify-content:space-between; margin-bottom: 5px; font-size: 13px; line-height: 1.2;">
                    <span style="color: #475569; padding-right: 6px;">${label}</span>
                    <strong style="color: #0f172a; text-align: right; max-width: 65%; word-break: break-word;">${name}</strong>
                </div>`;
    };

    const sectionHeader = (title, bgColor, iconSvg) => {
        return `<div style="margin-top:6px; margin-bottom:6px; font-weight:900; font-size:12px; background:${bgColor}; color:white; padding:3px 6px; text-transform:uppercase; border-radius: 4px; display: flex; align-items: center; gap: 5px;">
                    ${iconSvg} <span>${title}</span>
                </div>`;
    };

    const iconTreasure = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
    const iconMinistry = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`;
    const iconLiving = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
    const iconWeekend = `<svg style="width:13px;height:13px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`;

    let leftCol = '';
    leftCol += row(window.t('chairman_intro'), data.mw_chairman_name);
    
    let treasures = row(data.mw_treasure_title || window.t('part'), data.mw_treasure_name);
    treasures += row(window.t('spiritual_gems'), data.mw_gems_name);
    treasures += row(window.t('bible_reading'), data.mw_reading_name);
    if (treasures.trim()) {
        leftCol += sectionHeader(window.t('treasures_title'), '#0d9488', iconTreasure);
        leftCol += treasures;
    }

    let ministry = '';
    (data.ministryParts || []).forEach(p => {
        if(!p.student || p.student.trim() === '') return;
        let ast = p.assistant && p.assistant !== "Без помощника" ? ` (Пом: ${p.assistant})` : '';
        ministry += row(p.type, `${p.student}${ast}`);
    });
    if (ministry.trim()) {
        leftCol += sectionHeader(window.t('ministry_skills'), '#d97706', iconMinistry);
        leftCol += ministry;
    }

    let living = '';
    (data.livingParts || []).forEach(p => {
        if(!p.name || p.name.trim() === '') return;
        living += row(p.title || window.t('part'), p.name);
    });
    let cbsCond = data.mw_cbs_conductor || '';
    let cbsRead = data.mw_cbs_reader ? ` (${window.t('reader')}: ${data.mw_cbs_reader})` : '';
    if (cbsCond.trim()) {
        living += row(`${window.t('congregation_bible_study')} ${data.mw_cbs_material ? `(${data.mw_cbs_material})` : ''}`, `${cbsCond}${cbsRead}`);
    }
    living += row(window.t('closing_prayer'), data.mw_prayer_name);
    if (living.trim()) {
        leftCol += sectionHeader(window.t('christian_living'), '#b91c1c', iconLiving);
        leftCol += living;
    }

    let rightCol = '';
    rightCol += row(window.t('opening_song'), data.we_opening_name);
    
    if (data.we_talk_speaker && data.we_talk_speaker.trim() !== '') {
        rightCol += sectionHeader(window.t('public_talk'), '#475569', iconWeekend);
        rightCol += row(data.we_talk_title || window.t('public_talk'), data.we_talk_speaker);
    }

    let wt = row(window.t('conductor'), data.we_wt_conductor);
    wt += row(window.t('reader'), data.we_wt_reader);
    if (wt.trim()) {
        rightCol += sectionHeader(window.t('watchtower_study'), '#475569', iconWeekend);
        rightCol += wt;
    }
    rightCol += row(window.t('closing_prayer'), data.we_prayer_name);

    return `
    <div style="flex: 1; border-bottom: ${borderStyle}; padding-bottom: 10px; display: flex; flex-direction: column;">
        <div style="text-align:center; font-weight:900; font-size:16px; margin-bottom:6px; text-transform:uppercase; color: #0f172a;">${formatWeekForPrint(weekRaw)}</div>
        <div style="display:flex; gap:35px; flex: 1;">
            <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-start;">${leftCol}</div>
            <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-start;">${rightCol}</div>
        </div>
    </div>
    `;
}

window.printSchedule = async () => {
    saveLivingState(); 

    const btn = document.getElementById('print-btn');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`;
    btn.disabled = true;

    try {
        const week1Raw = document.getElementById('week-selector').value;
        const week2Raw = getNextWeekRaw(week1Raw, 1);
        const week3Raw = getNextWeekRaw(week1Raw, 2);
        const week4Raw = getNextWeekRaw(week1Raw, 3);
        const lang = document.getElementById('schedule-lang').value || 'ru';

        const week1Data = {
            mw_chairman_name: document.getElementById('mw-chairman-name').value.trim(),
            mw_treasure_title: document.getElementById('mw-treasure-title').value.trim(),
            mw_treasure_name: document.getElementById('mw-treasure-name').value.trim(),
            mw_gems_name: document.getElementById('mw-gems-name').value.trim(),
            mw_reading_name: document.getElementById('mw-reading-name').value.trim(),
            ministryParts: ministryParts,
            livingParts: livingParts,
            mw_cbs_material: document.getElementById('mw-cbs-material').value.trim(),
            mw_cbs_conductor: document.getElementById('mw-cbs-conductor').value.trim(),
            mw_cbs_reader: document.getElementById('mw-cbs-reader').value.trim(),
            mw_prayer_name: document.getElementById('mw-prayer-name').value.trim(),
            we_opening_name: document.getElementById('we-opening-name').value.trim(),
            we_talk_title: document.getElementById('we-talk-title').value.trim(),
            we_talk_speaker: document.getElementById('we-talk-speaker').value.trim(),
            we_wt_conductor: document.getElementById('we-wt-conductor').value.trim(),
            we_wt_reader: document.getElementById('we-wt-reader').value.trim(),
            we_prayer_name: document.getElementById('we-prayer-name').value.trim()
        };

        const getWData = async (raw) => {
            const snap = await getDoc(doc(db, "meeting_schedules", `${raw}-${lang}`));
            return snap.exists() ? snap.data() : null;
        };

        const week2Data = await getWData(week2Raw);
        const week3Data = await getWData(week3Raw);
        const week4Data = await getWData(week4Raw);

        const printHtml = `
            <div style="font-family: sans-serif; color: #000; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;">
                <h1 style="text-align: center; font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px 0; flex-shrink: 0;">${window.t('program_title')}</h1>
                ${buildCompactWeekHtml(week1Data, week1Raw, false)}
                ${buildCompactWeekHtml(week2Data, week2Raw, false)}
                ${buildCompactWeekHtml(week3Data, week3Raw, false)}
                ${buildCompactWeekHtml(week4Data, week4Raw, true)} 
            </div>
        `;

        document.getElementById('print-area').innerHTML = printHtml;

        setTimeout(() => {
            window.print();
            btn.innerHTML = oldHtml;
            btn.disabled = false;
        }, 500);

    } catch (e) {
        console.error(e);
        alert("Ошибка сети. Попробуйте еще раз.");
        btn.innerHTML = oldHtml;
        btn.disabled = false;
    }
};
