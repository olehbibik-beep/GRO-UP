import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let hasFullAccess = false; 
let currentUserData = null; 
let currentSectionForAdd = ''; 

// Надежный ID для отчета (чтобы не было дубликатов)
const d = new Date();
const strictMonthId = `${d.getFullYear()}_${d.getMonth()}`; 
const currentMonthStr = d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
document.getElementById('current-month-label').innerText = currentMonthStr;

// =========================================================
// СЛУШАТЕЛЬ СТАТУСА (Проверка ролей)
// =========================================================
onSnapshot(doc(db, "users", userId), (docSnap) => {
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
        mainDashboard.classList.remove('hidden');
        
        loadPersonalData();

        let userRoles = currentUserData.roles || (currentUserData.role ? [currentUserData.role] : []);
        
        if (userRoles.some(r => TOP_ROLES.includes(r))) {
            hasFullAccess = true;
            document.querySelectorAll('.admin-controls').forEach(el => el.classList.remove('hidden'));
        } else {
            hasFullAccess = false;
            document.querySelectorAll('.admin-controls').forEach(el => el.classList.add('hidden'));
        }

        if (userRoles.some(r => OVERSEER_ROLES.includes(r))) {
            document.querySelectorAll('.overseer-controls').forEach(el => el.classList.remove('hidden'));
        } else {
            document.querySelectorAll('.overseer-controls').forEach(el => el.classList.add('hidden'));
        }
    }
});

// =========================================================
// ОТПРАВКА ОТЧЕТА (ПЕРЕЗАПИСЬ И ЛОГИРОВАНИЕ)
// =========================================================
window.submitReport = async () => {
    const participated = document.getElementById('rep-participated').checked;
    const hours = document.getElementById('rep-hours').value;
    const pubs = document.getElementById('rep-pubs').value;
    const studies = document.getElementById('rep-studies').value;
    const btn = document.getElementById('submit-report-btn');

    if (!participated && hours === "") {
        return alert("Отметьте галочку 'Участвовал' или введите часы!");
    }

    btn.innerText = "Сохранение...";
    btn.disabled = true;

    // Гарантируем, что будет только ОДНА запись в месяц
    const reportId = `${userId}_${strictMonthId}`;
    const submitTime = new Date().toISOString();

    try {
        await setDoc(doc(db, "reports", reportId), {
            userId: userId,
            userName: currentUserData.name,
            group: currentUserData.group || "Без группы",
            month: currentMonthStr,
            participated: participated, // Птичка "Служил"
            hours: hours ? Number(hours) : 0,
            pubs: pubs ? Number(pubs) : 0,
            studies: studies ? Number(studies) : 0,
            submittedAt: submitTime // Время отправки
        });

        // Обновляем лог на экране
        const niceTime = new Date(submitTime).toLocaleString('ru-RU');
        document.getElementById('last-report-log').innerText = `Сохранено: ${niceTime}`;

        btn.classList.replace('bg-purple-200/50', 'bg-emerald-500');
        btn.classList.replace('text-purple-800', 'text-white');
        btn.innerText = "Перезаписано! ✔️";

        setTimeout(() => {
            btn.classList.replace('bg-emerald-500', 'bg-purple-200/50');
            btn.classList.replace('text-white', 'text-purple-800');
            btn.innerText = "Обновить данные"; 
            btn.disabled = false;
        }, 3000);

    } catch (e) {
        console.error(e);
        alert("Ошибка сети.");
        btn.innerText = "Отправить отчет";
        btn.disabled = false;
    }
};

