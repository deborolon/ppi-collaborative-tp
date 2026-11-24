import { ObjectId } from "mongodb"
import { coleccion } from "../db.js"

export async function listar() {
  return await coleccion("zonas_envio").find().sort({ _id: 1 }).toArray()
}

export async function buscarPorId(id) {
  return await coleccion("zonas_envio").findOne({ _id: new ObjectId(id) })
}
