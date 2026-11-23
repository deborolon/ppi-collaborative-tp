import * as servicio from "../servicios/auth.js"

export async function iniciarSesion(req, res) {
  const { email, password } = req.body ?? {}

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return res.status(400).json({ error: "Ingresá tu usuario y contraseña." })
  }

  const resultado = await servicio.iniciarSesion(email.trim(), password)

  if (resultado.estado === "bloqueada") {
    const segundos = Math.ceil((resultado.bloqueadoHasta - Date.now()) / 1000)
    const minutos = Math.ceil(segundos / 60)

    res.set("Retry-After", String(segundos))
    return res.status(429).json({
      error: `Cuenta bloqueada temporalmente por intentos fallidos. Volvé a intentar en ${minutos} minutos.`,
    })
  }

  if (resultado.estado !== "ok") {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." })
  }

  res.status(200).json({ token: resultado.token, usuario: resultado.usuario })
}

export async function cerrarSesion(req, res) {
  await servicio.cerrarSesion(req.token)
  res.status(204).end()
}

export function obtenerSesion(req, res) {
  res.status(200).json(req.usuario)
}
