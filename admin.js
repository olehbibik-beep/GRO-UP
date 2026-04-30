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
                        <span class="text-2xl">${icon}</span>
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
            let r = u.roles || [];
            if (r.includes("Участник") && !r.includes("Возвещатель")) r.push("Возвещатель");

            activeHTML += `
                <tr class="hover:bg-slate-50 transition-colors group user-row" data-name="${u.name.toLowerCase()}">
                    <td class="py-3 px-4">
                        <p class="font-black text-slate-800 text-sm mb-1">${u.name}</p>
                        <select id="gender-${id}" class="text-[10px] p-1 rounded border border-slate-200 bg-slate-50 outline-none text-slate-600 font-bold">
                            <option value="boy" ${u.gender === 'boy' ? 'selected' : ''}>👨‍💼 Брат</option>
                            <option value="girl" ${u.gender === 'girl' ? 'selected' : ''}>👩‍💼 Сестра</option>
                        </select>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <input type="number" id="group-${id}" value="${u.group && u.group !== 'Без группы' ? u.group : ''}" placeholder="№" class="w-12 p-1.5 text-center border border-slate-200 rounded-md text-xs outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 font-bold">
                    </td>
                    <td class="py-3 px-4">
                        <div class="grid grid-cols-3 gap-2 w-full max-w-lg">
                            <label class="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 font-bold"><input type="checkbox" id="role-pub-${id}" class="accent-indigo-500 w-3.5 h-3.5" ${r.includes('Возвещатель') ? 'checked' : ''}> Возвещатель</label>
                            <label class="flex items-center gap-1.5 cursor-pointer text-xs text-purple-700 font-bold"><input type="checkbox" id="role-overseer-${id}" class="accent-purple-500 w-3.5 h-3.5" ${r.includes('Надзиратель группы') ? 'checked' : ''}> Надзиратель</label>
                            <label class="flex items-center gap-1.5 cursor-pointer text-xs text-emerald-700 font-bold"><input type="checkbox" id="role-terr-${id}" class="accent-emerald-500 w-3.5 h-3.5" ${r.includes('Ответственный за участки') ? 'checked' : ''}> Участки</label>
                            <label class="flex items-center gap-1.5 cursor-pointer text-xs text-sky-700 font-bold"><input type="checkbox" id="role-school-${id}" class="accent-sky-500 w-3.5 h-3.5" ${r.includes('Ответственный за школу') ? 'checked' : ''}> Школа</label>
                            <label class="flex items-center gap-1.5 cursor-pointer text-xs text-rose-600 font-bold"><input type="checkbox" id="role-admin-${id}" class="accent-rose-500 w-3.5 h-3.5" ${r.includes('Админ') ? 'checked' : ''}> Админ</label>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-right">
                        <button onclick="saveUserRow('${id}')" id="btn-save-${id}" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all shadow-md active:scale-95">Сохранить</button>
                    </td>
                </tr>
            `;
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    pendingList.innerHTML = pendingHTML || '<p class="text-slate-400 text-xs text-center py-4">Нет новых заявок</p>';
    activeList.innerHTML = activeHTML || '<tr><td colspan="4" class="text-center py-6 text-slate-400 italic text-sm">Нет активных пользователей</td></tr>';
});

// СОХРАНИТЬ СТРОКУ ПОЛЬЗОВАТЕЛЯ
window.saveUserRow = async (id) => {
    const btn = document.getElementById(`btn-save-${id}`);
    btn.innerText = "..."; btn.disabled = true;

    // Сбор данных из строки
    const genderVal = document.getElementById(`gender-${id}`).value;
    let groupVal = document.getElementById(`group-${id}`).value.trim();
    if (!groupVal) groupVal = "Без группы";

    const roles = [];
    if(document.getElementById(`role-pub-${id}`).checked) roles.push("Возвещатель");
    if(document.getElementById(`role-overseer-${id}`).checked) roles.push("Надзиратель группы");
    if(document.getElementById(`role-terr-${id}`).checked) roles.push("Ответственный за участки");
    if(document.getElementById(`role-school-${id}`).checked) roles.push("Ответственный за школу");
    if(document.getElementById(`role-admin-${id}`).checked) roles.push("Админ");

    if (roles.length === 0) roles.push("Возвещатель");

    try {
        await updateDoc(doc(db, "users", id), {
            gender: genderVal,
            group: groupVal,
            roles: roles,
            role: null // удаляем старое поле
        });
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "ОК ✔️";
        setTimeout(() => {
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Сохранить"; btn.disabled = false;
        }, 1500);
    } catch (e) {
        console.error(e);
        alert("Ошибка при сохранении!");
        btn.innerText = "Сохранить"; btn.disabled = false;
    }
};

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

document.getElementById('search-user').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-name').includes(term)) row.style.display = '';
        else row.style.display = 'none';
    });
});
