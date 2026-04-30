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

// ГЕНЕРАЦИЯ ЦИФР В СЕЛЕКТЫ (Задания 1-20, Уроки 1-12)
const taskNumSelect = document.getElementById('task-number');
for (let i = 1; i <= 20; i++) taskNumSelect.innerHTML += `<option value="${i}">${i}</option>`;

const taskLessonSelect = document.getElementById('task-lesson');
for (let i = 1; i <= 12; i++) taskLessonSelect.innerHTML += `<option value="${i}">${i}</option>`;


// 2. ЗАГРУЗКА БАЗЫ "УЧАСТНИКОВ ШКОЛЫ"
let allSchoolStudents = [];

onSnapshot(collection(db, "users"), (snapshot) => {
    allSchoolStudents = [];
    
    snapshot.forEach(d => {
        const u = d.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Участник школы')) {
            // Сохраняем в память пол (gender) для логики
            allSchoolStudents.push({ id: d.id, name: u.name, gender: u.gender });
        }
    });

    allSchoolStudents.sort((a, b) => a.name.localeCompare(b.name));

    // Заполняем ГЛАВНЫЙ выпадающий список
    const select = document.getElementById('student-select');
    if (!select) return;

    let html = '<option value="" disabled selected>Выберите ученика...</option>';
    allSchoolStudents.forEach(s => {
        // Зашиваем ID, ИМЯ и ПОЛ в value, чтобы легко достать при клике
        html += `<option value="${s.id}|${s.name}|${s.gender}">${s.name}</option>`;
    });

    select.innerHTML = html || '<option value="" disabled>Нет участников школы</option>';
});

// 3. УМНАЯ ЛОГИКА: РЕАКЦИЯ НА ВЫБОР УЧЕНИКА
document.getElementById('student-select').addEventListener('change', (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const [selectedId, selectedName, selectedGender] = selectedValue.split('|');
    const assistantSelect = document.getElementById('assistant-select');
    const categorySelect = document.getElementById('task-category');
    const talkOption = document.getElementById('cat-talk'); // Пункт "РЕЧЬ"

    // --- ФИЛЬТР ПОМОЩНИКОВ (Тот же пол, исключая самого себя) ---
    assistantSelect.disabled = false;
    let astHtml = '<option value="Без помощника">Без помощника</option>';
    
    allSchoolStudents.forEach(s => {
        if (s.gender === selectedGender && s.id !== selectedId) {
            astHtml += `<option value="${s.name}">${s.name}</option>`;
        }
    });
    assistantSelect.innerHTML = astHtml;

    // --- БЛОКИРОВКА "РЕЧИ" ДЛЯ СЕСТЕР ---
    if (selectedGender === 'girl') {
        talkOption.disabled = true;
        talkOption.innerText = "❌ Речь (Только братья)";
        // Если была выбрана речь, сбрасываем селект
        if (categorySelect.value === 'РЕЧЬ') categorySelect.value = '';
    } else {
        talkOption.disabled = false;
        talkOption.innerText = "🎙️ Речь";
    }
});


// 4. НАЗНАЧИТЬ ЗАДАНИЕ (Сохранение в базу)
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

        // Сброс формы
        document.getElementById('student-select').value = '';
        document.getElementById('assistant-select').innerHTML = '<option value="" selected>Сначала выберите ученика</option>';
        document.getElementById('assistant-select').disabled = true;
        document.getElementById('task-number').value = '';
        document.getElementById('task-category').value = '';
        document.getElementById('task-lesson').value = '';
        document.getElementById('task-date').value = '';
        
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

// 5. ОТРИСОВКА ВЫДАННЫХ ЗАДАНИЙ (Монолитный список)
const q = query(collection(db, "personal_tasks"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('tasks-list');
    if (snapshot.empty) return list.innerHTML = '<p class="text-slate-400 italic p-6 text-center text-sm">Нет назначенных заданий.</p>';

    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);
    let count = 0;

    snapshot.forEach(docSnap => {
        count++;
        const t = docSnap.data();
        const tDate = new Date(t.date);
        
        const isPast = tDate < today;
        const opacityClass = isPast ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0 bg-slate-50" : "bg-white hover:bg-slate-50";

        // Красивое отображение напарника
        const astHtml = t.assistant ? `<span class="text-xs text-slate-500 font-medium ml-1">(Пом: <span class="font-bold text-sky-600">${t.assistant}</span>)</span>` : '';

        html += `
            <div class="flex items-center justify-between p-4 ${count > 1 ? 'border-t border-slate-100' : ''} transition-all ${opacityClass}">
                <div class="flex items-center w-full min-w-0 pr-4 gap-4">
                    <div class="flex flex-col items-center justify-center w-12 h-12 bg-sky-50 rounded-xl shrink-0 border border-sky-100 shadow-sm">
                        <span class="text-[8px] uppercase text-sky-500 font-bold leading-none mb-0.5 tracking-widest">${tDate.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}</span>
                        <span class="text-xl font-black leading-none text-sky-700">${tDate.getDate()}</span>
                    </div>
                    
                    <div class="flex flex-col min-w-0 truncate">
                        <div class="font-black text-slate-800 text-sm truncate flex items-center">
                            ${t.userName} ${astHtml}
                        </div>
                        <div class="flex items-center gap-2 mt-1 truncate">
                            <span class="text-[9px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded leading-none">№ ${t.taskNumber}</span>
                            <span class="text-[10px] font-bold text-sky-700 uppercase tracking-widest truncate">${t.category}</span>
                            <span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded leading-none shrink-0">Урок ${t.lesson}</span>
                        </div>
                    </div>
                </div>
                <button onclick="deleteTask('${docSnap.id}')" class="text-slate-300 hover:text-red-500 transition-colors p-2 text-lg outline-none shrink-0 bg-slate-50 rounded-lg border border-transparent hover:border-red-200" title="Удалить">🗑️</button>
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
