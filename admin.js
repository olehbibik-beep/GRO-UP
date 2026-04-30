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

// АВТОСОХРАНЕНИЕ: Пол и Группа
window.updateField = async (id, field, value) => {
    try {
        let valToSave = value.trim();
        if (field === 'group' && !valToSave) valToSave = "Без группы";
        await updateDoc(doc(db, "users", id), { [field]: valToSave });
    } catch (e) { alert("Ошибка при сохранении!"); }
};

// АВТОСОХРАНЕНИЕ: Роли (Галочки)
window.toggleRole = async (id, roleName, isChecked) => {
    try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        let currentRoles = userSnap.data().roles || [];
        
        if (isChecked) {
            if (!currentRoles.includes(roleName)) currentRoles.push(roleName);
        } else {
            currentRoles = currentRoles.filter(r => r !== roleName);
        }
        
        // Обязательная защита: чтобы не удалить последнюю роль у активного юзера
        if (currentRoles.length === 0) currentRoles = ["Возвещатель"];
        
        await updateDoc(userRef, { roles: currentRoles });
    } catch (e) { alert("Ошибка при обновлении роли!"); }
};

// УПРАВЛЕНИЕ: БАН И УДАЛЕНИЕ
window.blockUser = async (id) => {
    if(confirm("Забанить пользователя? Он потеряет доступ к сайту.")) {
        await updateDoc(doc(db, "users", id), { status: 'blocked' });
    }
};

window.unblockUser = async (id) => {
    await updateDoc(doc(db, "users", id), { status: 'active' });
};

window.deleteUser = async (id) => {
    if(confirm("ВНИМАНИЕ! Полностью удалить профиль и всю его историю?")) {
        await deleteDoc(doc(db, "users", id));
    }
};

