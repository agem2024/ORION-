const fs = require('fs');
const path = require('path');

function getCVMenu() {
    return `💼 *ALEX G. ESPINOSA*
AI Solutions Architect | Engineer

📋 *COMANDOS PROFESIONALES:*
🔹 *cv* - Ver Resumen y Descarga
🔹 *skills* - Ver Experiencia Técnica
🔹 *landing* - Ver Web Personal

🌐 *WEB:* http://localhost:3030/landing.html
📄 *PDF:* Solicitud directa`;
}

function getCVSummary() {
    return `📑 *PERFIL PROFESIONAL*

**Alex G. Espinosa**
*Consultor AI & Ingeniero Senior (21+ Años)*

🔥 **EXPERIENCIA RECIENTE:**
🔹 **AI Architect (Orion Systems):** Creación de agentes autónomos y automatización (2024-Presente).
🔹 **Project Manager (California):** Gestión de proyectos de infraestructura y cumplimiento (2014-Presente).
🔹 **Ingeniero Ambiental (ISO 14001):** Auditoría y diseño a escala municipal (2004-2014).

💻 **TECH STACK:**
Gemini AI, Node.js, Python, Automation, Hydraulic Design, CAD.

🔗 **Ver perfil completo:**
http://localhost:3030/landing.html`;
}

function handleProfessionalCommand(msgLower) {
    if (msgLower === 'cv' || msgLower === 'curriculum' || msgLower === 'resume' || msgLower === 'hoja de vida' || msgLower === 'web') {
        return `📄 *CV Profesional (ORION)*

👨‍🔧 Ingeniero Ambiental // Plomero Pro California // Tech Lead
🔗 https://agem2024.github.io/SEGURITI-USC/docs/cv_pro.html`;
    }

    if (msgLower === 'cv 2' || msgLower === 'cv2' || msgLower === 'cv profesional' || msgLower === 'cv real') {
        return `📄 *CV Profesional Tradicional*

👔 Formato profesional ATS-friendly con logros cuantificables
📈 21+ años experiencia | 100+ proyectos | Bilingüe
🔗 https://agem2024.github.io/SEGURITI-USC/docs/cv_professional.html`;
    }

    if (msgLower === 'tj' || msgLower === 'tarjeta' || msgLower === 'tarjeta digital' || msgLower === 'card' || msgLower === 'mp' || msgLower === '/mp') {
        return `*TARJETA DIGITAL - MORALES PLUMBING*

AI-INTEGRATED SERVICES
Lic. C-36 #1156542 | San Jose, CA
Tel: (669) 213-4422
Email: moralesplumbing026@gmail.com
Web: www.morales-plumbing.com

*Tarjeta Digital Interactiva:*
Click aqui para abrir la tarjeta digital
https://agem2024.github.io/morales-plumbing-web/tarjeta_presentacion.html

Morales Plumbing | Un Plomero En Tu Bolsillo`;
    }

    if (msgLower === 'm1' || msgLower === '/m1' || msgLower === 'sandhu' || msgLower === 'vistapark') {
        return `*PROPUESTA OFICIAL - MORALES PLUMBING*
AI-INTEGRATED SERVICES
Lic. C-36 #1156542 | San Jose, CA
Tel: (669) 213-4422 | Web: www.morales-plumbing.com

*DETALLES DE LA PROPUESTA:*
• Cliente: Manjinder S. Sandhu - Gurmeet K. Sandhu
• Ubicacion: 4423 Vistapark Dr, San Jose, CA 95136
• Referencia: MP-PROP-4423V-SANDHU
• Total Estimado: $19,671.18 USD

*INSTRUCCIONES PARA EL CLIENTE:*
1. Abra el enlace para acceder a su propuesta digital.
2. Firme el Acuso de Recibo para desbloquear los precios y detalles.
3. Revise la cotizacion y firme al final si autoriza los trabajos.

*Acceda y firme digitalmente su propuesta aqui:*
https://agem2024.github.io/SEGURITI-USC/proposals/sandhu-4423/propuesta_cotizacion_4423_vistapark.html`;
    }

    if (msgLower === 'propuesta' || msgLower === 'propuesta chris' || msgLower === 'quote' || msgLower === 'cotizacion') {
        return `🔧 *Propuesta Profesional de Plomería*

📍 611 S Henry Ave, San Jose CA 95117
💰 Estimado completo con trabajos detallados
🔗 https://agem2024.github.io/ORION-info-public/propuesta_chris.html`;
    }

    if (msgLower === 'skills' || msgLower === 'habilidades') {
        return `💻 *HABILIDADES TÉCNICAS*

⚡ *AI & DEV:*
🔹 Multi-Agent Systems (Orion)
🔹 Generative AI (Gemini, GPT-4)
🔹 Node.js, Python, WhatsApp Automation

🏗️ *INGENIERÍA:*
🔹 Diseño Hidráulico & Sanitario
🔹 Estimación de Costos & Presupuestos
🔹 Auditoría ISO 14001

📈 *MANAGEMENT:*
🔹 Liderazgo de Equipos
🔹 Gestión de Proyectos Complejos
🔹 Consultoría Estratégica`;
    }

    if (msgLower === 'landing' || msgLower === 'hub') {
        return `🌐 *NEON AGENT HUB*
Acceso global a tus agentes:
🔗 https://neon-agent-hub.web.app/`;
    }

    if (msgLower === 'apps' || msgLower === 'aplicaciones') {
        return `📱 *ORION AI APPS SUITE*

1️⃣ *AdVortex AI* (Video Marketing)
2️⃣ *EP Estimator* (Plomería Expert)
3️⃣ *MP PRO* (Estimación de Costos)
4️⃣ *Business Suite* (Gestión)
5️⃣ *Neon Hub* (Agentes)
6️⃣ *Sofia Lin AI* (Experiments)

🔗 *Acceder al Hub:* https://neon-agent-hub.web.app/`;
    }

    if (msgLower === 'list' || msgLower === 'lista' || msgLower === 'comandos') {
        return getCVMenu().replace('http://localhost:3030/landing.html', 'https://neon-agent-hub.web.app/');
    }

    return null;
}

module.exports = {
    handleProfessionalCommand
};
