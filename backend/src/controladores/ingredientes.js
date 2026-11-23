import * as servicio from "../servicios/ingredientes.js"

export async function listar(req, res) {
  res.status(200).json(await servicio.listar(req.usuario.rol))
}
