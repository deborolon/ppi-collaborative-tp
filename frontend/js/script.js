function rutaBase() {
  return window.location.pathname.includes("/pages/") ? "../" : ""
}

const LS = {
  usuario: "bc_usuario",
  token: "bc_token",
  ultimoPedido: "bc_ultimo_pedido",
}

const COLOR_ESTADO = { pendiente: "rojo", preparacion: "amarillo", listo: "verde" }

const CLASE_BOTON_ESTADO = { preparacion: "btn-marchar", listo: "btn-despachar", entregado: "btn-despachar" }

const INTERVALO_ACTUALIZACION_MS = 5000

const ETIQUETA_ESTADO = {
  pendiente: "En espera",
  preparacion: "En preparación",
  listo: "Listo para retirar",
  entregado: "Entregado",
}

function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-AR")
}

async function llamarApi(ruta, opciones = {}) {
  const token = localStorage.getItem(LS.token)
  const encabezados = {}

  if (opciones.body) encabezados["Content-Type"] = "application/json"
  if (token) encabezados.Authorization = "Bearer " + token

  const respuesta = await fetch("/api" + ruta, { ...opciones, headers: encabezados })
  const cuerpo = await respuesta.json().catch(() => null)

  return { ok: respuesta.ok, status: respuesta.status, cuerpo }
}

function getUsuarioConectado() {
  return JSON.parse(localStorage.getItem(LS.usuario) || "null")
}

function setUsuarioConectado(usuario) {
  localStorage.setItem(LS.usuario, JSON.stringify(usuario))
}

function limpiarSesionLocal() {
  localStorage.removeItem(LS.usuario)
  localStorage.removeItem(LS.token)
}

function volverAlLogin() {
  limpiarSesionLocal()
  window.location.href = rutaBase() + "pages/login.html"
}

async function cerrarSesion() {
  const token = localStorage.getItem(LS.token)
  limpiarSesionLocal()

  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      })
    } catch (error) {
      console.error(error)
    }
  }

  window.location.replace(rutaBase() + "index.html")
}

async function validarSesion() {
  const token = localStorage.getItem(LS.token)

  if (!token) {
    localStorage.removeItem(LS.usuario)
    return
  }

  try {
    const respuesta = await fetch("/api/auth/sesion", {
      headers: { Authorization: "Bearer " + token },
    })

    if (respuesta.ok) {
      setUsuarioConectado(await respuesta.json())
    } else if (respuesta.status === 401) {
      limpiarSesionLocal()
    }
  } catch (error) {
    console.error(error)
  }
}

function renderizarNav() {
  const usuario = getUsuarioConectado()
  const rol = usuario ? usuario.rol : "visitante"

  document.querySelectorAll("[data-roles]").forEach((item) => {
    const roles = item.dataset.roles.split(" ")
    const visible = roles.includes("todos") || roles.includes(rol)
    item.style.display = visible ? "" : "none"
  })

  const saludo = document.querySelector("[data-usuario-conectado]")
  if (saludo) {
    saludo.textContent = usuario ? "Hola, " + usuario.nombre : ""
  }

  const btnSalir = document.querySelector("[data-cerrar-sesion]")
  if (btnSalir) {
    btnSalir.addEventListener("click", function (e) {
      e.preventDefault()
      cerrarSesion()
    })
  }
}

function protegerPagina() {
  const req = document.body.dataset.require
  if (!req) return true

  const rolesPermitidos = req.split(" ")
  const usuario = getUsuarioConectado()
  const rol = usuario ? usuario.rol : "visitante"

  if (!rolesPermitidos.includes(rol)) {
    window.location.href = rutaBase() + "pages/login.html"
    return false
  }
  return true
}

async function initMenu() {
  const contenedor = document.getElementById("menu-lista")
  if (!contenedor) return

  const respuesta = await llamarApi("/productos")

  if (!respuesta.ok) {
    contenedor.innerHTML = "<p>No pudimos cargar el menú. Intentá de nuevo en unos minutos.</p>"
    return
  }

  const productos = respuesta.cuerpo
  const categorias = [...new Set(productos.map((p) => p.categoria))]

  categorias.forEach((categoria) => {
    const seccion = document.createElement("section")
    seccion.className = "seccion"

    const titulo = document.createElement("h2")
    titulo.textContent = categoria
    seccion.appendChild(titulo)

    const grilla = document.createElement("div")
    grilla.className = "grilla"

    productos
      .filter((p) => p.categoria === categoria)
      .forEach((p) => grilla.appendChild(crearTarjetaProducto(p)))

    seccion.appendChild(grilla)
    contenedor.appendChild(seccion)
  })
}

