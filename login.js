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

// ВЫБОР ПОЛА (ИКОНКИ)
window.selectGender = (gender) => {
    selectedGender = gender;
    const boyBtn = document.getElementById('gender-boy');
    const girlBtn = document.getElementById('gender-girl');
    
    // Сбрасываем стили
    boyBtn.classList.add('opacity-50', 'grayscale', 'border-slate-200'); 
    boyBtn.classList.remove('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    
    girlBtn.classList.add('opacity-50', 'grayscale', 'border-slate-200'); 
    girlBtn.classList.remove('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    
    // Активируем выбранный
    if (gender === 'boy') {
        boyBtn.classList.remove('opacity-50', 'grayscale', 'border-slate-200');
        boyBtn.classList.add('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    } else {
        girlBtn.classList.remove('opacity-50', 'grayscale', 'border-slate-200');
        girlBtn.classList.add('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    }
};

// МАГИЯ ПИН-КОДА (Закрашивание кружочков)
const setupPinUI = (inputId, circlesId) => {
    const input = document.getElementById(inputId);
    const circles = document.getElementById(circlesId).children;

    input.addEventListener('input', (e) => {
        input.value = input.value.replace(/\D/g, ''); // Только цифры
        const valLength = input.value.length;

        for (let i = 0; i < 6; i++) {
            if (i < valLength) {
                circles[i].classList.add('bg-indigo-600', 'border-indigo-600');
                circles[i].classList.remove('border-slate-300');
            } else {
                circles[i].classList.remove('bg-indigo-600', 'border-indigo-600');
                circles[i].classList.add('border-slate-300');
            }
        }
    });
};

setupPinUI('login-pin', 'login-circles');
setupPinUI('reg-pin', 'reg-circles');

// УМНОЕ ФОРМАТИРОВАНИЕ ИМЕНИ (С большой буквы, остальное с маленькой)
const formatName = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ЛОГИКА АВТОРИЗАЦИИ (ВХОД)
document.getElementById('login-btn').addEventListener('click', async (e) => {
    const fname = document.getElementById('login-fname').value.trim();
    const lname = document.getElementById('login-lname').value.trim();
    const pin = document.getElementById('login-pin').value;
    const btn = e.target;

    if (!fname || !lname) return alert("Введите Имя и Фамилию!");
    if (pin.length !== 6) return alert("ПИН-код должен состоять из 6 цифр!");

    // Склеиваем красивое имя
    const fullName = formatName(fname) + " " + formatName(lname);

    btn.innerText = "ПРОВЕРКА..."; btn.disabled = true;

    try {
        const q = query(collection(db, "users"), where("name", "==", fullName), where("pin", "==", pin));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            localStorage.setItem('userId', userDoc.id);
            window.location.href = 'index.html';
        } else {
            alert("Пользователь не найден или ПИН-код неверен!");
            btn.innerText = "ВОЙТИ В СИСТЕМУ"; btn.disabled = false;
            // Очищаем пин
            document.getElementById('login-pin').value = '';
            document.getElementById('login-pin').dispatchEvent(new Event('input'));
        }
    } catch (err) {
        console.error(err);
        alert("Ошибка подключения к базе.");
        btn.innerText = "ВОЙТИ В СИСТЕМУ"; btn.disabled = false;
    }
});

// ЛОГИКА РЕГИСТРАЦИИ (СОЗДАТЬ)
document.getElementById('reg-btn').addEventListener('click', async (e) => {
    const fname = document.getElementById('reg-fname').value.trim();
    const lname = document.getElementById('reg-lname').value.trim();
    const pin = document.getElementById('reg-pin').value;
    const btn = e.target;

    if (!fname || !lname) return alert("Пожалуйста, заполните Имя и Фамилию!");
    if (!selectedGender) return alert("Укажите ваш пол (нажмите на иконку)!");
    if (pin.length !== 6) return alert("ПИН-код должен состоять из 6 цифр!");

    // Склеиваем красивое имя
    const fullName = formatName(fname) + " " + formatName(lname);

    btn.innerText = "ОТПРАВКА..."; btn.disabled = true;

    try {
        // Проверяем, нет ли уже такого имени
        const q = query(collection(db, "users"), where("name", "==", fullName));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert("Пользователь с таким именем уже существует!");
            btn.innerText = "ОТПРАВИТЬ ЗАЯВКУ"; btn.disabled = false;
            return;
        }

        // Создаем профиль
        const docRef = await addDoc(collection(db, "users"), {
            name: fullName,
            pin: pin,
            gender: selectedGender,
            status: "pending", 
            roles: ["Участник"],
            group: "Без группы",
            createdAt: new Date().toISOString()
        });

        // Сразу авторизуем
        localStorage.setItem('userId', docRef.id);
        window.location.href = 'index.html'; 

    } catch (err) {
        console.error(err);
        alert("Ошибка при регистрации.");
        btn.innerText = "ОТПРАВИТЬ ЗАЯВКУ"; btn.disabled = false;
    }
});
