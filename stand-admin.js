import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "stand_admin_title": "Стенды (Админ)",
        "btn_back": "Назад",
        "requests_title": "Заявки на стенд",
        "approved_users": "Одобренные возвещатели",
        "schedule_title": "Управление расписанием",
        "stats_title": "Статистика за текущий месяц",
        "click_to_block": "Нажмите, чтобы закрыть/открыть час",
        "no_requests": "Нет новых заявок",
        "no_approved": "Пока нет одобренных возвещателей",
        "btn_approve": "Одобрить",
        "btn_reject": "Отклонить",
        "btn_revoke": "Забрать доступ",
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
        "approved_users": "Schválení zvěstovatelé",
        "schedule_title": "Správa rozvrhu",
        "stats_title": "Statistika za tento měsíc",
        "click_to_block": "Kliknutím zavřete/otevřete hodinu",
        "no_requests": "Žádné nové žádosti",
        "no_approved": "Zatím žádní schválení zvěstovatelé",
        "btn_approve": "Schválit",
        "btn_reject": "Zamítnout",
        "btn_revoke": "Odebrat přístup",
        "confirm_revoke": "Opravdu odebrat přístup ke stojanu tomuto zvěstovateli?",
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

document.querySelectorAll('[data-lang]').forEach(el => {
    el.innerHTML = window.t(el.getAttribute('data-lang'));
});

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
    const isStandAdmin = roles.includes("Ответственный за стенды") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!isStandAdmin) {
        window.location.href = 'index.html';
    } else {
        initAdminDates();
        loadStatistics();
    }
});

// 1. ЗАЯВКИ
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
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Хочет служить со стендом</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="approveStand('${req.id}', '${req.userId}')" title="${window.t('btn_approve')}" class="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm outline-none">✔️</button>
                    <button onclick="rejectStand('${req.id}')" title="${window.t('btn_reject')}" class="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm outline-none">✖</button>
                </div>
            </div>
        `;
    });

    countEl.innerText = count;
    list.innerHTML = html || `<p class="text-slate-400 text-xs text-center py-4 italic">${window.t('no_requests')}</p>`;
});

// 2. ОДОБРЕННЫЕ ПОЛЬЗОВАТЕЛИ
onSnapshot(collection(db, "users"), (snapshot) => {
    const list = document.getElementById('approved-users-list');
    let html = '';
    let count = 0;

    const users = [];
    snapshot.forEach(docSnap => {
        const u = docSnap.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Служение со стендом')) {
            users.push({ id: docSnap.id, name: u.name });
        }
    });

    users.sort((a, b) => a.name.localeCompare(b.name));

    users.forEach(u => {
        count++;
        html += `
            <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span class="font-bold text-slate-700 text-sm truncate pr-2">${u.name}</span>
                <button onclick="removeStandAccess('${u.id}')" class="shrink-0 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest rounded transition-colors outline-none shadow-sm">
                    ${window.t('btn_revoke')}
                </button>
            </div>
        `;
    });

    list.innerHTML = html || `<p class="col-span-full text-slate-400 text-xs text-center py-4 italic">${window.t('no_approved')}</p>`;
});

// ГЛОБАЛЬНЫЕ ФУНКЦИИ ОДОБРЕНИЯ
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

window.rejectStand = async (reqId) => {
    try { await deleteDoc(doc(db, "requests", reqId)); } catch (e) {}
};

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

// ------------------------------------------------------------------
// 3. УПРАВЛЕНИЕ РАСПИСАНИЕМ (БЛОКИРОВКА СЛОТОВ)
// ------------------------------------------------------------------

let selectedAdminDateStr = "";
const TIME_SLOTS = ["08:00 - 09:00","09:00 - 10:00","10:00 - 11:00","11:00 - 12:00","12:00 - 13:00","13:00 - 14:00","14:00 - 15:00","15:00 - 16:00"];
let unsubscribeSettings = null;

function initAdminDates() {
    const container = document.getElementById('admin-dates-container');
    let html = '';
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        const tzOffset = d.getTimezoneOffset() * 60000;
        const dateStr = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
        const dayNum = d.getDate();
        const dayName = window.t('days')[d.getDay()];
        const monthName = window.t('months')[d.getMonth()];
        
        const isSelected = i === 0 ? 'active' : 'bg-white border-slate-200 text-slate-500';
        if (i === 0) { selectedAdminDateStr = dateStr; document.getElementById('admin-selected-date').innerText = `${dayNum} ${monthName}`; }

        html += `
            <button onclick="selectAdminDate('${dateStr}', '${dayNum}', '${monthName}', this)" class="date-chip shrink-0 w-[55px] h-[60px] rounded-lg border flex flex-col items-center justify-center transition-colors outline-none snap-center ${isSelected}">
                <span class="text-xs font-black mb-0.5">${dayNum}</span>
                <span class="date-day text-[9px] font-bold uppercase tracking-widest text-slate-400">${dayName}</span>
            </button>
        `;
    }
    
    container.innerHTML = html;
    loadDaySettings();
}

window.selectAdminDate = (dateStr, dayNum, monthName, btnEl) => {
    document.querySelectorAll('#admin-dates-container .date-chip').forEach(el => {
        el.className = 'date-chip shrink-0 w-[55px] h-[60px] rounded-lg border flex flex-col items-center justify-center transition-colors outline-none snap-center bg-white border-slate-200 text-slate-500';
    });
    btnEl.className = 'date-chip active shrink-0 w-[55px] h-[60px] rounded-lg border flex flex-col items-center justify-center transition-colors outline-none snap-center';
    
    selectedAdminDateStr = dateStr;
    document.getElementById('admin-selected-date').innerText = `${dayNum} ${monthName}`;
    loadDaySettings();
};

function loadDaySettings() {
    if (unsubscribeSettings) unsubscribeSettings();
    const container = document.getElementById('admin-slots-container');
    
    unsubscribeSettings = onSnapshot(doc(db, "stand_settings", selectedAdminDateStr), (docSnap) => {
        let blockedSlots = [];
        if (docSnap.exists()) { blockedSlots = docSnap.data().blocked || []; }

        let html = '';
        TIME_SLOTS.forEach(time => {
            const isBlocked = blockedSlots.includes(time);
            
            const btnClass = isBlocked 
                ? 'bg-slate-100 border-slate-200 text-slate-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white';
                
            const iconHtml = isBlocked 
                ? `<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>` 
                : `<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
                
            const textHtml = isBlocked ? window.t('blocked_slot') : window.t('active_slot');

            html += `
                <button onclick="toggleSlotBlock('${time}', ${isBlocked})" class="w-full flex items-center justify-between p-3 rounded-lg border outline-none transition-colors shadow-sm ${btnClass}">
                    <span class="font-black text-sm font-mono">${time}</span>
                    <span class="flex items-center text-xs font-bold uppercase tracking-widest">${iconHtml} ${textHtml}</span>
                </button>
            `;
        });
        container.innerHTML = html;
    });
}

