import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔑 Configuración
const TARGET_USER_ID = "480338095";
const ACCESS_TOKEN = "APP_USR-5058690951936208-081909-7d250ef5a1a6d79a039b15097e70b768-480338095";

// 🛍️ Función principal para obtener todos los productos
async function getAllProducts() {
  try {
    console.log("🚀 INICIANDO OBTENCIÓN DE PRODUCTOS");
    console.log("=" .repeat(50));
    console.log(`👤 Usuario objetivo: ${TARGET_USER_ID}`);
    console.log(`🔑 Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
    
    // Paso 1: Obtener lista completa de productos
    console.log("\n📋 Paso 1: Obteniendo lista de productos...");
    const allProductIds = await getAllProductIds();
    
    if (allProductIds.length === 0) {
      console.log("❌ No se encontraron productos");
      return [];
    }
    
    console.log(`✅ Total de productos encontrados: ${allProductIds.length}`);
    
    // Paso 2: Obtener detalles de cada producto
    console.log("\n📦 Paso 2: Obteniendo detalles de productos...");
    const productos = await getProductsDetails(allProductIds);
    
    // Paso 3: Guardar resultados
    console.log("\n💾 Paso 3: Guardando resultados...");
    await saveResults(productos);
    
    console.log("\n🎉 ¡PROCESO COMPLETADO!");
    console.log(`✅ Productos procesados exitosamente: ${productos.length}/${allProductIds.length}`);
    
    return productos;
    
  } catch (error) {
    console.error("❌ Error general:", error.message);
    throw error;
  }
}

// 📋 Función para obtener todos los IDs de productos (con paginación)
async function getAllProductIds() {
  const allIds = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;
  
  while (hasMore) {
    try {
      console.log(`  📄 Página ${Math.floor(offset/limit) + 1} (offset: ${offset})...`);
      
      const response = await axios.get(
        `https://api.mercadolibre.com/users/${TARGET_USER_ID}/items/search`,
        {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
          params: { limit, offset },
          timeout: 15000
        }
      );
      
      const pageIds = response.data.results;
      console.log(`    ✅ ${pageIds.length} productos en esta página`);
      
      if (pageIds.length === 0) {
        hasMore = false;
      } else {
        allIds.push(...pageIds);
        
        if (pageIds.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }
      
      // Pausa entre páginas
      await sleep(500);
      
    } catch (error) {
      console.log(`    ❌ Error en paginación: ${error.response?.status || error.message}`);
      if (error.response?.status === 404 || offset > 1000) {
        hasMore = false;
      } else {
        throw error;
      }
    }
  }
  
  return allIds;
}

