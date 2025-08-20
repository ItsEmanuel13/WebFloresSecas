import mercadolibreAuth from '../../src/auth/mercadolibre-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Renovando token manualmente...');
    
    // Obtener configuración antes de la renovación
    const configBefore = mercadolibreAuth.getConfig();
    
    // Renovar el token
    const newAccessToken = await mercadolibreAuth.refreshAccessToken();
    
    // Obtener configuración después de la renovación
    const configAfter = mercadolibreAuth.getConfig();
    
    // Verificar que la renovación fue exitosa
    const authStatus = await mercadolibreAuth.checkAuthStatus();
    
    const response = {
      timestamp: new Date().toISOString(),
      success: true,
      message: 'Token renovado exitosamente',
      config: {
        before: {
          hasAccessToken: configBefore.hasAccessToken,
          isTokenExpired: configBefore.isTokenExpired,
          tokenExpiry: configBefore.tokenExpiry
        },
        after: {
          hasAccessToken: configAfter.hasAccessToken,
          isTokenExpired: configAfter.isTokenExpired,
          tokenExpiry: configAfter.tokenExpiry
        }
      },
      authentication: authStatus,
      newTokenPreview: newAccessToken.substring(0, 20) + '...'
    };

    console.log('✅ Token renovado exitosamente');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error renovando token:', error.message);
    
    let statusCode = 500;
    let errorMessage = 'Error interno del servidor';
    
    if (error.message.includes('invalid_grant')) {
      statusCode = 401;
      errorMessage = 'El refresh token ha expirado o es inválido. Necesitas re-autorizar la aplicación.';
    } else if (error.message.includes('Variables de entorno faltantes')) {
      statusCode = 400;
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      message: error.message,
      timestamp: new Date().toISOString(),
      success: false
    });
  }
}
