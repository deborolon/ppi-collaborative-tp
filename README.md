# BurgerClick

Prototipo web para gestionar el recorrido de compra en un local de hamburguesas: consulta del menú, creación de pedidos, seguimiento de estados y vistas de operación para cocina y administración.

## Tecnologías

- Node.js y Express
- HTML5, CSS3 y JavaScript, sin frameworks
- MongoDB Atlas como base de datos

## Estructura

```text
backend/   API Express (rutas → controladores → servicios → repositorios) y función Netlify
frontend/  HTML, CSS y JavaScript
netlify.toml
```

## Requisitos, instalación y ejecución

Requiere [Node.js 26.13.1 LTS](https://nodejs.org/en/download/).

Instalá las dependencias desde `backend/`:

```cmd
cd backend
npm install
```

Creá `backend/.env` (ignorado por git) con la conexión a MongoDB Atlas:

```text
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/
MONGODB_DB=burgerclick
```

Iniciá el servidor:

```cmd
npm run dev
```

Abrí `http://localhost:3000`. Para iniciarlo sin reinicio automático, ejecutá `npm start` desde `backend/`.

## Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | público | Estado del servicio |
| GET | `/api/productos` | público | Menú con precio y stock |
| GET | `/api/zonas-envio` | público | Zonas con costo de envío y cobertura |
| POST | `/api/auth/login` | público | `{ email, password }` → `{ token, usuario }`; `401`, `429` si la cuenta está bloqueada |
| POST | `/api/auth/logout` | sesión | Cierra la sesión; `204` |
| GET | `/api/auth/sesion` | sesión | Usuario de la sesión vigente; `401` si expiró |
| POST | `/api/pedidos` | cliente | `{ items: [{ productoId, cantidad }], modalidad, zonaId, direccion }`; calcula precios y envío en el servidor y descuenta stock; `201`, `400`, `409` |
| GET | `/api/pedidos/propios` | cliente | Historial, del más reciente al más antiguo; filtro `?estado=` |
| GET | `/api/pedidos/:id/repetir` | cliente | Carrito para repetir un pedido entregado; `404`, `409` |
| GET | `/api/pedidos/comandas` | cocina | Comandas activas, de la más antigua a la más reciente |
| PATCH | `/api/pedidos/:id/estado` | cocina | `{ estado }`: avanza `pendiente` → `preparacion` → `listo` → `entregado`; `400`, `404`, `409` |
| POST | `/api/pedidos/:id/demora` | cocina | `{ ingredientes: [id] }`; `400`, `404`, `409` |
| GET | `/api/ingredientes` | cocina, dueño | Stock con `nivel` (`suficiente`, `bajo`, `agotado`), agotados primero |
| GET | `/api/pedidos/demoras` | dueño | Pedidos activos con demora por ingredientes |
| GET | `/api/ventas` | dueño | Resumen del período `?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` (por defecto, hoy) |
| GET | `/api/ventas/ranking` | dueño | Más vendidos; filtros `desde`, `hasta` y `categoria` |
