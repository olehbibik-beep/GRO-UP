import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ЕДИНЫЙ ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ (эмодзи удалены)
const dict = {
    ru: {
        "terr_title": "Управление Участками - GRO-UP",
        "terr_h1": "Участки",
        "manage_terr": "Управление территориями",
        "requests_title": "Запросы",
        "no_new_requests_terr": "Нет новых запросов",
        "issue_terr": "Выдать участок",
        "to_whom": "Кому выдать",
        "loading": "Загрузка...",
        "select_publisher": "Выберите возвещателя...",
        "terr_number_label": "Номер участка",
        "ph_terr_num": "Например: 105",
        "btn_assign": "Назначить",
        "in_progress": "В работе",
        "ph_search_terr": "Поиск по имени или №...",
        "th_number": "Номер",
        "th_publisher": "Возвещатель",
        "th_taken": "Взят",
        "th_action": "Действие",
        "back_home": "На главную",
        "saving": "Сохранение...",
        "success_tick": "Успешно!",
        "btn_returned": "Сдан",
        "all_terr_free": "Все участки свободны.",
        "alert_select_user_num": "Выберите пользователя и введите номер!",
        "confirm_return": "Отметить участок как сданный?",
        "confirm_delete_request": "Удалить этот запрос?",
        "error_general": "Ошибка!",
        "title_issue_terr": "Выдать участок",
        "delete": "Удалить",
        "btn_back": "Назад"
    },
    cs: {
        "terr_title": "Správa obvodů - GRO-UP",
        "terr_h1": "Obvody",
        "manage_terr": "Správa území",
        "requests_title": "Žádosti",
        "no_new_requests_terr": "Žádné nové žádosti",
        "issue_terr": "Vydat obvod",
        "to_whom": "Komu vydat",
        "loading": "Načítání...",
        "select_publisher": "Vyberte zvěstovatele...",
        "terr_number_label": "Číslo obvodu",
        "ph_terr_num": "Například: 105",
        "btn_assign": "Přiřadit",
        "in_progress": "V práci",
        "ph_search_terr": "Hledat podle jména nebo č...",
        "th_number": "Číslo",
        "th_publisher": "Zvěstovatel",
        "th_taken": "Vydáno",
        "th_action": "Akce",
        "back_home": "Na hlavní stránku",
        "saving": "Ukládání...",
        "success_tick": "Úspěšně!",
        "btn_returned": "Vrácen",
        "all_terr_free": "Všechny obvody jsou volné.",
        "alert_select_user_num": "Vyberte uživatele a zadejte číslo!",
        "confirm_return": "Označit obvod jako vrácený?",
        "confirm_delete_request": "Smazat tuto žádost?",
        "error_general": "Chyba!",
        "title_issue_terr": "Vydat obvod",
        "delete": "Smazat",
        "btn_back": "Zpět"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

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

// 1. ПРОВЕРКА ПРАВ
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    if (!isTerr) window.location.href = 'index.html';
});

// 2. СПИСОК ПОЛЬЗОВАТЕЛЕЙ
onSnapshot(collection(db, "users"), (snapshot) => {
    const select = document.getElementById('user-select');
    if (!select) return;
    let users = [];
    snapshot.forEach(d => {
        if(d.data().status === 'active') users.push({ id: d.id, name: d.data().name });
    });
    users.sort((a, b) => a.name.localeCompare(b.name));
    let html = `<option value="" disabled selected>${window.t('select_publisher')}</option>`;
    users.forEach(u => { html += `<option value="${u.id}|${u.name}">${u.name}</option>`; });
    select.innerHTML = html;
});

// 3. ЗАПРОСЫ
onSnapshot(query(collection(db, "requests"), orderBy("createdAt", "desc")), (snapshot) => {
    const list = document.getElementById('requests-list');
    let html = '';
    let count = 0;
    snapshot.forEach(docSnap => {
        const req = docSnap.data();
        if (req.status === 'new' && req.type === 'territory') {
            count++;
            const date = new Date(req.createdAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short'});
            html += `
                <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors">
                    <div>
                        <p class="text-xs font-bold text-slate-800">${req.userName}</p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${date}</p>
                    </div>
                    <div class="flex gap-1.5">
                        <button onclick="prepareIssue('${req.userId}', '${req.userName}', '${docSnap.id}')" title="${window.t('title_issue_terr')}" class="w-7 h-7 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors outline-none text-xs">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <button onclick="deleteRequest('${docSnap.id}')" title="${window.t('delete')}" class="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors outline-none text-xs">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            `;
        }
    });
    document.getElementById('requests-count').innerText = count;
    if(list) list.innerHTML = html || `<p class="text-slate-400 italic text-xs text-center py-4 bg-slate-50 rounded-xl">${window.t('no_new_requests_terr')}</p>`;
});

window.prepareIssue = async (userId, userName, reqId) => {
    const select = document.getElementById('user-select');
    select.value = `${userId}|${userName}`;
    document.getElementById('territory-number').focus();
    await deleteDoc(doc(db, "requests", reqId));
};

window.deleteRequest = async (id) => {
    if (confirm(window.t('confirm_delete_request'))) await deleteDoc(doc(db, "requests", id));
};

// 4. НАЗНАЧЕНИЕ
document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const userData = document.getElementById('user-select').value;
    const terrNum = document.getElementById('territory-number').value.trim();
    if (!userData || !terrNum) return alert(window.t('alert_select_user_num'));
    const btn = e.target;
    btn.innerText = window.t('saving'); btn.disabled = true;
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
        btn.innerHTML = `<svg class="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> ${window.t('success_tick')}`;
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = window.t('btn_assign'); btn.disabled = false; 
        }, 2000);
    } catch (err) { alert(window.t('error_general')); btn.disabled = false; btn.innerText = window.t('btn_assign'); }
});

// 5. ТАБЛИЦА
onSnapshot(query(collection(db, "territories"), orderBy("issuedAt", "desc")), (snapshot) => {
    const list = document.getElementById('territories-list');
    let html = '';
    snapshot.forEach(docSnap => {
        const terr = docSnap.data();
        const date = new Date(terr.issuedAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short', year: 'numeric'});
        html += `
            <tr class="hover:bg-slate-50 transition-colors user-row" data-search="${terr.number} ${terr.userName.toLowerCase()}">
                <td class="py-3 px-4 text-center">
                    <span class="bg-emerald-50 text-emerald-700 font-mono font-black border border-emerald-200 px-3 py-1.5 rounded-lg text-sm">${terr.number}</span>
                </td>
                <td class="py-3 px-4 font-bold text-slate-800 text-sm truncate">${terr.userName}</td>
                <td class="py-3 px-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">${date}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="returnTerritory('${docSnap.id}')" class="bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 ml-auto outline-none">
                        ${window.t('btn_returned')}
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    if(list) list.innerHTML = html || `<tr><td colspan="4" class="text-slate-400 italic text-sm text-center py-8">${window.t('all_terr_free')}</td></tr>`;
});

window.returnTerritory = async (id) => {
    if (confirm(window.t('confirm_return'))) {
        await deleteDoc(doc(db, "territories", id));
    }
};

const searchEl = document.getElementById('search-terr');
if(searchEl) {
    searchEl.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.user-row');
        rows.forEach(row => {
            if (row.getAttribute('data-search').includes(term)) row.style.display = '';
            else row.style.display = 'none';
        });
    });
}
