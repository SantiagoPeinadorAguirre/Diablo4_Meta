// script.js
// Mostrará un modal al cargar la página para seleccionar el sector de camuflajes

let introAudio = null;

document.addEventListener('DOMContentLoaded', function() {
    setupIntroMusic();
    setupUserBaseBtn();
    setupLoginToggleBtn();
    setupMainAreaBtn();
    setupAreaSelectorBtns();
    setupUserStatsModal();
    setupGoldenClickSparkles();
    setupResetActiveUserOnReload();

    // Crear y configurar el botón adicional
    const userActionBtn = document.createElement('button');
    userActionBtn.id = 'user-action-btn';
    userActionBtn.textContent = 'Sign out';
    userActionBtn.style.display = 'none';
    userActionBtn.style.marginTop = '0';
    userActionBtn.style.background = 'rgba(24,18,11,0.92)';
    userActionBtn.style.color = '';
    userActionBtn.style.fontFamily = "'Montserrat', 'Segoe UI', Arial, sans-serif";
    userActionBtn.style.fontWeight = '600';
    userActionBtn.style.fontSize = '1.1rem';
    userActionBtn.style.padding = '0.7em 1.5em';
    userActionBtn.style.borderRadius = '14px';
    userActionBtn.style.border = 'none';
    userActionBtn.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.18)';
    userActionBtn.style.cursor = 'pointer';
    userActionBtn.style.transition = 'background 0.3s';

    const loginToggleBtn = document.getElementById('login-toggle-btn');
    loginToggleBtn.parentNode.insertBefore(userActionBtn, loginToggleBtn.nextSibling);

    // Restaurar estado visual cuando hay usuario activo guardado
    const currentUser = getCurrentUser();
    if (currentUser) {
        applyLoggedInUserButtonState(currentUser);
        userActionBtn.style.display = 'block';
    }

    userActionBtn.onclick = function() {
        logoutCurrentUser();
    };

    // Configurar botones del formulario de usuario
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    loginBtn.onclick = function() {
        openLinkedUsersFromLogin();
    };
    registerBtn.onclick = function() {
        handleNewUserLogin();
    };

    // Permitir Enter para registrar
    const usernameInput = document.getElementById('username-input');
    usernameInput.onkeydown = function(e) {
        if (e.key === 'Enter') {
            registerBtn.click();
        }
    };
});

function openLinkedUsersFromLogin() {
    const userBaseBtn = document.getElementById('user-base-btn');
    if (userBaseBtn) {
        userBaseBtn.click();
    }
}

function setupIntroMusic() {
    const audioPath = 'Call Of Duty_ Modern Warfare 2 OST - Extraction Point.mp3';
    introAudio = new Audio(audioPath);
    introAudio.preload = 'auto';
    introAudio.loop = true;

    const slider = document.getElementById('music-volume-slider');
    const muteBtn = document.getElementById('music-mute-btn');
    const volumeValue = document.getElementById('music-volume-value');
    const storedVolume = Number(localStorage.getItem('camoTrackerMusicVolume'));
    const storedMuted = localStorage.getItem('camoTrackerMusicMuted') === '1';
    const initialVolume = Number.isFinite(storedVolume) ? Math.min(1, Math.max(0, storedVolume)) : 0.45;

    if (slider) {
        slider.value = String(Math.round(initialVolume * 100));
    }

    function applyVolume(volume) {
        const safeVolume = Math.min(1, Math.max(0, Number(volume) || 0));
        introAudio.volume = safeVolume;
        if (volumeValue) {
            volumeValue.textContent = `${Math.round(safeVolume * 100)}%`;
        }
        localStorage.setItem('camoTrackerMusicVolume', String(safeVolume));
    }

    function syncMuteUi() {
        if (!muteBtn) {
            return;
        }

        const muted = !!introAudio.muted;
        muteBtn.textContent = muted ? 'Unmute' : 'Mute';
        muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
        muteBtn.classList.toggle('is-muted', muted);
    }

    applyVolume(initialVolume);
    introAudio.muted = storedMuted;
    syncMuteUi();

    if (slider && !slider.dataset.boundMusic) {
        slider.addEventListener('input', function() {
            applyVolume((Number(slider.value) || 0) / 100);
            if (introAudio.muted && (Number(slider.value) || 0) > 0) {
                introAudio.muted = false;
                localStorage.setItem('camoTrackerMusicMuted', '0');
                syncMuteUi();
            }
        });
        slider.dataset.boundMusic = '1';
    }

    if (muteBtn && !muteBtn.dataset.boundMusicMute) {
        muteBtn.addEventListener('click', function() {
            introAudio.muted = !introAudio.muted;
            localStorage.setItem('camoTrackerMusicMuted', introAudio.muted ? '1' : '0');
            syncMuteUi();

            if (!introAudio.muted && introAudio.paused) {
                introAudio.play().catch(function() {
                    // Playback may still require an interaction depending on browser policy.
                });
            }
        });
        muteBtn.dataset.boundMusicMute = '1';
    }

    let started = false;

    function startAudio() {
        if (started) {
            return;
        }

        introAudio.muted = true;
        introAudio.play().then(function() {
            started = true;

            // Try to switch from muted autoplay to audible playback immediately.
            if (localStorage.getItem('camoTrackerMusicMuted') !== '1') {
                introAudio.muted = false;
            }
            syncMuteUi();
            removeFallbackListeners();
        }).catch(function() {
            // Browsers can block autoplay with sound until user interaction.
        });
    }

    function removeFallbackListeners() {
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
        document.removeEventListener('touchstart', startAudio);
    }

    startAudio();
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });

    // If autoplay started muted, first interaction enables audible playback.
    document.addEventListener('click', function() {
        if (introAudio && localStorage.getItem('camoTrackerMusicMuted') !== '1') {
            introAudio.muted = false;
            syncMuteUi();
        }
    }, { once: true });
}

