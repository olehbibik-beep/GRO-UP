import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "stands_title": "Стенды",
        "btn_back": "Назад",
        "time_label": "Время",
        "pub_1": "Возвещатель 1",
        "pub_2": "Возвещатель 2",
        "btn_signup": "Записаться",
        "loading": "Загрузка расписания...",
        "access_denied": "У вас нет доступа к расписанию стендов. Обратитесь к ответственному брату.",
        "confirm_cancel": "Отменить эту запись на стенд?",
        "success": "Успешно!",
        "error_network": "Ошибка сети",
        "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        "days": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    },
    cs: {
        "stands_title": "Stojany",
        "btn_back": "Zpět",
        "time_label": "Čas",
        "pub_1": "Zvěstovatel 1",
        "pub_2": "Zvěstovatel 2",
        "btn_signup": "Zapsat se",
        "loading": "Načítání rozvrhu...",
        "access_denied": "Nemáte přístup k rozvrhu stojanů. Obraťte se na odpovědného bratra.",
        "confirm_cancel": "Zrušit tento zápis na stojan?",
        "success": "Úspěšně!",
        "error_network": "Chyba sítě",
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
let userName = "";

if (!userId) window.location.href = 'login.html';

// Проверка прав пользователя
getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const data = docSnap.data();
    userName = data.name;
    const roles = data.roles || [];
    
    // Пускаем только тех, у кого есть допуск или админов
    const canAccess = roles.includes("Служение со стендом") || roles.includes("Ответственный за стенды") || roles.includes("Владелец") || roles.includes("Админ");
    if (!canAccess) {
        document.body.innerHTML = `<div class="p-10 text-center font-bold text-red-500 mt-20">${window.t('access_denied')}</div>`;
        setTimeout(() => window.location.href = 'index.html', 3000);
        return;
    }
    
    initDates();
});

// Глобальные переменные
let selectedDateStr = ""; // Формат YYYY-MM-DD
let unsubscribeSlots = null;

// Стандартные часы (позже в Этапе 3 сделаем их настраиваемыми)
const TIME_SLOTS = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00"
];

// ГЕНЕРАЦИЯ КАЛЕНДАРЯ НА 14 ДНЕЙ
function initDates() {
    const container = document.getElementById('dates-container');
    let html = '';
    
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        // Надежное форматирование YYYY-MM-DD с учетом часового пояса
        const tzOffset = d.getTimezoneOffset() * 60000;
        const dateStr = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
        
        const dayNum = d.getDate();
        const dayName = window.t('days')[d.getDay()];
        const monthName = window.t('months')[d.getMonth()];
        
        const isSelected = i === 0 ? 'active' : 'bg-white border-slate-200 text-slate-500';
        if (i === 0) { selectedDateStr = dateStr; updateDateDisplay(dayNum, monthName, dayName); }

        html += `
            <button onclick="selectDate('${dateStr}', '${dayNum}', '${monthName}', '${dayName}', this)" class="date-chip shrink-0 w-[60px] h-[70px] rounded-xl border flex flex-col items-center justify-center transition-colors outline-none snap-center ${isSelected}">
                <span class="text-xs font-black mb-0.5">${dayNum}</span>
                <span class="date-day text-[9px] font-bold uppercase tracking-widest text-slate-400">${dayName}</span>
            </button>
        `;
    }
    
    container.innerHTML = html;
    loadSlots();
}

window.selectDate = (dateStr, dayNum, monthName, dayName, btnEl) => {
    document.querySelectorAll('.date-chip').forEach(el => {
        el.className = 'date-chip shrink-0 w-[60px] h-[70px] rounded-xl border flex flex-col items-center justify-center transition-colors outline-none snap-center bg-white border-slate-200 text-slate-500';
    });
    btnEl.className = 'date-chip active shrink-0 w-[60px] h-[70px] rounded-xl border flex flex-col items-center justify-center transition-colors outline-none snap-center';
    
    selectedDateStr = dateStr;
    updateDateDisplay(dayNum, monthName, dayName);
    loadSlots();
};

