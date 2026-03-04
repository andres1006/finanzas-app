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
        
        // Log exhaustivo para debuggear en el servidor
        console.log('--- DEBUG CREDITS HISTORY ---');
        console.log('Target Credit ID:', creditId);
        
        if (rows.length > 0) {
            console.log('Available Columns in History Sheet:', Object.keys(rows[0].toObject()));
        }

        const history = rows
            .filter(row => {
                const rawObj = row.toObject();
                // Buscamos el ID en cualquier columna que se parezca a Credito_ID
                const idInSheet = String(
                    rawObj['Credito_ID'] || 
                    rawObj['id_credito'] || 
                    rawObj['ID_Credito'] || 
                    rawObj['ID'] || 
                    rawObj['id'] || 
                    ''
                ).trim();
                
                const targetId = String(creditId).trim();
                const isMatch = idInSheet === targetId;
                
                if (isMatch) {
                    console.log(`MATCH FOUND: row ID [${idInSheet}] matches target [${targetId}]`);
                }
                
                return isMatch;
            })
            .map(row => {
                const rawObj = row.toObject();
                const rawDate = rawObj['Fecha'] || rawObj['fecha'] || '';
                const rawMonto = rawObj['Monto'] || rawObj['monto'] || '0';
                const rawUser = rawObj['Usuario'] || rawObj['usuario'] || 'Andrés';

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

        console.log(`Total items found for ${creditId}: ${history.length}`);
        console.log('-----------------------------');

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching credit history:', error);
        return NextResponse.json({ error: 'Error fetching history' }, { status: 500 });
    }
}
