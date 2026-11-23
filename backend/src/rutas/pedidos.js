import { Router } from "express"
import * as controlador from "../controladores/pedidos.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()
const personal = [autenticar, autorizar("cocina", "dueno")]

rutas.post("/", autenticar, autorizar("cliente"), controlador.crear)
rutas.get("/", personal, controlador.listar)
rutas.get("/:id", personal, controlador.obtener)

export default rutas
