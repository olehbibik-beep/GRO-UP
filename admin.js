import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// ГЛОБАЛЬНАЯ НАСТРОЙКА: СОБРАНИЕ
onSnapshot(doc(db, "settings", "congregation"), (docSnap) => {
    const el = document.getElementById('congregation-name');
    if(docSnap.exists() && el) {
        el.value = docSnap.data().name || "МАРИАНСКИЕ ЛАЗНЕ";
    }
});

window.updateCongregation = async (val) => {
    const el = document.getElementById('congregation-name');
    try {
        await setDoc(doc(db, "settings", "congregation"), { name: val.trim() || "МАРИАНСКИЕ ЛАЗНЕ" }, { merge: true });
        el.classList.add('bg-emerald-50', 'border-emerald-400', 'text-emerald-700');
        setTimeout(() => el.classList.remove('bg-emerald-50', 'border-emerald-400', 'text-emerald-700'), 1500);
    } catch(e) { alert("Ошибка сохранения!"); }
};

// АВТОСОХРАНЕНИЕ: Пол и Группа
window.updateField = async (id, field, value) => {
    try {
        let valToSave = value.trim();
        if (field === 'group' && !valToSave) valToSave = "Без группы";
        await updateDoc(doc(db, "users", id), { [field]: valToSave });
    } catch (e) { alert("Ошибка при сохранении!"); }
};

// АВТОСОХРАНЕНИЕ: ПИН-КОД
window.updatePin = async (id, val, inputEl) => {
    const cleanVal = val.replace(/\D/g, ''); 
    if (cleanVal.length !== 6) {
        alert("ПИН-код должен состоять ровно из 6 цифр!");
        const docSnap = await getDoc(doc(db, "users", id));
        inputEl.value = docSnap.data().pin || '';
        return;
    }
    try {
        await updateDoc(doc(db, "users", id), { pin: cleanVal });
        inputEl.value = cleanVal;
        inputEl.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        setTimeout(() => inputEl.classList.remove('border-emerald-500', 'bg-emerald-50', 'text-emerald-700'), 1500);
    } catch (e) { alert("Ошибка при сохранении ПИН-кода!"); }
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
        
        if (currentRoles.length === 0) currentRoles = ["Возвещатель"];
        await updateDoc(userRef, { roles: currentRoles });
    } catch (e) { alert("Ошибка при обновлении роли!"); }
};

