document.addEventListener('DOMContentLoaded', () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));
    }

    const concessionariasDB = {
        tiete: { nome: "Rodovias do Tietê S/A", logo: "logos/tiete.png" },
        ecovias: { nome: "Ecovias dos Imigrantes S/A", logo: "logos/ecovias.png" },
        ccr: { nome: "CCR AutoBAn", logo: "logos/ccr.png" },
        default: { nome: "Selecione a Concessionária", logo: "logos/default.png"}
    };
    const anomaliasDatabase = {
        tabuleiro: [{id:"1.1",anomalia:"Manchas de umidade passiva",terapia:"Tratamento superficial do concreto"},{id:"1.2",anomalia:"Manchas de umidade ativa",terapia:"Tratamento superficial do concreto"},{id:"1.5",anomalia:"Concreto disgregado",terapia:"Tratamento de concreto disgregado, desagregado ou segregado"},{id:"1.17",anomalia:"Armadura exposta",terapia:"Tratamento de concreto disgregado, desagregado ou segregado"}],
        juntas: [{id:"3.11",anomalia:"Acúmulo de detritos na junta",terapia:"Limpeza e desobstrução das juntas de dilatação"},{id:"3.6",anomalia:"Ausência de perfil de vedação",terapia:"Implantação de perfil pré-fabricado para junta de dilatação"}],
        apoio: [{id:"4.2",anomalia:"Bloqueio",terapia:"Limpeza e desobstrução de aparelhos de apoio"},{id:"4.5",anomalia:"Ruptura",terapia:"Substituição dos aparelhos de apoio"}],
        pilares: [{id:"1.17",anomalia:"Armadura exposta",terapia:"Tratamento de concreto disgregado, desagregado ou segregado"},{id:"1.9",anomalia:"Fissuras horizontais",terapia:"Tratamento de fissuras"}],
        pavimento: [{id:"3.2",anomalia:"Desgaste superficial",terapia:"Recuperação do pavimento"},{id:"3.16",anomalia:"Panela",terapia:"Recuperação de pavimento asfáltico"}],
        drenagem: [{id:"3.5",anomalia:"Deficiência no sistema",terapia:"Recuperação de sarjetas e/ou canaletas"},{id:"2.9",anomalia:"Buzinotes danificados",terapia:"Recuperação de buzinotes"}],
        guardaCorpo: [{id:"2.2",anomalia:"Corrosão",terapia:"Proteção superficial de estruturas metálicas"}],
    };
    const locationsDatabase = {
        tabuleiro: ["Alma Externa", "Alma Interna", "Laje", "Viga Longarina"],
        juntas: ["Junta de dilatação"],
        apoio: ["Aparelho de apoio", "Berço de apoio"],
        pilares: ["Pilar", "Travessa"],
        pavimento: ["Pista sobre a obra", "Aproximação"],
        drenagem: ["Buzinote", "Sarjeta"],
        guardaCorpo: ["Guarda-corpo"],
        default: ["Geral"]
    };

    document.getElementById('concessionaria-select').addEventListener('change', (event) => {
        const concessionaria = concessionariasDB[event.target.value] || concessionariasDB.default;
        document.getElementById('concessionaria-logo').src = concessionaria.logo;
        document.getElementById('header-concessionaria-nome').textContent = concessionaria.nome;
    });

    document.querySelectorAll('.add-anomaly-btn').forEach(button => {
        button.addEventListener('click', () => {
            addAnomalyRow(button.dataset.element, button.dataset.container);
        });
    });

    function addAnomalyRow(element, containerId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('anomaly-template').content.cloneNode(true);
        const anomalyCard = template.querySelector('.anomaly-card');
        const locationSelect = anomalyCard.querySelector('.location-select');
        const anomalySelect = anomalyCard.querySelector('.anomaly-select');
        const therapyText = anomalyCard.querySelector('.therapy-text');
        
        (locationsDatabase[element] || locationsDatabase.default).forEach(loc => locationSelect.add(new Option(loc, loc)));
        (anomaliasDatabase[element] || []).forEach(item => anomalySelect.add(new Option(item.anomalia, item.id)));

        anomalySelect.addEventListener('change', () => {
            const selectedAnomaly = (anomaliasDatabase[element] || []).find(a => a.id === anomalySelect.value);
            therapyText.textContent = selectedAnomaly ? selectedAnomaly.terapia : '...';
        });

        anomalyCard.querySelector('.photo-input').addEventListener('change', (event) => {
            const file = event.target.files[0];
            const photoPreview = event.target.nextElementSibling;
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => photoPreview.innerHTML = `<img src="${e.target.result}" data-base64="${e.target.result}"><input type="text" class="caption-input" placeholder="Legenda da foto">`;
                reader.readAsDataURL(file);
            }
        });

        anomalyCard.querySelector('.remove-btn').addEventListener('click', (e) => e.target.closest('.anomaly-card').remove());
        container.appendChild(anomalyCard);
    }
    
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcelFormatted);
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDFFormatted);
    const loadingDiv = document.getElementById('loading');

    function collectData() {
        const form = document.getElementById('inspectionForm');
        return {
            concessionaria: concessionariasDB[document.getElementById('concessionaria-select').value] || concessionariasDB.default,
            cabecalho: { rodovia: form.rodovia.value, obra: form.obra.value, km: form.km.value, sentido: form.sentido.value, ultimaInspecao: form.ultimaRotineira.value },
            intervencoes: { reparos: form.reparos.value, reformas: form.reformas.value, reforcos: form.reforcos.value },
            info: form['info-complementares'].value,
            classificacao: { estrutural: form['class-estrutural'].value, funcional: form['class-funcional'].value, durabilidade: form['class-durabilidade'].value },
            anomalias: Array.from(document.querySelectorAll('.anomaly-card')).map(card => ({
                elemento: card.parentElement.previousElementSibling.textContent,
                local: card.querySelector('.location-select').value,
                anomalia: card.querySelector('.anomaly-select').selectedOptions[0].text,
                terapia: card.querySelector('.therapy-text').textContent,
                fotoBase64: card.querySelector('img')?.dataset.base64,
                legenda: card.querySelector('.caption-input')?.value
            }))
        };
    }
    
    function exportToExcelFormatted() {
        loadingDiv.classList.remove('hidden');
        const data = collectData();
        let sheetData = [
            [data.concessionaria.nome, null, null, "OAE:", data.cabecalho.obra],
            ["INSPEÇÃO ROTINEIRA", null, null, "DATA:", new Date().toLocaleDateString("pt-BR")],
            [],
            ["A - Localização", null, null, "F - Classificação"],
            ["Rodovia:", data.cabecalho.rodovia, null, "Estrutural:", data.classificacao.estrutural],
            ["Obra:", data.cabecalho.obra, null, "Funcional:", data.classificacao.funcional],
            ["Km:", data.cabecalho.km, null, "Durabilidade:", data.classificacao.durabilidade],
            ["Sentido:", data.cabecalho.sentido],
            [],
            ["D - ANOMALIAS CONSTATADAS"],
            ["Elemento", "Local", "Anomalia", "Terapia", "Legenda da Foto"]
        ];
        data.anomalias.forEach(a => sheetData.push([a.elemento, a.local, a.anomalia, a.terapia, a.legenda]));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws['!cols'] = [ {wch:25}, {wch:25}, {wch:40}, {wch:40}, {wch:40} ];
        ws['!merges'] = [ {s:{r:0,c:0}, e:{r:0,c:2}}, {s:{r:1,c:0}, e:{r:1,c:2}}, {s:{r:3,c:0}, e:{r:3,c:2}}, {s:{r:9,c:0}, e:{r:9,c:4}} ];
        XLSX.utils.book_append_sheet(wb, ws, "Ficha de Inspeção");
        XLSX.writeFile(wb, `Inspecao_${data.cabecalho.rodovia}_${data.cabecalho.Km}.xlsx`);
        loadingDiv.classList.add('hidden');
    }

    function exportToPDFFormatted() {
        loadingDiv.classList.remove('hidden');
        const data = collectData();
        const { jsPDF } = window.jspdf;
        const pdfContainer = document.getElementById('pdf-export-container');
        pdfContainer.innerHTML = '';
        const fichaPageHtml = `
            <div class="pdf-page">
                <div class="pdf-header"><div>${data.concessionaria.nome.toUpperCase()}</div><div>OAE: ${data.cabecalho.obra}</div></div>
                <div class="pdf-subheader"><div>INSPEÇÃO ROTINEIRA</div><div>DATA: ${new Date().toLocaleDateString("pt-BR")}</div></div>
                <div class="pdf-grid">
                    <div class="pdf-col">
                        <div class="pdf-section"><div class="pdf-title">A - Localização</div><p><strong>Rodovia:</strong> ${data.cabecalho.rodovia}</p><p><strong>Obra:</strong> ${data.cabecalho.obra}</p><p><strong>Km:</strong> ${data.cabecalho.km}</p><p><strong>Sentido:</strong> ${data.cabecalho.sentido}</p></div>
                        <div class="pdf-section" id="pdf-d1-content-temp"><div class="pdf-title">D1 - Estrutura</div></div>
                    </div>
                    <div class="pdf-col">
                        <div class="pdf-section" id="pdf-d2-content-temp"><div class="pdf-title">D2 - Pista</div></div>
                        <div class="pdf-section"><div class="pdf-title">F - Classificação</div><p><strong>Estrutural:</strong> ${data.classificacao.estrutural}</p><p><strong>Funcional:</strong> ${data.classificacao.funcional}</p><p><strong>Durabilidade:</strong> ${data.classificacao.durabilidade}</p></div>
                    </div>
                </div>
            </div>`;
        pdfContainer.innerHTML += fichaPageHtml;
        const d1Content = pdfContainer.querySelector('#pdf-d1-content-temp');
        const d2Content = pdfContainer.querySelector('#pdf-d2-content-temp');
        data.anomalias.forEach(a => {
            const item = document.createElement('div');
            item.className = 'pdf-anomaly-item';
            item.innerHTML = `<strong>${a.elemento} (${a.local || 'Geral'}):</strong> ${a.anomalia}`;
            const target = ["Tabuleiro", "Juntas de Dilatação", "Aparelhos de Apoio", "Pilares"].includes(a.elemento) ? d1Content : d2Content;
            target.appendChild(item);
        });
        const photos = data.anomalias.filter(a => a.fotoBase64);
        for (let i = 0; i < photos.length; i += 4) {
            const photoChunk = photos.slice(i, i + 4);
            const photoPage = document.createElement('div');
            photoPage.className = 'pdf-photo-page';
            let gridHtml = '';
            photoChunk.forEach((p, index) => {
                gridHtml += `<div class="pdf-photo-item"><img src="${p.fotoBase64}"><p><strong>Foto ${i + index + 1}:</strong> ${p.legenda || 'Sem legenda'}</p></div>`;
            });
            photoPage.innerHTML = `<div class="pdf-header"><div>ANEXO FOTOGRÁFICO</div><div>Página ${Math.floor(i/4)+1}</div></div><div class="photo-grid">${gridHtml}</div>`;
            pdfContainer.appendChild(photoPage);
        }
        const elementToPrint = pdfContainer;
        elementToPrint.classList.remove('hidden');
        html2canvas(elementToPrint, { scale: 2, useCORS: true }).then(canvas => {
            elementToPrint.classList.add('hidden');
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = canvas.height * pdfWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft > 0) {
                position = -heightLeft;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`Ficha_${data.cabecalho.rodovia}_${data.cabecalho.Km}.pdf`);
            loadingDiv.classList.add('hidden');
        });
    }
});