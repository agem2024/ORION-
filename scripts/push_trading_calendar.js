const calendarHandler = require('../src/apps/calendar');
const logger = require('../src/utils/logger');

const events = [
    // LUNES 26
    { summary: '📈 Trading: Apertura NY (Observar)', start: '2026-01-26T06:30:00', duration: 120, desc: 'No tocar nada aún. Esperar rebote en Orderblocks del viernes.' },
    { summary: '📊 Dato: Dallas Fed Index', start: '2026-01-26T07:30:00', duration: 15, desc: 'Movimiento en el dólar esperado.' },

    // MARTES 27
    { summary: '💱 Trading: Sesión Forex/Dólar', start: '2026-01-27T07:00:00', duration: 120, desc: 'Enfoque en EUR/USD tras dato de confianza.' },
    { summary: '📉 Dato: Confianza del Consumidor', start: '2026-01-27T07:00:00', duration: 15, desc: 'Indica fuerza del gasto minorista.' },
    { summary: '🤖 Earnings: MSFT & GOOGL', start: '2026-01-27T13:05:00', duration: 30, desc: 'Cierre del mercado. Monitorear volatilidad en Nasdaq.' },

    // MIÉRCOLES 28
    { summary: '👷 Dato: Empleo ADP', start: '2026-01-28T05:15:00', duration: 15, desc: 'Preliminar del NFP.' },
    { summary: '🔥 FED: Decisión de Tasas', start: '2026-01-28T11:00:00', duration: 30, desc: 'MÁXIMO RIESGO. No operar en este minuto.' },
    { summary: '🎙️ FED: Rueda de Prensa Powell', start: '2026-01-28T11:30:00', duration: 60, desc: 'Ver en vivo en YouTube. Buscar nivel 6,910.' },
    { summary: '🎯 Trading: Ventana Post-Fed', start: '2026-01-28T12:30:00', duration: 30, desc: 'Operar solo si hay dirección clara y FVG.' },

    // JUEVES 29
    { summary: '🇺🇸 Dato: PIB Provisional Q4', start: '2026-01-29T05:30:00', duration: 15, desc: 'Confirmación de crecimiento del país.' },
    { summary: '🍎 Trading: AAPL Setup', start: '2026-01-29T06:30:00', duration: 60, desc: 'Buscar Calls de Apple en zona de Descuento.' },
    { summary: '🍏 Earnings: Apple', start: '2026-01-29T13:30:00', duration: 30, desc: 'Evento crítico de fin de trimestre.' },

    // VIERNES 30
    { summary: '🛒 Dato: Inflación PCE', start: '2026-01-30T05:30:00', duration: 15, desc: 'Dato favorito de la FED. Cuidado.' },
    { summary: '💰 Trading: Cerrar y Cobrar', start: '2026-01-30T06:00:00', duration: 120, desc: 'Vender todo antes de las 8 AM PST. Profit taking.' }
];

async function pushCalendar() {
    console.log('🚀 Iniciando carga de calendario ORION Clean para Alex (PST)...');

    for (const ev of events) {
        try {
            // we use the actual ISO string which already accounts for the day
            // the crearCitaConVerificacion uses new Date(fechaInicio)
            const result = await calendarHandler.crearCitaConVerificacion(
                ev.summary,
                ev.start,
                ev.duration,
                ev.desc
            );

            if (result.exito) {
                console.log(`✅ Agendado: ${ev.summary} (${result.fecha})`);
            } else {
                console.log(`⚠️ Conflicto o Error en ${ev.summary}: ${result.mensaje}`);
            }
        } catch (e) {
            console.log(`❌ Fallo crítico en ${ev.summary}: ${e.message}`);
        }
    }

    console.log('\n✨ Proceso finalizado. Revisa tu Google Calendar para las alertas.');
}

pushCalendar();
