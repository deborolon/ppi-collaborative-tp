import * as ingredientes from "./ingredientes.js"
import * as pedidos from "./pedidos.js"
import * as productos from "./productos.js"
import * as usuarios from "./usuarios.js"
import * as zonasEnvio from "./zonas-envio.js"

export async function obtener() {
  const [
    listaUsuarios,
    listaProductos,
    listaZonasEnvio,
    listaIngredientes,
    listaPedidos,
  ] = await Promise.all([
    usuarios.listar(),
    productos.listar(),
    zonasEnvio.listar(),
    ingredientes.listar(),
    pedidos.listar(),
  ])

  return {
    usuarios: listaUsuarios.map(({ id, nombre, rol }) => ({ id, nombre, rol })),
    productos: listaProductos,
    zonasEnvio: listaZonasEnvio,
    ingredientes: listaIngredientes,
    pedidos: listaPedidos,
  }
}
