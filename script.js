// Variable global para el reproductor
var player;
var timeUpdater; // Para el contador de tiempo

// 1. Cargar la API de YouTube de forma asíncrona
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. Esta función se ejecuta cuando la API está lista
function onYouTubeIframeAPIReady() {
    console.log("API de YouTube lista.");
}

const API_KEY = 'AIzaSyBDwuqV-kmJEU8AOu2ljb7T5JJ2a5PaSUs';

async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    if (!query) return;

    const url = `https://www.googleapis.com/googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            renderList(data.items);
        } else {
            alert("No se encontraron videos disponibles.");
        }
    } catch (e) {
        console.error("Error en la búsqueda:", e);
    }
}

// --- RENDERIZADO DE LA LISTA (Corregido para el desorden) ---
function renderList(items) {
    const list = document.getElementById('resultsList');
    list.innerHTML = ''; 

    items.forEach(item => {
        const li = document.createElement('div');
        li.className = 'video-item';
        // Al hacer clic, cargamos el video usando la API
        li.onclick = () => loadVideo(item.id.videoId, item.snippet.title, item.snippet.channelTitle);

        // Estructura limpia para que el texto no se mezcle
        li.innerHTML = `
            <img src="${item.snippet.thumbnails.default.url}" alt="Thumbnail">
            <div class="video-text-container">
                <span class="video-item-title">${item.snippet.title}</span>
                <span class="video-item-artist">${item.snippet.channelTitle}</span>
            </div>
        `;
        list.appendChild(li);
    });
}

// --- NUEVA FUNCIÓN PARA CARGAR EL VIDEO (Con API y Controles) ---
function loadVideo(id, title, artist) {
    // Actualizamos info de texto
    document.getElementById('currentTitle').innerText = title;
    document.getElementById('currentArtist').innerText = artist;

    // Inyectamos la estructura del reproductor y TUS controles neón
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = `
        <div class="video-wrapper">
            <div id="yt-player-container"></div> <div class="custom-controls">
                <button id="customPlayPauseBtn" class="neon-btn round-btn" onclick="togglePlayPause()">▶</button>
                
                <span id="timeDisplay" class="time-display">0:00 / 0:00</span>
                
                <div class="progress-bar">
                    <div id="progressFill" class="progress-fill" style="width: 0%;"></div>
                </div>
            </div>
        </div>
    `;

    // 3. Crear el reproductor de YouTube usando la API
    player = new YT.Player('yt-player-container', {
        height: '100%',
        width: '100%',
        videoId: id,
        playerVars: {
            'autoplay': 1,
            'controls': 0, // OCULTA LOS BOTONES ORIGINALES
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. Funciones de eventos de la API
function onPlayerReady(event) {
    // Empezamos a actualizar el tiempo y la barra cada segundo
    startTimeUpdater();
}

function onPlayerStateChange(event) {
    const btn = document.getElementById('customPlayPauseBtn');
    if (event.data == YT.PlayerState.PLAYING) {
        btn.innerText = '||'; // Cambia icono a Pausa
        startTimeUpdater(); // Aseguramos que el timer corra
    } else {
        btn.innerText = '▶'; // Cambia icono a Play
        stopTimeUpdater(); // Paramos el timer si se pausa
    }
}

// --- FUNCIONES MÁGICAS PARA EL TIEMPO Y LA BARRA ---

function togglePlayPause() {
    if (!player) return;
    const state = player.getPlayerState();
    if (state == YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function startTimeUpdater() {
    stopTimeUpdater(); // Limpiamos cualquier timer previo
    // Ejecutar cada 100ms para que la barra se mueva suave
    timeUpdater = setInterval(updateTimeAndProgress, 100); 
}

function stopTimeUpdater() {
    clearInterval(timeUpdater);
}

function updateTimeAndProgress() {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    // 1. Actualizar los números de tiempo (0:02 / 3:22)
    if (duration > 0) {
        document.getElementById('timeDisplay').innerText = formatTime(currentTime) + ' / ' + formatTime(duration);
        
        // 2. Actualizar el ancho de la barra Violeta (0% a 100%)
        const progressPercent = (currentTime / duration) * 100;
        document.getElementById('progressFill').style.width = progressPercent + '%';
    }
}

// Función auxiliar para formatear segundos a M:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return minutes + ':' + (secs < 10 ? '0' : '') + secs;
}
