import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ТОТ ЖЕ СЛОВАРЬ (СКОПИРОВАН)
const dict = {
    ru: {
        "btn_back": "Назад",
        "school_stats": "Статистика школы",
        "student_progress": "Успеваемость учеников",
        "loading": "Загрузка...",
        "total_performances": "Всего заданий:",
        "no_performances": "Еще не выступал",
        "last_perf": "Последнее:",
        "cat_reading_db": "📖 Чтение Библии",
        "cat_conversation": "🗣️ Разговор",
        "cat_interest": "🌱 Интерес",
        "cat_disciples": "👥 Подготавливайте",
        "cat_beliefs": "💡 Взгляды",
        "cat_talk_db": "🎙️ Речь"
    },
    cs: {
        "btn_back": "Zpět",
        "school_stats": "Statistika školy",
        "student_progress": "Pokrok studentů",
        "loading": "Načítání...",
        "total_performances": "Celkem úkolů:",
        "no_performances": "Zatím nevystupoval",
        "last_perf": "Poslední:",
        "cat_reading_db": "📖 Čtení Bible",
        "cat_conversation": "🗣️ Rozhovor",
        "cat_interest": "🌱 Zájem",
        "cat_disciples": "👥 Čiňte učedníky",
        "cat_beliefs": "💡 Přesvědčení",
        "cat_talk_db": "🎙️ Proslov"
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

onSnapshot(collection(db, "users"), (snapshot) => {
    allStudents = [];
    snapshot.forEach(d => {
        const u = d.data();
        if (u.status === 'active' && u.roles && u.roles.includes('Участник школы')) {
            allStudents.push({ id: d.id, name: u.name });
        }
    });
    renderStats();
});

onSnapshot(collection(db, "personal_tasks"), (snapshot) => {
    allTasks = [];
    snapshot.forEach(doc => {
        allTasks.push(doc.data());
    });
    renderStats();
});

window.toggleDetails = (id) => {
    const el = document.getElementById(`details-${id}`);
    if(el) el.classList.toggle('hidden');
};

function renderStats() {
    const list = document.getElementById('stats-list');
    if (!list) return;

    if (allStudents.length === 0) {
        list.innerHTML = `<p class="text-slate-400 italic p-6 text-center text-sm">${window.t('loading')}</p>`;
        return;
    }

    // Собираем статистику для каждого студента
    let statsData = allStudents.map(student => {
        const userTasks = allTasks.filter(t => t.userId === student.id);
        userTasks.sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортировка от новых к старым
        return {
            ...student,
            totalTasks: userTasks.length,
            tasks: userTasks
        };
    });

    // Сортируем: сначала те, у кого меньше всего заданий (или давно не выступали)
    statsData.sort((a, b) => a.totalTasks - b.totalTasks);

    let html = '';

    statsData.forEach((student, index) => {
        let lastPerfHtml = `<span class="text-rose-500">${window.t('no_performances')}</span>`;
        let detailsHtml = '';

        if (student.tasks.length > 0) {
            const lastTask = student.tasks[0];
            const lastDate = new Date(lastTask.date).toLocaleDateString(localeFormat, { day: 'numeric', month: 'short' });
            
            let catStr = lastTask.category;
            if (catStr === 'ЧТЕНИЕ БИБЛИИ') catStr = window.t('cat_reading_db').replace('📖 ','');
            if (catStr === 'НАЧИНАЙТЕ РАЗГОВОР') catStr = window.t('cat_conversation').replace('🗣️ ','');
            if (catStr === 'РАЗВИВАЙТЕ ИНТЕРЕС') catStr = window.t('cat_interest').replace('🌱 ','');
            if (catStr === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') catStr = window.t('cat_disciples').replace('👥 ','');
            if (catStr === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') catStr = window.t('cat_beliefs').replace('💡 ','');
            if (catStr === 'РЕЧЬ') catStr = window.t('cat_talk_db').replace('🎙️ ','');

            lastPerfHtml = `<span class="text-emerald-600">${window.t('last_perf')} ${lastDate} (${catStr})</span>`;

            detailsHtml = student.tasks.map(t => {
                const d = new Date(t.date).toLocaleDateString(localeFormat, { day: 'numeric', month: 'short', year: 'numeric' });
                
                let cStr = t.category;
                if (cStr === 'ЧТЕНИЕ БИБЛИИ') cStr = window.t('cat_reading_db').replace('📖 ','');
                if (cStr === 'НАЧИНАЙТЕ РАЗГОВОР') cStr = window.t('cat_conversation').replace('🗣️ ','');
                if (cStr === 'РАЗВИВАЙТЕ ИНТЕРЕС') cStr = window.t('cat_interest').replace('🌱 ','');
                if (cStr === 'ПОДГОТАВЛИВАЙТЕ УЧЕНИКОВ') cStr = window.t('cat_disciples').replace('👥 ','');
                if (cStr === 'ОБЪЯСНЯЙТЕ СВОИ ВЗГЛЯДЫ') cStr = window.t('cat_beliefs').replace('💡 ','');
                if (cStr === 'РЕЧЬ') cStr = window.t('cat_talk_db').replace('🎙️ ','');

                return `
                <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span class="text-xs font-bold text-slate-500">${d}</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-sky-600 truncate max-w-[150px] text-right">${cStr}</span>
                </div>`;
            }).join('');
        }

        html += `
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors" onclick="toggleDetails('${student.id}')">
                    <div>
                        <h3 class="font-black text-slate-800 text-sm md:text-base">${student.name}</h3>
                        <p class="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">${window.t('total_performances')} ${student.totalTasks}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-bold uppercase tracking-widest">${lastPerfHtml}</p>
                        <svg class="w-4 h-4 text-slate-300 inline-block mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                <div id="details-${student.id}" class="hidden bg-slate-50 px-4 py-2 border-t border-slate-100">
                    ${detailsHtml || `<p class="text-xs text-slate-400 italic py-2">${window.t('no_performances')}</p>`}
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}
