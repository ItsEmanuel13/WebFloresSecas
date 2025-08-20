#!/usr/bin/env node

/**
 * 🔧 Script de Configuración de Variables de Entorno
 * Ayuda a configurar las variables necesarias para la autenticación de Mercado Libre
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔐 CONFIGURADOR DE VARIABLES DE ENTORNO - MERCADO LIBRE');
console.log('=' .repeat(60));

// Verificar si ya existe un archivo .env.local
const envPath = path.join(__dirname, '../.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  Ya existe un archivo .env.local');
  console.log('¿Deseas sobrescribirlo? (y/N)');
  
  // En un entorno real, aquí leerías la respuesta del usuario
  console.log('Para continuar manualmente, edita el archivo .env.local');
} else {
  console.log('📝 Creando archivo .env.local...');
  
  const envTemplate = `# 🔐 Variables de Entorno para Mercado Libre API
# Configura estas variables con tus credenciales reales

# Credenciales de la aplicación de Mercado Libre
MERCADOLIBRE_CLIENT_ID=tu_client_id_aqui
MERCADOLIBRE_CLIENT_SECRET=tu_client_secret_aqui

# Token de acceso (se renueva automáticamente)
MERCADOLIBRE_ACCESS_TOKEN=APP_USR-12345678-031820-X-12345678

# Refresh token para renovar el access token
MERCADOLIBRE_REFRESH_TOKEN=TG-5b9032b4e23464aed1f959f-1234567

# ID del usuario de Mercado Libre
MERCADOLIBRE_USER_ID=480338095

# Configuración adicional (opcional)
MERCADOLIBRE_SITE=MLA
MERCADOLIBRE_ENVIRONMENT=production
`;

  try {
    fs.writeFileSync(envPath, envTemplate, 'utf8');
    console.log('✅ Archivo .env.local creado exitosamente');
    console.log('📝 Edita el archivo con tus credenciales reales');
  } catch (error) {
    console.error('❌ Error creando archivo:', error.message);
  }
}

console.log('\n📋 INSTRUCCIONES:');
console.log('1. Ve a https://developers.mercadolibre.com.ar');
console.log('2. Crea una nueva aplicación');
console.log('3. Obtén tu Client ID y Client Secret');
console.log('4. Sigue el proceso de autorización OAuth');
console.log('5. Obtén tu Access Token y Refresh Token');
console.log('6. Configura las variables en el archivo .env.local');
console.log('7. Para Vercel, configura las variables en el dashboard');

console.log('\n🔗 ENLACES ÚTILES:');
console.log('- Documentación: docs/AUTHENTICATION.md');
console.log('- Dashboard Vercel: https://vercel.com/dashboard');
console.log('- Developers ML: https://developers.mercadolibre.com.ar');

console.log('\n✅ ¡Configuración completada!');
