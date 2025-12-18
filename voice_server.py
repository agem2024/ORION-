import os
import requests
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, Response
from twilio.twiml.voice_response import VoiceResponse, Gather
from dotenv import load_dotenv

load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# MULTILINGUAL SYSTEM PROMPTS - ORION TECH COMPLETO
SYSTEM_MESSAGE_ES = """Eres XONA, asistente de IA por teléfono para ORION Tech (Bay Area, CA).

IDENTIDAD:
- Tu nombre es XONA (pronunciado "ZO-nah")
- Representas a Alex G. Espinosa, el dueño de ORION Tech
- Hablas español fluido y natural

SOBRE ORION TECH:
- Automatización con IA para pequeños y medianos negocios
- WhatsApp bots, apps personalizadas, sistemas IA 24/7
- Multilingüe: EN, ES, ZH, TL, VI

PAQUETES PRINCIPALES:
- INDIVIDUAL ($297-$497): Freelancers, coaches, influencers. Asistente personal WhatsApp.
- STARTER ($997): Pequeños negocios. Bot de servicio, menú interactivo.
- BUSINESS ($1,997): Reservas integradas, calendario, analytics.
- ENTERPRISE ($4,997+): Multi-ubicación, desarrollo custom, IA GPT-4.

ENTERPRISE POR SECTORES:

CONSTRUCCIÓN:
- Plomería: $4,997 setup + $149/mes. Bot estimados foto, scheduling.
- Electricidad: $4,997 setup. Quote generator, permit tracking.
- HVAC: $5,497 setup. Diagnostic bot, emergencias.
- General Contractor: $6,997 setup. Multi-trade coordination.
- Landscaping: $3,997 setup. Seasonal scheduling.
- Roofing: $4,997 setup. Weather-aware scheduling.

FOOD SERVICE:
- Restaurante: $2,997 setup. Menu bot, pedidos, reservas.
- Fast Food: $3,997 setup. Loyalty, bulk ordering.
- Food Truck: $1,997 setup. Location updates.
- Catering: $3,997 setup. Event booking.
- Bar/Nightclub: $3,497 setup. VIP reservations.

RETAIL:
- Tienda Ropa: $2,497 setup. Inventory, size assistant.
- Joyería: $3,997 setup. Appointment, VIP alerts.
- Liquor Store: $2,997 setup. Delivery, age verification.
- Farmacia: $4,997 setup. Refill reminders.

SERVICIOS PERSONALES:
- Salón Belleza: $1,997 setup + $79/mes. Citas, stylists.
- Barbería: $1,497 setup. Walk-in queue.
- Spa: $2,997 setup. Wellness reminders.
- Gym/Fitness: $3,997 setup. Class booking.

SALUD:
- Clínica Médica: $6,997 setup. HIPAA compliance.
- Dental: $5,997 setup. Treatment follow-up.
- Veterinaria: $4,997 setup. Pet records.

SERVICIOS PROFESIONALES:
- Abogados: $5,997 setup. Intake bot, case updates.
- Contadores: $4,997 setup. Document collection.
- Inmobiliarios: $2,997 setup. Listing bot.
- Seguros: $2,997 setup. Quote bot, claims.

AUTOMOTRIZ:
- Mecánico: $3,997 setup. Diagnostic intake.
- Dealer: $6,997 setup. Test drive scheduler.
- Car Wash: $1,997 setup. Membership bot.

CONTACTO:
- WhatsApp: (669) 234-2444
- Voice AI: (831) 222-1072
- Telegram: @oriontechbot
- Email: agem2013@gmail.com

🔴 SPAM → "No estamos interesados, gracias" y TERMINA

PROTOCOLO:
1. Info → Da precios del sector específico
2. Hablar con Alex → "Puedo agendarte una llamada"
3. Aceptan → Pide: nombre, teléfono, tipo de negocio

REGLAS:
- Respuestas CORTAS (máx 2 oraciones)
- Tono futurista pero accesible"""

