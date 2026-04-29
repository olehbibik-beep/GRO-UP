import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc, 
    increment, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const listElement = document.getElementById('categories-list');
let canUserClick = true; // По умолчанию кликать можно

// --- 1. СИСТЕМА ПРОВЕРКИ ПРАВ ПОЛЬЗОВАТЕЛЯ ---
// Эта функция висит в фоне и слушает изменения профиля в админке
// Те же категории, что и в админке! Первые две имеют власть.
const TOP_ROLES = ["Владелец", "Админ"]; 
let hasFullAccess = false; // Переменная доступа

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
                // Показываем все скрытые кнопки админа на странице
                document.querySelectorAll('.admin-controls').forEach(el => el.classList.remove('hidden'));
            } else {
                hasFullAccess = false;
                // Прячем кнопки, если права забрали
                document.querySelectorAll('.admin-controls').forEach(el => el.classList.add('hidden'));
            }
            
            canUserClick = userData.canJoin !== false;
        }
    });
}

// Запускаем проверку прав при загрузке (если юзер уже есть)
listenToUserStatus();

// Проверка имени при загрузке (скрываем модалку)
if (localStorage.getItem('userName')) {
    document.getElementById('auth-modal').style.display = 'none';
}


// --- 2. ФУНКЦИЯ ВХОДА (ПЕРВЫЙ ЗАПУСК) ---
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
                isBlocked: false,
                canJoin: true
            });
            console.log("Профиль создан в облаке!");
            
            // Запускаем слежку за правами сразу после регистрации
            listenToUserStatus();
            
        } catch (e) {
            console.error("Сохранено локально, ждем интернет:", e);
        }
    } else {
        alert("Введи имя!");
    }
};


// --- 3. ФУНКЦИЯ ПРИСОЕДИНЕНИЯ К ГРУППЕ ---
window.joinRoom = async (roomId, roomName) => {
    // Проверяем, не запретил ли админ кликать
    if (!canUserClick) {
        alert("Админ отключил тебе возможность вступать в группы!");
        return;
    }

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    // Проверка, не в группе ли уже пользователь
    if (localStorage.getItem('joinedRoom')) {
        alert("Ты уже в группе!");
        return;
    }

    const roomRef = doc(db, "categories", roomId);
    const userRef = doc(db, "users", userId);

    try {
        await updateDoc(roomRef, {
            count: increment(1)
        });
        
        await updateDoc(userRef, {
            currentRoom: roomId
        });

        localStorage.setItem('joinedRoom', roomId);
        alert(`${userName}, ты успешно записан в группу "${roomName}"!`);
    } catch (e) {
        console.error("Ошибка при записи (сохранено локально):", e);
    }
};


// --- 4. ОТРИСОВКА СПИСКА КОМНАТ ---
onSnapshot(collection(db, "categories"), (snapshot) => {
    listElement.innerHTML = '';
    const colors = ['bg-blue-50', 'bg-purple-50', 'bg-emerald-50', 'bg-orange-50'];
    
    snapshot.forEach((documentSnapshot, index) => {
        const cat = documentSnapshot.data();
        const id = documentSnapshot.id;
        const color = colors[index % colors.length];

        listElement.innerHTML += `
            <div class="${color} p-5 rounded-[2.5rem] mb-4 flex items-center justify-between border border-white shadow-sm active:scale-95 transition-transform cursor-pointer" 
                 onclick="joinRoom('${id}', '${cat.name}')">
                <div class="flex items-center">
                    <div class="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                        ${cat.icon || '👥'}
                    </div>
                    <div class="ml-4">
                        <h2 class="text-xl font-extrabold text-gray-800">${cat.name || 'Без названия'}</h2>
                        <p class="text-xs text-gray-500 font-medium">Нажми, чтобы войти</p>
                    </div>
                </div>
                <div class="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl">
                    <span class="text-indigo-600 font-black">${cat.count || 0}</span>
                </div>
            </div>
        `;
    });
});
import { addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 1. Загрузка контента для трех подразделов в реальном времени
onSnapshot(collection(db, "section_content"), (snapshot) => {
    let newsHTML = '', importantHTML = '', tasksHTML = '';

    snapshot.forEach(docSnap => {
        const item = docSnap.data();
        const id = docSnap.id;
        
        // Формируем блок текста + кнопки удаления (если есть права)
        const itemUI = `
            <div class="p-3 bg-gray-50 rounded-xl relative group">
                <p>${item.text}</p>
                ${hasFullAccess ? `
                    <button onclick="deleteContent('${id}')" 
                            class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ✖
                    </button>
                ` : ''}
            </div>
        `;

        if (item.section === 'news') newsHTML += itemUI;
        if (item.section === 'important') importantHTML += itemUI;
        if (item.section === 'tasks') tasksHTML += itemUI;
    });

    document.getElementById('content-news').innerHTML = newsHTML || 'Пока пусто';
    document.getElementById('content-important').innerHTML = importantHTML || 'Пока пусто';
    document.getElementById('content-tasks').innerHTML = tasksHTML || 'Пока пусто';
});

// 2. Функция добавления (доступна только для ТОП ролей, вызывается по кнопке +)
window.addContent = async (sectionName) => {
    if (!hasFullAccess) return;
    
    const text = prompt("Введите текст для этого блока:");
    if (text && text.trim().length > 0) {
        await addDoc(collection(db, "section_content"), {
            section: sectionName,
            text: text,
            createdAt: new Date().toISOString()
        });
    }
};

// 3. Функция удаления контента
window.deleteContent = (id) => {
    if (!hasFullAccess) return;
    if (confirm("Удалить эту запись?")) {
        deleteDoc(doc(db, "section_content", id));
    }
};
