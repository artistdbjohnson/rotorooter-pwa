const btn = document.getElementById('menuBtn');
const overlay = document.getElementById('overlay');
if (btn && overlay) {
  btn.addEventListener('click', () => overlay.classList.toggle('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') overlay.classList.remove('open');
  });
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
