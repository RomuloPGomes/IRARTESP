function associarFotosPorNome(arquivos) {
  const associacoes = [];
  for (let arq of arquivos) {
    const nome = arq.name.split('.')[0];
    const [elemento, anomalia] = nome.split('_');
    if (elemento && anomalia) {
      associacoes.push({
        elemento,
        anomalia,
        arquivo: arq
      });
    }
  }
  return associacoes;
}
