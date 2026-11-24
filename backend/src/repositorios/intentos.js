import { coleccion, enTransaccion } from "../db.js"

const ESTADO_INICIAL = { fallidos: 0, bloqueadoHasta: null }

export async function obtener(usuarioId) {
  return (await coleccion("intentos").findOne({ usuarioId })) ?? ESTADO_INICIAL
}

export async function actualizar(usuarioId, transformar) {
  const intentos = coleccion("intentos")

  return await enTransaccion(async (session) => {
    const actual = (await intentos.findOne({ usuarioId }, { session })) ?? ESTADO_INICIAL
    const nuevo = transformar(actual)

    await intentos.replaceOne({ usuarioId }, { usuarioId, ...nuevo }, { upsert: true, session })
    return nuevo
  })
}

export async function reiniciar(usuarioId) {
  await coleccion("intentos").deleteOne({ usuarioId })
}
