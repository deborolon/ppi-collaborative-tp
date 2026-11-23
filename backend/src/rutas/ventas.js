import { Router } from "express"
import * as controlador from "../controladores/ventas.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()

rutas.use(autenticar, autorizar("dueno"))

rutas.get("/", controlador.resumir)
rutas.get("/ranking", controlador.rankear)

export default rutas
