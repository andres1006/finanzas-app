import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function POST(req: Request) {
    try {
        const { creditId, amount, user } = await req.json();
        const doc = await getDoc();
        
        // 1. Actualizar el saldo en Creditos_DB
        const creditSheet = doc.sheetsByTitle['Creditos_DB'];
        if (!creditSheet) throw new Error('Creditos_DB not found');

        const rows = await creditSheet.getRows();
        // Buscamos por ID (exacto) o por id (minúsculas)
        const row = rows.find(r => r.get('ID') === creditId || r.get('id') === creditId);
        
        if (row) {
            // Intentar leer saldo actual de varias formas comunes
            const currentActualStr = row.get('Saldo_Actual') || row.get('Saldo Actual') || row.get('Saldo_actual') || '0';
            const currentActual = parseFloat(String(currentActualStr).replace(/[$.]/g, '').replace(',', '.'));
            
            const newActual = Math.max(0, currentActual - amount);
            
            // Log para debuggear
            console.log(`Updating credit ${creditId}: ${currentActual} -> ${newActual}`);

            // Intentar guardar en la columna correcta
            if (row.get('Saldo_Actual') !== undefined) row.set('Saldo_Actual', newActual);
            else if (row.get('Saldo Actual') !== undefined) row.set('Saldo Actual', newActual);
            else if (row.get('saldo_actual') !== undefined) row.set('saldo_actual', newActual);
            
            await row.save();
            console.log('Credit row saved successfully');
        } else {
            console.warn(`Credit row with ID ${creditId} not found`);
        }

        // 2. Registrar en historial Abonos_Creditos_DB
        const historySheet = doc.sheetsByTitle['Abonos_Creditos_DB'];
        if (historySheet) {
            await historySheet.addRow({
                Fecha: new Date().toISOString().split('T')[0],
                Credito_ID: creditId,
                Monto: amount,
                Usuario: user || 'Andrés'
            });
        }

        // 3. Registrar como gasto en Transacciones_DB
        const transSheet = doc.sheetsByTitle['Transacciones_DB'];
        if (transSheet) {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            await transSheet.addRow({
                ID: `TRANS-${Date.now()}`,
                Fecha: new Date().toISOString().split('T')[0],
                Día: days[new Date().getDay()],
                Tipo: 'Abono Deuda',
                Categoría: 'Créditos',
                Descripción: `Abono a: ${row?.get('Nombre') || 'Crédito'}`,
                Monto: amount,
                Usuario: user || 'Andrés'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error en pago de crédito:', error);
        return NextResponse.json({ error: 'Error processing credit payment' }, { status: 500 });
    }
}
