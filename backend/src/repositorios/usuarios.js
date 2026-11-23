import datos from "../../data/datos.json" with { type: "json" }

export async function listar() {
  return datos.usuarios
}

export async function buscarPorEmail(email) {
  return datos.usuarios.find(
    (usuario) => usuario.email.toLowerCase() === email.toLowerCase()
  )
}

export async function buscarPorId(id) {
  return datos.usuarios.find((usuario) => usuario.id === id)
}
