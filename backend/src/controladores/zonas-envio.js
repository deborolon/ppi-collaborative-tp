import * as servicio from "../servicios/zonas-envio.js"

export async function listar(req, res) {
  res.status(200).json(await servicio.listar())
}
