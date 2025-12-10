const fs = require('fs');
const path = require('path');

const MEMORIA_DIR = path.join(__dirname, '../data');
const GENERAL_FILE = path.join(MEMORIA_DIR, 'general.json');

// Crear directorio si no existe
if (!fs.existsSync(MEMORIA_DIR)) fs.mkdirSync(MEMORIA_DIR, { recursive: true });
if (!fs.existsSync(GENERAL_FILE)) fs.writeFileSync(GENERAL_FILE, '{}');

function cargarArchivo(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return {}; }
}

function guardarArchivo(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const memoria = {
    guardar: (categoria, clave, valor) => {
        const data = cargarArchivo(GENERAL_FILE);
        if (data[clave]) {
            if (typeof data[clave] === 'string') {
                data[clave] = [data[clave], valor];
            } else if (Array.isArray(data[clave])) {
                data[clave].push(valor);
            }
        } else {
            data[clave] = valor;
        }
        guardarArchivo(GENERAL_FILE, data);
        return true;
    },

    buscar: (query) => {
        const q = query.toLowerCase();
        const resultados = [];
        const data = cargarArchivo(GENERAL_FILE);
        for (const [key, val] of Object.entries(data)) {
            const valStr = JSON.stringify(val).toLowerCase();
            if (key.toLowerCase().includes(q) || valStr.includes(q)) {
                resultados.push({ clave: key, valor: val });
            }
        }
        return resultados;
    }
};

module.exports = memoria;
