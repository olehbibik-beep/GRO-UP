import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, deleteDoc, query } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "loading_data": "Загрузка данных...",
        "logout_btn": "Выйти",
        "btn_back": "Назад",
        "reports_title": "Отчеты - GRO-UP",
        "reports_summary": "Сводка отчетов",
        "loading_access": "Загрузка доступа...",
        "submitted_reports": "Сдали отчеты",
        "total_hours": "Итого часов",
        "all_months": "Все месяцы",
        "print_btn": "Распечатать",
        "th_publisher": "Возвещатель",
        "th_participated": "Служил",
        "th_hours": "Часы",
        "th_studies": "Изучения",
        "th_credit": "Кредит",
        "th_month": "Месяц",
        "all_groups_full_access": "Все группы (Полный доступ)",
        "overseer_access": "Доступ надзирателя",
        "no_reports_found": "Отчеты не найдены.",
        "th_action": "Действие",
        "confirm_delete_report": "Точно удалить этот отчет?",
        "all_groups": "Все",
        "no_group": "Без группы",
        "unknown": "Неизвестно",
        "delete": "Удалить",
        "group_short": "Гр.",
        "error_network": "Ошибка сети"
    },
    cs: {
        "loading_data": "Načítání dat...",
        "logout_btn": "Odejít",
        "btn_back": "Zpět",
        "reports_title": "Zprávy - GRO-UP",
        "reports_summary": "Souhrn zpráv",
        "loading_access": "Načítání přístupu...",
        "submitted_reports": "Odevzdali zprávy",
        "total_hours": "Celkem hodin",
        "all_months": "Všechny měsíce",
        "print_btn": "Vytisknout",
        "th_publisher": "Zvěstovatel",
        "th_participated": "Služba",
        "th_hours": "Hodiny",
        "th_studies": "Studia",
        "th_credit": "Kredit",
        "th_month": "Měsíc",
        "all_groups_full_access": "Všechny skupiny (Plný přístup)",
        "overseer_access": "Přístup dozorce",
        "no_reports_found": "Nebyly nalezeny žádné zprávy.",
        "th_action": "Akce",
        "confirm_delete_report": "Opravdu smazat tuto zprávu?",
        "all_groups": "Všechny",
        "no_group": "Bez skupiny",
        "unknown": "Neznámé",
        "delete": "Smazat",
        "group_short": "Sk.",
        "error_network": "Chyba sítě"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

const formatMonthKey = (mKey) => {
    if (!mKey || !mKey.includes('-')) return mKey; 
    const [y, m] = mKey.split('-');
    const dateObj = new Date(y, parseInt(m) - 1, 1);
    return dateObj.toLocaleDateString(localeFormat, { month: 'long', year: 'numeric' });
};

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
    document.querySelectorAll('[data-lang-title]').forEach(el => {
        el.setAttribute('title', window.t(el.getAttribute('data-lang-title')));
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}
// ============================================

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

let myGroup = window.t('no_group');
let hasFullAccess = false;
let allReports = [];

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const u = docSnap.data();
    const roles = u.roles || [];
    
    myGroup = String(u.group || window.t('no_group'));

    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    if (!isOverseer) window.location.href = 'index.html';

    if (isFullAdmin) {
        hasFullAccess = true;
        document.getElementById('group-title').innerText = window.t('all_groups_full_access');
        const actionCol = document.getElementById('th-action-col');
        if (actionCol) actionCol.innerText = window.t('th_action');
        document.getElementById('group-filter').classList.remove('hidden'); // Показываем фильтр
    } else {
        hasFullAccess = false;
        document.getElementById('group-title').innerText = `${window.t('group_short')} ${myGroup} (${window.t('overseer_access')})`;
        document.getElementById('group-filter').classList.add('hidden'); // Прячем фильтр
    }

    loadReports();
});

