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
            const rawData = row.toObject();
            
            // Debug logs to see what's actually coming from the sheet
            console.log('Row raw data:', rawData);

            // Mapping with case-insensitive fallback and underscore tolerance
            const getValue = (keys: string[]) => {
                for (const key of keys) {
                    if (rawData[key] !== undefined) return rawData[key];
                }
                return undefined;
            };

            const goal = {
                id: getValue(['ID', 'id', 'Id']) || `GOAL-${Math.random().toString(36).substr(2, 9)}`,
                nombre: getValue(['Nombre', 'nombre', 'Name', 'Meta']) || 'Sin nombre',
                montoObjetivo: parseFloat(getValue(['Monto_Objetivo', 'Objetivo', 'montoObjetivo', 'objetivo', 'Monto Objetivo', 'MontoObjetivo']) || '0'),
                montoActual: parseFloat(getValue(['Monto_Actual', 'Actual', 'montoActual', 'actual', 'Monto Actual', 'MontoActual']) || '0'),
                fechaLimite: getValue(['Fecha_Limite', 'Limite', 'fechaLimite', 'limite', 'Fecha Limite', 'Fecha_limite']) || '',
                prioridad: getValue(['Prioridad', 'prioridad', 'Priority']) || 'Media',
                usuario: getValue(['Usuario', 'usuario', 'User']) || 'Andrés',
            };

            return goal;
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

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        
        const newRow: any = {};
        
        // Helper to find correct header name regardless of case/format
        const findHeader = (names: string[]) => headers.find(h => names.some(n => n.toLowerCase() === h.toLowerCase().replace(/_/g, ' ')));

        const idHeader = findHeader(['ID', 'id']);
        const nombreHeader = findHeader(['Nombre', 'Meta', 'nombre']);
        const objHeader = findHeader(['Monto_Objetivo', 'Objetivo', 'monto_objetivo']);
        const actHeader = findHeader(['Monto_Actual', 'Actual', 'monto_actual']);
        const limHeader = findHeader(['Fecha_Limite', 'Limite', 'fecha_limite']);
        const prioHeader = findHeader(['Prioridad', 'prioridad']);
        const userHeader = findHeader(['Usuario', 'usuario']);

        if (idHeader) newRow[idHeader] = `GOAL-${Date.now()}`;
        if (nombreHeader) newRow[nombreHeader] = body.nombre;
        if (objHeader) newRow[objHeader] = body.montoObjetivo;
        if (actHeader) newRow[actHeader] = body.montoActual;
        if (limHeader) newRow[limHeader] = body.fechaLimite;
        if (prioHeader) newRow[prioHeader] = body.prioridad;
        if (userHeader) newRow[userHeader] = body.usuario || 'Andrés';

        await sheet.addRow(newRow);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error en POST /api/goals:', error);
        return NextResponse.json({ error: 'Error saving goal' }, { status: 500 });
    }
}
