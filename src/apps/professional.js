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
    // CV COMMAND
    if (msgLower === 'cv' || msgLower === 'curriculum' || msgLower === 'resume' || msgLower === 'hoja de vida' || msgLower === 'web') {
        return `📄 *CV Profesional (ORION)*

🎓 Ingeniero Ambiental // Plomero Pro California // Tech Lead
🔗 https://agem2024.github.io/SEGURITI-USC/cv_pro.html`;
    }

    // CV 2 - PROFESSIONAL CV (Traditional Format)
    if (msgLower === 'cv 2' || msgLower === 'cv2' || msgLower === 'cv profesional' || msgLower === 'cv real') {
        return `📄 *CV Profesional Tradicional*

✨ Formato profesional ATS-friendly con logros cuantificables
📊 21+ años experiencia | 100+ proyectos | Bilingüe
🔗 https://agem2024.github.io/SEGURITI-USC/cv_professional.html`;
    }

    // TARJETA DIGITAL COMMAND
    if (msgLower === 'tj' || msgLower === 'tarjeta' || msgLower === 'tarjeta digital' || msgLower === 'card') {
        return `💳 *Tarjeta Digital (ORION)*

📱 Conexión Directa
🔗 https://agem2024.github.io/SEGURITI-USC/card.html`;
    }

    // PROPUESTA PLOMERÍA (CHRIS)
    if (msgLower === 'propuesta' || msgLower === 'propuesta chris' || msgLower === 'quote' || msgLower === 'cotizacion' || msgLower === 'cotización') {
        return `🔧 *Propuesta Profesional de Plomería*

📍 611 S Henry Ave, San Jose CA 95117
💰 Estimado completo con trabajos detallados
🔗 https://agem2024.github.io/ORION-info-public/propuesta_chris.html`;
    }

    // SKILLS
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

    // LANDING & HUB
    if (msgLower === 'landing' || msgLower === 'web' || msgLower === 'hub') {
        return `🌐 *NEON AGENT HUB*
Acceso global a tus agentes:
🔗 https://neon-agent-hub.web.app/`;
    }

    // APPS COMMAND (New)
    if (msgLower === 'apps' || msgLower === 'aplicaciones') {
        return `📱 *ORION AI APPS SUITE*

1️⃣ *AdVortex AI* (Video Marketing)
2️⃣ *EP Estimator* (Plomería Expert)
3️⃣ *MP PRO* (Estimación de Costos)
4️⃣ *Business Suite* (Gestión)
5️⃣ *Neon Hub* (Agentes)
6️⃣ *neKon AI* (Experiments)

🔗 *Acceder al Hub:* https://neon-agent-hub.web.app/`;
    }

    // LIST COMMAND
    if (msgLower === 'list' || msgLower === 'lista' || msgLower === 'comandos') {
        const menu = getCVMenu().replace('http://localhost:3030/landing.html', 'https://neon-agent-hub.web.app/');
        return menu;
    }

    return null;
}

module.exports = {
    handleProfessionalCommand
};
