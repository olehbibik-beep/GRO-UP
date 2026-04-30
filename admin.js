import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Проверка прав Администратора
getDoc(doc(db, "users", userId)).then(docSnap => {
    if (docSnap.exists()) {
        const roles = docSnap.data().roles || [];
        if (!roles.includes("Владелец") && !roles.includes("Админ")) {
            document.body.innerHTML = `<div class="flex items-center justify-center h-screen bg-red-50"><h1 class="text-3xl font-black text-red-600">ДОСТУП ЗАПРЕЩЕН</h1></div>`;
        }
    } else {
        window.location.href = 'login.html';
    }
});

// Глобальное хранилище данных пользователей для быстрой работы модалки
let usersDataCache = {};
let editingUserId = null;

// ПОЛУЧЕНИЕ И ОТРИСОВКА ПОЛЬЗОВАТЕЛЕЙ
onSnapshot(collection(db, "users"), (snapshot) => {
    const pendingList = document.getElementById('pending-list');
    const activeList = document.getElementById('active-list');
    
    let pendingHTML = '';
    let activeHTML = '';
    let pendingCount = 0;
    let activeCount = 0;

    usersDataCache = {}; // Очищаем кэш

    snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const id = docSnap.id;
        usersDataCache[id] = u; // Сохраняем в кэш

        // Определяем иконку пола
        const icon = u.gender === 'girl' ? '👩‍💼' : '👨‍💼';

        if (u.status === 'pending') {
            pendingCount++;
            pendingHTML += `
                <div class="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl drop-shadow-sm">${icon}</span>
                        <div>
                            <p class="font-black text-slate-800 text-sm">${u.name}</p>
                            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Новая заявка</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveUser('${id}')" class="bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Принять</button>
                        <button onclick="rejectUser('${id}')" class="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Отклонить</button>
                    </div>
                </div>
            `;
        } else if (u.status === 'active') {
            activeCount++;
            
            // Если в старой базе было "Участник", визуально меняем на "Возвещатель"
            let rolesDisplay = (u.roles || []).map(r => r === "Участник" ? "Возвещатель" : r);
            if (rolesDisplay.length === 0) rolesDisplay = ["Возвещатель"];

            // Форматируем роли как красивые бейджики
            const badgesHTML = rolesDisplay.map(r => {
                if (r === "Админ" || r === "Владелец") return `<span class="inline-block bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1 mb-1 border border-rose-200">${r}</span>`;
                if (r === "Надзиратель группы") return `<span class="inline-block bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1 mb-1 border border-purple-200">Надзиратель</span>`;
                if (r === "Ответственный за участки") return `<span class="inline-block bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1 mb-1 border border-emerald-200">Участки</span>`;
                if (r === "Ответственный за школу") return `<span class="inline-block bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1 mb-1 border border-sky-200">Школа</span>`;
                return `<span class="inline-block bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1 mb-1 border border-slate-200">${r}</span>`;
            }).join('');

            const groupDisplay = u.group && u.group !== "Без группы" ? `<span class="font-black text-slate-700">${u.group}</span>` : `<span class="text-slate-300">-</span>`;

            activeHTML += `
                <tr class="hover:bg-slate-50/50 transition-colors group user-row" data-name="${u.name.toLowerCase()}">
                    <td class="py-2 px-4 border-b border-slate-100">
                        <div class="flex items-center gap-2">
                            <span class="text-xl drop-shadow-sm">${icon}</span>
                            <span class="font-bold text-slate-700 whitespace-nowrap">${u.name}</span>
                        </div>
                    </td>
                    <td class="py-2 px-4 text-center border-b border-slate-100">${groupDisplay}</td>
                    <td class="py-2 px-4 border-b border-slate-100 leading-tight">${badgesHTML}</td>
                    <td class="py-2 px-4 text-right border-b border-slate-100">
                        <button onclick="openEditModal('${id}')" class="text-xs font-bold text-indigo-500 bg-indigo-50 hover:bg-indigo-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-indigo-100">⚙️ Настроить</button>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    pendingList.innerHTML = pendingHTML || '<p class="text-slate-400 text-xs text-center py-4">Нет новых заявок</p>';
    activeList.innerHTML = activeHTML || '<tr><td colspan="4" class="text-center py-4 text-slate-400 italic text-xs">Нет активных пользователей</td></tr>';
});

// МОДАЛЬНОЕ ОКНО: ОТКРЫТЬ
window.openEditModal = (id) => {
    editingUserId = id;
    const u = usersDataCache[id];
    if(!u) return;

    // Заполняем шапку
    document.getElementById('modal-user-name').innerText = u.name;
    document.getElementById('modal-user-icon').innerText = u.gender === 'girl' ? '👩‍💼' : '👨‍💼';
    
    // Заполняем группу
    document.getElementById('modal-user-group').value = (u.group && u.group !== "Без группы") ? u.group : "";

    // Сбрасываем и заполняем галочки ролей
    const checkboxes = document.querySelectorAll('.role-cb');
    checkboxes.forEach(cb => cb.checked = false); // сброс

    let currentRoles = u.roles || [];
    // Автоматическая конвертация старой роли в новую при открытии модалки
    if (currentRoles.includes("Участник") && !currentRoles.includes("Возвещатель")) {
        currentRoles.push("Возвещатель");
    }

    checkboxes.forEach(cb => {
        if (currentRoles.includes(cb.value)) {
            cb.checked = true;
        }
    });

    // Показываем окно
    document.getElementById('edit-user-modal').classList.replace('hidden', 'flex');
};

// МОДАЛЬНОЕ ОКНО: ЗАКРЫТЬ
window.closeEditModal = () => {
    document.getElementById('edit-user-modal').classList.replace('flex', 'hidden');
    editingUserId = null;
};

// МОДАЛЬНОЕ ОКНО: СОХРАНИТЬ ДАННЫЕ
window.saveUserEdit = async () => {
    if (!editingUserId) return;
    
    const btn = document.getElementById('modal-save-btn');
    btn.innerText = "Загрузка..."; btn.disabled = true;

    // Собираем группу
    let groupVal = document.getElementById('modal-user-group').value.trim();
    if (!groupVal) groupVal = "Без группы";

    // Собираем галочки
    const checkboxes = document.querySelectorAll('.role-cb:checked');
    let newRoles = Array.from(checkboxes).map(cb => cb.value);
    
    // Обязательно должна быть хоть одна роль (по умолчанию Возвещатель)
    if (newRoles.length === 0) newRoles = ["Возвещатель"];

    try {
        await updateDoc(doc(db, "users", editingUserId), {
            group: groupVal,
            roles: newRoles,
            // Удаляем старое поле role, если оно было (для чистоты базы)
            role: null 
        });
        
        btn.innerText = "Сохранено ✔️";
        setTimeout(() => {
            btn.innerText = "Сохранить"; btn.disabled = false;
            window.closeEditModal();
        }, 1000);
    } catch (e) {
        console.error(e);
        alert("Ошибка при сохранении!");
        btn.innerText = "Сохранить"; btn.disabled = false;
    }
};

// ОДОБРИТЬ/ОТКЛОНИТЬ ЗАЯВКИ
window.approveUser = async (id) => {
    try { await updateDoc(doc(db, "users", id), { status: "active", roles: ["Возвещатель"] }); } 
    catch (e) { alert("Ошибка!"); }
};

window.rejectUser = async (id) => {
    if (confirm("Точно отклонить заявку и удалить данные?")) {
        try { await deleteDoc(doc(db, "users", id)); } 
        catch (e) { alert("Ошибка удаления"); }
    }
};

// ЖИВОЙ ПОИСК В ТАБЛИЦЕ
document.getElementById('search-user').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-name').includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});
