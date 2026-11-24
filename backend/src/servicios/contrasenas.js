import { scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const derivar = promisify(scrypt)

export async function verificar(password, almacenado) {
  const [algoritmo, sal, hash] = almacenado.split("$")

  if (algoritmo !== "scrypt" || !sal || !hash) {
    return false
  }

  const esperado = Buffer.from(hash, "hex")
  const calculado = await derivar(password, Buffer.from(sal, "hex"), esperado.length)
  return timingSafeEqual(calculado, esperado)
}
