import * as repositorio from "../repositorios/ingredientes.js"

export async function listar() {
  return await repositorio.listar()
}
