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
        
        // Búsqueda bruta: cualquier fila donde el creditId aparezca en alguna celda
        const row = rows.find(r => {
            const values = Object.values(r.toObject()).map(v => String(v).trim());
            return values.includes(String(creditId).trim());
        });
        
        if (row) {
            const raw = row.toObject();
            const keys = Object.keys(raw);
            
            // Encontrar la columna del saldo actual (que contenga "saldo" y "actual")
            const saldoKey = keys.find(k => k.toLowerCase().includes('saldo') && k.toLowerCase().includes('actual')) 
                          || keys.find(k => k.toLowerCase().includes('actual'))
                          || 'Saldo_Actual';

            const currentVal = parseFloat(String(raw[saldoKey] || '0').replace(/[$.]/g, '').replace(',', '.'));
            const newVal = Math.max(0, currentVal - amount);
            
            row.set(saldoKey, newVal);
            await row.save();
        }

        // 2. Registrar en historial Abonos_Creditos_DB
        const historySheet = doc.sheetsByTitle['Abonos_Creditos_DB'];
        if (historySheet) {
            await historySheet.loadHeaderRow();
            const headers = historySheet.headerValues;
            
            const findH = (p: string) => headers.find(h => h.toLowerCase().includes(p.toLowerCase()));
            
            const newRow: any = {};
            const idCol = findH('credito') || findH('id') || headers[1];
            const dateCol = findH('fecha') || headers[0];
            const montoCol = findH('monto') || findH('valor') || headers[2];
            const userCol = findH('usuario') || headers[3];

            if (idCol) newRow[idCol] = creditId;
            if (dateCol) newRow[dateCol] = new Date().toISOString().split('T')[0];
            if (montoCol) newRow[montoCol] = amount;
            if (userCol) newRow[userCol] = user || 'Andrés';

            await historySheet.addRow(newRow);
        }

        // 3. Transacciones_DB
        const transSheet = doc.sheetsByTitle['Transacciones_DB'];
        if (transSheet) {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            await transSheet.addRow({
                ID: `TRANS-${Date.now()}`,
                Fecha: new Date().toISOString().split('T')[0],
                Día: days[new Date().getDay()],
                Tipo: 'Abono Deuda',
                Categoría: 'Créditos',
                Descripción: `Abono a Crédito`,
                Monto: amount,
                Usuario: user || 'Andrés'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error payment:', error);
        return NextResponse.json({ error: 'Error processing' }, { status: 500 });
    }
}
