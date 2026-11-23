import * as repositorio from "../repositorios/zonas-envio.js"

export async function listar() {
  return await repositorio.listar()
}
