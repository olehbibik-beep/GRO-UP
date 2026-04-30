import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    enableIndexedDbPersistence, // Добавили поддержку оффлайна
    doc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- ВКЛЮЧАЕМ ОФФЛАЙН РЕЖИМ ---
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Оффлайн режим не включен: открыто много вкладок.");
    } else if (err.code == 'unimplemented') {
        console.warn("Браузер не поддерживает оффлайн режим.");
    }
});

// Если уже авторизован, кидаем на главную
if (localStorage.getItem('userId')) {
    window.location.href = 'index.html';
}

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
    
    boyBtn.classList.add('opacity-50', 'grayscale', 'border-slate-200'); 
    boyBtn.classList.remove('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    
    girlBtn.classList.add('opacity-50', 'grayscale', 'border-slate-200'); 
    girlBtn.classList.remove('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    
    if (gender === 'boy') {
        boyBtn.classList.remove('opacity-50', 'grayscale', 'border-slate-200');
        boyBtn.classList.add('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    } else {
        girlBtn.classList.remove('opacity-50', 'grayscale', 'border-slate-200');
        girlBtn.classList.add('border-indigo-500', 'bg-indigo-50', 'shadow-md');
    }
};

// ИНТЕРФЕЙС ПИН-КОДА
const setupPinUI = (inputId, circlesId) => {
    const input = document.getElementById(inputId);
    const circles = document.getElementById(circlesId).children;

    input.addEventListener('input', (e) => {
        input.value = input.value.replace(/\D/g, ''); 
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

const formatName = (str) => {
    if (!str) return "";
    return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
};

// ЛОГИКА ВХОДА (Использует кэш, если нет сети)
document.getElementById('login-btn').addEventListener('click', async (e) => {
    const fname = document.getElementById('login-fname').value;
    const lname = document.getElementById('login-lname').value;
    const pin = document.getElementById('login-pin').value;
    const btn = e.target;

    if (!fname || !lname) return alert("Введите Имя и Фамилию!");
    if (pin.length !== 6) return alert("ПИН-код должен состоять из 6 цифр!");

    const fullName = formatName(fname) + " " + formatName(lname);
    btn.innerText = "ПРОВЕРКА..."; btn.disabled = true;

    try {
        // Firebase сначала посмотрит в локальном кэше телефона
        const q = query(collection(db, "users"), where("name", "==", fullName), where("pin", "==", pin));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            localStorage.setItem('userId', userDoc.id);
            window.location.href = 'index.html';
        } else {
            alert("Пользователь не найден или ПИН-код неверен. Если вы входите впервые — нужен интернет.");
            btn.innerText = "ВОЙТИ В СИСТЕМУ"; btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert("Ошибка входа. Проверьте интернет или попробуйте позже.");
        btn.innerText = "ВОЙТИ В СИСТЕМУ"; btn.disabled = false;
    }
});

// ЛОГИКА РЕГИСТРАЦИИ (Очередь на отправку при появлении сети)
document.getElementById('reg-btn').addEventListener('click', async (e) => {
    const fname = document.getElementById('reg-fname').value;
    const lname = document.getElementById('reg-lname').value;
    const pin = document.getElementById('reg-pin').value;
    const btn = e.target;

    if (!fname || !lname) return alert("Пожалуйста, заполните Имя и Фамилию!");
    if (!selectedGender) return alert("Укажите ваш пол!");
    if (pin.length !== 6) return alert("ПИН-код должен состоять из 6 цифр!");

    const fullName = formatName(fname) + " " + formatName(lname);
    btn.innerText = "ОТПРАВКА..."; btn.disabled = true;

    try {
        // Регистрация требует проверки на дубликат (лучше делать с сетью)
        const q = query(collection(db, "users"), where("name", "==", fullName));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert("Пользователь с таким именем уже существует!");
            btn.innerText = "ОТПРАВИТЬ ЗАЯВКУ"; btn.disabled = false;
            return;
        }

        // addDoc сработает даже без сети (сохранит в очередь и отправит позже)
        const docRef = await addDoc(collection(db, "users"), {
            name: fullName,
            pin: pin,
            gender: selectedGender,
            status: "pending", 
            roles: ["Возвещатель"],
            group: "Без группы",
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('userId', docRef.id);
        window.location.href = 'index.html'; 

    } catch (err) {
        console.error(err);
        alert("Ошибка при регистрации. Проверьте интернет.");
        btn.innerText = "ОТПРАВИТЬ ЗАЯВКУ"; btn.disabled = false;
    }
});
