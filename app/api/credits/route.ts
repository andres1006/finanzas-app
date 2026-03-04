import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Creditos_DB'];
        if (!sheet) return NextResponse.json([]);

        const rows = await sheet.getRows();
        
        // --- DEBUG LOGS FOR PATRONCITO ---
        console.log('--- DEBUG CREDITS DATA ---');
        rows.forEach((row, i) => {
            console.log(`Row ${i} raw object:`, row.toObject());
        });

        const credits = rows.map((row) => {
            const rawData = row.toObject();
            
            // Helper to find value by flexible name
            const getVal = (patterns: string[], defaultVal: any) => {
                const key = Object.keys(rawData).find(k => 
                    patterns.some(p => k.toLowerCase().includes(p.toLowerCase()))
                );
                return key ? rawData[key] : defaultVal;
            };

            return {
                id: getVal(['id'], ''),
                nombre: getVal(['nombre', 'meta', 'credito'], 'Sin nombre'),
                montoTotal: parseFloat(String(getVal(['total', 'monto'], '0')).replace(/[$.]/g, '').replace(',', '.')),
                saldoActual: parseFloat(String(getVal(['actual', 'saldo'], '0')).replace(/[$.]/g, '').replace(',', '.')),
                tasaInteres: parseFloat(String(getVal(['tasa', 'interes'], '0')).replace(/[$.]/g, '').replace(',', '.')),
                pagoMinimo: parseFloat(String(getVal(['pago', 'minimo'], '0')).replace(/[$.]/g, '').replace(',', '.')),
                fechaCorte: String(getVal(['corte', 'fecha'], '1')),
                plazoMeses: parseInt(String(getVal(['plazo', 'meses'], '12'))),
                usuario: getVal(['usuario', 'user'], 'Andrés'),
            };
        });

        return NextResponse.json(credits);
    } catch (error) {
        console.error('Error fetching credits:', error);
        return NextResponse.json({ error: 'Error fetching credits' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Creditos_DB'];
        if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        const findH = (p: string) => headers.find(h => h.toLowerCase().includes(p.toLowerCase()));

        const newRow: any = {};
        const colMap: Record<string, any> = {
            'id': `CRED-${Date.now()}`,
            'nombre': body.nombre,
            'total': body.montoTotal,
            'actual': body.saldoActual,
            'tasa': body.tasaInteres,
            'minimo': body.pagoMinimo || 0,
            'corte': body.fechaCorte,
            'plazo': body.plazoMeses,
            'usuario': body.usuario || 'Andrés'
        };

        headers.forEach(h => {
            const hLower = h.toLowerCase();
            for (const [key, val] of Object.entries(colMap)) {
                if (hLower.includes(key)) {
                    newRow[h] = val;
                    break;
                }
            }
        });

        await sheet.addRow(newRow);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error saving' }, { status: 500 });
    }
}
