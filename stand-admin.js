window.renderUsersList = () => {
    const container = document.getElementById('users-list');
    if (!container) return;
    let html = '';

    window.activeUsersCache.forEach(u => {
        const roles = u.roles || [];
        const hasStand = roles.includes("Служение со стендом") || roles.includes("Владелец") || roles.includes("Админ");
        const groupStr = u.group && u.group !== "Без группы" ? u.group : "-";
        
        // Получаем кол-во служений (часов/смен)
        const shiftsCount = window.standStatsCache[u.name] || 0;
        
        // Расчет крошечной шкалы (максимум 50)
        let progressPercent = (shiftsCount / 50) * 100;
        if (progressPercent > 100) progressPercent = 100;
        
        // Цвета прогресса: до 10 зеленый, до 30 желтый, больше 30 красный
        let progressColor = 'bg-emerald-500';
        if (shiftsCount >= 30) progressColor = 'bg-rose-500';
        else if (shiftsCount >= 10) progressColor = 'bg-amber-500';

        // Микро-кнопка СЛЕВА
        const btnHtml = hasStand 
            ? `<button onclick="toggleStandRole('${u.id}', true)" class="w-7 h-7 shrink-0 bg-emerald-500 text-white rounded shadow-sm flex items-center justify-center outline-none active:scale-90 transition-transform" title="Забрать допуск"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></button>` 
            : `<button onclick="toggleStandRole('${u.id}', false)" class="w-7 h-7 shrink-0 bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500 rounded border border-slate-200 flex items-center justify-center outline-none active:scale-90 transition-transform" title="Выдать допуск"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg></button>`;

        html += `
            <div class="user-row flex items-center py-1.5 px-1 border-b border-slate-100 last:border-0" data-search="${u.name.toLowerCase()}">
                
                ${btnHtml}

                <div class="flex flex-col min-w-0 flex-grow pl-3">
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="font-bold text-slate-700 text-xs truncate leading-none">${u.name} <span class="text-[9px] font-medium text-slate-400 ml-1">Гр. ${groupStr}</span></span>
                        <span class="text-[9px] font-black text-slate-500 ml-2 leading-none">${shiftsCount}</span>
                    </div>
                    
                    <div class="w-full bg-slate-100 h-[3px] rounded-full overflow-hidden relative mt-0.5">
                        <div class="${progressColor} h-[3px] rounded-full transition-all duration-500 absolute left-0 top-0" style="width: ${progressPercent}%"></div>
                        <div class="absolute left-[20%] top-0 bottom-0 w-[1px] bg-white opacity-60"></div>
                        <div class="absolute left-[60%] top-0 bottom-0 w-[1px] bg-white opacity-60"></div>
                    </div>
                </div>

            </div>
        `;
    });
    
    container.innerHTML = html || `<p class="col-span-full text-slate-400 text-xs text-center py-4 italic">${window.t('no_approved')}</p>`;

    // Повторно применяем поиск
    const searchEl = document.getElementById('search-user');
    if (searchEl && searchEl.value) {
        const term = searchEl.value.toLowerCase();
        document.querySelectorAll('.user-row').forEach(row => {
            if (row.getAttribute('data-search').includes(term)) row.style.display = '';
            else row.style.display = 'none';
        });
    }
};
