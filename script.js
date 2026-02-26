var player;
var isPlaying = false;

// Carga la API de YouTube
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    console.log("API de YouTube lista");
}

const API_KEY = 'AIzaSyBDwuqV-kmJEU8AOu2ljb7T5JJ2a5PaSUs';

async function handleSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        renderList(data.items);
    } catch (e) { console.error(e); }
}

function renderList(items) {
    const list = document.getElementById('resultsList');
    list.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'video-item';
        div.onclick = () => loadVideo(item.id.videoId, item.snippet.title, item.snippet.channelTitle);
        div.innerHTML = `<img src="${item.snippet.thumbnails.default.url}"><span>${item.snippet.title}</span>`;
        list.appendChild(div);
    });
}

function loadVideo(id, title, artist) {
    document.getElementById('currentTitle').innerText = title;
    document.getElementById('currentArtist').innerText = artist;
    
    // Inyectamos la estructura con el botón personalizado
    document.getElementById('player').innerHTML = `
        <div class="video-wrapper">
            <div id="yt-frame"></div>
            <div class="custom-controls">
                <button id="mainBtn" class="neon-btn" onclick="togglePlay()">▶</button>
                <div class="progress-bar"><div id="p-fill" class="progress-fill"></div></div>
            </div>
        </div>
    `;

    player = new YT.Player('yt-frame', {
        height: '100%', width: '100%', videoId: id,
        playerVars: { 'autoplay': 1, 'controls': 0, 'modestbranding': 1 },
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    const btn = document.getElementById('mainBtn');
    if (event.data == YT.PlayerState.PLAYING) {
        btn.innerText = '||';
        isPlaying = true;
    } else {
        btn.innerText = '▶';
        isPlaying = false;
    }
}

function togglePlay() {
    if (!player) return;
    if (isPlaying) { player.pauseVideo(); } else { player.playVideo(); }
}
