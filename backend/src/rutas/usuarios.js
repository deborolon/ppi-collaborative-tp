import { Router } from "express"
import * as controlador from "../controladores/usuarios.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()

rutas.use(autenticar, autorizar("dueno"))

rutas.get("/", controlador.listar)
rutas.get("/:id", controlador.obtener)

export default rutas
