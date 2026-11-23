import * as repositorio from "../repositorios/zonas-envio.js"

export async function listar() {
  return await repositorio.listar()
}

export async function obtener(id) {
  return await repositorio.buscarPorId(id)
}
