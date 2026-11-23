import { ErrorHttp } from "../errores.js"
import * as repositorio from "../repositorios/productos.js"

export async function listar() {
  return await repositorio.listar()
}

export async function obtener(id) {
  const producto = await repositorio.buscarPorId(id)

  if (!producto) {
    throw new ErrorHttp(404, "Producto no encontrado.")
  }

  return producto
}
