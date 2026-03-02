import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Transacciones_DB'];

        if (!sheet) {
            return NextResponse.json(
                { error: 'No se encontró la hoja "Transacciones_DB"' },
                { status: 404 }
            );
        }

        const rows = await sheet.getRows();

        const transactions = rows.map((row) => ({
            id: row.get('ID') || '',
            fecha: row.get('Fecha') || '',
            tipo: row.get('Tipo') || '',
            categoria: row.get('Categoría') || '',
            descripcion: row.get('Descripción') || '',
            monto: parseFloat(row.get('Monto') || '0'),
            usuario: row.get('Usuario') || '',
        }));

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Error al obtener las transacciones' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Transacciones_DB'];

        if (!sheet) {
            return NextResponse.json(
                { error: 'No se encontró la hoja "Transacciones_DB"' },
                { status: 404 }
            );
        }

        // Generar ID único
        const id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Fecha actual en formato YYYY-MM-DD
        // Usar la fecha recibida o la actual si no existe
        const fechaObj = body.Fecha ? new Date(body.Fecha) : new Date();
        const fecha = fechaObj.toISOString().split('T')[0];

        // Calcular el nombre del día
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombre = diasSemana[fechaObj.getUTCDay()];

        // Prepare row object
        const rowData: Record<string, string | number> = {
            ID: id,
            Fecha: fecha,
            Tipo: body.Tipo || '',
            Categoría: body.Categoría || '',
            Descripción: body.Descripción || '',
            Monto: body.Monto || 0,
            Usuario: body.Usuario || '',
        };

        // Check if header 'Día' exists before adding it to avoid crash if user hasn't updated sheet
        await sheet.loadHeaderRow(); // Ensure headers are loaded
        const headers = sheet.headerValues;

        if (headers.includes('Día')) {
            rowData['Día'] = diaNombre;
        } else {
            console.warn("Column 'Día' missing in Google Sheet. Skipping value.");
        }

        await sheet.addRow(rowData);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error adding transaction:', error);
        return NextResponse.json(
            { error: 'Error al agregar la transacción' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID es requerido' },
                { status: 400 }
            );
        }

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Transacciones_DB'];

        if (!sheet) {
            return NextResponse.json(
                { error: 'No se encontró la hoja "Transacciones_DB"' },
                { status: 404 }
            );
        }

        const rows = await sheet.getRows();
        const row = rows.find((r) => r.get('ID') === id);

        if (!row) {
            return NextResponse.json(
                { error: 'Transacción no encontrada' },
                { status: 404 }
            );
        }

        await row.delete();

        return NextResponse.json({ success: true, message: 'Transacción eliminada' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json(
            { error: 'Error al eliminar la transacción' },
            { status: 500 }
        );
    }
}