SYSTEM_MESSAGE_EN = """You are XONA, AI phone assistant for ORION Tech (Bay Area, CA).

IDENTITY:
- Your name is XONA (pronounced "ZO-nah")
- You represent Alex G. Espinosa, ORION Tech owner
- Speak natural, friendly English

ABOUT ORION TECH:
- AI automation for small/medium businesses
- WhatsApp bots, custom apps, 24/7 AI systems
- Multilingual: EN, ES, ZH, TL, VI

MAIN PACKAGES:
- INDIVIDUAL ($297-$497): Freelancers, coaches. Personal WhatsApp assistant.
- STARTER ($997): Small businesses. Service bot, interactive menu.
- BUSINESS ($1,997): Integrated scheduling, calendar, analytics.
- ENTERPRISE ($4,997+): Multi-location, custom dev, GPT-4 AI.

ENTERPRISE BY SECTOR:

CONSTRUCTION:
- Plumbing: $4,997 setup + $149/mo. Photo estimates, scheduling.
- Electrical: $4,997. Quote generator, permit tracking.
- HVAC: $5,497. Diagnostic bot, emergency dispatch.
- General Contractor: $6,997. Multi-trade coordination.
- Landscaping: $3,997. Seasonal scheduling.
- Roofing: $4,997. Weather-aware scheduling.

FOOD SERVICE:
- Restaurant: $2,997. Menu bot, orders, reservations.
- Fast Food: $3,997. Loyalty, bulk ordering.
- Food Truck: $1,997. Location updates.
- Catering: $3,997. Event booking.
- Bar/Nightclub: $3,497. VIP reservations.

RETAIL:
- Clothing: $2,497. Inventory, size assistant.
- Jewelry: $3,997. Appointment, VIP alerts.
- Liquor Store: $2,997. Delivery, age verification.
- Pharmacy: $4,997. Refill reminders.

PERSONAL SERVICES:
- Beauty Salon: $1,997 + $79/mo. Appointments, stylists.
- Barbershop: $1,497. Walk-in queue.
- Spa: $2,997. Wellness reminders.
- Gym/Fitness: $3,997. Class booking.

HEALTH:
- Medical Clinic: $6,997. HIPAA compliance.
- Dental: $5,997. Treatment follow-up.
- Veterinary: $4,997. Pet records.

PROFESSIONAL SERVICES:
- Lawyers: $5,997. Intake bot, case updates.
- Accountants: $4,997. Document collection.
- Real Estate: $2,997. Listing bot.
- Insurance: $2,997. Quote bot, claims.

AUTOMOTIVE:
- Mechanic: $3,997. Diagnostic intake.
- Dealer: $6,997. Test drive scheduler.
- Car Wash: $1,997. Membership bot.

CONTACT:
- WhatsApp: (669) 234-2444
- Voice AI: (831) 222-1072
- Telegram: @oriontechbot
- Email: agem2013@gmail.com

🔴 SPAM → "We're not interested, thank you" and END

PROTOCOL:
1. Info → Give prices for specific sector
2. Talk to Alex → "I can schedule a call"
3. Accept → Ask: name, phone, business type

RULES:
- SHORT responses (max 2 sentences)
- Futuristic but accessible tone"""

# Default language
current_lang = "es"

app = FastAPI()

def get_ngrok_url():
    """Get the public ngrok URL from its local API"""
    try:
        resp = requests.get("http://localhost:4040/api/tunnels", timeout=2)
        tunnels = resp.json().get("tunnels", [])
        for tunnel in tunnels:
            if tunnel.get("proto") == "https":
                return tunnel.get("public_url", "")
        return None
    except:
        return None

def ask_openai(user_input: str, lang: str = "es") -> str:
    """Send message to OpenAI GPT-4o-mini and get response"""
    try:
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_msg = SYSTEM_MESSAGE_ES if lang == "es" else SYSTEM_MESSAGE_EN
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_input}
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        data = response.json()
        
        if response.status_code == 200 and "choices" in data:
            ai_response = data["choices"][0]["message"]["content"].strip()
            print(f"🤖 OpenAI ({lang}): {ai_response}")
            return ai_response
        else:
            print(f"❌ OpenAI Error: {data}")
            return "Sorry, technical issue. Can you repeat?" if lang == "en" else "Perdona, problema técnico. ¿Puedes repetir?"
        
    except Exception as e:
        print(f"❌ OpenAI Exception: {e}")
        return "Sorry, there was an issue." if lang == "en" else "Perdona, hubo un problemita."

@app.get("/", response_class=HTMLResponse)
async def index_page():
    return "<h1>XONA Voice Server (Multilingual EN/ES) 🟢</h1>"

# SPANISH ENDPOINT
@app.api_route("/incoming-call", methods=["GET", "POST"])
@app.api_route("/incoming-call-es", methods=["GET", "POST"])
async def handle_incoming_call_es():
    """Handle incoming call - Spanish"""
    response = VoiceResponse()
    base_url = get_ngrok_url() or "http://localhost:5050"
    print(f"🌐 Spanish Call - Base URL: {base_url}")
    
    response.say(
        "Hola, soy Xona, asistente de ORION Tech. ¿En qué te puedo ayudar?",
        language="es-MX",
        voice="Polly.Mia"
    )
    
    gather = Gather(
        input="speech",
        language="es-MX",
        action=f"{base_url}/process-speech-es",
        method="POST",
        timeout=5,
        speech_timeout="auto"
    )
    response.append(gather)
    
    response.say("No escuché nada. Hasta luego.", language="es-MX")
    
    return Response(content=str(response), media_type="application/xml")

