import datos from "../../data/datos.json" with { type: "json" }

export async function listar() {
  return datos.zonasEnvio
}

export async function buscarPorId(id) {
  return datos.zonasEnvio.find((zona) => zona.id === id)
}
