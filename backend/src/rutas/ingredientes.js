import { Router } from "express"
import * as controlador from "../controladores/ingredientes.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()

rutas.use(autenticar, autorizar("cocina", "dueno"))

rutas.get("/", controlador.listar)

export default rutas
