# 🔐 Configuración de Autenticación - Mercado Libre API

Este documento explica cómo configurar la autenticación automática para la API de Mercado Libre en tu proyecto.

## 📋 Variables de Entorno Requeridas

Para que el sistema de autenticación funcione correctamente, necesitas configurar las siguientes variables de entorno en Vercel:

### Variables Obligatorias

```bash
# Credenciales de la aplicación de Mercado Libre
MERCADOLIBRE_CLIENT_ID=tu_client_id_aqui
MERCADOLIBRE_CLIENT_SECRET=tu_client_secret_aqui

# Token de acceso (se renueva automáticamente)
MERCADOLIBRE_ACCESS_TOKEN=APP_USR-12345678-031820-X-12345678

# Refresh token para renovar el access token
MERCADOLIBRE_REFRESH_TOKEN=TG-5b9032b4e23464aed1f959f-1234567

# ID del usuario de Mercado Libre
MERCADOLIBRE_USER_ID=480338095
```

### Variables Opcionales

```bash
# Configuración adicional
MERCADOLIBRE_SITE=MLA  # Argentina
MERCADOLIBRE_ENVIRONMENT=production  # production o sandbox
```

## 🚀 Configuración en Vercel

### 1. Ir al Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Selecciona tu proyecto
3. Ve a la pestaña "Settings"
4. Haz clic en "Environment Variables"

### 2. Agregar Variables

Agrega cada variable con su valor correspondiente:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MERCADOLIBRE_CLIENT_ID` | ID de tu aplicación de Mercado Libre | `1234567890123456` |
| `MERCADOLIBRE_CLIENT_SECRET` | Secret de tu aplicación | `abcdefghijklmnop` |
| `MERCADOLIBRE_ACCESS_TOKEN` | Token de acceso actual | `APP_USR-12345678-031820-X-12345678` |
| `MERCADOLIBRE_REFRESH_TOKEN` | Token de renovación | `TG-5b9032b4e23464aed1f959f-1234567` |
| `MERCADOLIBRE_USER_ID` | ID del usuario de Mercado Libre | `480338095` |

### 3. Configurar Entornos

Para cada variable, selecciona los entornos donde debe estar disponible:
- ✅ **Production** (obligatorio)
- ✅ **Preview** (recomendado)
- ✅ **Development** (opcional)

## 🔧 Obtener Credenciales de Mercado Libre

### 1. Crear Aplicación en Mercado Libre

1. Ve a [developers.mercadolibre.com.ar](https://developers.mercadolibre.com.ar)
2. Inicia sesión con tu cuenta de Mercado Libre
3. Ve a "Mis Aplicaciones"
4. Haz clic en "Crear aplicación"

### 2. Configurar Aplicación

- **Nombre**: Nombre descriptivo para tu aplicación
- **Tipo**: Selecciona "Web" o "Desktop"
- **Redirect URI**: URL donde Mercado Libre redirigirá después de la autorización
  - Para desarrollo local: `http://localhost:3000/auth/callback`
  - Para producción: `https://tu-dominio.vercel.app/auth/callback`

### 3. Obtener Credenciales

Después de crear la aplicación, obtendrás:
- **Client ID**: Visible en el dashboard
- **Client Secret**: Haz clic en "Ver" para revelarlo

### 4. Obtener Tokens

#### Paso 1: Autorización del Usuario

Construye la URL de autorización:

```
https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=TU_CLIENT_ID&redirect_uri=TU_REDIRECT_URI
```

Reemplaza:
- `TU_CLIENT_ID` con tu Client ID
- `TU_REDIRECT_URI` con tu Redirect URI configurado

#### Paso 2: Intercambiar Código por Token

Después de que el usuario autorice, Mercado Libre redirigirá con un código. Usa este código para obtener los tokens:

```bash
curl -X POST \
  'https://api.mercadolibre.com/oauth/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'client_id=TU_CLIENT_ID' \
  -d 'client_secret=TU_CLIENT_SECRET' \
  -d 'code=CODIGO_DE_AUTORIZACION' \
  -d 'redirect_uri=TU_REDIRECT_URI'
```

#### Paso 3: Guardar Tokens

De la respuesta, guarda:
- `access_token` → `MERCADOLIBRE_ACCESS_TOKEN`
- `refresh_token` → `MERCADOLIBRE_REFRESH_TOKEN`
- `user_id` → `MERCADOLIBRE_USER_ID`

## 🔄 Renovación Automática de Tokens

El sistema maneja automáticamente la renovación de tokens:

### Características

- ✅ **Renovación automática**: El token se renueva antes de expirar
- ✅ **Reintento inteligente**: Si una llamada falla por token expirado, se renueva y reintenta
- ✅ **Margen de seguridad**: Renueva 5 minutos antes de la expiración
- ✅ **Manejo de errores**: Detecta tokens inválidos y refresh tokens expirados

### Endpoints de Gestión

#### Verificar Estado de Autenticación
```bash
GET /api/auth/status
```

#### Renovar Token Manualmente
```bash
POST /api/auth/refresh
```

#### Actualizar Productos
```bash
POST /api/updateProducts
```

## 🛠️ Desarrollo Local

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
MERCADOLIBRE_CLIENT_ID=tu_client_id_aqui
MERCADOLIBRE_CLIENT_SECRET=tu_client_secret_aqui
MERCADOLIBRE_ACCESS_TOKEN=tu_access_token_aqui
MERCADOLIBRE_REFRESH_TOKEN=tu_refresh_token_aqui
MERCADOLIBRE_USER_ID=tu_user_id_aqui
```

## 🔍 Verificación

### 1. Verificar Configuración

```bash
# Verificar estado de autenticación
curl https://tu-dominio.vercel.app/api/auth/status
```

### 2. Probar Renovación

```bash
# Renovar token manualmente
curl -X POST https://tu-dominio.vercel.app/api/auth/refresh
```

### 3. Probar Extracción

```bash
# Actualizar productos
curl -X POST https://tu-dominio.vercel.app/api/updateProducts
```

## ⚠️ Consideraciones de Seguridad

### Variables Sensibles

- **Nunca** commits credenciales en el código
- **Siempre** usa variables de entorno
- **Rota** los tokens regularmente
- **Monitorea** el uso de la API

### Límites de API

- **Rate Limiting**: Respeta los límites de Mercado Libre
- **Pausas**: El código incluye pausas entre llamadas
- **Manejo de errores**: Implementa reintentos con backoff

## 🆘 Solución de Problemas

### Error: "Variables de entorno faltantes"

Verifica que todas las variables obligatorias estén configuradas en Vercel.

### Error: "invalid_grant"

El refresh token ha expirado. Necesitas re-autorizar la aplicación:
1. Ve al dashboard de Mercado Libre
2. Revoca los permisos de la aplicación
3. Sigue el proceso de autorización nuevamente

### Error: "403 Forbidden"

- Verifica que el usuario tenga permisos de administrador
- Confirma que el IP no esté bloqueado
- Verifica que los scopes sean correctos

### Error: "429 Rate Limited"

Demasiadas llamadas a la API. El código incluye pausas automáticas, pero puedes aumentarlas si es necesario.

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica los logs en Vercel
2. Usa el endpoint `/api/auth/status` para diagnosticar
3. Revisa la documentación oficial de Mercado Libre
4. Contacta al equipo de desarrollo

---

**Nota**: Este sistema está diseñado para manejar automáticamente la renovación de tokens, pero es importante monitorear regularmente el estado de la autenticación.
