let db;
const DB_NAME = 'InspecaoDB';
const DB_STORE = 'registros';

function initDB() {
  const request = indexedDB.open(DB_NAME, 1);
  request.onerror = () => console.error('Erro ao abrir IndexedDB');
  request.onsuccess = (e) => db = e.target.result;
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true });
  };
}

function salvarRegistro(data) {
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).add(data);
}

function listarRegistros(callback) {
  const tx = db.transaction(DB_STORE, 'readonly');
  const req = tx.objectStore(DB_STORE).getAll();
  req.onsuccess = () => callback(req.result);
}

initDB();
