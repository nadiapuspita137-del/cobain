const VIDEO_ID = 'ekzHIouo8Q4';
let player;
let ready = false;
let progressTimer;

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

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
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

function syncProgress() {
  if (!ready || !player?.getDuration) return;
  const total = player.getDuration();
  const now = player.getCurrentTime();
  if (total > 0) {
    progress.value = (now / total) * 100;
    duration.textContent = formatTime(total);
    currentTime.textContent = formatTime(now);
  }
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('youtube-player', {
    videoId: VIDEO_ID,
    playerVars: {
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
      controls: 1,
      enablejsapi: 1
    },
    events: {
      onReady: () => {
        ready = true;
        player.setVolume(Number(volume.value));
        duration.textContent = formatTime(player.getDuration());
        clearInterval(progressTimer);
        progressTimer = setInterval(syncProgress, 500);
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) setPlaying(true);
        if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setPlaying(false);
      }
    }
  });
};

function togglePlay() {
  if (!ready) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
}

playButton.addEventListener('click', togglePlay);
coverButton.addEventListener('click', togglePlay);

$('restart').addEventListener('click', () => {
  if (!ready) return;
  player.seekTo(0, true);
  player.playVideo();
});

muteButton.addEventListener('click', () => {
  if (!ready) return;
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
  if (!ready) return;
  const value = Number(volume.value);
  player.unMute();
  player.setVolume(value);
  muteButton.textContent = value === 0 ? '🔇' : '🔊';
});

progress.addEventListener('input', () => {
  if (!ready) return;
  const total = player.getDuration();
  const next = (Number(progress.value) / 100) * total;
  currentTime.textContent = formatTime(next);
});

progress.addEventListener('change', () => {
  if (!ready) return;
  const total = player.getDuration();
  player.seekTo((Number(progress.value) / 100) * total, true);
});

const api = document.createElement('script');
api.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(api);
