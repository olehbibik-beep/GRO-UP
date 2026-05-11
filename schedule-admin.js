import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-slate-800 text-white px-4 py-3 rounded-md shadow-lg text-xs font-bold text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

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

// ПРОВЕРКА ПРАВ
getDoc(doc(db, "users", userId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const canAccess = roles.includes("Ответственный за график") || roles.includes("Владелец") || roles.includes("Админ");
    
    if (!canAccess) window.location.href = 'index.html';
    else {
        loadUsersForDatalists();
        setCurrentWeek();
    }
});

// ГЕНЕРАЦИЯ БЛОКОВ СЛУЖЕНИЯ (4 пункта по умолчанию)
function initMinistryParts() {
    const container = document.getElementById('ministry-parts');
    let html = '';
    
    for(let i = 1; i <= 4; i++) {
        html += `
            <div class="flex items-end gap-4">
                <div class="w-1/3 shrink-0 flex flex-col gap-2">
                    <input type="text" id="part-min-${i}-student" list="list-school" class="jw-input text-sm" placeholder="Участник">
                    <input type="text" id="part-min-${i}-assistant" list="list-school" class="jw-input text-xs text-slate-500" placeholder="Помощник">
                </div>
                <div class="w-2/3 flex flex-col justify-end pb-1">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black text-jw-ministry">${i}.</span>
                        <input type="text" id="part-min-${i}-type" class="jw-title-input text-jw-ministry" placeholder="Вид задания (Разговор, Интерес...)">
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ЗАГРУЗКА БРАТЬЕВ И УЧАСТНИКОВ ШКОЛЫ В DATALIST
function loadUsersForDatalists() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        const listBrothers = document.getElementById('list-brothers');
        const listSchool = document.getElementById('list-school');
        
        let brothersHtml = '';
        let schoolHtml = '';
        
        let allUsers = [];
        snapshot.forEach(docSnap => allUsers.push(docSnap.data()));
        allUsers.sort((a,b) => a.name.localeCompare(b.name));

        allUsers.forEach(u => {
            if (u.status !== 'active') return;
            
            // Братья (для проведения пунктов)
            if (u.gender === 'boy') {
                brothersHtml += `<option value="${u.name}">`;
            }
            
            // Участники школы (братья и сестры)
            if (u.roles && u.roles.includes('Участник школы')) {
                schoolHtml += `<option value="${u.name}">`;
            }
        });

        listBrothers.innerHTML = brothersHtml;
        listSchool.innerHTML = schoolHtml;
    });
}

function setCurrentWeek() {
    initMinistryParts();
    
    // Устанавливаем текущую неделю в input type="week"
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    const weekInput = document.getElementById('week-selector');
    weekInput.value = `${today.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    
    document.getElementById('schedule-form').classList.remove('hidden');
    loadSchedule();
}

window.loadSchedule = async () => {
    const weekId = document.getElementById('week-selector').value;
    if(!weekId) return;

    // Очистка формы
    document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');

    try {
        const docSnap = await getDoc(doc(db, "meeting_schedules", weekId));
        if (docSnap.exists()) {
            const d = docSnap.data();
            
            // Заполнение данных
            document.getElementById('part-chairman').value = d.chairman || '';
            document.getElementById('part-prayer').value = d.prayer || '';
            
            document.getElementById('part-treasure-name').value = d.treasure_name || '';
            document.getElementById('part-treasure-title').value = d.treasure_title || '';
            document.getElementById('part-gems-name').value = d.gems_name || '';
            document.getElementById('part-reading-name').value = d.reading_name || '';
            
            for(let i = 1; i <= 4; i++) {
                if(d.ministry && d.ministry[i-1]) {
                    document.getElementById(`part-min-${i}-student`).value = d.ministry[i-1].student || '';
                    document.getElementById(`part-min-${i}-assistant`).value = d.ministry[i-1].assistant || '';
                    document.getElementById(`part-min-${i}-type`).value = d.ministry[i-1].type || '';
                }
            }
            
            document.getElementById('part-local-name').value = d.local_name || '';
            document.getElementById('part-cbs-conductor').value = d.cbs_conductor || '';
            document.getElementById('part-cbs-reader').value = d.cbs_reader || '';
            document.getElementById('part-cbs-material').value = d.cbs_material || '';
        }
    } catch(e) {
        console.error(e);
    }
};

window.saveSchedule = async () => {
    const weekId = document.getElementById('week-selector').value;
    if(!weekId) return;

    const btn = document.getElementById('save-btn');
    btn.innerText = "Сохранение...";
    btn.disabled = true;

    // Сбор данных из Навыков Служения
    let ministryArray = [];
    for(let i = 1; i <= 4; i++) {
        ministryArray.push({
            student: document.getElementById(`part-min-${i}-student`).value.trim(),
            assistant: document.getElementById(`part-min-${i}-assistant`).value.trim(),
            type: document.getElementById(`part-min-${i}-type`).value.trim()
        });
    }

    const scheduleData = {
        weekId: weekId,
        chairman: document.getElementById('part-chairman').value.trim(),
        prayer: document.getElementById('part-prayer').value.trim(),
        
        treasure_name: document.getElementById('part-treasure-name').value.trim(),
        treasure_title: document.getElementById('part-treasure-title').value.trim(),
        gems_name: document.getElementById('part-gems-name').value.trim(),
        reading_name: document.getElementById('part-reading-name').value.trim(),
        
        ministry: ministryArray,
        
        local_name: document.getElementById('part-local-name').value.trim(),
        cbs_conductor: document.getElementById('part-cbs-conductor').value.trim(),
        cbs_reader: document.getElementById('part-cbs-reader').value.trim(),
        cbs_material: document.getElementById('part-cbs-material').value.trim(),
        
        updatedAt: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "meeting_schedules", weekId), scheduleData);
        window.showToast("Сохранено!");
        btn.innerText = "Сохранить";
    } catch (e) {
        alert("Ошибка сохранения!");
        btn.innerText = "Сохранить";
    }
    btn.disabled = false;
};
