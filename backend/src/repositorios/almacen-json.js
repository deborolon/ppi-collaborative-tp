import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

const colas = new Map()

export async function leer(ruta, valorInicial) {
  try {
    return JSON.parse(await readFile(ruta, "utf-8"))
  } catch (error) {
    if (error.code === "ENOENT") {
      return valorInicial
    }
    throw error
  }
}

async function escribir(ruta, valor) {
  const temporal = `${ruta}.${process.pid}.tmp`
  await mkdir(dirname(ruta), { recursive: true })
  await writeFile(temporal, JSON.stringify(valor, null, 2))
  await rename(temporal, ruta)
}

export function modificar(ruta, valorInicial, transformar) {
  const turno = (colas.get(ruta) ?? Promise.resolve()).then(async () => {
    const valor = await leer(ruta, valorInicial)
    const resultado = await transformar(valor)
    await escribir(ruta, valor)
    return resultado
  })

  colas.set(ruta, turno.catch(() => {}))
  return turno
}
