import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "admin_title": "Панель Администратора", "back_home": "На главную", "users_title": "Пользователи", "btn_back": "Назад",
        "autosave_data": "Автосохранение данных", "cong_name_label": "Название собрания", "cong_name_placeholder": "Например: Центральное",
        "requests_title": "Заявки", "active_users": "Активные пользователи", "search_placeholder": "Поиск...",
        "error_save": "Ошибка сохранения!", "alert_pin_length": "ПИН-код должен состоять ровно из 6 цифр!",
        "error_save_pin": "Ошибка при сохранении ПИН-кода!", "error_update_role": "Ошибка при обновлении роли!",
        "confirm_block": "Заблокировать пользователя?", "confirm_delete_profile": "ВНИМАНИЕ! Удалить профиль?",
        "error_general": "Ошибка!", "confirm_reject": "Точно отклонить заявку и удалить данные?", "error_delete": "Ошибка удаления",
        "status_pending": "Ожидает", "btn_approve": "Одобрить", "btn_reject": "Отклонить", "btn_unblock": "Разблокировать",
        "btn_block": "Заблокировать", "btn_delete": "Удалить", "no_new_requests": "Нет новых заявок", "send_msg": "Отправить сообщение"
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

async function logAction(actionStr) {
    try { await addDoc(collection(db, "admin_logs"), { action: actionStr, date: new Date().toISOString(), adminId: userId }); } catch(e) {}
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

window.openMsgModal = (id, name) => {
    document.getElementById('msg-user-id').value = id;
    document.getElementById('msg-user-name').innerText = name;
    document.getElementById('msg-text').value = '';
    document.getElementById('msg-modal').classList.replace('hidden', 'flex');
};
window.closeMsgModal = () => { document.getElementById('msg-modal').classList.replace('flex', 'hidden'); };

window.sendMsg = async () => {
    const id = document.getElementById('msg-user-id').value;
    const text = document.getElementById('msg-text').value.trim();
    if(!text) return;
    const btn = document.getElementById('send-msg-btn');
    btn.innerText = "..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "user_messages"), { userId: id, message: text, createdAt: new Date().toISOString(), read: false });
        window.showToast("Сообщение отправлено!");
        closeMsgModal();
    } catch(e) { alert("Ошибка отправки сообщения"); }
    btn.innerText = "Отправить"; btn.disabled = false;
};

// ИКОНКИ (ТЕПЕРЬ ВСЕ СТРОГИЕ СЕРЫЕ)
const ICONS = {
    group: `<svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
    terr: `<svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>`,
    school: `<svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>`,
    stand: `<svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>`,
    schedule: `<svg class="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`
};

let allUsersData = [];
let currentSearchTerm = '';
let currentGroupFilter = 'all';

document.getElementById('search-user').addEventListener('input', (e) => {
    currentSearchTerm = e.target.value.toLowerCase();
    renderUsersList();
});

document.getElementById('filter-group').addEventListener('change', (e) => {
    currentGroupFilter = e.target.value;
    renderUsersList();
});

