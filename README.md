# BurgerClick

Prototipo web para gestionar el recorrido de compra en un local de hamburguesas: consulta del menú, creación de pedidos, seguimiento de estados y vistas de operación para cocina y administración.

## Tecnologías

- Node.js y Express
- HTML5, CSS3 y JavaScript, sin frameworks
- MongoDB Atlas como base de datos

## Estructura

```text
/
├── backend/
│   ├── netlify/
│   │   └── functions/
│   │       └── api.js
│   ├── src/
│   │   ├── controladores/
│   │   ├── middlewares/
│   │   │   ├── autenticacion.js
│   │   │   ├── cors.js
│   │   │   └── errores.js
│   │   ├── repositorios/
│   │   ├── rutas/
│   │   ├── servicios/
│   │   └── db.js
│   ├── app.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── assets/
│   │   ├── logo.svg
│   │   └── ilustraciones SVG de comida
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
├── .gitignore
├── .nvmrc
├── netlify.toml
└── README.md
```

## Requisitos, instalación y ejecución

- [Node.js 26.13.1 LTS](https://nodejs.org/en/download/), con npm incluido.

Verificá que Node.js esté instalado:

```cmd
node --version
npm --version
```

`node --version` debería mostrar `v26.13.1`.

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

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio |
| GET | `/api/productos` | Menú completo con precio y stock |
| GET | `/api/productos/:id` | Un producto; `404` si no existe |
| GET | `/api/zonas-envio` | Zonas de entrega con su costo de envío y si tienen cobertura (`Otra` no la tiene; retiro en local = $0) |
| GET | `/api/usuarios` | Usuarios sin credenciales (requiere token de dueño); `401` / `403` |
| GET | `/api/usuarios/:id` | Un usuario (requiere token de dueño); `404` si no existe |
| GET | `/api/ingredientes` | Lista completa de ingredientes con `id`, stock, mínimo y `nivel` (`suficiente`, `bajo` o `agotado`); cocina recibe los agotados primero, luego bajos y suficientes (requiere token de cocina o dueño) |
| GET | `/api/pedidos/comandas` | Comandas activas, de la más antigua a la más reciente, con nombre de pila, hora, estado, demora y `accion` siguiente; `mensaje` si no hay ninguna (requiere token de cocina) |
| GET | `/api/pedidos/demoras` | Pedidos activos con demora por falta de ingredientes (requiere token de dueño) |
| GET | `/api/pedidos/propios` | Historial del cliente autenticado, del más reciente al más antiguo; filtro opcional `?estado=pendiente\|preparacion\|listo\|entregado` (requiere token de cliente); `400` si el estado no es válido |
| GET | `/api/pedidos/:id/repetir` | Arma el carrito para repetir un pedido propio entregado: `items` disponibles y `noDisponibles` con su `mensaje` (requiere token de cliente); `404` si no existe o es ajeno, `409` si no está entregado |
| PATCH | `/api/pedidos/:id/estado` | Avanza el pedido con `{ estado }` al siguiente de la secuencia `pendiente` → `preparacion` → `listo` → `entregado` (requiere token de cocina); `400` si el estado no es válido, `404` si no existe, `409` si está entregado o el estado no es el siguiente |
| POST | `/api/pedidos/:id/demora` | Reporta una demora con `{ ingredientes: [id] }` (requiere token de cocina); `400` si no hay ingredientes o no son válidos, `404` si no existe, `409` si está entregado |
| POST | `/api/pedidos` | Crea un pedido del cliente con `{ items: [{ productoId, cantidad }], modalidad, zonaId, direccion }` (requiere token de cliente). Calcula precios y envío en el servidor y descuenta el stock; `201` con el pedido en estado `pendiente`, `400` si los datos no son válidos o la zona está fuera de cobertura, `409` si falta stock o un precio cambió |
| POST | `/api/auth/login` | Inicia sesión con `{ email, password }` y devuelve `{ token, usuario }`; `401` si son incorrectas, `429` si la cuenta está bloqueada |
| POST | `/api/auth/logout` | Cierra la sesión (requiere token); `204` |
| GET | `/api/auth/sesion` | Devuelve el usuario de la sesión vigente (requiere token); `401` si no existe o expiró |
| GET | `/api/ventas` | Resumen del período `?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` (por defecto, hoy): pedidos por estado, facturación y ticket promedio de los entregados (requiere token de dueño); `400` si las fechas no son válidas |
| GET | `/api/ventas/ranking` | Productos más vendidos del período, con filtros opcionales `desde`, `hasta` y `categoria` (`Hamburguesas`, `Acompañamientos` o `Bebidas`) (requiere token de dueño); `400` si las fechas o la categoría no son válidas |
