import { fileURLToPath } from "node:url"
import datos from "../../data/datos.json" with { type: "json" }
import { leer, modificar } from "./almacen-json.js"

const ARCHIVO = fileURLToPath(new URL("../../data/productos.json", import.meta.url))

const inicial = () => structuredClone(datos.productos)

export async function listar() {
  return await leer(ARCHIVO, inicial())
}

export async function buscarPorId(id) {
  const productos = await listar()
  return productos.find((producto) => producto.id === id)
}

export async function descontarStock(lineas) {
  return await modificar(ARCHIVO, inicial(), (productos) => {
    for (const { productoId, cantidad } of lineas) {
      const producto = productos.find((actual) => actual.id === productoId)

      if (!producto || producto.stock < cantidad) {
        return { ok: false, producto }
      }
    }

    for (const { productoId, cantidad } of lineas) {
      productos.find((actual) => actual.id === productoId).stock -= cantidad
    }

    return { ok: true }
  })
}

export async function reponerStock(lineas) {
  await modificar(ARCHIVO, inicial(), (productos) => {
    for (const { productoId, cantidad } of lineas) {
      const producto = productos.find((actual) => actual.id === productoId)

      if (producto) {
        producto.stock += cantidad
      }
    }
  })
}
