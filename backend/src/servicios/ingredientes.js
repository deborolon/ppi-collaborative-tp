import * as repositorio from "../repositorios/ingredientes.js"

function nivelDe({ stock, minimo }) {
  if (stock <= 0) return "agotado"
  return stock <= minimo ? "bajo" : "suficiente"
}

export async function listar(rol) {
  const ingredientes = await repositorio.listar()
  const resultado = ingredientes.map((ingrediente) => ({ ...ingrediente, nivel: nivelDe(ingrediente) }))

  if (rol !== "cocina") return resultado

  const gravedad = { agotado: 0, bajo: 1, suficiente: 2 }
  return resultado.sort((a, b) => gravedad[a.nivel] - gravedad[b.nivel])
}
