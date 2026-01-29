
# Investigación: Mejores Prácticas en Apps de Finanzas Personales 📊

Este documento resume la investigación realizada para definir las funcionalidades y la experiencia de usuario (UX) de esta aplicación, basándose en el análisis de líderes del mercado como **Wallet (BudgetBakers)**, **Bluecoins**, **Monefy** y **YNAB**.

## 1. Gestión de Tarjetas de Crédito 💳
El mayor desafío en las apps de finanzas es el manejo de créditos.
*   **Problema Común**: Muchas apps tratan el gasto con tarjeta como una salida de dinero inmediata, lo cual descuadra el saldo real en bancos.
*   **Solución Adoptada**:
    *   Implementamos un modelo de doble entrada para créditos.
    *   Un **Gasto con Tarjeta** (ej. Cena $50) -> Aumenta la **Deuda** en $50, pero **NO** reduce el saldo de Efectivo/Banco.
    *   El **Pago de la Tarjeta** se registra como una **Transferencia** (Banco -> Tarjeta), lo cual reduce la deuda.
    *   Esto permite distinguir entre "Consumo" (gasto real devengado) y "Flujo de Caja" (movimiento de dinero).

## 2. Filosofía "Local-First" vs Cloud ☁️
*   **Inicialmente**: Se optó por `localStorage` para privacidad total y velocidad extrema.
*   **Evolución**: Se migró a **Supabase** para permitir:
    *   Seguridad y respaldo (evitar pérdida de datos al borrar caché).
    *   Acceso multidispositivo.
    *   Manteniendo la privacidad mediante RLS (Row Level Security), asegurando que cada usuario solo acceda a sus propios registros.

## 3. Experiencia de Usuario (UX) Móvil 📱
*   **Barra de Navegación Inferior**: Esencial para el uso con una sola mano en pantallas grandes.
*   **Botón Flotante (FAB)**: Acceso rápido a la acción más frecuente (Añadir Transacción).
*   **Modales vs Páginas**: Uso extensivo de "Drawers" (paneles deslizantes) y Modales para ediciones rápidas sin perder el contexto de la pantalla de fondo.

## 4. Métricas Clave para el Dashboard 📈
Según la teoría de finanzas personales, los 3 pilares visibles deben ser:
1.  **Balance Total**: ¿Cuánto tengo realmente? (Activos - Pasivos).
2.  **Flujo Mensual**: Ingresos vs Gastos del mes en curso.
3.  **Presupuesto por Categoría**: Alertas visuales cuando se acerca al límite de gasto en rubros críticos (Comida, Transporte).

Esta investigación fundamentó la arquitectura actual de la aplicación, priorizando la precisión contable (especialmente en créditos) y la facilidad de uso móvil.
