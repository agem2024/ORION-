/**
 * MARIO - AI Sales Assistant for ORION Tech Proposals
 * Bilingual (EN/ES) | Male Voice | Gemini AI Powered
 * "Es ahora o nunca" / "It's now or never"
 */

class MarioAssistant {
    constructor(config) {
        this.clientName = config.clientName || 'Client';
        this.clientPhone = config.clientPhone || '(669) 234-2444';
        this.language = config.language || 'en';
        this.ownerName = config.ownerName || '';
        this.managerName = config.managerName || '';
        this.proposalContext = config.proposalContext || '';
        this.competitorAdvantages = config.competitorAdvantages || [];
        this.pricingTiers = config.pricingTiers || [];
        this.painPoints = config.painPoints || [];

        // Secure API configuration (proxied)
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.isOpen = false;
        this.messages = [];
        this.synth = window.speechSynthesis;
        this.selectedVoice = null;

        // System prompt for sales-focused AI
        this.systemPrompt = this._buildSystemPrompt();

        this._init();
    }

    _buildSystemPrompt() {
        const slogan = this.language === 'es'
            ? '🚀 ES AHORA O NUNCA - La competencia ya está usando AI'
            : '🚀 IT\'S NOW OR NEVER - Your competitors are already using AI';

        const roleDescription = this.language === 'es'
            ? `Eres MARIO, consultor experto en tecnología para empresas de plomería. Tienes 15 años de experiencia en el sector de servicios residenciales y conoces todos los dolores de cabeza del negocio: llamadas perdidas, técnicos mal preparados, clientes que se quejan de precios, callbacks innecesarios. Tu misión es mostrar a ${this.clientName} cómo ORION Tech resuelve estos problemas ESPECÍFICOS.`
            : `You are MARIO, a technology consultant specialized in plumbing businesses. You have 15 years of experience in residential service industry and understand all the headaches: missed calls, unprepared technicians, price complaints, unnecessary callbacks. Your mission is to show ${this.clientName} how ORION Tech solves these SPECIFIC problems.`;

        const plumbingExpertise = this.language === 'es'
            ? `
CONOCIMIENTO DEL SECTOR PLOMERÍA:
- Entiendes la diferencia entre un drain cleaning y un sewer line replacement
- Sabes que un water heater install tiene más margen que una faucet repair
- Conoces los problemas de dispatch: técnico de gas enviado a trabajo de drenaje
- Entiendes que un callback cuesta $200-400 en labor y destruye la reputación
- Sabes que una llamada perdida = $300-1,500 en trabajo perdido
- Conoces la frustración de los "no-shows" y las ventanas de 4 horas

TÉRMINOS QUE DEBES USAR:
- "Service call" no "visita"
- "Dispatch" no "enviar técnicos"
- "Ticket promedio" o "average ticket"
- "Callbacks" para visitas repetidas
- "First-time fix rate" para tasa de resolución
- "Tech utilization" para eficiencia de técnicos
`
            : `
PLUMBING INDUSTRY EXPERTISE:
- You understand the difference between drain cleaning and sewer line replacement
- You know water heater installs have higher margins than faucet repairs
- You understand dispatch issues: gas tech sent to a drain job
- You know a callback costs $200-400 in labor and destroys reputation
- You know a missed call = $300-1,500 in lost revenue
- You understand the frustration of no-shows and 4-hour windows

TERMINOLOGY TO USE:
- "Service call" not "appointment"
- "Dispatch" not "send technicians"
- "Average ticket" for job value
- "Callbacks" for repeat visits
- "First-time fix rate"
- "Tech utilization" for efficiency
`;

        const howOrionWorks = this.language === 'es'
            ? `
CÓMO FUNCIONA ORION (RESPUESTAS ESPECÍFICAS):

1. "¿CÓMO ME AYUDA A AHORRAR DINERO?"
   → "Mira, cada callback te cuesta mínimo $200 en labor. Si tu first-time fix rate es 70%, estás perdiendo 30% de tus trabajos en callbacks. ORION usa AI para diagnosticar ANTES de que el técnico salga. El cliente describe el problema, el AI analiza, y el técnico llega con las piezas correctas. Resultado: 95%+ first-time fix rate. A 10 trabajos por día, eso son $600/día que ya no pierdes."

2. "¿CÓMO FUNCIONAN LOS DISPATCHERS AI?"
   → "Imagina un dispatcher que NUNCA se equivoca. El AI conoce las habilidades de cada técnico: quién es bueno en gas, quién en sewer, quién en remodels. Cuando entra una llamada, el AI asigna al técnico correcto, no solo al más cercano. También optimiza las rutas - un técnico que hacía 5 trabajos ahora hace 6-7 porque no pierde tiempo cruzando la ciudad."

3. "¿CÓMO ES EL PROCESO DE IMPLEMENTACIÓN?"
   → "Son 30 días, tres fases: Semana 1-2: Configuramos el AI Call Center con tu script, precios y FAQs. Semana 2-3: Entrenamos el dispatch AI con tu fleet y zonas. Semana 3-4: Testing en paralelo, tu equipo actual sigue operando mientras validamos. Día 31: Encendemos todo. No hay downtime, no hay riesgo."

4. "¿Y SI EL AI SE EQUIVOCA?"
   → "El AI aprende de cada interacción. Si algo no funciona, lo ajustamos en 24 horas. Además, siempre puedes tener override humano - un manager puede intervenir en cualquier momento. Pero te digo, después de 30 días, tus CSRs van a pedir vacaciones porque el AI maneja el 80% de las llamadas."

5. "¿QUÉ PASA CON MIS EMPLEADOS ACTUALES?"
   → "No reemplazamos a nadie. Los liberamos. Tu recepcionista que pasa 6 horas contestando llamadas ahora puede hacer follow-ups de ventas, cobros pendientes, o marketing. El AI hace el trabajo repetitivo, tu gente hace el trabajo que genera más dinero."
`
            : `
HOW ORION WORKS (SPECIFIC ANSWERS):

1. "HOW DOES THIS HELP ME SAVE MONEY?"
   → "Look, every callback costs you at least $200 in labor. If your first-time fix rate is 70%, you're losing 30% of jobs to callbacks. ORION uses AI to diagnose BEFORE the tech rolls. Customer describes the issue, AI analyzes, tech arrives with right parts. Result: 95%+ first-time fix rate. At 10 jobs per day, that's $600/day you're no longer losing."

2. "HOW DO THE AI DISPATCHERS WORK?"
   → "Imagine a dispatcher who NEVER makes mistakes. The AI knows each tech's skills: who's good at gas, who's expert in sewer, who handles remodels. When a call comes in, AI assigns the RIGHT tech, not just the closest. It also optimizes routes - a tech doing 5 jobs now does 6-7 because they're not driving across town."

3. "WHAT'S THE IMPLEMENTATION PROCESS?"
   → "30 days, three phases: Week 1-2: We configure AI Call Center with your script, pricing, FAQs. Week 2-3: We train dispatch AI with your fleet and zones. Week 3-4: Parallel testing, your current team keeps running while we validate. Day 31: We go live. Zero downtime, zero risk."

4. "WHAT IF THE AI MAKES MISTAKES?"
   → "The AI learns from every interaction. If something's off, we adjust within 24 hours. Plus, you always have human override - a manager can step in anytime. But I'll tell you, after 30 days, your CSRs will ask for vacation because the AI handles 80% of calls."

5. "WHAT HAPPENS TO MY CURRENT EMPLOYEES?"
   → "We don't replace anyone. We free them up. Your receptionist spending 6 hours answering calls can now do sales follow-ups, collections, or marketing. AI handles repetitive work, your people do work that generates more money."
`;

        const investmentValue = this.language === 'es'
            ? `
VALOR DE INVERSIÓN (USA ESTOS NÚMEROS):
- Setup: $5K-$25K = Lo que pagas en 1-2 meses de salario de recepcionista
- Mensual: $1,500-$8,500 = Menos que el costo de 1 empleado con beneficios
- Ahorro real: Callbacks reducidos = $3,000-6,000/mes
- Ahorro real: Más trabajos por técnico = $4,000-8,000/mes  
- Ahorro real: Llamadas perdidas recuperadas = $5,000-12,000/mes
- Total ahorro proyectado: $12K-26K/mes dependiendo del tamaño
- ROI: 60-90 días, después es ganancia pura
`
            : `
INVESTMENT VALUE (USE THESE NUMBERS):
- Setup: $5K-$25K = What you pay in 1-2 months receptionist salary
- Monthly: $1,500-$8,500 = Less than 1 employee with benefits
- Real savings: Reduced callbacks = $3,000-6,000/mo
- Real savings: More jobs per tech = $4,000-8,000/mo
- Real savings: Recovered missed calls = $5,000-12,000/mo
- Total projected savings: $12K-26K/mo depending on size
- ROI: 60-90 days, then it's pure profit
`;

        return `${slogan}

${roleDescription}

${plumbingExpertise}

CLIENTE: ${this.clientName}
TELÉFONO: ${this.clientPhone}
DUEÑO/MANAGER: ${this.ownerName || this.managerName || 'Decision Maker'}

${howOrionWorks}

${investmentValue}

PAIN POINTS ESPECÍFICOS DE ${this.clientName.toUpperCase()}:
${this.painPoints.map(p => `- ${p}`).join('\n')}

SOLUCIONES ORION PARA ESTE CLIENTE:
${(this.competitorAdvantages || []).map(a => `- ${a}`).join('\n')}

REGLAS DE COMUNICACIÓN:
1. Habla como un colega de la industria, no como un vendedor de software
2. Usa terminología de plomería naturalmente
3. Da ejemplos específicos con números reales
4. Si no sabes algo, di "Déjame verificar con el equipo técnico"
5. Siempre conecta la solución con DINERO ahorrado o ganado
6. Termina con una pregunta que avance la conversación

CONTEXTO ADICIONAL DE LA PROPUESTA:
${this.proposalContext}

Responde de manera conversacional, como si estuvieras tomando un café con el dueño del negocio.`;
    }

