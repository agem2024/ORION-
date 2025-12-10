const fs = require('fs');
const path = require('path');

// 📄 CV Command Handler
// Handles requests for professional information, CV, and Portfolio

function getCVMenu() {
    return `🎓 *ALEX G. ESPINOSA*
AI Solutions Architect | Engineer

📂 *COMANDOS PROFESIONALES:*
• *cv* - Ver Resumen y Descarga
• *skills* - Ver Experiencia Técnica
• *landing* - Ver Web Personal

🔗 *WEB:* http://localhost:3030/landing.html
📄 *PDF:* Solicitud directa`;
}

function getCVSummary() {
    return `👤 *PERFIL PROFESIONAL*

**Alex G. Espinosa**
*Consultor AI & Ingeniero Senior (21+ Años)*

🚀 **EXPERIENCIA RECIENTE:**
• **AI Architect (Orion Systems):** Creación de agentes autónomos y automatización empresarial (2024-Presente).
• **Project Manager (California):** Gestión de proyectos de infraestructura ($50k-$500k) y cumplimiento de códigos (2014-Presente).
• **Ingeniero Ambiental (ISO 14001):** Auditoría y diseño de sistemas a escala municipal (2004-2014).

🛠️ **TECH STACK:**
Gemini AI, Node.js, Python, Automation, Hydraulic Design, CAD.

🔗 **Ver perfil completo:**
http://localhost:3030/landing.html`;
}

function handleProfessionalCommand(msgLower) {
    if (msgLower === 'cv' || msgLower === 'curriculum' || msgLower === 'resume') {
        return getCVSummary();
    }

    if (msgLower === 'skills' || msgLower === 'habilidades') {
        return `🛠️ *HABILIDADES TÉCNICAS*

🤖 *AI & DEV:*
• Multi-Agent Systems (Orion)
• Generative AI (Gemini, GPT-4)
• Node.js, Python, WhatsApp Automation

🏗️ *INGENIERÍA:*
• Diseño Hidráulico & Sanitario
• Estimación de Costos & Presupuestos
• Auditoría ISO 14001

💼 *MANAGEMENT:*
• Liderazgo de Equipos
• Gestión de Proyectos Complejos
• Consultoría Estratégica`;
    }

    if (msgLower === 'landing' || msgLower === 'web' || msgLower === 'portfolio') {
        return `🌐 *PORTAFOLIO PROFESIONAL*

Accede a la nueva experiencia interactiva:
👉 http://localhost:3030/landing.html

*Incluye:*
• Casos de Estudio AI
• Trayectoria de Ingeniería
• Servicios de Consultoría`;
    }

    return null;
}

module.exports = {
    handleProfessionalCommand
};
