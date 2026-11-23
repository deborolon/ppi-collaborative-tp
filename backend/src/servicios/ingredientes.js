import * as repositorio from "../repositorios/ingredientes.js"

function nivelDe({ stock, minimo }) {
  if (stock <= 0) return "agotado"
  return stock <= minimo ? "bajo" : "suficiente"
}

export async function listar() {
  const ingredientes = await repositorio.listar()
  return ingredientes.map((ingrediente) => ({ ...ingrediente, nivel: nivelDe(ingrediente) }))
}
