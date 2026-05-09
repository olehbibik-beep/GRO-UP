import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "stand_admin_title": "Стенды (Админ)",
        "btn_back": "Назад",
        "requests_title": "Заявки на стенд",
        "approved_users": "Одобренные",
        "schedule_title": "Блокировка часов",
        "stats_title": "Статистика за месяц (текущая локация)",
        "click_to_block": "Нажмите, чтобы закрыть/открыть час",
        "copy_month": "На месяц",
        "no_requests": "Нет новых заявок",
        "no_approved": "Пока нет одобренных возвещателей",
        "btn_approve": "Одобрить",
        "btn_reject": "Отклонить",
        "btn_revoke": "Удалить",
        "confirm_revoke": "Точно забрать допуск к стенду у этого возвещателя?",
        "success": "Успешно!",
        "error_general": "Произошла ошибка!",
        "active_slot": "Открыто",
        "blocked_slot": "Заблокировано",
        "total_shifts": "Смен: ",
        "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    },
    cs: {
        "stand_admin_title": "Stojany (Admin)",
        "btn_back": "Zpět",
        "requests_title": "Žádosti o stojan",
        "approved_users": "Schválení",
        "schedule_title": "Blokování hodin",
        "stats_title": "Statistika za měsíc (aktuální lokace)",
        "click_to_block": "Kliknutím zavřete/otevřete",
        "copy_month": "Na měsíc",
        "no_requests": "Žádné nové žádosti",
        "no_approved": "Zatím žádní schválení",
        "btn_approve": "Schválit",
        "btn_reject": "Zamítnout",
        "btn_revoke": "Odebrat",
        "confirm_revoke": "Opravdu odebrat přístup ke stojanu?",
        "success": "Úspěšně!",
        "error_general": "Došlo k chybě!",
        "active_slot": "Otevřeno",
        "blocked_slot": "Zablokováno",
        "total_shifts": "Služeb: ",
        "months": ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"],
        "days": ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
window.t = (key) => dict[currentLang][key] || key;
document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = window.t(el.getAttribute('data-lang')));

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

window.scrollDates = (offset) => { document.getElementById('admin-dates-container').scrollBy({ left: offset, behavior: 'smooth' }); };

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
    const isStandAdmin = roles.includes("Ответственный за стенды") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!isStandAdmin) window.location.href = 'index.html';
    else { initAdminDates(); loadStatistics(); }
});

let activeLocation = "ML - CupVital";

