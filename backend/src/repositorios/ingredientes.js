import datos from "../../data/datos.json" with { type: "json" }

export async function listar() {
  return datos.ingredientes
}
