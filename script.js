const VIDEO_ID = 'ekzHIouo8Q4';
let player = null;
let ready = false;
let progressTimer = null;

const $ = (id) => document.getElementById(id);
const playButton = $('playButton');
const coverButton = $('coverButton');
const playOverlay = $('playOverlay');
const progress = $('progress');
const volume = $('volume');
const currentTime = $('currentTime');
const duration = $('duration');
const statusText = $('statusText');
const statusDot = $('statusDot');
const muteButton = $('muteButton');

// Data playlist songs
const songs = [
  {title:'Die With A Smile',artist:'Lady Gaga, Bruno Mars',album:'Die With A Smile',time:'4:11',id:'kPa7bsKwL-c'},
  {title:'505',artist:'Arctic Monkeys',album:'Favourite Worst Nightmare',time:'4:13',id:'qU9mHegkTc4'},
  {title:'Those Eyes',artist:'New West',album:'Those Eyes',time:'3:40',id:'b_CpWmkhwq0'},
  {title:'End of Beginning',artist:'Djo',album:'DECIDE',time:'2:39',id:'sAl9TL6oQ2A'},
  {title:'Atlantis',artist:'Seafret',album:"Tell Me It's Real (Expanded Edition)",time:'3:49',id:'gVAy3lM0e3o'},
  {title:'I Love You So',artist:'The Walters',album:'I Love You So',time:'2:40',id:'HZX7MB_m13M'},
  {title:'The Night We Met',artist:'Lord Huron',album:'Strange Trails',time:'3:28',id:'wGF7PswOENQ'},
  {title:'Mind Over Matter (Reprise)',artist:'Young the Giant',album:'Mirrorball / Mind Over Matter (Reprise)',time:'3:50',id:'buvWBOZTfdc'},
  {title:'I Wanna Be Yours',artist:'Arctic Monkeys',album:'AM',time:'3:03',id:'nyuo9-OjNNg'},
  {title:'It Will Rain',artist:'Bruno Mars',album:'It Will Rain',time:'4:17',id:'3j4I1Fuj7tI'},
  {title:'When I Was Your Man',artist:'Bruno Mars',album:'Unorthodox Jukebox',time:'3:53',id:VIDEO_ID},
  {title:'Talking to the Moon',artist:'Bruno Mars',album:'Doo-Wops & Hooligans',time:'3:37',id:'fXw0pK4mYlQ'},
  {title:'Creep',artist:'Radiohead',album:'Pablo Honey',time:'3:58',id:'XFkzRNyygfk'}
];

let currentSongIndex = songs.findIndex(s => s.id === VIDEO_ID);

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function setPlaying(playing) {
  playButton.textContent = playing ? 'Ⅱ' : '▶';
  playOverlay.textContent = playing ? 'Ⅱ' : '▶';
  coverButton.classList.toggle('playing', playing);
  statusDot.classList.toggle('live', playing);
  statusText.textContent = playing ? 'Sedang diputar' : 'Siap diputar';
}

function setStatus(message, error = false) {
  statusText.textContent = message;
  statusDot.classList.toggle('live', !error && ready);
}

function syncProgress() {
  if (!ready || !player || typeof player.getDuration !== 'function') return;
  const total = player.getDuration();
  const now = player.getCurrentTime();
  if (total > 0) {
    progress.value = (now / total) * 100;
    duration.textContent = formatTime(total);
    currentTime.textContent = formatTime(now);
  }
}

// Fungsi untuk memutar lagu berikutnya
function playNextSong() {
  if (currentSongIndex < songs.length - 1) {
    currentSongIndex++;
    const nextSong = songs[currentSongIndex];
    setTrack(nextSong.id, nextSong.title, nextSong.artist);
    player.loadVideoById(nextSong.id);
    player.playVideo();
    setStatus(`Memutar: ${nextSong.title}`);
  } else {
    // Jika sudah di lagu terakhir, kembali ke lagu pertama
    currentSongIndex = 0;
    const firstSong = songs[currentSongIndex];
    setTrack(firstSong.id, firstSong.title, firstSong.artist);
    player.loadVideoById(firstSong.id);
    player.playVideo();
    setStatus(`Memutar: ${firstSong.title}`);
  }
}

// Fungsi untuk mengubah track
function setTrack(id, title, artist) {
  const coverImg = document.getElementById('cover');
  if (coverImg) {
    coverImg.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
  const titleEl = document.getElementById('titl');
  if (titleEl) titleEl.textContent = title;
  const artistEl = document.getElementById('artist');
  if (artistEl) artistEl.textContent = artist;
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('youtube-player', {
    videoId: VIDEO_ID,
    width: '100%',
    height: '100%',
    playerVars: {
      playsinline: 1,
      rel: 0,
      controls: 1,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: (event) => {
        ready = true;
        event.target.setVolume(Number(volume.value));
        duration.textContent = formatTime(event.target.getDuration());
        setStatus('Siap diputar');
        clearInterval(progressTimer);
        progressTimer = setInterval(syncProgress, 500);
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) setPlaying(true);
        if (event.data === YT.PlayerState.PAUSED) setPlaying(false);
        // Ketika lagu SELESAI/ENDED, putar lagu berikutnya
        if (event.data === YT.PlayerState.ENDED) {
          setPlaying(false);
          playNextSong();
        }
        if (event.data === YT.PlayerState.BUFFERING) setStatus('Memuat lagu...');
      },
      onError: (event) => {
        const messages = {
          2: 'ID video YouTube tidak valid.',
          5: 'Video tidak bisa diputar di HTML5 player.',
          100: 'Video tidak ditemukan atau sudah privat.',
          101: 'Video ini tidak mengizinkan pemutaran di website.',
          150: 'Video ini tidak mengizinkan pemutaran di website.',
          153: 'YouTube menolak identitas halaman. Buka lewat GitHub Pages, bukan file lokal.'
        };
        setPlaying(false);
        setStatus(messages[event.data] || `YouTube error ${event.data}.`, true);
      },
      onAutoplayBlocked: () => {
        setPlaying(false);
        setStatus('Klik tombol Play untuk mulai memutar.', false);
      }
    }
  });
};

function togglePlay() {
  if (!ready || !player) {
    setStatus('Player YouTube masih dimuat...', true);
    return;
  }
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
}

playButton.addEventListener('click', togglePlay);
coverButton.addEventListener('click', togglePlay);

$('restart').addEventListener('click', () => {
  if (!ready || !player) return;
  player.seekTo(0, true);
  player.playVideo();
});

muteButton.addEventListener('click', () => {
  if (!ready || !player) return;
  if (player.isMuted()) {
    player.unMute();
    muteButton.textContent = '🔊';
    volume.value = player.getVolume();
  } else {
    player.mute();
    muteButton.textContent = '🔇';
  }
});

volume.addEventListener('input', () => {
  if (!ready || !player) return;
  const value = Number(volume.value);
  if (value > 0) player.unMute();
  player.setVolume(value);
  muteButton.textContent = value === 0 ? '🔇' : '🔊';
});

progress.addEventListener('input', () => {
  if (!ready || !player) return;
  const total = player.getDuration();
  const next = (Number(progress.value) / 100) * total;
  currentTime.textContent = formatTime(next);
});

progress.addEventListener('change', () => {
  if (!ready || !player) return;
  const total = player.getDuration();
  player.seekTo((Number(progress.value) / 100) * total, true);
});

const api = document.createElement('script');
api.src = 'https://www.youtube.com/iframe_api';
api.async = true;
document.head.appendChild(api);
