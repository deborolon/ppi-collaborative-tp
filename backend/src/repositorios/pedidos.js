import { ObjectId } from "mongodb"
import { coleccion, enTransaccion } from "../db.js"

export async function listar() {
  return await coleccion("pedidos").find().sort({ _id: 1 }).toArray()
}

export async function listarPorCliente(clienteId, estado) {
  const filtro = estado === undefined ? { clienteId } : { clienteId, estado }

  return await coleccion("pedidos").find(filtro).sort({ _id: 1 }).toArray()
}

export async function buscarPorId(id) {
  return await coleccion("pedidos").findOne({ _id: new ObjectId(id) })
}

export async function actualizar(id, cambiar) {
  const pedidos = coleccion("pedidos")
  const _id = new ObjectId(id)

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

export async function crear(pedido) {
  await coleccion("pedidos").insertOne(pedido)
  return pedido
}
