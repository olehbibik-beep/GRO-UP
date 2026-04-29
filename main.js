// --- 1. ВСЕ ИМПОРТЫ НАВЕРХУ ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    collection, 
    onSnapshot, 
    doc, 
    setDoc,
    addDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// --- 2. НАСТРОЙКИ FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCwflIUs2AnBRIIxrssVpbpykHwG2436q0",
    authDomain: "gro-uping.firebaseapp.com",
    projectId: "gro-uping",
    storageBucket: "gro-uping.firebasestorage.app",
    messagingSenderId: "819938349545",
    appId: "1:819938349545:web:a00c3bef66d99f5b6cfb78"
};

const app = initializeApp(firebaseConfig);

// Включаем офлайн-режим
const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

// --- 3. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
const TOP_ROLES = ["Владелец", "Админ"]; 
let hasFullAccess = false; 

// --- 4. ПРОВЕРКА ПРАВ (СЛУШАТЕЛЬ) ---
function listenToUserStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.isBlocked) {
                document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">БЛОКИРОВКА</h1></div>`;
                return;
            }

            // ПРОВЕРКА НА ТОП-2 КАТЕГОРИИ
            if (TOP_ROLES.includes(userData.role)) {
                hasFullAccess = true;
                document.querySelectorAll('.admin-controls').forEach(el => el.classList.remove('hidden'));
            } else {
                hasFullAccess = false;
                document.querySelectorAll('.admin-controls').forEach(el => el.classList.add('hidden'));
            }
        }
    });
}

// Запускаем проверку прав при загрузке
listenToUserStatus();

// Скрываем модалку, если уже входили
if (localStorage.getItem('userName')) {
    document.getElementById('auth-modal').style.display = 'none';
}

// --- 5. ФУНКЦИЯ ВХОДА ---
window.saveName = async () => {
    const nameInput = document.getElementById('user-name-input');
    const name = nameInput.value.trim();
    
    if (name.length > 1) {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('userId', userId);
        }

        localStorage.setItem('userName', name);
        document.getElementById('auth-modal').style.display = 'none';

        try {
            await setDoc(doc(db, "users", userId), {
                name: name,
                createdAt: new Date().toISOString(),
                status: "online",
                role: "user",
                isBlocked: false
            });
            console.log("Профиль создан в облаке!");
            listenToUserStatus();
        } catch (e) {
            console.error("Сохранено локально, ждем интернет:", e);
        }
    } else {
        alert("Введи имя!");
    }
};

// --- 6. ЗАГРУЗКА ИНФОРМАЦИОННЫХ ПАНЕЛЕЙ ---
onSnapshot(collection(db, "section_content"), (snapshot) => {
    let newsHTML = '', importantHTML = '', tasksHTML = '';

    snapshot.forEach(docSnap => {
        const item = docSnap.data();
        const id = docSnap.id;
        
        const itemUI = `
            <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group hover:shadow-md transition-all">
                <p class="text-slate-700 leading-relaxed">${item.text}</p>
                ${hasFullAccess ? `
                    <button onclick="deleteContent('${id}')" 
                            class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        ✖
                    </button>
                ` : ''}
            </div>
        `;

        if (item.section === 'news') newsHTML += itemUI;
        if (item.section === 'important') importantHTML += itemUI;
        if (item.section === 'tasks') tasksHTML += itemUI;
    });

    document.getElementById('content-news').innerHTML = newsHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
    document.getElementById('content-important').innerHTML = importantHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
    document.getElementById('content-tasks').innerHTML = tasksHTML || '<p class="text-slate-400 italic">Пока пусто</p>';
});

// --- 7. ДОБАВЛЕНИЕ И УДАЛЕНИЕ КОНТЕНТА (Только для Админов) ---
window.addContent = async (sectionName) => {
    if (!hasFullAccess) return;
    
    const text = prompt("Введите текст для этого блока:");
    if (text && text.trim().length > 0) {
        await addDoc(collection(db, "section_content"), {
            section: sectionName,
            text: text,
            createdAt: new Date().toISOString() // Чтобы потом можно было сортировать по дате
        });
    }
};

window.deleteContent = (id) => {
    if (!hasFullAccess) return;
    if (confirm("Точно удалить эту запись?")) {
        deleteDoc(doc(db, "section_content", id));
    }
};
