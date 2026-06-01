import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, deleteDoc, query, orderBy, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const dict = {
    ru: {
        "terr_title": "Управление Участками - GRO-UP", "terr_h1": "Участки", "manage_terr": "Управление территориями",
        "requests_title": "Запросы", "no_new_requests_terr": "Нет новых запросов", "issue_terr": "Выдать участок",
        "to_whom": "Кому выдать", "loading": "Загрузка...", "select_publisher": "Выберите возвещателя...",
        "terr_number_label": "Номер участка", "ph_terr_num": "Например: 105", "btn_assign": "Назначить",
        "in_progress": "В работе", "returned_territories": "Сданные участки", "ph_search_terr": "Поиск...",
        "th_number": "№", "th_publisher": "Возвещатель", "th_taken": "Взят", "th_returned_date": "Сдан",
        "th_action": "Действие", "back_home": "На главную", "saving": "Сохранение...", "success_tick": "Успешно!",
        "btn_force_return": "Отозвать", "btn_delete_returned": "Удалить", "all_terr_free": "Все участки свободны.",
        "no_returned_terr": "Нет сданных участков.", "alert_select_user_num": "Выберите пользователя и введите номер!",
        "alert_terr_already_issued": "❌ Этот участок уже выдан и находится в работе!", "confirm_return": "Принудительно отозвать участок?",
        "confirm_delete_returned": "Очистить этот участок из списка сданных?", "error_general": "Ошибка!", 
        "title_issue_terr": "Выдать участок", "delete": "Удалить", "btn_back": "Назад",
        "btn_map_db": "База карт", "days_short": "дн."
    },
    cs: {
        "terr_title": "Správa obvodů - GRO-UP", "terr_h1": "Obvody", "manage_terr": "Správa území",
        "requests_title": "Žádosti", "no_new_requests_terr": "Žádné nové žádosti", "issue_terr": "Vydat obvod",
        "to_whom": "Komu vydat", "loading": "Načítání...", "select_publisher": "Vyberte zvěstovatele...",
        "terr_number_label": "Číslo obvodu", "ph_terr_num": "Například: 105", "btn_assign": "Přiřadit",
        "in_progress": "V práci", "returned_territories": "Vrácené obvody", "ph_search_terr": "Hledat...",
        "th_number": "Č.", "th_publisher": "Zvěstovatel", "th_taken": "Vydáno", "th_returned_date": "Vráceno",
        "th_action": "Akce", "back_home": "Na hlavní stránku", "saving": "Ukládání...", "success_tick": "Úspěšně!",
        "btn_force_return": "Odebrat", "btn_delete_returned": "Smazat", "all_terr_free": "Všechny obvody jsou volné.",
        "no_returned_terr": "Žádné vrácené obvody.", "alert_select_user_num": "Vyberte uživatele a zadejte číslo!",
        "alert_terr_already_issued": "❌ Tento obvod je již vydán a zpracovává se!", "confirm_return": "Nuceně odebrat obvod?",
        "confirm_delete_returned": "Vymazat tento obvod ze seznamu vrácených?", "error_general": "Chyba!", 
        "title_issue_terr": "Vydat obvod", "delete": "Smazat", "btn_back": "Zpět",
        "btn_map_db": "Databáze map", "days_short": "dní"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => dict[currentLang][key] || key;

window.showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `bg-slate-800 text-white px-5 py-4 rounded-xl shadow-2xl text-sm font-black text-center transform -translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

const applyTranslations = () => {
    document.querySelectorAll('[data-lang]').forEach(el => { el.innerHTML = window.t(el.getAttribute('data-lang')); });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => { el.setAttribute('placeholder', window.t(el.getAttribute('data-lang-placeholder'))); });
    document.querySelectorAll('[data-lang-title]').forEach(el => { el.setAttribute('title', window.t(el.getAttribute('data-lang-title'))); });
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyTranslations);
else applyTranslations();

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
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    if (!isTerr) window.location.href = 'index.html';
});

// Загрузка возвещателей в селект
onSnapshot(collection(db, "users"), (snapshot) => {
    const select = document.getElementById('user-select');
    if (!select) return;
    let users = [];
    snapshot.forEach(d => {
        if(d.data().status === 'active') users.push({ id: d.id, name: d.data().name });
    });
    users.sort((a, b) => a.name.localeCompare(b.name));
    let html = `<option value="" disabled selected>${window.t('select_publisher')}</option>`;
    users.forEach(u => { html += `<option value="${u.id}|${u.name}">${u.name}</option>`; });
    select.innerHTML = html;
});

// ГЛОБАЛЬНЫЙ СПИСОК АКТИВНЫХ УЧАСТКОВ
let activeTerritoryNumbers = [];

onSnapshot(query(collection(db, "territories"), orderBy("issuedAt", "desc")), (snapshot) => {
    const activeList = document.getElementById('territories-list');
    const returnedList = document.getElementById('returned-territories-list');
    
    let activeHtml = '';
    let returnedHtml = '';
    activeTerritoryNumbers = []; 

    snapshot.forEach(docSnap => {
        const terr = docSnap.data();
        
        if (!terr.status || terr.status === 'active') {
            activeTerritoryNumbers.push(Number(terr.number)); 
            const issueDate = new Date(terr.issuedAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short'});
            const diffDays = Math.floor((new Date() - new Date(terr.issuedAt)) / (1000 * 60 * 60 * 24));
            
            let timeColorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
            if (diffDays >= 90) timeColorClass = "bg-red-50 text-red-600 border-red-200 animate-pulse";
            else if (diffDays >= 30) timeColorClass = "bg-amber-50 text-amber-600 border-amber-200";

            activeHtml += `
                <tr class="hover:bg-slate-50 transition-colors user-row border-b border-slate-100 last:border-0" data-search="${terr.number} ${terr.userName.toLowerCase()}">
                    <td class="py-2.5 px-4 text-center">
                        <span class="bg-emerald-50 text-emerald-700 font-mono font-black border border-emerald-200 px-2.5 py-1 rounded-md text-xs">${terr.number}</span>
                    </td>
                    <td class="py-2.5 px-4 font-black text-slate-800 text-[13px] truncate">${terr.userName}</td>
                    <td class="py-2.5 px-4 text-center">
                        <div class="text-[10px] font-bold text-slate-500 mb-0.5 whitespace-nowrap">${issueDate}</div>
                        <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${timeColorClass} inline-block">${diffDays} ${window.t('days_short')}</span>
                    </td>
                    <td class="py-2.5 px-4 text-right">
                        <button onclick="forceReturnTerritory('${docSnap.id}')" class="bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 p-1.5 rounded-lg transition-colors ml-auto outline-none shadow-sm" title="${window.t('btn_force_return')}">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                    </td>
                </tr>
            `;
        } else if (terr.status === 'returned') {
            const returnDate = terr.returnedAt ? new Date(terr.returnedAt).toLocaleDateString(localeFormat, {day: 'numeric', month: 'short'}) : '?';
            returnedHtml += `
                <tr class="hover:bg-rose-50 transition-colors border-b border-slate-100 last:border-0">
                    <td class="py-2 px-4 text-center">
                        <span class="text-rose-400 font-mono font-black text-sm">${terr.number}</span>
                    </td>
                    <td class="py-2 px-4 font-bold text-slate-600 text-xs truncate">${terr.userName}</td>
                    <td class="py-2 px-4 text-center text-[10px] font-bold text-rose-400">${returnDate}</td>
                    <td class="py-2 px-4 text-right">
                        <button onclick="deleteTerritory('${docSnap.id}')" class="text-slate-300 hover:text-red-500 p-1 rounded transition-colors ml-auto outline-none" title="${window.t('btn_delete_returned')}">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </td>
                </tr>
            `;
        }
    });

    if(activeList) activeList.innerHTML = activeHtml || `<tr><td colspan="4" class="text-slate-400 font-medium text-xs text-center py-8">${window.t('all_terr_free')}</td></tr>`;
    if(returnedList) returnedList.innerHTML = returnedHtml || `<tr><td colspan="4" class="text-slate-400 font-medium text-xs text-center py-6">${window.t('no_returned_terr')}</td></tr>`;
});

document.getElementById('assign-btn').addEventListener('click', async (e) => {
    const userData = document.getElementById('user-select').value;
    const terrNumStr = document.getElementById('territory-number').value.trim();
    if (!userData || !terrNumStr) return alert(window.t('alert_select_user_num'));
    
    const terrNum = Number(terrNumStr);
    if (activeTerritoryNumbers.includes(terrNum)) return alert(window.t('alert_terr_already_issued'));

    const btn = e.target;
    btn.innerText = window.t('saving'); btn.disabled = true;
    const [userId, userName] = userData.split('|');
    try {
        await addDoc(collection(db, "territories"), {
            number: terrNum,
            userId: userId,
            userName: userName,
            status: "active",
            issuedAt: new Date().toISOString()
        });
        document.getElementById('user-select').value = '';
        document.getElementById('territory-number').value = '';
        btn.classList.replace('bg-slate-800', 'bg-emerald-500');
        btn.innerHTML = window.t('success_tick');
        setTimeout(() => { 
            btn.classList.replace('bg-emerald-500', 'bg-slate-800');
            btn.innerText = window.t('btn_assign'); btn.disabled = false; 
        }, 2000);
    } catch (err) { alert(window.t('error_general')); btn.disabled = false; btn.innerText = window.t('btn_assign'); }
});

window.forceReturnTerritory = async (id) => { if (confirm(window.t('confirm_return'))) await deleteDoc(doc(db, "territories", id)); };
window.deleteTerritory = async (id) => { if (confirm(window.t('confirm_delete_returned'))) await deleteDoc(doc(db, "territories", id)); };

const searchEl = document.getElementById('search-terr');
if(searchEl) {
    searchEl.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.user-row');
        rows.forEach(row => {
            if (row.getAttribute('data-search').includes(term)) row.style.display = '';
            else row.style.display = 'none';
        });
    });
}

// ============================================
// 🔥 ЛОГИКА ИНТЕРАКТИВНОЙ КАРТЫ (LEAFLET + GEOMAN)
// ============================================
let editorMap = null;
let currentPolygonLayer = null;
let existingPolygonsLayerGroup = null; // Группа для старых участков
let allExistingMapData = []; // Кэш всех существующих участков

// Функция для отрисовки старых участков на редакторской карте
function renderExistingPolygonsOnEditor() {
    if (!editorMap) return;
    
    if (existingPolygonsLayerGroup) {
        editorMap.removeLayer(existingPolygonsLayerGroup);
    }
    existingPolygonsLayerGroup = L.layerGroup().addTo(editorMap);

    allExistingMapData.forEach(m => {
        if (m.hasPolygon && m.polygonCoords) {
            const latlngs = m.polygonCoords.map(p => [p.lat, p.lng]);
            
            // Существующие участки рисуем серым, полупрозрачным цветом
            const poly = L.polygon(latlngs, {
                color: '#94a3b8',       // Серый контур
                weight: 2,              // Тонкая линия
                dashArray: '4, 4',      // Пунктир
                fillColor: '#cbd5e1',   // Светло-серая заливка
                fillOpacity: 0.2,       
                interactive: true,      // Разрешаем клики для всплывающих подсказок
                pmIgnore: true          // 🔥 САМОЕ ГЛАВНОЕ: Геоман игнорирует этот слой!
            });

            // Показываем номер участка
            poly.bindTooltip(`№ ${m.num}`, {
                permanent: true,
                direction: 'center',
                className: 'bg-slate-700 text-white px-1.5 py-0.5 border-none rounded shadow-sm text-[10px] font-black'
            });

            poly.addTo(existingPolygonsLayerGroup);
        }
    });
}

window.openMapsModal = () => {
    document.getElementById('maps-modal').classList.replace('hidden', 'flex');
    
    if (!editorMap) {
        setTimeout(() => {
            editorMap = L.map('editor-map').setView([49.974, 12.700], 14); // Центр: Марианске-Лазне
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(editorMap);

            // === ГРАНИЦЫ СОБРАНИЯ (Mariánské Lázně) ===
            const cityBoundary = [
                [49.762638, 12.404806], [49.733720, 12.413257], [49.706275, 12.442696],
                [49.692883, 12.483003], [49.685730, 12.520048], [49.659490, 12.524038],
                [49.637595, 12.525053], [49.620210, 12.537888], [49.605940, 12.563586],
                [49.608063, 12.584177], [49.609018, 12.614063], [49.607108, 12.659840],
                [49.608868, 12.701759], [49.613171, 12.744105], [49.623351, 12.790354],
                [49.620677, 12.811054], [49.630270, 12.854405], [49.643882, 12.860074],
                [49.647625, 12.869134], [49.646347, 12.901715], [49.641114, 12.949541],
                [49.639451, 12.964528], [49.638745, 13.026727], [49.636160, 13.043097],
                [49.622405, 13.066341], [49.620638, 13.077260], [49.642093, 13.082883],
                [49.652862, 13.067399], [49.661167, 13.061963], [49.684710, 13.042125],
                [49.696519, 13.057605], [49.711157, 13.049344], [49.737032, 13.075511],
                [49.745860, 13.090464], [49.758391, 13.088168], [49.767682, 13.074769],
                [49.771180, 13.065581], [49.776888, 13.066254], [49.782047, 13.068638],
                [49.784766, 13.069866], [49.785789, 13.071170], [49.786017, 13.073924],
                [49.788125, 13.077771], [49.788716, 13.080709], [49.790221, 13.081899],
                [49.792451, 13.080407], [49.793940, 13.079845], [49.794734, 13.080809],
                [49.796182, 13.084925], [49.796243, 13.088396], [49.796493, 13.090975],
                [49.797423, 13.092379], [49.798288, 13.093284], [49.798938, 13.093896],
                [49.802714, 13.097843], [49.803922, 13.097765], [49.804300, 13.095917],
                [49.803761, 13.092835], [49.811132, 13.086538], [49.828153, 13.067798],
                [49.841433, 13.040319], [49.848450, 12.997812], [49.854120, 12.979033],
                [49.856936, 12.954019], [49.855896, 12.941722], [49.853831, 12.924183],
                [49.849221, 12.903905], [49.851137, 12.888613], [49.853205, 12.877172],
                [49.862712, 12.868898], [49.872234, 12.873504], [49.874074, 12.878526],
                [49.877967, 12.891579], [49.886986, 12.896973], [49.894926, 12.900252],
                [49.902971, 12.907937], [49.906174, 12.926354], [49.913779, 12.933967],
                [49.916793, 12.944688], [49.920883, 12.958058], [49.918926, 12.962926],
                [49.915415, 12.969016], [49.915449, 12.979913], [49.917970, 12.987808],
                [49.922365, 12.990560], [49.928565, 12.988663], [49.934970, 12.980036],
                [49.941487, 12.957473], [49.947034, 12.950448], [49.954511, 12.947171],
                [49.965853, 12.948901], [49.971373, 12.952215], [49.977745, 12.965412],
                [49.978775, 12.995759], [49.985707, 13.012018], [49.991920, 13.016657],
                [49.998658, 13.013203], [50.000668, 13.006235], [50.000446, 12.979959],
                [50.003458, 12.940115], [50.005655, 12.913972], [50.006518, 12.896448],
                [50.008018, 12.883788], [50.011389, 12.870988], [50.016578, 12.861334],
                [50.042324, 12.859146], [50.047436, 12.850052], [50.048259, 12.808401],
                [50.052522, 12.787885], [50.051300, 12.768339], [50.050447, 12.758568],
                [50.057922, 12.744062], [50.059510, 12.737128], [50.059853, 12.727839],
                [50.053037, 12.703228], [50.043466, 12.693114], [50.030028, 12.689805],
                [50.018791, 12.683851], [50.017013, 12.675724], [50.018933, 12.655038],
                [50.020765, 12.623165], [50.023575, 12.596141], [50.034415, 12.588492],
                [50.041073, 12.581870], [50.049509, 12.573893], [50.053277, 12.566160],
                [50.049356, 12.552020], [50.038839, 12.547940], [50.033051, 12.550032],
                [50.029773, 12.546458], [50.026140, 12.537401], [50.018102, 12.527514],
                [50.010528, 12.523957], [50.006796, 12.508941], [49.981593, 12.489888],
                [49.972102, 12.499310], [49.969792, 12.493562], [49.966777, 12.493795],
                [49.961852, 12.490864], [49.960622, 12.491437], [49.958438, 12.490433],
                [49.957892, 12.488292], [49.958453, 12.483193], [49.958025, 12.480578],
                [49.956466, 12.477640], [49.953216, 12.474882], [49.952305, 12.475075],
                [49.948291, 12.469947], [49.946787, 12.469745], [49.943096, 12.472102],
                [49.938454, 12.474968], [49.935506, 12.478642], [49.936539, 12.493798],
                [49.933198, 12.493167], [49.932545, 12.498164], [49.927585, 12.512151],
                [49.927584, 12.522963], [49.924634, 12.538534], [49.922711, 12.544699],
                [49.920400, 12.547813], [49.916179, 12.548351], [49.913048, 12.549166],
                [49.909827, 12.551128], [49.903146, 12.550917], [49.895473, 12.545024],
                [49.891335, 12.540008], [49.890924, 12.535302], [49.883408, 12.524112],
                [49.880116, 12.520458], [49.877058, 12.518639], [49.869078, 12.518578],
                [49.861422, 12.514108], [49.858686, 12.510673], [49.857488, 12.507820],
                [49.857009, 12.497694], [49.855010, 12.498489], [49.847481, 12.499572],
                [49.837469, 12.497958], [49.841975, 12.483019], [49.833212, 12.473006],
                [49.823528, 12.475038], [49.814792, 12.472150], [49.810171, 12.465074],
                [49.787588, 12.471540], [49.762638, 12.404806]
            ];

            // Рисуем некликабельную границу
            L.polygon(cityBoundary, {
                color: '#3b82f6', 
                weight: 4,        
                fill: false,      
                dashArray: '10, 10', 
                interactive: false,
                pmIgnore: true // 🔥 Игнорируем в редакторе (чтобы случайно не зацепить)
            }).addTo(editorMap);

            editorMap.pm.addControls({
                position: 'topleft',
                drawMarker: false,
                drawCircleMarker: false,
                drawPolyline: false,
                drawRectangle: false,
                drawCircle: false,
                drawText: false,
                editMode: true,
                dragMode: true,
                cutPolygon: false,
                removalMode: true,
            });

            editorMap.pm.setGlobalOptions({
                pathOptions: { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.4 }
            });

            editorMap.on('pm:create', e => {
                if (currentPolygonLayer) editorMap.removeLayer(currentPolygonLayer);
                currentPolygonLayer = e.layer;
            });

            editorMap.on('pm:remove', e => {
                if (e.layer === currentPolygonLayer) currentPolygonLayer = null;
            });
            
            renderExistingPolygonsOnEditor(); // Отрисовка всех готовых участков
            
        }, 100);
    } else {
        // Если карта уже инициализирована, просто обновляем размер и участки
        setTimeout(() => {
            editorMap.invalidateSize();
            renderExistingPolygonsOnEditor();
        }, 100);
    }
};

window.closeMapsModal = () => {
    document.getElementById('maps-modal').classList.replace('flex', 'hidden');
    document.getElementById('map-num').value = '';
    document.getElementById('map-city').value = '';
    if (currentPolygonLayer) {
        editorMap.removeLayer(currentPolygonLayer);
        currentPolygonLayer = null;
    }
};

document.getElementById('save-map-btn').addEventListener('click', async (e) => {
    const num = document.getElementById('map-num').value.trim();
    const city = document.getElementById('map-city').value.trim();
    
    if (!num) return alert("Введите номер участка!");
    
    let polygonCoords = null;
    if (currentPolygonLayer) {
        const latlngs = currentPolygonLayer.getLatLngs()[0];
        polygonCoords = latlngs.map(l => ({ lat: l.lat, lng: l.lng }));
    }

    if (!polygonCoords || polygonCoords.length < 3) return alert("Пожалуйста, нарисуйте на карте контур участка (многоугольник)!");

    const btn = e.target;
    btn.disabled = true; btn.innerText = "Сохранение...";
    
    try {
        const mapData = { 
            city: city || "Без города",
            polygon: polygonCoords,
            updatedAt: new Date().toISOString() 
        };

        await setDoc(doc(db, "territory_maps", num), mapData, { merge: true });
        
        document.getElementById('map-num').value = '';
        document.getElementById('map-city').value = '';
        if (currentPolygonLayer) { editorMap.removeLayer(currentPolygonLayer); currentPolygonLayer = null; }
        
        btn.innerText = "Сохранить карту";
        btn.disabled = false;
        window.showToast("Карта сохранена!");
    } catch (err) { 
        console.error(err);
        alert("Ошибка при сохранении!"); 
        btn.disabled = false; 
        btn.innerText = "Сохранить карту"; 
    }
});

onSnapshot(collection(db, "territory_maps"), (snapshot) => {
    const list = document.getElementById('maps-list');
    if (!list) return;
    
    let maps = [];
    allExistingMapData = []; // Очищаем кэш для карты

    snapshot.forEach(d => {
        const data = d.data();
        const mapObj = {
            num: parseInt(d.id), 
            city: data.city || 'Без города', 
            hasPolygon: !!data.polygon,
            polygonCoords: data.polygon, // Сохраняем гео-координаты для отрисовки
            id: d.id 
        };
        maps.push(mapObj);
        allExistingMapData.push(mapObj); // Помещаем в кэш
    });
    
    maps.sort((a,b) => a.num - b.num);

    // Если модальное окно с картой сейчас открыто, сразу обновляем подложку
    if (editorMap) {
        renderExistingPolygonsOnEditor();
    }

    const groupedMaps = {};
    maps.forEach(m => {
        const groupKey = Math.floor(m.num / 10) * 10; 
        if(!groupedMaps[groupKey]) groupedMaps[groupKey] = [];
        groupedMaps[groupKey].push(m);
    });

    let html = '';
    
    for (const [groupKey, groupMaps] of Object.entries(groupedMaps)) {
        const groupTitle = `${groupKey} — ${parseInt(groupKey) + 9}`;
        
        let groupHtml = `<details class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-2 group">
            <summary class="font-black text-slate-700 p-3 cursor-pointer outline-none flex justify-between items-center hover:bg-slate-100 transition-colors">
                <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-emerald-500 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                    Участки ${groupTitle}
                </div>
                <span class="bg-white border border-slate-200 text-slate-500 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">${groupMaps.length}</span>
            </summary>
            <div class="p-2 space-y-1.5 border-t border-slate-200 bg-white">`;
            
        groupMaps.forEach(m => {
            const mapBadge = m.hasPolygon ? `<span class="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">КАРТА</span>` : `<span class="bg-slate-100 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">ФОТО</span>`;
            groupHtml += `
            <div class="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded-lg">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="bg-slate-800 text-white font-black font-mono text-[10px] px-2 py-1 rounded shrink-0 shadow-sm">${m.num}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase ml-1 truncate max-w-[80px]">${m.city}</span>
                    ${mapBadge}
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="deleteMap('${m.id}')" class="text-slate-300 hover:text-red-500 p-1.5 outline-none transition-colors" title="${window.t('delete')}">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>`;
        });
        
        groupHtml += `</div></details>`;
        html += groupHtml;
    }

    list.innerHTML = html || `<p class="text-xs italic text-slate-400 text-center py-4">Архив пуст</p>`;
});

window.deleteMap = async (id) => {
    if(confirm(window.t('delete') + "?")) await deleteDoc(doc(db, "territory_maps", id));
};
