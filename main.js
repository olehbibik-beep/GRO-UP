import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs, setDoc, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
let currentUserData = null; 

const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const currentMonthStr = d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
document.getElementById('current-month-label').innerText = currentMonthStr;

// =========================================================
// 1. ЛОГИКА ВКЛАДОК (SPA)
// =========================================================
window.switchTab = (tabId, btnElement) => {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    // Показываем нужную
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // Меняем цвета кнопок меню
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-indigo-600');
        btn.classList.add('text-slate-400');
        btn.firstElementChild.classList.remove('bg-indigo-100');
    });
    
    // Делаем активную кнопку синей
    if(btnElement) {
        btnElement.classList.remove('text-slate-400');
        btnElement.classList.add('text-indigo-600');
        btnElement.firstElementChild.classList.add('bg-indigo-100');
    }
};

// =========================================================
// СЛУШАТЕЛЬ СТАТУСА И ЗАГРУЗКА ДАННЫХ
// =========================================================
onSnapshot(doc(db, "users", userId), async (docSnap) => {
    if (!docSnap.exists()) { window.logout(); return; }
    currentUserData = docSnap.data();

    const pendingScreen = document.getElementById('pending-screen');
    const mainDashboard = document.getElementById('main-dashboard');

    if (currentUserData.status === 'pending') {
        pendingScreen.classList.remove('hidden'); pendingScreen.classList.add('flex');
        mainDashboard.classList.add('hidden');
    } else if (currentUserData.status === 'blocked') {
        document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">ДОСТУП ЗАКРЫТ</h1></div>`;
    } else {
        pendingScreen.classList.add('hidden'); pendingScreen.classList.remove('flex');
        mainDashboard.classList.remove('block');
        mainDashboard.classList.add('block');
        
        loadPersonalData();
        loadProfileData(); // Загрузка профиля (вкл. поиск ответственного)
    }
});

// =========================================================
// ПРОФИЛЬ: ИЩЕМ ИМЯ ОТВЕТСТВЕННОГО ЗА ГРУППУ
// =========================================================
async function loadProfileData() {
    document.getElementById('profile-name').innerText = currentUserData.name || "Имя";
    let roles = currentUserData.roles || (currentUserData.role ? [currentUserData.role] : ["Участник"]);
    document.getElementById('profile-role').innerText = roles.join(', ');
    
    const myGroup = currentUserData.group || "Без группы";
    document.getElementById('profile-group').innerText = `№ ${myGroup}`;

    // Если группа указана, ищем её надзирателя
    if (myGroup !== "Без группы") {
        const q = query(collection(db, "users"), where("group", "==", myGroup), where("roles", "array-contains", "Надзиратель группы"));
        const snap = await getDocs(q);
        if (!snap.empty) {
            document.getElementById('profile-overseer').innerText = snap.docs[0].data().name;
        } else {
            document.getElementById('profile-overseer').innerText = "Не назначен";
        }
    } else {
        document.getElementById('profile-overseer').innerText = "-";
    }
}

// =========================================================
// ОТПРАВКА ОТЧЕТА
// =========================================================
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

