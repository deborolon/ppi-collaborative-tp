import * as servicio from "../servicios/datos.js"

export async function obtener(req, res) {
  res.status(200).json(await servicio.obtener())
}
