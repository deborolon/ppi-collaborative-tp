import * as servicio from "../servicios/usuarios.js"

export async function listar(req, res) {
  res.status(200).json(await servicio.listar())
}

export async function obtener(req, res) {
  const usuario = await servicio.obtener(req.params.id)

  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  res.status(200).json(usuario)
}
