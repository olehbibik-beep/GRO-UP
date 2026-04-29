import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let allStudents = [];

// 1. ЗАГРУЖАЕМ ТОЛЬКО УЧЕНИКОВ (У кого isSchool == true)
const q = query(collection(db, "users"), where("isSchool", "==", true));
onSnapshot(q, (snapshot) => {
    const select = document.getElementById('student-select');
    select.innerHTML = '<option value="">-- Выберите ученика --</option>';
    
    if(snapshot.empty) {
        select.innerHTML = '<option value="">Нет участников школы (поставьте галочки в админке)</option>';
        return;
    }

    allStudents = [];
    snapshot.forEach(docSnap => {
        const student = { id: docSnap.id, name: docSnap.data().name };
        allStudents.push(student);
        select.innerHTML += `<option value="${student.id}">${student.name}</option>`;
    });
});

// 2. ОТПРАВКА ЗАДАНИЯ
document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const studentId = document.getElementById('student-select').value;
    const title = document.getElementById('task-title').value.trim();
    const date = document.getElementById('task-date').value;

    if (!studentId || !title || !date) {
        return alert("Пожалуйста, заполните все поля!");
    }

    const btn = e.target;
    btn.innerText = "Отправка...";
    btn.disabled = true;

    try {
        // Ищем имя выбранного ученика (для красивого отображения в списке)
        const studentName = allStudents.find(s => s.id === studentId).name;

        // Отправляем в коллекцию personal_tasks
        await addDoc(collection(db, "personal_tasks"), {
            userId: studentId,
            studentName: studentName,
            title: title,
            date: date,
            createdAt: new Date().toISOString()
        });

        // Очищаем форму
        document.getElementById('task-title').value = '';
        btn.innerText = "Успешно назначено! ✔️";
        setTimeout(() => { btn.innerText = "Назначить"; btn.disabled = false; }, 2000);

    } catch (error) {
        console.error(error);
        alert("Ошибка при назначении задания.");
        btn.innerText = "Назначить";
        btn.disabled = false;
    }
});

// 3. СПИСОК ВСЕХ НАЗНАЧЕННЫХ ЗАДАНИЙ (Для мониторинга)
onSnapshot(collection(db, "personal_tasks"), (snapshot) => {
    const container = document.getElementById('tasks-list');
    if (snapshot.empty) {
        container.innerHTML = '<p class="text-slate-500 italic">Пока нет выданных заданий.</p>';
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(docSnap => {
        const task = docSnap.data();
        // Форматируем дату для красоты
        const dateObj = new Date(task.date);
        const niceDate = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

        container.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <div>
                    <p class="font-bold text-sky-900 text-lg">${task.studentName}</p>
                    <p class="text-slate-600 font-medium">${task.title}</p>
                    <p class="text-xs text-slate-400 mt-1">📅 ${niceDate}</p>
                </div>
                <button onclick="deleteTask('${docSnap.id}')" class="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-50 rounded-lg font-bold">
                    Отменить
                </button>
            </div>
        `;
    });
});

window.deleteTask = (id) => {
    if(confirm("Удалить (отменить) это задание?")) {
        deleteDoc(doc(db, "personal_tasks", id));
    }
};
