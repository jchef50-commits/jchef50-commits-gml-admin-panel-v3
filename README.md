# GML Viajes y Tours - Panel de Administración v2.0

Este es el panel administrativo avanzado para la gestión de cotizaciones de viajes, diseñado específicamente para **GML Viajes y Tours** en Villahermosa, Tabasco.

## 🚀 Funcionalidades

- **Dashboard Dinámico:** Resumen de actividad, ingresos y estadísticas de destinos.
- **Cotizador de 5 pasos:** Proceso guiado para generar propuestas profesionales.
- **Historial Avanzado:** Gestión total de cotizaciones (Editar, Eliminar, Cambiar Estado).
- **Integración con WhatsApp:** Envío directo de propuestas al cliente.
- **Gestión de Clientes:** Base de datos automática basada en cotizaciones.
- **Calendario de Viajes:** Vista mensual de salidas y estancias.
- **Modo Oscuro/Claro:** Interfaz adaptable.
- **Respaldo de Datos:** Exportación e importación en formato JSON y CSV.

## 🛠️ Tecnologías Usadas

- **React + Vite**
- **Tailwind CSS**
- **Lucide React** (Iconografía)
- **Recharts** (Gráficos)
- **Date-fns** (Gestión de fechas)

## 📦 Instalación Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/gml-admin-panel.git
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar modo desarrollo:
   ```bash
   npm run dev
   ```
4. Construir para producción:
   ```bash
   npm run build
   ```

## 🔒 Almacenamiento
Este panel utiliza `localStorage` para guardar los datos en el navegador. Para mayor seguridad, utiliza la función de **Exportar Respaldo** en la sección de Configuración periódicamente.

---
Desarrollado para GML Viajes y Tours.
