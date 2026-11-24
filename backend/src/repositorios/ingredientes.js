import { coleccion } from "../db.js"

export async function listar() {
  return await coleccion("ingredientes").find().sort({ _id: 1 }).toArray()
}
