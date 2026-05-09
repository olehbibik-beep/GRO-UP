import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "stand_admin_title": "Стенды (Админ)",
        "btn_back": "Назад",
        "requests_title": "Заявки на стенд",
        "approved_users": "Одобренные возвещатели",
        "settings_stats": "Настройки и статистика",
        "future_module": "Здесь будет блокировка дней и статистика стенда",
        "no_requests": "Нет новых заявок",
        "no_approved": "Пока нет одобренных возвещателей",
        "btn_approve": "Одобрить",
        "btn_reject": "Отклонить",
        "btn_revoke": "Забрать доступ",
        "confirm_revoke": "Точно забрать допуск к стенду у этого возвещателя?",
        "success": "Успешно!",
        "error_general": "Произошла ошибка!"
    },
    cs: {
        "stand_admin_title": "Stojany (Admin)",
        "btn_back": "Zpět",
        "requests_title": "Žádosti o stojan",
        "approved_users": "Schválení zvěstovatelé",
        "settings_stats": "Nastavení a statistika",
        "future_module": "Zde bude blokování dnů a statistika stojanů",
        "no_requests": "Žádné nové žádosti",
        "no_approved": "Zatím žádní schválení zvěstovatelé",
        "btn_approve": "Schválit",
        "btn_reject": "Zamítnout",
        "btn_revoke": "Odebrat přístup",
        "confirm_revoke": "Opravdu odebrat přístup ke stojanu tomuto zvěstovateli?",
        "success": "Úspěšně!",
        "error_general": "Došlo k chybě!"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
window.t = (key) => dict[currentLang][key] || key;

document.querySelectorAll('[data-lang]').forEach(el => {
    el.innerHTML = window.t(el.getAttribute('data-lang'));
});

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

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

// ПРОВЕРКА ПРАВ
getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isStandAdmin = roles.includes("Ответственный за стенды") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!isStandAdmin) {
        window.location.href = 'index.html';
    }
});

// 1. ЗАГРУЗКА ЗАЯВОК (Только type = 'stand')
const reqQuery = query(collection(db, "requests"), where("type", "==", "stand"));
onSnapshot(reqQuery, (snapshot) => {
    const list = document.getElementById('stand-requests-list');
    const countEl = document.getElementById('stand-req-count');
    
    let html = '';
    let count = 0;

    // Сортируем вручную по дате, так как составные индексы без создания в Firebase могут выдавать ошибку
    const reqs = [];
    snapshot.forEach(docSnap => reqs.push({ id: docSnap.id, ...docSnap.data() }));
    reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    reqs.forEach(req => {
        count++;
        html += `
            <div class="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                <div class="flex flex-col">
                    <p class="font-black text-slate-800 text-sm leading-tight">${req.userName}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Хочет служить со стендом</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="approveStand('${req.id}', '${req.userId}')" title="${window.t('btn_approve')}" class="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm outline-none">✔️</button>
                    <button onclick="rejectStand('${req.id}')" title="${window.t('btn_reject')}" class="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm outline-none">✖</button>
                </div>
            </div>
        `;
    });

    countEl.innerText = count;
    list.innerHTML = html || `<p class="text-slate-400 text-xs text-center py-4 italic">${window.t('no_requests')}</p>`;
});

// 2. ЗАГРУЗКА ОДОБРЕННЫХ ПОЛЬЗОВАТЕЛЕЙ
onSnapshot(collection(db, "users"), (snapshot) => {
    const list = document.getElementById('approved-users-list');
    let html = '';
    let count = 0;

    // Вытягиваем всех активных пользователей, у которых есть роль "Служение со стендом"
    const users = [];
    snapshot.forEach(docSnap => {
        const u = docSnap.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Служение со стендом')) {
            users.push({ id: docSnap.id, name: u.name });
        }
    });

    // Сортировка по алфавиту
    users.sort((a, b) => a.name.localeCompare(b.name));

    users.forEach(u => {
        count++;
        html += `
            <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span class="font-bold text-slate-700 text-sm truncate pr-2">${u.name}</span>
                <button onclick="removeStandAccess('${u.id}')" class="shrink-0 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest rounded transition-colors outline-none shadow-sm">
                    ${window.t('btn_revoke')}
                </button>
            </div>
        `;
    });

    list.innerHTML = html || `<p class="col-span-full text-slate-400 text-xs text-center py-4 italic">${window.t('no_approved')}</p>`;
});

// ГЛОБАЛЬНЫЕ ФУНКЦИИ
window.approveStand = async (reqId, userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const roles = userSnap.data().roles || [];
            if (!roles.includes("Служение со стендом")) {
                roles.push("Служение со стендом");
                await updateDoc(userRef, { roles: roles });
            }
        }
        await deleteDoc(doc(db, "requests", reqId));
        window.showToast(window.t('success'));
    } catch (e) {
        alert(window.t('error_general'));
    }
};

window.rejectStand = async (reqId) => {
    try {
        await deleteDoc(doc(db, "requests", reqId));
    } catch (e) {
        alert(window.t('error_general'));
    }
};

window.removeStandAccess = async (userId) => {
    if (confirm(window.t('confirm_revoke'))) {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                let roles = userSnap.data().roles || [];
                roles = roles.filter(r => r !== "Служение со стендом");
                await updateDoc(userRef, { roles: roles });
                window.showToast(window.t('success'));
            }
        } catch (e) {
            alert(window.t('error_general'));
        }
    }
};
