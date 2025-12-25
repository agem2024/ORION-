/**
 * XONA Voice - OpenAI Realtime API con WebRTC
 * Módulo de voz en tiempo real para ORION Tech
 * 
 * Uso:
 *   const voice = new XonaVoice({ tokenEndpoint: '/api/realtime-token' });
 *   voice.start();
 *   voice.stop();
 */

class XonaVoice {
    constructor(options = {}) {
        this.tokenEndpoint = options.tokenEndpoint || '/api/realtime-token';
        this.onMessage = options.onMessage || ((msg) => console.log('XONA:', msg));
        this.onStateChange = options.onStateChange || ((state) => console.log('State:', state));
        this.onError = options.onError || ((err) => console.error('Error:', err));

        this.peerConnection = null;
        this.dataChannel = null;
        this.audioElement = null;
        this.mediaStream = null;
        this.isConnected = false;

        // Configuración de sesión
        this.sessionConfig = options.sessionConfig || {
            model: "gpt-4o-realtime-preview",
            voice: "shimmer", // shimmer = voz femenina natural
            instructions: `Eres XONA (pronunciado "CHO-nah" en español), asistente de ventas AI de ORION Tech.
Hablas español paisa colombiano - cálido, amigable, profesional.
Respuestas CORTAS (máximo 2 oraciones).
Servicios: Bots WhatsApp con IA, automatización para negocios.
Precios USA: Individual $297-$497, Salones $997, Restaurantes $1,497, Enterprise $4,997+
Contacto: WhatsApp (669) 234-2444
Siempre ofrece una demo o llamada con el equipo después de 2-3 mensajes.`
        };
    }

    async start() {
        try {
            this.onStateChange('connecting');

            // 1. Crear peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            // 2. Configurar audio de salida (escuchar a XONA)
            this.audioElement = document.createElement('audio');
            this.audioElement.autoplay = true;
            this.peerConnection.ontrack = (event) => {
                this.audioElement.srcObject = event.streams[0];
            };

            // 3. Capturar micrófono del usuario
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            this.peerConnection.addTrack(this.mediaStream.getTracks()[0]);

            // 4. Crear canal de datos para eventos
            this.dataChannel = this.peerConnection.createDataChannel('oai-events');
            this.setupDataChannel();

            // 5. Obtener token efímero del servidor
            const tokenResponse = await fetch(this.tokenEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config: this.sessionConfig })
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to get realtime token');
            }

            const tokenData = await tokenResponse.json();
            const ephemeralKey = tokenData.client_secret?.value || tokenData.value;

            if (!ephemeralKey) {
                throw new Error('Invalid token response');
            }

            // 6. Crear oferta SDP
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // 7. Conectar con OpenAI Realtime API
            const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
                method: 'POST',
                body: offer.sdp,
                headers: {
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/sdp'
                }
            });

            if (!sdpResponse.ok) {
                const errorText = await sdpResponse.text();
                throw new Error(`OpenAI Realtime error: ${errorText}`);
            }

            const answerSdp = await sdpResponse.text();
            await this.peerConnection.setRemoteDescription({
                type: 'answer',
                sdp: answerSdp
            });

            this.isConnected = true;
            this.onStateChange('connected');

        } catch (error) {
            this.onError(error);
            this.onStateChange('error');
            this.stop();
        }
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('🎤 XONA Voice connected');

            // Enviar configuración inicial de sesión
            this.sendEvent({
                type: 'session.update',
                session: {
                    modalities: ['text', 'audio'],
                    instructions: this.sessionConfig.instructions,
                    voice: this.sessionConfig.voice,
                    input_audio_transcription: { model: 'whisper-1' },
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500
                    }
                }
            });
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const serverEvent = JSON.parse(event.data);
                this.handleServerEvent(serverEvent);
            } catch (e) {
                console.error('Error parsing server event:', e);
            }
        };

        this.dataChannel.onclose = () => {
            console.log('🔇 XONA Voice disconnected');
            this.onStateChange('disconnected');
        };
    }

    handleServerEvent(event) {
        switch (event.type) {
            case 'conversation.item.created':
                // Nuevo item de conversación creado
                break;

            case 'response.audio_transcript.delta':
                // Transcripción parcial de la respuesta de audio
                if (event.delta) {
                    this.onMessage({ type: 'transcript_delta', text: event.delta });
                }
                break;

            case 'response.audio_transcript.done':
                // Transcripción completa
                if (event.transcript) {
                    this.onMessage({ type: 'transcript', text: event.transcript, role: 'assistant' });
                }
                break;

            case 'input_audio_buffer.speech_started':
                this.onStateChange('listening');
                break;

            case 'input_audio_buffer.speech_stopped':
                this.onStateChange('processing');
                break;

            case 'response.done':
                this.onStateChange('ready');
                break;

            case 'error':
                this.onError(new Error(event.error?.message || 'Unknown error'));
                break;
        }
    }

    sendEvent(event) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(event));
        }
    }

    sendTextMessage(text) {
        this.sendEvent({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text: text }]
            }
        });
        this.sendEvent({ type: 'response.create' });
    }

    stop() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.audioElement) {
            this.audioElement.srcObject = null;
            this.audioElement = null;
        }

        this.isConnected = false;
        this.onStateChange('stopped');
    }

    toggleMute() {
        if (this.mediaStream) {
            const audioTrack = this.mediaStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            return !audioTrack.enabled; // Returns true if muted
        }
        return false;
    }
}

