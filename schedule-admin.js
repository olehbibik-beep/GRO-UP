import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "schedule_for": "График для:", "btn_draft": "Сохранить черновик", "btn_publish": "Опубликовать", "btn_delete": "Удалить",
        "midweek_meeting": "Будние дни (Христианская жизнь и служение)", "chairman_intro": "Председатель / Вступление",
        "treasures_title": "Сокровища из слова бога", "spiritual_gems": "Духовные жемчужины", "bible_reading": "Чтение Библии",
        "ministry_skills": "Навыки служения", "pulled_from_school": "Подтягивается из школы", "christian_living": "Христианская жизнь",
        "congregation_bible_study": "Изучение Библии", "closing_prayer": "Заключительная молитва", "weekend_meeting": "Выходные (Публичная речь)",
        "opening_song": "Вступительные слова / Песня", "public_talk": "Публичная речь", "watchtower_study": "Изучение Сторожевой Башни",
        "add_btn": "+ Добавить", "saving": "Сохранение...", "published": "ОПУБЛИКОВАНО", "draft": "ЧЕРНОВИК", "new_schedule": "НОВЫЙ ГРАФИК",
        "success_pub": "График опубликован!", "success_draft": "Черновик сохранен", "error_save": "Ошибка сохранения!",
        "confirm_del": "Точно удалить этот график навсегда?", "success_del": "График успешно удален!", "error_del": "Ошибка удаления!",
        "part": "Задание", "assistant_short": "Пом:"
    },
    cs: {
        "schedule_for": "Rozvrh pro:", "btn_draft": "Uložit koncept", "btn_publish": "Publikovat", "btn_delete": "Smazat",
        "midweek_meeting": "Všední dny (Náš křesťanský život a služba)", "chairman_intro": "Předsedající / Úvod",
        "treasures_title": "Poklady z Božího slova", "spiritual_gems": "Hledání duchovních drahokamů", "bible_reading": "Čtení Bible",
        "ministry_skills": "Zlepšujme se ve službě", "pulled_from_school": "Načítá se ze školy", "christian_living": "Křesťanský život",
        "congregation_bible_study": "Sborové studium Bible", "closing_prayer": "Závěrečná modlitba", "weekend_meeting": "Víkend (Veřejná přednáška)",
        "opening_song": "Úvodní slova / Píseň", "public_talk": "Veřejná přednáška", "watchtower_study": "Studium Strážné věže",
        "add_btn": "+ Přidat", "saving": "Ukládání...", "published": "PUBLIKOVÁNO", "draft": "KONCEPT", "new_schedule": "NOVÝ ROZVRH",
        "success_pub": "Rozvrh byl publikován!", "success_draft": "Koncept byl uložen", "error_save": "Chyba při ukládání!",
        "confirm_del": "Opravdu chcete tento rozvrh trvale smazat?", "success_del": "Rozvrh byl úspěšně smazán!", "error_del": "Chyba při mazání!",
        "part": "Úkol", "assistant_short": "Pom:"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
window.t = (key) => dict[currentLang][key] || key;

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
    
    const langSelector = document.getElementById('schedule-lang');
    if (langSelector) langSelector.value = currentLang;

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

window.loadSchedule = async () => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    document.querySelectorAll('.jw-input').forEach(input => input.value = '');
    ministryParts = [];
    livingParts = [];
    document.getElementById('publish-btn').classList.replace('bg-emerald-700', 'bg-emerald-600');
    document.getElementById('save-status').innerText = "...";

    try {
        const docSnap = await getDoc(doc(db, "meeting_schedules", weekId));
        
        if (docSnap.exists()) {
            const d = docSnap.data();
            
            document.getElementById('delete-btn').classList.remove('hidden');
            document.getElementById('delete-btn').classList.add('flex');

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
            document.getElementById('delete-btn').classList.remove('flex');

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
};

window.saveSchedule = async (isPublished) => {
    const weekIdRaw = document.getElementById('week-selector').value;
    const scheduleLang = document.getElementById('schedule-lang').value || 'ru';
    if(!weekIdRaw) return;

    const weekId = `${weekIdRaw}-${scheduleLang}`; 

    saveLivingState();

    const btn = isPublished ? document.getElementById('publish-btn') : document.getElementById('save-draft-btn');
    const originalText = btn.innerText;
    btn.innerText = window.t('saving');
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
        document.getElementById('delete-btn').classList.add('flex');
    } catch (e) { alert(window.t('error_save')); }
    
    btn.innerHTML = isPublished ? "ОПУБЛИКОВАТЬ" : `<svg class="w-5 h-5 md:hidden inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg><span class="hidden md:inline text-[10px] md:text-xs">СОХРАНИТЬ ЧЕРНОВИК</span>`;
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
