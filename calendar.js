import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// 1. СОХРАНЕНИЕ СОБЫТИЯ
document.getElementById('save-event-btn').addEventListener('click', async (e) => {
    const title = document.getElementById('event-title').value.trim();
    const dateStr = document.getElementById('event-date').value;

    if (!title || !dateStr) return alert("Заполните название и дату!");

    const btn = e.target;
    btn.innerText = "Сохранение...";
    btn.disabled = true;

    try {
        await addDoc(collection(db, "events"), {
            title: title,
            date: dateStr, // Формат YYYY-MM-DD отлично подходит для сортировки
            createdAt: new Date().toISOString()
        });

        document.getElementById('event-title').value = '';
        document.getElementById('event-date').value = '';
        btn.innerText = "Опубликовано! ✔️";
        setTimeout(() => { btn.innerText = "Опубликовать"; btn.disabled = false; }, 2000);

    } catch (error) {
        alert("Ошибка сети.");
        btn.disabled = false;
    }
});

// 2. ЗАГРУЗКА И ОТОБРАЖЕНИЕ СОБЫТИЙ
// Сортируем по дате (от ближайших к дальним)
const q = query(collection(db, "events"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('events-list');
    
    if (snapshot.empty) {
        list.innerHTML = '<p class="text-slate-400 italic">Событий пока нет.</p>';
        return;
    }

    list.innerHTML = '';
    const today = new Date();
    today.setHours(0,0,0,0);

    snapshot.forEach(docSnap => {
        const ev = docSnap.data();
        const evDate = new Date(ev.date);
        
        // Красивое форматирование даты
        const niceDate = evDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Если событие уже прошло, делаем его серым
        const isPast = evDate < today;
        const colorClass = isPast ? "bg-slate-50 opacity-60 border-slate-200" : "bg-white border-rose-200 shadow-sm";
        const titleColor = isPast ? "text-slate-500" : "text-rose-900";

        list.innerHTML += `
            <div class="p-4 rounded-2xl border flex justify-between items-center group transition-all ${colorClass}">
                <div>
                    <h3 class="font-black ${titleColor} text-lg">${ev.title}</h3>
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
