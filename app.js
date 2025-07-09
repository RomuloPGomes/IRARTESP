// Garante que o script só rode depois que a página carregar
document.addEventListener('DOMContentLoaded', () => {

    // Registra o Service Worker para o PWA funcionar offline
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado com sucesso.'))
            .catch(err => console.error('Erro ao registrar Service Worker:', err));
    }

    // --- BANCO DE DADOS DE ANOMALIAS E TERAPIAS ---
    // (Baseado nas planilhas ARTESP fornecidas)
    const anomaliasDatabase = {
        tabuleiro: [
            { id: '1.1', anomalia: 'Manchas de umidade passiva', terapia: 'Tratamento superficial do concreto' },
            { id: '1.2', anomalia: 'Manchas de umidade ativa', terapia: 'Tratamento superficial do concreto' },
            { id: '1.5', anomalia: 'Concreto disgregado', terapia: 'Tratamento de concreto disgregado, desagregado ou segregado' },
            { id: '1.17', anomalia: 'Armadura exposta', terapia: 'Tratamento de concreto disgregado, desagregado ou segregado' },
            { id: '1.9', anomalia: 'Fissuras horizontais', terapia: 'Tratamento de fissuras' }
        ],
        juntas: [
            { id: '3.11', anomalia: 'Acúmulo de detritos', terapia: 'Limpeza e desobstrução das juntas de dilatação' },
            { id: '3.6', anomalia: 'Ausência de perfil de vedação', terapia: 'Implantação de perfil pré-fabricado para junta de dilatação' },
            { id: '3.13', anomalia: 'Abertura excessiva da junta', terapia: 'Recuperação das juntas com troca do perfil elastomérico' },
            { id: '3.9', anomalia: 'Deterioração dos lábios poliméricos', terapia: 'Substituição dos lábios poliméricos' }
        ],
        apoio: [
            { id: '4.2', anomalia: 'Bloqueio', terapia: 'Limpeza e desobstrução de aparelhos de apoio' },
            { id: '4.5', anomalia: 'Ruptura', terapia: 'Substituição dos aparelhos de apoio' },
            { id: '4.8', anomalia: 'Esmagamento', terapia: 'Substituição dos aparelhos de apoio' }
        ],
        pilares: [
            { id: '1.17', anomalia: 'Armadura exposta', terapia: 'Tratamento de concreto disgregado, desagregado ou segregado' },
            { id: '1.9', anomalia: 'Fissuras horizontais', terapia: 'Tratamento de fissuras' },
            { id: '1.10', anomalia: 'Fissuras verticais', terapia: 'Tratamento de fissuras' }
        ],
        encontros: [
            { id: '1.1', anomalia: 'Manchas de umidade ativa', terapia: 'Tratamento superficial do concreto' },
            { id: '3.1', anomalia: 'Existência de erosão', terapia: 'Tratamento de taludes com revestimento' },
            { id: '1.19', anomalia: 'Incidência de vegetação', terapia: 'Limpeza e remoção da camada vegetal' }
        ]
    };

    // Adiciona o evento de clique para todos os botões "Adicionar Anomalia"
    document.querySelectorAll('.add-anomaly-btn').forEach(button => {
        button.addEventListener('click', () => {
            const element = button.dataset.element;
            const containerId = button.dataset.container;
            addAnomalyRow(element, containerId);
        });
    });

    /**
     * Cria e insere um novo card para registrar uma anomalia
     * @param {string} element - O tipo de elemento (ex: 'tabuleiro')
     * @param {string} containerId - O ID do container onde o card será inserido
     */
    function addAnomalyRow(element, containerId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('anomaly-template');
        const clone = template.content.cloneNode(true);

        const anomalyCard = clone.querySelector('.anomaly-card');
        const anomalySelect = clone.querySelector('.anomaly-select');
        const therapyText = clone.querySelector('.therapy-text');
        const photoInput = clone.querySelector('.photo-input');
        const photoPreview = clone.querySelector('.photo-preview');
        const removeBtn = clone.querySelector('.remove-btn');

        // Popula o dropdown com as anomalias do elemento estrutural correto
        const anomalias = anomaliasDatabase[element] || [];
        anomalias.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `(${item.id}) ${item.anomalia}`;
            anomalySelect.appendChild(option);
        });

        // Evento para atualizar a terapia sugerida quando uma anomalia é escolhida
        anomalySelect.addEventListener('change', () => {
            const selectedId = anomalySelect.value;
            const selectedAnomaly = anomalias.find(a => a.id === selectedId);
            therapyText.textContent = selectedAnomaly ? selectedAnomaly.terapia : 'Selecione uma anomalia.';
        });

        // Evento para lidar com a captura de foto
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = ''; // Limpa conteúdo anterior
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const captionInput = document.createElement('input');
                captionInput.type = 'text';
                captionInput.placeholder = 'Digite a legenda da foto (obrigatório)';
                
                photoPreview.appendChild(img);
                photoPreview.appendChild(captionInput);
            };
            reader.readAsDataURL(file);
        });
        
        // Evento para o botão de remover o card de anomalia
        removeBtn.addEventListener('click', () => {
            container.removeChild(anomalyCard.parentNode);
        });

        container.appendChild(clone);
    }
    
    // Futuramente, a função de salvar o formulário será adicionada aqui.
    // Ela irá coletar todos os dados dos campos e dos cards de anomalias.
    document.getElementById('inspectionForm').addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Funcionalidade de salvar relatório final ainda em desenvolvimento.');
        // Aqui iria a lógica para coletar todos os dados, incluindo os dinâmicos, e salvar.
    });
});