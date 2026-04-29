import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// РАСШИРЕННЫЙ СПИСОК РОЛЕЙ
const AVAILABLE_ROLES = ["Владелец", "Админ", "Старейшина", "Служ. помощник", "Пионер", "Надзиратель группы", "Участник"];
let allUsers = [];

onSnapshot(collection(db, "users"), (snapshot) => {
    allUsers = [];
    snapshot.forEach(docSnap => { allUsers.push({ id: docSnap.id, ...docSnap.data() }); });
    renderUI(); 
});

function renderUI(searchQuery = "") {
    const pendingList = document.getElementById('pending-list');
    const activeList = document.getElementById('active-list');
    let pendingCount = 0, activeCount = 0;
    pendingList.innerHTML = ''; activeList.innerHTML = '';

    allUsers.forEach(user => {
        if (user.status === 'pending') {
            pendingCount++;
            pendingList.innerHTML += `
                <div class="flex justify-between items-center p-4 bg-amber-50/60 rounded-xl mb-3 border border-amber-200">
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg">${user.name}</h3>
                        <p class="text-sm text-slate-600 mt-1">ПИН: <span class="font-mono bg-white px-2 py-0.5 rounded border">${user.pin || 'нет'}</span></p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="changeStatus('${user.id}', 'active')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-all">Одобрить</button>
                        <button onclick="deleteUser('${user.id}')" class="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-all">Удалить</button>
                    </div>
                </div>
            `;
        } else {
            if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
            activeCount++;
            const isBlocked = user.status === 'blocked';
            const isSchool = user.isSchool ? 'checked' : ''; 
            
            // ЛОГИКА МНОЖЕСТВЕННЫХ РОЛЕЙ: Поддерживаем старые данные (role) и новые (roles)
            let userRoles = user.roles || (user.role ? [user.role] : ["Участник"]);
            
            // Генерируем чекбоксы для каждой роли
            let rolesHTML = AVAILABLE_ROLES.map(r => `
                <label class="inline-flex items-center gap-1.5 mr-3 mb-1 text-xs font-medium text-slate-600 cursor-pointer hover:text-indigo-600">
                    <input type="checkbox" onchange="toggleUserRole('${user.id}', '${r}', this.checked)" ${userRoles.includes(r) ? 'checked' : ''} class="w-3.5 h-3.5 accent-indigo-500 rounded">
                    ${r}
                </label>
            `).join('');

            activeList.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors ${isBlocked ? 'opacity-50 grayscale bg-slate-100' : ''}">
                    <td class="p-4">
                        <p class="font-bold text-slate-800">${user.name}</p>
                        <p class="text-xs text-slate-400 font-mono mt-1">ПИН: ${user.pin || '-'}</p>
                    </td>
                    
                    <td class="p-4 text-center">
                        <input type="number" onchange="updateGroup('${user.id}', this.value)" value="${user.group || ''}" placeholder="№" class="w-16 p-2 text-center bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700">
                    </td>
                    
                    <td class="p-4 flex flex-wrap pt-5">
                        ${rolesHTML}
                    </td>
                    
                    <td class="p-4 text-center">
                        <input type="checkbox" onchange="toggleSchool('${user.id}', this.checked)" ${isSchool} class="w-5 h-5 accent-sky-500 cursor-pointer">
                    </td>
                    
                    <td class="p-4 text-right">
                        <button onclick="changeStatus('${user.id}', '${isBlocked ? 'active' : 'blocked'}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isBlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'} mb-1 block w-full text-center">${isBlocked ? 'Разбанить' : 'Бан'}</button>
                        <button onclick="deleteUser('${user.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-red-500 hover:bg-red-100 transition-all block w-full text-center">Удалить</button>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    if (pendingCount === 0) pendingList.innerHTML = '<p class="text-slate-400 text-sm text-center py-8">Нет заявок</p>';
}

document.getElementById('search-user').addEventListener('input', (e) => renderUI(e.target.value.trim()));

// --- НОВЫЕ ФУНКЦИИ ОБНОВЛЕНИЯ БАЗЫ ---
window.updateGroup = (id, groupNum) => {
    updateDoc(doc(db, "users", id), { group: groupNum });
};

window.toggleUserRole = (id, roleName, isChecked) => {
    const user = allUsers.find(u => u.id === id);
    let roles = user.roles || (user.role ? [user.role] : []); // Берем текущие роли
    
    if (isChecked && !roles.includes(roleName)) roles.push(roleName); // Добавляем
    if (!isChecked) roles = roles.filter(r => r !== roleName); // Удаляем
    
    // Обновляем в Firebase и сохраняем массив roles
    updateDoc(doc(db, "users", id), { roles: roles });
};

window.changeStatus = (id, newStatus) => updateDoc(doc(db, "users", id), { status: newStatus });
window.deleteUser = (id) => { if(confirm("Удалить пользователя навсегда?")) deleteDoc(doc(db, "users", id)); };
window.toggleSchool = (id, isChecked) => updateDoc(doc(db, "users", id), { isSchool: isChecked });
