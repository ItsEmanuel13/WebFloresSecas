
import { fetchProducts } from "../updateProducts.js";

export default async function handler(req, res) {
  try {
    await fetchProducts();
    res.status(200).json({ message: "✅ Productos actualizados correctamente" });
  } catch (error) {
    console.error("❌ Error en updateProducts API:", error.message);
    res.status(500).json({ error: "Error al actualizar productos" });
  }
}