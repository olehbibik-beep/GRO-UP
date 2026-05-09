import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "stands_title": "Стенды",
        "btn_back": "Назад",
        "time_label": "Время",
        "pub_1": "Возв. 1",
        "pub_2": "Возв. 2",
        "btn_signup": "Записаться",
        "loading": "Загрузка расписания...",
        "access_denied": "У вас нет доступа к расписанию стендов.",
        "confirm_cancel": "Отменить эту запись?",
        "success": "Успешно!",
        "error_network": "Ошибка сети",
        "not_serving": "Не служим",
        "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    },
    cs: {
        "stands_title": "Stojany",
        "btn_back": "Zpět",
        "time_label": "Čas",
        "pub_1": "Zvěst. 1",
        "pub_2": "Zvěst. 2",
        "btn_signup": "Zapsat se",
        "loading": "Načítání rozvrhu...",
        "access_denied": "Nemáte přístup k rozvrhu stojanů.",
        "confirm_cancel": "Zrušit tento zápis?",
        "success": "Úspěšně!",
        "error_network": "Chyba sítě",
        "not_serving": "Nesloužíme",
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
    toast.className = `bg-slate-800 text-white px-4 py-3 rounded-md text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

window.scrollDates = (offset) => { document.getElementById('dates-container').scrollBy({ left: offset, behavior: 'smooth' }); };

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
let userName = "";

if (!userId) window.location.href = 'login.html';

getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const data = docSnap.data();
    userName = data.name;
    const roles = data.roles || [];
    
    const canAccess = roles.includes("Служение со стендом") || roles.includes("Ответственный за стенды") || roles.includes("Владелец") || roles.includes("Админ");
    if (!canAccess) {
        document.body.innerHTML = `<div class="p-10 text-center font-bold text-red-500 mt-20">${window.t('access_denied')}</div>`;
        setTimeout(() => window.location.href = 'index.html', 3000);
        return;
    }
    initDates();
});

let selectedDateStr = "";
let activeLocation = "ML - CupVital"; 
let unsubscribeSlots = null;
let unsubscribeSettings = null;
let currentSlotsData = {};
let currentBlockedSlots = [];

// НОВОЕ ВРЕМЯ 10:00 - 18:00
const TIME_SLOTS = [
    "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"
];

window.selectLocation = (loc) => {
    document.querySelectorAll('.loc-btn').forEach(btn => btn.classList.remove('active', 'bg-[#1e293b]', 'text-white'));
    document.querySelectorAll('.loc-btn').forEach(btn => btn.classList.add('bg-white', 'text-slate-500'));
    
    const activeBtn = document.getElementById(`loc-${loc.replace(/\s/g, '')}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-slate-500');
        activeBtn.classList.add('active', 'bg-[#1e293b]', 'text-white');
    }
    activeLocation = loc;
    loadData();
};

function initDates() {
    const container = document.getElementById('dates-container');
    let html = '';
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const dateStr = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
        const dayNum = d.getDate();
        const dayName = window.t('days')[d.getDay()];
        const monthName = window.t('months')[d.getMonth()];
        
        const isSelected = i === 0 ? 'active' : 'bg-white border-slate-200 text-slate-500';
        if (i === 0) { selectedDateStr = dateStr; updateDateDisplay(dayNum, monthName, dayName); }

        html += `
            <button onclick="selectDate('${dateStr}', '${dayNum}', '${monthName}', '${dayName}', this)" class="date-chip shrink-0 w-[55px] h-[65px] md:w-[60px] md:h-[70px] rounded-md border flex flex-col items-center justify-center transition-colors outline-none snap-center ${isSelected}">
                <span class="text-xs md:text-sm font-black mb-0.5">${dayNum}</span>
                <span class="date-day text-[9px] font-bold uppercase tracking-widest text-slate-400">${dayName}</span>
            </button>
        `;
    }
    container.innerHTML = html;
    loadData();
}

window.selectDate = (dateStr, dayNum, monthName, dayName, btnEl) => {
    document.querySelectorAll('.date-chip').forEach(el => {
        el.className = 'date-chip shrink-0 w-[55px] h-[65px] md:w-[60px] md:h-[70px] rounded-md border flex flex-col items-center justify-center transition-colors outline-none snap-center bg-white border-slate-200 text-slate-500';
    });
    btnEl.className = 'date-chip active shrink-0 w-[55px] h-[65px] md:w-[60px] md:h-[70px] rounded-md border flex flex-col items-center justify-center transition-colors outline-none snap-center';
    
    selectedDateStr = dateStr;
    updateDateDisplay(dayNum, monthName, dayName);
    loadData();
};

