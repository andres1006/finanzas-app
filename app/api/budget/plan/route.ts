import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');

        if (!month) {
            return NextResponse.json({ error: 'Month param requerido (YYYY-MM)' }, { status: 400 });
        }

        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Planeacion_Gastos'];

        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Planeacion_Gastos' });
            await sheet.setHeaderRow(['ID', 'Mes', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido']);
        }

        const rows = await sheet.getRows();

        // Filtrar por el mes solicitado
        const planItems = rows
            .filter(row => row.get('Mes') === month)
            .map((row) => ({
                id: row.get('ID'),
                mes: row.get('Mes'),
                concepto: row.get('Concepto'),
                montoEstimado: parseFloat(row.get('MontoEstimado') || '0'),
                categoria: row.get('Categoria'),
                diaSugerido: parseInt(row.get('DiaSugerido') || '1'),
            }));

        return NextResponse.json(planItems);
    } catch (error) {
        console.error('Error fetching plan:', error);
        return NextResponse.json(
            { error: 'Error al obtener la planeación' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, month, item } = body;
        // action: 'create_from_template' | 'add_item'

        const doc = await getDoc();
        let planSheet = doc.sheetsByTitle['Planeacion_Gastos'];

        if (!planSheet) {
            planSheet = await doc.addSheet({ title: 'Planeacion_Gastos' });
            await planSheet.setHeaderRow(['ID', 'Mes', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido']);
        }

        if (action === 'create_from_template') {
            // Conseguir la plantilla
            const templateSheet = doc.sheetsByTitle['Plantilla_Gastos'];
            if (!templateSheet) {
                return NextResponse.json({ error: 'No existe plantilla para copiar' }, { status: 404 });
            }
            const templateRows = await templateSheet.getRows();

            // Copiar cada item a la hoja de planeación
            for (const tRow of templateRows) {
                const newId = `PLAN-${month}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                await planSheet.addRow({
                    ID: newId,
                    Mes: month,
                    Concepto: tRow.get('Concepto'),
                    MontoEstimado: tRow.get('MontoEstimado'),
                    Categoria: tRow.get('Categoria'),
                    DiaSugerido: tRow.get('DiaSugerido'),
                });
            }
            return NextResponse.json({ success: true, message: 'Plan creado desde plantilla' });

        } else if (action === 'add_item') {
            const newId = `PLAN-${month}-${Date.now()}`;
            await planSheet.addRow({
                ID: newId,
                Mes: month,
                Concepto: item.concepto,
                MontoEstimado: item.montoEstimado,
                Categoria: item.categoria,
                DiaSugerido: item.diaSugerido,
            });
            return NextResponse.json({ success: true, id: newId });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el plan' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Planeacion_Gastos'];

        if (!sheet) return NextResponse.json({ error: 'Hoja no encontrada' }, { status: 404 });

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('ID') === id);

        if (row) {
            await row.delete();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting plan item:', error);
        return NextResponse.json(
            { error: 'Error al eliminar item del plan' },
            { status: 500 }
        );
    }
}