// =========================================================
// ЗАГРУЗКА ЛИЧНЫХ ДАННЫХ (Отчет, Дежурства, Задания, Участки)
// =========================================================
function loadPersonalData() {
    // 0. Подгружаем ТЕКУЩИЙ ОТЧЕТ пользователя
    onSnapshot(doc(db, "reports", `${userId}_${strictMonthId}`), (docSnap) => {
        if (docSnap.exists()) {
            const r = docSnap.data();
            document.getElementById('rep-participated').checked = r.participated || false;
            document.getElementById('rep-hours').value = r.hours || '';
            document.getElementById('rep-pubs').value = r.pubs || '';
            document.getElementById('rep-studies').value = r.studies || '';
            
            const logDate = new Date(r.submittedAt).toLocaleString('ru-RU');
            document.getElementById('last-report-log').innerText = `Последняя запись: ${logDate}`;
            document.getElementById('submit-report-btn').innerText = "Обновить данные";
        }
    });

    // 1. Предстоящие дежурства (Желтый блок)
    const dutiesQuery = query(collection(db, "duties"), where("userId", "==", userId));
    onSnapshot(dutiesQuery, (snapshot) => {
        const card = document.getElementById('upcoming-duty-card');
        const titleEl = document.getElementById('duty-title');
        const dateEl = document.getElementById('duty-date');

        // Если HTML блока еще нет на странице, прерываем, чтобы не было ошибки
        if (!card) return;

        if (snapshot.empty) {
            card.classList.add('hidden');
            card.classList.remove('flex');
            return;
        }

        // Берем самое свежее дежурство
        const duty = snapshot.docs[0].data();
        titleEl.innerText = duty.type;
        dateEl.innerText = duty.dateRange;
        
        card.classList.remove('hidden');
        card.classList.add('flex'); // Показываем карточку
    });

    // 2. Мои задания
    const tasksQuery = query(collection(db, "personal_tasks"), where("userId", "==", userId));
    onSnapshot(tasksQuery, (snapshot) => {
        const container = document.getElementById('my-tasks-list');
        if (snapshot.empty) return container.innerHTML = '<p class="text-slate-400 italic">Нет активных заданий</p>';
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const task = docSnap.data();
            container.innerHTML += `<div class="p-3 bg-sky-50 rounded-xl border border-sky-100 mb-2"><p class="font-bold text-sky-900">${task.title}</p><p class="text-xs text-sky-700">${task.date || 'Без даты'}</p></div>`;
        });
    });

    // 3. Мои участки
    const terrQuery = query(collection(db, "territories"), where("userId", "==", userId));
    onSnapshot(terrQuery, (snapshot) => {
        const container = document.getElementById('my-territories-list');
        if (snapshot.empty) return container.innerHTML = '<p class="text-slate-400 italic">У вас пока нет участков</p>';
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const terr = docSnap.data();
            container.innerHTML += `<div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-2 font-bold text-emerald-900">Участок №${terr.number}</div>`;
        });
    });
}

// =========================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (Профиль, Выход, Новости)
// =========================================================
window.logout = () => { localStorage.clear(); window.location.href = 'login.html'; };

window.closeModals = () => {
    document.getElementById('profile-modal').classList.replace('flex', 'hidden');
    document.getElementById('add-modal').classList.replace('flex', 'hidden');
};

window.openProfileModal = () => {
    document.getElementById('profile-name').innerText = currentUserData?.name || "Имя";
    let roles = currentUserData?.roles || (currentUserData?.role ? [currentUserData.role] : ["Участник"]);
    document.getElementById('profile-role').innerText = roles.join(', ');
    document.getElementById('profile-modal').classList.replace('hidden', 'flex');
};

window.openAddModal = (section) => { currentSectionForAdd = section; document.getElementById('add-content-text').value = ''; document.getElementById('add-modal').classList.replace('hidden', 'flex'); };

window.saveNewContent = async () => {
    const text = document.getElementById('add-content-text').value.trim();
    if (!text || !hasFullAccess) return;
    await addDoc(collection(db, "section_content"), { section: currentSectionForAdd, text, createdAt: new Date().toISOString() });
    window.closeModals(); 
};

window.deleteContent = (id) => { if(hasFullAccess && confirm("Удалить?")) deleteDoc(doc(db, "section_content", id)); };

onSnapshot(collection(db, "section_content"), (snapshot) => {
    let newsHTML = '';
    snapshot.forEach(docSnap => {
        const item = docSnap.data();
        if(item.section === 'news') newsHTML += `<div class="p-4 bg-slate-50 border rounded-2xl relative group hover:shadow-md"><p class="text-slate-700 whitespace-pre-wrap">${item.text}</p>${hasFullAccess ? `<button onclick="deleteContent('${docSnap.id}')" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100">✖</button>` : ''}</div>`;
    });
    document.getElementById('content-news').innerHTML = newsHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
});
