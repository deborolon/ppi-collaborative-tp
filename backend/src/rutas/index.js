import { Router } from "express"
import health from "./health.js"
import productos from "./productos.js"
import zonasEnvio from "./zonas-envio.js"

const rutas = Router()

rutas.use("/health", health)
rutas.use("/productos", productos)
rutas.use("/zonas-envio", zonasEnvio)

export default rutas
