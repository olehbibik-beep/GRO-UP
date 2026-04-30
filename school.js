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

// 1. ПРОВЕРКА ПРАВ
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (docSnap.exists()) {
        const userRoles = docSnap.data().roles || [];
        if (!userRoles.some(r => ["Владелец", "Админ", "Ответственный за школу"].includes(r))) {
            window.location.href = 'index.html';
        }
    }
});

// ГЕНЕРАЦИЯ ЦИФР
const taskNumSelect = document.getElementById('task-number');
for (let i = 1; i <= 20; i++) taskNumSelect.innerHTML += `<option value="${i}">${i}</option>`;
const taskLessonSelect = document.getElementById('task-lesson');
for (let i = 1; i <= 12; i++) taskLessonSelect.innerHTML += `<option value="${i}">${i}</option>`;

let allSchoolStudents = [];
let allTasksCache = []; // Кэш для поиска истории

// 2. ЗАГРУЗКА БАЗЫ "УЧАСТНИКОВ ШКОЛЫ"
onSnapshot(collection(db, "users"), (snapshot) => {
    allSchoolStudents = [];
    snapshot.forEach(d => {
        const u = d.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Участник школы')) {
            allSchoolStudents.push({ id: d.id, name: u.name, gender: u.gender });
        }
    });
    allSchoolStudents.sort((a, b) => a.name.localeCompare(b.name));

    const select = document.getElementById('student-select');
    if (!select) return;

    let html = '<option value="" disabled selected>Выберите ученика...</option>';
    allSchoolStudents.forEach(s => {
        html += `<option value="${s.id}|${s.name}|${s.gender}">${s.name}</option>`;
    });
    select.innerHTML = html || '<option value="" disabled>Нет участников школы</option>';
});

// 3. УМНАЯ ЛОГИКА: ФИЛЬТР ПОЛА + ПОИСК ИСТОРИИ
document.getElementById('student-select').addEventListener('change', (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const [selectedId, selectedName, selectedGender] = selectedValue.split('|');
    const assistantSelect = document.getElementById('assistant-select');
    const categorySelect = document.getElementById('task-category');
    const talkOption = document.getElementById('cat-talk'); 
    const readOption = document.getElementById('cat-reading'); 

    // --- ФИЛЬТР ПОМОЩНИКОВ ---
    assistantSelect.disabled = false;
    let astHtml = '<option value="Без помощника">Без помощника</option>';
    allSchoolStudents.forEach(s => {
        if (s.gender === selectedGender && s.id !== selectedId) {
            astHtml += `<option value="${s.name}">${s.name}</option>`;
        }
    });
    assistantSelect.innerHTML = astHtml;

    // --- БЛОКИРОВКА РЕЧИ И ЧТЕНИЯ ДЛЯ СЕСТЕР ---
    if (selectedGender === 'girl') {
        talkOption.disabled = true; talkOption.innerText = "❌ Речь (Только братья)";
        readOption.disabled = true; readOption.innerText = "❌ Чтение Библии (Братья)";
        if (categorySelect.value === 'РЕЧЬ' || categorySelect.value === 'ЧТЕНИЕ БИБЛИИ') categorySelect.value = '';
    } else {
        talkOption.disabled = false; talkOption.innerText = "🎙️ Речь";
        readOption.disabled = false; readOption.innerText = "📖 Чтение Библии";
    }

    // --- ПОИСК ИСТОРИИ ВЫСТУПЛЕНИЙ ---
    const hintBox = document.getElementById('student-history-hint');
    hintBox.classList.remove('hidden');
    
    // Ищем все задачи этого пользователя
    const userTasks = allTasksCache.filter(t => t.userId === selectedId);
    
    if (userTasks.length === 0) {
        hintBox.innerHTML = `⚠️ <span class="text-rose-500">Еще не выступал(а)</span>`;
    } else {
        // Сортируем по дате (самая свежая первая)
        userTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastTask = userTasks[0];
        const lastDate = new Date(lastTask.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        hintBox.innerHTML = `💡 Последнее выступление: <span class="text-emerald-600">${lastDate} (${lastTask.category})</span>`;
    }
});

// 4. НАЗНАЧИТЬ ЗАДАНИЕ
document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const studentData = document.getElementById('student-select').value;
    const assistantName = document.getElementById('assistant-select').value;
    const tNum = document.getElementById('task-number').value;
    const tCat = document.getElementById('task-category').value;
    const tLes = document.getElementById('task-lesson').value;
    const tDate = document.getElementById('task-date').value;

    if (!studentData || !tNum || !tCat || !tLes || !tDate) {
        return alert("Пожалуйста, заполните все обязательные поля!");
    }

    const btn = e.target;
    btn.innerText = "Сохранение..."; btn.disabled = true;

    const [userId, userName, userGender] = studentData.split('|');

    try {
        await addDoc(collection(db, "personal_tasks"), {
            userId: userId,
            userName: userName,
            assistant: assistantName === "Без помощника" ? "" : assistantName,
            taskNumber: tNum,
            category: tCat,
            lesson: tLes,
            date: tDate,
            createdAt: new Date().toISOString()
        });

        // Сброс
        document.getElementById('student-select').value = '';
        document.getElementById('assistant-select').innerHTML = '<option value="" selected>Сначала выберите ученика</option>';
        document.getElementById('assistant-select').disabled = true;
        document.getElementById('task-number').value = '';
        document.getElementById('task-category').value = '';
        document.getElementById('task-lesson').value = '';
        document.getElementById('task-date').value = '';
        document.getElementById('student-history-hint').classList.add('hidden');
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Успешно назначено! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Назначить"; 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { 
        alert("Ошибка сохранения."); 
        btn.disabled = false; 
        btn.innerText = "Назначить"; 
    }
});

