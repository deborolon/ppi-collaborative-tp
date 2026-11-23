import datos from "../../data/datos.json" with { type: "json" }

export async function listar() {
  return datos.pedidos
}

export async function buscarPorId(id) {
  return datos.pedidos.find((pedido) => pedido.id === id)
}
