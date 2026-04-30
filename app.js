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
        btn.classList.remove('text-white'); btn.classList.add('text-slate-400');
        btn.querySelector('.icon-wrapper')?.classList.remove('bg-ui-active', 'text-white', 'shadow-lg', 'shadow-ui-active/30');
        btn.querySelector('.icon-wrapper')?.classList.add('bg-transparent');
    });
    
    if(btnElement) {
        btnElement.classList.remove('text-slate-400'); btnElement.classList.add('text-white');
        btnElement.querySelector('.icon-wrapper')?.classList.remove('bg-transparent');
        btnElement.querySelector('.icon-wrapper')?.classList.add('bg-ui-active', 'text-white', 'shadow-lg', 'shadow-ui-active/30');
    }
};

// МАГИЯ КНОПКИ ОТЧЕТА
window.submitReport = async () => {
    const fs = document.getElementById('report-fieldset');
    const btn = document.getElementById('submit-report-btn');

    if (!fs || !btn) return;

    if (fs.disabled) {
        fs.disabled = false;
        fs.classList.remove('opacity-50', 'grayscale-[50%]');
        btn.classList.replace('bg-slate-800', 'bg-ui-report');
        btn.classList.replace('hover:bg-slate-900', 'hover:opacity-90');
        btn.innerText = 'Отправить отчет';
    } else {
        const participated = document.getElementById('rep-participated')?.checked || false;
        const hours = document.getElementById('rep-hours')?.value || "";
        const pubs = document.getElementById('rep-pubs')?.value || "";
        const studies = document.getElementById('rep-studies')?.value || "";

        if (!participated && hours === "") return alert("Отметьте галочку 'Служил(а)' или введите часы!");
        
        btn.innerText = "Сохранение..."; 
        btn.disabled = true;

        try {
            await setDoc(doc(db, "reports", `${userId}_${strictMonthId}`), {
                userId, userName: currentUserData.name, group: currentUserData.group || "Без группы", month: currentMonthStr,
                participated, hours: Number(hours), pubs: Number(pubs), studies: Number(studies), submittedAt: new Date().toISOString()
            });
            const log = document.getElementById('last-report-log');
            if(log) log.innerText = `Сохранено: ${new Date().toLocaleString('ru-RU')}`;
            
            btn.classList.replace('bg-ui-report', 'bg-ui-success');
            btn.innerText = "Успешно ✔️";
            
            setTimeout(() => {
                fs.disabled = true;
                fs.classList.add('opacity-50', 'grayscale-[50%]');
                btn.classList.replace('bg-ui-success', 'bg-slate-800');
                btn.classList.replace('hover:opacity-90', 'hover:bg-slate-900');
                btn.innerText = "✏️ Изменить";
                btn.disabled = false;
            }, 2000);
        } catch (e) { 
            alert("Ошибка сети!"); 
            btn.disabled = false; 
            btn.innerText = "Отправить отчет"; 
        }
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
        
        let userRoles = currentUserData.roles || [];
        
        const profileAdminLinks = document.getElementById('profile-admin-links');
        const profileAdminBtn = document.getElementById('profile-admin-btn');
        const profileReportsBtn = document.getElementById('profile-reports-btn');
        const profileCalendarBtn = document.getElementById('profile-calendar-btn');
        const profileTerrBtn = document.getElementById('profile-terr-btn');
        const profileSchoolBtn = document.getElementById('profile-school-btn');
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

        if (userRoles.includes('Ответственный за участки') || hasFullAccess) {
            if(profileTerrBtn) { profileTerrBtn.classList.remove('hidden'); profileTerrBtn.classList.add('flex'); showAdminMenu = true; }
        } else {
            if(profileTerrBtn) { profileTerrBtn.classList.add('hidden'); profileTerrBtn.classList.remove('flex'); }
        }

        if (userRoles.includes('Ответственный за школу') || hasFullAccess) {
            if(profileSchoolBtn) { profileSchoolBtn.classList.remove('hidden'); profileSchoolBtn.classList.add('flex'); showAdminMenu = true; }
        } else {
            if(profileSchoolBtn) { profileSchoolBtn.classList.add('hidden'); profileSchoolBtn.classList.remove('flex'); }
        }

        if(profileAdminLinks) {
            if(showAdminMenu) { profileAdminLinks.classList.remove('hidden'); profileAdminLinks.classList.add('flex'); } 
            else { profileAdminLinks.classList.add('hidden'); profileAdminLinks.classList.remove('flex'); }
        }

        try { loadPersonalData(); } catch(e) { console.error("Error:", e); }
        try { loadProfileData(); } catch(e) { console.error("Error:", e); }
    }
});

