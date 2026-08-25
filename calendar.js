import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, addDoc, deleteDoc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "calendar_title": "Календарь встреч", "btn_back": "Назад", "date": "Дата", "time": "Время",
        "event_name": "Название", "event_name_placeholder": "Например: Выходные встречи",
        "leader": "Проводит", "group": "Группа", "all_groups": "Все", "special_event": "Особое событие",
        "repeat_weekly": "Повторять еженедельно (12 нед.)", "publish": "Опубликовать",
        "schedule_title": "Расписание встреч", "show_other_groups": "Показать другие группы",
        "success": "Успешно!", "error_general": "Ошибка!", "confirm_delete": "Удалить событие?",
        "loading": "Загрузка...", "history_empty": "Запланированных встреч нет",
        "clear_past": "Очистить архив", "confirm_clear": "Удалить все прошедшие встречи из базы данных? Это действие нельзя отменить.",
        "delete_title": "Удалить встречу", "delete_desc": "Как вы хотите удалить эту встречу?",
        "delete_one": "Только эту встречу", "delete_series": "Эту и будущие из серии", "cancel": "Отмена"
    },
    cs: {
        "calendar_title": "Rozvrh schůzek", "btn_back": "Zpět", "date": "Datum", "time": "Čas",
        "event_name": "Název", "event_name_placeholder": "Např. Víkendová shromáždění",
        "leader": "Vede", "group": "Skupina", "all_groups": "Společné", "special_event": "Zvláštní událost",
        "repeat_weekly": "Opakovat týdně (12 týd.)", "publish": "Publikovat",
        "schedule_title": "Rozvrh schůzek", "show_other_groups": "Zobrazit ostatní skupiny",
        "success": "Úspěšně!", "error_general": "Došlo k chybě!", "confirm_delete": "Smazat událost?",
        "loading": "Načítání...", "history_empty": "Žádné naplánované schůzky",
        "clear_past": "Vymazat archiv", "confirm_clear": "Smazat všechny minulé schůzky z databáze? Tuto akci nelze vrátit zpět.",
        "delete_title": "Smazat schůzku", "delete_desc": "Jak chcete tuto schůzku smazat?",
        "delete_one": "Pouze tuto schůzku", "delete_series": "Tuto a budoucí ze série", "cancel": "Zrušit"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';
window.t = (key) => dict[currentLang][key] || key;

document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = window.t(el.getAttribute('data-lang')));
document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder'))));

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-indigo-600 text-white px-4 py-3 rounded-md shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 3000); }, 3000);
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

let currentUserData = null;
let cachedEvents = [];

getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    currentUserData = docSnap.data();
    const roles = currentUserData.roles || [];
    const isOverseer = roles.includes("Надзиратель группы") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!isOverseer) window.location.href = 'index.html';
    else {
        document.getElementById('global-loader').style.opacity = '0';
        setTimeout(() => document.getElementById('global-loader').style.display = 'none', 500);
        initEventsListener();
        loadBrothers(); 
    }
});

function loadBrothers() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        const dataList = document.getElementById('brothers-list');
        if(!dataList) return;
        let options = '';
        let brothers = [];
        snapshot.forEach(docSnap => {
            const u = docSnap.data();
            if (u.status === 'active' && u.gender === 'boy') {
                brothers.push(u.name);
            }
        });
        brothers.sort((a,b) => a.localeCompare(b));
        brothers.forEach(name => {
            options += `<option value="${name}">`;
        });
        dataList.innerHTML = options;
    });
}

function initEventsListener() {
    onSnapshot(query(collection(db, "events"), orderBy("date", "asc")), (snapshot) => {
        cachedEvents = [];
        snapshot.forEach(docSnap => cachedEvents.push({ id: docSnap.id, ...docSnap.data() }));
        window.forceRenderEvents();
    });
}

