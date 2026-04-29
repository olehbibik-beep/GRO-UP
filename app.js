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
document.getElementById('current-month-label')?.setAttribute('innerText', currentMonthStr);

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
        if(pendingScreen) { pendingScreen.classList.remove('hidden'); pendingScreen.classList.add('flex'); }
        if(mainDashboard) { mainDashboard.classList.add('hidden'); mainDashboard.classList.remove('block'); }
    } else if (currentUserData.status === 'blocked') {
        document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">ДОСТУП ЗАКРЫТ</h1></div>`;
    } else {
        if(pendingScreen) { pendingScreen.classList.add('hidden'); pendingScreen.classList.remove('flex'); }
        if(mainDashboard) { mainDashboard.classList.remove('hidden'); mainDashboard.classList.add('block'); }
        
        let userRoles = currentUserData.roles || (currentUserData.role ? [currentUserData.role] : []);
        
        const profileAdminLinks = document.getElementById('profile-admin-links');
        const profileAdminBtn = document.getElementById('profile-admin-btn');
        const profileReportsBtn = document.getElementById('profile-reports-btn');
        const profileCalendarBtn = document.getElementById('profile-calendar-btn');
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
            if(profileCalendarBtn) { profileCalendarBtn.classList.remove('hidden'); profileCalendarBtn.classList.add('flex'); }
        } else {
            if(profileReportsBtn) { profileReportsBtn.classList.add('hidden'); profileReportsBtn.classList.remove('flex'); }
            if(profileCalendarBtn) { profileCalendarBtn.classList.add('hidden'); profileCalendarBtn.classList.remove('flex'); }
        }

        if(profileAdminLinks) {
            if(showAdminMenu) { profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('flex'); } 
            else { profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('flex'); }
        }

        try { loadPersonalData(); } catch(e) { console.error("loadPersonalData Error:", e); }
        try { loadProfileData(); } catch(e) { console.error("loadProfileData Error:", e); }
    }
});

async function loadProfileData() {
    const pName = document.getElementById('profile-name');
    const pRole = document.getElementById('profile-role');
    const pGroup = document.getElementById('profile-group');
    const pOverseer = document.getElementById('profile-overseer');

    if(pName) pName.innerText = currentUserData.name || "Имя";
    
    let roles = currentUserData.roles || (currentUserData.role ? [currentUserData.role] : ["Участник"]);
    if(pRole) pRole.innerText = roles.join(', ');
    
    const myGroup = currentUserData.group || "Без группы";
    if(pGroup) pGroup.innerText = `№ ${myGroup}`;

    try {
        if (myGroup !== "Без группы" && pOverseer) {
            const q = query(collection(db, "users"), where("group", "==", myGroup), where("roles", "array-contains", "Надзиратель группы"));
            const snap = await getDocs(q);
            pOverseer.innerText = snap.empty ? "Не назначен" : snap.docs[0].data().name;
        } else if (pOverseer) { 
            pOverseer.innerText = "-"; 
        }
    } catch(e) { 
        if(pOverseer) pOverseer.innerText = "Ошибка БД"; 
    }
}

window.submitReport = async () => {
    const participated = document.getElementById('rep-participated')?.checked || false;
    const hours = document.getElementById('rep-hours')?.value || "";
    const pubs = document.getElementById('rep-pubs')?.value || "";
    const studies = document.getElementById('rep-studies')?.value || "";
    const btn = document.getElementById('submit-report-btn');

    if (!participated && hours === "") return alert("Отметьте галочку 'Служил(а)' или введите часы!");
    if(btn) { btn.innerText = "Сохранение..."; btn.disabled = true; }

    try {
        await setDoc(doc(db, "reports", `${userId}_${strictMonthId}`), {
            userId, userName: currentUserData.name, group: currentUserData.group || "Без группы", month: currentMonthStr,
            participated, hours: Number(hours), pubs: Number(pubs), studies: Number(studies), submittedAt: new Date().toISOString()
        });
        const log = document.getElementById('last-report-log');
        if(log) log.innerText = `Сохранено: ${new Date().toLocaleString('ru-RU')}`;
        
        if(btn) {
            btn.classList.replace('bg-purple-600', 'bg-emerald-500'); btn.classList.replace('hover:bg-purple-700', 'hover:bg-emerald-600');
            btn.innerText = "Перезаписано! ✔️";
            setTimeout(() => {
                btn.classList.replace('bg-emerald-500', 'bg-purple-600'); btn.classList.replace('hover:bg-emerald-600', 'hover:bg-purple-700');
                btn.innerText = "Отправить"; btn.disabled = false;
            }, 3000);
        }
    } catch (e) { alert("Ошибка!"); if(btn) btn.disabled = false; }
};

