import { getDoc } from '../lib/googleSheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixHeaders() {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Planeacion_Gastos'];
    await sheet.loadHeaderRow();

    console.log("OLD HEADERS:", sheet.headerValues);

    const requiredHeaders = [
        'ID', 'Mes', 'Concepto', 'MontoEstimado', 'Categoria',
        'DiaSugerido', 'MontoPagado', 'Estado', 'FechaLimite'
    ];

    // Add any missing headers
    const newHeaders = [...sheet.headerValues];
    let changed = false;
    for (const req of requiredHeaders) {
        if (!newHeaders.includes(req)) {
            newHeaders.push(req);
            changed = true;
        }
    }

    if (changed) {
        await sheet.setHeaderRow(newHeaders);
        console.log("NEW HEADERS SAVED:", newHeaders);
    } else {
        console.log("No headers needed changing.");
    }
}

fixHeaders().catch(console.error);