function setupGoldenClickSparkles() {
    document.addEventListener('click', function(e) {
        const sparkle = document.createElement('span');
        sparkle.className = 'golden-click-sparkle';
        sparkle.style.left = `${e.clientX}px`;
        sparkle.style.top = `${e.clientY}px`;
        document.body.appendChild(sparkle);

        sparkle.addEventListener('animationend', function() {
            sparkle.remove();
        });
    });
}

function mostrarLogin() {
    document.body.classList.remove('main-window-active');
    hideUserStatsModal();
    ocultarModalArea();
    ocultarUserBase();
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('logo-cod').style.display = 'none';
    document.getElementById('username-input').value = '';

    // Evento para los botones del formulario
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    loginBtn.onclick = function() {
        openLinkedUsersFromLogin();
    };
    registerBtn.onclick = function() {
        handleNewUserLogin();
    };

    // Permitir Enter para registrar
    const usernameInput = document.getElementById('username-input');
    usernameInput.onkeydown = function(e) {
        if (e.key === 'Enter') {
            registerBtn.click();
        }
    };
}

function setupUserStatsModal() {
    if (document.getElementById('user-stats-modal')) {
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'user-stats-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div id="user-stats-card">
            <button id="close-user-stats" aria-label="Close user stats">X</button>
            <h3>User Progress Summary</h3>
            <p id="stats-zombies">Zombies completed camos: 0</p>
            <p id="stats-multiplayer">Multiplayer completed camos: 0</p>
            <p id="stats-campaign">Campaign completed camos: 0</p>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('close-user-stats');
    closeBtn.onclick = function() {
        hideUserStatsModal();
    };
}

function showUserStatsModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }

    const base = getUserBase();
    const ficha = base[currentUser] || { camouflages: { zombies: [], multijugador: [], campaña: [] } };
    const zombiesCount = (ficha.camouflages.zombies || []).length;
    const multiplayerCount = (ficha.camouflages.multijugador || []).length;
    const campaignCount = (ficha.camouflages.campaña || []).length;

    document.getElementById('stats-zombies').textContent = `Zombies completed camos: ${zombiesCount}`;
    document.getElementById('stats-multiplayer').textContent = `Multiplayer completed camos: ${multiplayerCount}`;
    document.getElementById('stats-campaign').textContent = `Campaign completed camos: ${campaignCount}`;

    const modal = document.getElementById('user-stats-modal');
    modal.style.display = 'flex';
}

function hideUserStatsModal() {
    const modal = document.getElementById('user-stats-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function applyLoggedInUserButtonState(username) {
    const loginToggleBtn = document.getElementById('login-toggle-btn');
    loginToggleBtn.textContent = username;
    loginToggleBtn.style.cursor = 'pointer';
    loginToggleBtn.style.pointerEvents = 'auto';
    loginToggleBtn.style.background = 'rgba(24,18,11,0.92)';
    loginToggleBtn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    loginToggleBtn.style.transition = 'background 0.3s';
    loginToggleBtn.onclick = function() {
        showUserStatsModal();
    };
}

function logoutCurrentUser() {
    localStorage.removeItem('camoTrackerUser');
    hideUserStatsModal();
    location.reload();
}

function setupResetActiveUserOnReload() {
    window.addEventListener('beforeunload', function() {
        localStorage.removeItem('camoTrackerUser');
    });
}

function handleNewUserLogin() {
    const user = document.getElementById('username-input').value.trim();
    if (user.length === 0) {
        alert('enter a valid user name');
        return;
    }

    if (usernameExists(user)) {
        alert('username used');
        return;
    }

    setCurrentUser(user);
    ensureUserFicha(user);
    iniciarSesion(user);
}

function usernameExists(username) {
    const base = getUserBase();
    return Object.keys(base).some(existing => existing.toLowerCase() === username.toLowerCase());
}

function setupAreaSelectorBtns() {
    const zombiesBtn = document.getElementById('select-zombies-btn');
    const multiplayerBtn = document.getElementById('select-multiplayer-btn');
    const campaignBtn = document.getElementById('select-campaign-btn');

    zombiesBtn.onclick = function() {
        mostrarCamuflajes('zombies');
    };

    multiplayerBtn.onclick = function() {
        mostrarCamuflajes('multijugador');
    };

    campaignBtn.onclick = function() {
        mostrarCamuflajes('campaña');
    };
}

function iniciarSesion(username) {
    document.getElementById('login-section').style.display = 'none';
    mostrarModalSector();

    // Activar botón de usuario para abrir su resumen
    applyLoggedInUserButtonState(username);

    // Mostrar el botón de cerrar sesión
    const userActionBtn = document.getElementById('user-action-btn');
    if (!userActionBtn) {
        const newUserActionBtn = document.createElement('button');
        newUserActionBtn.id = 'user-action-btn';
        newUserActionBtn.textContent = 'Sign out';
        newUserActionBtn.style.marginTop = '0';
        newUserActionBtn.style.background = 'rgba(24,18,11,0.92)';
        newUserActionBtn.style.color = '';
        newUserActionBtn.style.fontFamily = "'Montserrat', 'Segoe UI', Arial, sans-serif";
        newUserActionBtn.style.fontWeight = '600';
        newUserActionBtn.style.fontSize = '1.1rem';
        newUserActionBtn.style.padding = '0.7em 1.5em';
        newUserActionBtn.style.borderRadius = '14px';
        newUserActionBtn.style.border = 'none';
        newUserActionBtn.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.18)';
        newUserActionBtn.style.cursor = 'pointer';
        newUserActionBtn.style.transition = 'background 0.3s';

        loginToggleBtn.parentNode.insertBefore(newUserActionBtn, loginToggleBtn.nextSibling);

        newUserActionBtn.onclick = function() {
            logoutCurrentUser();
        };
    } else {
        userActionBtn.style.display = 'block';
        userActionBtn.textContent = 'Sign out';
    }
}