@app.api_route("/process-speech-es", methods=["GET", "POST"])
async def process_speech(SpeechResult: str = Form(None), CallSid: str = Form(None)):
    """Process user speech, get AI response, and continue conversation"""
    response = VoiceResponse()
    base_url = get_ngrok_url() or "http://localhost:5050"
    
    if SpeechResult:
        print(f"🎤 Usuario dijo: {SpeechResult}")
        
        goodbye_words = ["adiós", "adios", "bye", "chao", "hasta luego", "gracias", "ok gracias"]
        if any(word in SpeechResult.lower() for word in goodbye_words):
            response.say("Fue un placer. ¡Hasta luego!", language="es-MX", voice="Polly.Mia")
            return Response(content=str(response), media_type="application/xml")
        
        # Get AI response from OpenAI
        ai_response = ask_openai(SpeechResult)
        response.say(ai_response, language="es-MX", voice="Polly.Mia")
        
        # Continue listening
        gather = Gather(
            input="speech",
            language="es-MX",
            action=f"{base_url}/process-speech-es",
            method="POST",
            timeout=5,
            speech_timeout="auto"
        )
        response.append(gather)
        
        response.say("¿Algo más?", language="es-MX", voice="Polly.Mia")
        gather2 = Gather(
            input="speech",
            language="es-MX",
            action=f"{base_url}/process-speech-es",
            method="POST",
            timeout=5,
            speech_timeout="auto"
        )
        response.append(gather2)
        response.say("Bueno, hasta luego.", language="es-MX", voice="Polly.Mia")
    else:
        response.say("No te escuché. ¿Puedes repetir?", language="es-MX", voice="Polly.Mia")
        gather = Gather(
            input="speech",
            language="es-MX",
            action=f"{base_url}/process-speech-es",
            method="POST",
            timeout=5,
            speech_timeout="auto"
        )
        response.append(gather)
    
    return Response(content=str(response), media_type="application/xml")

# ENGLISH ENDPOINT
@app.api_route("/incoming-call-en", methods=["GET", "POST"])
async def handle_incoming_call_en():
    """Handle incoming call - English"""
    response = VoiceResponse()
    base_url = get_ngrok_url() or "http://localhost:5050"
    print(f"🌐 English Call - Base URL: {base_url}")
    
    response.say(
        "Hello, I'm XONA, assistant for ORION Tech. How can I help you?",
        language="en-US",
        voice="Polly.Joanna"
    )
    
    gather = Gather(
        input="speech",
        language="en-US",
        action=f"{base_url}/process-speech-en",
        method="POST",
        timeout=5,
        speech_timeout="auto"
    )
    response.append(gather)
    
    response.say("I didn't hear anything. Goodbye.", language="en-US")
    
    return Response(content=str(response), media_type="application/xml")

@app.api_route("/process-speech-en", methods=["GET", "POST"])
async def process_speech_en(SpeechResult: str = Form(None), CallSid: str = Form(None)):
    """Process user speech in English"""
    response = VoiceResponse()
    base_url = get_ngrok_url() or "http://localhost:5050"
    
    if SpeechResult:
        print(f"🎤 User said: {SpeechResult}")
        
        goodbye_words = ["goodbye", "bye", "thanks", "thank you", "ok thanks", "that's all"]
        if any(word in SpeechResult.lower() for word in goodbye_words):
            response.say("It was a pleasure. Goodbye!", language="en-US", voice="Polly.Joanna")
            return Response(content=str(response), media_type="application/xml")
        
        # Get AI response from OpenAI in English
        ai_response = ask_openai(SpeechResult, lang="en")
        response.say(ai_response, language="en-US", voice="Polly.Joanna")
        
        # Continue listening
        gather = Gather(
            input="speech",
            language="en-US",
            action=f"{base_url}/process-speech-en",
            method="POST",
            timeout=5,
            speech_timeout="auto"
        )
        response.append(gather)
        
        response.say("Anything else?", language="en-US", voice="Polly.Joanna")
        gather2 = Gather(
            input="speech",
            language="en-US",
            action=f"{base_url}/process-speech-en",
            method="POST",
            timeout=5,
            speech_timeout="auto"
        )
        response.append(gather2)
        response.say("Alright, goodbye.", language="en-US", voice="Polly.Joanna")
    else:
        response.say("I didn't hear you. Can you repeat?", language="en-US", voice="Polly.Joanna")
        gather = Gather(
            input="speech",
            language="en-US",
            action=f"{base_url}/process-speech-en",
            method="POST",
            timeout=5,
            speech_timeout="auto"
        )
        response.append(gather)
    
    return Response(content=str(response), media_type="application/xml")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting XONA Voice Server (Multilingual EN/ES)...")
    print("📞 Spanish: /incoming-call or /incoming-call-es")
    print("📞 English: /incoming-call-en")
    uvicorn.run(app, host="0.0.0.0", port=5050)
