import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// ПРОВЕРКА ПРАВ
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

window.changeWeek = (offset) => {
    const input = document.getElementById('week-selector');
    if (!input.value) return;
    const currentDate = getDateFromWeekString(input.value);
    currentDate.setDate(currentDate.getDate() + (offset * 7));
    input.value = getISOWeekString(currentDate);
    loadSchedule();
};

function setCurrentWeek() {
    const today = new Date();
    document.getElementById('week-selector').value = getISOWeekString(today);
    document.getElementById('schedule-form').classList.remove('hidden');
    
    const currentAppLang = localStorage.getItem('app_lang') || 'ru';
    const langSelector = document.getElementById('schedule-lang');
    if (langSelector) langSelector.value = currentAppLang;

    loadSchedule();
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

// =================== НАВЫКИ СЛУЖЕНИЯ (БЕЗ ДОБАВЛЕНИЯ/УДАЛЕНИЯ) ===================

function saveMinistryState() {
    const container = document.getElementById('ministry-parts-container');
    if(!container) return;
    ministryParts.forEach((part, index) => {
        const tEl = document.getElementById(`part-min-${index}-time`);
        const typeEl = document.getElementById(`part-min-${index}-type`);
        const stEl = document.getElementById(`part-min-${index}-student`);
        const asEl = document.getElementById(`part-min-${index}-assistant`);
        if(tEl) part.time = tEl.value;
        if(typeEl) part.type = typeEl.value;
        if(stEl) part.student = stEl.value;
        if(asEl) part.assistant = asEl.value;
    });
}

function renderMinistryParts() {
    const container = document.getElementById('ministry-parts-container');
    if(!container) return;
    let html = '';
    ministryParts.forEach((part, index) => {
        html += `
            <div class="flex items-end gap-3 bg-slate-50 p-2 rounded border border-slate-100 relative pr-2">
                <input type="text" id="part-min-${index}-time" list="time-list" class="jw-time shrink-0 mb-1" value="${part.time || ''}" placeholder="мин">
                <div class="w-full flex flex-col gap-1">
                    <div class="flex items-center gap-1.5">
                        <span class="part-number text-[10px] font-black text-jw-ministry"></span>
                        <input type="text" id="part-min-${index}-type" list="part-types" class="text-[11px] font-bold text-jw-ministry bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full" value="${part.type || ''}" placeholder="Название (Начинайте разговор...)">
                    </div>
                    <div class="flex gap-2 w-full mt-1">
                        <input type="text" id="part-min-${index}-student" list="list-school" class="jw-input w-1/2 text-xs" value="${part.student || ''}" placeholder="Участник">
                        <input type="text" id="part-min-${index}-assistant" list="list-school" class="jw-input w-1/2 text-[10px]" value="${part.assistant || ''}" placeholder="Помощник">
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    updateNumeration();
}

// =================== ХРИСТИАНСКАЯ ЖИЗНЬ ===================
window.addLivingPart = () => {
    saveLivingState();
    livingParts.push({ time: "15", title: "", name: "" });
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
        const tEl = document.getElementById(`part-liv-${index}-time`);
        const titleEl = document.getElementById(`part-liv-${index}-title`);
        const nameEl = document.getElementById(`part-liv-${index}-name`);
        if(tEl) part.time = tEl.value;
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
            <div class="flex items-end gap-3 px-2 relative pr-8 pb-2 border-b border-slate-100 last:border-0">
                <input type="text" id="part-liv-${index}-time" list="time-list" class="jw-time shrink-0 mb-1" value="${part.time || ''}" placeholder="мин">
                <div class="w-full flex flex-col gap-1">
                    <div class="flex items-center gap-1.5">
                        <span class="part-number text-[10px] font-black text-jw-living"></span>
                        <input type="text" id="part-liv-${index}-title" list="living-types" class="text-xs font-bold text-jw-living bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full" value="${part.title || ''}" placeholder="Тема пункта (Местные потребности...)">
                    </div>
                    <input type="text" id="part-liv-${index}-name" list="list-brothers" class="jw-input mt-1" value="${part.name || ''}" placeholder="Имя брата">
                </div>
                <button onclick="removeLivingPart(${index})" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 font-black outline-none transition-colors" title="Удалить">✖</button>
            </div>
        `;
    });
    container.innerHTML = html;
    updateNumeration();
}

window.loadSchedule = async () => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    document.querySelectorAll('.jw-input, .jw-title-input').forEach(input => input.value = '');
    document.querySelectorAll('.jw-time').forEach(input => input.value = '');
    ministryParts = [];
    livingParts = [];
    document.getElementById('publish-btn').classList.replace('bg-emerald-700', 'bg-emerald-600');
    document.getElementById('save-status').innerText = "...";

    try {
        const docSnap = await getDoc(doc(db, "meeting_schedules", weekId));
        
        if (docSnap.exists()) {
            const d = docSnap.data();
            
            if(d.isPublished) {
                document.getElementById('save-status').innerText = "ОПУБЛИКОВАНО";
                document.getElementById('save-status').classList.replace('text-slate-400', 'text-emerald-500');
            } else {
                document.getElementById('save-status').innerText = "ЧЕРНОВИК";
                document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
            }

            // БУДНИ
            document.getElementById('mw-chairman-time').value = d.mw_chairman_time || '3';
            document.getElementById('mw-chairman-name').value = d.mw_chairman_name || '';

            document.getElementById('mw-treasure-time').value = d.mw_treasure_time || '10';
            document.getElementById('mw-treasure-title').value = d.mw_treasure_title || '';
            document.getElementById('mw-treasure-name').value = d.mw_treasure_name || '';
            document.getElementById('mw-gems-time').value = d.mw_gems_time || '10';
            document.getElementById('mw-gems-name').value = d.mw_gems_name || '';
            document.getElementById('mw-reading-time').value = d.mw_reading_time || '4';
            document.getElementById('mw-reading-name').value = d.mw_reading_name || '';

            ministryParts = d.ministryParts || [];
            
            if (d.livingParts && d.livingParts.length > 0) {
                livingParts = d.livingParts;
            } else if (d.mw_local_name || d.mw_local_title) {
                livingParts = [{
                    time: d.mw_local_time || '15',
                    title: d.mw_local_title || 'Местные потребности',
                    name: d.mw_local_name || ''
                }];
            } else {
                livingParts = [{time: "15", title: "Местные потребности", name: ""}];
            }

            document.getElementById('mw-cbs-time').value = d.mw_cbs_time || '30';
            document.getElementById('mw-cbs-material').value = d.mw_cbs_material || '';
            document.getElementById('mw-cbs-conductor').value = d.mw_cbs_conductor || '';
            document.getElementById('mw-cbs-reader').value = d.mw_cbs_reader || '';

            document.getElementById('mw-prayer-name').value = d.mw_prayer_name || '';

            // ВЫХОДНЫЕ
            document.getElementById('we-opening-time').value = d.we_opening_time || '5';
            document.getElementById('we-opening-name').value = d.we_opening_name || '';
            
            document.getElementById('we-talk-time').value = d.we_talk_time || '30';
            document.getElementById('we-talk-title').value = d.we_talk_title || '';
            document.getElementById('we-talk-speaker').value = d.we_talk_speaker || '';
            
            document.getElementById('we-wt-time').value = d.we_wt_time || '60';
            document.getElementById('we-wt-conductor').value = d.we_wt_conductor || '';
            document.getElementById('we-wt-reader').value = d.we_wt_reader || '';
            
            document.getElementById('we-prayer-name').value = d.we_prayer_name || '';
        } else {
            // 🔥 ЕСЛИ ГРАФИК ПУСТОЙ - ИДЕМ ИСКАТЬ В ШКОЛУ
            document.getElementById('save-status').innerText = "НОВЫЙ ГРАФИК";
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
                            time: "5",
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

            if (fetchedMinistryParts.length > 0) {
                ministryParts = fetchedMinistryParts;
                window.showToast("Задания из Школы загружены!");
            } else {
                ministryParts = [
                    {time: "3", type: "Начинайте разговор", student: "", assistant: ""},
                    {time: "4", type: "Развивайте интерес", student: "", assistant: ""},
                    {time: "5", type: "Подготавливайте учеников", student: "", assistant: ""}
                ];
            }

            livingParts = [
                {time: "15", title: "Местные потребности", name: ""}
            ];
        }
        renderMinistryParts();
        renderLivingParts();
        updateNumeration(); 
    } catch(e) { console.error(e); }
};