// =========================================================
// ЗАГРУЗКА ЛИЧНЫХ ДАННЫХ (ЗАДАНИЯ И УЧАСТКИ)
// =========================================================
function loadPersonalData() {
    // 0. Отчет
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

    // 1. ЗАДАНИЯ (Сортировка: Активные и Прошедшие)
    const tasksQuery = query(collection(db, "personal_tasks"), where("userId", "==", userId));
    onSnapshot(tasksQuery, (snapshot) => {
        const upList = document.getElementById('upcoming-tasks-list');
        const pastList = document.getElementById('past-tasks-list');
        upList.innerHTML = ''; pastList.innerHTML = '';
        let upCount = 0, pastCount = 0;

        const today = new Date();
        today.setHours(0,0,0,0); // Обнуляем время, чтобы сравнивать только даты

        snapshot.forEach(docSnap => {
            const task = docSnap.data();
            const taskDate = new Date(task.date);

            if (taskDate >= today) {
                // ПРЕДСТОЯЩЕЕ (Яркое)
                upCount++;
                upList.innerHTML += `<div class="p-4 bg-sky-50 rounded-2xl border border-sky-200 mb-3 shadow-sm"><p class="font-black text-sky-900 text-lg">${task.title}</p><p class="text-sm font-bold text-sky-600 mt-1">📅 ${taskDate.toLocaleDateString('ru-RU')}</p></div>`;
            } else {
                // ПРОШЕДШЕЕ (Серое)
                pastCount++;
                pastList.innerHTML += `<div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-2 opacity-70 grayscale"><p class="font-bold text-slate-600">${task.title}</p><p class="text-xs text-slate-400 mt-1">Выполнено: ${taskDate.toLocaleDateString('ru-RU')}</p></div>`;
            }
        });

        if (upCount === 0) upList.innerHTML = '<p class="text-slate-400 text-sm italic">Нет активных заданий</p>';
        if (pastCount === 0) pastList.innerHTML = '<p class="text-slate-400 text-sm italic">История пуста</p>';
    });

    // 2. УЧАСТКИ (С картой)
    const terrQuery = query(collection(db, "territories"), where("userId", "==", userId));
    onSnapshot(terrQuery, (snapshot) => {
        const container = document.getElementById('territories-container');
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

    // 3. Новости
    onSnapshot(collection(db, "section_content"), (snapshot) => {
        let newsHTML = '';
        snapshot.forEach(docSnap => {
            const item = docSnap.data();
            if(item.section === 'news') newsHTML += `<div class="p-4 bg-slate-50 border rounded-2xl relative"><p class="text-slate-700 whitespace-pre-wrap">${item.text}</p></div>`;
        });
        document.getElementById('content-news').innerHTML = newsHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
    });
// 4. ГЛОБАЛЬНЫЕ СОБЫТИЯ КАЛЕНДАРЯ
    const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));
    onSnapshot(eventsQuery, (snapshot) => {
        const container = document.getElementById('calendar-events');
        if (!container) return; // Защита от ошибок

        let html = '';
        const today = new Date();
        today.setHours(0,0,0,0);

        snapshot.forEach(docSnap => {
            const ev = docSnap.data();
            const evDate = new Date(ev.date);
            
            // Показываем ТОЛЬКО будущие события или события, которые происходят сегодня
            if (evDate >= today) {
                const niceDate = evDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
                html += `
                    <div class="flex items-center gap-4 p-3 bg-rose-50 rounded-2xl border border-rose-100 mb-2">
                        <div class="bg-rose-200 text-rose-700 font-black p-2 rounded-xl text-center min-w-[50px]">
                            <span class="block text-xl leading-none">${evDate.getDate()}</span>
                        </div>
                        <div>
                            <p class="font-bold text-rose-900">${ev.title}</p>
                            <p class="text-xs text-rose-600 font-bold">${niceDate}</p>
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html || '<p class="text-sm text-slate-400 italic">В ближайшее время событий нет.</p>';
    });
}

// =========================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (Кнопки)
// =========================================================
window.requestTerritory = async (btn) => {
    btn.innerText = "Отправка..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), { type: "territory", userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString() });
        btn.innerText = "Запрос отправлен! ✔️";
        setTimeout(() => { btn.innerText = "Попросить участок"; btn.disabled = false; }, 3000);
    } catch (e) { alert("Ошибка!"); btn.innerText = "Попросить участок"; btn.disabled = false; }
};

window.openProfileModal = () => document.getElementById('profile-modal').classList.replace('hidden', 'flex');
window.closeModals = () => document.getElementById('profile-modal').classList.replace('flex', 'hidden');
window.logout = () => { localStorage.clear(); window.location.href = 'login.html'; };
