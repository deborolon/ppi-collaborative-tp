function rutaBase() {
  return window.location.pathname.includes("/pages/") ? "../" : ""
}

const LS = {
  usuario: "bc_usuario",
  token: "bc_token",
  pedidos: "bc_pedidos",
  productos: "bc_productos",
  ingredientes: "bc_ingredientes",
  ultimoPedido: "bc_ultimo_pedido",
}

const COLOR_ESTADO = { pendiente: "rojo", preparacion: "amarillo", listo: "verde" }

const IMAGENES_PRODUCTO = {
  clasica: "sandwich.svg",
  bacon: "sandwich.svg",
  veggie: "sandwich.svg",
  papas: "french-fries.svg",
  papas_cheddar: "cheese.svg",
  aros: "onion-rings.svg",
  gaseosa: "soda.svg",
  agua: "water.svg",
}

const ETIQUETA_ESTADO = {
  pendiente: "En espera",
  preparacion: "En preparación",
  listo: "Listo para retirar",
  entregado: "Entregado",
}

async function cargarDatosIniciales() {
  const respuesta = await fetch("/api/datos")
  return await respuesta.json()
}

async function getDatos() {
  const base = await cargarDatosIniciales()

  if (!localStorage.getItem(LS.pedidos)) {
    localStorage.setItem(LS.pedidos, JSON.stringify(base.pedidos))
  }
  if (!localStorage.getItem(LS.productos)) {
    localStorage.setItem(LS.productos, JSON.stringify(base.productos))
  }
  if (!localStorage.getItem(LS.ingredientes)) {
    localStorage.setItem(LS.ingredientes, JSON.stringify(base.ingredientes))
  }

  return {
    usuarios: base.usuarios,
    zonasEnvio: base.zonasEnvio,
    productos: JSON.parse(localStorage.getItem(LS.productos)),
    ingredientes: JSON.parse(localStorage.getItem(LS.ingredientes)),
    pedidos: JSON.parse(localStorage.getItem(LS.pedidos)),
  }
}

function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-AR")
}

function guardarPedidos(pedidos) {
  localStorage.setItem(LS.pedidos, JSON.stringify(pedidos))
}

