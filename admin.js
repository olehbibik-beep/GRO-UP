import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "admin_title": "Панель Администратора", "back_home": "На главную", "users_title": "Пользователи", "btn_back": "Назад",
        "autosave_data": "Автосохранение данных", "cong_name_label": "Название собрания (Увидят все)", "cong_name_placeholder": "Например: Центральное",
        "requests_title": "Заявки", "active_users": "Активные", "search_placeholder": "Поиск...",
        "th_name_gender": "Имя и Пол", "th_pin": "ПИН", "th_group": "Группа", "th_school": "Школа", "th_status": "Статус в собрании",
        "th_responsible": "Ответственный за", "th_manage": "Управление", "error_save": "Ошибка сохранения!",
        "alert_pin_length": "ПИН-код должен состоять ровно из 6 цифр!", "error_save_pin": "Ошибка при сохранении ПИН-кода!",
        "error_update_role": "Ошибка при обновлении роли!", "confirm_block": "Заблокировать пользователя?",
        "confirm_delete_profile": "ВНИМАНИЕ! Удалить профиль?", "error_general": "Ошибка!",
        "confirm_reject": "Точно отклонить заявку и удалить данные?", "error_delete": "Ошибка удаления",
        "status_pending": "Ожидает", "btn_approve": "Одобрить", "btn_reject": "Отклонить", "btn_unblock": "Разблокировать",
        "btn_block": "Заблокировать", "btn_delete": "Удалить", "gender_boy": "Брат", "gender_girl": "Сестра",
        "role_publisher": "Возвещатель", "role_pioneer": "Пионер", "role_ms": "Помощник собр.", "role_elder": "Старейшина",
        "role_admin": "Админ", "role_group": "Группа", "role_terr": "Участки", "role_school": "Школа",
        "role_stand": "Стенды", "role_schedule": "График", "no_new_requests": "Нет новых заявок",
        "no_active_users": "Нет активных пользователей", "no_group": "Без группы", "send_msg": "Отправить сообщение"
    },
    cs: {
        "admin_title": "Panel administrátora", "back_home": "Na hlavní stránku", "users_title": "Uživatelé", "btn_back": "Zpět",
        "autosave_data": "Automatické ukládání dat", "cong_name_label": "Název sboru (Uvidí všichni)", "cong_name_placeholder": "Například: Centrální",
        "requests_title": "Žádosti", "active_users": "Aktivní", "search_placeholder": "Hledat...",
        "th_name_gender": "Jméno a Pohlaví", "th_pin": "PIN", "th_group": "Skupina", "th_school": "Škola", "th_status": "Status ve sboru",
        "th_responsible": "Zodpovědný za", "th_manage": "Správa", "error_save": "Chyba při ukládání!",
        "alert_pin_length": "PIN kód musí mít přesně 6 číslic!", "error_save_pin": "Chyba při ukládání PIN kódu!",
        "error_update_role": "Chyba při aktualizaci role!", "confirm_block": "Zablokovat uživatele?",
        "confirm_delete_profile": "POZOR! Smazat profil?", "error_general": "Chyba!",
        "confirm_reject": "Opravdu zamítnout žádost a smazat data?", "error_delete": "Chyba při mazání",
        "status_pending": "Čeká", "btn_approve": "Schválit", "btn_reject": "Zamítnout", "btn_unblock": "Odblokovat",
        "btn_block": "Zablokovat", "btn_delete": "Smazat", "gender_boy": "Bratr", "gender_girl": "Sestra",
        "role_publisher": "Zvěstovatel", "role_pioneer": "Průkopník", "role_ms": "Služební pom.", "role_elder": "Starší",
        "role_admin": "Admin", "role_group": "Skupina", "role_terr": "Obvody", "role_school": "Škola",
        "role_stand": "Stojany", "role_schedule": "Rozvrh", "no_new_requests": "Žádné nové žádosti",
        "no_active_users": "Žádní aktivní uživatelé", "no_group": "Bez skupiny", "send_msg": "Poslat zprávu"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) return dict[currentLang][key];
    return key; 
};

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-slate-800 text-white px-5 py-4 rounded-xl shadow-2xl text-sm font-black text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => { el.innerHTML = window.t(el.getAttribute('data-lang')); });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => { el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder'))); });
    document.querySelectorAll('[data-lang-title]').forEach(el => { el.setAttribute('title', window.t(el.getAttribute('data-lang-title'))); });
};

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', applyTranslations); } 
else { applyTranslations(); }

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

getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    if (!isFullAdmin) window.location.href = 'index.html';
});

