export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." })
}

export function manejarErrores(error, req, res, next) {
  console.error(error)
  res.status(500).json({ error: "Error interno del servidor." })
}
