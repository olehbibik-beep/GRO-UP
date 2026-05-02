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

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ПРАВ ДОСТУПА
let myGroup = "Все"; 
let isFullAdmin = false;
let allEventsData = []; 

// ==========================================
// 1. ПРОВЕРКА ПРАВ И ЗАЩИТА СТРАНИЦЫ
// ==========================================
getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const userData = docSnap.data();
    const roles = userData.roles || [];
    
    // Сохраняем группу и статус админа ГЛОБАЛЬНО, чтобы использовать при отрисовке корзины
    myGroup = userData.group || "Все"; 
    isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    // Жесткая защита страниц от прямого входа
    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';

    // Принудительно перерисовываем список, так как теперь мы точно знаем права пользователя
    renderEvents();
});

// ==========================================
// 2. ЗАГРУЗКА БРАТЬЕВ ДЛЯ ВЫБОРА ВЕДУЩИХ
// ==========================================
onSnapshot(collection(db, "users"), (snapshot) => {
    const checklist = document.getElementById('users-checklist');
    if (!checklist) return;
    let html = '';
    
    let usersArr = [];
    snapshot.forEach(d => { if(d.data().status === 'active') usersArr.push(d.data().name); });
    usersArr.sort();

    usersArr.forEach(name => {
        html += `
            <label class="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                <input type="checkbox" value="${name}" class="leader-cb w-4 h-4 accent-rose-500 rounded shrink-0">
                <span class="text-xs font-bold text-slate-700">${name}</span>
            </label>
        `;
    });
    checklist.innerHTML = html || '<p class="text-xs text-slate-400 italic">Нет активных пользователей</p>';
});

// ==========================================
// 3. СОХРАНЕНИЕ СОБЫТИЙ (Умный генератор)
// ==========================================
document.getElementById('save-event-btn').addEventListener('click', async (e) => {
    const title = document.getElementById('event-title').value.trim();
    const dateStr = document.getElementById('event-date').value;
    const timeStr = document.getElementById('event-time').value || "";
    const groupVal = document.getElementById('event-group').value.trim();
    
    const isRecurring = document.getElementById('event-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('event-weeks').value) : 1;

    const selectedCBs = document.querySelectorAll('.leader-cb:checked');
    const leaders = Array.from(selectedCBs).map(cb => cb.value);

    if (!title || !dateStr) return alert("Заполните название и дату!");

    const btn = e.target;
    btn.innerText = "Генерация..."; btn.disabled = true;

    try {
        const baseDate = new Date(dateStr);

        for (let i = 0; i < weeksCount; i++) {
            const evDate = new Date(baseDate);
            evDate.setDate(evDate.getDate() + (i * 7)); 
            
            const yyyy = evDate.getFullYear();
            const mm = String(evDate.getMonth() + 1).padStart(2, '0');
            const dd = String(evDate.getDate()).padStart(2, '0');
            const newDateStr = `${yyyy}-${mm}-${dd}`;

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
        document.querySelectorAll('.leader-cb').forEach(cb => cb.checked = false);
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Успешно! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Опубликовать"; 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { alert("Ошибка сети."); btn.disabled = false; }
});

// ==========================================
// 4. ОТРИСОВКА КАЛЕНДАРЯ (С правильной корзиной)
// ==========================================
window.renderEvents = () => {
    const list = document.getElementById('events-list');
    const showAllCb = document.getElementById('show-all-events-cb');
    const showAll = showAllCb ? showAllCb.checked : false;
    
    if (allEventsData.length === 0) {
        if(list) list.innerHTML = '<p class="text-slate-400 italic p-6 text-center text-sm">Событий пока нет.</p>';
        return;
    }

    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);
    let eventCount = 0;

    allEventsData.forEach(docSnap => {
        const ev = docSnap.data();
        const evDate = new Date(ev.date);
        const evGroup = ev.group || "Все";

        // Проверяем, относится ли событие к моей группе
        const isMyGroupOrAll = (evGroup === "Все" || evGroup == myGroup);
        
        if (isMyGroupOrAll || showAll) {
            eventCount++;
            
            const isPast = evDate < today;
            const isOtherGroup = !isMyGroupOrAll;
            const opacityClass = (isPast || isOtherGroup) ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0" : "";
            const bgClass = isOtherGroup ? "bg-slate-50" : "bg-white hover:bg-slate-50";

            const niceDate = evDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            
            const groupBadge = evGroup !== "Все" 
                ? `<span class="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded font-black uppercase shrink-0">Гр. ${evGroup}</span>` 
                : `<span class="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded font-black uppercase shrink-0">Общее</span>`;
            
            const timeHtml = ev.time ? `<span class="text-xs font-mono font-black text-slate-400 mr-3 shrink-0">${ev.time}</span>` : '';
            const leaderHtml = ev.leader ? `<div class="text-[9px] uppercase font-bold text-slate-400 mt-1 truncate">Ведущий: <span class="text-rose-500 font-black">${ev.leader}</span></div>` : '';

            // КЛЮЧЕВАЯ ПРАВКА ЗДЕСЬ:
            // Если ты Админ - удаляешь всё. Если ты Надзиратель - удаляешь только своё и общее.
            const canDelete = isFullAdmin || isMyGroupOrAll;

            const deleteBtn = canDelete 
                ? `<button onclick="deleteEvent('${docSnap.id}')" class="text-slate-300 hover:text-red-500 transition-colors p-2 text-lg outline-none" title="Удалить">🗑️</button>` 
                : `<span class="text-[10px] text-slate-400 font-bold uppercase p-2">Чужое</span>`;

            html += `
                <div class="flex items-center justify-between p-4 border-b border-slate-100 transition-all ${bgClass} ${opacityClass}">
                    <div class="flex items-center w-full min-w-0 pr-4">
                        ${timeHtml}
                        <div class="flex flex-col min-w-0">
                            <div class="flex items-center gap-2 truncate">
                                <h3 class="font-black text-slate-800 text-sm truncate">${ev.title}</h3>
                                ${groupBadge}
                            </div>
                            <div class="flex items-center gap-2 mt-0.5 truncate">
                                <p class="text-[10px] font-bold uppercase tracking-widest ${isPast ? 'text-slate-400' : 'text-slate-500'}">📅 ${niceDate}</p>
                            </div>
                            ${leaderHtml}
                        </div>
                    </div>
                    ${deleteBtn}
                </div>
            `;
        }
    });

    if(list) list.innerHTML = html || '<p class="text-slate-400 italic p-6 text-center text-sm">Событий для вашей группы не найдено.</p>';
};

// Слушаем базу и перерисовываем
const q = query(collection(db, "events"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    allEventsData = snapshot.docs;
    renderEvents();
});

// Слушаем клик по галочке "Показать другие группы"
const showAllCb = document.getElementById('show-all-events-cb');
if(showAllCb) showAllCb.addEventListener('change', renderEvents);

// ==========================================
// 5. УДАЛЕНИЕ СОБЫТИЯ
// ==========================================
window.deleteEvent = (id) => {
    if (confirm("Удалить встречу из календаря?")) deleteDoc(doc(db, "events", id));
};
