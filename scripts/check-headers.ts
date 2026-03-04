import { getDoc } from '../lib/googleSheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkHeaders() {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Planeacion_Gastos'];
    await sheet.loadHeaderRow();

    console.log("HEADERS:", sheet.headerValues);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('Mes') === '2026-03' && r.get('Concepto').toLowerCase().includes('gasolina'));
    if (row) {
        console.log("Raw row values:", row.toObject());
    }
}

checkHeaders().catch(console.error);
