import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let myGroup = "Без группы";
let hasFullAccess = false;
let allReports = [];

// 1. ПРОВЕРКА ПРАВ И ДОСТУПА
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (docSnap.exists()) {
        const u = docSnap.data();
        const roles = u.roles || [];
        myGroup = u.group || "Без группы";

        if (roles.includes("Владелец") || roles.includes("Админ")) {
            hasFullAccess = true;
            document.getElementById('group-title').innerText = "Все группы (Полный доступ)";
        } else if (roles.includes("Надзиратель группы")) {
            hasFullAccess = false;
            document.getElementById('group-title').innerText = `Группа № ${myGroup} (Доступ надзирателя)`;
        } else {
            // Если обычный участник попытается зайти по ссылке
            window.location.href = 'index.html';
        }
        
        loadReports();
    }
});

function loadReports() {
    // Получаем все отчеты (отсортированы по дате сдачи по убыванию)
    const q = query(collection(db, "reports"), orderBy("submittedAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        allReports = [];
        const monthsSet = new Set();

        snapshot.forEach(docSnap => {
            const r = docSnap.data();
            
            // ФИЛЬТРАЦИЯ ДОСТУПА: Админ видит всех. Надзиратель - только свою группу.
            if (hasFullAccess || r.group === myGroup) {
                allReports.push(r);
                if (r.month) monthsSet.add(r.month);
            }
        });

        // Заполняем фильтр месяцев
        const monthFilter = document.getElementById('month-filter');
        const currentSelection = monthFilter.value;
        
        let monthHtml = '<option value="all">Все месяцы</option>';
        Array.from(monthsSet).forEach(m => {
            monthHtml += `<option value="${m}">${m}</option>`;
        });
        monthFilter.innerHTML = monthHtml;
        monthFilter.value = currentSelection || "all";

        renderTable();
    });
}

// 2. ОТРИСОВКА ТАБЛИЦЫ И ПОДСЧЕТ ИТОГОВ
function renderTable() {
    const list = document.getElementById('reports-list');
    const selectedMonth = document.getElementById('month-filter').value;
    
    let html = '';
    let totalHours = 0;
    let totalPubs = 0;

    const filteredReports = allReports.filter(r => selectedMonth === 'all' || r.month === selectedMonth);

    filteredReports.forEach(r => {
        totalPubs++;
        totalHours += Number(r.hours || 0);

        const checkIcon = r.participated || r.hours > 0 
            ? `<span class="text-emerald-500 font-bold text-lg">✅</span>` 
            : `<span class="text-slate-300">-</span>`;

        html += `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="py-3 px-4 font-black text-slate-800">${r.userName}</td>
                <td class="py-3 px-4 text-center">
                    <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">${r.group}</span>
                </td>
                <td class="py-3 px-4 text-center">${checkIcon}</td>
                <td class="py-3 px-4 text-center font-black text-purple-600">${r.hours || '-'}</td>
                <td class="py-3 px-4 text-center text-slate-500 font-bold">${r.pubs || '-'}</td>
                <td class="py-3 px-4 text-center text-slate-500 font-bold">${r.studies || '-'}</td>
                <td class="py-3 px-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">${r.month}</td>
            </tr>
        `;
    });

    document.getElementById('total-hours').innerText = totalHours;
    document.getElementById('total-pubs').innerText = totalPubs;

    if (filteredReports.length === 0) {
        list.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400 italic">Отчеты не найдены.</td></tr>';
    } else {
        list.innerHTML = html;
    }
}

// Слушаем переключение фильтра месяцев
document.getElementById('month-filter').addEventListener('change', renderTable);
