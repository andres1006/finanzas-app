import { getDoc } from './lib/googleSheets';

async function updateHeaders() {
    try {
        const doc = await getDoc();
        
        // 1. Update Metas_DB
        const metasSheet = doc.sheetsByTitle['Metas_DB'];
        if (metasSheet) {
            console.log('Updating Metas_DB headers...');
            await metasSheet.setHeaderRow(['ID', 'Nombre', 'Monto_Objetivo', 'Monto_Actual', 'Fecha_Limite', 'Prioridad', 'Usuario']);
            console.log('Metas_DB headers updated.');
        } else {
            console.log('Metas_DB sheet not found.');
        }

        // 2. Update Ahorros_Historial_DB
        const historySheet = doc.sheetsByTitle['Ahorros_Historial_DB'];
        if (historySheet) {
            console.log('Updating Ahorros_Historial_DB headers...');
            await historySheet.setHeaderRow(['Fecha', 'Meta_ID', 'Monto', 'Usuario']);
            console.log('Ahorros_Historial_DB headers updated.');
        } else {
            console.log('Ahorros_Historial_DB sheet not found.');
        }

        // 3. Update Creditos_DB
        const creditsSheet = doc.sheetsByTitle['Creditos_DB'];
        if (creditsSheet) {
            console.log('Updating Creditos_DB headers...');
            await creditsSheet.setHeaderRow(['ID', 'Nombre', 'Saldo_Total', 'Saldo_Actual', 'Tasa_Interes', 'Pago_Minimo', 'Fecha_Corte', 'Plazo_Meses', 'Usuario']);
            console.log('Creditos_DB headers updated.');
        }

    } catch (error) {
        console.error('Error updating headers:', error);
    }
}

updateHeaders();
