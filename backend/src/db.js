import { MongoClient } from "mongodb"

const cliente = new MongoClient(process.env.MONGODB_URI)

export function coleccion(nombre) {
  return cliente.db(process.env.MONGODB_DB).collection(nombre)
}

export function enTransaccion(trabajo) {
  return cliente.withSession((sesion) => sesion.withTransaction(() => trabajo(sesion)))
}