// ============ UI COMPONENT ============
class XonaVoiceButton {
    constructor(options = {}) {
        this.containerId = options.containerId || 'xona-voice-container';
        this.tokenEndpoint = options.tokenEndpoint || '/api/realtime-token';
        this.position = options.position || 'bottom-right';
        this.voice = null;
        this.state = 'idle';
        this.transcript = '';

        this.init();
    }

    init() {
        this.createStyles();
        this.createUI();
        this.setupVoice();
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .xona-voice-fab {
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 10000;
            }
            
            .xona-voice-fab:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
            }
            
            .xona-voice-fab.listening {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                animation: pulse 1.5s infinite;
            }
            
            .xona-voice-fab.processing {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }
            
            .xona-voice-fab.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            
            .xona-voice-fab svg {
                width: 28px;
                height: 28px;
                fill: white;
            }
            
            .xona-voice-panel {
                position: fixed;
                bottom: 170px;
                right: 30px;
                width: 320px;
                max-height: 400px;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                border: 1px solid rgba(99, 102, 241, 0.3);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 10000;
            }
            
            .xona-voice-panel.open {
                display: flex;
            }
            
            .xona-voice-header {
                padding: 16px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .xona-voice-header h4 {
                margin: 0;
                color: white;
                font-size: 16px;
                font-weight: 600;
            }
            
            .xona-voice-status {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .xona-voice-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                max-height: 250px;
            }
            
            .xona-voice-message {
                padding: 10px 14px;
                border-radius: 12px;
                margin-bottom: 10px;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .xona-voice-message.user {
                background: rgba(99, 102, 241, 0.2);
                color: #a5b4fc;
                margin-left: 20%;
            }
            
            .xona-voice-message.assistant {
                background: rgba(16, 185, 129, 0.2);
                color: #6ee7b7;
                margin-right: 20%;
            }
            
            .xona-voice-footer {
                padding: 12px 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                gap: 10px;
            }
            
            .xona-voice-footer button {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .xona-btn-start {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }
            
            .xona-btn-stop {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    createUI() {
        // Floating Action Button
        this.fab = document.createElement('button');
        this.fab.className = 'xona-voice-fab';
        this.fab.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        `;
        this.fab.onclick = () => this.togglePanel();

        // Panel
        this.panel = document.createElement('div');
        this.panel.className = 'xona-voice-panel';
        this.panel.innerHTML = `
            <div class="xona-voice-header">
                <div>
                    <h4>🎤 XONA Voice</h4>
                    <span class="xona-voice-status">Toca para hablar</span>
                </div>
            </div>
            <div class="xona-voice-messages" id="xona-messages"></div>
            <div class="xona-voice-footer">
                <button class="xona-btn-start" id="xona-start">🎤 Iniciar</button>
                <button class="xona-btn-stop" id="xona-stop" style="display:none">⏹ Parar</button>
            </div>
        `;

        document.body.appendChild(this.fab);
        document.body.appendChild(this.panel);

        // Event listeners
        document.getElementById('xona-start').onclick = () => this.startVoice();
        document.getElementById('xona-stop').onclick = () => this.stopVoice();
    }

    setupVoice() {
        this.voice = new XonaVoice({
            tokenEndpoint: this.tokenEndpoint,
            onMessage: (msg) => this.handleMessage(msg),
            onStateChange: (state) => this.handleStateChange(state),
            onError: (err) => this.handleError(err)
        });
    }

    togglePanel() {
        this.panel.classList.toggle('open');
    }

    async startVoice() {
        document.getElementById('xona-start').style.display = 'none';
        document.getElementById('xona-stop').style.display = 'block';
        await this.voice.start();
    }

    stopVoice() {
        document.getElementById('xona-start').style.display = 'block';
        document.getElementById('xona-stop').style.display = 'none';
        this.voice.stop();
    }

    handleMessage(msg) {
        if (msg.type === 'transcript' && msg.text) {
            const messagesEl = document.getElementById('xona-messages');
            const msgEl = document.createElement('div');
            msgEl.className = `xona-voice-message ${msg.role}`;
            msgEl.textContent = msg.text;
            messagesEl.appendChild(msgEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    }

    handleStateChange(state) {
        this.state = state;
        const statusEl = this.panel.querySelector('.xona-voice-status');
        const fab = this.fab;

        fab.classList.remove('listening', 'processing', 'error');

        switch (state) {
            case 'connecting':
                statusEl.textContent = 'Conectando...';
                break;
            case 'connected':
            case 'ready':
                statusEl.textContent = '🟢 Conectado - Habla ahora';
                break;
            case 'listening':
                statusEl.textContent = '🎤 Escuchando...';
                fab.classList.add('listening');
                break;
            case 'processing':
                statusEl.textContent = '🤔 Procesando...';
                fab.classList.add('processing');
                break;
            case 'error':
                statusEl.textContent = '❌ Error de conexión';
                fab.classList.add('error');
                break;
            case 'stopped':
            case 'disconnected':
                statusEl.textContent = 'Toca para hablar';
                break;
        }
    }

    handleError(error) {
        console.error('XONA Voice Error:', error);
        const messagesEl = document.getElementById('xona-messages');
        const msgEl = document.createElement('div');
        msgEl.className = 'xona-voice-message assistant';
        msgEl.textContent = '⚠️ Error: ' + error.message;
        messagesEl.appendChild(msgEl);
    }
}

// Auto-init si el contenedor existe
if (typeof window !== 'undefined') {
    window.XonaVoice = XonaVoice;
    window.XonaVoiceButton = XonaVoiceButton;
}
