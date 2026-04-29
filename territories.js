import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, addDoc, deleteDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let allActiveUsers = [];

// 1. ЗАГРУЖАЕМ СПИСОК АКТИВНЫХ ПОЛЬЗОВАТЕЛЕЙ (Для выпадающего списка)
onSnapshot(collection(db, "users"), (snapshot) => {
    const select = document.getElementById('user-select');
    select.innerHTML = '<option value="">-- Выберите возвещателя --</option>';
    allActiveUsers = [];
    
    snapshot.forEach(docSnap => {
        const user = docSnap.data();
        if(user.status === 'active') {
            allActiveUsers.push({ id: docSnap.id, name: user.name });
            select.innerHTML += `<option value="${docSnap.id}">${user.name}</option>`;
        }
    });
});

// 2. СЛУШАЕМ ВХОДЯЩИЕ ЗАПРОСЫ
const reqQuery = query(collection(db, "requests"), where("type", "==", "territory"));
onSnapshot(reqQuery, (snapshot) => {
    const container = document.getElementById('requests-list');
    document.getElementById('requests-count').innerText = snapshot.size;

    if (snapshot.empty) {
        container.innerHTML = '<p class="text-slate-400 italic text-sm">Нет новых запросов.</p>';
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(docSnap => {
        const req = docSnap.data();
        const date = new Date(req.createdAt).toLocaleDateString();
        
        container.innerHTML += `
            <div class="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p class="font-bold text-amber-900 text-sm">${req.userName}</p>
                <p class="text-xs text-amber-700 mt-1">Просит участок (${date})</p>
                <div class="mt-2 flex gap-2">
                    <button onclick="prepareAssign('${req.userId}', '${docSnap.id}')" class="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-600 transition">Выдать</button>
                    <button onclick="deleteRequest('${docSnap.id}')" class="text-red-500 bg-white border border-red-200 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 font-bold transition">Удалить</button>
                </div>
            </div>
        `;
    });
});

// Функция, которая подставляет имя из запроса в форму
let currentRequestId = null; // Запоминаем ID запроса, чтобы удалить его после выдачи
window.prepareAssign = (userId, reqId) => {
    document.getElementById('user-select').value = userId;
    document.getElementById('territory-number').focus();
    currentRequestId = reqId; 
};

window.deleteRequest = (reqId) => { deleteDoc(doc(db, "requests", reqId)); };

// 3. ВЫДАЧА УЧАСТКА
document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const userId = document.getElementById('user-select').value;
    const number = document.getElementById('territory-number').value.trim();

    if (!userId || !number) return alert("Выберите кому и введите номер!");

    const btn = e.target;
    btn.innerText = "Оформляем...";
    btn.disabled = true;

    try {
        const userName = allActiveUsers.find(u => u.id === userId).name;

        // Добавляем участок в базу
        await addDoc(collection(db, "territories"), {
            userId: userId,
            userName: userName,
            number: number,
            issuedAt: new Date().toISOString()
        });

        // Если мы выдавали по запросу, удаляем этот запрос
        if (currentRequestId) {
            await deleteDoc(doc(db, "requests", currentRequestId));
            currentRequestId = null;
        }

        document.getElementById('territory-number').value = '';
        document.getElementById('user-select').value = '';
        btn.innerText = "Выдано! ✔️";
        setTimeout(() => { btn.innerText = "Назначить"; btn.disabled = false; }, 2000);

    } catch (error) {
        console.error(error);
        alert("Ошибка!");
        btn.innerText = "Назначить";
        btn.disabled = false;
    }
});

// 4. СПИСОК ВЫДАННЫХ УЧАСТКОВ
onSnapshot(collection(db, "territories"), (snapshot) => {
    const container = document.getElementById('territories-list');
    
    if (snapshot.empty) {
        container.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">Нет выданных участков</td></tr>';
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(docSnap => {
        const terr = docSnap.data();
        const niceDate = new Date(terr.issuedAt).toLocaleDateString('ru-RU');

        container.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 text-center font-black text-emerald-600 text-xl">${terr.number}</td>
                <td class="p-4 font-bold text-slate-800">${terr.userName}</td>
                <td class="p-4 text-slate-500 text-sm">${niceDate}</td>
                <td class="p-4 text-right">
                    <button onclick="revokeTerritory('${docSnap.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all">
                        Забрать
                    </button>
                </td>
            </tr>
        `;
    });
});

window.revokeTerritory = (id) => {
    if(confirm("Участок сдан? (Запись будет удалена)")) {
        deleteDoc(doc(db, "territories", id));
    }
};
