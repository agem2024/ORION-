const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const KEY_FILE = path.join(__dirname, '../service_account.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function getCalendarClient() {
    if (!fs.existsSync(KEY_FILE)) {
        throw new Error('No service_account.json found.');
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: SCOPES,
    });

    return google.calendar({ version: 'v3', auth });
}

async function getCalendarId(calendar) {
    const calendarList = await calendar.calendarList.list();
    let calendarId = 'primary';
    const userCal = calendarList.data.items.find(c => c.id.includes('@gmail.com') || c.id.includes('@'));
    if (userCal) calendarId = userCal.id;
    return calendarId;
}

const calendarHandler = {
    // List upcoming events
    listarEventos: async (maxResults = 10) => {
        try {
            const calendar = await getCalendarClient();
            const calendarId = await getCalendarId(calendar);

            const res = await calendar.events.list({
                calendarId: calendarId,
                timeMin: new Date().toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return res.data.items;
        } catch (e) {
            logger.error('Calendar List Error: ' + e.message);
            throw e;
        }
    },

    // Get TODAY's appointments for morning report
    obtenerCitasHoy: async () => {
        try {
            const calendar = await getCalendarClient();
            const calendarId = await getCalendarId(calendar);

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

            const res = await calendar.events.list({
                calendarId: calendarId,
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            return res.data.items || [];
        } catch (e) {
            logger.error('Calendar Today Error: ' + e.message);
            return [];
        }
    },

    // Check availability for a given time slot
    verificarDisponibilidad: async (fechaInicio, duracionMinutos = 60) => {
        try {
            const calendar = await getCalendarClient();
            const calendarId = await getCalendarId(calendar);

            const start = new Date(fechaInicio);
            const end = new Date(start.getTime() + duracionMinutos * 60000);

            const res = await calendar.events.list({
                calendarId: calendarId,
                timeMin: start.toISOString(),
                timeMax: end.toISOString(),
                singleEvents: true,
            });

            const conflictos = res.data.items || [];
            return {
                disponible: conflictos.length === 0,
                conflictos: conflictos.map(e => ({
                    titulo: e.summary,
                    inicio: e.start.dateTime || e.start.date,
                    fin: e.end.dateTime || e.end.date
                }))
            };
        } catch (e) {
            logger.error('Calendar Availability Error: ' + e.message);
            return { disponible: false, error: e.message };
        }
    },

    // Create event WITH conflict check
    crearCitaConVerificacion: async (resumen, fechaInicio, duracionMinutos = 60, descripcion = '') => {
        try {
            // First check availability
            const disponibilidad = await calendarHandler.verificarDisponibilidad(fechaInicio, duracionMinutos);

            if (!disponibilidad.disponible) {
                return {
                    exito: false,
                    mensaje: `🚫 No disponible. Ya hay citas en ese horario.`,
                    conflictos: disponibilidad.conflictos
                };
            }

            // Create the event
            const calendar = await getCalendarClient();
            const calendarId = await getCalendarId(calendar);

            const start = new Date(fechaInicio);
            const end = new Date(start.getTime() + duracionMinutos * 60000);

            const event = {
                summary: resumen,
                description: descripcion,
                start: {
                    dateTime: start.toISOString(),
                    timeZone: 'America/Los_Angeles'
                },
                end: {
                    dateTime: end.toISOString(),
                    timeZone: 'America/Los_Angeles'
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 60 },     // 1 hour before
                        { method: 'popup', minutes: 15 },     // 15 min before
                    ],
                },
            };

            const res = await calendar.events.insert({
                calendarId: calendarId,
                resource: event,
            });

            logger.info(`📅 Cita creada: ${resumen} @ ${start.toLocaleString()}`);

            return {
                exito: true,
                mensaje: `✅ Cita agendada: ${resumen}`,
                evento: res.data,
                fecha: start.toLocaleString('es-MX', { timeZone: 'America/Los_Angeles' }),
                link: res.data.htmlLink
            };
        } catch (e) {
            logger.error('Calendar Create Error: ' + e.message);
            return { exito: false, mensaje: '❌ Error al crear cita: ' + e.message };
        }
    },

    // Legacy create without verification (for backward compatibility)
    crearEvento: async (resumen, fechaInicio, duracionMinutos = 60) => {
        const result = await calendarHandler.crearCitaConVerificacion(resumen, fechaInicio, duracionMinutos);
        if (result.exito) return result.evento;
        throw new Error(result.mensaje);
    },

    // Generate morning report
    generarReporteManana: async () => {
        try {
            const citasHoy = await calendarHandler.obtenerCitasHoy();

            if (citasHoy.length === 0) {
                return '📅 **Reporte del Día**\n\nNo hay citas programadas para hoy.';
            }

            let reporte = `📅 **Reporte del Día - ${new Date().toLocaleDateString('es-MX')}**\n\n`;
            reporte += `Total de citas: ${citasHoy.length}\n\n`;

            citasHoy.forEach((cita, i) => {
                const inicio = new Date(cita.start.dateTime || cita.start.date);
                const hora = inicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                reporte += `${i + 1}. **${hora}** - ${cita.summary}\n`;
            });

            return reporte;
        } catch (e) {
            logger.error('Morning Report Error: ' + e.message);
            return '❌ Error generando reporte de citas.';
        }
    }
};

module.exports = calendarHandler;