function crearTarjetaProducto(producto) {
  const agotado = producto.stock <= 0

  const card = document.createElement("article")
  card.className = "card producto-card" + (agotado ? " producto-agotado" : "")

  if (producto.imagen) {
    const imagen = document.createElement("img")
    imagen.className = "producto-imagen"
    imagen.src = rutaBase() + "assets/" + producto.imagen
    imagen.alt = ""
    imagen.loading = "lazy"
    imagen.width = 180
    imagen.height = 180
    card.appendChild(imagen)
  }

  const body = document.createElement("div")
  body.className = "card-body"

  const h3 = document.createElement("h3")
  h3.textContent = producto.nombre
  body.appendChild(h3)

  const desc = document.createElement("p")
  desc.textContent = producto.descripcion || ""
  body.appendChild(desc)

  const precio = document.createElement("p")
  precio.className = "precio"
  precio.textContent = formatearPrecio(producto.precio)
  body.appendChild(precio)

  const estado = document.createElement("span")
  if (agotado) {
    estado.className = "agotado"
    estado.textContent = "Producto agotado"
  } else {
    estado.className = "estado-stock"
    estado.textContent = "Disponible"
  }
  body.appendChild(estado)

  card.appendChild(body)
  return card
}

async function initLogin() {
  const form = document.getElementById("form-login")
  if (!form) return

  const mensaje = document.getElementById("login-mensaje")

  form.addEventListener("submit", async function (e) {
    e.preventDefault()
    const email = document.getElementById("usuario").value.trim().toLowerCase()
    const password = document.getElementById("contrasena").value

    let respuesta
    try {
      respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
    } catch (error) {
      mensaje.textContent = "No se pudo conectar con el servidor. Volvé a intentar."
      mensaje.className = "aviso aviso-error"
      return
    }

    const resultado = await respuesta.json()

    if (!respuesta.ok) {
      mensaje.textContent = resultado.error
      mensaje.className = "aviso aviso-error"
      return
    }

    localStorage.setItem(LS.token, resultado.token)
    setUsuarioConectado(resultado.usuario)

    const destinos = {
      cliente: "pedido.html",
      cocina: "cocina.html",
      dueno: "tablero.html",
    }
    window.location.href = rutaBase() + "pages/" + destinos[resultado.usuario.rol]
  })
}

async function initPedido() {
  const contenedor = document.getElementById("pedido-productos")
  if (!contenedor) return

  const [respuestaProductos, respuestaZonas] = await Promise.all([
    llamarApi("/productos"),
    llamarApi("/zonas-envio"),
  ])

  if (!respuestaProductos.ok || !respuestaZonas.ok) {
    contenedor.innerHTML = "<p>No pudimos cargar el menú. Intentá de nuevo en unos minutos.</p>"
    return
  }

  const productos = respuestaProductos.cuerpo
  const zonasEnvio = respuestaZonas.cuerpo

  const categorias = [...new Set(productos.map((p) => p.categoria))]
  categorias.forEach((categoria) => {
    const seccion = document.createElement("section")
    seccion.className = "seccion"

    const titulo = document.createElement("h2")
    titulo.textContent = categoria
    seccion.appendChild(titulo)

    const grilla = document.createElement("div")
    grilla.className = "grilla"

    productos
      .filter((p) => p.categoria === categoria)
      .forEach((p) => grilla.appendChild(crearItemPedido(p)))

    seccion.appendChild(grilla)
    contenedor.appendChild(seccion)
  })

  const selectZona = document.getElementById("zona")
  zonasEnvio
    .filter((z) => z.id !== "takeaway")
    .forEach((z) => {
      const opt = document.createElement("option")
      opt.value = z.id
      opt.textContent = z.costo === null ? z.nombre : z.nombre + " — " + formatearPrecio(z.costo)
      selectZona.appendChild(opt)
    })

  const recalcular = () => actualizarResumen(zonasEnvio)
  contenedor.addEventListener("input", recalcular)
  document.querySelectorAll("[name='modalidad']").forEach((r) =>
    r.addEventListener("change", recalcular)
  )
  selectZona.addEventListener("change", recalcular)

  const pedidoARepetir = new URLSearchParams(window.location.search).get("repetir")
  if (pedidoARepetir) await precargarRepeticion(pedidoARepetir)

  actualizarResumen(zonasEnvio)

  document.getElementById("form-pedido").addEventListener("submit", async function (e) {
    e.preventDefault()
    const error = document.getElementById("pedido-error")
    const boton = this.querySelector("button[type='submit']")
    const items = leerItemsSeleccionados()
    const modalidad = document.querySelector("[name='modalidad']:checked").value

    error.textContent = ""
    boton.disabled = true

    let respuesta
    try {
      respuesta = await llamarApi("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          items,
          modalidad,
          zonaId: modalidad === "delivery" ? selectZona.value : "takeaway",
          direccion: document.getElementById("direccion").value,
        }),
      })
    } catch (excepcion) {
      console.error(excepcion)
    }

    if (respuesta && respuesta.ok) {
      localStorage.setItem(LS.ultimoPedido, JSON.stringify(respuesta.cuerpo))
      window.location.href = rutaBase() + "pages/confirmacion.html"
      return
    }

    if (respuesta && respuesta.status === 401) {
      volverAlLogin()
      return
    }

    error.textContent =
      (respuesta && respuesta.cuerpo && respuesta.cuerpo.error) ||
      "No pudimos registrar el pedido. Intentá de nuevo."
    boton.disabled = false
  })
}

