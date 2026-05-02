// 1. ВСЕ ИМПОРТЫ СТРОГО НАВЕРХУ
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where, orderBy, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

// 2. КОНФИГ И ИНИЦИАЛИЗАЦИЯ
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
const messaging = getMessaging(app);

enableIndexedDbPersistence(db).catch(() => {});

const userId = localStorage.getItem('userId');
if (!userId) window.location.href = 'login.html';

// ==========================================
// ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ ВСПЛЫВАШЕК (TOASTS)
// ==========================================
window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'warning' ? 'bg-amber-500' : 'bg-indigo-600';
    toast.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('-translate-y-10', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

// ==========================================
// ЛОГИКА PUSH-УВЕДОМЛЕНИЙ
// ==========================================
window.setupNotifications = async () => {
    try {
        if (!('Notification' in window)) {
            alert("❌ Уведомления не поддерживаются на этом устройстве.");
            return;
        }
        if (Notification.permission === 'denied') {
            alert("🔒 Уведомления заблокированы браузером!\n\nРазрешите их в настройках браузера.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            const token = await getToken(messaging, { 
                vapidKey: 'BEdzEcHp_7Ero4qy1TulERNB7KDAymZBty7omUcHU2SNlMGTAwPM_MAO7qriZsmL-8ehVsU5pX2OtemKQhC-Tqk',
                serviceWorkerRegistration: registration 
            });

            if (token) {
                await updateDoc(doc(db, "users", userId), { pushToken: token });
                alert("✅ Уведомления успешно включены!");
                const pushBtn = document.getElementById('push-btn');
                if (pushBtn) pushBtn.style.display = 'none';
            }
        }
    } catch (error) { console.error(error); }
};

onMessage(messaging, (payload) => {
    console.log('Пришло уведомление:', payload.data);
});

// ==========================================
// ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ
// ==========================================
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
        btn.classList.remove('text-white'); btn.classList.add('text-slate-500');
    });
    
    if(btnElement) {
        btnElement.classList.remove('text-slate-500'); btnElement.classList.add('text-white');
    }
};

window.submitReport = async () => {
    const fs = document.getElementById('report-fieldset');
    const btn = document.getElementById('submit-report-btn');
    if (!fs || !btn) return;

    if (fs.disabled) {
        fs.disabled = false;
        fs.classList.remove('opacity-50', 'grayscale-[50%]');
        btn.classList.replace('bg-slate-800', 'bg-ui-report');
        btn.innerText = 'Отправить отчет';
    } else {
        const participated = document.getElementById('rep-participated')?.checked || false;
        const hours = document.getElementById('rep-hours')?.value || "";
        const pubs = document.getElementById('rep-pubs')?.value || "";
        const studies = document.getElementById('rep-studies')?.value || "";

        if (!participated && hours === "") return alert("Отметьте галочку 'Служил(а)' или введите часы!");
        
        btn.innerText = "Сохранение..."; btn.disabled = true;

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
                btn.innerText = "✏️ Изменить";
                btn.disabled = false;
            }, 2000);
        } catch (e) { alert("Ошибка сети!"); btn.disabled = false; btn.innerText = "Отправить отчет"; }
    }
};