// 📦 Función para obtener detalles de los productos
async function getProductsDetails(productIds) {
  const productos = [];
  const totalProducts = productIds.length;
  
  for (let i = 0; i < totalProducts; i++) {
    const itemId = productIds[i];
    const progress = `${i + 1}/${totalProducts}`;
    
    console.log(`  🔍 [${progress}] Procesando: ${itemId}`);
    
    try {
      const producto = await getProductDetail(itemId);
      if (producto) {
        productos.push(producto);
        console.log(`    ✅ ${producto.titulo.substring(0, 60)}...`);
      } else {
        console.log(`    ⚠️  Producto saltado`);
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
    
    // Pausa entre productos para evitar rate limits
    await sleep(800);
  }
  
  return productos;
}

// 🔍 Función para obtener detalles de un producto específico
async function getProductDetail(itemId) {
  try {
    // Intentar primero con autenticación
    let itemData;
    let accessMethod = "autenticado";
    
    try {
      const response = await axios.get(
        `https://api.mercadolibre.com/items/${itemId}`,
        {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
          timeout: 12000
        }
      );
      itemData = response.data;
    } catch (authError) {
      if (authError.response?.status === 403) {
        // Si falla con autenticación, intentar acceso público
        console.log(`      🔓 Intentando acceso público...`);
        const publicResponse = await axios.get(
          `https://api.mercadolibre.com/items/${itemId}`,
          { timeout: 10000 }
        );
        itemData = publicResponse.data;
        accessMethod = "público";
      } else {
        throw authError;
      }
    }
    
    // Obtener descripción
    let descripcion = "Sin descripción disponible";
    try {
      const descResponse = await axios.get(
        `https://api.mercadolibre.com/items/${itemId}/description`,
        { 
          headers: accessMethod === "autenticado" ? { 'Authorization': `Bearer ${ACCESS_TOKEN}` } : {},
          timeout: 8000 
        }
      );
      descripcion = descResponse.data.plain_text || descResponse.data.text || "Sin descripción";
      descripcion = descripcion.substring(0, 500); // Limitar longitud
    } catch (descError) {
      // Descripción no disponible, continuar
    }
    
    // Función para mejorar calidad de imagen
    const mejorarImagen = (url) => {
      if (!url) return url;
      
      // Corregir URLs malformadas y mejorar calidad
      return url
        .replace(/^http:\/\/http2\.mlstatic\.com/, 'https://http2.mlstatic.com') // Corregir protocolo
        .replace(/^http:\/\/http2\.mlstatic\.com/, 'https://http2.mlstatic.com') // Corregir protocolo
        .replace(/\.webp$/, '.jpg') // Convertir webp a jpg
        .replace(/D_NQ_NP_2X_/, 'D_NQ_NP_4X_') // Aumentar resolución
        .replace(/D_NQ_NP_/, 'D_NQ_NP_4X_') // Si no tiene 2X, agregar 4X
        .replace(/-F\.webp$/, '-F.jpg') // Convertir webp a jpg
        .replace(/-I\.jpg$/, '-F.jpg') // Cambiar vista inicial por frontal
        .replace(/-O\.jpg$/, '-F.jpg'); // Cambiar vista original por frontal
    };
    
    // Construir objeto del producto
    const producto = {
      // Información básica
      id: itemData.id,
      titulo: itemData.title,
      descripcion: descripcion,
      
      // Precio y moneda
      precio: itemData.price,
      moneda: itemData.currency_id,
      precio_original: itemData.original_price,
      
      // Estado y disponibilidad
      estado: itemData.status,
      condicion: itemData.condition,
      stock_disponible: itemData.available_quantity,
      vendidos: itemData.sold_quantity,
      
      // Enlaces e imágenes (mejoradas)
      link_producto: itemData.permalink,
      imagen_principal: mejorarImagen(itemData.thumbnail),
      galeria_imagenes: itemData.pictures?.slice(0, 5).map(pic => mejorarImagen(pic.url)) || [],
      
      // Categoría y clasificación
      categoria_id: itemData.category_id,
      tipo_listado: itemData.listing_type_id,
      
      // Fechas
      fecha_creacion: itemData.date_created,
      ultima_actualizacion: itemData.last_updated,
      
      // Envío
      envio_gratis: itemData.shipping?.free_shipping || false,
      metodos_envio: itemData.shipping?.methods?.map(method => method.name) || [],
      
      // Ubicación del vendedor
      ubicacion: {
        ciudad: itemData.seller_address?.city?.name || "No especificada",
        estado: itemData.seller_address?.state?.name || "No especificado",
        pais: itemData.seller_address?.country?.name || "No especificado"
      },
      
      // Atributos del producto
      atributos: itemData.attributes?.map(attr => ({
        nombre: attr.name,
        valor: attr.value_name || attr.value_id || "No especificado"
      })).slice(0, 10) || [],
      
      // Garantía y servicios
      garantia: itemData.warranty || "Sin garantía especificada",
      acepta_mercado_pago: itemData.accepts_mercadopago || false,
      
      // Método de acceso usado
      metodo_acceso: accessMethod
    };
    
    return producto;
    
  } catch (error) {
    console.log(`      ❌ Error obteniendo detalles: ${error.response?.status || error.message}`);
    return null;
  }
}

// 💾 Función para guardar resultados
async function saveResults(productos) {
  try {
    // Crear resumen
    const resumen = {
      fecha_extraccion: new Date().toISOString(),
      usuario_objetivo: TARGET_USER_ID,
      total_productos: productos.length,
      productos_por_estado: {},
      productos_por_condicion: {},
      rango_precios: {
        minimo: Math.min(...productos.map(p => p.precio || 0)),
        maximo: Math.max(...productos.map(p => p.precio || 0)),
        promedio: productos.reduce((sum, p) => sum + (p.precio || 0), 0) / productos.length
      }
    };
    
    // Agrupar por estado
    productos.forEach(p => {
      resumen.productos_por_estado[p.estado] = (resumen.productos_por_estado[p.estado] || 0) + 1;
      resumen.productos_por_condicion[p.condicion] = (resumen.productos_por_condicion[p.condicion] || 0) + 1;
    });
    
    // Guardar archivo completo
    const datosCompletos = {
      resumen: resumen,
      productos: productos
    };
    
    // Ruta para guardar en la carpeta public
    const publicPath = new URL('../public/productos_mercadolibre.json', import.meta.url);
    fs.writeFileSync(publicPath, JSON.stringify(datosCompletos, null, 2), 'utf8');
    console.log('  ✅ Guardado: public/productos_mercadolibre.json');
    
    // Guardar CSV simple
    const csvContent = [
      'ID,Título,Precio,Moneda,Estado,Stock,Vendidos,Link',
      ...productos.map(p => 
        `"${p.id}","${p.titulo.replace(/"/g, '""')}","${p.precio}","${p.moneda}","${p.estado}","${p.stock_disponible}","${p.vendidos}","${p.link_producto}"`
      )
    ].join('\n');
    
    const csvPath = new URL('../productos_mercadolibre.csv', import.meta.url);
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log('  ✅ Guardado: productos_mercadolibre.csv');
    
    // Mostrar resumen en consola
    console.log('\n📊 RESUMEN:');
    console.log(`  📦 Total productos: ${resumen.total_productos}`);
    console.log(`  💰 Precio promedio: $${resumen.rango_precios.promedio.toFixed(2)} ${productos[0]?.moneda || ''}`);
    console.log(`  📈 Rango: $${resumen.rango_precios.minimo} - $${resumen.rango_precios.maximo}`);
    console.log('  📊 Estados:', Object.entries(resumen.productos_por_estado));
    
  } catch (error) {
    console.error('❌ Error guardando:', error.message);
  }
}

// 📂 Función para cargar productos desde el JSON (para el frontend)
function loadProductsFromJSON() {
  try {
    const publicPath = new URL('../public/productos_mercadolibre.json', import.meta.url);
    const data = fs.readFileSync(publicPath, 'utf8');
    const parsedData = JSON.parse(data);
    return parsedData.productos || [];
  } catch (error) {
    console.error('❌ Error cargando productos desde JSON:', error.message);
    return [];
  }
}

// ⏰ Función auxiliar para pausas
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🚀 EJECUTAR SCRIPT (solo si se ejecuta directamente)
console.log("🛒 EXTRACTOR DE PRODUCTOS DE MERCADOLIBRE");
console.log("=" .repeat(60));
console.log("🔍 Verificando configuración...");
console.log(`   Usuario objetivo: ${TARGET_USER_ID}`);
console.log(`   Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
console.log("");

getAllProducts()
  .then(productos => {
    console.log("\n🎊 ¡EXTRACCIÓN COMPLETADA EXITOSAMENTE!");
    console.log(`📁 Archivos generados:`);
    console.log(`   - public/productos_mercadolibre.json (datos completos)`);
    console.log(`   - productos_mercadolibre.csv (tabla simple)`);
    console.log(`📊 Total de productos extraídos: ${productos.length}`);
  })
  .catch(error => {
    console.error("\n💥 ERROR FATAL:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  });

// Exportar funciones para uso como módulo
export {
  getAllProducts,
  loadProductsFromJSON,
  TARGET_USER_ID,
  ACCESS_TOKEN
};