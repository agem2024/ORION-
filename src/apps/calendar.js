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

const calendarHandler = {
    // List upcoming events
    listarEventos: async (maxResults = 5) => {
        try {
            const calendar = await getCalendarClient();
            // Using 'primary' (Service Account or Shared User Calendar)
            // Ideally, explicit ID should be in config, but defaulting to primary as per legacy.

            // Try to find user calendar
            const calendarList = await calendar.calendarList.list();
            let calendarId = 'primary';
            const userCal = calendarList.data.items.find(c => c.id.includes('@gmail.com') || c.id.includes('@'));
            if (userCal) calendarId = userCal.id;

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

    // Create Event
    crearEvento: async (resumen, fechaInicio, duracionMinutos = 60) => {
        try {
            const calendar = await getCalendarClient();

            const calendarList = await calendar.calendarList.list();
            let calendarId = 'primary';
            const userCal = calendarList.data.items.find(c => c.id.includes('@gmail.com') || c.id.includes('@'));
            if (userCal) calendarId = userCal.id;

            const start = new Date(fechaInicio); // Requires valid date string
            const end = new Date(start.getTime() + duracionMinutos * 60000);

            const event = {
                summary: resumen,
                start: { dateTime: start.toISOString() },
                end: { dateTime: end.toISOString() },
            };

            const res = await calendar.events.insert({
                calendarId: calendarId,
                resource: event,
            });

            return res.data;
        } catch (e) {
            logger.error('Calendar Create Error: ' + e.message);
            throw e;
        }
    }
};

module.exports = calendarHandler;
