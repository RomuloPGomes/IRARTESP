// Verifica se o navegador suporta Service Workers (essencial para PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registrado com sucesso', reg))
    .catch(err => console.log('Erro ao registrar Service Worker', err));
}

const form = document.getElementById('inspectionForm');
const cameraInput = document.getElementById('cameraInput');
const imageContainer = document.getElementById('image-container');

// Salvar dados do formulário
form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Salva os dados no armazenamento local do navegador
    localStorage.setItem('currentInspection', JSON.stringify(data));
    alert('Inspeção salva com sucesso!');
});

// Capturar e exibir a imagem
cameraInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement('img');
            img.src = e.target.result;
            imageContainer.innerHTML = ''; // Limpa imagens anteriores
            imageContainer.appendChild(img);

            // Salva a imagem em base64 no localStorage
            localStorage.setItem('inspectionImage', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Carregar dados salvos ao iniciar
window.addEventListener('load', () => {
    const savedData = localStorage.getItem('currentInspection');
    if (savedData) {
        const data = JSON.parse(savedData);
        for (const key in data) {
            if (form.elements[key]) {
                form.elements[key].value = data[key];
            }
        }
    }
    const savedImage = localStorage.getItem('inspectionImage');
    if (savedImage) {
        const img = document.createElement('img');
        img.src = savedImage;
        imageContainer.appendChild(img);
    }
});