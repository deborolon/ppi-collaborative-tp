import { ObjectId } from "mongodb"
import { coleccion } from "../db.js"

const COLACION_EMAIL = { locale: "en", strength: 2 }

export async function listar() {
  return await coleccion("usuarios").find().sort({ _id: 1 }).toArray()
}

export async function buscarPorEmail(email) {
  return await coleccion("usuarios").findOne({ email }, { collation: COLACION_EMAIL })
}

export async function buscarPorId(id) {
  return await coleccion("usuarios").findOne({ _id: new ObjectId(id) })
}