// --- MODAL DE USUARIOS VINCULADOS ---
function setupUserBaseBtn() {
    const btn = document.getElementById('user-base-btn');
    const modal = document.getElementById('user-base-modal');
    const closeBtn = document.getElementById('close-user-base');
    const userList = document.getElementById('user-list');
    btn.style.display = 'block';
    btn.disabled = false;
    btn.onclick = function() {
        document.body.classList.remove('main-window-active');
        ocultarModalArea();
        ocultarLogin();
        userList.innerHTML = '';
        const base = getUserBase();
        Object.keys(base).forEach(username => {
            const li = document.createElement('li');
            li.className = 'linked-user-option';
            li.textContent = username;
            li.style.cursor = 'pointer';
            li.onclick = function() {
                setCurrentUser(username);
                modal.style.display = 'none';
                ensureUserFicha(username);
                iniciarSesion(username);
                // Mostrar automáticamente el dashboard visual del área por defecto (zombies)
                mostrarCamuflajes('zombies');
            };
            userList.appendChild(li);
        });
        modal.style.display = 'flex';
    };
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        mostrarModalSector(); // Restaurar el estado previo al abrir la base de datos
    };
}

// --- GESTIÓN DE USUARIOS Y FICHAS ---

// Estructura: { username: { camouflages: {zombies: [], multijugador: [], campaña: []} } }
function getUserBase() {
    return JSON.parse(localStorage.getItem('camoTrackerUserBase') || '{}');
}
function saveUserBase(base) {
    localStorage.setItem('camoTrackerUserBase', JSON.stringify(base));
}

function getCurrentUser() {
    return localStorage.getItem('camoTrackerUser');
}
function setCurrentUser(username) {
    localStorage.setItem('camoTrackerUser', username);
}

function ensureUserFicha(username) {
    let base = getUserBase();
    if (!base[username]) {
        base[username] = {
            camouflages: {
                zombies: [],
                multijugador: [],
                campaña: []
            }
        };
        saveUserBase(base);
    }
    return base[username];
}

function getSectorDisplayName(sector) {
    const areaNames = {
        zombies: 'Zombies',
        multijugador: 'Multiplayer',
        campaña: 'Campaign'
    };
    return areaNames[sector] || sector;
}

function getSectorTargetTotal(sector) {
    const dynamicTotals = JSON.parse(localStorage.getItem('camoTrackerSectorTotals') || '{}');
    if (typeof dynamicTotals[sector] === 'number' && dynamicTotals[sector] > 0) {
        return dynamicTotals[sector];
    }

    const targetTotals = {
        zombies: 36,
        multijugador: 36,
        campaña: 12
    };
    return targetTotals[sector] || 0;
}

function getCamoRootFromData(data) {
    return data.Camufaljes || data.camuflajes || data.Camuflajes || {};
}

function getSectorCamouflages(root, sector) {
    if (Array.isArray(root[sector])) {
        return root[sector];
    }

    // Compatibilidad por variantes de nombre de sector
    const aliases = {
        zombies: ['zombies', 'zombie'],
        multijugador: ['multijugador', 'multiplayer'],
        campaña: ['campaña', 'campana', 'campaign']
    };

    const candidates = aliases[sector] || [sector];
    for (const key of candidates) {
        if (Array.isArray(root[key])) {
            return root[key];
        }
    }

    return [];
}

function getUserSectorProgress(sector) {
    const username = getCurrentUser();
    if (!username) {
        return [];
    }
    const base = getUserBase();
    const ficha = base[username];
    if (!ficha || !ficha.camouflages) {
        return [];
    }
    return ficha.camouflages[sector] || [];
}

function getSessionUnlockedStorageKey(sector) {
    const username = getCurrentUser() || 'guest';
    return `camoTrackerSessionUnlocked_${username}_${sector}`;
}

function getSessionUnlockedCamos(sector) {
    const raw = sessionStorage.getItem(getSessionUnlockedStorageKey(sector));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
}

function saveSessionUnlockedCamos(sector, items) {
    sessionStorage.setItem(getSessionUnlockedStorageKey(sector), JSON.stringify(items));
}

function addSessionUnlockedCamo(sector, armaId, armaName, camoName) {
    const current = getSessionUnlockedCamos(sector);
    const key = `${armaId}__${camoName}`;
    if (!current.some(item => item && item.key === key)) {
        current.push({ key, armaId, armaName, camoName });
        saveSessionUnlockedCamos(sector, current);
    }
}

function removeSessionUnlockedCamo(sector, armaId, camoName) {
    const key = `${armaId}__${camoName}`;
    const current = getSessionUnlockedCamos(sector).filter(item => item && item.key !== key);
    saveSessionUnlockedCamos(sector, current);
}

function resetSectorStatsForCurrentUser(sector) {
    const username = getCurrentUser();
    if (!username) {
        return false;
    }

    const base = getUserBase();
    if (!base[username]) {
        return false;
    }

    const ficha = base[username];
    if (!ficha.camouflages) {
        ficha.camouflages = { zombies: [], multijugador: [], campaña: [] };
    }

    ficha.camouflages[sector] = [];
    saveUserBase(base);
    saveSessionUnlockedCamos(sector, []);

    return true;
}