function updateDateDisplay(dayNum, monthName, dayName) {
    document.getElementById('selected-date-display').innerText = `${dayNum} ${monthName} — ${dayName}`;
}

// ЗАГРУЗКА И ОТРИСОВКА СЛОТОВ
function loadSlots() {
    if (unsubscribeSlots) unsubscribeSlots();
    
    const container = document.getElementById('slots-container');
    container.innerHTML = `<p class="text-center py-10 text-slate-400 italic text-sm">${window.t('loading')}</p>`;
    
    const q = query(collection(db, "stands"), where("date", "==", selectedDateStr));
    
    unsubscribeSlots = onSnapshot(q, (snapshot) => {
        // Собираем данные в удобную карту: map[time][slotIndex] = data
        let slotsData = {};
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!slotsData[data.time]) slotsData[data.time] = {};
            slotsData[data.time][data.slot] = { id: docSnap.id, ...data };
        });

        let html = '';
        
        TIME_SLOTS.forEach(time => {
            html += `<div class="flex items-stretch min-h-[50px] bg-white group hover:bg-slate-50 transition-colors">`;
            // Колонка времени
            html += `<div class="w-1/4 p-2 flex items-center justify-center border-r border-slate-100">
                        <span class="text-[10px] md:text-xs font-black text-slate-600 tracking-wide">${time.replace(' - ', '<br>')}</span>
                     </div>`;
            
            // Колонки Возвещателей (Slot 1 и Slot 2)
            for (let slot = 1; slot <= 2; slot++) {
                const shift = slotsData[time] ? slotsData[time][slot] : null;
                
                let cellHtml = '';
                if (!shift) {
                    // СВОБОДНО
                    cellHtml = `<button onclick="toggleSlot('${time}', ${slot}, null)" class="w-full h-full p-2 outline-none">
                                    <div class="w-full h-full min-h-[36px] bg-emerald-50 hover:bg-emerald-500 border border-emerald-200 text-emerald-600 hover:text-white rounded-lg flex items-center justify-center transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        ${window.t('btn_signup')}
                                    </div>
                                </button>`;
                } else if (shift.userId === userId) {
                    // МОЯ ЗАПИСЬ
                    cellHtml = `<button onclick="toggleSlot('${time}', ${slot}, '${shift.id}')" class="w-full h-full p-2 outline-none">
                                    <div class="w-full h-full min-h-[36px] bg-blue-500 hover:bg-red-500 border border-blue-600 hover:border-red-600 text-white rounded-lg flex flex-col items-center justify-center transition-colors shadow-sm">
                                        <span class="text-[10px] md:text-xs font-black truncate w-full px-1 text-center">${shift.userName}</span>
                                    </div>
                                </button>`;
                } else {
                    // ЗАНЯТО ДРУГИМ
                    cellHtml = `<div class="w-full h-full p-2">
                                    <div class="w-full h-full min-h-[36px] bg-slate-100 border border-slate-200 text-slate-500 rounded-lg flex items-center justify-center">
                                        <span class="text-[10px] md:text-xs font-bold truncate w-full px-1 text-center">${shift.userName}</span>
                                    </div>
                                </div>`;
                }
                
                html += `<div class="w-3/8 flex-grow border-l border-slate-100 ${slot === 1 ? '' : 'border-l-slate-100'}">${cellHtml}</div>`;
            }
            html += `</div>`;
        });
        
        container.innerHTML = html;
    });
}

// ЗАПИСЬ И ОТМЕНА ЗАПИСИ
window.toggleSlot = async (time, slot, existingDocId) => {
    try {
        if (existingDocId) {
            // Отмена записи
            if (confirm(window.t('confirm_cancel'))) {
                await deleteDoc(doc(db, "stands", existingDocId));
                window.showToast(window.t('success'));
            }
        } else {
            // Создание новой записи
            // Используем жесткий ID, чтобы никто не мог случайно создать дубль в одну миллисекунду
            const docId = `${selectedDateStr}_${time.replace(/\s/g, '')}_${slot}`;
            
            await setDoc(doc(db, "stands", docId), {
                date: selectedDateStr,
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
        console.error(e);
    }
};
