function selectRu() {
    document.getElementById("language").value = "russian";
    document.getElementById('selectGame').textContent = "Выберите игру";
}
function selectEn() {
    document.getElementById("language").value = "english";
    document.getElementById('selectGame').textContent = "Select game";
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Плавный скролл
    });
}

function getLanguage(){
    return document.getElementById("language");
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

function setLanguage(userLanguage) {

    if (userLanguage === 'russian' || userLanguage === 'uzbek' || userLanguage === 'azerbaijani') {
        selectRu();
    } else {
        selectEn();
    }
}

// Telegram theming + AMOLED
(function initTelegramTheme() {
    if (!window.Telegram || !window.Telegram.WebApp) return;
    const tp = window.Telegram.WebApp.themeParams || {};
    const root = document.documentElement;
    Object.entries(tp).forEach(([k, v]) => {
        root.style.setProperty(`--tg-${k}`, v);
    });
    document.body.classList.add('use-tg-theme');
    // AMOLED heuristic: if bg is near pure black or user prefers dark
    const bg = tp.bg_color || '#111';
    const isNearBlack = /^#0{3,6}$/i.test(bg) || ['#000', '#000000'].includes(bg.toLowerCase());
    if (window.Telegram.WebApp.colorScheme === 'dark' && isNearBlack) {
        document.body.classList.add('theme-amoled');
    }
})();

// Lazy loading + skeletons
(function initLazyLoading() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => card.classList.add('loading'));
    const loaded = new WeakSet();
    const onImgLoad = (img) => {
        const card = img.closest('.game-card');
        if (card && !loaded.has(card)) { card.classList.remove('loading'); loaded.add(card); }
    };
    document.querySelectorAll('.game-icon img').forEach(img => {
        if (img.complete) onImgLoad(img);
        else img.addEventListener('load', () => onImgLoad(img), { once: true });
        img.addEventListener('error', () => onImgLoad(img), { once: true });
    });
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            const img = card.querySelector('.game-icon img');
            if (img && img.loading === 'lazy') img.decoding = 'async';
            io.unobserve(card);
        });
    }, { rootMargin: '200px' });
    cards.forEach(el => io.observe(el));
})();

// Smart badges: last played and trending
(function smartBadges() {
    // Remove any existing continue badges and clear stored id
    try { document.querySelectorAll('.continue-badge').forEach(n => n.remove()); } catch {}
    try { localStorage.removeItem('last_game_id'); } catch {}
    // Trending: do not show for Avia Masters as requested
    document.querySelectorAll('#aviamasters .trend-badge').forEach(n => n.remove());
    const trends = Array.from(document.querySelectorAll('.hot-game'))
        .filter(el => el.id !== 'aviamasters')
        .slice(0, 1);
    trends.forEach(el => {
        const badge = document.createElement('div');
        badge.className = 'trend-badge';
        badge.textContent = 'Trend';
        el.appendChild(badge);
    });
    // Do not set last_game_id anymore
})();

// Parallax for bg spots on scroll
(function parallaxSpots() {
    const spots = document.querySelectorAll('.bg-spot');
    if (!spots.length) return;
    const onScroll = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        spots.forEach((s, i) => s.style.transform = `translateY(${y * (0.02 + i * 0.02)}px)`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Search/filter
(function searchFilter() {
    const input = document.getElementById('gamesSearch');
    if (!input) return;
    // Localized placeholder
    try {
        const lang = (document.getElementById('language')?.value || '').toLowerCase();
        if (lang === 'russian' || lang === 'uzbek' || lang === 'azerbaijani') input.placeholder = 'Поиск игр';
    } catch {}
    const normalize = (s) => (s || '').toLowerCase();
    const applyFilter = () => {
        const q = normalize(input.value);
        document.querySelectorAll('.game-card').forEach(card => {
            const title = card.querySelector('.game-title')?.textContent || '';
            const visible = normalize(title).includes(q) || normalize(card.id).includes(q);
            card.style.display = visible ? '' : 'none';
        });
    };
    input.addEventListener('input', applyFilter);
    // Hotkeys: Ctrl+K or / focuses search, Esc clears
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && e.key.toLowerCase() === 'k') || e.key === '/') {
            e.preventDefault(); input.focus(); input.select();
        } else if (e.key === 'Escape' && document.activeElement === input) {
            input.value = ''; applyFilter(); input.blur();
        } else if (e.key === 'Enter' && document.activeElement === input) {
            const first = Array.from(document.querySelectorAll('.game-card')).find(c => c.style.display !== 'none');
            if (first) first.click();
        }
    });
    applyFilter();
})();

// First-visit tooltips removed per request

// Haptic feedback on click (if available)
(function haptics() {
    if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.HapticFeedback) return;
    document.querySelectorAll('.game-card').forEach(c => {
        c.addEventListener('click', () => window.Telegram.WebApp.HapticFeedback.impactOccurred('soft'));
    });
})();

// Auto-hide scroll buttons when at top/bottom
(function scrollButtons() {
    const up = document.querySelector('.scroll-up');
    const down = document.querySelector('.scroll-down');
    if (!up || !down) return;
    const onScroll = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        up.style.opacity = y > 40 ? '1' : '0.3';
        const atBottom = (window.innerHeight + y) >= (document.body.offsetHeight - 40);
        down.style.opacity = atBottom ? '0.3' : '1';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Card ripple effect
(function ripple() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const r = document.createElement('span');
            r.className = 'ripple';
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            r.style.width = r.style.height = size + 'px';
            r.style.left = (e.clientX - rect.left - size / 2) + 'px';
            r.style.top = (e.clientY - rect.top - size / 2) + 'px';
            card.appendChild(r);
            setTimeout(() => r.remove(), 650);
        });
    });
})();

// Card tilt effect (lightweight)
(function tilt() {
    const damp = 16;
    const cards = document.querySelectorAll('.game-card');
    const move = (card, e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const rx = ((y / rect.height) - 0.5) * -damp;
        const ry = ((x / rect.width) - 0.5) * damp;
        card.style.transform = `translateY(-4px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const reset = (card) => { card.style.transform = ''; };
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => move(card, e));
        card.addEventListener('mouseleave', () => reset(card));
        card.addEventListener('touchmove', (e) => move(card, e), { passive: true });
        card.addEventListener('touchend', () => reset(card));
    });
})();