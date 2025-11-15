# Instrucciones para Probar la Compatibilidad con Laravel

## ✅ Cambios Realizados

### Backend (Laravel)

1. **Nueva migración** creada: `2025_11_15_025844_add_compatibility_fields_to_products_table.php`
   - Agrega campos: `socket`, `ram_type`, `max_ram`, `tdp`, `memory_type`, `capacity`, `wattage`, etc.

2. **Seeder de productos** creado: `ProductsSeeder.php`
   - Llena la base de datos con:
     - 4 CPUs (Intel y AMD con sockets LGA1700 y AM5)
     - 3 Motherboards (compatibles con los CPUs)
     - 4 RAM (DDR4 y DDR5)
     - 3 GPUs (con TDP)
     - 4 PSUs (650W - 1000W)
     - 2 Storage
     - 2 Cases

3. **Controlador API** creado: `Api/ProductController.php`
   - `GET /api/components` - Obtiene todos los componentes
   - `GET /api/components/{type}` - Obtiene por tipo
   - `POST /api/components/check-compatibility` - Verifica compatibilidad
   - `GET /api/components/product/{id}` - Obtiene producto específico

4. **Rutas API** agregadas en `routes/api.php` (públicas, sin autenticación)

### Frontend (React)

1. **Servicio API** creado: `src/services/componentsApi.js`
   - Funciones para consumir la API de Laravel
   - Transformación de datos al formato del frontend

2. **Compatibilidad actualizada**: `src/utils/compatibility.js`
   - Ahora acepta datos de la API o mock
   - Mantiene la misma lógica de verificación

3. **Variable de entorno**: `.env.local`
   - Configuración de la URL de la API

---

## 🚀 Pasos para Ejecutar

### 1. Iniciar MySQL

Asegúrate de que tu servidor MySQL esté corriendo:
```powershell
# Verifica que MySQL esté activo
# Si usas XAMPP, inicia el servicio MySQL desde el panel de control
# Si usas MySQL directamente, verifica que el servicio esté corriendo
```

### 2. Backend Laravel

```powershell
# Navegar a la carpeta del backend
cd "c:\Users\renzo\Documents\GitHub\compify\compify\backend API"

# Ejecutar las migraciones
php artisan migrate

# Ejecutar el seeder (llenar con datos)
php artisan db:seed --class=ProductsSeeder

# Iniciar el servidor Laravel
php artisan serve
```

El servidor Laravel debería estar corriendo en `http://localhost:8000`

### 3. Verificar la API

Abre tu navegador y visita:
- `http://localhost:8000/api/components` - Deberías ver todos los componentes en JSON
- `http://localhost:8000/api/components/cpu` - Solo CPUs
- `http://localhost:8000/api/components/motherboard` - Solo Motherboards

### 4. Frontend React

En otra terminal:

```powershell
# Navegar a la carpeta del frontend
cd "c:\Users\renzo\Documents\GitHub\compify\compify\comparer-react"

# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend React debería estar corriendo en `http://localhost:5173`

---

## 🧪 Cómo Probar la Compatibilidad

### Opción 1: Usar datos de la API (Recomendado)

En tu componente React donde usas la compatibilidad, importa y usa el servicio:

```javascript
import { getAllComponents, transformComponentsToFrontendFormat } from '../services/componentsApi';
import { checkCompatibility } from '../utils/compatibility';

// En tu componente
const [components, setComponents] = useState(null);

useEffect(() => {
  // Cargar componentes desde la API
  const loadComponents = async () => {
    try {
      const apiData = await getAllComponents();
      const transformed = transformComponentsToFrontendFormat(apiData);
      setComponents(transformed);
    } catch (error) {
      console.error('Error cargando componentes:', error);
      // Fallback a datos mock si falla
      setComponents(mockComponents);
    }
  };
  
  loadComponents();
}, []);

// Al verificar compatibilidad
const issues = checkCompatibility(currentBuild, components);
```

### Opción 2: Seguir usando datos Mock

Si no quieres cambiar nada todavía, la función `checkCompatibility` sigue funcionando con datos mock por defecto:

