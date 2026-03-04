import { getDoc } from '../lib/googleSheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function parseSafeNumber(val: any) {
    if (!val || val === 'NaN') return 0;
    if (typeof val === 'number') return val;
    let str = String(val).replace(/[$ \s]/g, '');
    str = str.replace(/\./g, '');
    str = str.replace(/,/g, '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

async function testPatch() {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Planeacion_Gastos'];
    const rows = await sheet.getRows();

    // Find Gasolina in 2026-03
    const row = rows.find(r => r.get('Mes') === '2026-03' && r.get('Concepto').toLowerCase().includes('gasolina'));
    if (!row) {
        console.log("No row found");
        return;
    }

    console.log("Found row:", row.get('Concepto'), "Pagado:", row.get('MontoPagado'));

    let newPagado = parseSafeNumber(row.get('MontoPagado'));
    console.log("Parsed pagado:", newPagado);

    // Simulate abono of 80000
    newPagado += 80000;
    row.set('MontoPagado', newPagado.toString());

    // Recalcular
    let newEstimado = parseSafeNumber(row.get('MontoEstimado'));
    if (newPagado >= newEstimado && newEstimado > 0) {
        row.set('Estado', 'PAGADO');
    } else if (newPagado > 0) {
        row.set('Estado', 'PARCIAL');
    } else {
        row.set('Estado', 'PENDIENTE');
    }

    console.log("Will save Pagado as:", row.get('MontoPagado'), "Estado:", row.get('Estado'));
    await row.save();
    console.log("Saved.");
}

testPatch().catch(console.error);
