import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Metas_DB'];
        if (!sheet) {
            console.error('Hoja Metas_DB no encontrada');
            return NextResponse.json([]);
        }

        // --- AUTOMATIC HEADER SYNC ---
        // Esto forzará que el Excel tenga los nombres exactos que el código espera
        try {
            await sheet.setHeaderRow(['ID', 'Nombre', 'Monto_Objetivo', 'Monto_Actual', 'Fecha_Limite', 'Prioridad', 'Usuario']);
        } catch (e) {
            console.warn('No se pudieron actualizar los headers, procediendo con lectura.');
        }

        const rows = await sheet.getRows();
        const goals = rows.map((row) => {
            const rawData = row.toObject();
            
            return {
                id: rawData.ID || '',
                nombre: rawData.Nombre || 'Sin nombre',
                montoObjetivo: parseFloat(rawData.Monto_Objetivo || '0'),
                montoActual: parseFloat(rawData.Monto_Actual || '0'),
                fechaLimite: rawData.Fecha_Limite || '',
                prioridad: rawData.Prioridad || 'Media',
                usuario: rawData.Usuario || 'Andrés',
            };
        });

        return NextResponse.json(goals);
    } catch (error) {
        console.error('Error en GET /api/goals:', error);
        return NextResponse.json({ error: 'Error fetching goals' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Metas_DB'];
        if (!sheet) return NextResponse.json({ error: 'Sheet Metas_DB not found' }, { status: 404 });

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
        console.error('Error en POST /api/goals:', error);
        return NextResponse.json({ error: 'Error saving goal' }, { status: 500 });
    }
}
