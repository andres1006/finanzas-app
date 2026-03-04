import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/googleSheets';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const creditId = searchParams.get('creditId');
        
        if (!creditId) return NextResponse.json({ error: 'Missing creditId' }, { status: 400 });

        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['Abonos_Creditos_DB'];
        if (!sheet) {
            console.error('Hoja Abonos_Creditos_DB no encontrada');
            return NextResponse.json([]);
        }

        const rows = await sheet.getRows();
        
        // Log para ver qué datos están llegando realmente
        console.log(`Buscando historial para crédito: ${creditId}. Total filas en historial: ${rows.length}`);

        const history = rows
            .filter(row => {
                const idInSheet = String(row.get('Credito_ID') || row.get('id_credito') || row.get('ID_Credito') || '').trim();
                const targetId = String(creditId).trim();
                
                // Debug individual de cada fila si es necesario
                // console.log(`Comparando sheet[${idInSheet}] con target[${targetId}]`);
                
                return idInSheet === targetId;
            })
            .map(row => {
                const rawDate = row.get('Fecha') || '';
                return {
                    fecha: rawDate,
                    monto: parseFloat(String(row.get('Monto') || '0').replace(/[$.]/g, '').replace(',', '.')),
                    usuario: row.get('Usuario') || 'Andrés'
                };
            })
            .sort((a, b) => {
                try {
                    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                } catch (e) {
                    return 0;
                }
            });

        console.log(`Historial encontrado: ${history.length} abonos.`);
        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching credit history:', error);
        return NextResponse.json({ error: 'Error fetching history' }, { status: 500 });
    }
}