function mostrarAviso(id, texto, clase) {
  const aviso = document.getElementById(id)
  aviso.textContent = texto
  aviso.className = texto ? clase : ""
}

async function precargarRepeticion(pedidoId) {
  const respuesta = await llamarApi("/pedidos/" + encodeURIComponent(pedidoId) + "/repetir")

  if (respuesta.status === 401) {
    volverAlLogin()
    return
  }

  if (!respuesta.ok) {
    mostrarAviso(
      "pedido-aviso",
      (respuesta.cuerpo && respuesta.cuerpo.error) || "No pudimos cargar el pedido anterior.",
      "aviso aviso-error"
    )
    return
  }

  const { items, mensaje } = respuesta.cuerpo
  const inputs = document.querySelectorAll("#pedido-productos input[type='number']")

  items.forEach((item) => {
    const input = [...inputs].find((actual) => actual.dataset.productoId === item.productoId)
    if (input) input.value = item.cantidad
  })

  if (mensaje) mostrarAviso("pedido-aviso", mensaje, "aviso")
}

function crearItemPedido(producto) {
  const agotado = producto.stock <= 0

  const wrap = document.createElement("div")
  wrap.className = "producto" + (agotado ? " producto-agotado" : "")

  const campo = document.createElement("div")
  campo.className = "campo"

  const label = document.createElement("label")
  label.setAttribute("for", producto.id)
  label.textContent = producto.nombre + " — " + formatearPrecio(producto.precio)

  if (agotado) {
    const span = document.createElement("span")
    span.className = "agotado"
    span.textContent = "Producto agotado"
    label.appendChild(document.createTextNode(" "))
    label.appendChild(span)
  }

  const input = document.createElement("input")
  input.type = "number"
  input.id = producto.id
  input.min = "0"
  input.value = "0"
  input.dataset.precio = producto.precio
  input.dataset.productoId = producto.id
  if (agotado) input.disabled = true

  campo.appendChild(label)
  campo.appendChild(input)
  wrap.appendChild(campo)
  return wrap
}

function leerItemsSeleccionados() {
  const items = []
  document.querySelectorAll("#pedido-productos input[type='number']").forEach((input) => {
    const cantidad = parseInt(input.value, 10) || 0
    if (cantidad > 0) {
      items.push({
        productoId: input.dataset.productoId,
        cantidad: cantidad,
        precio: parseInt(input.dataset.precio, 10),
      })
    }
  })
  return items
}

