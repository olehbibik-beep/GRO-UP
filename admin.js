import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ (С ФРАЗАМИ ДЛЯ АДМИНКИ)
const dict = {
    ru: {
        "admin_title": "Панель Администратора",
        "back_home": "На главную",
        "users_title": "Пользователи",
        "autosave_data": "Автосохранение данных",
        "cong_name_label": "Название собрания (Увидят все)",
        "cong_name_placeholder": "Например: Центральное",
        "requests_title": "Заявки",
        "active_users": "Активные",
        "search_placeholder": "Поиск...",
        "th_name_gender": "Имя и Пол",
        "th_pin": "ПИН",
        "th_group": "Группа",
        "th_school": "Школа",
        "th_status": "Статус в собрании",
        "th_responsible": "Ответственный за",
        "th_manage": "Управление",
        
        // Фразы из admin.js
        "error_save": "Ошибка сохранения!",
        "alert_pin_length": "ПИН-код должен состоять ровно из 6 цифр!",
        "error_save_pin": "Ошибка при сохранении ПИН-кода!",
        "error_update_role": "Ошибка при обновлении роли!",
        "confirm_block": "Заблокировать пользователя?",
        "confirm_delete_profile": "ВНИМАНИЕ! Удалить профиль?",
        "error_general": "Ошибка!",
        "confirm_reject": "Точно отклонить заявку и удалить данные?",
        "error_delete": "Ошибка удаления",
        "status_pending": "Ожидает",
        "btn_approve": "Одобрить",
        "btn_reject": "Отклонить",
        "btn_unblock": "Разблокировать",
        "btn_block": "Заблокировать",
        "btn_delete": "Удалить",
        "gender_boy": "Брат",
        "gender_girl": "Сестра",
        "role_publisher": "Возвещатель",
        "role_pioneer": "Пионер",
        "role_ms": "Помощник собр.",
        "role_elder": "Старейшина",
        "role_admin": "Админ",
        "role_group": "Группа",
        "role_terr": "Участки",
        "role_school": "Школа",
        "no_new_requests": "Нет новых заявок",
        "no_active_users": "Нет активных пользователей",
        "no_group": "Без группы"
    },
    cs: {
        "admin_title": "Panel administrátora",
        "back_home": "Na hlavní stránku",
        "users_title": "Uživatelé",
        "autosave_data": "Automatické ukládání dat",
        "cong_name_label": "Název sboru (Uvidí všichni)",
        "cong_name_placeholder": "Například: Centrální",
        "requests_title": "Žádosti",
        "active_users": "Aktivní",
        "search_placeholder": "Hledat...",
        "th_name_gender": "Jméno a Pohlaví",
        "th_pin": "PIN",
        "th_group": "Skupina",
        "th_school": "Škola",
        "th_status": "Status ve sboru",
        "th_responsible": "Zodpovědný za",
        "th_manage": "Správa",

        // Фразы из admin.js
        "error_save": "Chyba při ukládání!",
        "alert_pin_length": "PIN kód musí mít přesně 6 číslic!",
        "error_save_pin": "Chyba při ukládání PIN kódu!",
        "error_update_role": "Chyba při aktualizaci role!",
        "confirm_block": "Zablokovat uživatele?",
        "confirm_delete_profile": "POZOR! Smazat profil?",
        "error_general": "Chyba!",
        "confirm_reject": "Opravdu zamítnout žádost a smazat data?",
        "error_delete": "Chyba při mazání",
        "status_pending": "Čeká",
        "btn_approve": "Schválit",
        "btn_reject": "Zamítnout",
        "btn_unblock": "Odblokovat",
        "btn_block": "Zablokovat",
        "btn_delete": "Smazat",
        "gender_boy": "Bratr",
        "gender_girl": "Sestra",
        "role_publisher": "Zvěstovatel",
        "role_pioneer": "Průkopník",
        "role_ms": "Služební pom.",
        "role_elder": "Starší",
        "role_admin": "Admin",
        "role_group": "Skupina",
        "role_terr": "Obvody",
        "role_school": "Škola",
        "no_new_requests": "Žádné nové žádosti",
        "no_active_users": "Žádní aktivní uživatelé",
        "no_group": "Bez skupiny"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key; 
};

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder')));
    });
    document.querySelectorAll('[data-lang-title]').forEach(el => {
        el.setAttribute('title', window.t(el.getAttribute('data-lang-title')));
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}
// ============================================

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

// ==========================================
// 1. ПРОВЕРКА ПРАВ И ЗАЩИТА СТРАНИЦ
// ==========================================
const uid = typeof currentUserId !== 'undefined' ? currentUserId : userId;
getDoc(doc(db, "users", uid)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';
});

