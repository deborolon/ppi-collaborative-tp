# BurgerClick

Prototipo web para gestionar el recorrido de compra en un local de hamburguesas: consulta del menú, creación de pedidos, seguimiento de estados y vistas de operación para cocina y administración.

## Funcionalidades

- **Inicio (`index.html`)**: presentación del local y beneficios cargados desde los datos de ejemplo.
- **Menú (`pages/menu.html`)**: productos agrupados por categoría, con precio y disponibilidad.
- **Nuevo pedido (`pages/pedido.html`)**: selección de productos y cantidades, modalidad de entrega, zona y dirección. El subtotal, el envío y el total se actualizan según la selección; no se permite confirmar un pedido vacío.
- **Confirmación (`pages/confirmacion.html`)**: ticket con número de pedido, productos, modalidad, demora estimada e importes.
- **Mis pedidos (`pages/mis-pedidos.html`)**: historial del cliente, estados, total y opción para repetir una compra.
- **Cocina (`pages/cocina.html`)**: comandas activas con transiciones de pendiente a preparación, listo y entregado, además de avisos de stock bajo.
- **Tablero (`pages/tablero.html`)**: indicadores de facturación, cantidad de pedidos y ticket promedio, productos más vendidos e ingredientes por reponer.
- **Inicio de sesión (`pages/login.html`)**: acceso de demostración por perfil de cliente, cocina o dueño, con navegación adaptada al rol.

## Implementación

- Las páginas están construidas con HTML semántico.
- `css/styles.css` contiene los estilos compartidos; `css/login.css` y `css/pedido.css` contienen reglas específicas.
- `js/script.js` carga y renderiza la información, valida el pedido vacío, calcula importes, gestiona el historial y actualiza los estados de cocina.
- `data/datos.json` proporciona los datos iniciales de usuarios, productos, pedidos, zonas de envío, beneficios e ingredientes.
- `localStorage` conserva la sesión de demostración, los pedidos y sus cambios en el navegador.

## Límites actuales

La aplicación funciona enteramente en el navegador. No incluye servidor, base de datos ni sincronización entre dispositivos. Las credenciales y la protección por perfiles son solo para demostración y no constituyen autenticación segura. Los estados y el stock tampoco se comparten entre navegadores.

Para un uso real, queda integrar un backend y una base de datos, implementar autenticación y autorización seguras, y sincronizar pedidos, estados y stock entre las distintas vistas.

## Estructura del proyecto

```text
/
├── .gitignore
├── index.html
├── pages/
│   ├── cocina.html
│   ├── confirmacion.html
│   ├── login.html
│   ├── menu.html
│   ├── mis-pedidos.html
│   ├── pedido.html
│   └── tablero.html
├── css/
│   ├── login.css
│   ├── pedido.css
│   └── styles.css
├── data/
│   └── datos.json
├── img/
│   └── logo.svg
├── js/
│   └── script.js
└── README.md
```

Tecnologías: HTML5, CSS3, JavaScript, JSON y `localStorage`. No se utilizan frameworks ni librerías externas.

## Ejecución local

La aplicación carga `data/datos.json`, por lo que debe abrirse desde un servidor HTTP estático y no directamente como archivo. Desde la raíz del repositorio, iniciá uno con Python:

```bash
python -m http.server 8000
```

Luego ingresá a `http://localhost:8000` en el navegador.