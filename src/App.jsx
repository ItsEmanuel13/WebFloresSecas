import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroPrecio, setFiltroPrecio] = useState('')
  const [filtroCondicion, setFiltroCondicion] = useState('')
  const [mostrarSinStock, setMostrarSinStock] = useState(false)
  const [ordenarPor, setOrdenarPor] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [imagenActual, setImagenActual] = useState(0)
  const [mostrarSoloActivos, setMostrarSoloActivos] = useState(true)

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/productos_mercadolibre.json')
      if (!response.ok) {
        throw new Error('No se pudo cargar los productos')
      }
      const data = await response.json()
      setProductos(data.productos || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatearPrecio = (precio, moneda) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda || 'ARS'
    }).format(precio)
  }

  // Función para mejorar la calidad de imagen
  const mejorarImagen = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=Sin+Imagen';
    
    // Corregir URLs malformadas y mejorar calidad
    const imagenMejorada = url
      .replace(/^http:\/\/http2\.mlstatic\.com/, 'https://http2.mlstatic.com') // Corregir protocolo
      .replace(/\.webp$/, '.jpg') // Convertir webp a jpg
      .replace(/D_NQ_NP_2X_/, 'D_NQ_NP_4X_') // Aumentar resolución
      .replace(/D_NQ_NP_/, 'D_NQ_NP_4X_') // Si no tiene 2X, agregar 4X
      .replace(/-F\.webp$/, '-F.jpg') // Convertir webp a jpg
      .replace(/-I\.jpg$/, '-F.jpg') // Cambiar vista inicial por frontal
      .replace(/-O\.jpg$/, '-F.jpg'); // Cambiar vista original por frontal
    
    return imagenMejorada;
  };

  // Función para manejar errores de imagen
  const handleImageError = (e) => {
    console.log('Error cargando imagen:', e.target.src);
    e.target.src = 'https://via.placeholder.com/400x400?text=Imagen+No+Disponible';
    e.target.onerror = null; // Evitar loop infinito
  };

  // Función para abrir modal
  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setImagenActual(0);
    setModalAbierto(true);
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
    document.body.style.overflow = 'auto'; // Restaurar scroll
  };

  // Función para cambiar imagen en la galería
  const cambiarImagen = (direccion) => {
    if (!productoSeleccionado) return;
    
    const totalImagenes = productoSeleccionado.galeria_imagenes.length;
    if (direccion === 'siguiente') {
      setImagenActual((prev) => (prev + 1) % totalImagenes);
    } else {
      setImagenActual((prev) => (prev - 1 + totalImagenes) % totalImagenes);
    }
  };

  // Función para ordenar productos
  const ordenarProductos = (productos) => {
    if (!ordenarPor) return productos;
    
    return [...productos].sort((a, b) => {
      switch (ordenarPor) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'vendidos-asc':
          return a.vendidos - b.vendidos;
        case 'vendidos-desc':
          return b.vendidos - a.vendidos;
        case 'stock-asc':
          return a.stock_disponible - b.stock_disponible;
        case 'stock-desc':
          return b.stock_disponible - a.stock_disponible;
        default:
          return 0;
      }
    });
  };

  const productosFiltrados = productos
    .filter(producto => {
      const cumpleBusqueda = !busqueda ||
        producto.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      const cumplePrecio = !filtroPrecio ||
        (filtroPrecio === 'menor1000' && producto.precio < 1000) ||
        (filtroPrecio === '1000-3000' && producto.precio >= 1000 && producto.precio <= 3000) ||
        (filtroPrecio === 'mayor3000' && producto.precio > 3000);
      const cumpleCondicion = !filtroCondicion || producto.condicion === filtroCondicion;
      const cumpleStock = mostrarSinStock || producto.stock_disponible > 0;
      const cumpleEstado = !mostrarSoloActivos || producto.estado === 'active';
      return cumpleBusqueda && cumplePrecio && cumpleCondicion && cumpleStock && cumpleEstado;
    });

  // Aplicar ordenamiento
  const productosOrdenados = ordenarProductos(productosFiltrados);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error al cargar productos</h2>
        <p>{error}</p>
        <button onClick={cargarProductos}>Reintentar</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
      <img src="/imagenes/logo.png" alt="Mi Imagen" />
        <h1>Mel Creaciones</h1>
        <div className="header-stats">
          <span>{productosOrdenados.length} productos únicos</span>
          <span>•</span>
          <span>{productosOrdenados.filter(p => p.estado === 'active').length} activos</span>
          <span>•</span>
          <span>Precios desde {formatearPrecio(Math.min(...productosOrdenados.map(p => p.precio || 0)), productosOrdenados[0]?.moneda)}</span>
        </div>
      </header>

      {/* Barra de búsqueda y filtros */}
      <div className="search-filter-bar">
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Buscar productos por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select 
            value={ordenarPor} 
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="sort-select"
          >
            <option value="">Ordenar por</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
            <option value="vendidos-desc">Más Vendidos</option>
            <option value="vendidos-asc">Menos Vendidos</option>
            <option value="stock-desc">Mayor Stock</option>
            <option value="stock-asc">Menor Stock</option>
          </select>
        </div>
        
        <div className="stock-filter-section">
          <label className="stock-checkbox">
            <input
              type="checkbox"
              checked={!mostrarSinStock}
              onChange={(e) => setMostrarSinStock(!e.target.checked)}
            />
            Solo productos en stock
          </label>
        </div>
        
        <div className="active-filter-section">
          <label className="active-checkbox">
            <input
              type="checkbox"
              checked={mostrarSoloActivos}
              onChange={(e) => setMostrarSoloActivos(e.target.checked)}
            />
            Solo productos activos
          </label>
        </div>
      </div>

      

      <div className="productos-grid">
        {productosOrdenados.map(producto => (
          <div 
            key={producto.id} 
            className="producto-card"
            onClick={() => abrirModal(producto)}
            style={{ cursor: 'pointer' }}
          >
            
            
            <div className="producto-imagen">
              <img 
                src={mejorarImagen(producto.imagen_principal)}
                alt={producto.titulo}
                loading="lazy"
                onError={handleImageError}
              />
            </div>
            
            <div className="producto-info">
              <h3 className="producto-titulo">{producto.titulo}</h3>
              
              <div className="producto-precio">
                <span className="precio-actual">
                  {formatearPrecio(producto.precio, producto.moneda)}
                </span>
              </div>

              <div className="producto-detalles"> 
                {producto.stock_disponible > 0 ? (
                  <span className="stock-badge">
                    🍃 Stock {producto.stock_disponible}
                  </span>
                ) : (
                  <span className="no-stock-badge">
                    ❌ Sin stock
                  </span>
                )}
                {producto.vendidos > 0 && (
                  <span className="vendidos-badge">
                    ⭐ {producto.vendidos} vendidas
                  </span>
                )}
              </div>

              <a 
                href={producto.link_producto} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-ver-producto"
                onClick={(e) => e.stopPropagation()}
              >
                VER EN MERCADO LIBRE →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal detallado */}
      {modalAbierto && productoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={cerrarModal}>×</button>
            
            <div className="modal-gallery">
              <button 
                className="gallery-nav prev" 
                onClick={() => cambiarImagen('anterior')}
                disabled={productoSeleccionado.galeria_imagenes.length <= 1}
              >
                ‹
              </button>
              
              <div className="gallery-main">
                <img 
                  src={mejorarImagen(productoSeleccionado.galeria_imagenes[imagenActual] || productoSeleccionado.imagen_principal)}
                  alt={productoSeleccionado.titulo}
                  onError={handleImageError}
                />
              </div>
              
              <button 
                className="gallery-nav next" 
                onClick={() => cambiarImagen('siguiente')}
                disabled={productoSeleccionado.galeria_imagenes.length <= 1}
              >
                ›
              </button>
            </div>

            {productoSeleccionado.galeria_imagenes.length > 1 && (
              <div className="gallery-thumbnails">
                {productoSeleccionado.galeria_imagenes.map((imagen, index) => (
                  <img
                    key={index}
                    src={mejorarImagen(imagen)}
                    alt={`${productoSeleccionado.titulo} - Imagen ${index + 1}`}
                    className={index === imagenActual ? 'active' : ''}
                    onClick={() => setImagenActual(index)}
                    onError={handleImageError}
                  />
                ))}
              </div>
            )}

            <div className="modal-info">
              <h2>{productoSeleccionado.titulo}</h2>
              
              <div className="modal-precio">
                <span className="precio-actual">
                  {formatearPrecio(productoSeleccionado.precio, productoSeleccionado.moneda)}
                </span>
                {productoSeleccionado.precio_original && productoSeleccionado.precio_original > productoSeleccionado.precio && (
                  <span className="precio-original">
                    {formatearPrecio(productoSeleccionado.precio_original, productoSeleccionado.moneda)}
                  </span>
                )}
              </div>

              <div className="modal-detalles">
                <span className="stock">
                  📦 Stock: {productoSeleccionado.stock_disponible}
                </span>
                {productoSeleccionado.vendidos > 0 && (
                  <span className="vendidos">
                    🏆 {productoSeleccionado.vendidos} vendidos
                  </span>
                )}
                <span className="ubicacion">
                  📍 {productoSeleccionado.ubicacion.ciudad}, {productoSeleccionado.ubicacion.estado}
                </span>
              </div>

              <div className="modal-descripcion">
                <h3>Descripción</h3>
                <p>{productoSeleccionado.descripcion}</p>
              </div>

              <a 
                href={productoSeleccionado.link_producto} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-ver-producto"
              >
                Ver en Mercado Libre →
              </a>
            </div>
          </div>
        </div>
      )}

      {productosOrdenados.length === 0 && (
        <div className="sin-resultados">
          <p>No se encontraron productos con los filtros seleccionados.</p>
          <button onClick={() => {
            setFiltroPrecio('')
            setFiltroCondicion('')
            setMostrarSinStock(false)
            setOrdenarPor('')
            setBusqueda('')
          }}>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}

export default App