// ==========================================
// 2. ГЛОБАЛЬНАЯ НАСТРОЙКА: СОБРАНИЕ
// ==========================================
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
    } catch(e) { alert(window.t('error_save')); }
};

// ==========================================
// 3. АВТОСОХРАНЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
// ==========================================

window.updateField = async (id, field, value) => {
    try {
        let valToSave = value.trim();
        if (field === 'group' && !valToSave) valToSave = "Без группы"; // В базе оставляем русский ключ
        await updateDoc(doc(db, "users", id), { [field]: valToSave });
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
    } catch (e) { alert(window.t('error_update_role')); }
};

// ==========================================
// 4. УПРАВЛЕНИЕ: БАН И УДАЛЕНИЕ
// ==========================================
window.blockUser = async (id) => {
    if(confirm(window.t('confirm_block'))) await updateDoc(doc(db, "users", id), { status: 'blocked' });
};
window.unblockUser = async (id) => {
    await updateDoc(doc(db, "users", id), { status: 'active' });
};
window.deleteUser = async (id) => {
    if(confirm(window.t('confirm_delete_profile'))) await deleteDoc(doc(db, "users", id));
};

window.approveUser = async (id) => {
    try { await updateDoc(doc(db, "users", id), { status: "active", roles: ["Возвещатель"] }); } 
    catch (e) { alert(window.t('error_general')); }
};
window.rejectUser = async (id) => {
    if (confirm(window.t('confirm_reject'))) {
        try { await deleteDoc(doc(db, "users", id)); } catch (e) { alert(window.t('error_delete')); }
    }
};

