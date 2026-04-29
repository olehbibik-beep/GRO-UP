import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Твои ключи Firebase
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

// Категории (Добавим сюда Школу позже)
const ROLES = ["Владелец", "Админ", "Старейшина", "Служебный помощник", "Участник", "Гость"];

let allUsers = [];

// 1. СЛУШАЕМ БАЗУ ПОЛЬЗОВАТЕЛЕЙ
onSnapshot(collection(db, "users"), (snapshot) => {
    allUsers = [];
    snapshot.forEach(docSnap => {
        allUsers.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderUI(); // Отрисовываем списки
});

// 2. ОТРИСОВКА ИНТЕРФЕЙСА
function renderUI(searchQuery = "") {
    const pendingList = document.getElementById('pending-list');
    const activeList = document.getElementById('active-list');
    
    let pendingCount = 0;
    let activeCount = 0;
    
    pendingList.innerHTML = '';
    activeList.innerHTML = '';

    allUsers.forEach(user => {
        // --- БЛОК ЗАЯВОК (Ждут подтверждения) ---
        if (user.status === 'pending') {
            pendingCount++;
            pendingList.innerHTML += `
                <div class="flex justify-between items-center p-4 bg-amber-50/60 rounded-xl mb-3 border border-amber-200">
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg">${user.name}</h3>
                        <p class="text-sm text-slate-600 mt-1">Введенный ПИН: <span class="font-mono bg-white px-2 py-0.5 rounded border">${user.pin || 'нет'}</span></p>
                        <p class="text-xs text-slate-400 mt-1">Заявка от: ${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="changeStatus('${user.id}', 'active')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95">
                            Одобрить
                        </button>
                        <button onclick="deleteUser('${user.id}')" class="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-all active:scale-95">
                            Удалить
                        </button>
                    </div>
                </div>
            `;
        } 
        // --- БЛОК АКТИВНЫХ ПОЛЬЗОВАТЕЛЕЙ ---
        else {
            // Фильтр поиска по имени
            if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
            
            activeCount++;
            const isBlocked = user.status === 'blocked';
            
            // Выпадающий список ролей
            let rolesOptions = ROLES.map(r => `<option value="${r}" ${user.role === r ? 'selected' : ''}>${r}</option>`).join('');

            activeList.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors ${isBlocked ? 'opacity-50 grayscale bg-slate-100' : ''}">
                    <td class="p-4">
                        <p class="font-bold text-slate-800 text-base">${user.name}</p>
                        ${isBlocked ? '<span class="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-black uppercase tracking-wider">Заблокирован</span>' : ''}
                    </td>
                    <td class="p-4 text-slate-500 font-mono text-sm">${user.pin || 'нет'}</td>
                    <td class="p-4">
                        <select onchange="changeRole('${user.id}', this.value)" class="bg-white border border-slate-200 rounded-xl p-2 outline-none focus:ring-2 ring-indigo-500 text-sm font-bold text-slate-700 w-full cursor-pointer">
                            ${rolesOptions}
                        </select>
                    </td>
                    <td class="p-4 text-right flex justify-end gap-2">
                        <button onclick="changeStatus('${user.id}', '${isBlocked ? 'active' : 'blocked'}')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${isBlocked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}">
                            ${isBlocked ? 'Разбанить' : 'Забанить'}
                        </button>
                        <button onclick="deleteUser('${user.id}')" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all">
                            Удалить
                        </button>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    
    if (pendingCount === 0) {
        pendingList.innerHTML = '<p class="text-slate-400 text-sm text-center py-8">Нет новых заявок</p>';
    }
}

// 3. ПОИСК ПО БАЗЕ
document.getElementById('search-user').addEventListener('input', (e) => {
    renderUI(e.target.value.trim());
});

// 4. ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ КНОПОК
window.changeStatus = (id, newStatus) => {
    updateDoc(doc(db, "users", id), { status: newStatus });
};

window.changeRole = (id, newRole) => {
    updateDoc(doc(db, "users", id), { role: newRole });
};

window.deleteUser = (id) => {
    if(confirm("Вы уверены, что хотите навсегда удалить этого пользователя?")) {
        deleteDoc(doc(db, "users", id));
    }
};
