# 💰 Control Financiero - Andrés

Aplicación de gestión financiera personal con Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts y Google Sheets como base de datos.

## 🚀 Características

- ✅ **Registro de transacciones**: Gastos, Ingresos y Abonos a Deuda
- ✅ **Dashboard interactivo**: Visualización de totales y balance
- ✅ **Gráficas dinámicas**: Recharts con barras y pastel
- ✅ **Sincronización con Google Sheets**: Base de datos en tiempo real
- ✅ **Diseño responsive**: Móvil, tablet y desktop
- ✅ **Tema oscuro/claro**: Automático según preferencias del sistema
- ✅ **Formato COP**: Moneda colombiana

## 📋 Requisitos Previos

1. **Node.js** 18+ instalado
2. **Cuenta de Google Cloud** con:
   - API de Google Sheets habilitada
   - Cuenta de servicio creada
   - Archivo JSON de credenciales descargado

## 🔧 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Google Sheets

1. Crea una hoja de cálculo en Google Sheets
2. Crea una pestaña llamada `Transacciones_DB`
3. Agrega los siguientes encabezados en la primera fila:

| ID | Fecha | Tipo | Categoría | Descripción | Monto | Usuario |
|----|-------|------|-----------|-------------|-------|---------|

4. Comparte la hoja con el email de la cuenta de servicio (con permisos de Editor):
   ```
   finanzas-api@finanzas-481601.iam.gserviceaccount.com
   ```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GOOGLE_SHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Nota**: El `GOOGLE_SHEET_ID` está en la URL de tu hoja:
```
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
```

## 🏃 Ejecutar la aplicación

### Modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Modo producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
finanzas-app/
├── app/
│   ├── api/
│   │   └── transactions/
│   │       └── route.ts          # API Routes (GET/POST)
│   ├── globals.css               # Estilos globales + tema
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Dashboard principal
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   ├── FinanceCharts.tsx         # Gráficas con Recharts
│   ├── SummaryCards.tsx          # Tarjetas de resumen
│   ├── TransactionForm.tsx       # Formulario de registro
│   └── TransactionTable.tsx      # Tabla de movimientos
├── lib/
│   ├── financeUtils.ts           # Lógica financiera
│   ├── googleSheets.ts           # Conexión a Google Sheets
│   └── utils.ts                  # Utilidades generales
└── .env.local                    # Variables de entorno (no incluido en git)
```

## 🎨 Componentes

### TransactionForm
Formulario para registrar transacciones con:
- Tipo: Gasto 💸, Ingreso 💰, Abono Deuda 💳
- Usuario: Andrés 👨, Mariana 👩
- Categorías: Hogar 🏠, Alimentación 🍔, Transporte 🚗, etc.
- Validación de campos requeridos

### SummaryCards
Tarjetas mostrando:
- Total de Ingresos (verde)
- Total de Gastos (rojo)
- Abonos a Deudas (azul)
- Balance (verde/rojo según superávit/déficit)

### FinanceCharts
Gráficas con Recharts:
- **Barras**: Resumen financiero (Ingresos vs Gastos vs Abonos)
- **Pastel**: Distribución de gastos por categoría

### TransactionTable
Tabla responsive mostrando:
- Últimas 15 transacciones
- Fecha, descripción, categoría, usuario, monto
- Colores diferenciados por tipo

## 🔐 Seguridad

- ✅ Variables de entorno protegidas con `.gitignore`
- ✅ Credenciales de Google Cloud en `.env.local`
- ✅ API Routes con validación de datos
- ✅ Cuenta de servicio con permisos limitados

## 📊 Lógica Financiera

### Cálculo de Balance
```typescript
Balance = Total Ingresos - Total Gastos - Total Abonos a Deuda
```

### Método Bola de Nieve (implementado)
Función `calcularBolaDeNieve()` que ordena deudas por saldo menor y asigna dinero extra para pago acelerado.

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Componentes**: shadcn/ui + Radix UI
- **Gráficas**: Recharts
- **Iconos**: Lucide React
- **Base de datos**: Google Sheets
- **Autenticación**: Google Service Account (JWT)

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm start        # Servidor de producción
npm run lint     # Ejecutar ESLint
```

## 🐛 Solución de Problemas

### Error: "No se encontró la hoja Transacciones_DB"
- Verifica que la pestaña se llame exactamente `Transacciones_DB`
- Asegúrate de haber compartido la hoja con el email de la cuenta de servicio

### Error: "Error al cargar transacciones"
- Verifica que las variables de entorno estén configuradas correctamente
- Revisa que el `GOOGLE_PRIVATE_KEY` incluya los `\n` correctamente
- Confirma que la API de Google Sheets esté habilitada en Google Cloud

### Error de compilación TypeScript
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
- Verifica que estés usando Node.js 18+

## 🚀 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa el repositorio en Vercel
3. Configura las variables de entorno en el panel de Vercel:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
4. Deploy automático ✨

## 📄 Licencia

Este proyecto es de uso personal.

## 👥 Autores

Desarrollado para Andrés

---

**¿Necesitas ayuda?** Revisa la documentación en `walkthrough.md` o el plan de implementación en `implementation_plan.md`
