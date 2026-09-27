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


if (protegerPagina()) {
  renderizarNav()

  const pagina = document.body.dataset.page
  const rutas = {
    inicio: initInicio,
    login: initLogin,
    menu: initMenu
  }

  if (Object.prototype.hasOwnProperty.call(rutas, pagina)) {
    rutas[pagina]()
  }
}