function actualizarResumen(zonasEnvio) {
  const items = leerItemsSeleccionados()
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  const modalidad = document.querySelector("[name='modalidad']:checked").value
  const selectZona = document.getElementById("zona")
  const campoDireccion = document.getElementById("bloque-direccion")

  let costoEnvio = 0
  if (modalidad === "delivery") {
    const zona = zonasEnvio.find((z) => z.id === selectZona.value)
    costoEnvio = (zona && zona.costo) || 0
    selectZona.disabled = false
    if (campoDireccion) campoDireccion.style.display = ""
  } else {
    selectZona.disabled = true
    if (campoDireccion) campoDireccion.style.display = "none"
  }

  document.getElementById("resumen-subtotal").textContent = formatearPrecio(subtotal)
  document.getElementById("resumen-envio").textContent = formatearPrecio(costoEnvio)
  document.getElementById("resumen-total").textContent = formatearPrecio(subtotal + costoEnvio)
}

function initConfirmacion() {
  const contenedor = document.getElementById("ticket")
  if (!contenedor) return

  const pedido = JSON.parse(localStorage.getItem(LS.ultimoPedido) || "null")
  if (!pedido) {
    contenedor.innerHTML = "<p>No encontramos un pedido reciente. Volvé a armar tu compra.</p>"
    return
  }

  document.getElementById("ticket-numero").textContent = pedido.id
  document.getElementById("ticket-demora").textContent = pedido.esperaMin + " min"

  const lista = document.getElementById("ticket-items")
  pedido.items.forEach((i) => {
    const fila = document.createElement("div")
    fila.className = "fila"
    const desc = document.createElement("span")
    desc.textContent = i.cantidad + "× " + i.nombre
    const monto = document.createElement("span")
    monto.textContent = formatearPrecio(i.precio * i.cantidad)
    fila.appendChild(desc)
    fila.appendChild(monto)
    lista.appendChild(fila)
  })

  document.getElementById("ticket-subtotal").textContent = formatearPrecio(pedido.subtotal)
  document.getElementById("ticket-envio").textContent = formatearPrecio(pedido.costoEnvio)
  document.getElementById("ticket-total").textContent = formatearPrecio(pedido.total)

  const modalidad = document.getElementById("ticket-modalidad")
  if (modalidad) {
    modalidad.textContent =
      pedido.modalidad === "delivery"
        ? "Delivery — " + (pedido.direccion || "sin dirección")
        : "Retiro en el local (take-away)"
  }
}

async function initMisPedidos() {
  const contenedor = document.getElementById("historial")
  const filtro = document.getElementById("filtro-estado")
  if (!contenedor || !filtro) return

  Object.entries(ETIQUETA_ESTADO).forEach(([valor, texto]) => {
    const opcion = document.createElement("option")
    opcion.value = valor
    opcion.textContent = texto
    filtro.appendChild(opcion)
  })

  let consultaActual = 0

  async function cargarHistorial() {
    const consulta = ++consultaActual
    const parametros = filtro.value ? "?estado=" + encodeURIComponent(filtro.value) : ""
    const respuesta = await llamarApi("/pedidos/mios" + parametros)

    if (consulta !== consultaActual) return

    if (respuesta.status === 401) {
      volverAlLogin()
      return
    }

    contenedor.innerHTML = ""

    if (!respuesta.ok) {
      contenedor.innerHTML = "<p>No pudimos cargar tus pedidos. Intentá de nuevo en unos minutos.</p>"
      return
    }

    if (respuesta.cuerpo.length === 0) {
      contenedor.innerHTML = "<p>No se registran pedidos para los parámetros seleccionados.</p>"
      return
    }

    respuesta.cuerpo.forEach((pedido) => contenedor.appendChild(crearTarjetaPedido(pedido)))
  }

  filtro.addEventListener("change", cargarHistorial)
  await cargarHistorial()
}

function formatearFechaHora(pedido) {
  const fecha = pedido.fecha.split("-").reverse().join("/")
  return pedido.hora ? fecha + " · " + pedido.hora : fecha
}

