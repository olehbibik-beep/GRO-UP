import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "loading_data": "Загрузка данных...",
        "loading": "Загрузка...",
        "delete": "Удалить",
        "btn_back": "Назад",
        "group_short": "Гр.",
        "duties_title": "График Дежурств - GRO-UP",
        "duties_h1": "График дежурств",
        "manage_duties": "Управление дежурствами",
        "assign_title": "Назначить",
        "duty_type_label": "Тип дежурства",
        "opt_cleaning": "Уборка зала",
        "opt_special_event": "Специальное событие",
        "start_group_label": "Группа (можно 1, 2)",
        "ph_group_example": "Например: 1, 2",
        "start_monday_label": "С понедельника (Дата)",
        "auto_distribute": "Авто-раскидать",
        "how_many_weeks": "Недель?",
        "btn_assign": "Назначить",
        "current_schedule": "Текущий график",
        "alert_select_monday": "Выберите дату понедельника!",
        "generating": "Генерация...",
        "success_with_tick": "Успешно!",
        "confirm_delete_duty": "Удалить дежурство из графика?",
        "all_groups": "Все",
        "no_duties_planned": "Предстоящих дежурств нет.",
        "months": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
    },
    cs: {
        "loading_data": "Načítání dat...",
        "loading": "Načítání...",
        "delete": "Smazat",
        "btn_back": "Zpět",
        "group_short": "Sk.",
        "duties_title": "Rozpis služeb - GRO-UP",
        "duties_h1": "Rozpis služeb",
        "manage_duties": "Správa služeb",
        "assign_title": "Přiřadit",
        "duty_type_label": "Typ služby",
        "opt_cleaning": "Úklid sálu",
        "opt_special_event": "Zvláštní událost",
        "start_group_label": "Skupina (lze 1, 2)",
        "ph_group_example": "Například: 1, 2",
        "start_monday_label": "Od pondělí (Datum)",
        "auto_distribute": "Rozdělit na měsíc",
        "how_many_weeks": "Týdnů?",
        "btn_assign": "Přiřadit",
        "current_schedule": "Aktuální rozpis",
        "alert_select_monday": "Vyberte datum pondělí!",
        "generating": "Generování...",
        "success_with_tick": "Úspěšně!",
        "confirm_delete_duty": "Odstranit službu z rozpisu?",
        "all_groups": "Vše",
        "no_duties_planned": "Nejsou naplánovány žádné služby.",
        "months": ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"]
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key; 
};

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder')));
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-slate-800 text-white px-5 py-4 rounded-xl text-sm font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
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
const currentUserId = localStorage.getItem('userId');

if (!currentUserId) window.location.href = 'login.html';

let isFullAdmin = false;

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('duties.html') && !isOverseer) window.location.href = 'index.html';
});

document.getElementById('save-duty-btn').addEventListener('click', async (e) => {
    const type = document.getElementById('duty-type').value; 
    const groupVal = document.getElementById('duty-group').value.trim() || "Все"; 
    const dateStr = document.getElementById('duty-date').value;
    
    const isRecurring = document.getElementById('duty-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('duty-weeks').value) : 1;

    if (!dateStr) return alert(window.t('alert_select_monday'));

    const btn = e.target;
    btn.innerText = window.t('generating'); btn.disabled = true;

    try {
        const [yyyy, mm, dd] = dateStr.split('-');
        const baseDate = new Date(yyyy, mm - 1, dd, 0, 0, 0);
        
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); 
        baseDate.setDate(diff);

        let groupQueue = [groupVal];
        if (groupVal !== "Все") {
            groupQueue = groupVal.split(',').map(g => g.trim()).filter(g => g);
        }

        for (let i = 0; i < weeksCount; i++) {
            const targetDate = new Date(baseDate);
            targetDate.setDate(targetDate.getDate() + (i * 7));
            
            const rawDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
            const assignedGroup = groupQueue[i % groupQueue.length];

            await addDoc(collection(db, "duties"), {
                type: type, 
                group: assignedGroup,
                rawDate: rawDateStr,
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('duty-group').value = '';
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = window.t('success_with_tick');
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = window.t('btn_assign'); 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { 
        alert(window.t('error_network')); 
        btn.disabled = false; 
        btn.innerText = window.t('btn_assign'); 
    }
});

const q = query(collection(db, "duties"), orderBy("rawDate", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('duties-list');
    let html = '';
    const today = new Date(); 
    today.setHours(0,0,0,0);
    
    let renderedCount = 0;
    let currentMonthGroup = ''; // Для отслеживания месяца

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (!d.rawDate) return;

        const [ry, rm, rd] = d.rawDate.split('-');
        const dutyStart = new Date(ry, rm - 1, rd, 0, 0, 0);
        
        const dutyEnd = new Date(dutyStart); 
        dutyEnd.setDate(dutyStart.getDate() + 6); 
        dutyEnd.setHours(23,59,59,999);

        if (dutyEnd.getTime() < today.getTime()) {
            if (isFullAdmin) deleteDoc(doc(db, "duties", docSnap.id)); 
            return;
        }

        // ГРУППИРОВКА ПО МЕСЯЦУ
        const monthLabel = dutyStart.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
        if (monthLabel !== currentMonthGroup) {
            currentMonthGroup = monthLabel;
            html += `<div class="bg-slate-50 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">${currentMonthGroup}</div>`;
        }

        renderedCount++;
        
        const startDay = dutyStart.getDate();
        const endDay = dutyEnd.getDate();
        
        const monthsArr = window.t('months');
        const startMonthName = monthsArr[dutyStart.getMonth()];
        const endMonthName = monthsArr[dutyEnd.getMonth()];

        let localizedDateRange = `${startDay} - ${endDay} ${endMonthName}`;
        if (dutyStart.getMonth() !== dutyEnd.getMonth()) {
            localizedDateRange = `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;
        }

        let typeStr = d.type;
        if (typeStr === 'Уборка зала' || typeStr === '🧹 Уборка зала') typeStr = window.t('opt_cleaning');
        if (typeStr === 'Специальное событие' || typeStr === '⭐ Специальное событие') typeStr = window.t('opt_special_event');
        
        const groupStr = d.group === "Все" ? window.t('all_groups') : `${window.t('group_short')} ${d.group}`;

        html += `
            <div class="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 transition-colors bg-white hover:bg-slate-50">
                <div class="flex items-center w-full min-w-0 pr-4">
                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2 truncate">
                            <h3 class="font-black text-slate-800 text-base truncate">${typeStr}</h3>
                            <span class="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] px-2 py-0.5 rounded font-black uppercase shrink-0">${groupStr}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-1 truncate">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${localizedDateRange}</p>
                        </div>
                    </div>
                </div>
                <button onclick="deleteDuty('${docSnap.id}')" class="text-slate-300 hover:text-red-500 bg-white hover:bg-red-50 transition-colors p-2.5 rounded-full outline-none" title="${window.t('delete')}">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        `;
    });

    if(list) list.innerHTML = html || `<p class="text-slate-400 italic p-6 text-center text-sm">${window.t('no_duties_planned')}</p>`;
});

window.deleteDuty = (id) => {
    if (confirm(window.t('confirm_delete_duty'))) deleteDoc(doc(db, "duties", id));
};
