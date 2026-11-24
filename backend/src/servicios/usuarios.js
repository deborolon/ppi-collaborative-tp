import * as repositorio from "../repositorios/usuarios.js"

function sinCredenciales({ passwordHash, ...usuario }) {
  return usuario
}

export async function listar() {
  const usuarios = await repositorio.listar()
  return usuarios.map(sinCredenciales)
}
