
# Finance App - Control Financiero Personal 💰

Aplicación web de finanzas personales "Mobile-First" construida con **React**, **TypeScript** y **Supabase**. Diseñada para registrar ingresos, gastos, transferencias, metas de ahorro y deudas, con un enfoque especial en el manejo correcto de tarjetas de crédito.

## 🚀 Tecnologías

*   **Frontend**: React (Vite), TypeScript, TailwindCSS.
*   **Backend / Base de Datos**: Supabase (PostgreSQL, Auth, RLS).
*   **Estado Global**: React Context API.
*   **Iconos**: Lucide React.

## ✨ Funcionalidades Principales

*   **Dashboard**: Resumen financiero con balance total, gastos del mes y alertas de presupuesto.
*   **Gestión de Cuentas**: Soporte para efectivo, cuentas bancarias y tarjetas de crédito.
*   **Movimientos**: Registro de ingresos, gastos y transferencias.
    *   *Lógica de Tarjeta de Crédito*: Al registrar un gasto con tarjeta, se crea/actualiza automáticamente una deuda correspondiente, sin descontar dinero de las cuentas de efectivo.
*   **Metas de Ahorro**: Seguimiento visual del progreso de ahorro.
*   **Seguridad**: Autenticación de usuarios y protección de datos mediante Row Level Security (RLS) de Supabase.

## 🛠️ Configuración e Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/finance-app.git
    cd finance-app
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=https://tu-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=tu-anon-key
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

## 🗄️ Esquema de Base de Datos (Supabase)

El proyecto requiere las siguientes tablas en Supabase:

*   `profiles`: Información del usuario.
*   `accounts`: Cuentas financieras.
*   `transactions`: Historial de movimientos.
*   `categories`: Categorías de gastos/ingresos.
*   `debts`: Deudas y control de tarjetas de crédito.
*   `goals`: Metas de ahorro.

*(Se incluye script SQL de migración en `db/schema.sql` si aplica)*.
