import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const TOP_ROLES = ["Владелец", "Админ"]; 
const OVERSEER_ROLES = ["Владелец", "Админ", "Надзиратель группы"];
let currentUserData = null; 
let hasFullAccess = false;

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const currentMonthStr = d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
document.getElementById('current-month-label').innerText = currentMonthStr;

window.switchTab = (tabId, btnElement) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) targetTab.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-indigo-600'); btn.classList.add('text-slate-400');
        btn.firstElementChild.classList.remove('bg-indigo-100');
    });
    
    if(btnElement) {
        btnElement.classList.remove('text-slate-400'); btnElement.classList.add('text-indigo-600');
        btnElement.firstElementChild.classList.add('bg-indigo-100');
    }
};

onSnapshot(doc(db, "users", userId), async (docSnap) => {
    if (!docSnap.exists()) { window.logout(); return; }
    currentUserData = docSnap.data();

    const pendingScreen = document.getElementById('pending-screen');
    const mainDashboard = document.getElementById('main-dashboard');

    if (currentUserData.status === 'pending') {
        pendingScreen.classList.remove('hidden'); pendingScreen.classList.add('flex');
        mainDashboard.classList.add('hidden'); mainDashboard.classList.remove('block');
    } else if (currentUserData.status === 'blocked') {
        document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">ДОСТУП ЗАКРЫТ</h1></div>`;
    } else {
        pendingScreen.classList.add('hidden'); pendingScreen.classList.remove('flex');
        mainDashboard.classList.remove('hidden'); mainDashboard.classList.add('block');
        
        let userRoles = currentUserData.roles || (currentUserData.role ? [currentUserData.role] : []);
        
        // --- УПРАВЛЕНИЕ КНОПКАМИ В ПРОФИЛЕ ---
        const profileAdminLinks = document.getElementById('profile-admin-links');
        const profileAdminBtn = document.getElementById('profile-admin-btn');
        const profileReportsBtn = document.getElementById('profile-reports-btn');
        let showAdminMenu = false;

        if (userRoles.some(r => TOP_ROLES.includes(r))) {
            hasFullAccess = true;
            if(profileAdminBtn) { profileAdminBtn.classList.remove('hidden'); profileAdminBtn.classList.add('flex'); showAdminMenu = true; }
        } else {
            hasFullAccess = false;
            if(profileAdminBtn) { profileAdminBtn.classList.add('hidden'); profileAdminBtn.classList.remove('flex'); }
        }

        if (userRoles.some(r => OVERSEER_ROLES.includes(r))) {
            if(profileReportsBtn) { profileReportsBtn.classList.remove('hidden'); profileReportsBtn.classList.add('flex'); showAdminMenu = true; }
        } else {
            if(profileReportsBtn) { profileReportsBtn.classList.add('hidden'); profileReportsBtn.classList.remove('flex'); }
        }

        if(profileAdminLinks) {
            if(showAdminMenu) { profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('flex'); } 
            else { profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('flex'); }
        }

        try { loadPersonalData(); } catch(e) { console.error(e); }
        try { loadProfileData(); } catch(e) { console.error(e); }
    }
});

async function loadProfileData() {
    document.getElementById('profile-name').innerText = currentUserData.name || "Имя";
    let roles = currentUserData.roles || (currentUserData.role ? [currentUserData.role] : ["Участник"]);
    document.getElementById('profile-role').innerText = roles.join(', ');
    
    const myGroup = currentUserData.group || "Без группы";
    document.getElementById('profile-group').innerText = `№ ${myGroup}`;

    try {
        if (myGroup !== "Без группы") {
            const q = query(collection(db, "users"), where("group", "==", myGroup), where("roles", "array-contains", "Надзиратель группы"));
            const snap = await getDocs(q);
            document.getElementById('profile-overseer').innerText = snap.empty ? "Не назначен" : snap.docs[0].data().name;
        } else { document.getElementById('profile-overseer').innerText = "-"; }
    } catch(e) { document.getElementById('profile-overseer').innerText = "Ошибка БД"; }
}