// ЛОГИРОВАНИЕ
async function logAction(actionStr) {
    try {
        await addDoc(collection(db, "admin_logs"), {
            action: actionStr,
            date: new Date().toISOString(),
            adminId: userId
        });
    } catch(e) { console.error("Ошибка записи лога", e); }
}

onSnapshot(query(collection(db, "admin_logs"), orderBy("date", "desc"), limit(20)), (snapshot) => {
    const list = document.getElementById('logs-list');
    if(!list) return;
    let html = '';
    snapshot.forEach(d => {
        const data = d.data();
        const dateObj = new Date(data.date);
        const timeStr = `${dateObj.getDate()}.${dateObj.getMonth()+1} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
        html += `<p class="text-xs text-slate-300 border-b border-slate-700 pb-1.5"><span class="text-[9px] font-bold text-slate-500 mr-2">[${timeStr}]</span> ${data.action}</p>`;
    });
    list.innerHTML = html || `<p class="text-[10px] text-slate-500 italic">Логов пока нет</p>`;
});


onSnapshot(doc(db, "settings", "congregation"), (docSnap) => {
    const elName = document.getElementById('congregation-name');
    const elZoomId = document.getElementById('zoom-id');
    const elZoomPass = document.getElementById('zoom-pass');
    
    if(docSnap.exists()) {
        const data = docSnap.data();
        if (elName && document.activeElement !== elName) elName.value = data.name || "МАРИАНСКИЕ ЛАЗНЕ";
        if (elZoomId && document.activeElement !== elZoomId) elZoomId.value = data.zoomId || "";
        if (elZoomPass && document.activeElement !== elZoomPass) elZoomPass.value = data.zoomPass || "";
    }
});

window.updateCongregation = async (val) => {
    const el = document.getElementById('congregation-name');
    try {
        await setDoc(doc(db, "settings", "congregation"), { name: val.trim() || "МАРИАНСКИЕ ЛАЗНЕ" }, { merge: true });
        el.classList.add('bg-indigo-100', 'border-indigo-400');
        setTimeout(() => el.classList.remove('bg-indigo-100', 'border-indigo-400'), 1500);
        logAction(`Изменено название собрания на: ${val.trim()}`);
    } catch(e) { alert(window.t('error_save')); }
};

window.updateZoomData = async (field, val) => {
    const el = document.getElementById(field === 'zoomId' ? 'zoom-id' : 'zoom-pass');
    try {
        await setDoc(doc(db, "settings", "congregation"), { [field]: val.trim() }, { merge: true });
        el.classList.add('bg-emerald-100', 'border-emerald-400');
        setTimeout(() => el.classList.remove('bg-emerald-100', 'border-emerald-400'), 1500);
        logAction(`Изменены настройки ZOOM (${field})`);
    } catch(e) { alert(window.t('error_save')); }
};

window.updateField = async (id, field, value) => {
    try {
        let valToSave = value.trim();
        if (field === 'group' && !valToSave) valToSave = "Без группы"; 
        await updateDoc(doc(db, "users", id), { [field]: valToSave });
        if(field === 'group') logAction(`Изменена группа пользователя (ID: ${id}) на: ${valToSave}`);
    } catch (e) { alert(window.t('error_save')); }
};

window.updateName = async (id, val, inputEl) => {
    const cleanVal = val.trim();
    if (!cleanVal) return alert("Имя не может быть пустым!");
    try {
        await updateDoc(doc(db, "users", id), { name: cleanVal });
        // Даем визуальный отклик (мигнет зеленым)
        inputEl.classList.add('text-emerald-600', 'bg-emerald-50');
        setTimeout(() => inputEl.classList.remove('text-emerald-600', 'bg-emerald-50'), 1500);
        logAction(`Изменено имя пользователя (ID: ${id}) на: ${cleanVal}`);
    } catch (e) { alert(window.t('error_save')); }
};

window.updatePin = async (id, val, inputEl) => {
    const cleanVal = val.replace(/\D/g, ''); 
    if (cleanVal.length !== 6) {
        alert(window.t('alert_pin_length'));
        const docSnap = await getDoc(doc(db, "users", id));
        inputEl.value = docSnap.data().pin || '';
        return;
    }
    try {
        await updateDoc(doc(db, "users", id), { pin: cleanVal });
        inputEl.value = cleanVal;
        inputEl.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        setTimeout(() => inputEl.classList.remove('border-emerald-500', 'bg-emerald-50', 'text-emerald-700'), 1500);
        logAction(`Изменен ПИН-код пользователя (ID: ${id})`);
    } catch (e) { alert(window.t('error_save_pin')); }
};

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
        logAction(`Изменена роль (${roleName}) у пользователя (ID: ${id}). Статус: ${isChecked}`);
    } catch (e) { alert(window.t('error_update_role')); }
};

window.blockUser = async (id) => { if(confirm(window.t('confirm_block'))) { await updateDoc(doc(db, "users", id), { status: 'blocked' }); logAction(`Пользователь ЗАБЛОКИРОВАН (ID: ${id})`); } };
window.unblockUser = async (id) => { await updateDoc(doc(db, "users", id), { status: 'active' }); logAction(`Пользователь РАЗБЛОКИРОВАН (ID: ${id})`); };
window.deleteUser = async (id) => { if(confirm(window.t('confirm_delete_profile'))) { await deleteDoc(doc(db, "users", id)); logAction(`Пользователь УДАЛЕН (ID: ${id})`); } };
window.approveUser = async (id) => { try { await updateDoc(doc(db, "users", id), { status: "active", roles: ["Возвещатель"] }); logAction(`Заявка одобрена (ID: ${id})`); } catch (e) { alert(window.t('error_general')); } };
window.rejectUser = async (id) => { if (confirm(window.t('confirm_reject'))) { try { await deleteDoc(doc(db, "users", id)); logAction(`Заявка отклонена (ID: ${id})`); } catch (e) { alert(window.t('error_delete')); } } };

// СООБЩЕНИЯ
window.openMsgModal = (id, name) => {
    document.getElementById('msg-user-id').value = id;
    document.getElementById('msg-user-name').innerText = name;
    document.getElementById('msg-text').value = '';
    document.getElementById('msg-modal').classList.replace('hidden', 'flex');
};

window.closeMsgModal = () => {
    document.getElementById('msg-modal').classList.replace('flex', 'hidden');
};

window.sendMsg = async () => {
    const id = document.getElementById('msg-user-id').value;
    const text = document.getElementById('msg-text').value.trim();
    if(!text) return;
    
    const btn = document.getElementById('send-msg-btn');
    btn.innerText = "..."; btn.disabled = true;

    try {
        await addDoc(collection(db, "user_messages"), {
            userId: id,
            message: text,
            createdAt: new Date().toISOString(),
            read: false
        });
        window.showToast("Сообщение отправлено!");
        closeMsgModal();
    } catch(e) {
        alert("Ошибка отправки сообщения");
    }
    btn.innerText = "Отправить"; btn.disabled = false;
};

// ИКОНКИ ДЛЯ РОЛЕЙ
const ICONS = {
    group: `<svg class="w-3 h-3 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
    terr: `<svg class="w-3 h-3 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>`,
    school: `<svg class="w-3 h-3 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>`,
    stand: `<svg class="w-3 h-3 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>`,
    schedule: `<svg class="w-3 h-3 text-fuchsia-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`
};

onSnapshot(collection(db, "users"), (snapshot) => {
    const pendingList = document.getElementById('pending-list');
    const groupsContainer = document.getElementById('groups-container');
    
    let pendingHTML = '';
    let pendingCount = 0;
    let activeCount = 0;
    
    const userGroups = {};

    snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const id = docSnap.id;
        const icon = u.gender === 'girl' ? '👩‍💼' : '👨‍💼';

        if (u.status === 'pending') {
            pendingCount++;
            pendingHTML += `
                <div class="flex items-center justify-between p-3 bg-white border-b border-slate-100 last:border-0 user-row" data-name="${u.name.toLowerCase()}">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${icon}</span>
                        <div>
                            <p class="font-black text-slate-800 text-sm leading-tight">${u.name}</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${window.t('status_pending')}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveUser('${id}')" title="${window.t('btn_approve')}" class="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm outline-none">✔️</button>
                        <button onclick="rejectUser('${id}')" title="${window.t('btn_reject')}" class="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm outline-none">✖</button>
                    </div>
                </div>
            `;
        } else if (u.status === 'active' || u.status === 'blocked') {
            activeCount++;
            
            // Распределение по группам
            let gName = u.group || 'Без группы';
            if (!userGroups[gName]) userGroups[gName] = [];
            u.id = id;
            userGroups[gName].push(u);
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    document.getElementById('active-count').innerText = activeCount;
    pendingList.innerHTML = pendingHTML || `<p class="text-slate-400 text-xs text-center py-4 font-bold uppercase tracking-widest">${window.t('no_new_requests')}</p>`;

    // РЕНДЕР ГРУПП (АККОРДЕОНЫ)
    let groupsHTML = '';
    const sortedGroupNames = Object.keys(userGroups).sort((a,b) => {
        if(a === 'Без группы') return 1;
        if(b === 'Без группы') return -1;
        return a.localeCompare(b, undefined, {numeric: true});
    });

    if (sortedGroupNames.length === 0) {
        groupsContainer.innerHTML = `<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">${window.t('no_active_users')}</div>`;
        return;
    }

    sortedGroupNames.forEach(gName => {
        const usersInGroup = userGroups[gName];
        let usersHTML = '';

        usersInGroup.forEach(u => {
            const id = u.id;
            let r = u.roles || [];
            
            const isBlocked = u.status === 'blocked';
            const rowClass = isBlocked ? 'bg-red-50/50 opacity-60 grayscale' : 'hover:bg-slate-50';
            const nameColor = isBlocked ? 'text-red-700' : 'text-slate-800';

            // ПОСЛЕДНИЙ ВИЗИТ
            let lastVisitText = "Нет данных";
            if (u.lastActive || u.lastLogin) {
                const dateObj = new Date(u.lastActive || u.lastLogin);
                lastVisitText = `${dateObj.getDate()}.${dateObj.getMonth()+1}.${dateObj.getFullYear()}`;
            }

            const lockBtn = isBlocked 
                ? `<button onclick="unblockUser('${id}')" title="${window.t('btn_unblock')}" class="p-1.5 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors shadow-sm border border-emerald-100 outline-none">🔓</button>`
                : `<button onclick="blockUser('${id}')" title="${window.t('btn_block')}" class="p-1.5 text-sm bg-slate-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors shadow-sm border border-slate-200 hover:border-amber-300 outline-none">🔒</button>`;
            
            const msgBtn = `<button onclick="openMsgModal('${id}', '${u.name}')" title="${window.t('send_msg')}" class="p-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors shadow-sm border border-indigo-100 outline-none">💬</button>`;
            const deleteBtn = `<button onclick="deleteUser('${id}')" title="${window.t('btn_delete')}" class="p-1.5 text-sm bg-slate-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors shadow-sm border border-slate-200 hover:border-red-300 outline-none">🗑️</button>`;

            usersHTML += `
                <tr class="transition-colors border-b border-slate-100 group user-row ${rowClass}" data-name="${u.name.toLowerCase()}">
                    
                    <td class="py-2 px-3">
                        <p class="font-black ${nameColor} text-[12px] mb-0.5 truncate">${u.name}</p>
                        <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">Был(а): ${lastVisitText}</p>
                        <select onchange="updateField('${id}', 'gender', this.value)" class="text-[9px] uppercase font-bold p-1 rounded border border-slate-200 bg-white outline-none text-slate-600 cursor-pointer w-full" ${isBlocked ? 'disabled' : ''}>
                            <option value="boy" ${u.gender === 'boy' ? 'selected' : ''}>👨‍💼 ${window.t('gender_boy')}</option>
                            <option value="girl" ${u.gender === 'girl' ? 'selected' : ''}>👩‍💼 ${window.t('gender_girl')}</option>
                        </select>
                    </td>

                    <td class="py-2 px-2 text-center">
                        <input type="text" maxlength="6" onchange="updatePin('${id}', this.value, this)" value="${u.pin || ''}" placeholder="000000" class="w-[55px] p-1.5 text-center border border-slate-200 rounded text-xs outline-none bg-white font-mono font-black shadow-sm mx-auto" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-2 px-2 text-center">
                        <input type="number" onchange="updateField('${id}', 'group', this.value)" value="${u.group && u.group !== 'Без группы' ? u.group : ''}" placeholder="№" class="w-12 p-1.5 text-center border border-slate-200 rounded text-xs outline-none bg-white font-black shadow-sm mx-auto" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-2 px-2 text-center">
                        <label class="flex justify-center items-center cursor-pointer w-full h-full">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Участник школы', this.checked)" class="w-4 h-4 accent-sky-500 cursor-pointer" ${r.includes('Участник школы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}>
                        </label>
                    </td>
                    
                    <td class="py-2 px-3">
                        <div class="flex flex-wrap gap-1.5 w-64">
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-slate-600 font-bold uppercase hover:bg-slate-100 p-1.5 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Возвещатель', this.checked)" class="accent-slate-500 w-3 h-3 cursor-pointer" ${r.includes('Возвещатель') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_publisher')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-emerald-600 font-bold uppercase hover:bg-emerald-50 p-1.5 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Пионер', this.checked)" class="accent-emerald-500 w-3 h-3 cursor-pointer" ${r.includes('Пионер') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_pioneer')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-sky-600 font-bold uppercase hover:bg-sky-50 p-1.5 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Помощник собрания', this.checked)" class="accent-sky-500 w-3 h-3 cursor-pointer" ${r.includes('Помощник собрания') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_ms')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-amber-600 font-bold uppercase hover:bg-amber-50 p-1.5 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Старейшина', this.checked)" class="accent-amber-500 w-3 h-3 cursor-pointer" ${r.includes('Старейшина') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_elder')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-rose-600 font-bold uppercase hover:bg-rose-50 p-1.5 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Админ', this.checked)" class="accent-rose-500 w-3 h-3 cursor-pointer" ${r.includes('Админ') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_admin')}</label>
                        </div>
                    </td>
                    
                    <td class="py-2 px-3">
                        <div class="flex flex-wrap gap-1.5 w-48">
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-purple-700 font-bold uppercase hover:bg-purple-50 p-1 border border-transparent rounded transition-colors">
                                <input type="checkbox" onchange="toggleRole('${id}', 'Надзиратель группы', this.checked)" class="accent-purple-500 w-3 h-3 cursor-pointer" ${r.includes('Надзиратель группы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> 
                                ${ICONS.group} ${window.t('role_group')}
                            </label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-teal-700 font-bold uppercase hover:bg-teal-50 p-1 border border-transparent rounded transition-colors">
                                <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за участки', this.checked)" class="accent-teal-500 w-3 h-3 cursor-pointer" ${r.includes('Ответственный за участки') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> 
                                ${ICONS.terr} ${window.t('role_terr')}
                            </label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-indigo-700 font-bold uppercase hover:bg-indigo-50 p-1 border border-transparent rounded transition-colors">
                                <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за школу', this.checked)" class="accent-indigo-500 w-3 h-3 cursor-pointer" ${r.includes('Ответственный за школу') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> 
                                ${ICONS.school} ${window.t('role_school')}
                            </label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-blue-700 font-bold uppercase hover:bg-blue-50 p-1 border border-transparent rounded transition-colors">
                                <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за стенды', this.checked)" class="accent-blue-600 w-3 h-3 cursor-pointer" ${r.includes('Ответственный за стенды') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> 
                                ${ICONS.stand} ${window.t('role_stand')}
                            </label>
                            <label class="flex items-center gap-1 cursor-pointer text-[9px] text-fuchsia-700 font-bold uppercase hover:bg-fuchsia-50 p-1 border border-transparent rounded transition-colors">
                                <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за график', this.checked)" class="accent-fuchsia-600 w-3 h-3 cursor-pointer" ${r.includes('Ответственный за график') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> 
                                ${ICONS.schedule} ${window.t('role_schedule')}
                            </label>
                        </div>
                    </td>
                    
                    <td class="py-2 px-3 align-middle">
                        <div class="flex justify-end gap-1.5">
                            ${msgBtn}
                            ${lockBtn}
                            ${deleteBtn}
                        </div>
                    </td>
                </tr>
            `;
        });

        const gLabel = gName === 'Без группы' ? window.t('no_group') : `Группа ${gName}`;

        groupsHTML += `
            <details class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                <summary class="font-black text-slate-700 p-4 cursor-pointer outline-none flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        ${gLabel}
                    </div>
                    <span class="bg-indigo-100 text-indigo-700 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">${usersInGroup.length} чел.</span>
                </summary>
                <div class="overflow-x-auto border-t border-slate-100">
                    <table class="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-400 uppercase tracking-widest">
                                <th class="py-2 px-3 font-bold w-1/6" data-lang="th_name_gender">Имя и Пол</th>
                                <th class="py-2 px-2 font-bold text-center w-20" data-lang="th_pin">ПИН</th>
                                <th class="py-2 px-2 font-bold text-center w-20" data-lang="th_group">Группа</th>
                                <th class="py-2 px-2 font-bold text-center text-sky-600 w-16" data-lang="th_school">Школа</th>
                                <th class="py-2 px-3 font-bold w-64" data-lang="th_status">Статус в собрании</th>
                                <th class="py-2 px-3 font-bold w-48" data-lang="th_responsible">Ответственный за</th>
                                <th class="py-2 px-3 font-bold text-right w-32" data-lang="th_manage">Управление</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm font-medium">
                            ${usersHTML}
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    });

    groupsContainer.innerHTML = groupsHTML;
});

document.getElementById('search-user').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-name').includes(term)) row.style.display = '';
        else row.style.display = 'none';
    });
});
