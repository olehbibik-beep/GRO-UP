import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let currentUser = null;
let allReports = [];

// 1. Узнаем права зашедшего человека
async function checkAccess() {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (userSnap.exists()) {
        currentUser = userSnap.data();
        let userRoles = currentUser.roles || (currentUser.role ? [currentUser.role] : []);
        
        // Владелец/Админ видят всё собрание. Надзиратель - только свою группу.
        if (userRoles.includes("Владелец") || userRoles.includes("Админ")) {
            document.getElementById('group-title').innerText = "Все группы (Доступ Администратора)";
            loadReports("all"); 
        } else if (userRoles.includes("Надзиратель группы")) {
            const myGroup = currentUser.group || "Без группы";
            document.getElementById('group-title').innerText = `Доступ: Группа №${myGroup}`;
            loadReports(myGroup);
        } else {
            // Если сюда зашел обычный участник - выкидываем
            alert("У вас нет доступа к этой странице");
            window.location.href = 'index.html';
        }
    }
}

// 2. Загружаем отчеты
function loadReports(allowedGroup) {
    const q = query(collection(db, "reports"), orderBy("submittedAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        allReports = [];
        snapshot.forEach(docSnap => {
            const rep = docSnap.data();
            // Фильтруем: берем все (если Админ) или только свою группу
            if (allowedGroup === "all" || rep.group == allowedGroup) {
                allReports.push(rep);
            }
        });
        
        populateMonthsFilter();
        renderTable("all"); // Изначально показываем все доступные месяцы
    });
}

// 3. Отрисовка таблицы
function renderTable(monthFilter) {
    const tbody = document.getElementById('reports-list');
    let totalHours = 0;
    tbody.innerHTML = '';

    const filteredReports = monthFilter === "all" ? allReports : allReports.filter(r => r.month === monthFilter);

    if (filteredReports.length === 0) {
        // Заменили colspan на 7, так как добавилась колонка
        tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400 font-medium">Отчетов пока нет</td></tr>';
        document.getElementById('total-hours').innerText = '0';
        return;
    }

    filteredReports.forEach(rep => {
        totalHours += (rep.hours || 0);
        
        // Рисуем красивую зеленую галочку, если служил
        const participatedHtml = rep.participated 
            ? '<span class="text-emerald-500 font-black text-lg">✔ Да</span>' 
            : '<span class="text-slate-300">-</span>';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 font-bold text-slate-800">${rep.userName}</td>
                <td class="p-4 text-center text-slate-500 font-bold">${rep.group}</td>
                
                <td class="p-4 text-center">${participatedHtml}</td>
                
                <td class="p-4 text-center font-black text-purple-700 text-lg">${rep.hours || '-'}</td>
                <td class="p-4 text-center text-slate-600">${rep.pubs || '-'}</td>
                <td class="p-4 text-center text-slate-600">${rep.studies || '-'}</td>
                <td class="p-4 text-right text-xs text-slate-400">${rep.month}</td>
            </tr>
        `;
    });

    document.getElementById('total-hours').innerText = totalHours;
}

// Заполняем фильтр месяцев без дубликатов
function populateMonthsFilter() {
    const select = document.getElementById('month-filter');
    const uniqueMonths = [...new Set(allReports.map(r => r.month))];
    
    // Сохраняем текущий выбор, чтобы он не сбросился
    const currentVal = select.value; 
    select.innerHTML = '<option value="all">Все месяцы</option>';
    
    uniqueMonths.forEach(m => {
        select.innerHTML += `<option value="${m}">${m}</option>`;
    });
    
    if(uniqueMonths.includes(currentVal)) select.value = currentVal;
}

document.getElementById('month-filter').addEventListener('change', (e) => {
    renderTable(e.target.value);
});

// Запуск
checkAccess();
