# Compify 🖥️💰

Compify es una plataforma integral para la comparación de precios de laptops y componentes de PC en México. Permite a los usuarios encontrar las mejores ofertas entre múltiples tiendas (Cyberpuerta, Elektra, BajaPC, etc.) y armar su PC ideal asegurando la compatibilidad entre componentes.

## 🚀 Características Principales

*   **Comparador de Precios**: Busca laptops y componentes y ve instantáneamente en qué tienda está más barato.
*   **Armador de PC (Builder)**: Herramienta interactiva para seleccionar componentes. Incluye validación automática de compatibilidad (Socket CPU/Motherboard, Tipo de RAM, Potencia de Fuente, etc.).
*   **Agrupación Inteligente**: El sistema agrupa automáticamente productos idénticos de diferentes tiendas para facilitar la comparación.
*   **Dashboard de Administración**: Panel para gestionar manualmente la agrupación de productos y limpiar la base de datos.
*   **Scraping Automatizado**: Scripts en Python para mantener los precios actualizados desde las tiendas soportadas.

## 🛠️ Tecnologías Utilizadas

*   **Frontend**: React.js, Vite, Tailwind CSS.
*   **Backend**: Laravel 11 (PHP), MySQL.
*   **Data Collection**: Python (BeautifulSoup, Requests).
*   **Base de Datos**: MySQL.

## 📋 Requisitos Previos

*   PHP >= 8.2
*   Composer
*   Node.js & npm
*   Python 3.x
*   MySQL Server

## ⚙️ Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/garciatarelo/compify.git
cd compify/compify
```

### 2. Configuración del Backend (Laravel)

```bash
cd "backend API"
composer install
cp .env.example .env
# Configura tus credenciales de base de datos en el archivo .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
El backend correrá en `http://127.0.0.1:8000`.

### 3. Configuración del Frontend (React)

```bash
cd ../comparer-react
npm install
npm run dev
```
El frontend correrá generalmente en `http://localhost:5173`.

### 4. Carga de Datos (Scraping)

Para poblar la base de datos con productos reales, ejecuta los scripts de Python ubicados en la carpeta `api`. Asegúrate de que el servidor de Laravel esté corriendo.

```bash
cd ../api
pip install requests beautifulsoup4
python ApiElektra.py
python ApiCyberpuerta.py
python ApiCyberpuertaComponents.py
python ApiBajaPCComponents.py
```

## 📖 Guía de Uso

### Comparador de Laptops
1.  Navega a la página principal.
2.  Usa los filtros de marca, precio o el buscador.
3.  Las tarjetas mostrarán el producto y una lista de tiendas con sus precios ordenados.

### Armador de PC
1.  Ve a la sección "Armar PC".
2.  Selecciona componentes categoría por categoría.
3.  El sistema te alertará si eliges componentes incompatibles (ej. CPU Intel con Motherboard AMD).
4.  Verás el precio total estimado y el consumo de energía (TDP).

### Dashboard (Admin)
1.  Accede a `/dashboard`.
2.  **Productos Sin Agrupar**: Selecciona productos que sean variantes del mismo modelo y agrúpalos o añádelos a grupos existentes.
3.  **Eliminar**: Usa el icono de basura para borrar productos erróneos.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerencias o correcciones.
