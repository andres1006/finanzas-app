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

        const rows = await sheet.getRows();
        const goals = rows.map((row) => {
            // Log para debuggear nombres de columnas reales
            const rawData = row.toObject();
            
            return {
                id: rawData.ID || rawData.id || '',
                nombre: rawData.Nombre || rawData.nombre || 'Sin nombre',
                montoObjetivo: parseFloat(rawData.Monto_Objetivo || rawData.Objetivo || rawData.montoObjetivo || '0'),
                montoActual: parseFloat(rawData.Monto_Actual || rawData.Actual || rawData.montoActual || '0'),
                fechaLimite: rawData.Fecha_Limite || rawData.Limite || rawData.fechaLimite || '',
                prioridad: rawData.Prioridad || rawData.prioridad || 'Media',
                usuario: rawData.Usuario || rawData.usuario || 'Andrés',
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

        // Intentamos detectar las columnas para usar el nombre exacto
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        
        const newRow: any = {};
        if (headers.includes('ID')) newRow.ID = `GOAL-${Date.now()}`;
        if (headers.includes('Nombre')) newRow.Nombre = body.nombre;
        if (headers.includes('Monto_Objetivo')) newRow.Monto_Objetivo = body.montoObjetivo;
        if (headers.includes('Monto_Actual')) newRow.Monto_Actual = body.montoActual;
        if (headers.includes('Fecha_Limite')) newRow.Fecha_Limite = body.fechaLimite;
        if (headers.includes('Prioridad')) newRow.Prioridad = body.prioridad;
        if (headers.includes('Usuario')) newRow.Usuario = body.usuario || 'Andrés';

        // Si los headers son minúsculas
        if (headers.includes('id')) newRow.id = `GOAL-${Date.now()}`;
        if (headers.includes('nombre')) newRow.nombre = body.nombre;
        if (headers.includes('objetivo')) newRow.objetivo = body.montoObjetivo;
        if (headers.includes('actual')) newRow.actual = body.montoActual;
        if (headers.includes('limite')) newRow.limite = body.fechaLimite;
        if (headers.includes('prioridad')) newRow.prioridad = body.prioridad;
        if (headers.includes('usuario')) newRow.usuario = body.usuario || 'Andrés';

        await sheet.addRow(newRow);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error en POST /api/goals:', error);
        return NextResponse.json({ error: 'Error saving goal' }, { status: 500 });
    }
}
