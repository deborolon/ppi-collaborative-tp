import { aObjectId, coleccion } from "../db.js"

export async function listar() {
  return await coleccion("productos").find().sort({ _id: 1 }).toArray()
}

export async function buscarPorId(id) {
  const _id = aObjectId(id)

  return _id ? await coleccion("productos").findOne({ _id }) : undefined
}