window.forceRenderEvents = () => {
    const list = document.getElementById('events-list');
    const showAll = document.getElementById('show-all-groups').checked;
    const userGroup = currentUserData.group;
    let html = '';
    
    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const filteredEvents = cachedEvents.filter(ev => {
        if (ev.date < todayStr) return false; 
        return (ev.group === "Все" || ev.group === "Všechny" || ev.group == userGroup || showAll);
    });

    if (filteredEvents.length === 0) {
        list.innerHTML = `<p class="p-6 text-center text-slate-400 text-sm italic">${window.t('history_empty')}</p>`;
        return;
    }

    const groupedEvents = {};
    filteredEvents.forEach(ev => {
        const dateObj = new Date(ev.date);
        const monthStr = dateObj.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
        if (!groupedEvents[monthStr]) groupedEvents[monthStr] = [];
        groupedEvents[monthStr].push(ev);
    });

    for (const [monthStr, events] of Object.entries(groupedEvents)) {
        html += `
            <details class="group bg-white border border-slate-200 rounded-md mb-3 overflow-hidden">
                <summary class="flex justify-between items-center p-4 cursor-pointer select-none bg-indigo-50 hover:bg-indigo-100 transition-colors list-none outline-none [&::-webkit-details-marker]:hidden">
                    <div class="flex items-center gap-2 text-indigo-800">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="font-black text-sm uppercase tracking-widest">${monthStr}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-white border border-indigo-200 px-2 py-0.5 rounded-full">${events.length}</span>
                        <svg class="w-5 h-5 text-indigo-400 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </summary>
                <div class="divide-y divide-slate-100 border-t border-slate-200">
        `;

        events.forEach(ev => {
            const dateObj = new Date(ev.date);
            const dayNum = dateObj.getDate();
            const weekday = dateObj.toLocaleDateString(localeFormat, { weekday: 'short' });
            
            // МАГИЯ ИКОНОК ТУТ
            let typeIcon = '';
            if (ev.isSpecial) typeIcon = '⭐';
            if (ev.isCampaign) typeIcon = '🚩';
            
            const isSpecialBadge = typeIcon ? `<span class="text-base ml-1 drop-shadow-sm">${typeIcon}</span>` : '';
                
            const groupBadge = (ev.group === "Все" || ev.group === "Všechny") ? window.t('all_groups') : ev.group;
            const leaderHtml = ev.leader ? `<span class="text-[10px] font-bold text-indigo-400 mt-0.5 block truncate">Вед: ${ev.leader}</span>` : '';
            
            const dateBlock = `
                <div class="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 border border-slate-200 rounded shrink-0">
                    <span class="text-[8px] uppercase font-bold text-slate-500 leading-none mb-0.5 tracking-widest">${weekday}</span>
                    <span class="text-lg font-black text-slate-800 leading-none">${dayNum}</span>
                </div>
            `;

            html += `
                <div class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div class="flex items-start gap-3 w-full">
                        ${dateBlock}
                        <div class="flex flex-col min-w-0 flex-grow pt-0.5">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-black text-slate-800 text-sm md:text-base leading-tight flex items-center">${ev.title} ${isSpecialBadge}</span>
                                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">${groupBadge}</span>
                            </div>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs font-black text-slate-600">${ev.time}</span>
                                ${leaderHtml ? `<span class="text-slate-300 mx-1">•</span> ${leaderHtml}` : ''}
                            </div>
                        </div>
                    </div>
                    <button onclick="openDeleteModal('${ev.id}')" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors outline-none shrink-0 border border-transparent hover:border-rose-200 ml-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            `;
        });

        html += `
                </div>
            </details>
        `;
    }
    
    list.innerHTML = `<div class="p-4 bg-slate-50 border-t border-slate-200">${html}</div>`;
};

// ==========================================
// УМНОЕ УДАЛЕНИЕ (Только эта ИЛИ Серия)
// ==========================================
window.openDeleteModal = (id) => {
    const ev = cachedEvents.find(e => e.id === id);
    if(!ev) return;

    const series = cachedEvents.filter(e => e.title === ev.title && e.time === ev.time && e.group === ev.group && e.date >= ev.date);

    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('delete-modal').classList.add('flex');

    const btnOne = document.getElementById('btn-del-one');
    const btnSeries = document.getElementById('btn-del-series');

    btnOne.onclick = () => confirmDeleteOne(id);

    if(series.length > 1) {
        btnSeries.style.display = 'block';
        btnSeries.innerText = `${window.t('delete_series')} (${series.length})`;
        btnSeries.onclick = () => confirmDeleteSeries(series.map(e => e.id));
    } else {
        btnSeries.style.display = 'none';
    }
};

