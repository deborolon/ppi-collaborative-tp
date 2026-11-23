import * as repositorio from "../repositorios/pedidos.js"
import * as productos from "./productos.js"
import * as zonasEnvio from "./zonas-envio.js"

const ESPERA_MINUTOS = 15
const MAXIMO_DIRECCION = 200

const formatoFecha = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Buenos_Aires",
})

const invalido = (error) => ({ estado: "invalido", error })

function esItemValido(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.productoId === "string" &&
    Number.isInteger(item.cantidad) &&
    item.cantidad > 0
  )
}

async function resolverEntrega(modalidad, zonaId, direccion) {
  if (modalidad === "takeaway") {
    return { zonaId: "takeaway", direccion: "", costoEnvio: 0 }
  }

  const zona = typeof zonaId === "string" ? await zonasEnvio.obtener(zonaId) : undefined

  if (!zona || zona.id === "takeaway") {
    return { error: "Elegí una zona de envío válida." }
  }

  const direccionLimpia = typeof direccion === "string" ? direccion.trim() : ""

  if (!direccionLimpia) {
    return { error: "Ingresá la dirección de entrega para confirmar el pedido." }
  }

  if (direccionLimpia.length > MAXIMO_DIRECCION) {
    return { error: "La dirección de entrega es demasiado larga." }
  }

  return { zonaId: zona.id, direccion: direccionLimpia, costoEnvio: zona.costo }
}

export async function listar() {
  return await repositorio.listar()
}

export async function obtener(id) {
  return await repositorio.buscarPorId(id)
}

export async function crear(usuario, solicitud) {
  const { items, modalidad, zonaId, direccion } = solicitud ?? {}

  if (!Array.isArray(items) || items.length === 0) {
    return invalido("Elegí al menos un producto para confirmar la compra.")
  }

  if (!items.every(esItemValido)) {
    return invalido("Los productos del pedido no son válidos.")
  }

  if (modalidad !== "delivery" && modalidad !== "takeaway") {
    return invalido("Elegí una modalidad de entrega válida.")
  }

  const entrega = await resolverEntrega(modalidad, zonaId, direccion)

  if (entrega.error) {
    return invalido(entrega.error)
  }

  const lineas = []

  for (const item of items) {
    const producto = await productos.obtener(item.productoId)

    if (!producto) {
      return invalido("Uno de los productos del pedido no existe.")
    }

    if (item.precio !== undefined && item.precio !== producto.precio) {
      return {
        estado: "precio-inconsistente",
        error: `El precio de ${producto.nombre} cambió. Actualizá la página e intentá de nuevo.`,
      }
    }

    const existente = lineas.find((linea) => linea.productoId === producto.id)

    if (existente) {
      existente.cantidad += item.cantidad
    } else {
      lineas.push({
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio: producto.precio,
      })
    }
  }

  const reserva = await productos.descontarStock(lineas)

  if (!reserva.ok) {
    const { nombre, stock } = reserva.producto

    return {
      estado: "sin-stock",
      error:
        stock <= 0
          ? `${nombre}: producto agotado.`
          : `No hay stock suficiente de ${nombre}. Disponible: ${stock}.`,
    }
  }

  const subtotal = lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)

  try {
    const pedido = await repositorio.crear({
      clienteId: usuario.id,
      items: lineas,
      modalidad,
      zonaId: entrega.zonaId,
      direccion: entrega.direccion,
      costoEnvio: entrega.costoEnvio,
      subtotal,
      total: subtotal + entrega.costoEnvio,
      estado: "pendiente",
      fecha: formatoFecha.format(new Date()),
      esperaMin: ESPERA_MINUTOS,
    })

    return { estado: "ok", pedido }
  } catch (error) {
    await productos.reponerStock(lineas)
    throw error
  }
}
