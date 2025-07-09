document.addEventListener('DOMContentLoaded', () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado.'))
            .catch(err => console.error('Erro ao registrar Service Worker:', err));
    }

    const anomaliasDatabase = {
        tabuleiro: [{ id: '1.1', anomalia: 'Manchas de umidade passiva', terapia: 'Tratamento superficial do concreto' },{ id: '1.2', anomalia: 'Manchas de umidade ativa', terapia: 'Tratamento superficial do concreto' },{ id: '1.5', anomalia: 'Concreto disgregado', terapia: 'Tratamento de concreto disgregado, desagregado ou segregado' },{ id: '1.17', anomalia: 'Armadura exposta', terapia: 'Tratamento de concreto disgregado, desagregado ou segregado' },{ id: '1.9', anomalia: 'Fissuras horizontais', terapia: 'Tratamento de fissuras' }],
        juntas: [{ id: '3.11', anomalia: 'Acúmulo de detritos', terapia: 'Limpeza e desobstrução das juntas de dilatação' },{ id: '3.6', anomalia: 'Ausência de perfil de vedação', terapia: 'Implantação de perfil pré-fabricado para junta de dilatação' },{ id: '3.13', anomalia: 'Abertura excessiva da junta', terapia: 'Recuperação das juntas com troca do perfil elastomérico' },{ id: '3.9', anomalia: 'Deterioração dos lábios poliméricos', terapia: 'Substituição dos lábios poliméricos' }],
        apoio: [{ id: '4.2', anomalia: 'Bloqueio', terapia: 'Limpeza e desobstrução de aparelhos de apoio' },{ id: '4.5', anomalia: 'Ruptura', terapia: 'Substituição dos aparelhos de apoio' },{ id: '4.8', anomalia: 'Esmagamento', terapia: 'Substituição dos aparelhos de apoio' }],
        pilares: [{ id: '1.17', anomalia: 'Armadura exposta', terapia: 'Tratamento de concreto disgregado, desagregado ou segregado' },{ id: '1.9', anomalia: 'Fissuras horizontais', terapia: 'Tratamento de fissuras' },{ id: '1.10', anomalia: 'Fissuras verticais', terapia: 'Tratamento de fissuras' }],
        encontros: [{ id: '1.1', anomalia: 'Manchas de umidade ativa', terapia: 'Tratamento superficial do concreto' },{ id: '3.1', anomalia: 'Existência de erosão', terapia: 'Tratamento de taludes com revestimento' },{ id: '1.19', anomalia: 'Incidência de vegetação', terapia: 'Limpeza e remoção da camada vegetal' }]
    };

    document.querySelectorAll('.add-anomaly-btn').forEach(button => {
        button.addEventListener('click', () => {
            const element = button.dataset.element;
            const containerId = button.dataset.container;
            const title = button.dataset.title;
            addAnomalyRow(element, containerId, title);
        });
    });

    function addAnomalyRow(element, containerId, title) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('anomaly-template');
        const clone = template.content.cloneNode(true);
        const anomalyCard = clone.querySelector('.anomaly-card');
        anomalyCard.querySelector('.anomaly-title').textContent = `Anomalia em: ${title}`;
        const anomalySelect = clone.querySelector('.anomaly-select');
        const therapyText = clone.querySelector('.therapy-text');
        const photoInput = clone.querySelector('.photo-input');
        const photoPreview = clone.querySelector('.photo-preview');
        const removeBtn = clone.querySelector('.remove-btn');
        const anomalias = anomaliasDatabase[element] || [];
        anomalias.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `(${item.id}) ${item.anomalia}`;
            anomalySelect.appendChild(option);
        });
        anomalySelect.addEventListener('change', () => {
            const selectedAnomaly = anomalias.find(a => a.id === anomalySelect.value);
            therapyText.textContent = selectedAnomaly ? selectedAnomaly.terapia : 'Selecione uma anomalia.';
        });
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.dataset.base64 = e.target.result; // Armazena base64 para exportação
                    const captionInput = document.createElement('input');
                    captionInput.type = 'text';
                    captionInput.placeholder = 'Digite a legenda da foto';
                    captionInput.className = 'caption-input';
                    photoPreview.appendChild(img);
                    photoPreview.appendChild(captionInput);
                };
                reader.readAsDataURL(file);
            }
        });
        removeBtn.addEventListener('click', () => container.removeChild(anomalyCard.parentNode));
        container.appendChild(clone);
    }

    // --- LÓGICA DE EXPORTAÇÃO ---
    const excelBtn = document.getElementById('export-excel-btn');
    const pdfBtn = document.getElementById('export-pdf-btn');
    const loadingDiv = document.getElementById('loading');

    excelBtn.addEventListener('click', exportToExcel);
    pdfBtn.addEventListener('click', exportToPDF);

    function collectData() {
        const form = document.getElementById('inspectionForm');
        const data = {
            cabecalho: {
                Rodovia: form.rodovia.value,
                Obra: form.obra.value,
                Km: form.km.value,
                Sentido: form.sentido.value,
                'Data Última Inspeção': form.ultimaRotineira.value
            },
            intervencoes: {
                Reparos: form.reparos.value,
                Reformas: form.reformas.value,
                Reforços: form.reforcos.value
            },
            pista: {
                Pavimento: form.pavimento.value,
                Acostamento: form.acostamento.value,
                Drenagem: form.drenagem.value,
                'Guarda-corpos': form.guardacorpo.value,
                'Barreiras/Defensas': form.barreiras.value
            },
            outros: {
                Taludes: form.taludes.value,
                Iluminação: form.iluminacao.value,
                Sinalização: form.sinalizacao.value,
                'Informações Complementares': form['info-complementares'].value
            },
            classificacao: {
                Estrutural: form['class-estrutural'].value,
                Funcional: form['class-funcional'].value,
                Durabilidade: form['class-durabilidade'].value
            },
            anomalias: []
        };

        document.querySelectorAll('.anomaly-card').forEach(card => {
            const title = card.querySelector('.anomaly-title').textContent.replace('Anomalia em: ', '');
            const select = card.querySelector('.anomaly-select');
            const anomalyText = select.options[select.selectedIndex].text;
            const img = card.querySelector('.photo-preview img');
            const caption = card.querySelector('.caption-input');
            
            data.anomalias.push({
                Elemento: title,
                Anomalia: anomalyText,
                Terapia: card.querySelector('.therapy-text').textContent,
                Localização: card.querySelector('.location-input').value,
                'Foto?': img ? 'Sim' : 'Não',
                Legenda: caption ? caption.value : ''
            });
        });
        return data;
    }

    function exportToExcel() {
        loadingDiv.classList.remove('hidden');
        const data = collectData();
        
        const wb = XLSX.utils.book_new();
        
        // Planilha 1: Cabeçalho e Seções
        const mainData = [
            ...Object.entries(data.cabecalho),
            ['---', '---'],
            ...Object.entries(data.intervencoes),
            ['---', '---'],
            ...Object.entries(data.pista),
             ['---', '---'],
            ...Object.entries(data.outros),
            ['---', '---'],
            ...Object.entries(data.classificacao)
        ];
        const ws1 = XLSX.utils.aoa_to_sheet([['Campo', 'Valor'], ...mainData]);
        XLSX.utils.book_append_sheet(wb, ws1, "Ficha Principal");

        // Planilha 2: Anomalias
        if(data.anomalias.length > 0) {
            const ws2 = XLSX.utils.json_to_sheet(data.anomalias);
            XLSX.utils.book_append_sheet(wb, ws2, "Anomalias Detalhadas");
        }

        const fileName = `Inspecao_${data.cabecalho.Rodovia}_${data.cabecalho.Km}.xlsx`;
        XLSX.writeFile(wb, fileName);
        loadingDiv.classList.add('hidden');
    }

    function exportToPDF() {
        loadingDiv.classList.remove('hidden');
        const { jsPDF } = window.jspdf;
        const formToExport = document.getElementById('app-container');

        html2canvas(formToExport, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;

            let position = 0;
            let heightLeft = imgHeight;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const formInfo = collectData().cabecalho;
            const fileName = `Inspecao_${formInfo.Rodovia}_${formInfo.Km}.pdf`;
            pdf.save(fileName);
            loadingDiv.classList.add('hidden');
        });
    }
});