```javascript
import { checkCompatibility } from '../utils/compatibility';

// Funciona exactamente igual que antes
const issues = checkCompatibility(currentBuild);
```

---

## 📊 Datos de Prueba

La base de datos ahora tiene componentes que puedes usar para probar:

### CPUs:
- **Intel Core i5-13600K** (Socket LGA1700, 125W TDP)
- **Intel Core i9-13900K** (Socket LGA1700, 253W TDP)
- **AMD Ryzen 7 7800X3D** (Socket AM5, 120W TDP)
- **AMD Ryzen 5 7600X** (Socket AM5, 105W TDP)

### Motherboards:
- **ASUS ROG STRIX Z790-E** (Socket LGA1700, DDR5, 128GB max)
- **MSI MAG B650 TOMAHAWK** (Socket AM5, DDR5, 128GB max)
- **Gigabyte B760M DS3H** (Socket LGA1700, DDR5, 64GB max)

### RAM:
- **Corsair Vengeance DDR5 32GB** (DDR5, 6000MHz)
- **G.Skill Trident Z5 RGB 32GB** (DDR5, 6400MHz)
- **Kingston Fury Beast DDR5 16GB** (DDR5, 5200MHz)
- **Corsair Vengeance DDR4 32GB** (DDR4, 3200MHz) ⚠️ Incompatible con DDR5

### PSUs:
- **Corsair RM850x** (850W)
- **EVGA SuperNOVA 750 G6** (750W)
- **Seasonic FOCUS GX-650** (650W)
- **Thermaltake Toughpower GF1 1000W** (1000W)

---

## ✨ Pruebas de Compatibilidad

### Caso 1: Compatible ✅
- CPU: Intel Core i5-13600K (LGA1700, 125W)
- Motherboard: ASUS ROG STRIX Z790-E (LGA1700, DDR5)
- RAM: Corsair Vengeance DDR5 32GB (DDR5)
- GPU: NVIDIA RTX 4060 (115W)
- PSU: Corsair RM850x (850W)

**Resultado**: Todo compatible

### Caso 2: Socket Incompatible ❌
- CPU: AMD Ryzen 7 7800X3D (AM5)
- Motherboard: ASUS ROG STRIX Z790-E (LGA1700)

**Resultado**: Error crítico de socket

### Caso 3: RAM Incompatible ❌
- Motherboard: ASUS ROG STRIX Z790-E (DDR5)
- RAM: Corsair Vengeance DDR4 32GB (DDR4)

**Resultado**: Error crítico de tipo de RAM

### Caso 4: PSU Insuficiente ⚠️
- CPU: Intel Core i9-13900K (253W)
- GPU: AMD RX 7900 XT (315W)
- PSU: Seasonic FOCUS GX-650 (650W)

**Resultado**: Advertencia - PSU insuficiente (necesita ~870W)

---

## 🔍 Verificar que Funciona

1. **Verifica la API**: Abre `http://localhost:8000/api/components/cpu` en el navegador
2. **Verifica el frontend**: Abre la consola del navegador y busca errores
3. **Prueba la compatibilidad**: Selecciona componentes incompatibles y verifica que aparezcan alertas

---

## ❓ Solución de Problemas

### Error: "SQLSTATE[HY000] [2002]"
- ✅ Inicia tu servidor MySQL

### Error: "Access denied for user 'root'@'localhost'"
- ✅ Verifica las credenciales en `.env` del backend Laravel

### Error: "Network Error" en React
- ✅ Verifica que Laravel esté corriendo en `http://localhost:8000`
- ✅ Verifica CORS en Laravel (ya debería estar configurado)

### Los componentes no aparecen
- ✅ Verifica que ejecutaste `php artisan db:seed --class=ProductsSeeder`
- ✅ Verifica en tu base de datos que existan registros en la tabla `products`

---

## 📝 Próximos Pasos

Una vez que confirmes que funciona:
1. ✅ Agregar más componentes al seeder
2. ✅ Crear endpoint para agregar precios de tiendas
3. ✅ Implementar autenticación para guardar builds
4. ✅ Agregar imágenes reales de componentes
