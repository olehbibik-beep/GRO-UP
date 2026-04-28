import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const listElement = document.getElementById('categories-list');

// Слушаем изменения в базе в реальном времени
onSnapshot(collection(db, "categories"), (snapshot) => {
    listElement.innerHTML = ''; // Очищаем список перед обновлением
    snapshot.forEach((doc) => {
        const cat = doc.data();
        listElement.innerHTML += `
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <span class="text-3xl">${cat.icon || '👥'}</span>
                    <h2 class="text-xl font-bold ml-2 inline">${cat.name}</h2>
                </div>
                <span class="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                    ${cat.count || 0}
                </span>
            </div>
        `;
    });
});