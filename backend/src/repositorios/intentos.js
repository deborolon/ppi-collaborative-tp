import { fileURLToPath } from "node:url"
import { leer, modificar } from "./almacen-json.js"

const ARCHIVO = fileURLToPath(new URL("../../data/intentos.json", import.meta.url))
const ESTADO_INICIAL = { fallidos: 0, bloqueadoHasta: null }

export async function obtener(usuarioId) {
  const intentos = await leer(ARCHIVO, {})
  return intentos[usuarioId] ?? ESTADO_INICIAL
}

export async function actualizar(usuarioId, transformar) {
  return await modificar(ARCHIVO, {}, (intentos) => {
    const nuevo = transformar(intentos[usuarioId] ?? ESTADO_INICIAL)
    intentos[usuarioId] = nuevo
    return nuevo
  })
}

export async function reiniciar(usuarioId) {
  await modificar(ARCHIVO, {}, (intentos) => {
    delete intentos[usuarioId]
  })
}