// 5. ОТРИСОВКА ВЫДАННЫХ ЗАДАНИЙ (НОВЫЙ КВАДРАТНЫЙ ДИЗАЙН)
const q = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('tasks-list');
    allTasksCache = []; // Обновляем кэш для истории
    
    if (snapshot.empty) return list.innerHTML = '<p class="text-slate-400 italic p-6 text-center text-sm bg-white rounded-2xl border border-slate-200">Нет назначенных заданий.</p>';

    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);

    snapshot.forEach(docSnap => {
        const t = docSnap.data();
        allTasksCache.push(t); // Пишем в кэш
        
        const tDate = new Date(t.date);
        const isPast = tDate < today;
        const opacityClass = isPast ? "opacity-60 grayscale bg-slate-50 hover:opacity-100 hover:grayscale-0" : "bg-white";

        const astHtml = t.assistant ? `<span class="text-xs text-slate-500 font-bold block mt-1">Помощник: <span class="text-sky-600">${t.assistant}</span></span>` : '';

        // НОВЫЙ ДИЗАЙН: Квадратная карточка, номер огромный справа
        html += `
            <div class="p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden transition-all ${opacityClass}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex gap-4 items-center">
                        <div class="flex flex-col items-center justify-center w-14 h-14 bg-sky-50 rounded-2xl border border-sky-100 shadow-inner shrink-0">
                            <span class="text-[9px] uppercase text-sky-500 font-bold leading-none mb-1 tracking-widest">${tDate.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</span>
                            <span class="text-2xl font-black leading-none text-sky-700">${tDate.getDate()}</span>
                        </div>
                        <div>
                            <h3 class="font-black text-slate-800 text-lg leading-tight">${t.userName}</h3>
                            ${astHtml}
                        </div>
                    </div>
                    
                    <div class="bg-slate-800 text-white px-3 py-1.5 rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400 mr-1.5">№</span>
                        <span class="text-2xl font-black leading-none">${t.taskNumber}</span>
                    </div>
                </div>
                
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span class="font-black text-sky-700 text-xs uppercase tracking-widest truncate mr-2">${t.category}</span>
                    <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg shrink-0">Урок ${t.lesson}</span>
                </div>
                
                <button onclick="deleteTask('${docSnap.id}')" class="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity p-2 text-lg text-red-500 hover:scale-110" title="Удалить">🗑️</button>
            </div>
        `;
    });

    list.innerHTML = html;
});

// 6. УДАЛЕНИЕ ЗАДАНИЯ
window.deleteTask = (id) => {
    if (confirm("Точно удалить это задание?")) {
        deleteDoc(doc(db, "personal_tasks", id));
    }
};