function updateDateDisplay(dayNum, monthName, dayName) {
    document.getElementById('selected-date-display').innerText = `${dayNum} ${monthName} — ${dayName}`;
}

function loadData() {
    if (unsubscribeSlots) unsubscribeSlots();
    if (unsubscribeSettings) unsubscribeSettings();
    
    document.getElementById('slots-container').innerHTML = `<p class="text-center py-10 text-slate-400 italic text-sm">${window.t('loading')}</p>`;
    
    const settingsDocId = `${selectedDateStr}_${activeLocation.replace(/\s+/g, '')}`;
    
    unsubscribeSettings = onSnapshot(doc(db, "stand_settings", settingsDocId), (docSnap) => {
        currentBlockedSlots = docSnap.exists() ? (docSnap.data().blocked || []) : [];
        renderTable(); 
    });

    const q = query(collection(db, "stands"), where("date", "==", selectedDateStr), where("location", "==", activeLocation));
    unsubscribeSlots = onSnapshot(q, (snapshot) => {
        currentSlotsData = {};
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!currentSlotsData[data.time]) currentSlotsData[data.time] = {};
            currentSlotsData[data.time][data.slot] = { id: docSnap.id, ...data };
        });
        renderTable();
    });
}

function renderTable() {
    const container = document.getElementById('slots-container');
    let html = '';
    
    TIME_SLOTS.forEach(time => {
        html += `<div class="flex items-stretch min-h-[50px] bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">`;
        html += `<div class="w-1/4 p-2 flex items-center justify-center border-r border-slate-100">
                    <span class="text-[10px] md:text-xs font-black text-slate-600 tracking-wide">${time.replace(' - ', '<br>')}</span>
                 </div>`;
        
        if (currentBlockedSlots.includes(time)) {
            html += `
                <div class="w-3/4 flex-grow p-2">
                    <div class="w-full h-full min-h-[36px] bg-slate-100 border border-slate-200 text-slate-400 rounded-md flex items-center justify-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                        ${window.t('not_serving')}
                    </div>
                </div>
            `;
        } else {
            for (let slot = 1; slot <= 2; slot++) {
                const shift = currentSlotsData[time] ? currentSlotsData[time][slot] : null;
                let cellHtml = '';
                
                if (!shift) {
                    cellHtml = `<button onclick="toggleSlot('${time}', ${slot}, null)" class="w-full h-full p-1.5 outline-none">
                                    <div class="w-full h-full min-h-[40px] bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-emerald-600 hover:text-white rounded-md flex items-center justify-center transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                        ${window.t('btn_signup')}
                                    </div>
                                </button>`;
                } else if (shift.userId === userId) {
                    cellHtml = `<button onclick="toggleSlot('${time}', ${slot}, '${shift.id}')" class="w-full h-full p-1.5 outline-none">
                                    <div class="w-full h-full min-h-[40px] bg-slate-800 hover:bg-red-500 border border-slate-800 hover:border-red-600 text-white rounded-md flex flex-col items-center justify-center transition-colors">
                                        <span class="text-[9px] md:text-[11px] font-black truncate w-full px-1 text-center leading-tight">${shift.userName}</span>
                                    </div>
                                </button>`;
                } else {
                    cellHtml = `<div class="w-full h-full p-1.5">
                                    <div class="w-full h-full min-h-[40px] bg-slate-100 border border-slate-200 text-slate-500 rounded-md flex items-center justify-center">
                                        <span class="text-[9px] md:text-[11px] font-bold truncate w-full px-1 text-center leading-tight">${shift.userName}</span>
                                    </div>
                                </div>`;
                }
                
                html += `<div class="w-3/8 flex-grow ${slot === 2 ? 'border-l border-slate-100' : ''}">${cellHtml}</div>`;
            }
        }
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

window.toggleSlot = async (time, slot, existingDocId) => {
    try {
        if (existingDocId) {
            if (confirm(window.t('confirm_cancel'))) {
                await deleteDoc(doc(db, "stands", existingDocId));
                window.showToast(window.t('success'));
            }
        } else {
            const safeLoc = activeLocation.replace(/\s+/g, '');
            const safeTime = time.replace(/\s/g, '');
            const docId = `${selectedDateStr}_${safeLoc}_${safeTime}_${slot}`;
            
            await setDoc(doc(db, "stands", docId), {
                date: selectedDateStr,
                location: activeLocation,
                time: time,
                slot: slot,
                userId: userId,
                userName: userName,
                createdAt: new Date().toISOString()
            });
            window.showToast(window.t('success'));
        }
    } catch (e) {
        alert(window.t('error_network'));
    }
};