onSnapshot(doc(db, "users", userId), async (docSnap) => {
    if (!docSnap.exists()) { if (navigator.onLine) window.logout(); return; }
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
        
        const pushBtn = document.getElementById('push-btn');
        if (pushBtn) {
            if (!currentUserData.pushToken) pushBtn.style.display = 'flex';
            else pushBtn.style.display = 'none';
        }

        const profileAdminLinks = document.getElementById('profile-admin-links');
        const profileAdminBtn = document.getElementById('profile-admin-btn');
        const profileReportsBtn = document.getElementById('profile-reports-btn');
        const profileCalendarBtn = document.getElementById('profile-calendar-btn');
        const profileDutiesBtn = document.getElementById('profile-duties-btn');
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
            if(profileDutiesBtn) { profileDutiesBtn.classList.remove('hidden'); profileDutiesBtn.classList.add('flex'); }
        } else {
            if(profileReportsBtn) { profileReportsBtn.classList.add('hidden'); profileReportsBtn.classList.remove('flex'); }
            if(profileCalendarBtn) { profileCalendarBtn.classList.add('hidden'); profileCalendarBtn.classList.remove('flex'); }
            if(profileDutiesBtn) { profileDutiesBtn.classList.add('hidden'); profileDutiesBtn.classList.remove('flex'); }
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

        const addNewsBox = document.getElementById('add-news-box');
        if (addNewsBox) {
            if (userRoles.includes('Админ') || userRoles.includes('Владелец') || userRoles.includes('Старейшина')) {
                addNewsBox.classList.remove('hidden');
            } else {
                addNewsBox.classList.add('hidden');
            }
        }

        try { loadPersonalData(); } catch(e) { console.error("Error:", e); }
        try { loadProfileData(); } catch(e) { console.error("Error:", e); }
    }
});

