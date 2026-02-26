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
        
        // --- AQUÍ ESTÁ EL CAMBIO ---
        div.className = 'video-item-card'; 
        
        const title = video.snippet.title.replace(/['"]/g, "");
        div.onclick = () => updatePlayer(video.id.videoId, title, video.snippet.channelTitle);
        
        div.innerHTML = `
            <div class="thumb-wrapper">
                <img src="${video.snippet.thumbnails.default.url}">
            </div>
            <div class="video-info-mini">
                <p class="v-title">${video.snippet.title}</p>
                <small class="v-channel">${video.snippet.channelTitle}</small>
            </div>
        `;
        // ---------------------------

        list.appendChild(div);

        if (index === 0) updatePlayer(video.id.videoId, title, video.snippet.channelTitle);
    });
}

function updatePlayer(id, title, artist) {
    const playerDiv = document.getElementById('player');
    const titleEle = document.getElementById('currentTitle');
    const artistEle = document.getElementById('currentArtist');

    if (playerDiv) {
        // TRUCO FINAL: Usamos la URL de incrustación limpia
        // Eliminamos restricciones de origen para que funcione desde tu carpeta local
        const embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0`;
        
        playerDiv.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
            </iframe>`;
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
