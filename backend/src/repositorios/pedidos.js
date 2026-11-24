import { aObjectId, coleccion, enTransaccion } from "../db.js"

export async function listarActivos() {
  return await coleccion("pedidos")
    .find({ estado: { $ne: "entregado" } })
    .sort({ _id: 1 })
    .toArray()
}

export async function listarConDemora() {
  return await coleccion("pedidos")
    .find({ demora: { $ne: null }, estado: { $ne: "entregado" } })
    .sort({ _id: 1 })
    .toArray()
}

export async function listarPorFecha(desde, hasta) {
  return await coleccion("pedidos")
    .find({ fecha: { $gte: desde, $lte: hasta } })
    .sort({ _id: 1 })
    .toArray()
}

export async function listarPorCliente(clienteId, estado) {
  const filtro = estado === undefined ? { clienteId } : { clienteId, estado }

  return await coleccion("pedidos").find(filtro).sort({ _id: 1 }).toArray()
}

export async function buscarPorId(id) {
  const _id = aObjectId(id)

  return _id ? await coleccion("pedidos").findOne({ _id }) : undefined
}

export async function actualizar(id, cambiar) {
  const pedidos = coleccion("pedidos")
  const _id = aObjectId(id)

  if (!_id) {
    return undefined
  }

  return await enTransaccion(async (session) => {
    const pedido = await pedidos.findOne({ _id }, { session })

    if (!pedido) {
      return undefined
    }

    const resultado = await cambiar(pedido)
    await pedidos.replaceOne({ _id }, pedido, { session })

    return resultado
  })
}

export async function crearDescontandoStock(pedido) {
  const productos = coleccion("productos")
  const pedidos = coleccion("pedidos")

  return await enTransaccion(async (session) => {
    for (const { productoId, cantidad } of pedido.items) {
      const { modifiedCount } = await productos.updateOne(
        { _id: productoId, stock: { $gte: cantidad } },
        { $inc: { stock: -cantidad } },
        { session }
      )

      if (modifiedCount === 0) {
        await session.abortTransaction()
        return { ok: false, productoId }
      }
    }

    await pedidos.insertOne(pedido, { session })

    return { ok: true }
  })
}
