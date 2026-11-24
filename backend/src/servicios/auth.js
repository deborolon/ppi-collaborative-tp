import { randomBytes } from "node:crypto"
import * as intentos from "../repositorios/intentos.js"
import * as sesiones from "../repositorios/sesiones.js"
import * as usuarios from "../repositorios/usuarios.js"
import { verificar } from "./contrasenas.js"

const MAXIMO_FALLIDOS = 3
const BLOQUEO_MS = 15 * 60 * 1000
const INACTIVIDAD_MS = 30 * 60 * 1000

function datosPublicos({ _id, nombre, apellido, rol }) {
  return { _id, nombre, apellido, rol }
}

export async function iniciarSesion(email, password) {
  const usuario = await usuarios.buscarPorEmail(email)

  if (!usuario) {
    return { estado: "credenciales-invalidas" }
  }

  const ahora = Date.now()
  const { bloqueadoHasta } = await intentos.obtener(usuario._id)

  if (bloqueadoHasta && bloqueadoHasta > ahora) {
    return { estado: "bloqueada", bloqueadoHasta }
  }

  if (!(await verificar(password, usuario.passwordHash))) {
    const estado = await intentos.actualizar(usuario._id, (actual) => {
      if (actual.bloqueadoHasta && actual.bloqueadoHasta > ahora) {
        return actual
      }

      const fallidos = actual.fallidos + 1
      return fallidos > MAXIMO_FALLIDOS
        ? { fallidos: 0, bloqueadoHasta: ahora + BLOQUEO_MS }
        : { fallidos, bloqueadoHasta: null }
    })

    return estado.bloqueadoHasta
      ? { estado: "bloqueada", bloqueadoHasta: estado.bloqueadoHasta }
      : { estado: "credenciales-invalidas" }
  }

  await intentos.reiniciar(usuario._id)
  await sesiones.eliminarInactivas(ahora - INACTIVIDAD_MS)

  const token = randomBytes(32).toString("hex")
  await sesiones.crear({ token, usuarioId: usuario._id, ultimaActividad: ahora })

  return { estado: "ok", token, usuario: datosPublicos(usuario) }
}

export async function validarSesion(token) {
  const sesion = await sesiones.buscar(token)

  if (!sesion) {
    return null
  }

  const ahora = Date.now()

  if (ahora - sesion.ultimaActividad > INACTIVIDAD_MS) {
    await sesiones.eliminar(token)
    return null
  }

  await sesiones.actualizar(token, { ultimaActividad: ahora })

  const usuario = await usuarios.buscarPorId(sesion.usuarioId)
  return usuario ? datosPublicos(usuario) : null
}

export async function cerrarSesion(token) {
  await sesiones.eliminar(token)
}
