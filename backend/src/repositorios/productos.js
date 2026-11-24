import { ObjectId } from "mongodb"
import { coleccion, enTransaccion } from "../db.js"

export async function listar() {
  return await coleccion("productos").find().sort({ _id: 1 }).toArray()
}

export async function buscarPorId(id) {
  return await coleccion("productos").findOne({ _id: new ObjectId(id) })
}

export async function descontarStock(lineas) {
  const productos = coleccion("productos")

  const faltante = await enTransaccion(async (session) => {
    for (const { productoId, cantidad } of lineas) {
      const { modifiedCount } = await productos.updateOne(
        { _id: productoId, stock: { $gte: cantidad } },
        { $inc: { stock: -cantidad } },
        { session }
      )

      if (modifiedCount === 0) {
        await session.abortTransaction()
        return productoId
      }
    }
  })

  return faltante === undefined ? { ok: true } : { ok: false, producto: await buscarPorId(faltante) }
}

export async function reponerStock(lineas) {
  const productos = coleccion("productos")

  for (const { productoId, cantidad } of lineas) {
    await productos.updateOne({ _id: productoId }, { $inc: { stock: cantidad } })
  }
}
