import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    initializeFirestore, persistentLocalCache, collection, onSnapshot, 
    doc, setDoc, addDoc, deleteDoc, 
    getDocs, query, where // <-- Добавлены новые функции для поиска!
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
    const nameInput = document.getElementById('user-name-input').value.trim();
    const pinInput = document.getElementById('user-pin-input').value.trim();
    
    // Проверяем, чтобы поля не были пустыми
    if (nameInput.length < 2 || pinInput.length < 1) {
        alert("Пожалуйста, введите имя и ПИН-код!");
        return;
    }

    try {
        // 1. Ищем пользователя в базе данных по имени
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("name", "==", nameInput));
        const querySnapshot = await getDocs(q);

        let userId = "";

        if (!querySnapshot.empty) {
            // АКАУНТ УЖЕ СУЩЕСТВУЕТ -> ПРОВЕРЯЕМ ПИН-КОД
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.pin === pinInput) {
                // Пин-код верный! Пускаем внутрь
                userId = userDoc.id;
            } else {
                // Пин-код неверный! Выдаем ошибку и останавливаем код
                alert("Неверный ПИН-код для этого имени!");
                return; 
            }
        } else {
            // АКАУНТА НЕТ -> РЕГИСТРИРУЕМ НОВОГО ПОЛЬЗОВАТЕЛЯ
            userId = 'user_' + Date.now() + Math.random().toString(36).substring(2, 9);
            
            await setDoc(doc(db, "users", userId), {
                name: nameInput,
                pin: pinInput, // Сохраняем придуманный/выданный ПИН-код
                createdAt: new Date().toISOString(),
                status: "online",
                role: "Участник", // <--- ВОТ ТУТ МЫ ПРОПИСЫВАЕМ ЕГО В КАТЕГОРИЮ!
                isBlocked: false
            });
            console.log("Новый пользователь зарегистрирован!");
        }

        // Если дошли сюда, значит вход/регистрация успешны
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', nameInput);
        document.getElementById('auth-modal').style.display = 'none';

        // Запускаем проверку прав
        listenToUserStatus();

    } catch (e) {
        console.error("Ошибка при входе:", e);
        alert("Ошибка сети. Попробуйте позже.");
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
