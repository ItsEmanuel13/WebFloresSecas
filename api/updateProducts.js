
import { getAllProducts } from "../../src/extraer_productos.js";
import mercadolibreAuth from "../../src/auth/mercadolibre-auth.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Iniciando actualización de productos...');
    
    // Verificar autenticación antes de comenzar
    const authStatus = await mercadolibreAuth.checkAuthStatus();
    if (!authStatus.authenticated) {
      return res.status(401).json({ 
        error: 'Error de autenticación', 
        details: authStatus.error 
      });
    }
    
    // Ejecutar la extracción de productos
    const productos = await getAllProducts();
    
    res.status(200).json({ 
      message: "✅ Productos actualizados correctamente",
      totalProductos: productos.length,
      usuario: authStatus.nickname,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error al actualizar productos:", error);
    
    let statusCode = 500;
    let errorMessage = "Error al actualizar productos";
    
    if (error.message.includes('autenticación')) {
      statusCode = 401;
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}