function loadReports() {
    const q = query(collection(db, "reports"));
    
    onSnapshot(q, (snapshot) => {
        allReports = [];
        const monthsSet = new Set();
        const groupsSet = new Set();

        snapshot.forEach(docSnap => {
            const r = docSnap.data();
            
            if (hasFullAccess || String(r.group) === myGroup) {
                allReports.push({ id: docSnap.id, ...r });
                if (r.month) monthsSet.add(r.month);
                if (r.group) groupsSet.add(r.group);
            }
        });

        allReports.sort((a, b) => {
            const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return dateB - dateA; 
        });

        const monthFilter = document.getElementById('month-filter');
        if (monthFilter) {
            const currentSelection = monthFilter.value;
            let monthHtml = `<option value="all">${window.t('all_months')}</option>`;
            Array.from(monthsSet).forEach(m => {
                monthHtml += `<option value="${m}">${formatMonthKey(m)}</option>`; 
            });
            monthFilter.innerHTML = monthHtml;
            monthFilter.value = currentSelection || "all";
        }

        const groupFilter = document.getElementById('group-filter');
        if (groupFilter && hasFullAccess) {
            const currentGSelection = groupFilter.value;
            let groupHtml = `<option value="all">${window.t('all_groups')}</option>`;
            // Сортируем группы: числа по порядку
            Array.from(groupsSet).sort((a, b) => {
                if(!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
                return String(a).localeCompare(String(b));
            }).forEach(g => {
                groupHtml += `<option value="${g}">${window.t('group_short')} ${g}</option>`;
            });
            groupFilter.innerHTML = groupHtml;
            groupFilter.value = currentGSelection || "all";
        }

        renderTable();
    });
}

window.deleteReport = async (id) => {
    if (confirm(window.t('confirm_delete_report'))) {
        try {
            await deleteDoc(doc(db, "reports", id));
        } catch (e) {
            alert(window.t('error_network'));
        }
    }
};

function renderTable() {
    const list = document.getElementById('reports-list');
    const monthFilter = document.getElementById('month-filter');
    const groupFilter = document.getElementById('group-filter');
    
    const selectedMonth = monthFilter ? monthFilter.value : 'all';
    const selectedGroup = groupFilter ? groupFilter.value : 'all';
    
    let html = '';
    let totalHours = 0;
    let totalPubs = 0;

    const filteredReports = allReports.filter(r => {
        const passMonth = selectedMonth === 'all' || r.month === selectedMonth;
        const passGroup = selectedGroup === 'all' || String(r.group) === selectedGroup;
        return passMonth && passGroup;
    });

    filteredReports.forEach(r => {
        totalPubs++;
        totalHours += Number(r.hours || 0);

        const checkIcon = r.participated || r.hours > 0 
            ? `<div class="mx-auto w-5 h-5 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center border border-emerald-200"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div>` 
            : `<span class="text-slate-300">-</span>`;

        const subDate = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short', year: 'numeric'}) : window.t('unknown');
        const displayMonth = r.month ? formatMonthKey(r.month) : window.t('unknown');

        const deleteBtn = hasFullAccess 
            ? `<button onclick="deleteReport('${r.id}')" class="text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 transition-colors p-2 rounded-lg outline-none border border-slate-200 hover:border-red-200" title="${window.t('delete')}"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>` 
            : '';

        html += `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="py-3 px-4">
                    <p class="font-black text-slate-800 truncate">${r.userName}</p>
                    <div class="flex items-center gap-1 mt-0.5">
                        <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">${subDate}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-center">
                    <span class="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">${r.group}</span>
                </td>
                <td class="py-3 px-4 text-center">${checkIcon}</td>
                <td class="py-3 px-4 text-center font-black text-purple-600">${r.hours || '-'}</td>
                <td class="py-3 px-4 text-center text-slate-500 font-bold">${r.studies || '-'}</td>
                <td class="py-3 px-4 text-center text-slate-500 font-bold">${r.credit || r.pubs || '-'}</td>
                <td class="py-3 px-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">${displayMonth}</td>
                <td class="py-3 px-4 text-right no-print">${deleteBtn}</td>
            </tr>
        `;
    });

    const thEl = document.getElementById('total-hours');
    if (thEl) thEl.innerText = totalHours;
    
    const tpEl = document.getElementById('total-pubs');
    if (tpEl) tpEl.innerText = totalPubs;

    if (filteredReports.length === 0) {
        if (list) list.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-400 italic">${window.t('no_reports_found')}</td></tr>`;
    } else {
        if (list) list.innerHTML = html;
    }
}

const mFilter = document.getElementById('month-filter');
if (mFilter) mFilter.addEventListener('change', renderTable);

const gFilter = document.getElementById('group-filter');
if (gFilter) gFilter.addEventListener('change', renderTable);