window.submitReport = async () => {
    const participated = document.getElementById('rep-participated').checked;
    const hours = document.getElementById('rep-hours').value;
    const pubs = document.getElementById('rep-pubs').value;
    const studies = document.getElementById('rep-studies').value;
    const btn = document.getElementById('submit-report-btn');

    if (!participated && hours === "") return alert("Отметьте галочку 'Участвовал' или введите часы!");
    btn.innerText = "Сохранение..."; btn.disabled = true;

    try {
        await setDoc(doc(db, "reports", `${userId}_${strictMonthId}`), {
            userId, userName: currentUserData.name, group: currentUserData.group || "Без группы", month: currentMonthStr,
            participated, hours: Number(hours), pubs: Number(pubs), studies: Number(studies), submittedAt: new Date().toISOString()
        });
        document.getElementById('last-report-log').innerText = `Сохранено: ${new Date().toLocaleString('ru-RU')}`;
        btn.classList.replace('bg-purple-200/50', 'bg-emerald-500'); btn.classList.replace('text-purple-800', 'text-white');
        btn.innerText = "Перезаписано! ✔️";
        setTimeout(() => {
            btn.classList.replace('bg-emerald-500', 'bg-purple-200/50'); btn.classList.replace('text-white', 'text-purple-800');
            btn.innerText = "Обновить данные"; btn.disabled = false;
        }, 3000);
    } catch (e) { alert("Ошибка!"); btn.disabled = false; }
};

