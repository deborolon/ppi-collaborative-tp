import * as servicio from "../servicios/auth.js"

export async function autenticar(req, res, next) {
  const encabezado = req.get("Authorization") ?? ""
  const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : null
  const usuario = token ? await servicio.validarSesion(token) : null

  if (!usuario) {
    return res
      .status(401)
      .json({ error: "Sesión no iniciada o expirada. Iniciá sesión nuevamente." })
  }

  req.usuario = usuario
  req.token = token
  next()
}

export function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ error: "No tenés permisos para acceder a este recurso." })
    }

    next()
  }
}
