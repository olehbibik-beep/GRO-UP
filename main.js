import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const listElement = document.getElementById('categories-list');

// 1. Функция входа (сохранение имени)
window.saveName = () => {
    const nameInput = document.getElementById('user-name-input');
    const name = nameInput.value.trim();
    if (name.length > 1) {
        localStorage.setItem('userName', name);
        document.getElementById('auth-modal').style.display = 'none';
    } else {
        alert("Введи имя!");
    }
};

// Проверка имени при загрузке
if (localStorage.getItem('userName')) {
    document.getElementById('auth-modal').style.display = 'none';
}

// 2. Функция присоединения к группе (счетчик +1)
window.joinRoom = async (roomId, roomName) => {
    const user = localStorage.getItem('userName');
    const roomRef = doc(db, "categories", roomId);

    try {
        // Увеличиваем счетчик в базе на 1
        await updateDoc(roomRef, {
            count: increment(1)
        });
        alert(`${user}, ты успешно записан в группу "${roomName}"!`);
    } catch (e) {
        console.error("Ошибка при записи:", e);
    }
};

// 3. Отрисовка списка в реальном времени
onSnapshot(collection(db, "categories"), (snapshot) => {
    listElement.innerHTML = '';
    snapshot.forEach((documentSnapshot) => {
        const cat = documentSnapshot.data();
        const id = documentSnapshot.id;
        
        const colors = ['bg-blue-50', 'bg-purple-50', 'bg-emerald-50', 'bg-orange-50'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        listElement.innerHTML += `
            <div class="${randomColor} p-5 rounded-[2.5rem] mb-4 flex items-center justify-between border border-white shadow-sm active:scale-95 transition-transform cursor-pointer" 
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
