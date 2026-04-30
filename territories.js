import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// 1. ПРОВЕРКА ПРАВ И УМНОЕ МЕНЮ
const uid = typeof currentUserId !== 'undefined' ? currentUserId : userId;
getDoc(doc(db, "users", uid)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    // Жесткая защита страниц от прямого входа
    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';

    // УПРАВЛЕНИЕ МЕНЮ (Через классы Tailwind - сверхнадежно)
    const toggleNav = (selector, hasAccess) => {
        const el = document.querySelector(selector);
        if (el) {
            if (hasAccess) { el.classList.remove('hidden'); el.classList.add('flex'); }
            else { el.classList.add('hidden'); el.classList.remove('flex'); }
        }
    };

    toggleNav('nav a[href="admin.html"]', isFullAdmin);
    toggleNav('nav a[href="school.html"]', isSchool);
    toggleNav('nav a[href="territories.html"]', isTerr);
    toggleNav('nav a[href="calendar.html"]', isOverseer);
});
// 2. ЗАГРУЗКА СПИСКА ПОЛЬЗОВАТЕЛЕЙ ДЛЯ СЕЛЕКТА
onSnapshot(collection(db, "users"), (snapshot) => {
    const select = document.getElementById('user-select');
    if (!select) return;
    
    let users = [];
    snapshot.forEach(d => {
        if(d.data().status === 'active') users.push({ id: d.id, name: d.data().name });
    });
    users.sort((a, b) => a.name.localeCompare(b.name));

    let html = '<option value="" disabled selected>Выберите возвещателя...</option>';
    users.forEach(u => { html += `<option value="${u.id}|${u.name}">${u.name}</option>`; });
    select.innerHTML = html;
});

// 3. ОТРИСОВКА ЗАПРОСОВ (Компактный список)
onSnapshot(query(collection(db, "requests"), orderBy("createdAt", "desc")), (snapshot) => {
    const list = document.getElementById('requests-list');
    let html = '';
    let count = 0;

    snapshot.forEach(docSnap => {
        const req = docSnap.data();
        if (req.status === 'new') {
            count++;
            const date = new Date(req.createdAt).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'});
            
            html += `
                <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors">
                    <div>
                        <p class="text-xs font-bold text-slate-800">${req.userName}</p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">📅 ${date}</p>
                    </div>
                    <div class="flex gap-1.5">
                        <button onclick="prepareIssue('${req.userId}', '${req.userName}', '${docSnap.id}')" title="Выдать участок" class="w-7 h-7 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm outline-none text-xs">➕</button>
                        <button onclick="deleteRequest('${docSnap.id}')" title="Удалить" class="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm outline-none text-xs">✖</button>
                    </div>
                </div>
            `;
        }
    });

    document.getElementById('requests-count').innerText = count;
    list.innerHTML = html || '<p class="text-slate-400 italic text-xs text-center py-4 bg-slate-50 rounded-xl">Нет новых запросов</p>';
});

// Помощник: Подставляет пользователя в форму и закрывает запрос
window.prepareIssue = async (userId, userName, reqId) => {
    const select = document.getElementById('user-select');
    select.value = `${userId}|${userName}`;
    document.getElementById('territory-number').focus();
    // Удаляем запрос, так как мы взяли его в работу
    await deleteDoc(doc(db, "requests", reqId));
};

window.deleteRequest = async (id) => {
    if (confirm("Удалить этот запрос?")) await deleteDoc(doc(db, "requests", id));
};

// 4. ВЫДАЧА УЧАСТКА (Сохранение)
document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const userData = document.getElementById('user-select').value;
    const terrNum = document.getElementById('territory-number').value.trim();

    if (!userData || !terrNum) return alert("Выберите пользователя и введите номер!");

    const btn = e.target;
    btn.innerText = "Сохранение..."; btn.disabled = true;

    const [userId, userName] = userData.split('|');

    try {
        await addDoc(collection(db, "territories"), {
            number: Number(terrNum),
            userId: userId,
            userName: userName,
            issuedAt: new Date().toISOString()
        });

        document.getElementById('user-select').value = '';
        document.getElementById('territory-number').value = '';
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Успешно! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Назначить"; btn.disabled = false; 
        }, 2000);
    } catch (err) { alert("Ошибка!"); btn.disabled = false; btn.innerText = "Назначить"; }
});

// 5. ТАБЛИЦА ВЫДАННЫХ УЧАСТКОВ
onSnapshot(query(collection(db, "territories"), orderBy("issuedAt", "desc")), (snapshot) => {
    const list = document.getElementById('territories-list');
    let html = '';

    snapshot.forEach(docSnap => {
        const terr = docSnap.data();
        const date = new Date(terr.issuedAt).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', year: 'numeric'});
        
        html += `
            <tr class="hover:bg-slate-50 transition-colors user-row" data-search="${terr.number} ${terr.userName.toLowerCase()}">
                <td class="py-3 px-4 text-center">
                    <span class="bg-emerald-50 text-emerald-700 font-mono font-black border border-emerald-200 px-3 py-1.5 rounded-lg text-sm shadow-sm">${terr.number}</span>
                </td>
                <td class="py-3 px-4 font-bold text-slate-800 text-sm truncate">${terr.userName}</td>
                <td class="py-3 px-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">${date}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="returnTerritory('${docSnap.id}')" class="bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm outline-none">Сдан ✖</button>
                </td>
            </tr>
        `;
    });

    list.innerHTML = html || '<tr><td colspan="4" class="text-slate-400 italic text-sm text-center py-8">Все участки свободны.</td></tr>';
});

// СДАЧА УЧАСТКА (Удаление)
window.returnTerritory = async (id) => {
    if (confirm("Отметить участок как сданный?")) {
        await deleteDoc(doc(db, "territories", id));
    }
};

// ПОИСК ПО ТАБЛИЦЕ
document.getElementById('search-terr').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-search').includes(term)) row.style.display = '';
        else row.style.display = 'none';
    });
});