function crearTarjetaPedido(pedido) {
  const card = document.createElement("article")
  card.className = "card pedido-historial"

  const body = document.createElement("div")
  body.className = "card-body"

  const h3 = document.createElement("h3")
  h3.textContent = "Pedido " + pedido.id
  body.appendChild(h3)

  const estado = document.createElement("span")
  estado.className = "estado estado-" + pedido.estado
  estado.textContent = ETIQUETA_ESTADO[pedido.estado] || pedido.estado
  body.appendChild(estado)

  const fecha = document.createElement("p")
  fecha.textContent = formatearFechaHora(pedido)
  body.appendChild(fecha)

  const ul = document.createElement("ul")
  pedido.items.forEach((i) => {
    const li = document.createElement("li")
    li.textContent = i.cantidad + "× " + i.nombre
    ul.appendChild(li)
  })
  body.appendChild(ul)

  const total = document.createElement("p")
  total.innerHTML = "<strong>Total:</strong> " + formatearPrecio(pedido.total)
  body.appendChild(total)

  if (pedido.repetible) {
    const repetir = document.createElement("a")
    repetir.className = "btn"
    repetir.href = "pedido.html?repetir=" + encodeURIComponent(pedido.id)
    repetir.textContent = "Repetir compra"
    body.appendChild(repetir)
  }

  card.appendChild(body)
  return card
}

function mensajeDeError(respuesta, porDefecto) {
  return (respuesta.cuerpo && respuesta.cuerpo.error) || porDefecto
}

function renderAvisoStock(ingredientes) {
  const contenedor = document.getElementById("aviso-stock")
  const escasos = ingredientes.filter((i) => i.nivel !== "suficiente")

  if (escasos.length === 0) {
    contenedor.style.display = "none"
    return
  }

  const nombres = escasos
    .map((i) => i.nombre + (i.nivel === "agotado" ? " (agotado)" : " (" + i.stock + ")"))
    .join(", ")
  contenedor.innerHTML =
    "🟡 <strong>Aviso de stock:</strong> quedan pocas unidades de " +
    nombres +
    ". Avisar demoras si es necesario."
}

function crearComanda(comanda) {
  const articulo = document.createElement("article")
  articulo.className = "comanda " + (COLOR_ESTADO[comanda.estado] || "")

  const titulo = document.createElement("h3")
  titulo.textContent = "#" + comanda.id + " · " + comanda.nombre
  articulo.appendChild(titulo)

  const estado = document.createElement("p")
  const insignia = document.createElement("span")
  insignia.className = "estado estado-" + comanda.estado
  insignia.textContent = ETIQUETA_ESTADO[comanda.estado] || comanda.estado
  estado.appendChild(insignia)
  articulo.appendChild(estado)

  const ingreso = document.createElement("p")
  ingreso.innerHTML = "<strong>Ingreso:</strong> " + comanda.hora
  articulo.appendChild(ingreso)

  const lista = document.createElement("ul")
  comanda.items.forEach((item) => {
    const li = document.createElement("li")
    li.textContent = item.cantidad + "× " + item.nombre
    lista.appendChild(li)
  })
  articulo.appendChild(lista)

  const espera = document.createElement("p")
  espera.innerHTML = "<strong>Espera:</strong> " + comanda.esperaMin + " min"
  articulo.appendChild(espera)

  if (comanda.demora) {
    const demora = document.createElement("p")
    demora.className = "aviso aviso-error"
    demora.textContent = "Demora por falta de: " + comanda.demora.ingredientes.join(", ")
    articulo.appendChild(demora)
  }

  if (comanda.accion) {
    articulo.appendChild(
      botonCocina(comanda.id, comanda.accion.estado, comanda.accion.texto, CLASE_BOTON_ESTADO[comanda.accion.estado])
    )
  }

  const reportar = document.createElement("button")
  reportar.type = "button"
  reportar.className = "btn btn-claro btn-cocina"
  reportar.dataset.demora = comanda.id
  reportar.textContent = "Reportar demora"
  articulo.appendChild(reportar)

  return articulo
}

function botonCocina(pedidoId, estado, texto, clase) {
  const boton = document.createElement("button")
  boton.type = "button"
  boton.className = "btn btn-cocina " + clase
  boton.dataset.pedido = pedidoId
  boton.dataset.estado = estado
  boton.textContent = texto
  return boton
}