async function loadProfileData() {
    const pName = document.getElementById('profile-name');
    const pGroup = document.getElementById('profile-group');
    const pOverseer = document.getElementById('profile-overseer');

    if(pName) pName.innerText = currentUserData.name || "Имя";
    
    let roles = currentUserData.roles || ["Возвещатель"];
    const rolesContainer = document.getElementById('profile-roles-container');
    if (rolesContainer) {
        rolesContainer.innerHTML = roles.map(r => {
            let colorClass = "bg-slate-100 text-slate-500 border border-slate-200"; 
            if(r === "Старейшина") colorClass = "bg-amber-100 text-amber-700 border border-amber-200";
            else if(r === "Помощник собрания") colorClass = "bg-sky-100 text-sky-700 border border-sky-200";
            else if(r === "Пионер") colorClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
            else if(r === "Админ" || r === "Владелец") colorClass = "bg-rose-100 text-rose-700 border border-rose-200";
            
            if(["Ответственный за участки", "Ответственный за школу", "Участник школы", "Надзиратель группы"].includes(r)) return '';
            return `<span class="inline-block px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${colorClass}">${r}</span>`;
        }).join('');
    }
    
    onSnapshot(doc(db, "settings", "congregation"), (docSnap) => {
        const congEl = document.getElementById('profile-congregation');
        if (congEl) {
            if(docSnap.exists() && docSnap.data().name) congEl.innerText = `Собрание: ${docSnap.data().name}`;
            else congEl.innerText = `Собрание: МАРИАНСКИЕ ЛАЗНЕ`;
        }
    });

    const myGroup = currentUserData.group || "Без группы";
    if(pGroup) pGroup.innerText = `№ ${myGroup}`;

    try {
        if (myGroup !== "Без группы" && pOverseer) {
            const q = query(collection(db, "users"), where("group", "==", myGroup), where("roles", "array-contains", "Надзиратель группы"));
            const snap = await getDocs(q);
            pOverseer.innerText = snap.empty ? "Не назначен" : snap.docs[0].data().name;
        } else if (pOverseer) { pOverseer.innerText = "-"; }
    } catch(e) {}
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
            if(btn && document.getElementById('report-fieldset')?.disabled) btn.innerText = "✏️ Изменить";
        }
    });

    // 1. Дежурства (Выводим на главной - КАРУСЕЛЬ С ТОЧКАМИ)
    try {
        window.dutySliderData = [];
        window.currentDutySlide = 0;

        window.renderDutySlide = (index) => {
            const container = document.getElementById('dashboard-duties');
            if (!container || window.dutySliderData.length === 0) return;

            window.currentDutySlide = index;
            const d = window.dutySliderData[index];
            
            const myGroup = currentUserData ? currentUserData.group : "Без группы";
            const isMyGroup = d.group === myGroup;
            
            const badgeClass = isMyGroup ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200';
            const bgClass = isMyGroup ? 'bg-amber-50/50' : 'bg-white';

            let dotsHtml = '';
            if (window.dutySliderData.length > 1) {
                dotsHtml = '<div class="flex justify-center gap-2.5 p-3 bg-slate-50 border-t border-slate-100">';
                for (let i = 0; i < window.dutySliderData.length; i++) {
                    const activeClass = i === index ? 'bg-amber-400 scale-125' : 'bg-slate-300 hover:bg-slate-400 cursor-pointer';
                    dotsHtml += `<div onclick="renderDutySlide(${i})" class="w-2.5 h-2.5 rounded-full transition-all ${activeClass}"></div>`;
                }
                dotsHtml += '</div>';
            }

            container.innerHTML = `
                <div class="flex flex-col p-4 ${bgClass} transition-colors min-h-[76px] justify-center">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="text-sm font-black text-slate-800 truncate pr-2">${d.type}</span>
                        <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${badgeClass} shrink-0">Гр. ${d.group}</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${d.dateRange}</span>
                </div>
                ${dotsHtml}
            `;
        };

        const dutiesQuery = query(collection(db, "duties"), orderBy("rawDate", "asc"));
        onSnapshot(dutiesQuery, (snapshot) => {
            const container = document.getElementById('dashboard-duties');
            if (!container) return;
            
            window.dutySliderData = [];
            const today = new Date();
            today.setHours(0,0,0,0);
            let myDutyFound = false;

            snapshot.forEach(docSnap => {
                const d = docSnap.data();
                
                const dutyStart = new Date(d.rawDate);
                dutyStart.setHours(0,0,0,0);
                
                const dutyEnd = new Date(dutyStart);
                dutyEnd.setDate(dutyStart.getDate() + 6);
                dutyEnd.setHours(23,59,59,999);
                
                if (dutyEnd.getTime() >= today.getTime()) {
                    window.dutySliderData.push(d);
                    
                    if (today.getTime() >= dutyStart.getTime()) {
                        const myGroup = currentUserData ? currentUserData.group : "Без группы";
                        if (d.group === myGroup) myDutyFound = true;
                    }
                }
            });

            if (window.dutySliderData.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 italic p-4 text-center">Предстоящих дежурств нет</p>';
            } else {
                window.renderDutySlide(0); 
            }

            if (myDutyFound && !sessionStorage.getItem('duty_toast_shown')) {
                showToast('🧹 Ваша группа дежурит на этой неделе!', 'warning');
                sessionStorage.setItem('duty_toast_shown', 'true');
            }
        });
    } catch(e) {}

    // 2. Участки
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

    // 3. Задания (Школа)
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
                if (task.userId === userId || task.assistant === currentUserData.name) {
                    const taskDate = new Date(task.date);
                    const isPast = taskDate < today;
                    const isAssistant = task.assistant === currentUserData.name;
                    
                    const opacityClass = isPast ? "opacity-60 grayscale bg-slate-50 border-slate-200" : "bg-white border-slate-200 shadow-sm";

                    let roleText = isAssistant 
                        ? `Помощник у <span class="text-sky-600 ml-1 truncate">${task.userName}</span>` 
                        : `Выступление ${task.assistant ? `<span class="text-slate-500 text-[10px] md:text-xs block mt-0.5 truncate">Пом: <span class="text-sky-600">${task.assistant}</span></span>` : ''}`;

                    const cardHtml = `
                        <div class="p-4 md:p-5 rounded-3xl border ${opacityClass} mb-4 relative overflow-hidden transition-all">
                            <div class="flex items-start mb-4">
                                <div class="flex gap-3 md:gap-4 items-center min-w-0">
                                    <div class="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 ${isPast ? 'bg-slate-100' : 'bg-sky-50'} rounded-2xl border ${isPast ? 'border-slate-200' : 'border-sky-100'} shadow-inner shrink-0">
                                        <span class="text-[8px] md:text-[9px] uppercase ${isPast ? 'text-slate-400' : 'text-sky-500'} font-bold leading-none mb-1 tracking-widest">${taskDate.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</span>
                                        <span class="text-xl md:text-2xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-sky-700'}">${taskDate.getDate()}</span>
                                    </div>
                                    <div class="min-w-0">
                                        <h3 class="font-black text-slate-800 text-sm md:text-base leading-tight">${roleText}</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2 flex-grow min-w-0">
                                    <span class="bg-slate-800 text-white px-2 py-1 rounded-lg shadow-sm flex items-center shrink-0">
                                        <span class="text-[8px] uppercase tracking-widest font-bold text-slate-400 mr-1">№</span>
                                        <span class="text-sm font-black leading-none">${task.taskNumber || '-'}</span>
                                    </span>
                                    <span class="font-black ${isPast ? 'text-slate-500' : 'text-sky-700'} text-[9px] md:text-[10px] uppercase tracking-wide leading-tight whitespace-normal break-words">${task.category || task.title}</span>
                                </div>
                                ${task.lesson ? `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">Урок ${task.lesson}</span>` : ''}
                            </div>
                        </div>
                    `;
                    if (!isPast) { upCount++; upList.innerHTML += cardHtml; } 
                    else { pastCount++; pastList.innerHTML += cardHtml; }
                }
            });
            
            if (upCount === 0) upList.innerHTML = '<p class="text-slate-400 text-sm italic py-2 bg-white rounded-xl p-4 border border-slate-200 text-center">У тебя пока нет активных заданий</p>';
            if (pastCount === 0) pastList.innerHTML = '<p class="text-slate-400 text-sm italic py-2 text-center">История пуста</p>';
        });
    } catch(e){}

    // 4. Новости (Автоматическое удаление через 7 дней + Toasts)
    try {
        const newsQuery = query(collection(db, "section_content"), orderBy("createdAt", "desc"));
        onSnapshot(newsQuery, (snapshot) => {
            let newsHTML = '';
            const now = new Date().getTime();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const oneDay = 24 * 60 * 60 * 1000;

            const isNewsAdmin = currentUserData.roles && (currentUserData.roles.includes('Админ') || currentUserData.roles.includes('Владелец') || currentUserData.roles.includes('Старейшина'));

            snapshot.forEach(docSnap => {
                const item = docSnap.data();
                if(item.section === 'news') {
                    const itemTime = new Date(item.createdAt).getTime();

                    if (now - itemTime < oneWeek) {
                        const deleteBtn = isNewsAdmin ? `<button onclick="deleteNews('${docSnap.id}')" class="text-[10px] text-red-400 hover:text-red-600 mt-2 font-bold uppercase tracking-widest">Удалить</button>` : '';

                        newsHTML += `
                        <div class="p-3 mb-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                            <p class="text-slate-700 whitespace-pre-wrap text-[11px] md:text-xs leading-relaxed">${item.text}</p>
                            ${deleteBtn}
                        </div>`;

                        if (now - itemTime < oneDay && !sessionStorage.getItem('news_toast_' + docSnap.id)) {
                            showToast('📢 Новое объявление в ленте!', 'info');
                            sessionStorage.setItem('news_toast_' + docSnap.id, 'true');
                        }
                    }
                }
            });
            const contentNews = document.getElementById('content-news');
            if(contentNews) contentNews.innerHTML = newsHTML || '<p class="text-slate-400 italic text-xs text-center p-2">Актуальных объявлений нет</p>';
        });
    } catch(e) {}

   // 5. КАЛЕНДАРЬ
    try {
        const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
        onSnapshot(eventsQuery, (snapshot) => {
            const container = document.getElementById('calendar-events');
            if (!container) return; 
            let html = '';
            
            const now = new Date();
            const todayYear = now.getFullYear();
            const todayMonth = now.getMonth();
            const todayDate = now.getDate();
            
            let count = 0; 

            snapshot.forEach(docSnap => {
                const ev = docSnap.data();
                const evDate = new Date(ev.date);
                const evGroup = ev.group || "Все";
                
                // Проверяем, наступило ли событие СЕГОДНЯ
                if (evDate.getFullYear() === todayYear && evDate.getMonth() === todayMonth && evDate.getDate() === todayDate) {
                    count++; 
                    
                    // --- УМНАЯ ЛОГИКА ВРЕМЕНИ ---
                    let isPastEvent = false;
                    if (ev.time && ev.time.includes(':')) {
                        const [hours, minutes] = ev.time.split(':');
                        const eventExactTime = new Date();
                        eventExactTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                        
                        // Если событие закончилось (прошло 1.5 часа с его начала)
                        if (now.getTime() > eventExactTime.getTime() + (1.5 * 60 * 60 * 1000)) {
                            isPastEvent = true;
                        }
                    }

                    const groupBadge = evGroup !== "Все" ? `<span class="bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase leading-none">Гр. ${evGroup}</span>` : '';
                    
                    // Делаем прошедшее событие блеклым
                    const opacityClass = isPastEvent ? "opacity-50 grayscale bg-slate-50" : "bg-white";
                    
                    html += `
                        <div class="flex items-center px-4 md:px-5 py-3 md:py-4 transition-colors w-full cursor-default ${opacityClass} ${count > 1 ? 'border-t border-slate-100' : ''}">
                            <div class="flex items-center gap-4 w-full">
                                <div class="flex flex-col items-center justify-center w-12 shrink-0">
                                    <span class="text-[9px] uppercase ${isPastEvent ? 'text-slate-400' : 'text-rose-500'} font-bold leading-none mb-1 tracking-widest">СЕГОДНЯ</span>
                                    <span class="text-xl font-black leading-none ${isPastEvent ? 'text-slate-400' : 'text-slate-800'}">${evDate.getDate()}</span>
                                </div>
                                <div class="flex flex-col flex-grow truncate">
                                    <div class="flex items-center gap-2 truncate">
                                        ${ev.time ? `<span class="text-sm font-bold text-slate-500 shrink-0">${ev.time}</span>` : ''}
                                        <span class="font-bold text-sm md:text-base ${isPastEvent ? 'text-slate-500' : 'text-slate-800'} truncate">${ev.title}</span>
                                        ${groupBadge}
                                    </div>
                                    ${ev.leader ? `<div class="text-[10px] uppercase mt-1 tracking-wider truncate text-slate-400 font-medium">Вед: <span class="${isPastEvent ? 'text-slate-500' : 'text-rose-600'} font-bold">${ev.leader}</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;

                    // 🔥 УВЕДОМЛЕНИЕ (ТОСТ) ВЫСКОЧИТ ТОЛЬКО ЕСЛИ СОБЫТИЕ ЕЩЕ НЕ ПРОШЛО
                    if (!isPastEvent && !sessionStorage.getItem('event_toast_' + docSnap.id)) {
                        showToast(`📅 Сегодня: ${ev.title} ${ev.time ? 'в ' + ev.time : ''}`, 'info');
                        sessionStorage.setItem('event_toast_' + docSnap.id, 'true');
                    }
                }
            });

            container.innerHTML = html || '<p class="p-6 text-sm text-slate-400 italic text-center">На сегодня встреч нет</p>';
        });
    } catch(e) {}

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
window.logout = async () => {
    const uid = localStorage.getItem('userId');
    if (uid) {
        try { await updateDoc(doc(db, "users", uid), { pushToken: "" }); } catch (e) {}
    }
    localStorage.clear(); 
    window.location.href = 'login.html'; 
};

// ==========================================
// СОЗДАНИЕ И УДАЛЕНИЕ НОВОСТЕЙ
// ==========================================
window.publishNews = async () => {
    const input = document.getElementById('news-input');
    const text = input.value.trim();
    if (!text) return;

    try {
        await addDoc(collection(db, "section_content"), {
            section: 'news',
            text: text,
            createdAt: new Date().toISOString()
        });
        input.value = '';
    } catch (e) { alert("Ошибка публикации!"); }
};

window.deleteNews = async (id) => {
    if (confirm("Удалить это объявление?")) {
        try { await deleteDoc(doc(db, "section_content", id)); } 
        catch (e) { alert("Ошибка удаления!"); }
    }
};
