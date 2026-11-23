# BurgerClick

Prototipo web para gestionar el recorrido de compra en un local de hamburguesas: consulta del menú, creación de pedidos, seguimiento de estados y vistas de operación para cocina y administración.

## Estructura monorepo

```text
/
├── backend/
│   ├── data/
│   │   └── datos.json
│   ├── netlify/
│   │   └── functions/
│   │       └── api.js
│   ├── src/
│   │   ├── controladores/
│   │   ├── middlewares/
│   │   │   └── errores.js
│   │   ├── repositorios/
│   │   ├── rutas/
│   │   ├── servicios/
│   │   └── errores.js
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
├── .nvmrc
├── netlify.toml
└── README.md
```

- **Frontend:** páginas HTML, estilos y JavaScript en `frontend/`. `frontend/assets/` contiene el logo y las ilustraciones SVG del menú y la portada.
- **Backend:** servidor Node.js con Express en `backend/`. Sirve el frontend y expone la API REST bajo `/api`, organizada en capas (ver [Arquitectura del backend](#arquitectura-del-backend)).
- **Datos:** por ahora se mantienen en el archivo JSON `backend/data/datos.json`; no se utiliza una base de datos. Los pedidos y cambios locales siguen guardándose en `localStorage` del navegador.

## Arquitectura del backend

El backend sigue el patrón MVC adaptado a una API REST: la vista es el frontend (el servidor solo devuelve JSON) y el modelo se divide en servicios y repositorios.

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Rutas | `src/rutas/` | Asocian cada URL y método HTTP con un controlador. |
| Controladores | `src/controladores/` | Reciben `req`, llaman al servicio y responden con `res`. Sin lógica de negocio. |
| Servicios | `src/servicios/` | Reglas de negocio: validaciones, cálculos y errores de dominio. No conocen `req` ni `res`. |
| Repositorios | `src/repositorios/` | Único acceso a los datos. Hoy leen `datos.json`; luego se reemplazan por MongoDB sin tocar las demás capas. |

El flujo de cada pedido HTTP es `ruta → controlador → servicio → repositorio`. Los errores se lanzan con `ErrorHttp` y los resuelve `src/middlewares/errores.js`.

## Requisitos

- [Node.js 26.13.1 LTS](https://nodejs.org/en/download/), con npm incluido.

Verificá que Node.js esté instalado:

```cmd
node --version
npm --version
```

`node --version` debería mostrar `v26.13.1`.

Instalá las dependencias e iniciá el servidor desde `backend/`:

```cmd
cd backend
npm install
npm run dev
```

Abrí `http://localhost:3000`. Para iniciarlo sin reinicio automático, ejecutá `npm start` desde `backend/`.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio |
| GET | `/api/productos` | Menú completo con precio y stock |
| GET | `/api/productos/:id` | Un producto; `404` si no existe |
| GET | `/api/zonas-envio` | Zonas de entrega y costo de envío (retiro en local = $0) |
| GET | `/api/datos` | Datos de ejemplo completos, usados por el frontend actual |

Los errores se devuelven como JSON: `{ "error": "mensaje" }`.

## Deploy en Netlify

`netlify.toml` publica `frontend/`, instala las dependencias de `backend/` y despliega la API Express como una Netlify Function.

## Funcionalidades

- **Inicio (`frontend/index.html`)**: presentación del local y sus puntos fuertes.
- **Menú (`frontend/pages/menu.html`)**: productos agrupados por categoría, con precio y disponibilidad.
- **Nuevo pedido (`frontend/pages/pedido.html`)**: selección de productos y cantidades, modalidad de entrega, zona y dirección.
- **Confirmación (`frontend/pages/confirmacion.html`)**: ticket con número de pedido, productos, modalidad, demora estimada e importes.
- **Mis pedidos (`frontend/pages/mis-pedidos.html`)**: historial del cliente, estados, total y opción para repetir una compra.
- **Cocina (`frontend/pages/cocina.html`)**: comandas activas, estados de preparación y avisos de stock bajo.
- **Tablero (`frontend/pages/tablero.html`)**: indicadores de facturación y pedidos, productos más vendidos e ingredientes por reponer.
- **Inicio de sesión (`frontend/pages/login.html`)**: acceso de demostración por perfil de cliente, cocina o dueño.

Las credenciales y la protección por perfiles son solo para demostración y no constituyen autenticación segura. El estado guardado en `localStorage` no se sincroniza entre navegadores.
