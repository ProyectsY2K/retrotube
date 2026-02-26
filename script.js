const API_KEY = 'AIzaSyBDwuqV-kmJEU8AOu2ljb7T5JJ2a5PaSUs';

async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    if (!query) return;

    // TRUCO: Añadimos filtros para obtener videos que YouTube sí permite insertar
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&type=video&videoEmbeddable=true&videoSyndicated=true&q=${encodeURIComponent(query)}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            renderList(data.items);
        } else {
            alert("No se encontraron videos disponibles para esta búsqueda.");
        }
    } catch (e) {
        console.error("Error de conexión:", e);
    }
}

function renderList(videos) {
    const list = document.getElementById('resultsList');
    if (!list) return;
    list.innerHTML = ''; 

    videos.forEach((video, index) => {
        const div = document.createElement('div');
        div.className = 'video-item';
        div.style = "display:flex; gap:10px; padding:8px; cursor:pointer; border-bottom:1px solid #222; margin-bottom:5px; background: rgba(255,255,255,0.05);";
        
        // Limpiamos el título para evitar errores de comillas
        const title = video.snippet.title.replace(/['"]/g, "");
        div.onclick = () => updatePlayer(video.id.videoId, title, video.snippet.channelTitle);
        
        div.innerHTML = `
            <img src="${video.snippet.thumbnails.default.url}" width="70" style="border:1px solid #bc13fe">
            <div style="overflow:hidden">
                <p style="font-size:10px; margin:0; color:white; white-space:nowrap; text-overflow:ellipsis;">${video.snippet.title}</p>
                <small style="color:#bc13fe; font-size:9px;">${video.snippet.channelTitle}</small>
            </div>
        `;
        list.appendChild(div);

        // Al buscar, carga el primer video automáticamente
        if (index === 0) updatePlayer(video.id.videoId, title, video.snippet.channelTitle);
    });
}

function updatePlayer(id, title, artist) {
    const playerDiv = document.getElementById('player');
    const titleEle = document.getElementById('currentTitle');
    const artistEle = document.getElementById('currentArtist');

    if (playerDiv) {
        // Quitamos el texto de "[ SELECCIONA UN VIDEO ]" y ponemos el reproductor
        playerDiv.innerHTML = `
            <div class="video-wrapper">
                <iframe 
                    id="main-video"
                    src="https://www.youtube.com/embed/${id}?autoplay=1&controls=0&modestbranding=1" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>
                
                <div class="custom-controls">
                    <button class="play-btn" onclick="togglePlay()">▶</button>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>`;
    }
    
    if (titleEle) titleEle.innerText = title;
    if (artistEle) artistEle.innerText = artist;
}

// Iniciar estrellas automáticamente
(function initStars() {
    const container = document.getElementById('star-container');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.innerHTML = '★';
        s.style = `position:fixed; left:${Math.random()*100}vw; top:-20px; font-size:${Math.random()*15+10}px; color:${Math.random()>0.5?'white':'#bc13fe'}; z-index:-1; animation: fall ${Math.random()*3+3}s linear infinite;`;
        container.appendChild(s);
    }
})();