async function initCocina() {
  const contenedor = document.getElementById("comandas")
  if (!contenedor) return

  const dialogo = document.getElementById("dialogo-demora")
  const formulario = document.getElementById("form-demora")
  let pedidoConDemora = null
  let consultaActual = 0
  let vistaActual = ""

  async function cargarComandas() {
    const consulta = ++consultaActual
    const respuesta = await llamarApi("/pedidos/comandas")

    if (consulta !== consultaActual) return

    if (respuesta.status === 401) {
      volverAlLogin()
      return
    }

    if (!respuesta.ok) {
      vistaActual = ""
      contenedor.innerHTML = "<p>No pudimos cargar las comandas. Intentá de nuevo en unos minutos.</p>"
      return
    }

    const vista = JSON.stringify(respuesta.cuerpo)
    if (vista === vistaActual) return
    vistaActual = vista

    contenedor.innerHTML = ""

    if (respuesta.cuerpo.mensaje) {
      const mensaje = document.createElement("p")
      mensaje.textContent = respuesta.cuerpo.mensaje
      contenedor.appendChild(mensaje)
      return
    }

    respuesta.cuerpo.comandas.forEach((comanda) => contenedor.appendChild(crearComanda(comanda)))
  }

  const ingredientes = await llamarApi("/ingredientes")

  if (ingredientes.status === 401) {
    volverAlLogin()
    return
  }

  if (ingredientes.ok) {
    renderAvisoStock(ingredientes.cuerpo)

    const opciones = document.getElementById("demora-ingredientes")
    ingredientes.cuerpo.forEach((ingrediente) => {
      const etiqueta = document.createElement("label")
      const casilla = document.createElement("input")
      casilla.type = "checkbox"
      casilla.value = ingrediente.id
      etiqueta.appendChild(casilla)
      etiqueta.append(" " + ingrediente.nombre)
      opciones.appendChild(etiqueta)
    })
  }

  contenedor.addEventListener("click", async function (e) {
    const avance = e.target.closest("button[data-estado]")
    const demora = e.target.closest("button[data-demora]")

    if (avance) {
      avance.disabled = true
      const respuesta = await llamarApi(
        "/pedidos/" + encodeURIComponent(avance.dataset.pedido) + "/estado",
        { method: "PATCH", body: JSON.stringify({ estado: avance.dataset.estado }) }
      )

      if (respuesta.status === 401) {
        volverAlLogin()
        return
      }

      mostrarAviso(
        "cocina-aviso",
        respuesta.ok ? "" : mensajeDeError(respuesta, "No pudimos actualizar el pedido."),
        "aviso aviso-error"
      )
      await cargarComandas()
    }

    if (demora) {
      pedidoConDemora = demora.dataset.demora
      document.getElementById("demora-titulo").textContent = "Demora en el pedido #" + pedidoConDemora
      formulario.reset()
      mostrarAviso("demora-aviso", "", "")
      dialogo.showModal()
    }
  })

  formulario.addEventListener("submit", async function (e) {
    e.preventDefault()

    const faltantes = [...formulario.querySelectorAll("input:checked")].map((casilla) => casilla.value)
    const respuesta = await llamarApi(
      "/pedidos/" + encodeURIComponent(pedidoConDemora) + "/demora",
      { method: "POST", body: JSON.stringify({ ingredientes: faltantes }) }
    )

    if (respuesta.status === 401) {
      volverAlLogin()
      return
    }

    if (!respuesta.ok) {
      mostrarAviso("demora-aviso", mensajeDeError(respuesta, "No pudimos enviar el aviso."), "aviso aviso-error")
      return
    }

    dialogo.close()
    await cargarComandas()
  })

  document.getElementById("demora-cancelar").addEventListener("click", () => dialogo.close())

  await cargarComandas()
  setInterval(cargarComandas, INTERVALO_ACTUALIZACION_MS)
}