onSnapshot(collection(db, "users"), (snapshot) => {
    allUsersData = [];
    let pendingHTML = '';
    let pendingCount = 0;
    
    let stats = { total: 0, pub: 0, pio: 0, eld: 0, ms: 0 };
    const groups = new Set();

    snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        u.id = docSnap.id;

        if (u.status === 'pending') {
            pendingCount++;
            const icon = u.gender === 'girl' ? '👩‍💼' : '👨‍💼';
            
            // Дата создания заявки
            let reqDate = "Дата неизвестна";
            if (u.createdAt || u.registeredAt) {
                const d = new Date(u.createdAt || u.registeredAt);
                if (!isNaN(d)) {
                    reqDate = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                }
            }

            pendingHTML += `
                <div class="flex items-center justify-between p-4 bg-white border-b border-slate-100 last:border-0">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${icon}</span>
                        <div>
                            <p class="font-black text-slate-800 text-sm leading-tight">${u.name}</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${window.t('status_pending')}</p>
                            <p class="text-[10px] text-slate-500 mt-1">🕒 Заявка от: <span class="font-bold">${reqDate}</span></p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveUser('${u.id}')" title="${window.t('btn_approve')}" class="w-9 h-9 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm outline-none">✔️</button>
                        <button onclick="rejectUser('${u.id}')" title="${window.t('btn_reject')}" class="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm outline-none">✖</button>
                    </div>
                </div>
            `;
        } else if (u.status === 'active' || u.status === 'blocked') {
            allUsersData.push(u);
            
            if (u.group && String(u.group).trim() !== '' && String(u.group) !== 'Без группы') {
                groups.add(String(u.group).trim());
            }

            if (u.status === 'active') {
                stats.total++;
                let r = u.roles || [];
                if (r.length === 0) r = ['Возвещатель']; 
                
                if (r.includes('Возвещатель')) stats.pub++;
                if (r.includes('Пионер')) stats.pio++;
                if (r.includes('Старейшина')) stats.eld++;
                if (r.includes('Помощник собрания')) stats.ms++;
            }
        }
    });

    document.getElementById('pending-count').innerText = pendingCount;
    const pList = document.getElementById('pending-list');
    if (pList) pList.innerHTML = pendingHTML || `<p class="text-slate-400 text-xs text-center py-4 font-bold uppercase tracking-widest">${window.t('no_new_requests')}</p>`;

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-pub').innerText = stats.pub;
    document.getElementById('stat-pio').innerText = stats.pio;
    document.getElementById('stat-eld').innerText = stats.eld;
    document.getElementById('stat-ms').innerText = stats.ms;

    const select = document.getElementById('filter-group');
    if (select) {
        const sortedGroups = Array.from(groups).sort((a,b) => Number(a) - Number(b));
        let html = `<option value="all">Все группы</option>`;
        sortedGroups.forEach(g => { html += `<option value="${g}">Группа ${g}</option>`; });
        html += `<option value="none">Без группы</option>`;
        
        if (sortedGroups.includes(currentGroupFilter) || currentGroupFilter === 'none' || currentGroupFilter === 'all') {
            select.innerHTML = html;
            select.value = currentGroupFilter;
        } else {
            select.innerHTML = html;
            select.value = 'all';
            currentGroupFilter = 'all';
        }
    }

    renderUsersList();
});

