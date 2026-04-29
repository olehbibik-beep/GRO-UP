import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    initializeFirestore, persistentLocalCache, collection, onSnapshot, 
    doc, setDoc, addDoc, deleteDoc 
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
const db = initializeFirestore(app, { localCache: persistentLocalCache() });

const TOP_ROLES = ["Владелец", "Админ"]; 
let hasFullAccess = false; 
let currentUserData = null; 
let currentSectionForAdd = ''; 

// Проверка прав и блокировки
function listenToUserStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
            currentUserData = docSnap.data();

            if (currentUserData.isBlocked) {
                document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-red-100"><h1 class="text-3xl text-red-600 font-black">ВЫ ЗАБЛОКИРОВАНЫ</h1></div>`;
                return;
            }

            if (TOP_ROLES.includes(currentUserData.role)) {
                hasFullAccess = true;
                document.querySelectorAll('.admin-controls').forEach(el => el.classList.remove('hidden'));
            } else {
                hasFullAccess = false;
                document.querySelectorAll('.admin-controls').forEach(el => el.classList.add('hidden'));
            }
        }
    });
}

// Запускаем слушатель, если юзер уже логинился ранее
listenToUserStatus();

// Скрываем окно, если имя уже есть в памяти
if (localStorage.getItem('userName')) {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.style.display = 'none';
}

// =========================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (привязаны к window, чтобы HTML их видел)
// =========================================================

window.saveName = async () => {
    const nameInput = document.getElementById('user-name-input');
    const name = nameInput.value.trim();
    
    if (name.length > 1) {
        // Создаем ID
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('userId', userId);
        }

        // Сохраняем имя локально
        localStorage.setItem('userName', name);
        
        // Скрываем модалку
        document.getElementById('auth-modal').style.display = 'none';

        // Отправляем профиль в базу данных (АДМИНКА ЕГО УВИДИТ ЗДЕСЬ)
        try {
            await setDoc(doc(db, "users", userId), {
                name: name,
                createdAt: new Date().toISOString(),
                status: "online",
                role: "user",
                isBlocked: false
            }, { merge: true }); 
            
            // Начинаем слушать права
            listenToUserStatus();
        } catch (e) {
            console.error("Офлайн режим (данные отправятся позже):", e);
        }
    } else {
        alert("Введи имя, пожалуйста!");
    }
};

window.logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    location.reload(); 
};

window.closeModals = () => {
    document.getElementById('profile-modal').classList.add('hidden');
    document.getElementById('profile-modal').classList.remove('flex');
    document.getElementById('add-modal').classList.add('hidden');
    document.getElementById('add-modal').classList.remove('flex');
};

window.openProfileModal = () => {
    const localName = localStorage.getItem('userName') || "Без имени";
    document.getElementById('profile-name').innerText = currentUserData ? currentUserData.name : localName;
    document.getElementById('profile-role').innerText = currentUserData ? currentUserData.role : "Загрузка...";
    
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.openAddModal = (sectionName) => {
    currentSectionForAdd = sectionName; 
    document.getElementById('add-content-text').value = ''; 
    
    const modal = document.getElementById('add-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.saveNewContent = async () => {
    if (!hasFullAccess) return;
    const text = document.getElementById('add-content-text').value.trim();
    if (text.length === 0) {
        alert("Текст не может быть пустым!");
        return;
    }

    try {
        await addDoc(collection(db, "section_content"), {
            section: currentSectionForAdd,
            text: text,
            createdAt: new Date().toISOString()
        });
        window.closeModals(); 
    } catch(e) {
        console.error("Ошибка сохранения:", e);
    }
};

window.deleteContent = (id) => {
    if (!hasFullAccess) return;
    if (confirm("Точно удалить эту запись?")) {
        deleteDoc(doc(db, "section_content", id));
    }
};

// =========================================================
// ОТРИСОВКА КОНТЕНТА В КОЛОНКАХ
// =========================================================
onSnapshot(collection(db, "section_content"), (snapshot) => {
    let newsHTML = '', importantHTML = '', tasksHTML = '';

    snapshot.forEach(docSnap => {
        const item = docSnap.data();
        const id = docSnap.id;
        
        const itemUI = `
            <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group hover:shadow-md transition-all">
                <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">${item.text}</p>
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
