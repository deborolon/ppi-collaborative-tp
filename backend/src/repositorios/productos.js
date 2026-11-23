import datos from "../../data/datos.json" with { type: "json" }

export async function listar() {
  return datos.productos
}

export async function buscarPorId(id) {
  return datos.productos.find((producto) => producto.id === id)
}