// ПОЛУЧЕНИЕ И ОТРИСОВКА ПОЛЬЗОВАТЕЛЕЙ
onSnapshot(collection(db, "users"), (snapshot) => {
    const pendingList = document.getElementById('pending-list');
    const activeList = document.getElementById('active-list');
    
    let pendingHTML = '';
    let activeHTML = '';
    let pendingCount = 0;
    let activeCount = 0;

    snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const id = docSnap.id;
        const icon = u.gender === 'girl' ? '👩‍💼' : '👨‍💼';

        if (u.status === 'pending') {
            pendingCount++;
            pendingHTML += `
                <div class="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${icon}</span>
                        <div>
                            <p class="font-black text-slate-800">${u.name}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Новая заявка</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveUser('${id}')" class="bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm">Одобрить</button>
                        <button onclick="rejectUser('${id}')" class="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm">Отклонить</button>
                    </div>
                </div>
            `;
        } else if (u.status === 'active' || u.status === 'blocked') {
            activeCount++;
            let r = u.roles || [];
            
            const isBlocked = u.status === 'blocked';
            const rowClass = isBlocked ? 'bg-red-50/50 opacity-60 grayscale' : 'hover:bg-slate-50';
            const nameColor = isBlocked ? 'text-red-700' : 'text-slate-800';

            const actionBtn = isBlocked 
                ? `<button onclick="unblockUser('${id}')" class="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors mb-1 shadow-sm">🟢 Разбанить</button>`
                : `<button onclick="blockUser('${id}')" class="w-full bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors mb-1 shadow-sm">🛑 Забанить</button>`;

            activeHTML += `
                <tr class="transition-colors border-b border-slate-100 group user-row ${rowClass}" data-name="${u.name.toLowerCase()}">
                    
                    <td class="py-3 px-4">
                        <p class="font-black ${nameColor} text-sm mb-1.5 truncate">${u.name}</p>
                        <select onchange="updateField('${id}', 'gender', this.value)" class="text-[10px] uppercase font-bold p-1 rounded border border-slate-200 bg-white outline-none focus:border-indigo-500 text-slate-600 shadow-sm" ${isBlocked ? 'disabled' : ''}>
                            <option value="boy" ${u.gender === 'boy' ? 'selected' : ''}>👨‍💼 Брат</option>
                            <option value="girl" ${u.gender === 'girl' ? 'selected' : ''}>👩‍💼 Сестра</option>
                        </select>
                    </td>
                    
                    <td class="py-3 px-2 text-center">
                        <input type="number" onchange="updateField('${id}', 'group', this.value)" value="${u.group && u.group !== 'Без группы' ? u.group : ''}" placeholder="№" class="w-14 p-2 text-center border border-slate-200 rounded-lg text-sm outline-none bg-white focus:border-indigo-500 font-black shadow-sm" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-3 px-2 text-center">
                        <label class="inline-flex items-center cursor-pointer p-2 rounded hover:bg-sky-50 transition-colors">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Участник школы', this.checked)" class="w-5 h-5 accent-sky-500 shadow-sm" ${r.includes('Участник школы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}>
                        </label>
                    </td>
                    
                    <td class="py-3 px-4">
                        <div class="flex flex-col gap-2">
                            <label class="flex items-center gap-2 cursor-pointer text-[10px] text-slate-700 font-bold uppercase tracking-wider hover:bg-indigo-50 p-1 -ml-1 rounded transition-colors w-max"><input type="checkbox" onchange="toggleRole('${id}', 'Возвещатель', this.checked)" class="accent-indigo-500 w-4 h-4 shadow-sm" ${r.includes('Возвещатель') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Возвещатель</label>
                            <label class="flex items-center gap-2 cursor-pointer text-[10px] text-rose-600 font-bold uppercase tracking-wider hover:bg-rose-50 p-1 -ml-1 rounded transition-colors w-max"><input type="checkbox" onchange="toggleRole('${id}', 'Админ', this.checked)" class="accent-rose-500 w-4 h-4 shadow-sm" ${r.includes('Админ') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Администратор</label>
                        </div>
                    </td>
                    
                    <td class="py-3 px-4">
                        <div class="flex flex-col gap-2">
                            <label class="flex items-center gap-2 cursor-pointer text-[10px] text-purple-700 font-bold uppercase tracking-wider hover:bg-purple-50 p-1 -ml-1 rounded transition-colors w-max"><input type="checkbox" onchange="toggleRole('${id}', 'Надзиратель группы', this.checked)" class="accent-purple-500 w-4 h-4 shadow-sm" ${r.includes('Надзиратель группы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Группа</label>
                            <label class="flex items-center gap-2 cursor-pointer text-[10px] text-emerald-700 font-bold uppercase tracking-wider hover:bg-emerald-50 p-1 -ml-1 rounded transition-colors w-max"><input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за участки', this.checked)" class="accent-emerald-500 w-4 h-4 shadow-sm" ${r.includes('Ответственный за участки') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Участки</label>
                            <label class="flex items-center gap-2 cursor-pointer text-[10px] text-sky-700 font-bold uppercase tracking-wider hover:bg-sky-50 p-1 -ml-1 rounded transition-colors w-max"><input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за школу', this.checked)" class="accent-sky-500 w-4 h-4 shadow-sm" ${r.includes('Ответственный за школу') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Школа</label>
                        </div>
                    </td>
                    
                    <td class="py-3 px-4 align-top pt-4">
                        <div class="flex flex-col items-end w-full">
                            ${actionBtn}
                            <button onclick="deleteUser('${id}')" class="w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">🗑️ Удалить</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    pendingList.innerHTML = pendingHTML || '<p class="text-slate-400 text-xs text-center py-4">Нет новых заявок</p>';
    activeList.innerHTML = activeHTML || '<tr><td colspan="6" class="text-center py-8 text-slate-400 italic text-sm">Нет активных пользователей</td></tr>';
});

// ПЕРВИЧНОЕ ОДОБРЕНИЕ/ОТКЛОНЕНИЕ
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

// ПОИСК (Работает мгновенно)
document.getElementById('search-user').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-name').includes(term)) row.style.display = '';
        else row.style.display = 'none';
    });
});
