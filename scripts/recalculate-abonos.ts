import { getDoc } from '../lib/googleSheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function parseSafeNumber(val) {
    if (!val || val === 'NaN') return 0;
    if (typeof val === 'number') return val;
    let str = String(val).replace(/[$ \s]/g, '');
    str = str.replace(/\./g, '');
    str = str.replace(/,/g, '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

async function recalculate() {
    const doc = await getDoc();
    const tSheet = doc.sheetsByTitle['Transacciones_DB'];
    const pSheet = doc.sheetsByTitle['Planeacion_Gastos'];

    const tRows = await tSheet.getRows();
    const pRows = await pSheet.getRows();

    // Reset current month pagado to 0
    for (const pRow of pRows) {
        if (pRow.get('Mes') === '2026-03') {
            pRow.set('MontoPagado', '0');
            pRow.set('Estado', 'PENDIENTE');
            await pRow.save(); // Save the reset state
        }
    }

    // Recalculate from transactions ending in "(Abono)" or exact matches
    for (const tRow of tRows) {
        const fecha = tRow.get('Fecha');
        if (fecha && fecha.startsWith('2026-03')) {
            const desc = tRow.get('Descripción') || '';
            const tMonto = parseSafeNumber(tRow.get('Monto'));

            // Find matched planeacion row
            let matchedPRow = pRows.find(p => p.get('Mes') === '2026-03' && desc.includes(p.get('Concepto')));

            if (matchedPRow && tRow.get('Tipo') === 'Gasto') {
                let currentPagado = parseSafeNumber(matchedPRow.get('MontoPagado'));
                currentPagado += tMonto;
                // Update properties in object
                matchedPRow.set('MontoPagado', currentPagado.toString());

                let estimado = parseSafeNumber(matchedPRow.get('MontoEstimado'));
                if (currentPagado >= estimado && estimado > 0) {
                    matchedPRow.set('Estado', 'PAGADO');
                } else if (currentPagado > 0) {
                    matchedPRow.set('Estado', 'PARCIAL');
                }
                await matchedPRow.save();
                console.log(`Updated ${matchedPRow.get('Concepto')} with +${tMonto}. Total: ${currentPagado}`);
            }
        }
    }
    console.log("Recalculation complete.");
}

recalculate().catch(console.error);
