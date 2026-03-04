import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const creditId = searchParams.get('creditId');
        
        if (!creditId) return NextResponse.json({ error: 'Missing creditId' }, { status: 400 });

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Abonos_Creditos_DB'];
        if (!sheet) return NextResponse.json([]);

        const rows = await sheet.getRows();
        const history = rows
            .filter(row => row.get('Credito_ID') === creditId || row.get('id_credito') === creditId)
            .map(row => ({
                fecha: row.get('Fecha'),
                monto: parseFloat(row.get('Monto') || '0'),
                usuario: row.get('Usuario')
            }))
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching credit history:', error);
        return NextResponse.json({ error: 'Error fetching history' }, { status: 500 });
    }
}
