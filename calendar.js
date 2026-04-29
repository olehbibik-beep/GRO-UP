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
const userId = localStorage.getItem('userId');

if (!userId) window.location.href = 'login.html';

// Проверка прав доступа
getDoc(doc(db, "users", userId)).then(docSnap => {
    if (docSnap.exists()) {
        const userRoles = docSnap.data().roles || [];
        if (!userRoles.some(r => ["Владелец", "Админ", "Надзиратель группы"].includes(r))) {
            window.location.href = 'index.html'; // Выкидываем обычных участников
        }
    }
});

document.getElementById('save-event-btn').addEventListener('click', async (e) => {
    const title = document.getElementById('event-title').value.trim();
    const dateStr = document.getElementById('event-date').value;
    const groupVal = document.getElementById('event-group').value.trim();

    if (!title || !dateStr) return alert("Заполните название и дату!");

    const btn = e.target;
    btn.innerText = "Сохранение..."; btn.disabled = true;

    try {
        await addDoc(collection(db, "events"), {
            title: title,
            date: dateStr,
            group: groupVal || "Все", // Записываем номер группы или "Все"
            createdAt: new Date().toISOString()
        });

        document.getElementById('event-title').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-group').value = '';
        btn.innerText = "Опубликовано! ✔️";
        setTimeout(() => { btn.innerText = "Опубликовать"; btn.disabled = false; }, 2000);
    } catch (error) { alert("Ошибка сети."); btn.disabled = false; }
});

const q = query(collection(db, "events"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('events-list');
    if (snapshot.empty) return list.innerHTML = '<p class="text-slate-400 italic">Событий пока нет.</p>';

    list.innerHTML = '';
    const today = new Date(); today.setHours(0,0,0,0);

    snapshot.forEach(docSnap => {
        const ev = docSnap.data();
        const evDate = new Date(ev.date);
        const niceDate = evDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const isPast = evDate < today;
        const colorClass = isPast ? "bg-slate-50 opacity-60 border-slate-200" : "bg-white border-rose-200 shadow-sm";
        const titleColor = isPast ? "text-slate-500" : "text-rose-900";
        
        // Показываем для какой группы это событие
        const groupBadge = ev.group !== "Все" ? `<span class="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-1 rounded ml-2 font-bold">Группа ${ev.group}</span>` : `<span class="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded ml-2 font-bold">Для всех</span>`;

        list.innerHTML += `
            <div class="p-4 rounded-2xl border flex justify-between items-center group transition-all ${colorClass}">
                <div>
                    <h3 class="font-black ${titleColor} text-lg flex items-center">${ev.title} ${groupBadge}</h3>
                    <p class="text-sm font-bold ${isPast ? 'text-slate-400' : 'text-rose-600'}">📅 ${niceDate}</p>
                </div>
                <button onclick="deleteEvent('${docSnap.id}')" class="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 font-bold bg-red-50 rounded-lg">Удалить</button>
            </div>
        `;
    });
});

window.deleteEvent = (id) => {
    if (confirm("Точно удалить это событие?")) deleteDoc(doc(db, "events", id));
};