// ==========================================
// 5. ПОЛУЧЕНИЕ И ОТРИСОВКА СПИСКА
// ==========================================
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
            // ОЖИДАЮЩИЕ ПОЛЬЗОВАТЕЛИ
            pendingCount++;
            pendingHTML += `
                <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm user-row" data-name="${u.name.toLowerCase()}">
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
            // АКТИВНЫЕ ПОЛЬЗОВАТЕЛИ
            activeCount++;
            let r = u.roles || [];
            
            const isBlocked = u.status === 'blocked';
            const rowClass = isBlocked ? 'bg-red-50/50 opacity-60 grayscale' : 'hover:bg-slate-50';
            const nameColor = isBlocked ? 'text-red-700' : 'text-slate-800';

            const lockBtn = isBlocked 
                ? `<button onclick="unblockUser('${id}')" title="${window.t('btn_unblock')}" class="p-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors shadow-sm border border-emerald-100 outline-none">🔓</button>`
                : `<button onclick="blockUser('${id}')" title="${window.t('btn_block')}" class="p-1 text-xs bg-slate-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors shadow-sm border border-slate-200 hover:border-amber-300 outline-none">🔒</button>`;
            const deleteBtn = `<button onclick="deleteUser('${id}')" title="${window.t('btn_delete')}" class="p-1 text-xs bg-slate-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors shadow-sm border border-slate-200 hover:border-red-300 outline-none">🗑️</button>`;

            activeHTML += `
                <tr class="transition-colors border-b border-slate-100 group user-row ${rowClass}" data-name="${u.name.toLowerCase()}">
                    
                    <td class="py-1.5 px-3">
                        <p class="font-black ${nameColor} text-[11px] mb-0.5 truncate">${u.name}</p>
                        <select onchange="updateField('${id}', 'gender', this.value)" class="text-[8px] uppercase font-bold p-0.5 rounded border border-slate-200 bg-white outline-none text-slate-600 cursor-pointer" ${isBlocked ? 'disabled' : ''}>
                            <option value="boy" ${u.gender === 'boy' ? 'selected' : ''}>👨‍💼 ${window.t('gender_boy')}</option>
                            <option value="girl" ${u.gender === 'girl' ? 'selected' : ''}>👩‍💼 ${window.t('gender_girl')}</option>
                        </select>
                    </td>

                    <td class="py-1.5 px-2 text-center">
                        <input type="text" maxlength="6" onchange="updatePin('${id}', this.value, this)" value="${u.pin || ''}" placeholder="000000" class="w-[50px] p-1 text-center border border-slate-200 rounded text-[10px] outline-none bg-white font-mono font-black shadow-sm mx-auto" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-1.5 px-2 text-center">
                        <input type="number" onchange="updateField('${id}', 'group', this.value)" value="${u.group && u.group !== 'Без группы' ? u.group : ''}" placeholder="№" class="w-10 p-1 text-center border border-slate-200 rounded text-[11px] outline-none bg-white font-black shadow-sm mx-auto" ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-1.5 px-2 text-center">
                        <input type="checkbox" onchange="toggleRole('${id}', 'Участник школы', this.checked)" class="w-3 h-3 accent-sky-500 cursor-pointer" ${r.includes('Участник школы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}>
                    </td>
                    
                    <td class="py-1.5 px-3">
                        <div class="flex flex-wrap gap-1 w-60">
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-slate-600 font-bold uppercase hover:bg-slate-100 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Возвещатель', this.checked)" class="accent-slate-500 w-3 h-3 cursor-pointer" ${r.includes('Возвещатель') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_publisher')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-emerald-600 font-bold uppercase hover:bg-emerald-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Пионер', this.checked)" class="accent-emerald-500 w-3 h-3 cursor-pointer" ${r.includes('Пионер') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_pioneer')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-sky-600 font-bold uppercase hover:bg-sky-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Помощник собрания', this.checked)" class="accent-sky-500 w-3 h-3 cursor-pointer" ${r.includes('Помощник собрания') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_ms')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-amber-600 font-bold uppercase hover:bg-amber-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Старейшина', this.checked)" class="accent-amber-500 w-3 h-3 cursor-pointer" ${r.includes('Старейшина') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_elder')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-rose-600 font-bold uppercase hover:bg-rose-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Админ', this.checked)" class="accent-rose-500 w-3 h-3 cursor-pointer" ${r.includes('Админ') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_admin')}</label>
                        </div>
                    </td>
                    
                    <td class="py-1.5 px-3">
                        <div class="flex flex-wrap gap-1 w-48">
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-purple-700 font-bold uppercase hover:bg-purple-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Надзиратель группы', this.checked)" class="accent-purple-500 w-3 h-3 cursor-pointer" ${r.includes('Надзиратель группы') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_group')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-teal-700 font-bold uppercase hover:bg-teal-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за участки', this.checked)" class="accent-teal-500 w-3 h-3 cursor-pointer" ${r.includes('Ответственный за участки') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_terr')}</label>
                            <label class="flex items-center gap-1 cursor-pointer text-[8px] text-indigo-700 font-bold uppercase hover:bg-indigo-50 p-1 border border-transparent rounded transition-colors"><input type="checkbox" onchange="toggleRole('${id}', 'Ответственный за школу', this.checked)" class="accent-indigo-500 w-3 h-3 cursor-pointer" ${r.includes('Ответственный за школу') ? 'checked' : ''} ${isBlocked ? 'disabled' : ''}> ${window.t('role_school')}</label>
                        </div>
                    </td>
                    
                    <td class="py-1.5 px-3 align-middle">
                        <div class="flex justify-end gap-1.5">
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
    pendingList.innerHTML = pendingHTML || `<p class="text-slate-400 text-xs text-center py-4">${window.t('no_new_requests')}</p>`;
    activeList.innerHTML = activeHTML || `<tr><td colspan="7" class="text-center py-8 text-slate-400 italic text-sm">${window.t('no_active_users')}</td></tr>`;
});

// ==========================================
// 6. ЖИВОЙ ПОИСК ПО ИМЕНИ
// ==========================================
document.getElementById('search-user').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        if (row.getAttribute('data-name').includes(term)) row.style.display = '';
        else row.style.display = 'none';
    });
});