// УПРАВЛЕНИЕ: БАН И УДАЛЕНИЕ
window.blockUser = async (id) => {
    if(confirm("Заблокировать пользователя?")) await updateDoc(doc(db, "users", id), { status: 'blocked' });
};
window.unblockUser = async (id) => {
    await updateDoc(doc(db, "users", id), { status: 'active' });
};
window.deleteUser = async (id) => {
    if(confirm("ВНИМАНИЕ! Удалить профиль?")) await deleteDoc(doc(db, "users", id));
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
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ПИН: <span class="text-slate-700">${u.pin || 'НЕТ'}</span></p>
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

            const lockBtn = isBlocked 
                ? `<button onclick="unblockUser('${id}')" title="Разблокировать" class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors text-base shadow-sm border border-emerald-100">🔓</button>`
                : `<button onclick="blockUser('${id}')" title="Заблокировать" class="p-2 bg-slate-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors text-base shadow-sm border border-slate-200 hover:border-amber-300">🔒</button>`;
            const deleteBtn = `<button onclick="deleteUser('${id}')" title="Удалить" class="p-2 bg-slate-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-base shadow-sm border border-slate-200 hover:border-red-300">🗑️</button>`;

            activeHTML += `
                <tr class="transition-colors border-b border-slate-100 group user-row ${rowClass}" data-name="${u.name.toLowerCase()}">
                    
                    <td class="py-2 px-4">
                        <p class="font-black ${nameColor} text-sm mb-1 truncate">${u.name}</p>
                        <select onchange="updateField('${id}', 'gender', this.value)" class="text-[10px] uppercase font-bold p-1 rounded border border-slate-200 bg-white outline-none focus:border-indigo-500 text-slate-600 shadow-sm cursor-pointer" ${isBlocked ? 'disabled' : ''}>
                            <option value="boy" ${u.gender === 'boy' ? 'selected' : ''}>👨‍💼 Брат</option>
                            <option value="girl" ${u.gender === 'girl' ? 'selected' : ''}>👩‍💼 Сестра</option>
                        </select>
                    </td>

                    <td class="py-2 px-2 text-center">
                        <input type="text" maxlength="6" onchange="updatePin('${id}', this.value, this)" value="${u.pin || ''}" placeholder="000000" class="w-[60px] p-1.5 text-center border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-indigo-500 font-mono font-black tracking-widest shadow-sm mx-auto transition-all" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-2 px-2 text-center">
                        <input type="number" onchange="updateField('${id}', 'group', this.value)" value="${u.group && u.group !== 'Без группы' ? u.group : ''}" placeholder="№" class="w-12 p-1.5 text-center border border-slate-200 rounded-lg text-sm outline-none bg-white focus:border-indigo-500 font-black shadow-sm mx-auto" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-2 px-2 text-center">
                        <label class="inline-flex items-center cursor-pointer p-1.5 rounded hover:bg-sky-50 transition-colors">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Участник школы', this.checked)" class="w-4 h-4 accent-sky-500 shadow-sm cursor-pointer" ${r.includes('Участник школы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}>
                        </label>
                    </td>
                    
                    <td class="py-2 px-4">
                        <div class="flex flex-wrap gap-1.5 w-64">
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-slate-600 font-bold uppercase hover:bg-slate-100 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Возвещатель', this.checked)" class="accent-slate-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Возвещатель') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Возвещатель</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-600 font-bold uppercase hover:bg-emerald-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Пионер', this.checked)" class="accent-emerald-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Пионер') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Пионер</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-sky-600 font-bold uppercase hover:bg-sky-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Помощник собрания', this.checked)" class="accent-sky-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Помощник собрания') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Помощник собр.</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-amber-600 font-bold uppercase hover:bg-amber-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Старейшина', this.checked)" class="accent-amber-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Старейшина') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Старейшина</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-rose-600 font-bold uppercase hover:bg-rose-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Админ', this.checked)" class="accent-rose-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Админ') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Админ</label>
                        </div>
                    </td>
                    
                    <td class="py-2 px-4">
                        <div class="flex flex-wrap gap-1.5 w-48">
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-purple-700 font-bold uppercase hover:bg-purple-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Надзиратель группы', this.checked)" class="accent-purple-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Надзиратель группы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Группа</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-teal-700 font-bold uppercase hover:bg-teal-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за участки', this.checked)" class="accent-teal-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Ответственный за участки') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Участки</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[10px] text-indigo-700 font-bold uppercase hover:bg-indigo-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за школу', this.checked)" class="accent-indigo-500 w-3.5 h-3.5 cursor-pointer" ${r.includes('Ответственный за школу') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Школа</label>
                        </div>
                    </td>
                    
                    <td class="py-2 px-4 align-middle">
                        <div class="flex justify-end gap-2">
                            ${lockBtn}
                            ${deleteBtn}
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    pendingList.innerHTML = pendingHTML || '<p class="text-slate-400 text-xs text-center py-4">Нет новых заявок</p>';
    activeList.innerHTML = activeHTML || '<tr><td colspan="7" class="text-center py-8 text-slate-400 italic text-sm">Нет активных пользователей</td></tr>';
});

window.approveUser = async (id) => {
    try { await updateDoc(doc(db, "users", id), { status: "active", roles: ["Возвещатель"] }); } 
    catch (e) { alert("Ошибка!"); }
};
window.rejectUser = async (id) => {
    if (confirm("Точно отклонить заявку и удалить данные?")) {
        try { await deleteDoc(doc(db, "users", id)); } catch (e) { alert("Ошибка удаления"); }
    }
};

document.getElementById('search-user').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-name').includes(term)) row.style.display = '';
        else row.style.display = 'none';
    });
});
