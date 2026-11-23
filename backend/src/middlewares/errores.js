export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." })
}

export function manejarErrores(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." })
  }

  console.error(error)
  res.status(500).json({ error: "Error interno del servidor." })
}
