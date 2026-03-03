import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Creditos_DB'];

        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Creditos_DB' });
            await sheet.setHeaderRow(['ID', 'Nombre', 'MontoTotal', 'SaldoActual', 'TasaInteres', 'PlazoMeses', 'FechaInicio', 'TipoTasa']);
        }

        const rows = await sheet.getRows();

        const credits = rows.map((row) => ({
            id: row.get('ID'),
            nombre: row.get('Nombre'),
            montoTotal: parseFloat(row.get('MontoTotal') || '0'),
            saldoActual: parseFloat(row.get('SaldoActual') || '0'),
            tasaInteres: parseFloat(row.get('TasaInteres') || '0'),
            plazoMeses: parseInt(row.get('PlazoMeses') || '0'),
            fechaInicio: row.get('FechaInicio'),
            tipoTasa: row.get('TipoTasa') || 'EA',
        }));

        return NextResponse.json(credits);
    } catch (error) {
        console.error('Error fetching credits:', error);
        return NextResponse.json(
            { error: 'Error al obtener créditos' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Creditos_DB'];

        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Creditos_DB' });
            await sheet.setHeaderRow(['ID', 'Nombre', 'MontoTotal', 'SaldoActual', 'TasaInteres', 'PlazoMeses', 'FechaInicio', 'TipoTasa']);
        }

        const id = `CRED-${Date.now()}`;

        await sheet.addRow({
            ID: id,
            Nombre: body.nombre,
            MontoTotal: body.montoTotal,
            SaldoActual: body.saldoActual,
            TasaInteres: body.tasaInteres,
            PlazoMeses: body.plazoMeses,
            FechaInicio: body.fechaInicio,
            TipoTasa: body.tipoTasa || 'EA',
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error adding credit:', error);
        return NextResponse.json(
            { error: 'Error al agregar crédito' },
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
        const sheet = doc.sheetsByTitle['Creditos_DB'];

        if (!sheet) return NextResponse.json({ error: 'Hoja no encontrada' }, { status: 404 });

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('ID') === id);

        if (row) {
            await row.delete();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Crédito no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting credit:', error);
        return NextResponse.json(
            { error: 'Error al eliminar crédito' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, nombre, montoTotal, saldoActual, tasaInteres, plazoMeses, fechaInicio, tipoTasa } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Creditos_DB'];

        if (!sheet) return NextResponse.json({ error: 'Hoja no encontrada' }, { status: 404 });

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('ID') === id);

        if (row) {
            row.set('Nombre', nombre);
            row.set('MontoTotal', montoTotal);
            row.set('SaldoActual', saldoActual);
            row.set('TasaInteres', tasaInteres);
            row.set('PlazoMeses', plazoMeses);
            row.set('FechaInicio', fechaInicio);
            row.set('TipoTasa', tipoTasa || 'EA');
            await row.save();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Crédito no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error updating credit:', error);
        return NextResponse.json(
            { error: 'Error al actualizar crédito' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, saldoActual } = body;

        if (!id || saldoActual === undefined) {
            return NextResponse.json({ error: 'ID y saldoActual son requeridos' }, { status: 400 });
        }

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Creditos_DB'];

        if (!sheet) return NextResponse.json({ error: 'Hoja no encontrada' }, { status: 404 });

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('ID') === id);

        if (row) {
            row.set('SaldoActual', saldoActual);
            await row.save();
            return NextResponse.json({ success: true, newSaldo: saldoActual });
        }

        return NextResponse.json({ error: 'Crédito no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error updating credit balance:', error);
        return NextResponse.json(
            { error: 'Error al actualizar saldo del crédito' },
            { status: 500 }
        );
    }
}
