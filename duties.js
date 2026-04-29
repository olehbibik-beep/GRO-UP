import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let activeUsers = [];

// 1. Загружаем пользователей
onSnapshot(collection(db, "users"), (snap) => {
    const select = document.getElementById('user-select');
    select.innerHTML = '<option value="">-- Выберите брата/сестру --</option>';
    activeUsers = [];
    snap.forEach(uDoc => {
        if(uDoc.data().status === 'active') {
            activeUsers.push({id: uDoc.id, name: uDoc.data().name});
            select.innerHTML += `<option value="${uDoc.id}">${uDoc.data().name}</option>`;
        }
    });
});

// 2. Сохраняем дежурство
document.getElementById('save-duty-btn').addEventListener('click', async (e) => {
    const userId = document.getElementById('user-select').value;
    const type = document.getElementById('duty-type').value;
    const dateRange = document.getElementById('duty-date-range').value.trim();

    if(!userId || !dateRange) return alert("Заполните все поля!");

    const btn = e.target;
    btn.innerText = "Сохранение...";
    btn.disabled = true;

    try {
        const userName = activeUsers.find(u => u.id === userId).name;
        await addDoc(collection(db, "duties"), {
            userId, userName, type, dateRange, createdAt: new Date().toISOString()
        });
        document.getElementById('duty-date-range').value = '';
        btn.innerText = "Назначено! ✔️";
        setTimeout(() => { btn.innerText = "Назначить"; btn.disabled = false; }, 2000);
    } catch(e) { alert("Ошибка!"); btn.disabled = false; }
});

// 3. Список дежурств
onSnapshot(collection(db, "duties"), (snap) => {
    const list = document.getElementById('duties-list');
    if(snap.empty) return list.innerHTML = '<p class="text-slate-400 italic">График пуст</p>';
    
    list.innerHTML = '';
    snap.forEach(dDoc => {
        const d = dDoc.data();
        list.innerHTML += `
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center group">
                <div>
                    <p class="text-amber-600 font-black text-xs uppercase">${d.type}</p>
                    <p class="font-bold text-slate-800 text-lg">${d.userName}</p>
                    <p class="text-sm text-slate-500">${d.dateRange}</p>
                </div>
                <button onclick="deleteDuty('${dDoc.id}')" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2">Удалить</button>
            </div>
        `;
    });
});

window.deleteDuty = (id) => { if(confirm("Удалить из графика?")) deleteDoc(doc(db, "duties", id)); };
