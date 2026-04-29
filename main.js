import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Проверка авторизации: если нет ID, выкидываем на страницу входа
const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = 'login.html';
}

const TOP_ROLES = ["Владелец", "Админ"]; 
let hasFullAccess = false; 
let currentUserData = null; 
let currentSectionForAdd = ''; 

// =========================================================
// ОСНОВНОЙ СЛУШАТЕЛЬ СТАТУСА (Магия реального времени)
// =========================================================
onSnapshot(doc(db, "users", userId), (docSnap) => {
    if (!docSnap.exists()) { window.logout(); return; }

    currentUserData = docSnap.data();

    const pendingScreen = document.getElementById('pending-screen');
    const mainDashboard = document.getElementById('main-dashboard');

    if (currentUserData.status === 'pending') {
        // Показываем экран ожидания
        pendingScreen.classList.remove('hidden');
        pendingScreen.classList.add('flex');
        mainDashboard.classList.add('hidden');
    } else if (currentUserData.status === 'blocked') {
        document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">ДОСТУП ЗАКРЫТ</h1></div>`;
    } else {
        // ДОСТУП РАЗРЕШЕН! Открываем дашборд.
        pendingScreen.classList.add('hidden');
        pendingScreen.classList.remove('flex');
        mainDashboard.classList.remove('hidden');
        
        // Загружаем личные данные
        loadPersonalData();

        // Проверяем админские права
        if (TOP_ROLES.includes(currentUserData.role)) {
            hasFullAccess = true;
            document.querySelectorAll('.admin-controls').forEach(el => el.classList.remove('hidden'));
        } else {
            hasFullAccess = false;
            document.querySelectorAll('.admin-controls').forEach(el => el.classList.add('hidden'));
        }
    }
});

// =========================================================
// ЗАГРУЗКА ЛИЧНЫХ ДАННЫХ
// =========================================================
function loadPersonalData() {
    // 1. Мои задания
    const tasksQuery = query(collection(db, "personal_tasks"), where("userId", "==", userId));
    onSnapshot(tasksQuery, (snapshot) => {
        const container = document.getElementById('my-tasks-list');
        if (snapshot.empty) return container.innerHTML = '<p class="text-slate-400 italic">Нет активных заданий</p>';
        
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const task = docSnap.data();
            container.innerHTML += `
                <div class="p-3 bg-sky-50 rounded-xl border border-sky-100 mb-2">
                    <p class="font-bold text-sky-900">${task.title}</p>
                    <p class="text-xs text-sky-700">${task.date || 'Без даты'}</p>
                </div>
            `;
        });
    });

    // 2. Мои участки
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

// Запрос участка
window.requestTerritory = async () => {
    const btn = event.target;
    btn.innerText = "Отправка...";
    btn.disabled = true;
    try {
        await addDoc(collection(db, "requests"), {
            type: "territory", userId: userId, userName: currentUserData.name, status: "new", createdAt: new Date().toISOString()
        });
        btn.innerText = "Запрос отправлен! ✔️";
        setTimeout(() => { btn.innerText = "Попросить участок"; btn.disabled = false; }, 3000);
    } catch (e) { alert("Ошибка!"); btn.innerText = "Попросить участок"; btn.disabled = false; }
};

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
    document.getElementById('profile-role').innerText = currentUserData?.role || "Роль";
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