function showWarningModal(message, title = 'Warning') {
    return new Promise(function(resolve) {
        if (document.getElementById('warning-modal-bg')) {
            resolve(false);
            return;
        }

        const bg = document.createElement('div');
        bg.id = 'warning-modal-bg';

        const modal = document.createElement('div');
        modal.id = 'warning-modal';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
            <div class="warning-modal-actions">
                <button id="warning-cancel-btn">Cancel</button>
                <button id="warning-accept-btn">Accept</button>
            </div>
        `;

        bg.appendChild(modal);
        document.body.appendChild(bg);

        function closeWith(value) {
            if (bg.parentNode) {
                bg.parentNode.removeChild(bg);
            }
            resolve(value);
        }

        document.getElementById('warning-cancel-btn').onclick = function() {
            closeWith(false);
        };

        document.getElementById('warning-accept-btn').onclick = function() {
            closeWith(true);
        };

        bg.onclick = function(e) {
            if (e.target === bg) {
                closeWith(false);
            }
        };

        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape' && document.getElementById('warning-modal-bg')) {
                closeWith(false);
                document.removeEventListener('keydown', escListener);
            }
        });

        setTimeout(function() {
            modal.focus();
        }, 0);
    });
}

const DEFAULT_UNLOCKED_VISIBLE = 2;

function renderUnlockedPreview(completedList, startIndex = 0, visibleCount = DEFAULT_UNLOCKED_VISIBLE) {
    if (!completedList.length) {
        return `
            <div class="unlock-empty">
                <h4>No camos unlocked yet</h4>
                <p>Complete your first challenge to start filling this panel.</p>
            </div>
        `;
    }

    const maxStart = Math.max(0, completedList.length - visibleCount);
    const safeStart = Math.max(0, Math.min(startIndex, maxStart));

    return completedList.slice(safeStart, safeStart + visibleCount).map(function(camoEntry) {
        const camoMeta = getCamoVisualMeta(camoEntry);
        return `
            <article class="unlock-card">
                <div class="unlock-icon">
                    <img class="unlock-icon-img" src="${camoMeta.iconSrc}" alt="${camoMeta.displayName} icon">
                </div>
                <div class="unlock-meta">
                    <h4>${camoMeta.displayName}</h4>
                    <span class="unlock-weapon">${camoMeta.weaponName}</span>
                </div>
            </article>
        `;
    }).join('');
}

function updateUnlockedCamoPanel(completedList) {
    const safeList = Array.isArray(completedList) ? completedList : [];
    window.__currentUnlockedCamos = safeList;

    const grid = document.querySelector('.unlock-grid');
    const sliderWrap = document.getElementById('unlock-slider-wrap');
    const slider = document.getElementById('unlock-camo-slider');
    const count = document.getElementById('unlock-slider-count');

    if (!grid || !slider || !count || !sliderWrap) {
        return;
    }

    const maxStart = Math.max(0, safeList.length - DEFAULT_UNLOCKED_VISIBLE);
    slider.min = '0';
    slider.max = String(maxStart);
    slider.step = '1';

    if (Number(slider.value) > maxStart) {
        slider.value = String(maxStart);
    }

    if (safeList.length <= DEFAULT_UNLOCKED_VISIBLE) {
        sliderWrap.style.display = 'none';
        slider.value = '0';
    } else {
        sliderWrap.style.display = 'grid';
    }

    const start = Number(slider.value) || 0;
    grid.innerHTML = renderUnlockedPreview(safeList, start, DEFAULT_UNLOCKED_VISIBLE);

    const from = safeList.length ? start + 1 : 0;
    const to = safeList.length ? Math.min(start + DEFAULT_UNLOCKED_VISIBLE, safeList.length) : 0;
    count.textContent = `${from}-${to} / ${safeList.length}`;

    if (!slider.dataset.bound) {
        slider.addEventListener('input', function() {
            updateUnlockedCamoPanel(window.__currentUnlockedCamos || []);
        });
        slider.dataset.bound = '1';
    }
}

function getCamoVisualMeta(camoEntry) {
    const rawName = typeof camoEntry === 'object' && camoEntry !== null
        ? String(camoEntry.camoName || '')
        : String(camoEntry || '');
    const displayName = rawName.includes('__') ? rawName.split('__')[1] : rawName;
    const weaponName = typeof camoEntry === 'object' && camoEntry !== null
        ? (camoEntry.armaName || 'Unknown Weapon')
        : 'Unknown Weapon';
    const normalized = displayName.toLowerCase();

    const iconSrc = getCamoIconDataUri(normalized);

    return {
        displayName,
        weaponName,
        iconSrc
    };
}

function getCamoIconDataUri(camoName) {
    const seed = hashCamoName(camoName);
    const palettes = [
        ['#6f1f1f', '#2e1212', '#9f3b3b', '#d2b5b5'],
        ['#6b6b6b', '#2d2d2d', '#8a8a8a', '#d7d7d7'],
        ['#4b5a2d', '#1f2a16', '#768958', '#d7e2c9'],
        ['#27495f', '#111f2d', '#4e6f86', '#b7ccda'],
        ['#6e4f2c', '#2c1d0f', '#a77d4d', '#e0cfb3'],
        ['#51356e', '#23132f', '#8765ad', '#d4c4e6'],
        ['#7b6c2a', '#322a0d', '#b7a24a', '#f0e4b4']
    ];

    const chosen = palettes[seed % palettes.length];
    const [c1, c2, c3, c4] = chosen;
    const stripeAngle = 20 + (seed % 140);
    const blobX = 12 + (seed % 36);
    const blobY = 12 + ((seed >> 2) % 36);
    const blobR = 8 + (seed % 10);
    const chipX = 6 + ((seed >> 3) % 42);
    const chipY = 6 + ((seed >> 5) % 42);

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
        <defs>
            <clipPath id='clip'>
                <circle cx='32' cy='32' r='30'/>
            </clipPath>
            <linearGradient id='bg' x1='0' x2='1' y1='0' y2='1'>
                <stop offset='0' stop-color='${c1}'/>
                <stop offset='1' stop-color='${c2}'/>
            </linearGradient>
            <pattern id='stripes' width='12' height='12' patternUnits='userSpaceOnUse' patternTransform='rotate(${stripeAngle})'>
                <rect width='12' height='12' fill='none'/>
                <rect x='0' y='0' width='6' height='12' fill='${c3}' opacity='0.55'/>
            </pattern>
            <filter id='grain'>
                <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
                <feColorMatrix type='saturate' values='0.2'/>
                <feComponentTransfer>
                    <feFuncA type='table' tableValues='0 0.14'/>
                </feComponentTransfer>
            </filter>
        </defs>

        <circle cx='32' cy='32' r='30' fill='#0d0d0d'/>
        <g clip-path='url(#clip)'>
            <rect width='64' height='64' fill='url(#bg)'/>
            <rect width='64' height='64' fill='url(#stripes)'/>
            <circle cx='${blobX}' cy='${blobY}' r='${blobR}' fill='${c4}' opacity='0.6'/>
            <ellipse cx='${48 - (seed % 18)}' cy='${16 + ((seed >> 4) % 22)}' rx='${7 + (seed % 6)}' ry='${5 + ((seed >> 3) % 5)}' fill='${c1}' opacity='0.55'/>
            <rect x='${chipX}' y='${chipY}' width='${12 + (seed % 8)}' height='${8 + ((seed >> 2) % 8)}' rx='2' fill='${c2}' opacity='0.65'/>
            <rect width='64' height='64' filter='url(#grain)'/>
            <ellipse cx='22' cy='17' rx='20' ry='9' fill='#ffffff' opacity='0.12'/>
        </g>
        <circle cx='32' cy='32' r='30' fill='none' stroke='#2a2a2a' stroke-width='2'/>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function hashCamoName(name) {
    let hash = 0;
    const value = String(name || 'camo');
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// --- MODAL DE ÁREA Y CONTENIDO ---
function mostrarModalSector() {
    document.body.classList.remove('main-window-active');
    ocultarLogin();
    ocultarUserBase();
    const areaSelector = document.getElementById('area-selector-section');
    document.getElementById('main-content').style.display = 'none';
    areaSelector.style.display = 'flex';
}

// Mostrar la sección correspondiente y actualizar el título
function mostrarCamuflajes(sector) {
    // Si no hay usuario logueado, forzar login y mostrar mensaje
    if (!getCurrentUser()) {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('area-selector-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'flex';
        const areaTitle = document.getElementById('area-title');
        if (areaTitle) {
            areaTitle.innerHTML = `<span class='area-section-title' style='color:#ffe082;text-shadow:0 0 8px #bfa14a;'>Please log in or create a profile to access camo progress tracking.</span>`;
        }
        return;
    }

    document.body.classList.add('main-window-active');
    document.getElementById('area-selector-section').style.display = 'none';
    const mainContent = document.getElementById('main-content');
    const areaTitle = document.getElementById('area-title');
    const areaContent = document.getElementById('area-content');

    const displaySector = getSectorDisplayName(sector);
    const completedList = getUserSectorProgress(sector);
    const completedCount = completedList.length;
    const totalTarget = getSectorTargetTotal(sector);
    const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((completedCount / totalTarget) * 100)) : 0;
    const username = getCurrentUser() || 'Guest';

    // Actualizar título con clase reutilizable
    areaTitle.innerHTML = `<span class="area-section-title">CoD MW3 Camo Tracker: ${displaySector}</span>`;

    // Texto inferior con el mismo estilo visual y nombre de usuario activo (si existe)
    const activeUser = getCurrentUser();
    const userSuffix = activeUser ? ` - ${activeUser}` : '';

    // Render dashboard visual (igual que antes)
    let html = `<div class="sector-tools">
        <button id="reset-sector-stats-btn" class="reset-sector-stats-btn" title="Reset this section stats" aria-label="Reset this section stats">
            <svg class="prestige-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <path d="M32 6l8 12 14 2-10 9 2 14-14-7-14 7 2-14-10-9 14-2 8-12z" fill="url(#gold-grad)"/>
                <path d="M20 50l7-8 5 6 5-6 7 8" stroke="#ffe9ab" stroke-width="3" stroke-linecap="round"/>
                <circle cx="32" cy="27" r="6" fill="#1a1308" stroke="#f7d77a" stroke-width="2"/>
                <defs>
                    <linearGradient id="gold-grad" x1="8" y1="6" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#ffe082"/>
                        <stop offset="1" stop-color="#bfa14a"/>
                    </linearGradient>
                </defs>
            </svg>
        </button>
    </div>

    <section class="camo-dashboard">
        <article class="camo-panel">
            <header class="panel-header">
                <h3>Unlocked Camo Progress</h3>
                <span class="panel-badge">${displaySector}</span>
            </header>
            <div class="progress-row">
                <div class="progress-track">
                    <div class="progress-fill" style="width:${progressPercent}%;"></div>
                </div>
                <span class="progress-value">${progressPercent}%</span>
            </div>
            <div class="quick-stats">
                <div class="stat-box">
                    <strong>${completedCount}</strong>
                    <span>Completed</span>
                </div>
                <div class="stat-box">
                    <strong>${Math.max(0, totalTarget - completedCount)}</strong>
                    <span>Remaining</span>
                </div>
                <div class="stat-box">
                    <strong>${username}</strong>
                    <span>Active User</span>
                </div>
            </div>
        </article>

        <article class="camo-panel">
            <header class="panel-header">
                <h3>Unlocked Camos</h3>
                <span class="panel-badge">Preview</span>
            </header>
            <div class="unlock-grid">
                ${renderUnlockedPreview(completedList)}
            </div>
            <div id="unlock-slider-wrap" class="unlock-slider-wrap" style="display:none;">
                <input id="unlock-camo-slider" class="unlock-camo-slider" type="range" min="0" max="0" step="1" value="0" aria-label="Unlocked camos slider">
                <span id="unlock-slider-count" class="unlock-slider-count">0-0 / 0</span>
            </div>
        </article>

        <article class="camo-panel">
            <header class="panel-header">
                <h3>Session Results</h3>
                <span class="panel-badge">Live</span>
            </header>
            <ul class="result-list">
                <li><span class="result-dot"></span>Welcome to the ${displaySector} camo area!${userSuffix}</li>
                <li><span class="result-dot"></span>Current completion: ${completedCount}/${totalTarget}</li>
                <li><span class="result-dot"></span>Next objective: unlock one more camo to increase progress.</li>
            </ul>
        </article>
    </section>`;

    // --- Sección de armas, camuflajes, misión y checkbox ---
    html += `<section class="camo-weapon-list">
        <h3 style="margin-top:2em;">Weapon Camo Checklist</h3>
        <div id="weapon-camo-table"></div>
    </section>`;

    html += `<span class="area-section-title area-welcome-text">Welcome to the ${displaySector} camo area!${userSuffix}</span>`;
    areaContent.innerHTML = html;

    const resetSectorBtn = document.getElementById('reset-sector-stats-btn');
    if (resetSectorBtn) {
        resetSectorBtn.onclick = function() {
            showWarningModal(
                'Are you sure you want to reset all stats for this section? This action cannot be undone.',
                'Reset Section Stats'
            ).then(function(accepted) {
                if (!accepted) {
                    return;
                }

                const changed = resetSectorStatsForCurrentUser(sector);
                if (changed) {
                    mostrarCamuflajes(sector);
                }
            });
        };
    }

    // Inicializar el slider de unlocked camos (solo sesión actual)
    updateUnlockedCamoPanel(getSessionUnlockedCamos(sector));

    // Cargar y renderizar la tabla de armas/camuflajes
    renderWeaponCamoTable(sector);

function getWeaponCategoryIconSvg(category) {
    const value = String(category || '').toLowerCase();
    if (value.includes('smg')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h11l2 2h3v2h-3l-1 2h-3v-2H6v3H3z" fill="#ffe082"/><rect x="8" y="6" width="4" height="2" fill="#bfa14a"/></svg>`;
    }
    if (value.includes('assault')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 10h13l2 2h3v2h-3l-1 2h-3v-2H7v4H5v-4H2z" fill="#ffe082"/><rect x="10" y="7" width="5" height="2" fill="#bfa14a"/></svg>`;
    }
    if (value.includes('sniper')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="11" width="16" height="2" fill="#ffe082"/><circle cx="10" cy="8" r="2" fill="#bfa14a"/><rect x="18" y="10" width="3" height="4" fill="#ffe082"/></svg>`;
    }
    if (value.includes('shotgun')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="11" width="15" height="2" fill="#ffe082"/><rect x="15" y="10" width="5" height="4" fill="#bfa14a"/><rect x="6" y="13" width="2" height="5" fill="#ffe082"/></svg>`;
    }
    if (value.includes('pistol')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h12v3h2v3h-4v4H9v-4H4z" fill="#ffe082"/></svg>`;
    }
    if (value.includes('launcher')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="10" width="14" height="4" rx="1" fill="#ffe082"/><circle cx="18" cy="12" r="3" fill="#bfa14a"/></svg>`;
    }
    if (value.includes('melee')) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18l8-8 2 2-8 8H6z" fill="#ffe082"/><path d="M14 6l2-2 4 4-2 2z" fill="#bfa14a"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h13l2 2h3v2h-3l-1 2h-3v-2H8v3H5v-3H3z" fill="#ffe082"/></svg>`;
}

function slugifyCategory(value) {
    return String(value || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildCategoryTable(groupedByWeapon, weaponByName, ficha, sector) {
    let sectionTable = `<table class='weapon-camo-table compact'><thead><tr>
        <th>Weapon</th>
        <th>Camo</th>
        <th>Mission</th>
        <th>Required Level</th>
        <th class='completed-col'>Completed</th>
    </tr></thead><tbody>`;

    Object.keys(groupedByWeapon).sort().forEach(function(weaponName) {
        const linkedWeapon = weaponByName[String(weaponName).toLowerCase()];
        const weaponId = linkedWeapon ? linkedWeapon.id : `custom_${String(weaponName).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        const camoList = groupedByWeapon[weaponName];

        camoList.forEach(function(camo, idx) {
            const camoName = camo.nombre || 'Unnamed Camo';
            const missionText = camo.Mision || camo.mision || camo.Mission || camo.mission || 'No mission data';
            const requiredLevel = camo.nivel_requerido ?? camo.NivelRequerido ?? camo.required_level ?? camo.requiredLevel ?? '-';
            const camoKey = `${weaponId}__${camoName}`;
            const checked = (ficha.camouflages[sector] || []).includes(camoKey) ? 'checked' : '';

            sectionTable += `<tr>`;
            if (idx === 0) {
                sectionTable += `<td rowspan="${camoList.length}" class="weapon-name-cell" style="background:linear-gradient(90deg,#ffe082,#bfa14a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 8px #bfa14a99;">${weaponName}</td>`;
            }
            sectionTable += `
                <td style="background:linear-gradient(90deg,#ffe082,#bfa14a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 8px #bfa14a99;">${camoName}</td>
                <td class='camo-mission' style="background:linear-gradient(90deg,#ffe082,#bfa14a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 8px #bfa14a99;">${missionText}</td>
                <td style="background:linear-gradient(90deg,#ffe082,#bfa14a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 8px #bfa14a99;">Lv ${requiredLevel}</td>
                <td class='completed-col'><input type='checkbox' class='camo-checkbox' data-armaid='${weaponId}' data-armaname='${weaponName}' data-camoname='${camoName}' data-sector='${sector}' ${checked}></td>
            </tr>`;
        });
    });

    sectionTable += `</tbody></table>`;
    return sectionTable;
}
// Renderiza la tabla de armas, camuflajes, misión y checkbox
function renderWeaponCamoTable(sector) {
    fetch('weapons.json')
        .then(res => res.json())
        .then(data => {
            const armas = Array.isArray(data.armas) ? data.armas : [];
            const camoRoot = getCamoRootFromData(data);
            const sectorCamouflages = getSectorCamouflages(camoRoot, sector);

            // Guardar total dinámico por sector para que el dashboard use la cantidad real
            const dynamicTotals = JSON.parse(localStorage.getItem('camoTrackerSectorTotals') || '{}');
            dynamicTotals[sector] = sectorCamouflages.length;
            localStorage.setItem('camoTrackerSectorTotals', JSON.stringify(dynamicTotals));

            // Índice de armas por nombre para obtener el id real desde "armas"
            const weaponByName = {};
            armas.forEach(function(arma) {
                if (arma && arma.nombre) {
                    weaponByName[String(arma.nombre).toLowerCase()] = arma;
                }
            });

            // Agrupar por categoria y por arma para mostrar matriz de secciones
            const groupedByCategory = {};
            sectorCamouflages.forEach(function(camo) {
                const weaponName = camo.arma_asociada || 'Unknown Weapon';
                const linkedWeapon = weaponByName[String(weaponName).toLowerCase()];
                const category = linkedWeapon?.categoria || 'Other Weapons';

                if (!groupedByCategory[category]) {
                    groupedByCategory[category] = {};
                }
                if (!groupedByCategory[category][weaponName]) {
                    groupedByCategory[category][weaponName] = [];
                }
                groupedByCategory[category][weaponName].push(camo);
            });

            let matrixHtml = `<div class="weapon-sections-wrap">`;

            const user = getCurrentUser();
            const base = getUserBase();
            const ficha = base[user] || { camouflages: { zombies: [], multijugador: [], campaña: [] } };

            const smallCategories = [];
            const largeCategories = [];

            Object.keys(groupedByCategory).sort().forEach(function(categoryName) {
                const groupedByWeapon = groupedByCategory[categoryName];
                const weaponCount = Object.keys(groupedByWeapon).length;
                const entry = { categoryName, groupedByWeapon, weaponCount };

                if (weaponCount < 3) {
                    smallCategories.push(entry);
                } else {
                    largeCategories.push(entry);
                }
            });

            if (smallCategories.length) {
                let compactHtml = `<div class="small-sections-list">`;
                smallCategories.forEach(function(entry) {
                    compactHtml += `
                        <div class="small-category-item">
                            <header class="weapon-category-header compact">
                                <span class="weapon-category-icon">${getWeaponCategoryIconSvg(entry.categoryName)}</span>
                                <h4>${entry.categoryName}</h4>
                            </header>
                            <div class="category-scroll-area compact">
                                ${buildCategoryTable(entry.groupedByWeapon, weaponByName, ficha, sector)}
                            </div>
                        </div>
                    `;
                });
                compactHtml += `</div>`;

                matrixHtml += `
                    <div class="weapon-section-box grouped-small" style="--section-basis:100%;">
                        <header class="weapon-category-header">
                            <span class="weapon-category-icon">${getWeaponCategoryIconSvg('Other Weapons')}</span>
                            <h4>Compact Weapon Sections</h4>
                        </header>
                        ${compactHtml}
                    </div>
                `;
            }

            largeCategories.forEach(function(entry, index) {
                const areaId = `category-scroll-${slugifyCategory(entry.categoryName)}-${index}`;

                matrixHtml += `
                    <div class="weapon-section-box large" style="--section-basis:100%;" data-weapon-count="${entry.weaponCount}">
                        <header class="weapon-category-header">
                            <span class="weapon-category-icon">${getWeaponCategoryIconSvg(entry.categoryName)}</span>
                            <h4>${entry.categoryName}</h4>
                        </header>

                        <div id="${areaId}" class="category-scroll-area">
                            ${buildCategoryTable(entry.groupedByWeapon, weaponByName, ficha, sector)}
                        </div>
                    </div>
                `;
            });

            matrixHtml += `</div>`;
            document.getElementById('weapon-camo-table').innerHTML = matrixHtml;

            // Evento para checkboxes
            document.querySelectorAll('.camo-checkbox').forEach(cb => {
                cb.addEventListener('change', function(e) {
                    if (this.checked) {
                        showCamoConfirmModal({
                            armaId: this.dataset.armaid,
                            armaName: this.dataset.armaname,
                            camoName: this.dataset.camoname,
                            sector: this.dataset.sector,
                            checkbox: this,
                            onConfirm: () => updateCamoDashboard(sector)
                        });
                    } else {
                        removeCamoProgress(this.dataset.armaid, this.dataset.camoname, this.dataset.sector);
                        removeSessionUnlockedCamo(this.dataset.sector, this.dataset.armaid, this.dataset.camoname);
                        updateCamoDashboard(sector);
                    }
                });
            });
        // Modal de confirmación visual para camuflaje
        function showCamoConfirmModal({ armaId, armaName, camoName, sector, checkbox, onConfirm }) {
            // Si ya existe, no crear otro
            if (document.getElementById('camo-confirm-modal-bg')) return;
            const bg = document.createElement('div');
            bg.id = 'camo-confirm-modal-bg';
            const modal = document.createElement('div');
            modal.id = 'camo-confirm-modal';
            modal.innerHTML = `
                <h4 style=\"background: linear-gradient(90deg,#ffe082,#bfa14a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;\">Confirm Camo Completion</h4>
                <p style=\"color:#ffe082;text-shadow:0 0 8px #bfa14a99;\">Did you really complete the mission for <b style='color:#ffe082;text-shadow:0 0 8px #bfa14a;'>${camoName}</b> on this weapon?</p>
                <div class=\"modal-btns\">\n            <button id=\"camo-confirm-yes\">Yes, completed</button>\n            <button id=\"camo-confirm-no\">Cancel</button>\n        </div>\n    `;
            bg.appendChild(modal);
            document.body.appendChild(bg);
            // Botón sí
            document.getElementById('camo-confirm-yes').onclick = function() {
                saveCamoProgress(armaId, camoName, sector);
                addSessionUnlockedCamo(sector, armaId, armaName, camoName);
                document.body.removeChild(bg);
                if (onConfirm) onConfirm();
            };
            // Botón no
            document.getElementById('camo-confirm-no').onclick = function() {
                checkbox.checked = false;
                document.body.removeChild(bg);
            };
            // Cerrar con Escape
            bg.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    checkbox.checked = false;
                    document.body.removeChild(bg);
                }
            });
            setTimeout(() => { modal.focus(); }, 100);
        }

        // Actualiza la barra de progreso y dashboard en tiempo real
        function updateCamoDashboard(sector) {
            // Recalcular progreso
            const completedList = getUserSectorProgress(sector);
            const completedCount = completedList.length;
            const totalTarget = getSectorTargetTotal(sector);
            const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((completedCount / totalTarget) * 100)) : 0;
            // Barra de progreso
            const fill = document.querySelector('.progress-fill');
            const value = document.querySelector('.progress-value');
            if (fill) fill.style.width = progressPercent + '%';
            if (value) value.textContent = progressPercent + '%';
            // Estadísticas
            const statBoxes = document.querySelectorAll('.stat-box strong');
            if (statBoxes.length >= 2) {
                statBoxes[0].textContent = completedCount;
                statBoxes[1].textContent = Math.max(0, totalTarget - completedCount);
            }
            // Tarjetas de camuflaje (solo sesión actual)
            updateUnlockedCamoPanel(getSessionUnlockedCamos(sector));
            // Resultados
            const resultList = document.querySelector('.result-list');
            if (resultList) {
                resultList.innerHTML = `
                    <li><span class=\"result-dot\"></span><span style=\"background:linear-gradient(90deg,#ffe082,#bfa14a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;\">Welcome to the ${getSectorDisplayName(sector)} camo area!</span></li>
                    <li><span class=\"result-dot\"></span><span style=\"color:#ffe082;text-shadow:0 0 8px #bfa14a;\">Current completion: ${completedCount}/${totalTarget}</span></li>
                    <li><span class=\"result-dot\"></span><span style=\"color:#ffe082;text-shadow:0 0 8px #bfa14a;\">Next objective: unlock one more camo to increase progress.</span></li>
                `;
            }
        }
        });
}

