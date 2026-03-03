import { getDoc } from '../lib/googleSheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Planeacion_Gastos'];
    const rows = await sheet.getRows();
    const gasolinas = rows.filter(r => r.get('Concepto').toLowerCase().includes('gasolina'));
    for (const r of gasolinas) {
        console.log(`ID: ${r.get('ID')} Mes: ${r.get('Mes')} Concepto: ${r.get('Concepto')} Pagado: "${r.get('MontoPagado')}" Estimado: "${r.get('MontoEstimado')}"`);
    }
}
check();
