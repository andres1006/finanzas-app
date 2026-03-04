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
            .filter(row => {
                const raw = row.toObject();
                // Buscamos el valor en CUALQUIER columna que contenga el ID del crédito
                const values = Object.values(raw).map(v => String(v).trim());
                const target = String(creditId).trim();
                
                // Si el ID del crédito aparece en cualquier celda de la fila, lo incluimos
                // (Es una búsqueda bruta para bypass problemas de nombres de columnas)
                return values.includes(target);
            })
            .map(row => {
                const raw = row.toObject();
                // Buscamos monto y fecha por patrones de nombre
                const getByPattern = (patterns: string[]) => {
                    const keys = Object.keys(raw);
                    const match = keys.find(k => patterns.some(p => k.toLowerCase().includes(p.toLowerCase())));
                    return match ? raw[match] : null;
                };

                const rawDate = getByPattern(['fecha', 'date']) || '';
                const rawMonto = getByPattern(['monto', 'amount', 'valor', 'pago']) || '0';
                const rawUser = getByPattern(['usuario', 'user', 'nombre']) || 'Andrés';

                return {
                    fecha: rawDate,
                    monto: parseFloat(String(rawMonto).replace(/[$.]/g, '').replace(',', '.')),
                    usuario: rawUser
                };
            })
            .sort((a, b) => {
                try {
                    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                } catch (e) {
                    return 0;
                }
            });

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Error fetching history' }, { status: 500 });
    }
}
