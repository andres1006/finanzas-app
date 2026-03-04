import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Metas_DB'];
        if (!sheet) return NextResponse.json([]);

        const rows = await sheet.getRows();
        const goals = rows.map((row) => ({
            id: row.get('ID') || '',
            nombre: row.get('Nombre') || '',
            montoObjetivo: parseFloat(row.get('Monto_Objetivo') || row.get('Objetivo') || '0'),
            montoActual: parseFloat(row.get('Monto_Actual') || row.get('Actual') || '0'),
            fechaLimite: row.get('Fecha_Limite') || '',
            prioridad: row.get('Prioridad') || 'Media',
            usuario: row.get('Usuario') || '',
        }));

        return NextResponse.json(goals);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching goals' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Metas_DB'];
        if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });

        await sheet.addRow({
            ID: `GOAL-${Date.now()}`,
            Nombre: body.nombre,
            Monto_Objetivo: body.montoObjetivo,
            Monto_Actual: body.montoActual,
            Fecha_Limite: body.fechaLimite,
            Prioridad: body.prioridad,
            Usuario: body.usuario || 'Andrés'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error saving goal' }, { status: 500 });
    }
}
