import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const cleanupMonth = async (month) => {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        console.error('Error: Debe proporcionar un mes en formato YYYY-MM (ej: 2026-02)');
        process.exit(1);
    }

    console.log(`🚀 Iniciando limpieza para el mes: ${month}...`);

    try {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        // 1. Limpiar Transacciones_DB
        const transSheet = doc.sheetsByTitle['Transacciones_DB'];
        if (transSheet) {
            console.log('--- Analizando Transacciones_DB ---');
            const rows = await transSheet.getRows();
            let count = 0;
            for (const row of rows) {
                const fecha = row.get('Fecha') || '';
                // Soporta YYYY-MM-DD o DD/MM/YYYY
                if (fecha.startsWith(month) || (fecha.includes('/') && fecha.endsWith(month.split('-')[0]))) {
                    await row.delete();
                    count++;
                }
            }
            console.log(`✅ Eliminados ${count} items de transacciones.`);
        }

        // 2. Limpiar Planeacion_Gastos
        const planSheet = doc.sheetsByTitle['Planeacion_Gastos'];
        if (planSheet) {
            console.log('--- Limpiando Planeacion_Gastos ---');
            const rows = await planSheet.getRows();
            let count = 0;
            for (const row of rows) {
                const mesRow = row.get('Mes');
                if (mesRow === month) {
                    await row.delete();
                    count++;
                }
            }
            console.log(`✅ Eliminados ${count} items de planeación.`);
        }

        console.log(`\n🎉 Limpieza de ${month} completada con éxito.`);

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    }
};

const monthToCleanup = process.argv[2] || '2026-02';
cleanupMonth(monthToCleanup);
