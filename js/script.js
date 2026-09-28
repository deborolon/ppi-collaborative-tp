function rutaBase() {
  return window.location.pathname.includes("/pages/") ? "../" : ""
}

const LS = {
  usuario: "bc_usuario",
  pedidos: "bc_pedidos",
  productos: "bc_productos",
  ingredientes: "bc_ingredientes",
  ultimoPedido: "bc_ultimo_pedido",
}

const COLOR_ESTADO = { pendiente: "rojo", preparacion: "amarillo", listo: "verde" }

const ETIQUETA_ESTADO = {
  pendiente: "En espera",
  preparacion: "En preparación",
  listo: "Listo para retirar",
  entregado: "Entregado",
}

async function cargarDatosIniciales() {
  const respuesta = await fetch(rutaBase() + "data/datos.json")
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
    beneficios: base.beneficios,
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

function getUsuarioConectado() {
  return JSON.parse(localStorage.getItem(LS.usuario) || "null")
}

function setUsuarioConectado(usuario) {
  localStorage.setItem(LS.usuario, JSON.stringify(usuario))
}

function cerrarSesion() {
  localStorage.removeItem(LS.usuario)
  window.location.href = rutaBase() + "index.html"
}

function renderizarNav() {
  const usuario = getUsuarioConectado()
  const rol = usuario ? usuario.rol : "visitante"

  document.querySelectorAll(".main-nav [data-roles]").forEach((item) => {
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

  const datos = await getDatos()
  const categorias = [...new Set(datos.productos.map((p) => p.categoria))]

  categorias.forEach((categoria) => {
    const seccion = document.createElement("section")
    seccion.className = "seccion"

    const titulo = document.createElement("h2")
    titulo.textContent = categoria
    seccion.appendChild(titulo)

    const grilla = document.createElement("div")
    grilla.className = "grilla"

    datos.productos
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

async function initInicio() {
  const contenedor = document.getElementById("beneficios-lista")
  if (!contenedor) return

  const datos = await getDatos()
  datos.beneficios.forEach((b) => {
    const card = document.createElement("article")
    card.className = "card"

    const body = document.createElement("div")
    body.className = "card-body"

    const h3 = document.createElement("h3")
    h3.textContent = b.icono + " " + b.titulo
    body.appendChild(h3)

    const p = document.createElement("p")
    p.textContent = b.texto
    body.appendChild(p)

    card.appendChild(body)
    contenedor.appendChild(card)
  })
}

async function initLogin() {
  const form = document.getElementById("form-login")
  if (!form) return

  const datos = await getDatos()
  const mensaje = document.getElementById("login-mensaje")

  form.addEventListener("submit", function (e) {
    e.preventDefault()
    const email = document.getElementById("usuario").value.trim().toLowerCase()
    const password = document.getElementById("contrasena").value

    const usuario = datos.usuarios.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    )

    if (!usuario) {
      mensaje.textContent = "Usuario o contraseña incorrectos. Volvé a intentar."
      mensaje.className = "aviso aviso-error"
      return
    }

    setUsuarioConectado({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
    })

    const destinos = {
      cliente: "pedido.html",
      cocina: "cocina.html",
      dueno: "tablero.html",
    }
    window.location.href = rutaBase() + "pages/" + destinos[usuario.rol]
  })
}

async function initPedido() {
  const contenedor = document.getElementById("pedido-productos")
  if (!contenedor) return

  const datos = await getDatos()
  const usuario = getUsuarioConectado()

  const categorias = [...new Set(datos.productos.map((p) => p.categoria))]
  categorias.forEach((categoria) => {
    const seccion = document.createElement("section")
    seccion.className = "seccion"

    const titulo = document.createElement("h2")
    titulo.textContent = categoria
    seccion.appendChild(titulo)

    const grilla = document.createElement("div")
    grilla.className = "grilla"

    datos.productos
      .filter((p) => p.categoria === categoria)
      .forEach((p) => grilla.appendChild(crearItemPedido(p)))

    seccion.appendChild(grilla)
    contenedor.appendChild(seccion)
  })

  const selectZona = document.getElementById("zona")
  datos.zonasEnvio
    .filter((z) => z.id !== "takeaway")
    .forEach((z) => {
      const opt = document.createElement("option")
      opt.value = z.id
      opt.textContent = z.nombre + " — " + formatearPrecio(z.costo)
      selectZona.appendChild(opt)
    })

  const recalcular = () => actualizarResumen(datos)
  contenedor.addEventListener("input", recalcular)
  document.querySelectorAll("[name='modalidad']").forEach((r) =>
    r.addEventListener("change", recalcular)
  )
  selectZona.addEventListener("change", recalcular)
  actualizarResumen(datos)

  document.getElementById("form-pedido").addEventListener("submit", function (e) {
    e.preventDefault()
    const items = leerItemsSeleccionados()

    if (items.length === 0) {
      document.getElementById("pedido-error").textContent =
        "Elegí al menos un producto para confirmar la compra."
      return
    }

    const modalidad = document.querySelector("[name='modalidad']:checked").value
    const direccion = document.getElementById("direccion").value.trim()
        document.getElementById("pedido-error").textContent = ""

       if (modalidad === "delivery" && direccion === "") {
        document.getElementById("pedido-error").textContent =
        "Ingresá la dirección de entrega para confirmar el pedido."
         return
        }
    const zonaId = modalidad === "delivery" ? selectZona.value : "takeaway"
    const zona = datos.zonasEnvio.find((z) => z.id === zonaId)
    const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
    const costoEnvio = zona ? zona.costo : 0

    const nuevoPedido = {
      id: "BC-" + Math.floor(1000 + Math.random() * 9000),
      clienteId: usuario ? usuario.id : 0,
      items: items,
      modalidad: modalidad,
      zonaId: zonaId,
      direccion: document.getElementById("direccion").value.trim(),
      costoEnvio: costoEnvio,
      subtotal: subtotal,
      total: subtotal + costoEnvio,
      estado: "pendiente",
      fecha: new Date().toISOString().slice(0, 10),
      esperaMin: 15,
    }

    const pedidos = JSON.parse(localStorage.getItem(LS.pedidos))
    pedidos.push(nuevoPedido)
    guardarPedidos(pedidos)
    localStorage.setItem(LS.ultimoPedido, JSON.stringify(nuevoPedido))

    window.location.href = rutaBase() + "pages/confirmacion.html"
  })
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

function actualizarResumen(datos) {
  const items = leerItemsSeleccionados()
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  const modalidad = document.querySelector("[name='modalidad']:checked").value
  const selectZona = document.getElementById("zona")
  const campoDireccion = document.getElementById("bloque-direccion")

  let costoEnvio = 0
  if (modalidad === "delivery") {
    const zona = datos.zonasEnvio.find((z) => z.id === selectZona.value)
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
  if (!contenedor) return

  const usuario = getUsuarioConectado()
  const datos = await getDatos()
  const mios = datos.pedidos.filter((p) => usuario && p.clienteId === usuario.id)

  if (mios.length === 0) {
    contenedor.innerHTML = "<p>Todavía no tenés pedidos. ¡Armá tu primera compra!</p>"
    return
  }

  mios.reverse().forEach((pedido) => contenedor.appendChild(crearTarjetaPedido(pedido)))

  contenedor.addEventListener("click", function (e) {
    const boton = e.target.closest("[data-repetir]")
    if (!boton) return
    repetirPedido(boton.dataset.repetir, usuario)
  })
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

  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = "btn"
  btn.setAttribute("data-repetir", pedido.id)
  btn.textContent = "Repetir compra"
  body.appendChild(btn)

  card.appendChild(body)
  return card
}

function repetirPedido(pedidoId, usuario) {
  const pedidos = JSON.parse(localStorage.getItem(LS.pedidos))
  const original = pedidos.find((p) => p.id === pedidoId)
  if (!original) return

  const copia = {
    ...original,
    id: "BC-" + Math.floor(1000 + Math.random() * 9000),
    clienteId: usuario ? usuario.id : original.clienteId,
    estado: "pendiente",
    fecha: new Date().toISOString().slice(0, 10),
    esperaMin: 15,
    items: original.items.map((i) => ({ ...i })),
  }

  pedidos.push(copia)
  guardarPedidos(pedidos)
  window.location.reload()
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
      art.appendChild(botonCocina(pedido.id, "marchar", "Marchar", "btn-marchar"))
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

if (protegerPagina()) {
  renderizarNav()

  const pagina = document.body.dataset.page
  const rutas = {
    inicio: initInicio,
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