import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Если уже авторизован, кидаем на главную
if (localStorage.getItem('userId')) window.location.href = 'index.html';

let selectedGender = null;

// ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
window.toggleView = (view) => {
    document.getElementById('login-section').classList.toggle('hidden', view !== 'login');
    document.getElementById('login-section').classList.toggle('block', view === 'login');
    document.getElementById('register-section').classList.toggle('hidden', view !== 'register');
    document.getElementById('register-section').classList.toggle('block', view === 'register');
};

// ВЫБОР ПОЛА
window.selectGender = (gender) => {
    selectedGender = gender;
    const boyBtn = document.getElementById('gender-boy');
    const girlBtn = document.getElementById('gender-girl');
    
    // Сбрасываем стили
    boyBtn.classList.add('opacity-50', 'grayscale'); boyBtn.classList.remove('border-indigo-500', 'bg-indigo-50');
    girlBtn.classList.add('opacity-50', 'grayscale'); girlBtn.classList.remove('border-indigo-500', 'bg-indigo-50');
    
    // Активируем выбранный
    if (gender === 'boy') {
        boyBtn.classList.remove('opacity-50', 'grayscale');
        boyBtn.classList.add('border-indigo-500', 'bg-indigo-50');
    } else {
        girlBtn.classList.remove('opacity-50', 'grayscale');
        girlBtn.classList.add('border-indigo-500', 'bg-indigo-50');
    }
};

// МАГИЯ ПИН-КОДА (Закрашивание кружочков)
const setupPinUI = (inputId, circlesId) => {
    const input = document.getElementById(inputId);
    const circles = document.getElementById(circlesId).children;

    input.addEventListener('input', (e) => {
        // Оставляем только цифры
        input.value = input.value.replace(/\D/g, ''); 
        const valLength = input.value.length;

        for (let i = 0; i < 6; i++) {
            if (i < valLength) {
                // Закрашиваем
                circles[i].classList.add('bg-indigo-600', 'border-indigo-600');
                circles[i].classList.remove('border-slate-300');
            } else {
                // Пустой
                circles[i].classList.remove('bg-indigo-600', 'border-indigo-600');
                circles[i].classList.add('border-slate-300');
            }
        }
    });
};

setupPinUI('login-pin', 'login-circles');
setupPinUI('reg-pin', 'reg-circles');

// ЛОГИКА АВТОРИЗАЦИИ (ВХОД)
document.getElementById('login-btn').addEventListener('click', async (e) => {
    const name = document.getElementById('login-name').value.trim();
    const pin = document.getElementById('login-pin').value;
    const btn = e.target;

    if (!name || pin.length !== 6) return alert("Введите имя и 6 цифр ПИН-кода!");

    btn.innerText = "Проверка..."; btn.disabled = true;

    try {
        const q = query(collection(db, "users"), where("name", "==", name), where("pin", "==", pin));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Нашли пользователя!
            const userDoc = snapshot.docs[0];
            localStorage.setItem('userId', userDoc.id);
            window.location.href = 'index.html';
        } else {
            alert("Неверное имя или ПИН-код!");
            btn.innerText = "Войти в систему"; btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert("Ошибка подключения к базе.");
        btn.innerText = "Войти в систему"; btn.disabled = false;
    }
});

// ЛОГИКА РЕГИСТРАЦИИ (СОЗДАТЬ)
document.getElementById('reg-btn').addEventListener('click', async (e) => {
    const name = document.getElementById('reg-name').value.trim();
    const pin = document.getElementById('reg-pin').value;
    const btn = e.target;

    if (!name || name.split(' ').length < 2) return alert("Пожалуйста, введите Имя и Фамилию!");
    if (!selectedGender) return alert("Выберите, кто вы: Брат или Сестра!");
    if (pin.length !== 6) return alert("ПИН-код должен состоять из 6 цифр!");

    btn.innerText = "Отправка..."; btn.disabled = true;

    try {
        // Проверяем, нет ли уже такого имени в базе
        const q = query(collection(db, "users"), where("name", "==", name));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert("Пользователь с таким именем уже существует!");
            btn.innerText = "Отправить заявку"; btn.disabled = false;
            return;
        }

        // Создаем профиль. По умолчанию статус "pending" (ожидает админа)
        const docRef = await addDoc(collection(db, "users"), {
            name: name,
            pin: pin,
            gender: selectedGender,
            status: "pending", // Скрипт в app.js увидит это и покажет экран загрузки
            roles: ["Участник"],
            group: "Без группы",
            createdAt: new Date().toISOString()
        });

        // Сразу авторизуем его
        localStorage.setItem('userId', docRef.id);
        window.location.href = 'index.html'; // Его встретит экран "Заявка на рассмотрении"

    } catch (err) {
        console.error(err);
        alert("Ошибка при регистрации.");
        btn.innerText = "Отправить заявку"; btn.disabled = false;
    }
});
