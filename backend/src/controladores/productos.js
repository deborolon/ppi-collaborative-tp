import * as servicio from "../servicios/productos.js"

export async function listar(req, res) {
  res.status(200).json(await servicio.listar())
}

export async function obtener(req, res) {
  const producto = await servicio.obtener(req.params.id)

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado." })
  }

  res.status(200).json(producto)
}