    _init() {
        // Find appropriate male voice
        this._loadVoices();
        this.synth.onvoiceschanged = () => this._loadVoices();

        // Create UI elements
        this._createChatUI();

        // Add welcome message (matches the spoken greeting)
        setTimeout(() => {
            const targetName = this.ownerName || this.managerName || '';
            const topPrice = this.pricingTiers?.[this.pricingTiers.length - 1]?.monthly || 4500;
            const estimatedSavings = Math.round(topPrice * 5 / 1000) * 1000;
            const savingsFormatted = (estimatedSavings / 1000).toFixed(0);

            const welcome = this.language === 'es'
                ? `${targetName ? '¡Hola ' + targetName + '! ' : '¡Hola! '}Soy MARIO de ORION Tech. 🤖 Tengo una propuesta que puede ahorrarle a ${this.clientName} más de ${savingsFormatted} mil dólares al mes. ¿Me permite mostrarle cómo?`
                : `${targetName ? 'Hello ' + targetName + '! ' : 'Hello! '}I'm MARIO from ORION Tech. 🤖 I have a proposal that could save ${this.clientName} over $${estimatedSavings.toLocaleString()} per month. May I show you how?`;
            this._addMessage('mario', welcome);
        }, 500);
    }

    _loadVoices() {
        const voices = this.synth.getVoices();
        const isSpanish = this.language === 'es';

        // Preferred voices by language - prioritize quality voices
        const spanishVoices = [
            'Microsoft Raul',       // Windows Spanish male - BEST
            'Google español',       // Chrome Spanish
            'Paulina',              // macOS Spanish
            'Jorge',                // macOS Spanish male
            'Diego',                // Windows Spanish
            'Pablo',                // Various Spanish
            'es-US',                // Any US Spanish
            'es-ES',                // Any Spain Spanish
            'es-MX'                 // Any Mexico Spanish
        ];

        const englishVoices = [
            'Microsoft David',      // Windows English male - BEST
            'Google US English Male',
            'Alex',                 // macOS English male
            'Daniel',               // macOS British
            'en-US',                // Any US English
            'en-GB'                 // Any British English
        ];

        const preferredVoices = isSpanish ? spanishVoices : englishVoices;

        // Try to find a preferred voice
        for (const preferred of preferredVoices) {
            const found = voices.find(v =>
                v.name.includes(preferred) || v.lang.includes(preferred)
            );
            if (found) {
                this.selectedVoice = found;
                console.log('🎤 MARIO voice:', found.name, found.lang);
                break;
            }
        }

        // Fallback: any voice matching language
        if (!this.selectedVoice) {
            const langCode = isSpanish ? 'es' : 'en';
            this.selectedVoice = voices.find(v => v.lang.startsWith(langCode)) || voices[0];
            console.log('🎤 MARIO fallback voice:', this.selectedVoice?.name);
        }
    }

