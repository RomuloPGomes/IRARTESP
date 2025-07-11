const dados = [];

function exportarCSV() {
  if (dados.length === 0) return alert("Nada a exportar");
  const campos = Object.keys(dados[0]);
  const linhas = dados.map(d => campos.map(c => d[c] || '').join(','));
  const csv = [campos.join(','), ...linhas].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inspecoes.csv';
  a.click();
  URL.revokeObjectURL(url);
}
