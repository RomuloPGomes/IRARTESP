document.addEventListener('click', (e) => {
  if (e.target.classList.contains('img-thumb')) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `<img src='${e.target.src}' style='max-width:90%; max-height:90%; border: 4px solid white;'>`;
    modal.onclick = () => document.body.removeChild(modal);
    document.body.appendChild(modal);
  }
});