window.saveSchedule = async (isPublished) => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    saveMinistryState(); 
    saveLivingState();

    const btn = isPublished ? document.getElementById('publish-btn') : document.getElementById('save-draft-btn');
    const originalText = btn.innerText;
    btn.innerText = "Загрузка...";
    btn.disabled = true;

    const scheduleData = {
        weekId: weekId, 
        realWeekId: weekIdRaw, 
        lang: scheduleLang, 
        isPublished: isPublished,
        updatedAt: new Date().toISOString(),

        mw_chairman_time: document.getElementById('mw-chairman-time').value,
        mw_chairman_name: document.getElementById('mw-chairman-name').value.trim(),
        
        mw_treasure_time: document.getElementById('mw-treasure-time').value,
        mw_treasure_title: document.getElementById('mw-treasure-title').value.trim(),
        mw_treasure_name: document.getElementById('mw-treasure-name').value.trim(),
        
        mw_gems_time: document.getElementById('mw-gems-time').value,
        mw_gems_name: document.getElementById('mw-gems-name').value.trim(),
        
        mw_reading_time: document.getElementById('mw-reading-time').value,
        mw_reading_name: document.getElementById('mw-reading-name').value.trim(),

        ministryParts: ministryParts,
        livingParts: livingParts,
        
        mw_cbs_time: document.getElementById('mw-cbs-time').value,
        mw_cbs_material: document.getElementById('mw-cbs-material').value.trim(),
        mw_cbs_conductor: document.getElementById('mw-cbs-conductor').value.trim(),
        mw_cbs_reader: document.getElementById('mw-cbs-reader').value.trim(),
        
        mw_prayer_name: document.getElementById('mw-prayer-name').value.trim(),

        we_opening_time: document.getElementById('we-opening-time').value,
        we_opening_name: document.getElementById('we-opening-name').value.trim(),
        
        we_talk_time: document.getElementById('we-talk-time').value,
        we_talk_title: document.getElementById('we-talk-title').value.trim(),
        we_talk_speaker: document.getElementById('we-talk-speaker').value.trim(),
        
        we_wt_time: document.getElementById('we-wt-time').value,
        we_wt_conductor: document.getElementById('we-wt-conductor').value.trim(),
        we_wt_reader: document.getElementById('we-wt-reader').value.trim(),
        
        we_prayer_name: document.getElementById('we-prayer-name').value.trim(),
    };

    try {
        await setDoc(doc(db, "meeting_schedules", weekId), scheduleData);
        window.showToast(isPublished ? "График опубликован!" : "Черновик сохранен");
        document.getElementById('save-status').innerText = isPublished ? "ОПУБЛИКОВАНО" : "ЧЕРНОВИК";
        if(isPublished) document.getElementById('save-status').classList.replace('text-slate-400', 'text-emerald-500');
        else document.getElementById('save-status').classList.replace('text-emerald-500', 'text-slate-400');
    } catch (e) { alert("Ошибка сохранения!"); }
    
    btn.innerText = originalText;
    btn.disabled = false;
};