async function registrarPedidoLocal(pedido) {
  const datos = await getDatos()

  if (!datos.pedidos.some((actual) => actual.id === pedido.id)) {
    datos.pedidos.push(pedido)
    guardarPedidos(datos.pedidos)
  }
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

  const archivoImagen = IMAGENES_PRODUCTO[producto.id]
  if (archivoImagen) {
    const imagen = document.createElement("img")
    imagen.className = "producto-imagen"
    imagen.src = rutaBase() + "assets/" + archivoImagen
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
      opt.textContent = z.nombre + " — " + formatearPrecio(z.costo)
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

    error.textContent = ""

    if (items.length === 0) {
      error.textContent = "Elegí al menos un producto para confirmar la compra."
      return
    }

    const modalidad = document.querySelector("[name='modalidad']:checked").value
    const direccion = document.getElementById("direccion").value.trim()

    if (modalidad === "delivery" && direccion === "") {
      error.textContent = "Ingresá la dirección de entrega para confirmar el pedido."
      return
    }

    boton.disabled = true

    let respuesta
    try {
      respuesta = await llamarApi("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(({ productoId, cantidad, precio }) => ({ productoId, cantidad, precio })),
          modalidad,
          zonaId: modalidad === "delivery" ? selectZona.value : "takeaway",
          direccion,
        }),
      })
    } catch (excepcion) {
      console.error(excepcion)
    }

    if (respuesta && respuesta.ok) {
      await registrarPedidoLocal(respuesta.cuerpo)
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

function mostrarAvisoPedido(texto, clase) {
  const aviso = document.getElementById("pedido-aviso")
  aviso.textContent = texto
  aviso.className = clase
  aviso.setAttribute("role", "alert")
}

async function precargarRepeticion(pedidoId) {
  const respuesta = await llamarApi("/pedidos/" + encodeURIComponent(pedidoId) + "/repetir")

  if (respuesta.status === 401) {
    volverAlLogin()
    return
  }

  if (!respuesta.ok) {
    mostrarAvisoPedido(
      (respuesta.cuerpo && respuesta.cuerpo.error) || "No pudimos cargar el pedido anterior.",
      "aviso aviso-error"
    )
    return
  }

  const { items, noDisponibles, mensaje } = respuesta.cuerpo
  const inputs = document.querySelectorAll("#pedido-productos input[type='number']")

  items.forEach((item) => {
    const input = [...inputs].find((actual) => actual.dataset.productoId === item.productoId)
    if (input && !input.disabled) input.value = item.cantidad
  })

  if (noDisponibles.length > 0) {
    mostrarAvisoPedido(
      mensaje + " Sin stock: " + noDisponibles.map((p) => p.nombre).join(", ") + ".",
      "aviso"
    )
  }
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
  input.dataset.nombre = producto.nombre
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
        nombre: input.dataset.nombre,
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
    costoEnvio = zona ? zona.costo : 0
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

  if (pedido.estado === "entregado") {
    const repetir = document.createElement("a")
    repetir.className = "btn"
    repetir.href = "pedido.html?repetir=" + encodeURIComponent(pedido.id)
    repetir.textContent = "Repetir compra"
    body.appendChild(repetir)
  }

  card.appendChild(body)
  return card
}

async function initCocina() {
  const contenedor = document.getElementById("comandas")
  if (!contenedor) return

  await renderComandas()
  await renderAvisoStock()

  contenedor.addEventListener("click", async function (e) {
    const boton = e.target.closest("[data-accion]")
    if (!boton) return
    cambiarEstadoPedido(boton.dataset.pedido, boton.dataset.accion)
    await renderComandas()
  })
}

async function renderComandas() {
  const contenedor = document.getElementById("comandas")
  contenedor.innerHTML = ""
  const datos = await getDatos()

  const activas = datos.pedidos.filter((p) => p.estado !== "entregado")

  if (activas.length === 0) {
    contenedor.innerHTML = "<p>No hay comandas activas en este momento.</p>"
    return
  }

  activas.forEach((pedido) => {
    const cliente = datos.usuarios.find((u) => u.id === pedido.clienteId)

    const nombrePila = cliente ? cliente.nombre : "Cliente"

    const art = document.createElement("article")
    art.className = "comanda " + (COLOR_ESTADO[pedido.estado] || "")

    const h3 = document.createElement("h3")
    h3.textContent = "#" + pedido.id + " · " + nombrePila
    art.appendChild(h3)

    const pEstado = document.createElement("p")
    const badge = document.createElement("span")
    badge.className = "estado estado-" + pedido.estado
    badge.textContent =
      pedido.estado === "pendiente" ? "Prioridad alta" : ETIQUETA_ESTADO[pedido.estado]
    pEstado.appendChild(badge)
    art.appendChild(pEstado)

    const ul = document.createElement("ul")
    pedido.items.forEach((i) => {
      const li = document.createElement("li")
      li.textContent = i.cantidad + "× " + i.nombre
      ul.appendChild(li)
    })
    art.appendChild(ul)

    const espera = document.createElement("p")
    espera.innerHTML = "<strong>Espera:</strong> " + pedido.esperaMin + " min"
    art.appendChild(espera)

    if (pedido.estado === "pendiente") {
      art.appendChild(botonCocina(pedido.id, "marchar", "Comenzar preparación", "btn-marchar"))
    }
    if (pedido.estado === "preparacion") {
      art.appendChild(botonCocina(pedido.id, "despachar", "Marcar listo", "btn-despachar"))
    }
    if (pedido.estado === "listo") {
      art.appendChild(botonCocina(pedido.id, "entregar", "Despachar", "btn-despachar"))
    }

    contenedor.appendChild(art)
  })
}

function botonCocina(pedidoId, accion, texto, clase) {
  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = "btn btn-cocina " + clase
  btn.setAttribute("data-pedido", pedidoId)
  btn.setAttribute("data-accion", accion)
  btn.textContent = texto
  return btn
}

function cambiarEstadoPedido(pedidoId, accion) {
  const pedidos = JSON.parse(localStorage.getItem(LS.pedidos))
  const pedido = pedidos.find((p) => p.id === pedidoId)
  if (!pedido) return

  const transiciones = {
    marchar: "preparacion",
    despachar: "listo",
    entregar: "entregado",
  }
  pedido.estado = transiciones[accion] || pedido.estado
  if (pedido.estado === "preparacion") pedido.esperaMin = 8
  if (pedido.estado === "listo") pedido.esperaMin = 1
  if (pedido.estado === "entregado") pedido.esperaMin = 0

  guardarPedidos(pedidos)
}

async function renderAvisoStock() {
  const contenedor = document.getElementById("aviso-stock")
  if (!contenedor) return
  const datos = await getDatos()
  const bajos = datos.ingredientes.filter((i) => i.stock <= i.minimo)

  if (bajos.length === 0) {
    contenedor.style.display = "none"
    return
  }
  const nombres = bajos
    .map((i) => i.nombre + (i.stock === 0 ? " (agotado)" : " (" + i.stock + ")"))
    .join(", ")
  contenedor.innerHTML =
    "🟡 <strong>Aviso de stock:</strong> quedan pocas unidades de " +
    nombres +
    ". Avisar demoras si es necesario."
}

async function initTablero() {
  const contenedor = document.getElementById("tablero")
  if (!contenedor) return

  const datos = await getDatos()
  const activos = datos.pedidos.filter((p) => p.estado !== "cancelado")

  const facturacion = activos.reduce((s, p) => s + p.total, 0)
  document.getElementById("kpi-facturacion").textContent = formatearPrecio(facturacion)
  document.getElementById("kpi-pedidos").textContent = activos.length
  const ticketProm = activos.length ? Math.round(facturacion / activos.length) : 0
  document.getElementById("kpi-ticket").textContent = formatearPrecio(ticketProm)

  const ventas = {}
  activos.forEach((p) =>
    p.items.forEach((i) => {
      ventas[i.nombre] = (ventas[i.nombre] || 0) + i.cantidad
    })
  )
  const ranking = Object.entries(ventas).sort((a, b) => b[1] - a[1])

  const listaRanking = document.getElementById("ranking-productos")
  ranking.forEach(([nombre, cantidad], idx) => {
    const li = document.createElement("li")
    li.innerHTML =
      "<span class='rank-pos'>" + (idx + 1) + "</span> " +
      nombre + " <strong>" + cantidad + " u.</strong>"
    listaRanking.appendChild(li)
  })

  const listaStock = document.getElementById("ingredientes-bajos")
  const bajos = datos.ingredientes.filter((i) => i.stock <= i.minimo)
  if (bajos.length === 0) {
    listaStock.innerHTML = "<li>Todos los ingredientes con stock suficiente ✅</li>"
  } else {
    bajos.forEach((i) => {
      const li = document.createElement("li")
      li.className = i.stock === 0 ? "critico" : ""
      li.textContent =
        i.nombre + " — " + i.stock + " unidades" + (i.stock === 0 ? " (agotado)" : "")
      listaStock.appendChild(li)
    })
  }
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