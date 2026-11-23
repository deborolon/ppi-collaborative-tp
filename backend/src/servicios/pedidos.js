import * as repositorio from "../repositorios/pedidos.js"

export async function listar() {
  return await repositorio.listar()
}

export async function obtener(id) {
  return await repositorio.buscarPorId(id)
}
