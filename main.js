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
function listenToUserStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId) return; // Если еще не зарегистрировался, ничего не делаем

    onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();

            // 1. Проверка на бан
            if (userData.isBlocked) {
                document.body.innerHTML = `
                    <div class="flex items-center justify-center h-screen bg-red-100 p-10 text-center">
                        <h1 class="text-2xl font-black text-red-600">Твой аккаунт заблокирован админом!</h1>
                    </div>
                `;
                return;
            }

            // 2. Проверка на админа
            if (userData.role === 'admin') {
                console.log("Добро пожаловать, босс!");
            }
            
            // 3. Обновляем разрешение на клики
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
