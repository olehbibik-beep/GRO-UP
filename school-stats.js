import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 СЛОВАРЬ (Добавлены короткие названия для колонок таблицы)
const dict = {
    ru: {
        "btn_back": "Назад",
        "school_stats": "Статистика школы",
        "student_progress": "Аналитика заданий",
        "loading": "Загрузка...",
        "student_label": "Ученик",
        "th_total": "Всего",
        "cat_short_reading": "Чтение",
        "cat_short_conv": "Разговор",
        "cat_short_int": "Интерес",
        "cat_short_disc": "Ученики",
        "cat_short_bel": "Взгляды",
        "cat_short_talk": "Речь",
        "last_perf": "Последнее",
        "no_performances": "Нет",
        "unknown": "Неизвестно"
    },
    cs: {
        "btn_back": "Zpět",
        "school_stats": "Statistika školy",
        "student_progress": "Analytika úkolů",
        "loading": "Načítání...",
        "student_label": "Student",
        "th_total": "Celkem",
        "cat_short_reading": "Čtení",
        "cat_short_conv": "Rozhovor",
        "cat_short_int": "Zájem",
        "cat_short_disc": "Učedníci",
        "cat_short_bel": "Přesvědčení",
        "cat_short_talk": "Proslov",
        "last_perf": "Poslední",
        "no_performances": "Žádné",
        "unknown": "Neznámé"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key; 
};

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
    });
    document.querySelectorAll('[data-lang-title]').forEach(el => {
        el.setAttribute('title', window.t(el.getAttribute('data-lang-title')));
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}

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

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isSchool = roles.includes("Владелец") || roles.includes("Админ") || roles.includes("Ответственный за школу");
    if (!isSchool) window.location.href = 'index.html';
});

let allStudents = [];
let allTasks = [];

// 1. Загружаем учеников
onSnapshot(collection(db, "users"), (snapshot) => {
    allStudents = [];
    snapshot.forEach(d => {
        const u = d.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Участник школы')) {
            allStudents.push({ id: d.id, name: u.name, gender: u.gender });
        }
    });
    renderMatrix();
});

// 2. Загружаем все задания
onSnapshot(collection(db, "personal_tasks"), (snapshot) => {
    allTasks = [];
    snapshot.forEach(doc => {
        allTasks.push(doc.data());
    });
    renderMatrix();
});

// 3. Строим матрицу аналитики
function renderMatrix() {
    const list = document.getElementById('stats-list');
    if (!list) return;

    if (allStudents.length === 0) {
        list.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-400 italic">${window.t('loading')}</td></tr>`;
        return;
    }

    // Собираем данные
    let statsData = allStudents.map(student => {
        const userTasks = allTasks.filter(t => t.userId === student.id);
        userTasks.sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортируем от новых к старым

        // Считаем категории
        let counts = { reading: 0, conv: 0, int: 0, disc: 0, bel: 0, talk: 0 };
        
        userTasks.forEach(t => {
            if (t.category === 'ЧТЕНИЕ БИБЛИИ') counts.reading++;
            else if (t.category === 'НАЧИНАЙТЕ РАЗГОВОР') counts.conv++;
            else if (t.category === 'РАЗВИВАЙТЕ ИНТЕРЕС') counts.int++;
            else if (t.category === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') counts.disc++;
            else if (t.category === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') counts.bel++;
            else if (t.category === 'РЕЧЬ') counts.talk++;
        });

        return {
            ...student,
            totalTasks: userTasks.length,
            lastDate: userTasks.length > 0 ? new Date(userTasks[0].date) : null,
            counts: counts
        };
    });

    // Сортировка: сначала алфавит
    statsData.sort((a, b) => a.name.localeCompare(b.name));

    let html = '';

    statsData.forEach(s => {
        // Функция для рисования красивого бейджика (цифра в кружке)
        const renderBadge = (count, colorClass, bgClass) => {
            if (count === 0) return `<span class="text-slate-200">-</span>`;
            return `<div class="mx-auto w-6 h-6 rounded-full ${bgClass} ${colorClass} flex items-center justify-center text-[11px] font-black">${count}</div>`;
        };

        const totalBadge = s.totalTasks > 0 
            ? `<span class="font-black text-slate-700">${s.totalTasks}</span>` 
            : `<span class="text-slate-300">0</span>`;

        let lastDateStr = `<span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">${window.t('no_performances')}</span>`;
        if (s.lastDate) {
            lastDateStr = `<span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${s.lastDate.toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' })}</span>`;
        }

        // Блокируем женские/мужские задания визуально, если пол не позволяет
        const readingBadge = s.gender === 'girl' ? `<span class="text-slate-200">✖</span>` : renderBadge(s.counts.reading, 'text-emerald-700', 'bg-emerald-100');
        const talkBadge = s.gender === 'girl' ? `<span class="text-slate-200">✖</span>` : renderBadge(s.counts.talk, 'text-indigo-700', 'bg-indigo-100');

        html += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 font-black text-slate-800 sticky-col truncate">
                    ${s.name}
                    <span class="ml-1 text-xs opacity-50">${s.gender === 'girl' ? '👩‍💼' : '👨‍💼'}</span>
                </td>
                <td class="py-3 px-3 text-center border-l border-slate-100">${totalBadge}</td>
                
                <td class="py-3 px-2 text-center border-l border-slate-100">${readingBadge}</td>
                <td class="py-3 px-2 text-center border-l border-slate-100">${renderBadge(s.counts.conv, 'text-sky-700', 'bg-sky-100')}</td>
                <td class="py-3 px-2 text-center border-l border-slate-100">${renderBadge(s.counts.int, 'text-amber-700', 'bg-amber-100')}</td>
                <td class="py-3 px-2 text-center border-l border-slate-100">${renderBadge(s.counts.disc, 'text-purple-700', 'bg-purple-100')}</td>
                <td class="py-3 px-2 text-center border-l border-slate-100">${renderBadge(s.counts.bel, 'text-rose-700', 'bg-rose-100')}</td>
                <td class="py-3 px-2 text-center border-l border-slate-100">${talkBadge}</td>
                
                <td class="py-3 px-4 text-right border-l border-slate-100">${lastDateStr}</td>
            </tr>
        `;
    });

    list.innerHTML = html;
}