async function loadProfileData() {
    const pName = document.getElementById('profile-name');
    const pRole = document.getElementById('profile-role');
    const pGroup = document.getElementById('profile-group');
    const pOverseer = document.getElementById('profile-overseer');

    if(pName) pName.innerText = currentUserData.name || "Имя";
    
    let roles = currentUserData.roles || ["Участник"];
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

function loadPersonalData() {
    // 0. Отчет
    onSnapshot(doc(db, "reports", `${userId}_${strictMonthId}`), (docSnap) => {
        if (docSnap.exists()) {
            const r = docSnap.data();
            const repP = document.getElementById('rep-participated'); if(repP) repP.checked = r.participated || false;
            const repH = document.getElementById('rep-hours'); if(repH) repH.value = r.hours || '';
            const repPub = document.getElementById('rep-pubs'); if(repPub) repPub.value = r.pubs || '';
            const repS = document.getElementById('rep-studies'); if(repS) repS.value = r.studies || '';
            const log = document.getElementById('last-report-log'); if(log) log.innerText = `Последняя запись: ${new Date(r.submittedAt).toLocaleString('ru-RU')}`;
            
            const btn = document.getElementById('submit-report-btn');
            if(btn && document.getElementById('report-fieldset')?.disabled) {
                btn.innerText = "✏️ Изменить";
            }
        }
    });

    // 1. Дежурства
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

    // 2. УМНЫЕ ЗАДАНИЯ (ШКОЛА) - Видят и Ученик, и Помощник!
    try {
        const tasksQuery = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
        onSnapshot(tasksQuery, (snapshot) => {
            const upList = document.getElementById('upcoming-tasks-list');
            const pastList = document.getElementById('past-tasks-list');
            if(!upList || !pastList) return;
            upList.innerHTML = ''; pastList.innerHTML = '';
            
            let upCount = 0, pastCount = 0;
            const today = new Date(); today.setHours(0,0,0,0);
            
            snapshot.forEach(docSnap => {
                const task = docSnap.data();
                
                // Фильтр: показываем только если я ученик ИЛИ я помощник
                if (task.userId === userId || task.assistant === currentUserData.name) {
                    const taskDate = new Date(task.date);
                    const isPast = taskDate < today;
                    
                    const isAssistant = task.assistant === currentUserData.name;
                    
                    // Формируем текст роли
                    let roleText = "";
                    if (isAssistant) {
                        roleText = `Помощник у <span class="text-sky-600 font-bold ml-1">${task.userName}</span>`;
                    } else {
                        roleText = `Выступление ${task.assistant ? `<span class="text-slate-500 font-medium text-[10px] uppercase ml-1 block md:inline">(Напарник: ${task.assistant})</span>` : ''}`;
                    }

                    // Данные задания
                    const cat = task.category || task.title; // поддержка старых записей
                    const num = task.taskNumber ? `<span class="text-[9px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded leading-none shrink-0">№ ${task.taskNumber}</span>` : '';
                    const les = task.lesson ? `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded leading-none shrink-0">Урок ${task.lesson}</span>` : '';

                    const cardHtml = `
                        <div class="p-4 bg-white rounded-2xl border ${isPast ? 'border-slate-100 opacity-60 grayscale' : 'border-sky-100 shadow-sm'} mb-3 flex items-center justify-between transition-all">
                            <div class="flex items-center gap-4 min-w-0 w-full">
                                <div class="flex flex-col items-center justify-center w-12 h-12 ${isPast ? 'bg-slate-50' : 'bg-sky-50'} rounded-xl shrink-0 border ${isPast ? 'border-slate-200' : 'border-sky-100'}">
                                    <span class="text-[8px] uppercase ${isPast ? 'text-slate-400' : 'text-sky-500'} font-bold leading-none mb-0.5 tracking-widest">${taskDate.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</span>
                                    <span class="text-xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-sky-700'}">${taskDate.getDate()}</span>
                                </div>
                                <div class="flex flex-col min-w-0 truncate pr-2">
                                    <div class="flex items-center gap-2 truncate mb-1.5">
                                        ${num}
                                        <span class="text-[10px] font-bold ${isPast ? 'text-slate-500' : 'text-sky-700'} uppercase tracking-widest truncate">${cat}</span>
                                        ${les}
                                    </div>
                                    <div class="font-black text-slate-800 text-sm truncate flex flex-wrap items-center">
                                        ${roleText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    if (!isPast) {
                        upCount++;
                        upList.innerHTML += cardHtml;
                    } else {
                        pastCount++;
                        pastList.innerHTML += cardHtml;
                    }
                }
            });
            
            if (upCount === 0) upList.innerHTML = '<p class="text-slate-400 text-sm italic py-2">У тебя пока нет активных заданий</p>';
            if (pastCount === 0) pastList.innerHTML = '<p class="text-slate-400 text-sm italic py-2">История пуста</p>';
        });
    } catch(e){}

    // 3. Участки
    try {
        const terrQuery = query(collection(db, "territories"), where("userId", "==", userId));
        onSnapshot(terrQuery, (snapshot) => {
            const container = document.getElementById('territories-container');
            if(!container) return;
            if (snapshot.empty) return container.innerHTML = '<p class="text-slate-400 text-sm italic py-4">У вас пока нет активных участков</p>';
            container.innerHTML = '';
            snapshot.forEach(docSnap => {
                const terr = docSnap.data();
                container.innerHTML += `
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div class="p-3 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                            <h3 class="font-black text-slate-800 text-sm">Участок № ${terr.number}</h3>
                            <span class="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase">Активен</span>
                        </div>
                        <div class="w-full h-32 bg-slate-50 flex items-center justify-center relative">
                            <span class="text-3xl absolute opacity-10">🗺️</span>
                        </div>
                    </div>
                `;
            });
        });
    } catch(e) {}

    // 4. Новости
    try {
        onSnapshot(collection(db, "section_content"), (snapshot) => {
            let newsHTML = '';
            snapshot.forEach(docSnap => {
                const item = docSnap.data();
                if(item.section === 'news') {
                    newsHTML += `
                    <div class="p-3 mb-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                        <p class="text-slate-700 whitespace-pre-wrap text-[11px] md:text-xs leading-relaxed">${item.text}</p>
                    </div>`;
                }
            });
            const contentNews = document.getElementById('content-news');
            if(contentNews) contentNews.innerHTML = newsHTML || '<p class="text-slate-400 italic text-xs">Пока пусто</p>';
        });
    } catch(e) {}

    // 5. МОНОЛИТНЫЙ КАЛЕНДАРЬ
    try {
        const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
        onSnapshot(eventsQuery, (snapshot) => {
            const container = document.getElementById('calendar-events');
            if (!container) return; 
            let html = '';
            const today = new Date(); today.setHours(0,0,0,0);
            let displayedCount = 0; 
            const MAX_EVENTS = 3; 

            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                const evDate = new Date(ev.date);
                const evGroup = ev.group || "Все";
                
                if (evDate >= today && displayedCount < MAX_EVENTS) {
                    displayedCount++; 
                    const groupBadge = evGroup !== "Все" ? `<span class="bg-indigo-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase leading-none">Гр. ${evGroup}</span>` : '';
                    
                    html += `
                        <div class="flex items-center px-4 md:px-5 py-3 md:py-4 hover:bg-slate-800/50 transition-colors w-full cursor-default ${displayedCount > 1 ? 'border-t border-slate-700/50' : ''}">
                            <div class="flex items-center gap-4 w-full">
                                <div class="flex flex-col items-center justify-center w-12 shrink-0">
                                    <span class="text-[9px] uppercase text-rose-500 font-bold leading-none mb-1 tracking-widest">${evDate.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</span>
                                    <span class="text-xl font-black leading-none text-white">${evDate.getDate()}</span>
                                </div>
                                <div class="flex flex-col flex-grow truncate">
                                    <div class="flex items-center gap-2 truncate">
                                        ${ev.time ? `<span class="text-sm font-bold text-slate-300 shrink-0">${ev.time}</span>` : ''}
                                        <span class="font-bold text-sm md:text-base text-white truncate">${ev.title}</span>
                                        ${groupBadge}
                                    </div>
                                    ${ev.leader ? `<div class="text-[10px] uppercase mt-1 tracking-wider truncate text-slate-400 font-medium">Вед: <span class="text-rose-400 font-bold">${ev.leader}</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            
            if (snapshot.size > MAX_EVENTS && displayedCount === MAX_EVENTS) {
                html += `<div class="bg-slate-900/30 py-2 border-t border-slate-700/50"><p class="text-center text-[9px] text-slate-500 uppercase tracking-widest">Показаны ближайшие события</p></div>`;
            }

            container.innerHTML = html || '<p class="p-6 text-sm text-slate-500 italic text-center">Нет предстоящих событий</p>';
        });
    } catch(e) { console.error("Ошибка календаря:", e); }
}

window.requestTerritory = async (btn) => {
    btn.innerText = "..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "territory", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.innerText = "Успешно ✔️";
        setTimeout(() => { btn.innerText = "Попросить"; btn.disabled = false; }, 3000);
    } catch (e) { alert("Ошибка!"); btn.innerText = "Попросить"; btn.disabled = false; }
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
