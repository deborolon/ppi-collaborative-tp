import { fileURLToPath } from "node:url"
import datos from "../../data/datos.json" with { type: "json" }
import { leer, modificar } from "./almacen-json.js"

const ARCHIVO = fileURLToPath(new URL("../../data/pedidos.json", import.meta.url))

const inicial = () => structuredClone(datos.pedidos)

export async function listar() {
  return await leer(ARCHIVO, inicial())
}

export async function listarPorCliente(clienteId, estado) {
  const pedidos = await listar()

  return pedidos.filter(
    (pedido) => pedido.clienteId === clienteId && (estado === undefined || pedido.estado === estado)
  )
}

export async function buscarPorId(id) {
  const pedidos = await listar()
  return pedidos.find((pedido) => pedido.id === id)
}

export async function crear(pedido) {
  return await modificar(ARCHIVO, inicial(), (pedidos) => {
    const ultimo = Math.max(0, ...pedidos.map((actual) => Number(actual.id.slice(3))))
    const nuevo = { id: `BC-${ultimo + 1}`, ...pedido }

    pedidos.push(nuevo)
    return nuevo
  })
}
