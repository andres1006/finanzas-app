import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function POST(req: Request) {
    try {
        const { goalId, amount, user } = await req.json();
        const doc = await getDoc();
        
        // 1. Actualizar la meta en Metas_DB
        const goalSheet = doc.sheetsByTitle['Metas_DB'];
        if (!goalSheet) throw new Error('Metas_DB not found');

        const rows = await goalSheet.getRows();
        const row = rows.find(r => r.get('ID') === goalId || r.get('id') === goalId);
        
        if (row) {
            const currentActual = parseFloat(row.get('Monto_Actual') || row.get('Actual') || row.get('actual') || '0');
            const newActual = currentActual + amount;
            
            // Intentar actualizar usando diferentes nombres de columna comunes
            if (row.get('Monto_Actual') !== undefined) row.set('Monto_Actual', newActual);
            else if (row.get('Actual') !== undefined) row.set('Actual', newActual);
            else if (row.get('actual') !== undefined) row.set('actual', newActual);
            
            await row.save();
        }

        // 2. Registrar en historial Ahorros_Historial_DB
        const historySheet = doc.sheetsByTitle['Ahorros_Historial_DB'];
        if (historySheet) {
            await historySheet.addRow({
                Fecha: new Date().toISOString().split('T')[0],
                Meta_ID: goalId,
                Monto: amount,
                Usuario: user
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error en contribution:', error);
        return NextResponse.json({ error: 'Error processing contribution' }, { status: 500 });
    }
}
