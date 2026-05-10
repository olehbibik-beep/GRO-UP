import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, addDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "calendar_title": "Календарь встреч", "btn_back": "Назад", "date": "Дата", "time": "Время",
        "event_name": "Название", "event_name_placeholder": "Например: Выходные встречи",
        "leader": "Проводит", "group": "Группа", "all_groups": "Все", "special_event": "Особое событие",
        "repeat_weekly": "Повторять еженедельно (12 нед.)", "publish": "Опубликовать",
        "schedule_title": "Расписание встреч", "show_other_groups": "Показать другие группы",
        "success": "Успешно!", "error_general": "Ошибка!", "confirm_delete": "Удалить событие?",
        "loading": "Загрузка...", "history_empty": "Запланированных встреч нет"
    },
    cs: {
        "calendar_title": "Rozvrh schůzek", "btn_back": "Zpět", "date": "Datum", "time": "Čas",
        "event_name": "Název", "event_name_placeholder": "Např. Víkendová shromáždění",
        "leader": "Vede", "group": "Skupina", "all_groups": "Společné", "special_event": "Zvláštní událost",
        "repeat_weekly": "Opakovat týdně (12 týd.)", "publish": "Publikovat",
        "schedule_title": "Rozvrh schůzek", "show_other_groups": "Zobrazit ostatní skupiny",
        "success": "Úspěšně!", "error_general": "Došlo k chybě!", "confirm_delete": "Smazat událost?",
        "loading": "Načítání...", "history_empty": "Žádné naplánované schůzky"
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
    }
});

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

    cachedEvents.forEach(ev => {
        if (ev.date < todayStr) return; // Скрываем старые в админке
        
        const groupMatch = (ev.group === "Все" || ev.group === "Všechny" || ev.group == userGroup || showAll);
        if (!groupMatch) return;

        const dateObj = new Date(ev.date);
        const dateStr = dateObj.toLocaleDateString(localeFormat, { day: 'numeric', month: 'long', year: 'numeric' });
        
        const isSpecial = ev.isSpecial ? `<span class="text-rose-500 ml-1">⭐</span>` : '';
        const groupBadge = (ev.group === "Все" || ev.group === "Všechny") ? window.t('all_groups') : ev.group;
        
        html += `
            <div class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-start gap-4">
                    <div class="text-sm font-black text-slate-400 pt-0.5 w-12 text-right shrink-0">${ev.time}</div>
                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-black text-slate-800 text-sm md:text-base leading-tight">${ev.title} ${isSpecial}</span>
                            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">${groupBadge}</span>
                        </div>
                        <div class="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            ${dateStr}
                        </div>
                    </div>
                </div>
                <button onclick="deleteEvent('${ev.id}')" class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors outline-none shrink-0 border border-transparent hover:border-red-100 ml-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        `;
    });
    
    list.innerHTML = html || `<p class="p-6 text-center text-slate-400 text-sm italic">${window.t('history_empty')}</p>`;
};

window.deleteEvent = async (id) => {
    if(confirm(window.t('confirm_delete'))) {
        try { await deleteDoc(doc(db, "events", id)); window.showToast(window.t('success')); }
        catch(e) { alert(window.t('error_general')); }
    }
};

document.getElementById('add-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const title = document.getElementById('event-title').value;
    const leader = document.getElementById('event-leader').value;
    const group = document.getElementById('event-group').value;
    const isSpecial = document.getElementById('event-special').checked;
    const repeatWeekly = document.getElementById('repeat-weekly').checked;
    
    const btn = document.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    try {
        const baseDate = new Date(date);
        const numEvents = repeatWeekly ? 12 : 1; 
        
        for(let i = 0; i < numEvents; i++) {
            const eventDate = new Date(baseDate);
            eventDate.setDate(baseDate.getDate() + (i * 7));
            
            const tzOffset = eventDate.getTimezoneOffset() * 60000;
            const dateStr = new Date(eventDate.getTime() - tzOffset).toISOString().split('T')[0];
            
            await addDoc(collection(db, "events"), {
                date: dateStr,
                time: time,
                title: title,
                leader: leader,
                group: group,
                isSpecial: isSpecial,
                createdAt: new Date().toISOString()
            });
        }
        
        window.showToast(window.t('success'));
        document.getElementById('add-event-form').reset();
    } catch(err) { alert(window.t('error_general')); }
    
    btn.disabled = false;
});