window.selectLocation = (loc) => {
    document.querySelectorAll('.loc-btn').forEach(btn => btn.classList.remove('active', 'bg-[#1e293b]', 'text-white'));
    document.querySelectorAll('.loc-btn').forEach(btn => btn.classList.add('bg-white', 'text-slate-500'));
    
    const activeBtn = document.getElementById(`loc-${loc.replace(/\s/g, '')}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-slate-500');
        activeBtn.classList.add('active', 'bg-[#1e293b]', 'text-white');
    }
    
    activeLocation = loc;
    loadDaySettings(); 
    loadStatistics();  
};

const reqQuery = query(collection(db, "requests"), where("type", "==", "stand"));
onSnapshot(reqQuery, (snapshot) => {
    const list = document.getElementById('stand-requests-list');
    const countEl = document.getElementById('stand-req-count');
    let html = '';
    let count = 0;

    const reqs = [];
    snapshot.forEach(docSnap => reqs.push({ id: docSnap.id, ...docSnap.data() }));
    reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    reqs.forEach(req => {
        count++;
        html += `
            <div class="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                <div class="flex flex-col">
                    <p class="font-black text-slate-800 text-sm leading-tight">${req.userName}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Заявка на стенд</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="approveStand('${req.id}', '${req.userId}')" class="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-md transition-colors border border-emerald-100 outline-none">✔️</button>
                    <button onclick="rejectStand('${req.id}')" class="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors outline-none">✖</button>
                </div>
            </div>
        `;
    });
    countEl.innerText = count;
    list.innerHTML = html || `<p class="text-slate-400 text-xs text-center py-4 italic">${window.t('no_requests')}</p>`;
});

onSnapshot(collection(db, "users"), (snapshot) => {
    const list = document.getElementById('approved-users-list');
    let html = '';
    const users = [];

    snapshot.forEach(docSnap => {
        const u = docSnap.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Служение со стендом')) {
            users.push({ id: docSnap.id, name: u.name });
        }
    });

    users.sort((a, b) => a.name.localeCompare(b.name));

    users.forEach(u => {
        html += `
            <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-md">
                <span class="font-bold text-slate-700 text-sm truncate pr-2">${u.name}</span>
                <button onclick="removeStandAccess('${u.id}')" class="shrink-0 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest rounded transition-colors outline-none">
                    ${window.t('btn_revoke')}
                </button>
            </div>
        `;
    });
    list.innerHTML = html || `<p class="col-span-full text-slate-400 text-xs text-center py-4 italic">${window.t('no_approved')}</p>`;
});

window.approveStand = async (reqId, userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const roles = userSnap.data().roles || [];
            if (!roles.includes("Служение со стендом")) {
                roles.push("Служение со стендом");
                await updateDoc(userRef, { roles: roles });
            }
        }
        await deleteDoc(doc(db, "requests", reqId));
        window.showToast(window.t('success'));
    } catch (e) { alert(window.t('error_general')); }
};

window.rejectStand = async (reqId) => { try { await deleteDoc(doc(db, "requests", reqId)); } catch (e) {} };

window.removeStandAccess = async (userId) => {
    if (confirm(window.t('confirm_revoke'))) {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                let roles = userSnap.data().roles || [];
                roles = roles.filter(r => r !== "Служение со стендом");
                await updateDoc(userRef, { roles: roles });
                window.showToast(window.t('success'));
            }
        } catch (e) { alert(window.t('error_general')); }
    }
};

// РАСПИСАНИЕ
let selectedAdminDateStr = "";
let currentAdminDayNum = null;
let currentBlockedCache = [];

const TIME_SLOTS = [
    "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"
];
let unsubscribeSettings = null;

function initAdminDates() {
    const container = document.getElementById('admin-dates-container');
    let html = '';
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        const tzOffset = d.getTimezoneOffset() * 60000;
        const dateStr = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
        const dayNum = d.getDate();
        const dayOfWeek = d.getDay(); // 0-6
        const dayName = window.t('days')[dayOfWeek];
        const monthName = window.t('months')[d.getMonth()];
        
        const isSelected = i === 0 ? 'active' : 'bg-white border-slate-200 text-slate-500';
        if (i === 0) { 
            selectedAdminDateStr = dateStr; 
            currentAdminDayNum = dayOfWeek;
            document.getElementById('admin-selected-date').innerText = `${dayNum} ${monthName}`; 
        }

        html += `
            <button onclick="selectAdminDate('${dateStr}', '${dayNum}', '${monthName}', ${dayOfWeek}, this)" class="date-chip shrink-0 w-[55px] h-[65px] md:w-[60px] md:h-[70px] rounded-md border flex flex-col items-center justify-center transition-colors outline-none snap-center ${isSelected}">
                <span class="text-xs md:text-sm font-black mb-0.5">${dayNum}</span>
                <span class="date-day text-[9px] font-bold uppercase tracking-widest text-slate-400">${dayName}</span>
            </button>
        `;
    }
    
    container.innerHTML = html;
    loadDaySettings();
}

window.selectAdminDate = (dateStr, dayNum, monthName, dayOfWeek, btnEl) => {
    document.querySelectorAll('#admin-dates-container .date-chip').forEach(el => {
        el.className = 'date-chip shrink-0 w-[55px] h-[65px] md:w-[60px] md:h-[70px] rounded-md border flex flex-col items-center justify-center transition-colors outline-none snap-center bg-white border-slate-200 text-slate-500';
    });
    btnEl.className = 'date-chip active shrink-0 w-[55px] h-[65px] md:w-[60px] md:h-[70px] rounded-md border flex flex-col items-center justify-center transition-colors outline-none snap-center';
    
    selectedAdminDateStr = dateStr;
    currentAdminDayNum = dayOfWeek;
    document.getElementById('admin-selected-date').innerText = `${dayNum} ${monthName}`;
    loadDaySettings();
};

function loadDaySettings() {
    if (unsubscribeSettings) unsubscribeSettings();
    const container = document.getElementById('admin-slots-container');
    
    const settingsDocId = `${selectedAdminDateStr}_${activeLocation.replace(/\s+/g, '')}`;
    
    unsubscribeSettings = onSnapshot(doc(db, "stand_settings", settingsDocId), (docSnap) => {
        let blockedSlots = [];
        if (docSnap.exists()) { blockedSlots = docSnap.data().blocked || []; }
        currentBlockedCache = blockedSlots; // Сохраняем для шаблона

        let html = '';
        TIME_SLOTS.forEach(time => {
            const isBlocked = blockedSlots.includes(time);
            
            const btnClass = isBlocked 
                ? 'bg-slate-100 border-slate-200 text-slate-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white';
                
            const iconHtml = isBlocked 
                ? `<svg class="w-4 h-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>` 
                : `<svg class="w-4 h-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
                
            const textHtml = isBlocked ? window.t('blocked_slot') : window.t('active_slot');

            html += `
                <button onclick="toggleSlotBlock('${time}', ${isBlocked})" class="w-full flex items-center justify-between p-3 rounded-md border outline-none transition-colors ${btnClass}">
                    <span class="font-black text-xs md:text-sm font-mono">${time}</span>
                    <span class="flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest">${iconHtml} ${textHtml}</span>
                </button>
            `;
        });
        container.innerHTML = html;
    });
}

window.toggleSlotBlock = async (time, currentlyBlocked) => {
    const settingsDocId = `${selectedAdminDateStr}_${activeLocation.replace(/\s+/g, '')}`;
    const docRef = doc(db, "stand_settings", settingsDocId);
    
    try {
        const snap = await getDoc(docRef);
        let blocked = [];
        if (snap.exists()) blocked = snap.data().blocked || [];
        
        if (currentlyBlocked) blocked = blocked.filter(t => t !== time); 
        else blocked.push(time); 
        
        await setDoc(docRef, { blocked }, { merge: true });
    } catch (e) { console.error(e); }
};

// 🔥 МАССОВОЕ КОПИРОВАНИЕ ШАБЛОНА
window.applyScheduleToAll = async () => {
    const dayName = window.t('days')[currentAdminDayNum];
    if (!confirm(`Применить текущие настройки блокировки ко всем таким же дням недели (${dayName}) на 30 дней вперед для локации ${activeLocation}?`)) return;

    try {
        const today = new Date();
        const safeLoc = activeLocation.replace(/\s+/g, '');

        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            if (d.getDay() === currentAdminDayNum) {
                const tzOffset = d.getTimezoneOffset() * 60000;
                const targetDateStr = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
                const targetDocId = `${targetDateStr}_${safeLoc}`;
                
                await setDoc(doc(db, "stand_settings", targetDocId), { blocked: currentBlockedCache }, { merge: true });
            }
        }
        window.showToast(window.t('success'));
    } catch (error) {
        alert(window.t('error_general'));
    }
};

// СТАТИСТИКА
function loadStatistics() {
    const today = new Date();
    const firstDayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const statsQuery = query(collection(db, "stands"), where("date", ">=", firstDayStr), where("location", "==", activeLocation));
    
    onSnapshot(statsQuery, (snapshot) => {
        const container = document.getElementById('stats-container');
        let stats = {};
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!stats[data.userName]) stats[data.userName] = 0;
            stats[data.userName]++;
        });

        const sortedStats = Object.keys(stats).map(name => ({ name, count: stats[name] })).sort((a, b) => b.count - a.count);

        let html = '';
        if (sortedStats.length === 0) {
            html = `<p class="text-slate-400 text-xs italic text-center py-2">Записей на ${activeLocation} в этом месяце еще нет</p>`;
        } else {
            sortedStats.forEach((s, index) => {
                const count = s.count;
                // Цветовая шкала 0-10, 10-20, 20+
                let progressColor = 'bg-emerald-500';
                let txtColor = 'text-emerald-700';
                if (count >= 20) { progressColor = 'bg-rose-500'; txtColor = 'text-rose-700'; }
                else if (count >= 10) { progressColor = 'bg-amber-500'; txtColor = 'text-amber-700'; }
                
                let progressPercent = (count / 50) * 100;
                if (progressPercent > 100) progressPercent = 100;

                html += `
                    <div class="flex flex-col p-3 rounded-md border border-slate-100 bg-slate-50 mb-2">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-sm text-slate-800 truncate pr-2">${index < 3 ? '⭐ ' : ''}${s.name}</span>
                            <span class="flex items-center gap-1.5 shrink-0">
                                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('total_shifts')}</span>
                                <span class="bg-white border border-slate-200 px-2 py-0.5 rounded ${txtColor} font-black text-xs min-w-[24px] text-center shadow-sm">${count}</span>
                            </span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                            <div class="${progressColor} h-1.5 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                `;
            });
        }
        
        if (container) container.innerHTML = html;
    });
}

// 🔥 ОЧИСТКА СТАТИСТИКИ
window.clearStats = async () => {
    if (!confirm(`Вы точно хотите удалить все записи стендов за этот месяц для локации ${activeLocation}? Это действие нельзя отменить!`)) return;

    try {
        const today = new Date();
        const firstDayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const q = query(collection(db, "stands"), where("date", ">=", firstDayStr), where("location", "==", activeLocation));
        
        const snapshot = await getDocs(q);
        const batchDeletes = [];
        snapshot.forEach(docSnap => batchDeletes.push(deleteDoc(doc(db, "stands", docSnap.id))));
        
        await Promise.all(batchDeletes);
        window.showToast(window.t('success'));
    } catch (e) {
        alert(window.t('error_general'));
    }
};
