import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, getDoc, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

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
        "confirm_delete_returned": "Очистить этот участок из списка сданных?", "confirm_delete_request": "Удалить этот запрос?",
        "error_general": "Ошибка!", "title_issue_terr": "Выдать участок", "delete": "Удалить", "btn_back": "Назад",
        "btn_map_db": "База карт", "map_db_title": "База карт участков", "map_instruction": "Добавьте ссылку на Google My Maps и скриншот участка. Возвещатели смогут сами выбрать себе этот участок из списка доступных.",
        "map_url_ph": "Ссылка https://...", "btn_save_map": "Сохранить", "saved_maps": "Сохраненные карты (Сгруппировано)",
        "history_empty": "История пуста", "alert_fill_all": "Укажите номер и ссылку!", "add_photo": "Добавить фото",
        "days_short": "дн."
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
        "confirm_delete_returned": "Vymazat tento obvod ze seznamu vrácených?", "confirm_delete_request": "Smazat tuto žádost?",
        "error_general": "Chyba!", "title_issue_terr": "Vydat obvod", "delete": "Smazat", "btn_back": "Zpět",
        "btn_map_db": "Databáze map", "map_db_title": "Databáze map obvodů", "map_instruction": "Přidejte odkaz na Google My Maps a screenshot obvodu. Zvěstovatelé si budou moci sami vybrat tento obvod z dostupných.",
        "map_url_ph": "Odkaz https://...", "btn_save_map": "Uložit", "saved_maps": "Uložené mapy (Seskupeno)",
        "history_empty": "Historie je prázdná", "alert_fill_all": "Zadejte číslo a odkaz!", "add_photo": "Přidat fotku",
        "days_short": "dní"
    }
};

const currentLang = localStorage.getItem('app_lang') || 'ru';
const localeFormat = currentLang === 'cs' ? 'cs-CZ' : 'ru-RU';

window.t = (key) => {
    if (dict[currentLang] && dict[currentLang][key]) return dict[currentLang][key];
    return key; 
};

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
const storage = getStorage(app); 
const currentUserId = localStorage.getItem('userId');

if (!currentUserId) window.location.href = 'login.html';

getDoc(doc(db, "users", currentUserId)).then(docSnap => {
    if (!docSnap.exists()) return window.location.href = 'login.html';
    const roles = docSnap.data().roles || [];
    const isFullAdmin = roles.includes("Владелец") || roles.includes("Админ");
    const isTerr = isFullAdmin || roles.includes("Ответственный за участки");
    if (!isTerr) window.location.href = 'index.html';
});

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
    
    if (activeTerritoryNumbers.includes(terrNum)) {
        return alert(window.t('alert_terr_already_issued'));
    }

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

window.forceReturnTerritory = async (id) => {
    if (confirm(window.t('confirm_return'))) await deleteDoc(doc(db, "territories", id));
};

window.deleteTerritory = async (id) => {
    if (confirm(window.t('confirm_delete_returned'))) await deleteDoc(doc(db, "territories", id));
};

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

// БАЗА КАРТ (С ГРУППИРОВКОЙ)
let selectedMapImageFile = null;

window.openMapsModal = () => document.getElementById('maps-modal').classList.replace('hidden', 'flex');
window.closeMapsModal = () => {
    document.getElementById('maps-modal').classList.replace('flex', 'hidden');
    removeMapImage();
};

window.previewMapImage = (input) => {
    if (input.files && input.files[0]) {
        selectedMapImageFile = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('map-preview').src = e.target.result;
            document.getElementById('map-preview-container').classList.remove('hidden');
        };
        reader.readAsDataURL(selectedMapImageFile);
    }
};

window.removeMapImage = () => {
    selectedMapImageFile = null;
    document.getElementById('map-image').value = '';
    document.getElementById('map-preview-container').classList.add('hidden');
};

document.getElementById('save-map-btn').addEventListener('click', async (e) => {
    const num = document.getElementById('map-num').value.trim();
    const url = document.getElementById('map-url').value.trim();
    
    if (!num || !url) return alert(window.t('alert_fill_all'));
    
    const btn = e.target;
    btn.disabled = true; btn.innerText = window.t('saving');
    
    try {
        let imageUrl = null;
        if (selectedMapImageFile) {
            const fileName = `map_${num}_${Date.now()}`;
            const storageRef = ref(storage, `maps/${fileName}`);
            await uploadBytes(storageRef, selectedMapImageFile);
            imageUrl = await getDownloadURL(storageRef);
        }

        const mapData = { 
            url: url, 
            updatedAt: new Date().toISOString() 
        };
        if (imageUrl) mapData.imageUrl = imageUrl;

        await setDoc(doc(db, "territory_maps", num), mapData);
        
        document.getElementById('map-num').value = '';
        document.getElementById('map-url').value = '';
        removeMapImage();
        
        btn.innerText = window.t('btn_save_map');
        btn.disabled = false;
        window.showToast("Карта сохранена!");
    } catch (err) { 
        console.error(err);
        alert(window.t('error_general')); 
        btn.disabled = false; 
        btn.innerText = window.t('btn_save_map'); 
    }
});

onSnapshot(collection(db, "territory_maps"), (snapshot) => {
    const list = document.getElementById('maps-list');
    if (!list) return;
    
    let maps = [];
    snapshot.forEach(d => maps.push({ num: parseInt(d.id), url: d.data().url, img: d.data().imageUrl, id: d.id }));
    maps.sort((a,b) => a.num - b.num);

    // ГРУППИРОВКА ПО ДЕСЯТКАМ (например: 100-109)
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
            const photoBadge = m.img ? `<span class="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">ФОТО</span>` : '';
            groupHtml += `
            <div class="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded-lg">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="bg-slate-800 text-white font-black font-mono text-[10px] px-2 py-1 rounded shrink-0 shadow-sm">${m.num}</span>
                    ${photoBadge}
                    <a href="${m.url}" target="_blank" class="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline truncate">${m.url}</a>
                </div>
                <button onclick="deleteMap('${m.id}')" class="text-slate-300 hover:text-red-500 ml-2 p-1.5 outline-none transition-colors" title="${window.t('delete')}">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>`;
        });
        
        groupHtml += `</div></details>`;
        html += groupHtml;
    }

    list.innerHTML = html || `<p class="text-xs italic text-slate-400 text-center py-4">${window.t('history_empty')}</p>`;
});

window.deleteMap = async (id) => {
    if(confirm(window.t('delete') + "?")) await deleteDoc(doc(db, "territory_maps", id));
};
