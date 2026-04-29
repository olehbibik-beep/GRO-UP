import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    initializeFirestore, persistentLocalCache, collection, onSnapshot, 
    doc, setDoc, addDoc, deleteDoc, 
    getDocs, query, where 
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

// =========================================================
// ПРОВЕРКА ПРАВ
// =========================================================
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

listenToUserStatus();

if (localStorage.getItem('userName')) {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.style.display = 'none';
}

// =========================================================
// ВХОД И РЕГИСТРАЦИЯ С ПИН-КОДОМ
// =========================================================
window.saveName = async () => {
    const nameInput = document.getElementById('user-name-input').value.trim();
    const pinInput = document.getElementById('user-pin-input').value.trim();
    
    // Убрали жесткие лимиты по символам. Просто проверяем, что поля не пустые!
    if (nameInput === "" || pinInput === "") {
        alert("Пожалуйста, заполните оба поля: Имя и ПИН-код!");
        return;
    }

    // Меняем кнопку на "Загрузка..." чтобы было понятно, что процесс пошел
    const btn = document.querySelector('#auth-modal button');
    const originalBtnText = btn.innerText;
    btn.innerText = "Загрузка...";
    btn.disabled = true;

    try {
        // Ищем пользователя в базе
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("name", "==", nameInput));
        const querySnapshot = await getDocs(q);

        let userId = "";

        if (!querySnapshot.empty) {
            // АКАУНТ СУЩЕСТВУЕТ -> ПРОВЕРЯЕМ ПИН
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.pin === pinInput) {
                userId = userDoc.id; // ПИН верный
            } else {
                alert("Неверный ПИН-код для этого имени!");
                btn.innerText = originalBtnText;
                btn.disabled = false;
                return; 
            }
        } else {
            // НОВЫЙ АКАУНТ (Регистрация)
            userId = 'user_' + Date.now() + Math.random().toString(36).substring(2, 9);
            
            await setDoc(doc(db, "users", userId), {
                name: nameInput,
                pin: pinInput, // Сохраняем придуманный ПИН
                createdAt: new Date().toISOString(),
                status: "online",
                role: "Участник", // Сразу даем роль для админки
                isBlocked: false
            });
            console.log("Новый пользователь зарегистрирован!");
        }

        // Сохраняем и пускаем внутрь
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', nameInput);
        document.getElementById('auth-modal').style.display = 'none';

        listenToUserStatus();

    } catch (e) {
        console.error("Ошибка при входе:", e);
        alert("Ошибка сети. Проверьте интернет или настройки базы.");
        btn.innerText = originalBtnText;
        btn.disabled = false;
    }
};

// =========================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ
// =========================================================
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

// Отрисовка контента
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