function renderUsersList() {
    const container = document.getElementById('users-list-container');
    if (!container) return;

    const filteredUsers = allUsersData.filter(u => {
        const term = currentSearchTerm.trim();
        const nameMatch = !term || u.name.toLowerCase().includes(term);
        
        const gName = (u.group && String(u.group).trim() !== '') ? String(u.group).trim() : 'Без группы';
        let groupMatch = true;
        if (currentGroupFilter === 'none') groupMatch = (gName === 'Без группы');
        else if (currentGroupFilter !== 'all') groupMatch = (gName === currentGroupFilter);

        return nameMatch && groupMatch;
    });

    // ИСПРАВЛЕНИЕ СОРТИРОВКИ: Строго по алфавиту (именам). Карточки не будут прыгать!
    filteredUsers.sort((a, b) => a.name.localeCompare(b.name));

    if (filteredUsers.length === 0) {
        container.innerHTML = `<div class="col-span-full py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border border-slate-200 border-dashed rounded-2xl">Никого не найдено</div>`;
        return;
    }

    let html = '';
    filteredUsers.forEach(u => {
        const id = u.id;
        let r = u.roles || [];
        
        const isBlocked = u.status === 'blocked';
        const rowClass = isBlocked ? 'bg-red-50/40 opacity-70 grayscale border-red-200' : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300';
        const nameColor = isBlocked ? 'text-red-700' : 'text-slate-800';

        // ИСПРАВЛЕНИЕ: Форматирование "Был(а) в сети"
        let lastVisitText = "Нет данных";
        if (u.lastActive || u.lastLogin) {
            const dateObj = new Date(u.lastActive || u.lastLogin);
            if (!isNaN(dateObj)) {
                const day = dateObj.getDate().toString().padStart(2, '0');
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const year = dateObj.getFullYear();
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const mins = dateObj.getMinutes().toString().padStart(2, '0');
                lastVisitText = `${day}.${month}.${year} в ${hours}:${mins}`;
            }
        }

        const lockBtn = isBlocked 
            ? `<button onclick="unblockUser('${id}')" title="${window.t('btn_unblock')}" class="w-9 h-9 flex items-center justify-center text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors outline-none">🔓</button>`
            : `<button onclick="blockUser('${id}')" title="${window.t('btn_block')}" class="w-9 h-9 flex items-center justify-center text-sm bg-white hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200 outline-none">🔒</button>`;
        
        const msgBtn = `<button onclick="openMsgModal('${id}', '${u.name}')" title="${window.t('send_msg')}" class="w-9 h-9 flex items-center justify-center text-sm bg-white hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200 outline-none">💬</button>`;
        const deleteBtn = `<button onclick="deleteUser('${id}')" title="${window.t('btn_delete')}" class="w-9 h-9 flex items-center justify-center text-sm bg-white hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-slate-200 hover:border-red-200 outline-none">🗑️</button>`;

        // ЕДИНЫЙ СТРОГИЙ СТИЛЬ ДЛЯ ВСЕХ КНОПОК
        const checkboxClass = "flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-700 font-bold hover:bg-slate-100 py-1.5 px-2.5 border border-slate-200 bg-slate-50 rounded-lg transition-colors shadow-sm uppercase";
        const accentClass = "accent-slate-600 w-3.5 h-3.5";

        html += `
            <div class="${rowClass} rounded-2xl shadow-sm p-4 flex flex-col relative transition-all">
                
                <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                    <div class="flex-grow pr-2">
                        <input type="text" onchange="updateName('${id}', this.value, this)" value="${u.name}" class="w-full font-black ${nameColor} text-base md:text-lg mb-1 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-500 outline-none transition-all py-0.5 px-1 -ml-1 rounded-sm" ${isBlocked ? 'disabled' : ''}>
                        <p class="text-[9px] font-bold text-slate-400 tracking-widest pl-1 uppercase">Был(а): ${lastVisitText}</p>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        ${msgBtn} ${lockBtn} ${deleteBtn}
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div class="flex flex-col">
                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Пол</span>
                        <select onchange="updateField('${id}', 'gender', this.value)" class="text-center-last text-[10px] md:text-xs font-bold py-1.5 px-0.5 rounded-lg border border-slate-200 bg-white outline-none text-slate-700 cursor-pointer" ${isBlocked ? 'disabled' : ''}>
                            <option value="boy" ${u.gender === 'boy' ? 'selected' : ''}>Брат</option>
                            <option value="girl" ${u.gender === 'girl' ? 'selected' : ''}>Сестра</option>
                        </select>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">ПИН</span>
                        <input type="text" maxlength="6" onchange="updatePin('${id}', this.value, this)" value="${u.pin || ''}" placeholder="000000" class="w-full py-1.5 px-1 text-center border border-slate-200 rounded-lg text-xs outline-none bg-white font-mono font-black shadow-sm" ${isBlocked ? 'disabled' : ''}>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Группа</span>
                        <input type="number" onchange="updateField('${id}', 'group', this.value)" value="${u.group && u.group !== 'Без группы' ? u.group : ''}" placeholder="№" class="w-full py-1.5 px-1 text-center border border-slate-200 rounded-lg text-xs outline-none bg-white font-black shadow-sm" ${isBlocked ? 'disabled' : ''}>
                    </div>
                </div>

                <div class="mb-3">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Статус в собрании</span>
                    <div class="flex flex-wrap gap-1.5">
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Возвещатель', this.checked)" class="${accentClass}" ${r.includes('Возвещатель') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Возвещатель
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Пионер', this.checked)" class="${accentClass}" ${r.includes('Пионер') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Пионер
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Помощник собрания', this.checked)" class="${accentClass}" ${r.includes('Помощник собрания') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Помощник
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Старейшина', this.checked)" class="${accentClass}" ${r.includes('Старейшина') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Старейшина
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Участник школы', this.checked)" class="${accentClass}" ${r.includes('Участник школы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Ученик
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Админ', this.checked)" class="${accentClass}" ${r.includes('Админ') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> Админ
                        </label>
                    </div>
                </div>

                <div class="mt-auto">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block border-t border-slate-100 pt-3">Ответственный за</span>
                    <div class="flex flex-wrap gap-1.5">
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Надзиратель группы', this.checked)" class="${accentClass}" ${r.includes('Надзиратель группы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${ICONS.group} Группа
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за участки', this.checked)" class="${accentClass}" ${r.includes('Ответственный за участки') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${ICONS.terr} Участки
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за школу', this.checked)" class="${accentClass}" ${r.includes('Ответственный за школу') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${ICONS.school} Школа
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за стенды', this.checked)" class="${accentClass}" ${r.includes('Ответственный за стенды') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${ICONS.stand} Стенды
                        </label>
                        <label class="${checkboxClass}">
                            <input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за график', this.checked)" class="${accentClass}" ${r.includes('Ответственный за график') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${ICONS.schedule} График
                        </label>
                    </div>
                </div>

            </div>
        `;
    });

    container.innerHTML = html;
}