window.closeDeleteModal = () => {
    document.getElementById('delete-modal').classList.add('hidden');
    document.getElementById('delete-modal').classList.remove('flex');
}

window.confirmDeleteOne = async (id) => {
    closeDeleteModal();
    try {
        await deleteDoc(doc(db, "events", id));
        window.showToast(window.t('success'));
    } catch(e) { alert(window.t('error_general')); }
};

window.confirmDeleteSeries = async (ids) => {
    closeDeleteModal();
    try {
        const batch = writeBatch(db);
        ids.forEach(id => {
            batch.delete(doc(db, "events", id));
        });
        await batch.commit(); 
        window.showToast(window.t('success'));
    } catch(e) {
        console.error(e);
        alert(window.t('error_general'));
    }
};

// ==========================================
// ОЧИСТКА АРХИВА
// ==========================================
window.clearPastEvents = async () => {
    if(!confirm(window.t('confirm_clear'))) return;
    
    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const pastEvents = cachedEvents.filter(ev => ev.date < todayStr);
    
    if(pastEvents.length === 0) {
        window.showToast("Архив уже пуст");
        return;
    }

    try {
        const chunks = [];
        for (let i = 0; i < pastEvents.length; i += 500) {
            chunks.push(pastEvents.slice(i, i + 500));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(ev => batch.delete(doc(db, "events", ev.id)));
            await batch.commit();
        }
        window.showToast(window.t('success'));
    } catch(e) {
        console.error(e);
        alert(window.t('error_general'));
    }
};

document.getElementById('add-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const title = document.getElementById('event-title').value;
    const leader = document.getElementById('event-leader').value;
    const group = document.getElementById('event-group').value;
    
    // МАГИЯ СОХРАНЕНИЯ ТУТ
    const eventType = document.getElementById('event-type').value;
    const isSpecial = eventType === 'special';
    const isCampaign = eventType === 'campaign';
    
    const repeatWeekly = document.getElementById('repeat-weekly').checked;
    
    const btn = document.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    try {
        const baseDate = new Date(date);
        const numEvents = repeatWeekly ? 12 : 1; 
        
        let conflictFound = false;
        let conflictDateStr = '';

        for(let i = 0; i < numEvents; i++) {
            const checkDate = new Date(baseDate);
            checkDate.setDate(baseDate.getDate() + (i * 7));
            const tz = checkDate.getTimezoneOffset() * 60000;
            const dStr = new Date(checkDate.getTime() - tz).toISOString().split('T')[0];

            const exists = cachedEvents.find(ev => ev.date === dStr && ev.time === time && ev.group === group);
            if (exists) {
                conflictFound = true;
                const formattedDate = checkDate.toLocaleDateString(localeFormat, { day: 'numeric', month: 'long' });
                conflictDateStr = formattedDate;
                break; 
            }
        }

        if (conflictFound) {
            const proceed = confirm(`⚠️ Внимание!\nНа ${conflictDateStr} в ${time} уже запланирована встреча для группы "${group}".\n\nВы точно хотите добавить дубликат?`);
            if (!proceed) {
                btn.disabled = false;
                return; 
            }
        }

        const batch = writeBatch(db); 

        for(let i = 0; i < numEvents; i++) {
            const eventDate = new Date(baseDate);
            eventDate.setDate(baseDate.getDate() + (i * 7));
            
            const tzOffset = eventDate.getTimezoneOffset() * 60000;
            const dateStr = new Date(eventDate.getTime() - tzOffset).toISOString().split('T')[0];
            
            const newDocRef = doc(collection(db, "events"));
            batch.set(newDocRef, {
                date: dateStr,
                time: time,
                title: title,
                leader: leader,
                group: group,
                isSpecial: isSpecial,
                isCampaign: isCampaign, // Сохраняем флаг
                createdAt: new Date().toISOString()
            });
        }
        
        await batch.commit();
        
        window.showToast(window.t('success'));
        document.getElementById('add-event-form').reset();
    } catch(err) { alert(window.t('error_general')); }
    
    btn.disabled = false;
});