async function initTablero() {
  const contenedor = document.getElementById("tablero")
  if (!contenedor) return

  const formulario = document.getElementById("filtro-ventas")
  const desde = document.getElementById("ventas-desde")
  const hasta = document.getElementById("ventas-hasta")

  async function cargarVentas() {
    const parametros =
      desde.value && hasta.value
        ? "?desde=" + encodeURIComponent(desde.value) + "&hasta=" + encodeURIComponent(hasta.value)
        : ""
    const [ventas, ranking] = await Promise.all([
      llamarApi("/ventas" + parametros),
      llamarApi("/ventas/ranking" + parametros),
    ])

    if (ventas.status === 401 || ranking.status === 401) {
      volverAlLogin()
      return
    }

    if (!ventas.ok || !ranking.ok) {
      const fallida = ventas.ok ? ranking : ventas
      mostrarAviso("tablero-aviso", mensajeDeError(fallida, "No pudimos cargar las ventas."), "aviso aviso-error")
      return
    }

    const resumen = ventas.cuerpo
    desde.value = resumen.desde
    hasta.value = resumen.hasta
    mostrarAviso("tablero-aviso", resumen.mensaje || "", "aviso")

    document.getElementById("kpi-facturacion").textContent = formatearPrecio(resumen.facturacion)
    document.getElementById("kpi-pedidos").textContent = resumen.totalPedidos
    document.getElementById("kpi-ticket").textContent = formatearPrecio(resumen.ticketPromedio)

    const porEstado = document.getElementById("pedidos-por-estado")
    porEstado.innerHTML = ""
    resumen.porEstado.forEach(({ estado, cantidad }) => {
      const kpi = document.createElement("article")
      kpi.className = "kpi"

      const valor = document.createElement("span")
      valor.className = "kpi-valor"
      valor.textContent = cantidad

      const etiqueta = document.createElement("span")
      etiqueta.className = "kpi-label"
      etiqueta.textContent = ETIQUETA_ESTADO[estado] || estado

      kpi.append(valor, etiqueta)
      porEstado.appendChild(kpi)
    })

    const listaRanking = document.getElementById("ranking-productos")
    listaRanking.innerHTML = ""
    ranking.cuerpo.productos.forEach((producto, idx) => {
      const li = document.createElement("li")
      const posicion = document.createElement("span")
      posicion.className = "rank-pos"
      posicion.textContent = idx + 1
      const unidades = document.createElement("strong")
      unidades.textContent = producto.unidades + " u."
      li.append(posicion, " " + producto.nombre + " ", unidades)
      listaRanking.appendChild(li)
    })
    document.getElementById("ranking-mensaje").textContent = ranking.cuerpo.mensaje || ""
  }

  async function cargarDemoras() {
    const respuesta = await llamarApi("/pedidos/demoras")

    if (respuesta.status === 401) {
      volverAlLogin()
      return
    }

    const seccion = document.getElementById("seccion-demoras")
    const lista = document.getElementById("demoras")
    lista.innerHTML = ""

    if (!respuesta.ok || respuesta.cuerpo.length === 0) {
      seccion.style.display = "none"
      return
    }

    respuesta.cuerpo.forEach((demora) => {
      const li = document.createElement("li")
      li.className = "critico"
      li.textContent = "Pedido " + demora.id + " — falta: " + demora.ingredientes.join(", ")
      lista.appendChild(li)
    })
    seccion.style.display = ""
  }

  async function cargarIngredientes() {
    const respuesta = await llamarApi("/ingredientes")

    if (respuesta.status === 401) {
      volverAlLogin()
      return
    }

    if (!respuesta.ok) return

    const listaStock = document.getElementById("ingredientes-bajos")
    const escasos = respuesta.cuerpo.filter((i) => i.nivel !== "suficiente")

    if (escasos.length === 0) {
      listaStock.innerHTML = "<li>Todos los ingredientes con stock suficiente ✅</li>"
      return
    }

    escasos.forEach((i) => {
      const li = document.createElement("li")
      li.className = i.nivel === "agotado" ? "critico" : ""
      li.textContent = i.nombre + " — " + i.stock + " unidades" + (i.nivel === "agotado" ? " (agotado)" : "")
      listaStock.appendChild(li)
    })
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault()
    cargarVentas()
  })

  await Promise.all([cargarVentas(), cargarDemoras(), cargarIngredientes()])
  setInterval(cargarDemoras, INTERVALO_ACTUALIZACION_MS)
}

async function iniciar() {
  await validarSesion()

  if (!protegerPagina()) return

  renderizarNav()

  const pagina = document.body.dataset.page
  const rutas = {
    login: initLogin,
    menu: initMenu,
    pedido: initPedido,
    confirmacion: initConfirmacion,
    misPedidos: initMisPedidos,
    cocina: initCocina,
    tablero: initTablero
  }

  if (Object.prototype.hasOwnProperty.call(rutas, pagina)) {
    rutas[pagina]()
  }
}

window.addEventListener("pageshow", function (e) {
  if (e.persisted) {
    window.location.reload()
  }
})

iniciar()