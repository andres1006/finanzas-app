import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
            await sheet.setHeaderRow(['ID', 'Mes', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido', 'MontoPagado', 'Estado', 'FechaLimite']);
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
                montoPagado: parseFloat(row.get('MontoPagado') || '0'),
                categoria: row.get('Categoria'),
                estado: row.get('Estado') || 'PENDIENTE',
                diaSugerido: parseInt(row.get('DiaSugerido') || '1'),
                fechaLimite: row.get('FechaLimite') || '',
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

        const doc = await getDoc();
        let planSheet = doc.sheetsByTitle['Planeacion_Gastos'];

        if (!planSheet) {
            planSheet = await doc.addSheet({ title: 'Planeacion_Gastos' });
            await planSheet.setHeaderRow(['ID', 'Mes', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido', 'MontoPagado', 'Estado', 'FechaLimite']);
        }

        if (action === 'create_from_template') {
            const templateSheet = doc.sheetsByTitle['Plantilla_Gastos'];
            if (!templateSheet) {
                return NextResponse.json({ error: 'No existe plantilla para copiar' }, { status: 404 });
            }
            const templateRows = await templateSheet.getRows();

            const planRows = await planSheet.getRows();
            const existingConcepts = new Set(
                planRows
                    .filter(r => r.get('Mes') === month)
                    .map(r => r.get('Concepto').toLowerCase().trim())
            );

            const newItems = [];
            for (const tRow of templateRows) {
                const concepto = tRow.get('Concepto');
                if (!existingConcepts.has(concepto.toLowerCase().trim())) {
                    newItems.push({
                        ID: `PLAN-${month}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        Mes: month,
                        Concepto: concepto,
                        Categoria: tRow.get('Categoria'),
                        MontoEstimado: tRow.get('MontoEstimado'),
                        DiaSugerido: tRow.get('DiaSugerido'),
                        MontoPagado: '0',
                        Estado: 'PENDIENTE',
                        FechaLimite: tRow.get('FechaLimite') || ''
                    });
                }
            }

            if (newItems.length > 0) {
                await planSheet.addRows(newItems);
            }

            return NextResponse.json({
                success: true,
                message: newItems.length > 0
                    ? `Se cargaron ${newItems.length} items de la plantilla para ${month}.`
                    : `El plan para ${month} ya estaba completo.`
            });

        } else if (action === 'add_item') {
            const newId = `PLAN-${month}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            await planSheet.addRow({
                ID: newId,
                Mes: month,
                Concepto: item.concepto,
                MontoEstimado: item.montoEstimado,
                Categoria: item.categoria,
                DiaSugerido: item.diaSugerido,
                MontoPagado: item.montoPagado || '0',
                Estado: item.estado || 'PENDIENTE',
                FechaLimite: item.fechaLimite || '',
            });
            return NextResponse.json({ success: true, id: newId });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error: any) {
        console.error('Error in budget plan API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, month } = body;
        const updates = body.updates || body;

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Planeacion_Gastos'];

        if (!sheet) {
            return NextResponse.json({ error: 'Hoja de planeación no encontrada' }, { status: 404 });
        }

        const rows = await sheet.getRows();

        // Buscar por ID (preferido) o por concepto+mes
        const row = rows.find(r =>
            (id && r.get('ID') === id) ||
            (r.get('Mes') === month && r.get('Concepto') === (updates.Concepto || body.concepto))
        );

        if (!row) {
            return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
        }

        let newEstimado = parseFloat(row.get('MontoEstimado') || '0');
        let newPagado = parseFloat(row.get('MontoPagado') || '0');

        // Actualizar Monto Estimado
        if (updates.montoEstimado !== undefined || updates.MontoEstimado !== undefined) {
            newEstimado = parseFloat(updates.montoEstimado || updates.MontoEstimado);
            row.set('MontoEstimado', newEstimado.toString());
        }

        // Manejar Abono (Suma al pagado)
        if (updates.abono !== undefined) {
            newPagado += parseFloat(updates.abono);
            row.set('MontoPagado', newPagado.toString());
        } else if (updates.montoPagado !== undefined || updates.MontoPagado !== undefined) {
            newPagado = parseFloat(updates.montoPagado || updates.MontoPagado);
            row.set('MontoPagado', newPagado.toString());
        }

        // Recalcular Estado
        if (newPagado >= newEstimado && newEstimado > 0) {
            row.set('Estado', 'PAGADO');
        } else if (newPagado > 0) {
            row.set('Estado', 'PARCIAL');
        } else {
            row.set('Estado', 'PENDIENTE');
        }

        // Otros campos
        if (updates.categoria || updates.Categoria) row.set('Categoria', updates.categoria || updates.Categoria);
        if (updates.diaSugerido || updates.DiaSugerido) row.set('DiaSugerido', updates.diaSugerido || updates.DiaSugerido);
        if (updates.fechaLimite || updates.FechaLimite) row.set('FechaLimite', updates.fechaLimite || updates.FechaLimite);
        if (updates.concepto || updates.Concepto) row.set('Concepto', updates.concepto || updates.Concepto);

        await row.save();
        return NextResponse.json({ success: true, estado: row.get('Estado') });
    } catch (error: any) {
        console.error('Error updating plan item:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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
