/**
 * 📊 XLSX Manager Module - JHON Central Brain
 * Handles reading and parsing of spreadsheet files.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Read an XLSX file and return its data as JSON.
 */
function readExcel(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;

        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        const data = {};

        sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            data[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });

        return data;
    } catch (e) {
        console.error('XLSX Manager Error:', e.message);
        return null;
    }
}

/**
 * Get a summary of the spreadsheet (sheet names, row counts).
 */
function getExcelSummary(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;

        const workbook = XLSX.readFile(filePath);
        const summary = workbook.SheetNames.map(name => {
            const sheet = workbook.Sheets[name];
            const ref = sheet['!ref'];
            const range = XLSX.utils.decode_range(ref);
            return {
                name: name,
                rows: range.e.r + 1,
                cols: range.e.c + 1
            };
        });

        return summary;
    } catch (e) {
        console.error('XLSX Manager Error (Summary):', e.message);
        return null;
    }
}

module.exports = {
    readExcel,
    getExcelSummary
};
