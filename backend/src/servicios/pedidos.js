import * as repositorio from "../repositorios/pedidos.js"
import { fechaDe, horaDe } from "./fechas.js"
import * as productos from "./productos.js"
import * as usuarios from "./usuarios.js"
import * as zonasEnvio from "./zonas-envio.js"

const ESPERA_MINUTOS = 15
const MAXIMO_DIRECCION = 200
export const ESTADOS = ["pendiente", "preparacion", "listo", "entregado"]
const SECUENCIA = {
  pendiente: { siguiente: "preparacion", texto: "Marchar" },
  preparacion: { siguiente: "listo", texto: "Despachar" },
  listo: { siguiente: "entregado", texto: "Entregar" },
}
const ESPERA_POR_ESTADO = { preparacion: 8, listo: 1, entregado: 0 }
const MENSAJE_NO_DISPONIBLES = "Uno o más productos del pedido original no están disponibles actualmente."
const MENSAJE_FUERA_DE_COBERTURA = "La dirección ingresada se encuentra fuera de la zona de cobertura"
const MENSAJE_SIN_COMANDAS = "No hay comandas pendientes en este momento"
const MENSAJE_ENTREGADO = "El pedido ya fue entregado y no puede modificarse"

const invalido = (error) => ({ estado: "invalido", error })

const esRepetible = (pedido) => pedido.estado === "entregado"

const accionDe = (pedido) => {
  const paso = SECUENCIA[pedido.estado]
  return paso ? { estado: paso.siguiente, texto: paso.texto } : null
}

const nombreDePila = (nombre) => nombre.split(" ")[0]

const marcaTiempo = (pedido) => `${pedido.fecha} ${pedido.hora ?? "00:00"}`
const numeroDePedido = (pedido) => Number(pedido.id.slice(3))

function masReciente(a, b) {
  return marcaTiempo(b).localeCompare(marcaTiempo(a)) || numeroDePedido(b) - numeroDePedido(a)
}

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

  if (!zona.cubierta) {
    return { error: MENSAJE_FUERA_DE_COBERTURA }
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

export async function listarComandas() {
  const [pedidos, clientes] = await Promise.all([repositorio.listar(), usuarios.listar()])
  const nombres = new Map(clientes.map((cliente) => [cliente.id, nombreDePila(cliente.nombre)]))

  const comandas = pedidos
    .filter((pedido) => pedido.estado !== "entregado")
    .sort((a, b) => masReciente(b, a))
    .map((pedido) => ({
      id: pedido.id,
      nombre: nombres.get(pedido.clienteId) ?? "Cliente",
      items: pedido.items.map(({ nombre, cantidad }) => ({ nombre, cantidad })),
      hora: pedido.hora ?? null,
      estado: pedido.estado,
      esperaMin: pedido.esperaMin,
      accion: accionDe(pedido),
    }))

  return { comandas, mensaje: comandas.length === 0 ? MENSAJE_SIN_COMANDAS : null }
}

export async function actualizarEstado(id, estadoNuevo) {
  if (!ESTADOS.includes(estadoNuevo)) {
    return invalido("El estado indicado no es válido.")
  }

  const resultado = await repositorio.actualizar(id, (pedido) => {
    if (pedido.estado === "entregado") {
      return { estado: "entregado", error: MENSAJE_ENTREGADO }
    }

    if (SECUENCIA[pedido.estado].siguiente !== estadoNuevo) {
      return {
        estado: "fuera-de-secuencia",
        error: "El pedido solo puede avanzar al estado siguiente de la secuencia.",
      }
    }

    pedido.estado = estadoNuevo
    pedido.esperaMin = ESPERA_POR_ESTADO[estadoNuevo]

    return { estado: "ok", pedido: { id: pedido.id, estado: pedido.estado, esperaMin: pedido.esperaMin } }
  })

  return resultado ?? { estado: "no-encontrado" }
}

export async function listarDeCliente(usuario, estado) {
  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return invalido("El estado indicado no es válido.")
  }

  const pedidos = await repositorio.listarPorCliente(usuario.id, estado)

  return {
    estado: "ok",
    pedidos: pedidos.sort(masReciente).map((pedido) => ({ ...pedido, repetible: esRepetible(pedido) })),
  }
}

export async function repetir(usuario, id) {
  const original = await repositorio.buscarPorId(id)

  if (!original || original.clienteId !== usuario.id) {
    return { estado: "no-encontrado" }
  }

  if (!esRepetible(original)) {
    return { estado: "no-repetible", error: "Solo se pueden repetir pedidos entregados." }
  }

  const items = []
  const noDisponibles = []

  for (const item of original.items) {
    const producto = await productos.obtener(item.productoId)

    if (producto && producto.stock >= item.cantidad) {
      items.push({
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio: producto.precio,
      })
    } else {
      noDisponibles.push({ productoId: item.productoId, nombre: item.nombre })
    }
  }

  const repeticion = { pedidoId: original.id, items, noDisponibles }

  if (noDisponibles.length > 0) {
    const nombres = noDisponibles.map((producto) => producto.nombre).join(", ")
    repeticion.mensaje = `${MENSAJE_NO_DISPONIBLES} Sin stock: ${nombres}.`
  }

  return { estado: "ok", repeticion }
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
  const ahora = new Date()

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
      fecha: fechaDe(ahora),
      hora: horaDe(ahora),
      esperaMin: ESPERA_MINUTOS,
    })

    return { estado: "ok", pedido }
  } catch (error) {
    await productos.reponerStock(lineas)
    throw error
  }
}
