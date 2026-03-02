import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const initialItems = [
    { concepto: "Arriendo", montoEstimado: 1200000, categoria: "Vivienda", diaSugerido: 1 },
    { concepto: "Agua", montoEstimado: 123000, categoria: "Servicios", diaSugerido: 1 },
    { concepto: "Administracion", montoEstimado: 177000, categoria: "Vivienda", diaSugerido: 1 },
    { concepto: "Pañales y Leche Martin", montoEstimado: 350000, categoria: "Varios", diaSugerido: 1 },
    { concepto: "Mercado", montoEstimado: 1500000, categoria: "Alimentación", diaSugerido: 1 },
    { concepto: "Algos Martin", montoEstimado: 100000, categoria: "Alimentación", diaSugerido: 1 },
    { concepto: "Gasolina", montoEstimado: 400000, categoria: "Transporte", diaSugerido: 1 },
    { concepto: "Credito Davivienda 1", montoEstimado: 450000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Éxito", montoEstimado: 320000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Sistecredito", montoEstimado: 423000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Addi", montoEstimado: 200000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Finandina Carro", montoEstimado: 3100000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Celular Andres", montoEstimado: 300000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Viaje Europa", montoEstimado: 3000000, categoria: "Deudas", diaSugerido: 1 },
    { concepto: "Plan Celular", montoEstimado: 80000, categoria: "Servicios", diaSugerido: 1 },
    { concepto: "PLan Celular mariana", montoEstimado: 76000, categoria: "Servicios", diaSugerido: 1 },
    { concepto: "Apple Icloud", montoEstimado: 60000, categoria: "Servicios", diaSugerido: 1 },
    { concepto: "Gymnacio Andres", montoEstimado: 120000, categoria: "Salud", diaSugerido: 1 },
    { concepto: "Gym Marianita", montoEstimado: 120000, categoria: "Salud", diaSugerido: 1 },
    { concepto: "Catcut y Adobe", montoEstimado: 100000, categoria: "Varios", diaSugerido: 1 },
    { concepto: "Google", montoEstimado: 80000, categoria: "Servicios", diaSugerido: 1 },
    { concepto: "Deporte Andres", montoEstimado: 180000, categoria: "Salud", diaSugerido: 1 },
];

async function seed() {
    console.log("Authenticating with Google Sheets...");

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !privateKey || !sheetId) {
        throw new Error("Missing environment variables. Make sure to run with --env-file=.env.local");
    }

    const serviceAccountAuth = new JWT({
        email: email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['Plantilla_Gastos'];
    if (!sheet) {
        console.log("Creating Plantilla_Gastos sheet...");
        sheet = await doc.addSheet({ title: 'Plantilla_Gastos' });
        await sheet.setHeaderRow(['ID', 'Concepto', 'MontoEstimado', 'Categoria', 'DiaSugerido']);
    }

    console.log("Checking for existing items...");
    const existingRows = await sheet.getRows();
    const existingConcepts = new Set(existingRows.map(r => r.get('Concepto')));

    console.log("Adding new items...");
    const timestamp = Date.now();
    for (const item of initialItems) {
        if (!existingConcepts.has(item.concepto)) {
            console.log(`Adding ${item.concepto}...`);
            await sheet.addRow({
                ID: `TMPL-${timestamp}-${Math.random().toString(36).substr(2, 5)}`,
                Concepto: item.concepto,
                MontoEstimado: item.montoEstimado,
                Categoria: item.categoria,
                DiaSugerido: item.diaSugerido,
            });
        } else {
            console.log(`${item.concepto} already exists, skipping.`);
        }
    }

    console.log("Seeding complete!");
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
