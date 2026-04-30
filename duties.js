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

// 1. ПРОВЕРКА ПРАВ И УМНОЕ МЕНЮ
const uid = typeof currentUserId !== 'undefined' ? currentUserId : userId;
getDoc(doc(db, "users", uid)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isSchool = isFullAdmin || roles.includes("Ответственный за школу");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    const isOverseer = isFullAdmin || roles.includes("Надзиратель группы");

    // Прячем иконки в боковой/нижней навигации, если нет прав
    const navAdmin = document.querySelector('nav a[href="admin.html"]'); if (navAdmin && !isFullAdmin) navAdmin.style.display = 'none';
    const navSchool = document.querySelector('nav a[href="school.html"]'); if (navSchool && !isSchool) navSchool.style.display = 'none';
    const navTerr = document.querySelector('nav a[href="territories.html"]'); if (navTerr && !isTerr) navTerr.style.display = 'none';
    const navCal = document.querySelector('nav a[href="calendar.html"]'); if (navCal && !isOverseer) navCal.style.display = 'none';
    const navDuties = document.querySelector('nav a[href="duties.html"]'); if (navDuties && !isOverseer) navDuties.style.display = 'none';

    // Жесткая защита: выкидываем на главную, если зашли по прямой ссылке без прав
    const path = window.location.pathname;
    if (path.includes('admin.html') && !isFullAdmin) window.location.href = 'index.html';
    if (path.includes('school.html') && !isSchool) window.location.href = 'index.html';
    if (path.includes('territories.html') && !isTerr) window.location.href = 'index.html';
    if ((path.includes('calendar.html') || path.includes('duties.html')) && !isOverseer) window.location.href = 'index.html';
});

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ФОРМАТИРОВАНИЯ ДАТ
const formatDateStr = (dateObj) => {
    const d = dateObj.getDate();
    const m = dateObj.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
    return `${d} ${m}`;
};

// СОХРАНЕНИЕ ГРАФИКА
document.getElementById('save-duty-btn').addEventListener('click', async (e) => {
    const type = document.getElementById('duty-type').value;
    const startGroup = document.getElementById('duty-group').value.trim();
    const dateStr = document.getElementById('duty-date').value;
    const isRecurring = document.getElementById('duty-recurring').checked;
    const weeksCount = isRecurring ? parseInt(document.getElementById('duty-weeks').value) : 1;

    if (!dateStr) return alert("Выберите дату начала недели!");

    const btn = e.target;
    btn.innerText = "Генерация..."; btn.disabled = true;

    try {
        const baseDate = new Date(dateStr);
        let currentGroupNum = startGroup ? parseInt(startGroup) : null;

        for (let i = 0; i < weeksCount; i++) {
            // Вычисляем начало и конец недели (Понедельник - Воскресенье)
            const weekStart = new Date(baseDate);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            // Форматируем красивую строку: "4 мая - 10 мая"
            const rangeStr = `${formatDateStr(weekStart)} - ${formatDateStr(weekEnd)}`;
            
            // Определяем группу (увеличиваем на 1 каждую неделю, если группа была указана)
            let assignedGroup = "Все";
            if (currentGroupNum !== null) {
                assignedGroup = currentGroupNum.toString();
                // Тут можно сделать сброс, если групп всего 5 (например: if(currentGroupNum > 5) currentGroupNum = 1;)
                // Но мы просто будем прибавлять +1
                currentGroupNum++;
            }

            await addDoc(collection(db, "duties"), {
                type: type,
                group: assignedGroup,
                dateRange: rangeStr,
                rawDate: weekStart.toISOString(), // Для правильной сортировки
                createdAt: new Date().toISOString()
            });
        }

        document.getElementById('duty-group').value = '';
        
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerText = "Успешно! ✔️";
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = "Назначить"; btn.disabled = false; 
        }, 2000);
    } catch (err) { alert("Ошибка!"); btn.disabled = false; btn.innerText = "Назначить"; }
});

// ОТРИСОВКА СПИСКА
const q = query(collection(db, "duties"), orderBy("rawDate", "asc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('duties-list');
    if (snapshot.empty) return list.innerHTML = '<p class="text-slate-400 italic p-6 text-center text-sm">График пуст.</p>';

    let html = '';
    const today = new Date(); today.setHours(0,0,0,0);
    let count = 0;

    snapshot.forEach(docSnap => {
        count++;
        const d = docSnap.data();
        // Считаем, что если дата начала недели старше 7 дней назад, то оно прошло
        const dDate = new Date(d.rawDate);
        const isPast = (today.getTime() - dDate.getTime()) > (7 * 24 * 60 * 60 * 1000); 
        
        const opacityClass = isPast ? "opacity-50 grayscale hover:opacity-100 bg-slate-50" : "bg-white";
        const groupBadge = d.group !== "Все" 
            ? `<span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0 border border-indigo-200">Группа ${d.group}</span>`
            : `<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0">Все</span>`;

        html += `
            <div class="flex items-center justify-between p-4 md:p-5 ${count > 1 ? 'border-t border-slate-100' : ''} transition-all ${opacityClass} relative group">
                <div class="flex items-center gap-4 w-full pr-10">
                    <div class="flex flex-col items-center justify-center w-12 h-12 bg-amber-50 rounded-xl shrink-0 border border-amber-100 shadow-sm">
                        <span class="text-2xl drop-shadow-sm">🗓️</span>
                    </div>
                    <div class="flex flex-col min-w-0 truncate">
                        <div class="flex items-center gap-2 truncate mb-1">
                            <h3 class="font-black text-slate-800 text-sm md:text-base leading-tight">${d.type}</h3>
                            ${groupBadge}
                        </div>
                        <span class="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-widest truncate">${d.dateRange}</span>
                    </div>
                </div>
                <button onclick="deleteDuty('${docSnap.id}')" class="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-slate-300 hover:text-red-500 bg-white border border-slate-100 shadow-sm rounded-full transition-colors z-10 outline-none" title="Удалить">🗑️</button>
            </div>
        `;
    });

    list.innerHTML = html;
});

window.deleteDuty = (id) => {
    if (confirm("Удалить дежурство?")) deleteDoc(doc(db, "duties", id));
};
