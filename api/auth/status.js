import mercadolibreAuth from '../../src/auth/mercadolibre-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔐 Verificando estado de autenticación...');
    
    // Obtener configuración básica
    const config = mercadolibreAuth.getConfig();
    
    // Verificar estado de autenticación
    const authStatus = await mercadolibreAuth.checkAuthStatus();
    
    const response = {
      timestamp: new Date().toISOString(),
      config: {
        clientId: config.clientId ? '✅ Configurado' : '❌ Faltante',
        userId: config.userId,
        hasAccessToken: config.hasAccessToken,
        tokenExpiry: config.tokenExpiry,
        isTokenExpired: config.isTokenExpired
      },
      authentication: authStatus
    };

    if (authStatus.authenticated) {
      console.log('✅ Autenticación exitosa');
      res.status(200).json(response);
    } else {
      console.log('❌ Error de autenticación:', authStatus.error);
      res.status(401).json(response);
    }

  } catch (error) {
    console.error('❌ Error verificando autenticación:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
