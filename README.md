# 🌿 Catálogo de Flores Secas - Mercado Libre

Una aplicación web simple que muestra un catálogo de productos de Mercado Libre obtenidos a través de la API oficial.

## 🚀 Características

- **Catálogo visual**: Muestra productos en un diseño moderno y responsive
- **Filtros**: Filtra por precio y condición del producto
- **Estadísticas**: Muestra información resumida de los productos
- **Enlaces directos**: Acceso directo a los productos en Mercado Libre
- **Diseño responsive**: Funciona perfectamente en móviles y desktop

## 📋 Requisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Token de acceso a la API de Mercado Libre

## 🛠️ Instalación

1. **Clona el repositorio**:
```bash
git clone <tu-repositorio>
cd WebFloreSecas
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Configura tu token de Mercado Libre**:
   - Edita el archivo `src/extraer_productos.js`
   - Reemplaza `ACCESS_TOKEN` con tu token personal
   - Reemplaza `TARGET_USER_ID` con el ID del vendedor que quieres extraer

## 🚀 Uso

### Opción 1: Extraer productos y luego ver la web
```bash
# Extraer productos de Mercado Libre
npm run extract

# Iniciar la aplicación web
npm run dev
```

### Opción 2: Todo en un comando
```bash
# Extraer productos e iniciar la web automáticamente
npm run start
```

### Opción 3: Solo ver la web (con datos de ejemplo)
```bash
# Si ya tienes el archivo productos_mercadolibre.json
npm run dev
```

### 🔐 Gestión de Autenticación

#### Verificar estado de autenticación
```bash
curl https://tu-dominio.vercel.app/api/auth/status
```

#### Renovar token manualmente
```bash
curl -X POST https://tu-dominio.vercel.app/api/auth/refresh
```

#### Actualizar productos via API
```bash
curl -X POST https://tu-dominio.vercel.app/api/updateProducts
```

## 📁 Estructura del proyecto

```
WebFloreSecas/
├── src/
│   ├── extraer_productos.js    # Script para extraer productos de ML
│   ├── App.jsx                 # Componente principal de React
│   ├── App.css                 # Estilos de la aplicación
│   └── main.jsx                # Punto de entrada de React
├── public/
│   └── productos_mercadolibre.json  # Datos de productos (se genera automáticamente)
├── package.json
└── README.md
```

## 🔧 Configuración

### 🔐 Autenticación Automática (NUEVO)

El sistema ahora maneja automáticamente la renovación de tokens de Mercado Libre. Para configurarlo:

#### 1. Configurar Variables de Entorno

**Para desarrollo local:**
```bash
# Crear archivo .env.local
cp .env.example .env.local
# Editar con tus credenciales
```

**Para Vercel:**
1. Ve al dashboard de tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```bash
MERCADOLIBRE_CLIENT_ID=tu_client_id_aqui
MERCADOLIBRE_CLIENT_SECRET=tu_client_secret_aqui
MERCADOLIBRE_ACCESS_TOKEN=tu_access_token_aqui
MERCADOLIBRE_REFRESH_TOKEN=tu_refresh_token_aqui
MERCADOLIBRE_USER_ID=tu_user_id_aqui
```

#### 2. Obtener Credenciales

1. Ve a [Mercado Libre Developers](https://developers.mercadolibre.com.ar/)
2. Crea una nueva aplicación
3. Sigue el proceso de autorización OAuth
4. Obtén los tokens necesarios

#### 3. Documentación Completa

Consulta la documentación detallada en: [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md)

### 🔄 Renovación Automática

El sistema incluye:
- ✅ Renovación automática de tokens antes de expirar
- ✅ Reintento inteligente en caso de errores
- ✅ Endpoints de gestión: `/api/auth/status`, `/api/auth/refresh`
- ✅ Manejo de errores robusto

### 📋 Configuración Manual (Legacy)

Si prefieres la configuración manual, edita `src/extraer_productos.js`:
```javascript
const ACCESS_TOKEN = "TU_TOKEN_AQUI";
const TARGET_USER_ID = "ID_DEL_VENDEDOR";
```

## 📊 Datos extraídos

El script extrae la siguiente información de cada producto:

- **Información básica**: ID, título, descripción
- **Precios**: Precio actual, precio original, moneda
- **Estado**: Condición (nuevo/usado), stock disponible, vendidos
- **Imágenes**: Imagen principal y galería
- **Envío**: Envío gratis, métodos de envío
- **Ubicación**: Ciudad, estado, país
- **Atributos**: Características específicas del producto
- **Garantía y pagos**: Acepta Mercado Pago, garantía

## 🎨 Personalización

### Cambiar colores
Edita las variables CSS en `src/App.css`:
```css
:root {
  --primary-color: #2ecc71;    /* Color principal */
  --secondary-color: #27ae60;  /* Color secundario */
  --accent-color: #f39c12;     /* Color de acento */
}
```

### Cambiar título
Edita en `src/App.jsx`:
```jsx
<h1>🌿 Tu Título Personalizado</h1>
```

## 📱 Responsive

La aplicación es completamente responsive y se adapta a:
- **Desktop**: Grid de 3-4 columnas
- **Tablet**: Grid de 2 columnas
- **Móvil**: Grid de 1 columna

## 🔍 Filtros disponibles

- **Por precio**:
  - Menos de $1,000
  - $1,000 - $3,000
  - Más de $3,000

- **Por condición**:
  - Nuevo
  - Usado

## 📈 Estadísticas

La aplicación muestra:
- Total de productos filtrados
- Precio promedio de los productos

## 🚨 Solución de problemas

### Error al cargar productos
- Verifica que el archivo `productos_mercadolibre.json` existe en la carpeta `public/`
- Ejecuta `npm run extract` para generar el archivo

### Error de token
- Verifica que tu token de Mercado Libre sea válido
- Asegúrate de que el `TARGET_USER_ID` sea correcto

### Error de red
- Verifica tu conexión a internet
- Los productos se cargan desde el archivo JSON local

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y comerciales.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta explorando el catálogo de flores secas! 🌸**
