import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "school_title": "Управление Школой - GRO-UP", "school_h1": "Школа", "manage_tasks": "Управление заданиями", 
        "btn_stats": "Статистика", "schedule_title": "Назначенные задания", "loading": "Загрузка...", 
        "no_assigned_tasks": "Нет назначенных заданий.", "lesson": "Урок", "num_symbol": "№", 
        "assistant_short": "Пом:", "slip_header": "НАША ХРИСТИАНСКАЯ ЖИЗНЬ И СЛУЖЕНИЕ", 
        "slip_name": "Имя:", "slip_partner": "Помощник:", "slip_date": "Дата:", 
        "slip_notes": "Примечания для учащегося: Материал для задания и номер урока находятся в рабочей тетради.",
        "btn_back": "Назад", "back_home": "На главную"
    },
    cs: {
        "school_title": "Správa školy - GRO-UP", "school_h1": "Škola", "manage_tasks": "Správa úkolů", 
        "btn_stats": "Statistika", "schedule_title": "Přiřazené úkoly", "loading": "Načítání...", 
        "no_assigned_tasks": "Žádné přiřazené úkoly.", "lesson": "Lekce", "num_symbol": "č.", 
        "assistant_short": "Pom:", "slip_header": "ÚKOL NA SHROMÁŽDĚNÍ NÁŠ KŘESŤANSKÝ ŽIVOT A SLUŽBA", 
        "slip_name": "Jméno:", "slip_partner": "Partner:", "slip_date": "Datum:", 
        "slip_notes": "Poznámky pro studenta: Podklady pro svůj úkol a číslo studijní lekce najdeš v Pracovním sešitě.",
        "btn_back": "Zpět", "back_home": "Na hlavní stránku"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => dict[currentLang][key] || key;

function translateDbString(str) {
    if (!str) return '';
    const map = {
        "Начинайте разговор": "Zahájení rozhovoru",
        "Развивайте интерес": "Rozvíjení zájmu",
        "Подготавливайте учеников": "Činění učedníků",
        "Объясняйте свои взгляды": "Vysvětlování své víry",
        "Речь": "Proslov",
        "Чтение Библии": "Čtení Bible"
    };
    if (currentLang === 'cs' && map[str]) return map[str];
    return str;
}

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
    });
    document.querySelectorAll('[data-lang-title]').forEach(el => {
        el.setAttribute('title', window.t(el.getAttribute('data-lang-title')));
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}

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

// Проверка прав
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    if (!isSchool) window.location.href = 'index.html';
});

// Загрузка заданий из базы
const q = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('tasks-list');
    const printArea = document.getElementById('print-area');
    
    if (snapshot.empty) {
        if(list) list.innerHTML = `<p class="text-slate-400 italic p-6 text-center text-sm bg-white rounded-md border border-slate-200 shadow-sm">${window.t('no_assigned_tasks')}</p>`;
        if(printArea) printArea.innerHTML = '';
        return;
    }

    let html = '';
    let printHtml = ''; 
    const today = new Date(); today.setHours(0,0,0,0);

    snapshot.forEach(docSnap => {
        const t = docSnap.data();
        
        const tDate = new Date(t.date);
        const isPast = tDate < today;
        const opacityClass = isPast ? "opacity-60 grayscale bg-slate-50 border-slate-200" : "bg-white border-slate-200 shadow-sm";

        const astHtml = t.assistant && t.assistant !== "Без помощника" ? `<span class="text-[10px] md:text-xs text-slate-500 font-bold block mt-0.5">${window.t('assistant_short')} <span class="text-jw-ministry">${t.assistant}</span></span>` : '';

        // Перевод категории
        let catStr = translateDbString(t.category);

        // Карточка для просмотра на странице (Кнопка удаления убрана)
        html += `
            <div class="p-3 md:p-4 rounded-md border relative overflow-hidden transition-all ${opacityClass}">
                <div class="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
                    <span class="font-black text-slate-800 text-xs md:text-sm leading-tight truncate w-full">${t.userName}</span>
                    <span class="text-[9px] font-bold text-jw-ministry bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">${window.t('lesson')} ${t.lesson}</span>
                </div>
                
                <div class="flex items-center justify-between gap-2">
                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-1.5">
                            <span class="font-black text-slate-400 text-xs">${t.taskNumber}.</span>
                            <span class="font-bold text-slate-600 text-[10px] md:text-xs truncate">${catStr}</span>
                        </div>
                        ${astHtml}
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">${tDate.toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' })}</span>
                </div>
            </div>
        `;

        // КАРТОЧКИ ДЛЯ ПЕЧАТИ БЛАНКОВ (Печатаются только актуальные/будущие задания)
        if (!isPast) {
            const formattedDate = `${tDate.getDate()}.${tDate.getMonth() + 1}.${tDate.getFullYear()}`;
            printHtml += `
                <div style="break-inside: avoid; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; font-family: sans-serif; background-color: #f8fafc; position: relative; margin-bottom: 10px;">
                    <div style="position: absolute; top: 20px; right: 20px; background-color: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; border: 1px solid #fde68a;">
                        ${window.t('lesson')} ${t.lesson}
                    </div>
                    
                    <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b; font-weight: 900; text-transform: uppercase;">
                        ${t.taskNumber}. ${catStr}
                    </h3>
                    <p style="margin: 0 0 16px 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        ${window.t('slip_header')}
                    </p>

                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; font-size: 14px; margin-bottom: 16px;">
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_name')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${t.userName}</div>
                        
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_partner')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${t.assistant && t.assistant !== "Без помощника" ? t.assistant : '-'}</div>
                        
                        <div style="color: #64748b; font-weight: bold;">${window.t('slip_date')}</div>
                        <div style="font-weight: 900; color: #1e293b;">${formattedDate}</div>
                    </div>

                    <div style="background-color: #ffffff; padding: 12px; border-radius: 6px; font-size: 10px; color: #475569; line-height: 1.4; border: 1px solid #e2e8f0;">
                        <b>${window.t('slip_notes')}</b>
                    </div>
                </div>
            `;
        }
    });

    if(list) list.innerHTML = html;
    if(printArea) printArea.innerHTML = printHtml;
});
