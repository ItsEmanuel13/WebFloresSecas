import axios from 'axios';

/**
 * 🔐 Módulo de Autenticación para Mercado Libre
 * Maneja la renovación automática del access token usando refresh token
 */

class MercadoLibreAuth {
  constructor() {
    // Configuración desde variables de entorno
    this.clientId = process.env.MERCADOLIBRE_CLIENT_ID;
    this.clientSecret = process.env.MERCADOLIBRE_CLIENT_SECRET;
    this.refreshToken = process.env.MERCADOLIBRE_REFRESH_TOKEN;
    this.userId = process.env.MERCADOLIBRE_USER_ID;
    
    // Token actual (se actualiza dinámicamente)
    this.accessToken = process.env.MERCADOLIBRE_ACCESS_TOKEN;
    this.tokenExpiry = null;
    
    // URL base de la API
    this.apiBase = 'https://api.mercadolibre.com';
    this.authBase = 'https://auth.mercadolibre.com.ar';
    
    // Validar configuración
    this.validateConfig();
  }

  /**
   * Valida que todas las variables de entorno necesarias estén configuradas
   */
  validateConfig() {
    const requiredVars = [
      'MERCADOLIBRE_CLIENT_ID',
      'MERCADOLIBRE_CLIENT_SECRET', 
      'MERCADOLIBRE_REFRESH_TOKEN',
      'MERCADOLIBRE_USER_ID'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
    }

    console.log('✅ Configuración de autenticación validada');
  }

  /**
   * Obtiene un access token válido, renovándolo si es necesario
   */
  async getValidAccessToken() {
    try {
      // Si no tenemos token o ha expirado, renovarlo
      if (!this.accessToken || this.isTokenExpired()) {
        console.log('🔄 Renovando access token...');
        await this.refreshAccessToken();
      }

      return this.accessToken;
    } catch (error) {
      console.error('❌ Error obteniendo access token válido:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si el token actual ha expirado
   */
  isTokenExpired() {
    if (!this.tokenExpiry) {
      // Si no tenemos información de expiración, asumir que expiró
      return true;
    }

    // Agregar margen de seguridad de 5 minutos
    const safetyMargin = 5 * 60 * 1000; // 5 minutos en milisegundos
    return Date.now() >= (this.tokenExpiry - safetyMargin);
  }

  /**
   * Renueva el access token usando el refresh token
   */
  async refreshAccessToken() {
    try {
      console.log('🔄 Iniciando renovación de token...');

      const response = await axios.post(
        `${this.apiBase}/oauth/token`,
        {
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      const tokenData = response.data;

      // Actualizar tokens
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token; // El refresh token también se renueva
      
      // Calcular tiempo de expiración (6 horas = 21600 segundos)
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      console.log('✅ Token renovado exitosamente');
      console.log(`   Nuevo access token: ${this.accessToken.substring(0, 20)}...`);
      console.log(`   Expira en: ${new Date(this.tokenExpiry).toLocaleString()}`);

      // Actualizar variables de entorno (solo para la sesión actual)
      process.env.MERCADOLIBRE_ACCESS_TOKEN = this.accessToken;
      process.env.MERCADOLIBRE_REFRESH_TOKEN = this.refreshToken;

      return this.accessToken;

    } catch (error) {
      console.error('❌ Error renovando token:', error.response?.data || error.message);
      
      if (error.response?.status === 400 && error.response?.data?.error === 'invalid_grant') {
        throw new Error('El refresh token ha expirado o es inválido. Necesitas re-autorizar la aplicación.');
      }
      
      throw new Error(`Error renovando token: ${error.message}`);
    }
  }

  /**
   * Realiza una llamada autenticada a la API de Mercado Libre
   * Automáticamente renueva el token si es necesario
   */
  async authenticatedRequest(method, endpoint, data = null, params = {}) {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const config = {
        method,
        url: `${this.apiBase}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      };

      if (data) {
        config.data = data;
      }

      if (Object.keys(params).length > 0) {
        config.params = params;
      }

      const response = await axios(config);
      return response.data;

    } catch (error) {
      console.error(`❌ Error en llamada autenticada ${method} ${endpoint}:`, error.response?.status || error.message);
      
      // Si es un error de autenticación, intentar renovar token y reintentar
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🔄 Error de autenticación, intentando renovar token...');
        await this.refreshAccessToken();
        
        // Reintentar la llamada una vez
        const accessToken = await this.getValidAccessToken();
        const retryConfig = {
          method,
          url: `${this.apiBase}${endpoint}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000
        };

        if (data) retryConfig.data = data;
        if (Object.keys(params).length > 0) retryConfig.params = params;

        const retryResponse = await axios(retryConfig);
        return retryResponse.data;
      }

      throw error;
    }
  }

  /**
   * Obtiene información del usuario autenticado
   */
  async getCurrentUser() {
    return await this.authenticatedRequest('GET', '/users/me');
  }

  /**
   * Verifica el estado de la autenticación
   */
  async checkAuthStatus() {
    try {
      const user = await this.getCurrentUser();
      return {
        authenticated: true,
        userId: user.id,
        nickname: user.nickname,
        email: user.email
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig() {
    return {
      clientId: this.clientId,
      userId: this.userId,
      hasAccessToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      isTokenExpired: this.isTokenExpired()
    };
  }
}

// Crear instancia singleton
const mercadolibreAuth = new MercadoLibreAuth();

export default mercadolibreAuth;
export { MercadoLibreAuth };
