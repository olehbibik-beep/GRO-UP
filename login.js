import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Если человек уже входил, сразу кидаем его на главную
if (localStorage.getItem('userId')) {
    window.location.href = 'index.html';
}

document.getElementById('login-btn').addEventListener('click', async (e) => {
    const nameInput = document.getElementById('user-name').value.trim();
    const pinInput = document.getElementById('user-pin').value.trim();
    
    if (nameInput === "" || pinInput === "") {
        return alert("Пожалуйста, заполните оба поля!");
    }

    const btn = e.target;
    btn.innerText = "Подключение...";
    btn.disabled = true;

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("name", "==", nameInput));
        const querySnapshot = await getDocs(q);

        let userId = "";

        if (!querySnapshot.empty) {
            // Пользователь найден
            const userDoc = querySnapshot.docs[0];
            if (userDoc.data().pin === pinInput) {
                userId = userDoc.id; // ПИН совпал
            } else {
                alert("Неверный ПИН-код!");
                btn.innerText = "Войти в систему";
                btn.disabled = false;
                return;
            }
        } else {
            // Новый пользователь (Создаем заявку)
            userId = 'user_' + Date.now();
            await setDoc(doc(db, "users", userId), {
                name: nameInput,
                pin: pinInput,
                status: "pending", // <--- Отправляем в режим ожидания
                role: "Участник",
                createdAt: new Date().toISOString()
            });
        }

        // Сохраняем в память телефона и ПЕРЕХОДИМ на главную
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', nameInput);
        window.location.href = 'index.html'; // <--- РЕДИРЕКТ

    } catch (error) {
        console.error(error);
        alert("Ошибка сети. Проверьте интернет.");
        btn.innerText = "Войти в систему";
        btn.disabled = false;
    }
});
