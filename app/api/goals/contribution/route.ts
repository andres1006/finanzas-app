import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { goalId, amount, user } = body;

        const doc = await getDoc();
        
        // 1. Actualizar el monto en Metas_DB
        const goalsSheet = doc.sheetsByTitle['Metas_DB'];
        const goalsRows = await goalsSheet.getRows();
        const goalRow = goalsRows.find(r => r.get('ID') === goalId);

        if (!goalRow) {
            return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
        }

        const currentAmount = parseFloat(goalRow.get('Actual') || '0');
        goalRow.set('Actual', (currentAmount + parseFloat(amount)).toString());
        await goalRow.save();

        // 2. Registrar en el historial (Ahorros_Historial_DB)
        const historySheet = doc.sheetsByTitle['Ahorros_Historial_DB'];
        if (historySheet) {
            await historySheet.addRow({
                ID: `SAV-${Date.now()}`,
                Meta_ID: goalId,
                Fecha: new Date().toISOString().split('T')[0],
                Monto: amount,
                Usuario: user
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in contribution:', error);
        return NextResponse.json({ error: 'Error al procesar el ahorro' }, { status: 500 });
    }
}
