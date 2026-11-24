import { coleccion } from "../db.js"

export async function crear(sesion) {
  await coleccion("sesiones").insertOne(sesion)
}

export async function buscar(token) {
  return await coleccion("sesiones").findOne({ token })
}

export async function actualizar(token, campos) {
  await coleccion("sesiones").updateOne({ token }, { $set: campos })
}

export async function eliminar(token) {
  await coleccion("sesiones").deleteOne({ token })
}

export async function eliminarInactivas(limite) {
  await coleccion("sesiones").deleteMany({ ultimaActividad: { $lt: limite } })
}
