/**
 * XONA Realtime - OpenAI Realtime API con WebSocket
 * Módulo servidor-a-servidor para ORION (Node.js)
 * 
 * Uso:
 *   const xonaRealtime = require('./xona-realtime');
 *   const session = await xonaRealtime.createSession();
 *   session.sendAudio(audioBuffer);
 *   session.on('response', (text) => console.log(text));
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

class XonaRealtimeSession extends EventEmitter {
    constructor(options = {}) {
        super();

        this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        this.model = options.model || 'gpt-4o-realtime-preview';
        this.voice = options.voice || 'shimmer';
        this.instructions = options.instructions || `Eres XONA (pronunciado "CHO-nah" en español), asistente de ventas AI de ORION Tech.
Hablas español paisa colombiano - cálido, amigable, profesional.
Respuestas CORTAS (máximo 2 oraciones).
Servicios: Bots WhatsApp con IA, automatización para negocios.
Precios USA: Individual $297-$497, Salones $997, Restaurantes $1,497, Enterprise $4,997+
Contacto: WhatsApp (669) 234-2444`;

        this.ws = null;
        this.isConnected = false;
        this.audioBuffer = [];
        this.currentResponseId = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const url = `wss://api.openai.com/v1/realtime?model=${this.model}`;

            this.ws = new WebSocket(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'OpenAI-Beta': 'realtime=v1'
                }
            });

            this.ws.on('open', () => {
                console.log('🎤 XONA Realtime conectado');
                this.isConnected = true;

                // Configurar sesión
                this.send({
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: this.instructions,
                        voice: this.voice,
                        input_audio_format: 'pcm16',
                        output_audio_format: 'pcm16',
                        input_audio_transcription: { model: 'whisper-1' },
                        turn_detection: {
                            type: 'server_vad',
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 500
                        }
                    }
                });

                resolve(this);
            });

            this.ws.on('message', (data) => {
                try {
                    const event = JSON.parse(data.toString());
                    this.handleServerEvent(event);
                } catch (e) {
                    console.error('Error parsing realtime event:', e);
                }
            });

            this.ws.on('error', (error) => {
                console.error('XONA Realtime error:', error);
                this.emit('error', error);
                reject(error);
            });

            this.ws.on('close', () => {
                console.log('🔇 XONA Realtime desconectado');
                this.isConnected = false;
                this.emit('disconnected');
            });
        });
    }

    handleServerEvent(event) {
        switch (event.type) {
            case 'session.created':
                this.emit('session_created', event.session);
                break;

            case 'session.updated':
                this.emit('session_updated', event.session);
                break;

            case 'input_audio_buffer.speech_started':
                this.emit('speech_started');
                break;

            case 'input_audio_buffer.speech_stopped':
                this.emit('speech_stopped');
                break;

            case 'conversation.item.input_audio_transcription.completed':
                this.emit('user_transcript', event.transcript);
                break;

            case 'response.audio.delta':
                // Audio chunk de la respuesta
                if (event.delta) {
                    const audioData = Buffer.from(event.delta, 'base64');
                    this.audioBuffer.push(audioData);
                    this.emit('audio_delta', audioData);
                }
                break;

            case 'response.audio.done':
                // Audio completo
                if (this.audioBuffer.length > 0) {
                    const fullAudio = Buffer.concat(this.audioBuffer);
                    this.emit('audio_complete', fullAudio);
                    this.audioBuffer = [];
                }
                break;

            case 'response.audio_transcript.delta':
                this.emit('transcript_delta', event.delta);
                break;

            case 'response.audio_transcript.done':
                this.emit('assistant_transcript', event.transcript);
                break;

            case 'response.done':
                this.emit('response_done', event.response);
                break;

            case 'error':
                this.emit('error', new Error(event.error?.message || 'Unknown error'));
                break;

            default:
                // Log otros eventos para debug
                if (event.type) {
                    this.emit('event', event);
                }
        }
    }

    send(event) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(event));
        }
    }

    // Enviar audio PCM16 al modelo
    sendAudio(audioBuffer) {
        if (!Buffer.isBuffer(audioBuffer)) {
            audioBuffer = Buffer.from(audioBuffer);
        }

        this.send({
            type: 'input_audio_buffer.append',
            audio: audioBuffer.toString('base64')
        });
    }

    // Commit audio y solicitar respuesta
    commitAudio() {
        this.send({ type: 'input_audio_buffer.commit' });
        this.send({ type: 'response.create' });
    }

    // Enviar mensaje de texto
    sendText(text) {
        this.send({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text: text }]
            }
        });
        this.send({ type: 'response.create' });
    }

    // Interrumpir respuesta actual
    interrupt() {
        this.send({ type: 'response.cancel' });
    }

    // Cerrar conexión
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}

// Factory function
async function createSession(options = {}) {
    const session = new XonaRealtimeSession(options);
    await session.connect();
    return session;
}

// Generar token efímero para clientes WebRTC
async function generateEphemeralToken(config = {}) {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.model || 'gpt-4o-realtime-preview',
            voice: config.voice || 'shimmer',
            instructions: config.instructions || 'You are XONA, a helpful AI sales assistant.'
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to generate ephemeral token: ${response.statusText}`);
    }

    return await response.json();
}

module.exports = {
    XonaRealtimeSession,
    createSession,
    generateEphemeralToken
};
