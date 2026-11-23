import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const derivar = promisify(scrypt)
const LONGITUD_HASH = 64

export async function hashear(password) {
  const sal = randomBytes(16)
  const hash = await derivar(password, sal, LONGITUD_HASH)
  return `scrypt$${sal.toString("hex")}$${hash.toString("hex")}`
}

export async function verificar(password, almacenado) {
  const [algoritmo, sal, hash] = almacenado.split("$")

  if (algoritmo !== "scrypt" || !sal || !hash) {
    return false
  }

  const esperado = Buffer.from(hash, "hex")
  const calculado = await derivar(password, Buffer.from(sal, "hex"), esperado.length)
  return timingSafeEqual(calculado, esperado)
}
