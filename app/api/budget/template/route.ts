import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Plantilla_Gastos'];

        // Si no existe, crearla
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Plantilla_Gastos' });
            await sheet.setHeaderRow(['ID', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido']);
        }

        const rows = await sheet.getRows();

        const templates = rows.map((row) => ({
            id: row.get('ID') || '',
            concepto: row.get('Concepto') || '',
            montoEstimado: parseFloat(row.get('MontoEstimado') || '0'),
            categoria: row.get('Categoria') || 'Vivienda',
            diaSugerido: parseInt(row.get('DiaSugerido') || '1'),
        }));

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Error al obtener la plantilla' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Plantilla_Gastos'];

        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Plantilla_Gastos' });
            await sheet.setHeaderRow(['ID', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido']);
        }

        const id = `TMPL-${Date.now()}`;

        await sheet.addRow({
            ID: id,
            Concepto: body.concepto,
            MontoEstimado: body.montoEstimado,
            Categoria: body.categoria || 'Varios',
            DiaSugerido: body.diaSugerido || 1,
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error adding template item:', error);
        return NextResponse.json(
            { error: 'Error al agregar item a la plantilla' },
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
        const sheet = doc.sheetsByTitle['Plantilla_Gastos'];

        if (!sheet) {
            return NextResponse.json({ error: 'Hoja no encontrada' }, { status: 404 });
        }

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('ID') === id);

        if (row) {
            await row.delete();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting template item:', error);
        return NextResponse.json(
            { error: 'Error al eliminar item' },
            { status: 500 }
        );
    }
}
