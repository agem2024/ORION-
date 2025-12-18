import os
import sys
import time
import requests
from twilio.rest import Client
from pyngrok import ngrok
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
PORT = 5050

if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
    print("❌ Error: Faltan credenciales de Twilio en .env")
    sys.exit(1)

def main():
    print("\n📞 ORION CALL CENTER - SETUP NGROK + TWILIO\n")
    print("⚠️  IMPORTANTE: Primero debes correr 'python voice_server.py' en otra terminal.")
    print("    Presiona Enter cuando lo tengas listo, o Ctrl+C para cancelar.")
    
    try:
        input()
    except KeyboardInterrupt:
        print("\n🛑 Cancelado.")
        return

    # 1. Start Ngrok Tunnel
    print("🌐 Abriendo túnel seguro con Ngrok...")
    try:
        ngrok.kill()
        public_url = ngrok.connect(PORT).public_url
        print(f"✅ Túnel activo: {public_url}")
        
        clean_host = public_url.replace("https://", "").replace("http://", "")
        print(f"🔧 Host Público: {clean_host}")
    except Exception as e:
        print(f"❌ Error Ngrok: {e}")
        return

    # 2. Update Twilio Webhook
    print(f"🔗 Conectando número {TWILIO_PHONE_NUMBER} a Ngrok...")
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        incoming_phone_numbers = client.incoming_phone_numbers.list(
            phone_number=TWILIO_PHONE_NUMBER, limit=1
        )
        
        if not incoming_phone_numbers:
            print(f"❌ No encontré el número {TWILIO_PHONE_NUMBER} en tu cuenta Twilio.")
            return

        phone_sid = incoming_phone_numbers[0].sid
        webhook_url = f"{public_url}/incoming-call"

        client.incoming_phone_numbers(phone_sid).update(
            voice_url=webhook_url,
            voice_method='POST'
        )
        print(f"✅ Twilio configurado! Webhook: {webhook_url}")
        print("\n" + "="*50)
        print("✨ SISTEMA LISTO ✨")
        print(f"👉 LLAMA AHORA A: {TWILIO_PHONE_NUMBER}")
        print("="*50)
        print("(Presiona Ctrl+C para detener)\n")

    except Exception as e:
        print(f"❌ Error configurando Twilio: {e}")
        return

    # Keep alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo túnel Ngrok...")

if __name__ == "__main__":
    main()
