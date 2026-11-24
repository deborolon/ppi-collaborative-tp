import { MongoClient, ObjectId } from "mongodb"

const FORMATO_ID = /^[0-9a-f]{24}$/i

const cliente = new MongoClient(process.env.MONGODB_URI)

export function coleccion(nombre) {
  return cliente.db(process.env.MONGODB_DB).collection(nombre)
}

export function aObjectId(id) {
  if (id instanceof ObjectId) {
    return id
  }

  return typeof id === "string" && FORMATO_ID.test(id) ? new ObjectId(id) : null
}

export function enTransaccion(trabajo) {
  return cliente.withSession((sesion) => sesion.withTransaction(() => trabajo(sesion)))
}
