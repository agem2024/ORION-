// I-601A Commands Module for Orion WhatsApp Bot
// GitHub Repo: https://github.com/agem2024/SEGURITI-USC

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/agem2024/SEGURITI-USC/main';
const GITHUB_REPO_URL = 'https://github.com/agem2024/SEGURITI-USC';

const DOCUMENTS = {
    'declaracion': 'DECLARACION_PERSONAL_OFICIAL_USCIS.html',
    'gastos': 'LISTA_GASTOS_OFICIAL_USCIS.html',
    'cuestionario': 'I-601A_RESPUESTAS_DESARROLLADAS.md',
    'olivia': 'DECLARACION_OLIVIA_PETICIONARIA.md',
    'medico': 'OLIVIA_INFORMACION_COMPLETA.md',
    'cv': 'CV_ALEX_ESPINOSA_2025.md',
    'photos': 'photo-manager-pro.html'
};

const FINANCIALS = {
    olivia_income: 11500,
    alex_income: 5600,
    olivia_expenses: 6380,
    alex_expenses: 3930,
    alex_help: 800
};

function commandLaw1() {
    return `*I-601A CASE DOCUMENTS*

Repository: ${GITHUB_REPO_URL}

MAIN DOCUMENTS:
1. Declaracion Personal (8 pag)
2. Lista de Gastos
3. Cuestionario Completo
4. Info Medica Olivia

COMMANDS:
- dame declaracion
- dame gastos
- dame cuestionario
- fotos
- estado

Status: 80% Complete`;
}

function commandFotos() {
    return `*PHOTO MANAGER PRO*

Access: ${GITHUB_RAW_BASE}/photo-manager-pro.html

FEATURES:
- Upload photos from any device
- AI auto-tagging
- Image editor (brightness, contrast)
- Search and organize
- Export for USCIS

Photos cataloged: 89`;
}

function commandEditarFoto() {
    return `*PHOTO EDITOR*

To edit a photo:
1. Open Photo Manager: ${GITHUB_RAW_BASE}/photo-manager-pro.html
2. Click Upload Photo
3. Adjust: Brightness, Contrast, Saturation, Blur
4. Add Tags and Description
5. Click Save

Available edits:
- Brightness (0-200%)
- Contrast (0-200%)
- Saturation (0-200%)
- Blur effect (0-10px)
- Tags (Alex, Olivia, Family, etc)`;
}

function commandEstado() {
    return `*I-601A CASE STATUS*

DOCUMENTS:
- Declaracion Personal - READY
- Lista Gastos - READY
- Cuestionario - 100% COMPLETE
- Declaracion Olivia - READY
- Info Medica - READY

PHOTOS: 89 cataloged

FINANCIALS:
- Olivia household: $${FINANCIALS.olivia_income}/month
- Alex personal: $${FINANCIALS.alex_income}/month
- Both positive balance

PENDING:
- Psychological evaluation
- Dr. Yamashiro letter
- Tax Returns 2023-2024
- 15-20 reference letters

CASE STATUS: 80% Complete`;
}

function commandDame(docName) {
    const key = docName.toLowerCase().trim();

    if (DOCUMENTS[key]) {
        return `*${key.toUpperCase()}*

Link: ${GITHUB_REPO_URL}/blob/main/${DOCUMENTS[key]}

Raw: ${GITHUB_RAW_BASE}/${DOCUMENTS[key]}`;
    }

    return `Document not found: "${docName}"

Available:
- declaracion, gastos, cuestionario
- olivia, medico, cv, photos`;
}

function commandGastos() {
    return `*MONTHLY FINANCES*

OLIVIA HOUSEHOLD:
Income: $${FINANCIALS.olivia_income}
Expenses: $${FINANCIALS.olivia_expenses}
Balance: +$${FINANCIALS.olivia_income - FINANCIALS.olivia_expenses}

ALEX PERSONAL:
Income: $${FINANCIALS.alex_income}
Expenses: $${FINANCIALS.alex_expenses}
Balance: +$${FINANCIALS.alex_income - FINANCIALS.alex_expenses}

ALEX HELPS MOM: $${FINANCIALS.alex_help}/month`;
}

function handleI601ACommand(message) {
    if (!message) return null;
    const msg = message.toLowerCase().trim();

    if (msg === 'law 1' || msg === 'law1') return commandLaw1();
    if (msg === 'fotos' || msg === 'photos') return commandFotos();
    if (msg.startsWith('editar foto') || msg === 'edit photo') return commandEditarFoto();
    if (msg === 'estado' || msg === 'status') return commandEstado();
    if (msg.startsWith('dame ')) return commandDame(msg.replace('dame ', ''));
    if (msg === 'gastos' || msg === 'ingresos' || msg === 'money') return commandGastos();

    return null;
}

module.exports = {
    handleI601ACommand,
    commandLaw1,
    commandFotos,
    commandEditarFoto,
    commandEstado,
    commandDame,
    commandGastos,
    DOCUMENTS,
    FINANCIALS,
    GITHUB_REPO_URL,
    GITHUB_RAW_BASE
};
