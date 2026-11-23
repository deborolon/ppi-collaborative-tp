import * as repositorio from "../repositorios/productos.js"

export async function listar() {
  return await repositorio.listar()
}

export async function obtener(id) {
  return await repositorio.buscarPorId(id)
}

export async function descontarStock(lineas) {
  return await repositorio.descontarStock(lineas)
}

export async function reponerStock(lineas) {
  await repositorio.reponerStock(lineas)
}
