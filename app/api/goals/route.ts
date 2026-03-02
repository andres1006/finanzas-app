import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Metas_DB'];

        // Si no existe la hoja, crearla con headers por defecto
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Metas_DB' });
            await sheet.setHeaderRow(['ID', 'Nombre', 'MontoObjetivo', 'MontoActual', 'FechaLimite', 'Prioridad']);
        }

        const rows = await sheet.getRows();

        const goals = rows.map((row) => ({
            id: row.get('ID') || '',
            nombre: row.get('Nombre') || '',
            montoObjetivo: parseFloat(row.get('MontoObjetivo') || '0'),
            montoActual: parseFloat(row.get('MontoActual') || '0'),
            fechaLimite: row.get('FechaLimite') || '',
            prioridad: row.get('Prioridad') || 'Media',
        }));

        return NextResponse.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json(
            { error: 'Error al obtener las metas' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Metas_DB'];

        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Metas_DB' });
            await sheet.setHeaderRow(['ID', 'Nombre', 'MontoObjetivo', 'MontoActual', 'FechaLimite', 'Prioridad']);
        }

        const id = `GOAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const rowData = {
            ID: id,
            Nombre: body.nombre,
            MontoObjetivo: body.montoObjetivo,
            MontoActual: body.montoActual || 0,
            FechaLimite: body.fechaLimite,
            Prioridad: body.prioridad || 'Media',
        };

        await sheet.addRow(rowData);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error adding goal:', error);
        return NextResponse.json(
            { error: 'Error al agregar la meta' },
            { status: 500 }
        );
    }
}
