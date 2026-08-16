# TP Hito 1 – Entorno de desarrollo colaborativo

## Descripción
Configuración del entorno de trabajo colaborativo con Git y GitHub.
Cada integrante creó una rama personal, añadió un archivo con su nombre y usuario de GitHub, y abrió una Pull Request hacia `main`.
Todas las PR fueron fusionadas, dejando la rama principal con los aportes de todos.

## Integrantes del equipo Grupo 5 - Caso "BurgerClick"
- Débora Rolón – @deborolon
- Melody Cordoba – @melodyald
- Morena Cisneros – @
- Randall Roldan Jaramillo – @randall354ss
- Tomás Rivas – @tomas-16a

## Estructura del repositorio
- `main`: rama principal que contiene el trabajo final de todos los integrantes.  
- Cada integrante trabajó en su propia rama (ej. `feature/nombre1`, `feature/nombre2`, etc.).

## Proceso seguido
1. Clonación del repositorio en local.
2. Creación de una rama personal por cada integrante.
3. Agregado de un archivo de texto con nombre y usuario de GitHub.
4. Commit con mensaje descriptivo y push al remoto.
5. Apertura de Pull Request hacia `main`.
6. Integración (merge) de todas las Pull Requests.

---

# Hito 2 – Prototipo de interfaz HTML/CSS

## Descripción del sistema
**BurgerClick** es un sistema digital exclusivo para un local de venta de hamburguesas. Permite a los clientes realizar pedidos online de manera rápida, visualizar el menú, y hacer seguimiento de sus comandas. El local cuenta con un panel de cocina para gestionar los pedidos en tiempo real.

## Pantallas desarrolladas
Se han implementado las siguientes páginas navegables:

1. **Inicio (`index.html`)**  
   Página principal con presentación del local, llamado a la acción para ver el menú o iniciar un pedido, y sección de ventajas (elegir visualmente, sin esperas al teléfono, ticket digital).

2. **Menú (`menu.html`)**  
   (Pendiente de desarrollo) Listado de productos con precios y opciones para agregar al pedido.

3. **Nuevo pedido (`pedido.html`)**  
   (Pendiente de desarrollo) Formulario para armar el pedido con selección de productos, dirección y confirmación.

4. **Mis pedidos (`mis-pedidos.html`)**  
   (Pendiente de desarrollo) Historial de pedidos realizados por el cliente.

5. **Cocina (`pages/cocina.html`)**  
   Panel para el personal de cocina. Muestra las comandas activas con su estado (prioridad alta, en preparación, listo para retirar) y botones para marcar como "Marchar" o "Despachar". Incluye un aviso de stock de panceta.

6. **Iniciar Sesión (`login.html`)**  
    Formulario de acceso para clientes o personal.

Todas las páginas están vinculadas mediante un menú de navegación común (`<nav>`).

## Estructura de archivos
El proyecto sigue la organización recomendada:

/
├── index.html
├── pages/
│ └── cocina.html
├── css/
│ └── styles.css
├── img/
│ └── logo.svg
└── README.md

- **CSS**: hoja de estilos externa (`styles.css`) con variables CSS, Flexbox y selectores básicos.
- **HTML semántico**: se utilizan etiquetas como `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Navegación**: menú con enlaces a todas las páginas.

## Tecnologías utilizadas
- HTML5 semántico.
- CSS3 básico (sin frameworks ni librerías externas).
- Flexbox para disposición de menú y grillas.
- Variables CSS para gestión de colores.
- Sin JavaScript, animaciones ni plantillas prediseñadas.

## Funcionalidades previstas para la siguiente entrega
- Implementación completa del formulario de pedido con validación y confirmación.
- Visualización de menú con imágenes y precios.
- Panel de cocina con actualización en tiempo real (simulado).
- Sistema de autenticación (login/registro).
- Persistencia de pedidos (simulada mediante almacenamiento local o backend básico).

---

*Repositorio creado para los Hitos 1 y 2 de la materia Prácticas Profesionalizantes I.*