function loadPersonalData() {
    onSnapshot(doc(db, "reports", `${userId}_${strictMonthId}`), (docSnap) => {
        if (docSnap.exists()) {
            const r = docSnap.data();
            document.getElementById('rep-participated').checked = r.participated || false;
            document.getElementById('rep-hours').value = r.hours || '';
            document.getElementById('rep-pubs').value = r.pubs || '';
            document.getElementById('rep-studies').value = r.studies || '';
            document.getElementById('last-report-log').innerText = `Последняя запись: ${new Date(r.submittedAt).toLocaleString('ru-RU')}`;
            document.getElementById('submit-report-btn').innerText = "Обновить данные";
        }
    });

    try {
        const dutiesQuery = query(collection(db, "duties"), where("userId", "==", userId));
        onSnapshot(dutiesQuery, (snapshot) => {
            const card = document.getElementById('upcoming-duty-card');
            if (!card) return;
            if (snapshot.empty) { card.classList.add('hidden'); card.classList.remove('flex'); return; }
            const duty = snapshot.docs[0].data();
            document.getElementById('duty-title').innerText = duty.type;
            document.getElementById('duty-date').innerText = duty.dateRange;
            card.classList.remove('hidden'); card.classList.add('flex');
        });
    } catch(e) { console.error(e); }

    try {
        const tasksQuery = query(collection(db, "personal_tasks"), where("userId", "==", userId));
        onSnapshot(tasksQuery, (snapshot) => {
            const upList = document.getElementById('upcoming-tasks-list');
            const pastList = document.getElementById('past-tasks-list');
            if(!upList || !pastList) return;
            upList.innerHTML = ''; pastList.innerHTML = '';
            let upCount = 0, pastCount = 0;
            const today = new Date(); today.setHours(0,0,0,0);
            snapshot.forEach(docSnap => {
                const task = docSnap.data();
                const taskDate = new Date(task.date);
                if (taskDate >= today) {
                    upCount++;
                    upList.innerHTML += `<div class="p-4 bg-sky-50 rounded-2xl border border-sky-200 mb-3 shadow-sm"><p class="font-black text-sky-900 text-lg">${task.title}</p><p class="text-sm font-bold text-sky-600 mt-1">📅 ${taskDate.toLocaleDateString('ru-RU')}</p></div>`;
                } else {
                    pastCount++;
                    pastList.innerHTML += `<div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-2 opacity-70 grayscale"><p class="font-bold text-slate-600">${task.title}</p><p class="text-xs text-slate-400 mt-1">Выполнено: ${taskDate.toLocaleDateString('ru-RU')}</p></div>`;
                }
            });
            if (upCount === 0) upList.innerHTML = '<p class="text-slate-400 text-sm italic">Нет активных заданий</p>';
            if (pastCount === 0) pastList.innerHTML = '<p class="text-slate-400 text-sm italic">История пуста</p>';
        });
    } catch(e){ console.error(e); }

    try {
        const terrQuery = query(collection(db, "territories"), where("userId", "==", userId));
        onSnapshot(terrQuery, (snapshot) => {
            const container = document.getElementById('territories-container');
            if(!container) return;
            if (snapshot.empty) return container.innerHTML = '<p class="text-slate-400 text-sm italic text-center py-10">У вас пока нет активных участков</p>';
            container.innerHTML = '';
            snapshot.forEach(docSnap => {
                const terr = docSnap.data();
                container.innerHTML += `
                    <div class="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col">
                        <div class="p-4 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/30">
                            <h3 class="font-black text-emerald-900 text-xl">Участок № ${terr.number}</h3>
                            <span class="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg uppercase">Активен</span>
                        </div>
                        <div class="w-full h-48 bg-slate-100 flex items-center justify-center relative">
                            <span class="text-4xl absolute opacity-20">🗺️</span>
                            <p class="text-xs text-slate-400 font-bold z-10 uppercase tracking-widest border border-slate-300 px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm">Место для карты</p>
                        </div>
                        <div class="p-4 bg-white text-xs text-slate-400 text-center">Выдан: ${new Date(terr.issuedAt).toLocaleDateString('ru-RU')}</div>
                    </div>
                `;
            });
        });
    } catch(e) { console.error(e); }

    try {
        onSnapshot(collection(db, "section_content"), (snapshot) => {
            let newsHTML = '';
            snapshot.forEach(docSnap => {
                const item = docSnap.data();
                if(item.section === 'news') {
                    newsHTML += `
                    <div class="p-4 bg-slate-50 border rounded-2xl relative group hover:shadow-md transition-shadow">
                        <p class="text-slate-700 whitespace-pre-wrap">${item.text}</p>
                    </div>`;
                }
            });
            const contentNews = document.getElementById('content-news');
            if(contentNews) contentNews.innerHTML = newsHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
        });
    } catch(e) { console.error(e); }

    try {
        const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
        onSnapshot(eventsQuery, (snapshot) => {
            const container = document.getElementById('calendar-events');
            if (!container) return; 
            let html = '';
            const today = new Date(); today.setHours(0,0,0,0);
            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                const evDate = new Date(ev.date);
                if (evDate >= today) {
                    html += `
                        <div class="flex items-center gap-4 p-3 bg-rose-50 rounded-2xl border border-rose-100 mb-2">
                            <div class="bg-rose-200 text-rose-700 font-black p-2 rounded-xl text-center min-w-[50px]">
                                <span class="block text-xl leading-none">${evDate.getDate()}</span>
                            </div>
                            <div>
                                <p class="font-bold text-rose-900">${ev.title}</p>
                                <p class="text-xs text-rose-600 font-bold">${evDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                    `;
                }
            });
            container.innerHTML = html || '<p class="text-sm text-slate-400 italic">В ближайшее время событий нет.</p>';
        });
    } catch(e) { console.error("Ошибка календаря:", e); }
}

window.requestTerritory = async (btn) => {
    btn.innerText = "Отправка..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "territory", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.innerText = "Запрос отправлен! ✔️";
        setTimeout(() => { btn.innerText = "Попросить участок"; btn.disabled = false; }, 3000);
    } catch (e) { alert("Ошибка!"); btn.innerText = "Попросить участок"; btn.disabled = false; }
};

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
window.closeModals = () => {
    document.getElementById('profile-modal').classList.replace('flex', 'hidden');
    const addModal = document.getElementById('add-modal');
    if(addModal) addModal.classList.replace('flex', 'hidden');
};
window.logout = () => { localStorage.clear(); window.location.href = 'login.html'; };