window.toggleSlotBlock = async (time, currentlyBlocked) => {
    const docRef = doc(db, "stand_settings", selectedAdminDateStr);
    try {
        const snap = await getDoc(docRef);
        let blocked = [];
        if (snap.exists()) blocked = snap.data().blocked || [];
        
        if (currentlyBlocked) {
            blocked = blocked.filter(t => t !== time); // Разблокируем
        } else {
            blocked.push(time); // Блокируем
        }
        await setDoc(docRef, { blocked }, { merge: true });
    } catch (e) { console.error(e); }
};

// ------------------------------------------------------------------
// 4. СТАТИСТИКА
// ------------------------------------------------------------------
function loadStatistics() {
    const today = new Date();
    // Ищем первое число текущего месяца (формат YYYY-MM-01)
    const firstDayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    
    // Вытягиваем все записи стендов в этом месяце
    const statsQuery = query(collection(db, "stands"), where("date", ">=", firstDayStr));
    
    onSnapshot(statsQuery, (snapshot) => {
        const container = document.getElementById('stats-container');
        let stats = {};
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!stats[data.userName]) stats[data.userName] = 0;
            stats[data.userName]++;
        });

        // Превращаем объект в массив и сортируем по количеству смен
        const sortedStats = Object.keys(stats).map(name => ({ name, count: stats[name] })).sort((a, b) => b.count - a.count);

        let html = '';
        if (sortedStats.length === 0) {
            html = `<p class="text-slate-400 text-xs italic text-center py-2">Записей в этом месяце еще нет</p>`;
        } else {
            sortedStats.forEach((s, index) => {
                // Топ-3 выделяем визуально
                const isTop = index < 3;
                const bgClass = isTop ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100';
                const textColor = isTop ? 'text-indigo-700' : 'text-slate-700';
                const countColor = isTop ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600';

                html += `
                    <div class="flex items-center justify-between p-2.5 rounded-lg border ${bgClass}">
                        <span class="font-bold text-sm ${textColor} truncate pr-2 flex items-center gap-2">
                            ${isTop ? '⭐' : ''} ${s.name}
                        </span>
                        <span class="flex items-center gap-1.5 shrink-0">
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${window.t('total_shifts')}</span>
                            <span class="${countColor} px-2 py-0.5 rounded font-black text-xs min-w-[24px] text-center">${s.count}</span>
                        </span>
                    </div>
                `;
            });
        }
        
        if (container) container.innerHTML = html;
    });
}
