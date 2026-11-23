import { fileURLToPath } from "node:url"
import { leer, modificar } from "./almacen-json.js"

const ARCHIVO = fileURLToPath(new URL("../../data/sesiones.json", import.meta.url))

export async function crear(sesion) {
  await modificar(ARCHIVO, [], (sesiones) => {
    sesiones.push(sesion)
  })
}

export async function buscar(token) {
  const sesiones = await leer(ARCHIVO, [])
  return sesiones.find((sesion) => sesion.token === token)
}

export async function actualizar(token, campos) {
  await modificar(ARCHIVO, [], (sesiones) => {
    const sesion = sesiones.find((actual) => actual.token === token)
    if (sesion) {
      Object.assign(sesion, campos)
    }
  })
}

export async function eliminar(token) {
  await modificar(ARCHIVO, [], (sesiones) => {
    const indice = sesiones.findIndex((sesion) => sesion.token === token)
    if (indice !== -1) {
      sesiones.splice(indice, 1)
    }
  })
}

export async function eliminarInactivas(limite) {
  await modificar(ARCHIVO, [], (sesiones) => {
    const vigentes = sesiones.filter((sesion) => sesion.ultimaActividad >= limite)
    sesiones.splice(0, sesiones.length, ...vigentes)
  })
}