    _createChatUI() {
        // Create chat container
        const container = document.createElement('div');
        container.id = 'mario-chat-container';
        container.innerHTML = `
            <style>
                #mario-chat-container {
                    position: fixed;
                    bottom: 100px;
                    left: 20px;
                    z-index: 10000;
                    font-family: 'Segoe UI', sans-serif;
                }
                
                #mario-toggle {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #00d4aa, #00a8ff);
                    border: 3px solid #00d4aa;
                    cursor: pointer;
                    box-shadow: 0 0 20px rgba(0, 212, 170, 0.6), 0 0 40px rgba(0, 212, 170, 0.4), 0 0 60px rgba(0, 168, 255, 0.3);
                    transition: transform 0.3s, box-shadow 0.3s;
                    overflow: hidden;
                    padding: 5px;
                    animation: neonFlash 2s ease-in-out infinite;
                }
                
                @keyframes neonFlash {
                    0%, 100% { 
                        box-shadow: 0 0 20px rgba(0, 212, 170, 0.6), 0 0 40px rgba(0, 212, 170, 0.4), 0 0 60px rgba(0, 168, 255, 0.3);
                        border-color: #00d4aa;
                    }
                    50% { 
                        box-shadow: 0 0 30px rgba(0, 212, 170, 1), 0 0 60px rgba(0, 212, 170, 0.8), 0 0 100px rgba(0, 168, 255, 0.6), 0 0 150px rgba(0, 168, 255, 0.3);
                        border-color: #00a8ff;
                    }
                }
                
                #mario-toggle:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 40px rgba(0, 212, 170, 1), 0 0 80px rgba(0, 168, 255, 0.8);
                    animation: none;
                }
                
                #mario-toggle img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }
                
                #mario-chat-window {
                    display: none;
                    width: 380px;
                    height: 500px;
                    background: linear-gradient(180deg, #0a0a12 0%, #050508 100%);
                    border: 1px solid rgba(0, 212, 170, 0.3);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    flex-direction: column;
                    position: absolute;
                    bottom: 80px;
                    left: 0;
                }
                
                #mario-chat-window.open {
                    display: flex;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                #mario-header {
                    background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 168, 255, 0.2));
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(0, 212, 170, 0.2);
                }
                
                #mario-header img {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    border: 2px solid #00d4aa;
                }
                
                #mario-header-info h3 {
                    color: #fff;
                    margin: 0;
                    font-size: 1.1rem;
                }
                
                #mario-header-info span {
                    color: #00d4aa;
                    font-size: 0.8rem;
                }
                
                #mario-close {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                
                #mario-close:hover { color: #fff; }
                
                #mario-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .mario-message {
                    max-width: 85%;
                    padding: 12px 16px;
                    border-radius: 16px;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                
                .mario-message.mario {
                    background: linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(0, 168, 255, 0.15));
                    border: 1px solid rgba(0, 212, 170, 0.3);
                    color: #fff;
                    align-self: flex-start;
                    border-bottom-left-radius: 4px;
                }
                
                .mario-message.user {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    align-self: flex-end;
                    border-bottom-right-radius: 4px;
                }
                
                #mario-input-area {
                    padding: 15px;
                    border-top: 1px solid rgba(0, 212, 170, 0.2);
                    display: flex;
                    gap: 10px;
                }
                
                #mario-input {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(0, 212, 170, 0.3);
                    border-radius: 25px;
                    padding: 12px 20px;
                    color: #fff;
                    font-size: 0.9rem;
                    outline: none;
                }
                
                #mario-input:focus {
                    border-color: #00d4aa;
                }
                
                #mario-input::placeholder {
                    color: #666;
                }
                
                #mario-send {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #00d4aa, #00a8ff);
                    border: none;
                    color: #fff;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                #mario-send:hover {
                    transform: scale(1.1);
                }
                
                #mario-voice-btn {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(0, 212, 170, 0.3);
                    color: #00d4aa;
                    cursor: pointer;
                    font-size: 1rem;
                }
                
                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                    background: rgba(0, 212, 170, 0.1);
                    border-radius: 16px;
                    align-self: flex-start;
                }
                
                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: #00d4aa;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }
                
                .typing-indicator span:nth-child(1) { animation-delay: 0s; }
                .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
                .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                
                @media (max-width: 480px) {
                    #mario-chat-window {
                        width: calc(100vw - 40px);
                        height: 60vh;
                        left: -10px;
                    }
                }
            </style>
            
            <div id="mario-chat-window">
                <div id="mario-header">
                    <img src="../mario_icon.png" alt="MARIO" id="mario-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%2300d4aa\'/%3E%3Ctext x=\'50\' y=\'65\' text-anchor=\'middle\' font-size=\'40\' fill=\'white\'%3E🔧%3C/text%3E%3C/svg%3E'">
                    <div id="mario-header-info">
                        <h3>MARIO</h3>
                        <span>AI Sales Assistant • ORION Tech</span>
                    </div>
                    <button id="mario-close">×</button>
                </div>
                <div id="mario-messages"></div>
                <div id="mario-input-area">
                    <button id="mario-voice-btn" title="Voice">🎤</button>
                    <input type="text" id="mario-input" placeholder="Ask MARIO anything...">
                    <button id="mario-send">➤</button>
                </div>
            </div>
            
            <button id="mario-toggle">
                <img src="../mario_icon.png" alt="Chat with MARIO" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%2300d4aa\'/%3E%3Ctext x=\'50\' y=\'65\' text-anchor=\'middle\' font-size=\'40\' fill=\'white\'%3E🔧%3C/text%3E%3C/svg%3E'">
            </button>
        `;

        document.body.appendChild(container);

        // Event listeners
        document.getElementById('mario-toggle').addEventListener('click', () => this._toggleChat());
        document.getElementById('mario-close').addEventListener('click', () => this._toggleChat());
        document.getElementById('mario-send').addEventListener('click', () => this._sendMessage());
        document.getElementById('mario-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._sendMessage();
        });
        document.getElementById('mario-voice-btn').addEventListener('click', () => this._toggleVoice());
    }

    _toggleChat() {
        const chatWindow = document.getElementById('mario-chat-window');
        this.isOpen = !this.isOpen;
        chatWindow.classList.toggle('open', this.isOpen);

        // Greet with voice when opening
        if (this.isOpen && !this.hasGreeted) {
            this.hasGreeted = true;
            this.voiceEnabled = true;
            document.getElementById('mario-voice-btn').style.background = 'linear-gradient(135deg, #00d4aa, #00a8ff)';
            document.getElementById('mario-voice-btn').textContent = '🔊';

            // Speak the welcome message that was already displayed
            setTimeout(() => {
                const targetName = this.ownerName || this.managerName || '';
                const topPrice = this.pricingTiers?.[this.pricingTiers.length - 1]?.monthly || 4500;
                const estimatedSavings = Math.round(topPrice * 5 / 1000) * 1000;
                const savingsFormatted = (estimatedSavings / 1000).toFixed(0);

                // Same message as written, but spoken naturally
                const greeting = this.language === 'es'
                    ? `${targetName ? targetName + ', ' : ''}soy MARIO de ORION Tech. Tengo una propuesta que puede ahorrarle a ${this.clientName} más de ${savingsFormatted} mil dólares al mes. ¿Me permite mostrarle cómo?`
                    : `${targetName ? targetName + ', ' : ''}I'm MARIO from ORION Tech. I have a proposal that could save ${this.clientName} over $${estimatedSavings.toLocaleString()} per month. May I show you how?`;
                this._speak(greeting);
            }, 300);
        }
    }

    _addMessage(sender, text) {
        const messagesContainer = document.getElementById('mario-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `mario-message ${sender}`;
        messageEl.textContent = text;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Speak if it's MARIO's message
        if (sender === 'mario' && this.voiceEnabled) {
            this._speak(text);
        }

        this.messages.push({ role: sender === 'mario' ? 'model' : 'user', parts: [{ text }] });
    }

    _showTyping() {
        const messagesContainer = document.getElementById('mario-messages');
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'mario-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    _hideTyping() {
        const typing = document.getElementById('mario-typing');
        if (typing) typing.remove();
    }

    async _sendMessage() {
        const input = document.getElementById('mario-input');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        this._addMessage('user', text);
        this._showTyping();

        try {
            const response = await this._callGemini(text);
            this._hideTyping();
            this._addMessage('mario', response);
        } catch (error) {
            this._hideTyping();
            const errorMsg = this.language === 'es'
                ? 'Disculpa, hubo un problema. ¿Puedes repetir tu pregunta?'
                : 'Sorry, there was an issue. Can you repeat your question?';
            this._addMessage('mario', errorMsg);
            console.error('MARIO Error:', error);
        }
    }

    async _callGemini(userMessage) {
        // Get API key from secure source (localStorage or backend)
        const apiKey = this._getSecureApiKey();

        if (!apiKey) {
            console.warn('⚠️ MARIO: No API key found, using fallback responses');
            return this._getFallbackResponse(userMessage);
        }

        try {
            const requestBody = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: this.systemPrompt }]
                    },
                    ...this.messages.slice(-10),
                    {
                        role: 'user',
                        parts: [{ text: userMessage }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 400,
                    topP: 0.9
                }
            };

            console.log('🤖 MARIO calling Gemini API...');

            const response = await fetch(`${this.apiEndpoint}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                console.error('MARIO API Error:', response.status, response.statusText);
                return this._getFallbackResponse(userMessage);
            }

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiResponse) {
                console.error('MARIO: Empty response from API');
                return this._getFallbackResponse(userMessage);
            }

            return aiResponse;

        } catch (error) {
            console.error('MARIO API Exception:', error);
            return this._getFallbackResponse(userMessage);
        }
    }

    _getFallbackResponse(userMessage) {
        const msg = userMessage.toLowerCase();
        const isSpanish = this.language === 'es';
        const name = this.clientName;

        // Get company-specific data
        const basePrice = this.pricingTiers?.[0]?.monthly || 1500;
        const topPrice = this.pricingTiers?.[this.pricingTiers.length - 1]?.monthly || 4500;
        const mainPainPoint = this.painPoints?.[0] || 'operational inefficiency';
        const mainAdvantage = this.competitorAdvantages?.[0] || 'AI-powered automation';

        // Calculate estimated savings based on pricing tier (higher tier = bigger company = more savings)
        const estimatedSavings = topPrice * 5; // ~5x the monthly fee in savings

        // Keyword-based intelligent responses
        if (msg.includes('precio') || msg.includes('cost') || msg.includes('cuanto') || msg.includes('how much')) {
            return isSpanish
                ? `${name} puede comenzar desde $${basePrice.toLocaleString()}/mes con nuestro paquete inicial. Pero lo importante es el ROI: estimamos un ahorro de $${estimatedSavings.toLocaleString()}+ al mes para ${name}. El retorno de inversión típico es de 60-90 días. ¿Le gustaría ver el desglose específico?`
                : `${name} can start from $${basePrice.toLocaleString()}/month with our entry package. But what matters is ROI: we estimate $${estimatedSavings.toLocaleString()}+ monthly savings for ${name}. Typical ROI is 60-90 days. Would you like to see the specific breakdown?`;
        }

        if (msg.includes('ahorro') || msg.includes('save') || msg.includes('roi') || msg.includes('dinero') || msg.includes('money') || msg.includes('desglose') || msg.includes('breakdown') || msg.includes('calculo') || msg.includes('justif')) {
            // Detailed ROI breakdown with specific calculations
            const callbackSavings = Math.round(topPrice * 1.5);
            const timeSavings = Math.round(topPrice * 1.2);
            const moreJobs = Math.round(topPrice * 1.3);
            const complaintsAvoided = Math.round(topPrice * 1);

            // Get company-specific pain points for personalization
            const pain1 = this.painPoints?.[0]?.split(' - ')[0] || 'Callbacks';
            const pain2 = this.painPoints?.[1]?.split(' - ')[0] || 'Time waste';
            const pain3 = this.painPoints?.[2]?.split(' - ')[0] || 'Scheduling';
            const pain4 = this.painPoints?.[3]?.split(' - ')[0] || 'Customer complaints';

            const solution1 = this.competitorAdvantages?.[0]?.split(' - ')[0] || 'AI Diagnosis';
            const solution2 = this.competitorAdvantages?.[1]?.split(' - ')[0] || 'AI Dispatch';

            return isSpanish
                ? `Aquí está el desglose del ahorro para ${name}:

📞 **Solución a "${pain1}":** $${callbackSavings.toLocaleString()}/mes
   - ${solution1}
   - Cada problema evitado ahorra $200-400 en labor

⏱️ **Solución a "${pain2}":** $${timeSavings.toLocaleString()}/mes  
   - ${solution2}
   - Estimamos 30-45 min ahorrados por trabajo

📈 **Más Trabajos por Día:** $${moreJobs.toLocaleString()}/mes
   - Rutas optimizadas = 1-2 trabajos extra por día
   - A $300/trabajo promedio = ingresos adicionales

🚫 **Solución a "${pain4}":** $${complaintsAvoided.toLocaleString()}/mes
   - Menos conflictos = más referencias positivas
   - Cada queja evitada = $500+ en reputación

**TOTAL PARA ${name.toUpperCase()}: $${estimatedSavings.toLocaleString()}+/mes**
**INVERSIÓN: $${basePrice.toLocaleString()}-$${topPrice.toLocaleString()}/mes**
**ROI: ${Math.round(estimatedSavings / topPrice * 100)}%+**

¿Tiene sentido? ¿Quiere agendar una demo?`
                : `Here's the savings breakdown for ${name}:

📞 **Solving "${pain1}":** $${callbackSavings.toLocaleString()}/mo
   - ${solution1}
   - Each avoided issue saves $200-400 in labor

⏱️ **Solving "${pain2}":** $${timeSavings.toLocaleString()}/mo
   - ${solution2}
   - We estimate 30-45 min saved per job

📈 **More Jobs Per Day:** $${moreJobs.toLocaleString()}/mo
   - Optimized routes = 1-2 extra jobs per day
   - At $300/job average = additional revenue

🚫 **Solving "${pain4}":** $${complaintsAvoided.toLocaleString()}/mo
   - Fewer conflicts = more positive referrals
   - Each avoided complaint = $500+ in reputation

**TOTAL FOR ${name.toUpperCase()}: $${estimatedSavings.toLocaleString()}+/month**
**INVESTMENT: $${basePrice.toLocaleString()}-$${topPrice.toLocaleString()}/month**
**ROI: ${Math.round(estimatedSavings / topPrice * 100)}%+**

Does this make sense? Want to schedule a demo?`;
        }

        if (msg.includes('como funciona') || msg.includes('how does') || msg.includes('explicar') || msg.includes('explain')) {
            return isSpanish
                ? `Te lo explico simple: Cuando un cliente llama, el AI Call Center responde en menos de 3 segundos. Le hace las preguntas correctas - "¿Tiene agua en el piso?", "¿Es un drain o un sewer?", "¿Cuándo empezó?" El AI diagnostica y agenda al técnico correcto. El técnico llega sabiendo qué herramientas necesita. Sin callbacks, sin sorpresas. ¿Sobre qué parte te gustaría más detalle?`
                : `Let me break it down: When a customer calls, the AI Call Center answers in under 3 seconds. It asks the right questions - "Is there water on the floor?", "Is it a drain or sewer?", "When did this start?" The AI diagnoses and dispatches the right tech. The tech arrives knowing what tools are needed. No callbacks, no surprises. Which part would you like more detail on?`;
        }

        // NEW: Dispatcher specific question
        if (msg.includes('dispatch') || msg.includes('despacho') || msg.includes('asigna') || msg.includes('tecnico') || msg.includes('technician')) {
            return isSpanish
                ? `Los AI Dispatchers son la clave del sistema. Mira, tu dispatcher humano conoce a 5-10 técnicos. Nuestro AI conoce las fortalezas de CADA técnico: quién es rápido en water heaters, quién nunca falla en sewer, quién maneja bien a clientes difíciles. Cuando entra un service call, el AI no solo busca al más cercano - busca al MEJOR para ese trabajo específico. También optimiza rutas, así que un técnico que hacía 5 trabajos ahora hace 6-7. Más trabajos = más revenue. ¿Cuántos técnicos tienen ustedes?`
                : `The AI Dispatchers are the key to the system. Look, your human dispatcher knows 5-10 techs. Our AI knows the strengths of EVERY technician: who's fast with water heaters, who never misses on sewer, who handles difficult customers well. When a service call comes in, AI doesn't just look for the closest - it finds the BEST fit for that specific job. It also optimizes routes, so a tech doing 5 jobs now does 6-7. More jobs = more revenue. How many techs do you guys have?`;
        }

        // NEW: Implementation process question
        if (msg.includes('implement') || msg.includes('proceso') || msg.includes('empezar') || msg.includes('start') || msg.includes('onboard') || msg.includes('cuanto tiempo') || msg.includes('how long')) {
            return isSpanish
                ? `El proceso son 30 días, y no hay downtime:

**Semana 1-2:** Configuramos el AI Call Center con tu script, tus precios, tus FAQs. Grabamos cómo contestas las llamadas y lo replicamos.

**Semana 2-3:** Entrenamos el dispatch AI con tu fleet - cada técnico, sus skills, sus zonas preferidas. 

**Semana 3-4:** Testing en paralelo. Tu equipo sigue operando normal, pero el AI está aprendiendo de cada llamada.

**Día 31:** Go live. El AI toma el control del 80% de las llamadas. Tu equipo solo interviene en casos complejos.

¿Tienen un sistema de dispatch actualmente o es manual?`
                : `The process is 30 days, and there's zero downtime:

**Week 1-2:** We configure the AI Call Center with your script, your pricing, your FAQs. We record how you answer calls and replicate it.

**Week 2-3:** We train the dispatch AI with your fleet - each tech, their skills, their preferred zones.

**Week 3-4:** Parallel testing. Your team keeps operating normally, but the AI is learning from every call.

**Day 31:** Go live. The AI handles 80% of calls. Your team only steps in for complex cases.

Do you currently have a dispatch system or is it manual?`;
        }

        // NEW: Question about AI errors
        if (msg.includes('error') || msg.includes('equivoca') || msg.includes('mistake') || msg.includes('falla') || msg.includes('fail') || msg.includes('wrong')) {
            return isSpanish
                ? `Buena pregunta. El AI no es perfecto el día 1 - pero aprende rápido. Cada llamada, cada job, cada feedback mejora el sistema. Si el AI manda al técnico incorrecto, lo marcamos y ajustamos en 24 horas. 

Además, siempre tienes "override humano" - cualquier manager puede tomar control en cualquier momento. El AI te avisa cuando no está seguro: "Este trabajo necesita revisión humana."

Después de 30 días, la tasa de error es menor al 5%. Compara eso con el dispatch humano que comete errores por cansancio, distracción, o simplemente por no conocer a todos los técnicos igual. ¿Qué tipo de errores ves más frecuentemente en tu operación actual?`
                : `Great question. The AI isn't perfect on day 1 - but it learns fast. Every call, every job, every feedback improves the system. If the AI sends the wrong tech, we flag it and adjust within 24 hours.

Plus, you always have "human override" - any manager can take control anytime. The AI alerts you when it's unsure: "This job needs human review."

After 30 days, error rate is under 5%. Compare that to human dispatch that makes mistakes from fatigue, distraction, or simply not knowing all techs equally well. What type of errors do you see most often in your current operation?`;
        }

        // NEW: Question about employees
        if (msg.includes('empleado') || msg.includes('employee') || msg.includes('recepcion') || msg.includes('staff') || msg.includes('gente') || msg.includes('people') || msg.includes('despedir') || msg.includes('fire')) {
            return isSpanish
                ? `Te voy a ser honesto: no reemplazamos a nadie. Liberamos a tu gente para trabajo de mayor valor.

Tu recepcionista que pasa 6 horas contestando "¿a qué hora llega el técnico?" ahora puede hacer:
- Follow-ups de ventas a clientes anteriores
- Cobros de facturas pendientes  
- Posteos en redes sociales
- Programar reviews de Google

Tu gente sigue cobrando lo mismo, pero genera 3x más valor. El AI hace el trabajo repetitivo - tu equipo hace el trabajo que CRECE el negocio.

¿Cuántas personas tienes en la oficina actualmente?`
                : `I'll be honest with you: we don't replace anyone. We free your people up for higher-value work.

Your receptionist spending 6 hours answering "what time does the tech arrive?" can now do:
- Sales follow-ups to past customers
- Collections on pending invoices
- Social media posts
- Schedule Google reviews

Your people keep their same pay, but generate 3x more value. AI handles repetitive work - your team does work that GROWS the business.

How many people do you currently have in the office?`;
        }

        if (msg.includes('si') || msg.includes('yes') || msg.includes('claro') || msg.includes('sure') || msg.includes('adelante') || msg.includes('ok') || msg.includes('bueno')) {
            const ownerRef = this.ownerName ? (isSpanish ? `${this.ownerName}, ` : `${this.ownerName}, `) : '';
            return isSpanish
                ? `${ownerRef}perfecto. Mira, el pain principal que veo en ${name} es: ${mainPainPoint}. 

Con ORION, esto se ataca directo con: ${mainAdvantage}.

El resultado conservador es un ahorro de $${estimatedSavings.toLocaleString()}/mes - y eso sin contar el revenue extra por más trabajos completados.

La inversión va desde $${basePrice.toLocaleString()} hasta $${topPrice.toLocaleString()}/mes dependiendo del volumen. 

¿Qué te parece si agendamos 30 minutos esta semana para mostrarte el sistema en vivo?`
                : `${ownerRef}perfect. Look, the main pain I see at ${name} is: ${mainPainPoint}.

With ORION, we attack this directly with: ${mainAdvantage}.

Conservative result is $${estimatedSavings.toLocaleString()}/month in savings - and that's not counting extra revenue from more completed jobs.

Investment ranges from $${basePrice.toLocaleString()} to $${topPrice.toLocaleString()}/month depending on volume.

How about we schedule 30 minutes this week to show you the system live?`;
        }

        if (msg.includes('competencia') || msg.includes('competitor') || msg.includes('otros') || msg.includes('different') || msg.includes('servic') || msg.includes('hausecall') || msg.includes('jobber')) {
            return isSpanish
                ? `La diferencia es simple: nosotros entendemos plomería. ServiceTitan, Housecall Pro, Jobber - son software genérico que sirve para cualquier servicio. Nosotros sabemos que un sewer line replacement es diferente a un faucet repair.

Para ${name}, la diferencia específica es: ${mainPainPoint}. Ellos no resuelven eso porque no entienden el problema.

Nosotros lo atacamos con: ${this.competitorAdvantages?.slice(0, 2).join(' + ') || mainAdvantage}.

¿Qué software están usando actualmente?`
                : `The difference is simple: we understand plumbing. ServiceTitan, Housecall Pro, Jobber - they're generic software that works for any service. We know a sewer line replacement is different from a faucet repair.

For ${name}, the specific difference is: ${mainPainPoint}. They don't solve that because they don't understand the problem.

We attack it with: ${this.competitorAdvantages?.slice(0, 2).join(' + ') || mainAdvantage}.

What software are you currently using?`;
        }

        // Default response - more natural and conversational
        const ownerRef = this.ownerName ? (isSpanish ? `${this.ownerName}, ` : `${this.ownerName}, `) : '';
        return isSpanish
            ? `${ownerRef}buena pregunta. Mira, lo que hacemos en ORION es simple: eliminamos los problemas que drenan dinero de negocios como ${name}. 

Tu problema principal que veo es: ${mainPainPoint}.

Nosotros lo resolvemos con AI que trabaja 24/7, nunca se cansa, nunca tiene mal día. 

La inversión empieza en $${basePrice.toLocaleString()}/mes, y típicamente se paga sola en 60-90 días.

¿Qué parte te gustaría que te explique mejor - el call center, el dispatch, o el diagnóstico AI?`
            : `${ownerRef}good question. Look, what we do at ORION is simple: we eliminate the problems that drain money from businesses like ${name}.

The main issue I see is: ${mainPainPoint}.

We solve it with AI that works 24/7, never gets tired, never has a bad day.

Investment starts at $${basePrice.toLocaleString()}/month, and typically pays for itself in 60-90 days.

Which part would you like me to explain better - the call center, the dispatch, or the AI diagnosis?`;
    }

    _getSecureApiKey() {
        // Priority 1: Check for injected key (from backend/build process)
        if (window.__MARIO_CONFIG__?.apiKey) {
            return window.__MARIO_CONFIG__.apiKey;
        }

        // Priority 2: Check localStorage (for admin configuration)
        const storedKey = localStorage.getItem('mario_api_key');
        if (storedKey) {
            return atob(storedKey); // Decode from base64
        }

        // Priority 3: Prompt admin to configure
        return null;
    }

    _speak(text) {
        if (!this.synth || !this.voiceEnabled) return;

        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice;

        // Adjust rate based on language - Spanish needs slower for clarity
        const isSpanish = this.language === 'es';
        utterance.rate = isSpanish ? 0.85 : 0.95; // Slower for clarity
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0;

        // Set language explicitly
        utterance.lang = isSpanish ? 'es-US' : 'en-US';

        this.synth.speak(utterance);
    }

    _toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        const btn = document.getElementById('mario-voice-btn');

        if (this.voiceEnabled) {
            btn.style.background = 'linear-gradient(135deg, #00d4aa, #00a8ff)';
            btn.title = '🔊 Voz ACTIVADA - Click para desactivar';
            btn.textContent = '🔊';
        } else {
            // Cancel any current speech
            this.synth.cancel();
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.title = '🔇 Voz DESACTIVADA - Click para activar';
            btn.textContent = '🔇';
        }
    }

    // Public method to configure API key securely
    static configure(apiKey) {
        if (apiKey) {
            localStorage.setItem('mario_api_key', btoa(apiKey));
            console.log('✅ MARIO configured successfully');
        }
    }
}

// Export for use
window.MarioAssistant = MarioAssistant;
