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

let myGroup = "Все"; 
let isFullAdmin = false;
let allEventsData = []; 

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const userData = docSnap.data();
    const roles = userData.roles || [];
    
    myGroup = userData.group || "Все"; 
    isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';

    if (allEventsData.length > 0) renderEvents();
});

const timeInput = document.getElementById('event-time');
if (timeInput) {
    timeInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, ''); 
        if (v.length > 2) v = v.substring(0, 2) + ':' + v.substring(2, 4);
        e.target.value = v;
    });
}

onSnapshot(collection(db, "users"), (snapshot) => {
    const list = document.getElementById('leaders-list');
    if (!list) return;
    
    let usersArr = [];
    
    snapshot.forEach(d => { 
        const u = d.data();
        if(u.status === 'active' && u.gender === 'boy') usersArr.push(u.name); 
    });
    usersArr.sort();

    let html = '';
    usersArr.forEach(name => { 
        html += `
        <label class="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <input type="checkbox" value="${name}" class="leader-checkbox accent-rose-600 w-4 h-4 rounded cursor-pointer">
            <span class="text-xs font-bold text-slate-700 select-none">${name}</span>
        </label>
        `; 
    });
    
    list.innerHTML = html || '<p class="text-xs text-slate-400 italic">Братья не найдены</p>';
});

document.getElementById('save-event-btn').addEventListener('click', async (e) => {
    const category = document.getElementById('event-category').value; // Новое поле
    const title = document.getElementById('event-title').value.trim();
    const dateStr = document.getElementById('event-date').value;
    const timeStr = document.getElementById('event-time').value || "";
    const groupVal = document.getElementById('event-group').value.trim();
    
    const selectedLeaders = Array.from(document.querySelectorAll('.leader-checkbox:checked')).map(cb => cb.value);
    
    const isRecurring = document.getElementById('event-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('event-weeks').value) : 1;

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

            let leaderForWeek = "";
            if (selectedLeaders.length > 0) {
                leaderForWeek = selectedLeaders[i % selectedLeaders.length];
            }

            await addDoc(collection(db, "events"), {
                title: title,
                date: newDateStr,
                time: timeStr,
                group: groupVal || "Все",
                leader: leaderForWeek,
                category: category, // Сохраняем тип события!
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('event-title').value = '';
        document.querySelectorAll('.leader-checkbox').forEach(cb => cb.checked = false);
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Успешно! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Опубликовать"; 
            btn.disabled = false; 
        }, 2000);
    } catch (error) { alert("Ошибка сети."); btn.disabled = false; }
});

window.renderEvents = () => {
    const list = document.getElementById('events-list');
    const showAllCb = document.getElementById('show-all-events-cb');
    const showAll = showAllCb ? showAllCb.checked : false;
    
    let html = '';
    const today = new Date(); 
    today.setHours(0,0,0,0);
    let activeCount = 0;

    allEventsData.forEach(docSnap => {
        const ev = docSnap.data();
        const evDate = new Date(ev.date);
        const evGroup = ev.group || "Все";

        if (evDate < today) {
            if (isFullAdmin) deleteDoc(doc(db, "events", docSnap.id));
            return; 
        }

        const isMyGroupOrAll = (evGroup === "Все" || evGroup == myGroup);
        
        if (isMyGroupOrAll || showAll) {
            activeCount++;
            
            const isOtherGroup = !isMyGroupOrAll;
            const opacityClass = isOtherGroup ? "opacity-50 hover:opacity-100 bg-slate-50" : "bg-white";
            const niceDate = evDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            
            const groupBadge = evGroup !== "Все" 
                ? `<span class="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] px-2 py-0.5 rounded-md font-black uppercase shrink-0">Гр. ${evGroup}</span>` 
                : `<span class="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-black uppercase shrink-0">Общее</span>`;
            
            const timeHtml = ev.time ? `<span class="text-xs font-mono font-black text-slate-400 mr-3 shrink-0">${ev.time}</span>` : '';
            const leaderHtml = ev.leader ? `<div class="text-[10px] uppercase font-bold text-slate-400 mt-1 truncate">Ведущий: <span class="text-rose-500 font-black">${ev.leader}</span></div>` : '';
            
            // Звездочка для особых событий
            const specialBadge = ev.category === 'special' ? `<span class="text-rose-500 text-xs ml-1" title="Особое событие">⭐</span>` : '';

            const canDelete = isFullAdmin || isMyGroupOrAll;

            const deleteBtn = canDelete 
                ? `<button onclick="deleteEvent('${docSnap.id}')" class="text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors p-2 text-lg outline-none border border-slate-100" title="Удалить">🗑️</button>` 
                : `<span class="text-[10px] text-slate-400 font-bold uppercase p-2">Чужое</span>`;

            html += `
                <div class="flex items-center justify-between p-4 border-b border-slate-100 transition-colors ${opacityClass}">
                    <div class="flex items-center w-full min-w-0 pr-4">
                        ${timeHtml}
                        <div class="flex flex-col min-w-0">
                            <div class="flex items-center gap-2 truncate">
                                <h3 class="font-black text-slate-800 text-sm truncate">${ev.title}${specialBadge}</h3>
                                ${groupBadge}
                            </div>
                            <div class="flex items-center gap-2 mt-0.5 truncate">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">📅 ${niceDate}</p>
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

const q = query(collection(db, "events"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
    allEventsData = snapshot.docs;
    renderEvents();
});

const showAllCb = document.getElementById('show-all-events-cb');
if(showAllCb) showAllCb.addEventListener('change', renderEvents);

window.deleteEvent = (id) => {
    if (confirm("Удалить встречу из календаря?")) deleteDoc(doc(db, "events", id));
};
