import * as servicio from "../servicios/productos.js"

export async function listar(req, res) {
  res.json(await servicio.listar())
}

export async function obtener(req, res) {
  res.json(await servicio.obtener(req.params.id))
}
