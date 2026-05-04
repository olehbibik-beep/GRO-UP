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

let isFullAdmin = false;

// ==========================================
// 1. ПРОВЕРКА ПРАВ
// ==========================================
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('duties.html') && !isOverseer) window.location.href = 'index.html';
});

// ==========================================
// 2. СОХРАНЕНИЕ (АВТОРАСКИДЫВАНИЕ)
// ==========================================
document.getElementById('save-duty-btn').addEventListener('click', async (e) => {
    const type = document.getElementById('duty-type').value;
    const groupVal = document.getElementById('duty-group').value.trim() || "Все"; // Теперь это строка!
    const dateStr = document.getElementById('duty-date').value;
    
    const isRecurring = document.getElementById('duty-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('duty-weeks').value) : 1;

    if (!dateStr) return alert("Выберите дату понедельника!");

    const btn = e.target;
    btn.innerText = "Генерация..."; btn.disabled = true;

    try {
        const baseDate = new Date(dateStr);
        // Защита от дурака: если выбрали не понедельник, отматываем к понедельнику
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); 
        baseDate.setDate(diff);

        // Разбиваем строку "1, 2" на массив ["1", "2"], если есть запятые
        let groupQueue = [groupVal];
        if (groupVal !== "Все") {
            groupQueue = groupVal.split(',').map(g => g.trim()).filter(g => g);
        }

        for (let i = 0; i < weeksCount; i++) {
            const startDate = new Date(baseDate);
            startDate.setDate(startDate.getDate() + (i * 7));
            
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            // Форматируем красиво "1 - 7 мая"
            const startStr = startDate.getDate();
            const endStr = endDate.getDate() + " " + endDate.toLocaleDateString('ru-RU', { month: 'long' });
            let niceDateRange = `${startStr} - ${endStr}`;
            if (startDate.getMonth() !== endDate.getMonth()) {
                niceDateRange = `${startDate.getDate()} ${startDate.toLocaleDateString('ru-RU', { month: 'short' })} - ${endStr}`;
            }

            // Магия групп: если мы авто-раскидываем "1, 2, 3", то они пойдут по очереди по неделям
            // Если введено только "1", то скрипт просто будет назначать 1 на каждую неделю
            const assignedGroup = groupQueue[i % groupQueue.length];

            await addDoc(collection(db, "duties"), {
                type: type,
                group: assignedGroup,
                dateRange: niceDateRange,
                rawDate: startDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('duty-group').value = '';
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Успешно! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Назначить"; 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { alert("Ошибка сети."); btn.disabled = false; btn.innerText = "Назначить"; }
});

// ==========================================
// 3. ОТРИСОВКА И АВТОУДАЛЕНИЕ ПРОШЛЫХ
// ==========================================
const q = query(collection(db, "duties"), orderBy("rawDate", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('duties-list');
    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);
    
    let renderedCount = 0;

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        
        const dutyStart = new Date(d.rawDate); dutyStart.setHours(0,0,0,0);
        // Неделя дежурства заканчивается в Воскресенье 23:59
        const dutyEnd = new Date(dutyStart); dutyEnd.setDate(dutyStart.getDate() + 6); dutyEnd.setHours(23,59,59,999);

        // 🔥 АВТОУДАЛЕНИЕ ПРОШЛОЙ НЕДЕЛИ: Если воскресенье этой недели уже прошло (меньше чем начало сегодняшнего дня)
        if (dutyEnd.getTime() < today.getTime()) {
            if (isFullAdmin) deleteDoc(doc(db, "duties", docSnap.id)); // Админ молча удаляет из базы
            return; // Не рисуем это на экране
        }

        renderedCount++;
        
        // Плоский дизайн, без теней
        html += `
            <div class="flex items-center justify-between p-4 border-b border-slate-100 transition-colors bg-white hover:bg-slate-50">
                <div class="flex items-center w-full min-w-0 pr-4">
                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2 truncate">
                            <h3 class="font-black text-slate-800 text-sm truncate">${d.type}</h3>
                            <span class="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-md font-black uppercase shrink-0">Гр. ${d.group}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-0.5 truncate">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">📅 ${d.dateRange}</p>
                        </div>
                    </div>
                </div>
                <button onclick="deleteDuty('${docSnap.id}')" class="text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 transition-colors p-2 rounded-lg text-lg outline-none border border-slate-100" title="Удалить">🗑️</button>
            </div>
        `;
    });

    if(list) list.innerHTML = html || '<p class="text-slate-400 italic p-6 text-center text-sm">Предстоящих дежурств нет.</p>';
});

window.deleteDuty = (id) => {
    if (confirm("Удалить дежурство из графика?")) deleteDoc(doc(db, "duties", id));
};
