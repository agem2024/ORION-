import asyncio
import edge_tts
import sys

# Voces disponibles:
# es-AR-TomasNeural (Argentino)
# es-CO-GonzaloNeural (Colombiano)
# es-MX-JorgeNeural (Mexicano)
# es-MX-DaliaNeural (Mujer Mexicana)
# es-US-AlonsoNeural (Latino USA)

if __name__ == "__main__":
    text = sys.argv[1]
    output_file = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "es-CO-GonzaloNeural"
    
    loop = asyncio.get_event_loop_policy().get_event_loop()
    loop.run_until_complete(edge_tts.Communicate(text, voice).save(output_file))
