import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Creditos_DB'];
        if (!sheet) return NextResponse.json([]);

        const rows = await sheet.getRows();
        const credits = rows.map((row) => {
            const rawData = row.toObject();
            return {
                id: rawData.ID || rawData.id || '',
                nombre: rawData.Nombre || rawData.nombre || 'Sin nombre',
                montoTotal: parseFloat(rawData.Saldo_Total || rawData.Monto_Total || rawData.montoTotal || '0'),
                saldoActual: parseFloat(rawData.Saldo_Actual || rawData.Saldo_Actual || rawData.saldoActual || '0'),
                tasaInteres: parseFloat(rawData.Tasa_Interes || rawData.tasaInteres || '0'),
                pagoMinimo: parseFloat(rawData.Pago_Minimo || rawData.pagoMinimo || '0'),
                fechaCorte: rawData.Fecha_Corte || rawData.fechaCorte || '1',
                plazoMeses: parseInt(rawData.Plazo_Meses || rawData.plazoMeses || '12'),
                usuario: rawData.Usuario || rawData.usuario || 'Andrés',
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
        if (!sheet) return NextResponse.json({ error: 'Sheet Creditos_DB not found' }, { status: 404 });

        await sheet.addRow({
            ID: `CRED-${Date.now()}`,
            Nombre: body.nombre,
            Saldo_Total: body.montoTotal,
            Saldo_Actual: body.saldoActual,
            Tasa_Interes: body.tasaInteres,
            Pago_Minimo: body.pagoMinimo || 0,
            Fecha_Corte: body.fechaCorte,
            Plazo_Meses: body.plazoMeses,
            Usuario: body.usuario || 'Andrés'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving credit:', error);
        return NextResponse.json({ error: 'Error saving credit' }, { status: 500 });
    }
}
