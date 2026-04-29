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
            window.location.href = 'index.html';
        }
    }
});

document.getElementById('save-event-btn').addEventListener('click', async (e) => {
    const title = document.getElementById('event-title').value.trim();
    const dateStr = document.getElementById('event-date').value;
    const timeStr = document.getElementById('event-time').value || "";
    const groupVal = document.getElementById('event-group').value.trim();
    const leadersStr = document.getElementById('event-leaders').value.trim();
    
    const isRecurring = document.getElementById('event-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('event-weeks').value) : 1;

    if (!title || !dateStr) return alert("Заполните название и дату!");

    const btn = e.target;
    btn.innerText = "Генерация..."; btn.disabled = true;

    // Разбиваем строку ведущих на массив: "Иванов, Петров" -> ["Иванов", "Петров"]
    const leaders = leadersStr ? leadersStr.split(',').map(s => s.trim()).filter(s => s) : [];

    try {
        const baseDate = new Date(dateStr);

        // Цикл генерации событий
        for (let i = 0; i < weeksCount; i++) {
            const evDate = new Date(baseDate);
            evDate.setDate(evDate.getDate() + (i * 7)); // Прибавляем по 7 дней
            
            // Форматируем дату обратно в YYYY-MM-DD для сортировки БД
            const yyyy = evDate.getFullYear();
            const mm = String(evDate.getMonth() + 1).padStart(2, '0');
            const dd = String(evDate.getDate()).padStart(2, '0');
            const newDateStr = `${yyyy}-${mm}-${dd}`;

            // Очередность: берем остаток от деления, чтобы циклично ходить по массиву
            let assignedLeader = "";
            if (leaders.length > 0) {
                assignedLeader = leaders[i % leaders.length];
            }

            await addDoc(collection(db, "events"), {
                title: title,
                date: newDateStr,
                time: timeStr,
                group: groupVal || "Все",
                leader: assignedLeader,
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('event-title').value = '';
        document.getElementById('event-leaders').value = '';
        btn.innerText = "Готово! ✔️";
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
        const colorClass = isPast ? "bg-slate-50 opacity-50 border-slate-200" : "bg-white border-slate-200 shadow-sm";
        const titleColor = isPast ? "text-slate-500" : "text-slate-900";
        
        const groupBadge = ev.group !== "Все" ? `<span class="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded ml-2 font-bold">Гр. ${ev.group}</span>` : ``;
        const timeHtml = ev.time ? `<span class="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">⌚ ${ev.time}</span>` : '';
        const leaderHtml = ev.leader ? `<p class="text-[10px] uppercase font-bold text-slate-400 mt-1">Ведущий: <span class="text-rose-600">${ev.leader}</span></p>` : '';

        list.innerHTML += `
            <div class="p-4 rounded-xl border flex justify-between items-center group transition-all ${colorClass}">
                <div>
                    <h3 class="font-black ${titleColor} text-lg flex items-center">${ev.title} ${groupBadge}</h3>
                    <div class="flex items-center gap-2 mt-1">
                        <p class="text-sm font-bold ${isPast ? 'text-slate-400' : 'text-slate-700'}">📅 ${niceDate}</p>
                        ${timeHtml}
                    </div>
                    ${leaderHtml}
                </div>
                <button onclick="deleteEvent('${docSnap.id}')" class="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 font-bold bg-red-50 rounded-lg shrink-0">Удалить</button>
            </div>
        `;
    });
});

window.deleteEvent = (id) => {
    if (confirm("Удалить это событие?")) deleteDoc(doc(db, "events", id));
};
