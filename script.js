// --- CONFIGURACIÓN DE LA API DE YOUTUBE ---
var player; // Variable global para el reproductor
var isPlaying = false; // Estado para saber si el video corre

// 1. Cargar la API de YouTube de forma asíncrona
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. Esta función se ejecuta automáticamente cuando la API está lista
function onYouTubeIframeAPIReady() {
    // Inicialmente no creamos el reproductor, esperamos a que el usuario busque
    console.log("API de YouTube lista.");
}

const API_KEY = 'AIzaSyBDwuqV-kmJEU8AOu2ljb7T5JJ2a5PaSUs';

async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    if (!query) return;

    // Buscamos videos embeddables para evitar bloqueos
    const url = `https://www.googleapis.com/googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            renderList(data.items);
        } else {
            alert("No se encontraron videos disponibles para este artista.");
        }
    } catch (e) {
        console.error("Error en la búsqueda:", e);
    }
}

// --- RENDERIZADO DE LA LISTA (Mantenemos tu estilo) ---
function renderList(items) {
    const list = document.getElementById('resultsList');
    list.innerHTML = ''; 

    items.forEach(item => {
        const li = document.createElement('div');
        li.className = 'video-item';
        li.onclick = () => loadVideo(item.id.videoId, item.snippet.title, item.snippet.channelTitle);

        li.innerHTML = `
            <img src="${item.snippet.thumbnails.default.url}" alt="${item.snippet.title}">
            <div class="video-text">
                <span class="video-title">${item.snippet.title}</span>
                <span class="video-artist">${item.snippet.channelTitle}</span>
            </div>
        `;
        list.appendChild(li);
    });
}

// --- NUEVA FUNCIÓN PARA CARGAR EL VIDEO (Usando la API) ---
function loadVideo(id, title, artist) {
    // Actualizamos textos de info
    document.getElementById('currentTitle').innerText = title;
    document.getElementById('currentArtist').innerText = artist;

    // Inyectamos la estructura de los controles personalizados una sola vez
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = `
        <div class="video-wrapper">
            <div id="yt-player-container"></div> <div class="custom-controls">
                <button id="customPlayPauseBtn" class="neon-control-btn" onclick="togglePlayPause()">
                    <span id="playIcon">▶</span>
                    <span id="pauseIcon" style="display:none;">||</span>
                </button>
                <div class="progress-bar">
                    <div id="progressFill" class="progress-fill"></div>
                </div>
            </div>
        </div>
    `;

    // 3. Creamos o actualizamos el reproductor de YouTube usando la API
    // Ocultamos controles nativos ('controls': 0)
    player = new YT.Player('yt-player-container', {
        height: '100%',
        width: '100%',
        videoId: id,
        playerVars: {
            'autoplay': 1,
            'controls': 0, // OCULTA LOS BOTONES DE YOUTUBE
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'iv_load_policy': 3
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. Funciones de eventos de la API
function onPlayerReady(event) {
    // El video empieza a reproducirse, actualizamos el botón a "Pausa"
    updateControlsState(true);
}

function onPlayerStateChange(event) {
    // Detectamos si el usuario pausa desde el video (si pudiera) o si termina
    if (event.data == YT.PlayerState.PLAYING) {
        updateControlsState(true);
    } else if (event.data == YT.PlayerState.PAUSED) {
        updateControlsState(false);
    }
}

// --- FUNCIÓN MÁGICA PARA TU BOTÓN (Play/Pause) ---
function togglePlayPause() {
    if (!player) return; // Si no hay video cargado, no hacemos nada

    if (isPlaying) {
        player.pauseVideo(); // API de YouTube: Pausar
    } else {
        player.playVideo(); // API de YouTube: Reproducir
    }
}

// Función para cambiar el icono del botón (Play <-> Pause)
function updateControlsState(playing) {
    isPlaying = playing;
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const btn = document.getElementById('customPlayPauseBtn');

    if (playing) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
        btn.classList.add('paused'); // Para cambiar estilo CSS si quieres
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        btn.classList.remove('paused');
    }
}
