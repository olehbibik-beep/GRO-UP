import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const currentUserId = localStorage.getItem('userId');

if (!currentUserId) window.location.href = 'login.html';

// 1. ПРОВЕРКА ПРАВ (Пускаем только Админов, Владельцев и Ответственных за школу)
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (docSnap.exists()) {
        const userRoles = docSnap.data().roles || [];
        if (!userRoles.some(r => ["Владелец", "Админ", "Ответственный за школу"].includes(r))) {
            window.location.href = 'index.html';
        }
    }
});

// 2. ЗАГРУЗКА ТОЛЬКО "УЧАСТНИКОВ ШКОЛЫ"
onSnapshot(collection(db, "users"), (snapshot) => {
    const select = document.getElementById('student-select');
    if (!select) return;
    
    let students = [];
    
    snapshot.forEach(d => {
        const u = d.data();
        // ФИЛЬТР: Берем только активных и только тех, у кого есть роль "Участник школы"
        if (u.status === 'active' && u.roles && u.roles.includes('Участник школы')) {
            students.push({ id: d.id, name: u.name });
        }
    });

    // Сортируем по алфавиту
    students.sort((a, b) => a.name.localeCompare(b.name));

    let html = '<option value="" disabled selected>Выберите ученика...</option>';
    students.forEach(s => {
        // Мы сохраняем в value сразу и ID, и ИМЯ через разделитель |
        html += `<option value="${s.id}|${s.name}">${s.name}</option>`;
    });

    select.innerHTML = html || '<option value="" disabled>Нет участников школы (добавьте их в Админке)</option>';
});

// 3. НАЗНАЧИТЬ ЗАДАНИЕ (Сохранение в базу)
document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const studentData = document.getElementById('student-select').value;
    const taskTitle = document.getElementById('task-title').value.trim();
    const taskDate = document.getElementById('task-date').value;

    if (!studentData || !taskTitle || !taskDate) {
        return alert("Заполните все поля (Ученик, Задание, Дата)!");
    }

    const btn = e.target;
    btn.innerText = "Сохранение..."; btn.disabled = true;

    // Разбиваем value обратно на ID и Имя
    const [userId, userName] = studentData.split('|');

    try {
        await addDoc(collection(db, "personal_tasks"), {
            userId: userId,
            userName: userName,
            title: taskTitle,
            date: taskDate,
            createdAt: new Date().toISOString()
        });

        document.getElementById('task-title').value = '';
        document.getElementById('student-select').value = '';
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Назначено! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Назначить"; 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { 
        alert("Ошибка сети."); 
        btn.disabled = false; 
        btn.innerText = "Назначить"; 
    }
});

// 4. ОТРИСОВКА ВЫДАННЫХ ЗАДАНИЙ (Монолитный список)
const q = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('tasks-list');
    if (snapshot.empty) return list.innerHTML = '<p class="text-slate-400 italic p-6 text-center text-sm">Нет назначенных заданий.</p>';

    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);

    snapshot.forEach(docSnap => {
        const t = docSnap.data();
        const tDate = new Date(t.date);
        
        const isPast = tDate < today;
        const opacityClass = isPast ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0 bg-slate-50" : "bg-white hover:bg-slate-50";

        html += `
            <div class="flex items-center justify-between p-4 border-b border-slate-100 transition-all ${opacityClass}">
                <div class="flex items-center w-full min-w-0 pr-4 gap-4">
                    <div class="flex flex-col items-center justify-center w-11 h-11 bg-sky-50 rounded-lg shrink-0 border border-sky-100">
                        <span class="text-[8px] uppercase text-sky-500 font-bold leading-none mb-0.5 tracking-widest">${tDate.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</span>
                        <span class="text-lg font-black leading-none text-sky-700">${tDate.getDate()}</span>
                    </div>
                    
                    <div class="flex flex-col min-w-0 truncate">
                        <h3 class="font-black text-slate-800 text-sm truncate">${t.userName}</h3>
                        <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 truncate">${t.title}</div>
                    </div>
                </div>
                <button onclick="deleteTask('${docSnap.id}')" class="text-slate-300 hover:text-red-500 transition-colors p-2 text-lg outline-none shrink-0" title="Удалить">🗑️</button>
            </div>
        `;
    });

    list.innerHTML = html;
});

// 5. УДАЛЕНИЕ ЗАДАНИЯ
window.deleteTask = (id) => {
    if (confirm("Точно удалить это задание?")) {
        deleteDoc(doc(db, "personal_tasks", id));
    }
};
