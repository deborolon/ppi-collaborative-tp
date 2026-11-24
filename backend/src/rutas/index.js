import { Router } from "express"
import auth from "./auth.js"
import health from "./health.js"
import ingredientes from "./ingredientes.js"
import pedidos from "./pedidos.js"
import productos from "./productos.js"
import ventas from "./ventas.js"
import zonasEnvio from "./zonas-envio.js"

const rutas = Router()

rutas.use("/auth", auth)
rutas.use("/health", health)
rutas.use("/ingredientes", ingredientes)
rutas.use("/pedidos", pedidos)
rutas.use("/productos", productos)
rutas.use("/ventas", ventas)
rutas.use("/zonas-envio", zonasEnvio)

export default rutas
