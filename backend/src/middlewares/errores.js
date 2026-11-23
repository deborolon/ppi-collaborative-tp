import { ErrorHttp } from "../errores.js"

export function rutaNoEncontrada(req, res, next) {
  next(new ErrorHttp(404, "Ruta no encontrada."))
}

export function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorHttp) {
    return res.status(error.estado).json({ error: error.message })
  }

  console.error(error)
  res.status(500).json({ error: "Error interno del servidor." })
}
