function exportarPDF() {
  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(jsPDF => {
    const doc = new jsPDF.jsPDF();
    doc.text('Relatório de Inspeções Metálicas', 10, 10);
    doc.text('Total de registros: ' + dados.length, 10, 20);
    dados.forEach((item, i) => {
      doc.text('- ' + JSON.stringify(item), 10, 30 + i * 10);
    });
    doc.save('relatorio.pdf');
  });
}