// Guardar progreso de camuflaje
function saveCamoProgress(armaId, camoName, sector) {
    const user = getCurrentUser();
    if (!user) return;
    const base = getUserBase();
    const ficha = base[user] || { camouflages: { zombies: [], multijugador: [], campaña: [] } };
    const camoKey = `${armaId}__${camoName}`;
    if (!ficha.camouflages[sector].includes(camoKey)) {
        ficha.camouflages[sector].push(camoKey);
        saveUserBase(base);
    }
}

// Quitar progreso de camuflaje
function removeCamoProgress(armaId, camoName, sector) {
    const user = getCurrentUser();
    if (!user) return;
    const base = getUserBase();
    const ficha = base[user] || { camouflages: { zombies: [], multijugador: [], campaña: [] } };
    const camoKey = `${armaId}__${camoName}`;
    ficha.camouflages[sector] = ficha.camouflages[sector].filter(k => k !== camoKey);
    saveUserBase(base);
}

    // Mostrar la sección principal
    mainContent.style.display = 'block';
}

// Mostrar el formulario de login al pulsar el botón superior derecho
function setupLoginToggleBtn() {
    const btn = document.getElementById('login-toggle-btn');
    btn.onclick = function() {
        document.body.classList.remove('main-window-active');
        ocultarModalArea();
        ocultarUserBase();
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('logo-cod').style.display = 'none';
    };
}

// Botón para volver a la zona principal (selección de área)
function setupMainAreaBtn() {
    const btn = document.getElementById('main-area-btn');
    btn.onclick = function() {
        // Recargar la página al hacer clic en el botón HOME
        location.reload();
    };
}

// Ocultar el login al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('login-section').style.display = 'none';
        mostrarModalSector();
    });
} else {
    document.getElementById('login-section').style.display = 'none';
    mostrarModalSector();
}

// Llamar a la función al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLoginToggleBtn);
} else {
    setupLoginToggleBtn();
}

// --- Control de visibilidad de modales ---
function ocultarModalArea() {
    const areaSelector = document.getElementById('area-selector-section');
    if (areaSelector) areaSelector.style.display = 'none';

    // Compatibilidad con estructura anterior (si quedara en el DOM)
    const modalFondo = document.getElementById('modal-fondo-sector');
    const fondoVisual = document.getElementById('fondo-visual-modal');
    if (modalFondo) modalFondo.remove();
    if (fondoVisual) fondoVisual.remove();
}
function ocultarLogin() {
    document.getElementById('login-section').style.display = 'none';
}
function ocultarUserBase() {
    document.getElementById('user-base-modal').style.display = 'none';
}
