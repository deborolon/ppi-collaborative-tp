import * as repositorio from "../repositorios/pedidos.js"
import { esFechaValida, fechaDe } from "./fechas.js"
import { ESTADOS } from "./pedidos.js"
import * as productos from "./productos.js"

const MENSAJE_SIN_VENTAS = "No se registran ventas para la fecha seleccionada"
const MENSAJE_SIN_RANKING =
  "No hay datos de ventas suficientes para generar el ranking en el período seleccionado"

const invalido = (error) => ({ estado: "invalido", error })

function resolverPeriodo(desde, hasta) {
  const hoy = fechaDe(new Date())
  const periodo = { desde: desde ?? hoy, hasta: hasta ?? hoy }

  if (!esFechaValida(periodo.desde) || !esFechaValida(periodo.hasta)) {
    return { error: "Las fechas deben tener el formato AAAA-MM-DD." }
  }

  if (periodo.desde > periodo.hasta) {
    return { error: "La fecha de inicio no puede ser posterior a la fecha de fin." }
  }

  return periodo
}

async function pedidosDelPeriodo({ desde, hasta }) {
  const pedidos = await repositorio.listar()
  return pedidos.filter((pedido) => pedido.fecha >= desde && pedido.fecha <= hasta)
}

export async function resumir(desde, hasta) {
  const periodo = resolverPeriodo(desde, hasta)

  if (periodo.error) {
    return invalido(periodo.error)
  }

  const pedidos = await pedidosDelPeriodo(periodo)
  const entregados = pedidos.filter((pedido) => pedido.estado === "entregado")
  const facturacion = entregados.reduce((suma, pedido) => suma + pedido.total, 0)

  return {
    estado: "ok",
    resumen: {
      ...periodo,
      totalPedidos: pedidos.length,
      porEstado: ESTADOS.map((estado) => ({
        estado,
        cantidad: pedidos.filter((pedido) => pedido.estado === estado).length,
      })),
      facturacion,
      ticketPromedio: entregados.length > 0 ? Math.round(facturacion / entregados.length) : 0,
      mensaje: pedidos.length === 0 ? MENSAJE_SIN_VENTAS : null,
    },
  }
}

export async function rankear(desde, hasta, categoria) {
  const periodo = resolverPeriodo(desde, hasta)

  if (periodo.error) {
    return invalido(periodo.error)
  }

  const catalogo = await productos.listar()
  const categoriasValidas = [...new Set(catalogo.map((producto) => producto.categoria))]

  if (categoria !== undefined && !categoriasValidas.includes(categoria)) {
    return invalido("La categoría indicada no es válida.")
  }

  const categoriaPorProducto = new Map(catalogo.map((producto) => [producto.id, producto.categoria]))
  const pedidos = await pedidosDelPeriodo(periodo)
  const unidades = new Map()

  for (const pedido of pedidos.filter((actual) => actual.estado === "entregado")) {
    for (const { productoId, nombre, cantidad } of pedido.items) {
      if (categoria !== undefined && categoriaPorProducto.get(productoId) !== categoria) continue

      const actual = unidades.get(productoId) ?? { productoId, nombre, unidades: 0 }
      actual.unidades += cantidad
      unidades.set(productoId, actual)
    }
  }

  const productos = [...unidades.values()].sort(
    (a, b) => b.unidades - a.unidades || a.nombre.localeCompare(b.nombre)
  )

  return {
    estado: "ok",
    ranking: { ...periodo, productos, mensaje: productos.length === 0 ? MENSAJE_SIN_RANKING : null },
  }
}
