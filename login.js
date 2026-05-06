import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    enableIndexedDbPersistence, 
    doc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 ЕДИНЫЙ ЖЕЛЕЗОБЕТОННЫЙ СЛОВАРЬ (С ФРАЗАМИ ДЛЯ ЭКРАНА ВХОДА)
const dict = {
    ru: {
        "login_title": "Вход - GRO-UP",
        "system_desc": "Система управления собранием",
        "ph_fname": "Имя",
        "ph_lname": "Фамилия",
        "enter_pin": "Введите ПИН-код (6 цифр)",
        "btn_login": "Войти в систему",
        "btn_create_user": "Создать пользователя",
        "register_title": "Регистрация",
        "create_profile": "Создайте профиль",
        "create_pin": "Придумайте ПИН-код (6 цифр)",
        "btn_submit_request": "Отправить заявку",
        "btn_already_have_profile": "Уже есть профиль? Войти",
        "alert_enter_name": "Введите Имя и Фамилию!",
        "alert_pin_length_2": "ПИН-код должен состоять из 6 цифр!",
        "checking": "ПРОВЕРКА...",
        "alert_user_not_found": "Пользователь не найден или ПИН-код неверен. Если вы входите впервые — нужен интернет.",
        "alert_login_error": "Ошибка входа. Проверьте интернет или попробуйте позже.",
        "alert_fill_name": "Пожалуйста, заполните Имя и Фамилию!",
        "alert_select_gender": "Укажите ваш пол!",
        "sending": "ОТПРАВКА...",
        "alert_user_exists": "Пользователь с таким именем уже существует!",
        "alert_reg_error": "Ошибка при регистрации. Проверьте интернет."
    },
    cs: {
        "login_title": "Přihlášení - GRO-UP",
        "system_desc": "Systém správy sboru",
        "ph_fname": "Jméno",
        "ph_lname": "Příjmení",
        "enter_pin": "Zadejte PIN kód (6 číslic)",
        "btn_login": "Přihlásit se",
        "btn_create_user": "Vytvořit uživatele",
        "register_title": "Registrace",
        "create_profile": "Vytvořte si profil",
        "create_pin": "Vytvořte PIN kód (6 číslic)",
        "btn_submit_request": "Odeslat žádost",
        "btn_already_have_profile": "Máte již profil? Přihlásit se",
        "alert_enter_name": "Zadejte Jméno a Příjmení!",
        "alert_pin_length_2": "PIN kód musí mít přesně 6 číslic!",
        "checking": "KONTROLA...",
        "alert_user_not_found": "Uživatel nebyl nalezen nebo je nesprávný PIN kód. Pokud se přihlašujete poprvé — potřebujete internet.",
        "alert_login_error": "Chyba přihlášení. Zkontrolujte internet nebo zkuste později.",
        "alert_fill_name": "Prosím, vyplňte Jméno a Příjmení!",
        "alert_select_gender": "Vyberte své pohlaví!",
        "sending": "ODESÍLÁNÍ...",
        "alert_user_exists": "Uživatel s tímto jménem již existuje!",
        "alert_reg_error": "Chyba při registraci. Zkontrolujte internet."
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key; 
};

window.changeLanguage = (lang) => {
    localStorage.setItem('app_lang', lang);
    location.reload(); 
};

const applyTranslations = () => {
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = currentLang;

    document.querySelectorAll('[data-lang]').forEach(el => {
        el.innerHTML = window.t(el.getAttribute('data-lang'));
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder')));
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
    applyTranslations();
}
// =========================================================

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

// ЛОГИКА ВХОДА
document.getElementById('login-btn').addEventListener('click', async (e) => {
    const fname = document.getElementById('login-fname').value;
    const lname = document.getElementById('login-lname').value;
    const pin = document.getElementById('login-pin').value;
    const btn = e.target;

    if (!fname || !lname) return alert(window.t('alert_enter_name'));
    if (pin.length !== 6) return alert(window.t('alert_pin_length_2'));

    const fullName = formatName(fname) + " " + formatName(lname);
    btn.innerText = window.t('checking'); btn.disabled = true;

    try {
        const q = query(collection(db, "users"), where("name", "==", fullName), where("pin", "==", pin));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            localStorage.setItem('userId', userDoc.id);
            window.location.href = 'index.html';
        } else {
            alert(window.t('alert_user_not_found'));
            btn.innerText = window.t('btn_login').toUpperCase(); btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert(window.t('alert_login_error'));
        btn.innerText = window.t('btn_login').toUpperCase(); btn.disabled = false;
    }
});

// ЛОГИКА РЕГИСТРАЦИИ
document.getElementById('reg-btn').addEventListener('click', async (e) => {
    const fname = document.getElementById('reg-fname').value;
    const lname = document.getElementById('reg-lname').value;
    const pin = document.getElementById('reg-pin').value;
    const btn = e.target;

    if (!fname || !lname) return alert(window.t('alert_fill_name'));
    if (!selectedGender) return alert(window.t('alert_select_gender'));
    if (pin.length !== 6) return alert(window.t('alert_pin_length_2'));

    const fullName = formatName(fname) + " " + formatName(lname);
    btn.innerText = window.t('sending'); btn.disabled = true;

    try {
        const q = query(collection(db, "users"), where("name", "==", fullName));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert(window.t('alert_user_exists'));
            btn.innerText = window.t('btn_submit_request').toUpperCase(); btn.disabled = false;
            return;
        }

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
        alert(window.t('alert_reg_error'));
        btn.innerText = window.t('btn_submit_request').toUpperCase(); btn.disabled = false;
    }
});