function loadPersonalData() {
    onSnapshot(doc(db, "reports", `${userId}_${strictMonthId}`), (docSnap) => {
        if (docSnap.exists()) {
            const r = docSnap.data();
            const repP = document.getElementById('rep-participated'); if(repP) repP.checked = r.participated || false;
            const repH = document.getElementById('rep-hours'); if(repH) repH.value = r.hours || '';
            const repPub = document.getElementById('rep-pubs'); if(repPub) repPub.value = r.pubs || '';
            const repS = document.getElementById('rep-studies'); if(repS) repS.value = r.studies || '';
            const log = document.getElementById('last-report-log'); if(log) log.innerText = `Последняя запись: ${new Date(r.submittedAt).toLocaleString('ru-RU')}`;
            const btn = document.getElementById('submit-report-btn'); if(btn) btn.innerText = "Обновить";
        }
    });

    try {
        const dutiesQuery = query(collection(db, "duties"), where("userId", "==", userId));
        onSnapshot(dutiesQuery, (snapshot) => {
            const card = document.getElementById('upcoming-duty-card');
            if (!card) return;
            if (snapshot.empty) { card.classList.add('hidden'); card.classList.remove('flex'); return; }
            const duty = snapshot.docs[0].data();
            const titleEl = document.getElementById('duty-title'); if(titleEl) titleEl.innerText = duty.type;
            const dateEl = document.getElementById('duty-date'); if(dateEl) dateEl.innerText = duty.dateRange;
            card.classList.remove('hidden'); card.classList.add('flex');
        });
    } catch(e) {}

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
    } catch(e){}

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
    } catch(e) {}

    try {
        onSnapshot(collection(db, "section_content"), (snapshot) => {
            let newsHTML = '';
            snapshot.forEach(docSnap => {
                const item = docSnap.data();
                if(item.section === 'news') {
                    newsHTML += `
                    <div class="p-3 mb-2 bg-slate-50 border rounded-xl relative group hover:shadow-md transition-shadow">
                        <p class="text-slate-700 whitespace-pre-wrap">${item.text}</p>
                    </div>`;
                }
            });
            const contentNews = document.getElementById('content-news');
            if(contentNews) contentNews.innerHTML = newsHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
        });
    } catch(e) {}

    // 5. Календарь (С ТЕМНОЙ ТЕМОЙ, ВРЕМЕНЕМ И ВЕДУЩИМ)
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
                const evGroup = ev.group || "Все";
                
                if (evDate >= today) {
                    const groupBadge = evGroup !== "Все" ? `<span class="bg-indigo-500 text-white px-1.5 py-0.5 rounded text-[9px] ml-2 border border-indigo-400 shadow-sm leading-none">Гр. ${evGroup}</span>` : '';
                    const timeBadge = ev.time ? `<span class="text-slate-300 text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded leading-none border border-slate-600">${ev.time}</span>` : '';
                    const leaderText = ev.leader ? `<p class="text-[9px] text-slate-400 font-medium uppercase mt-0.5 leading-none">Вед: <span class="text-rose-400 font-bold">${ev.leader}</span></p>` : '';
                    
                    html += `
                        <div class="flex items-start gap-3 p-3 bg-slate-700/50 rounded-xl mb-2 border border-slate-600/50 relative overflow-hidden">
                            <div class="bg-slate-800 text-slate-100 font-black p-2 rounded-lg text-center min-w-[45px] shadow-inner border border-slate-600 flex flex-col justify-center">
                                <span class="block text-[10px] uppercase text-rose-400 leading-none mb-1">${evDate.toLocaleDateString('ru-RU', { month: 'short' })}</span>
                                <span class="block text-xl leading-none">${evDate.getDate()}</span>
                            </div>
                            <div class="flex-grow pt-0.5">
                                <p class="font-bold text-white text-sm leading-tight flex items-center flex-wrap gap-1">${ev.title} ${groupBadge} ${timeBadge}</p>
                                ${leaderText}
                            </div>
                        </div>
                    `;
                }
            });
            container.innerHTML = html || '<p class="text-sm text-slate-500 italic">В ближайшее время событий нет.</p>';
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

window.openProfileModal = () => {
    const m = document.getElementById('profile-modal');
    if(m) m.classList.replace('hidden', 'flex');
}
window.closeModals = () => {
    const m = document.getElementById('profile-modal');
    if(m) m.classList.replace('flex', 'hidden');
};
window.logout = () => { localStorage.clear(); window.location.href = 'login.html'; };
