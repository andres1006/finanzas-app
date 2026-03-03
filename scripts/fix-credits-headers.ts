import { getDoc } from '../lib/googleSheets';

async function fixCreditsHeaders() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Creditos_DB'];

        if (!sheet) {
            console.log("No Creditos_DB sheet found. Skipping.");
            return;
        }

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;

        console.log('Current headers:', headers);

        if (!headers.includes('TipoTasa')) {
            console.log("Adding 'TipoTasa' to headers...");
            const newHeaders = [...headers, 'TipoTasa'];
            await sheet.resize({ rowCount: sheet.rowCount, columnCount: newHeaders.length });
            await sheet.setHeaderRow(newHeaders);
            console.log("Headers updated successfully to:", newHeaders);
        } else {
            console.log("'TipoTasa' already exists in headers.");
        }
    } catch (error) {
        console.error("Error fixing headers:", error);
    }
}

fixCreditsHeaders();
