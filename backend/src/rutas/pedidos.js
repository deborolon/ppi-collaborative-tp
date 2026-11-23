import { Router } from "express"
import * as controlador from "../controladores/pedidos.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()
const cliente = [autenticar, autorizar("cliente")]
const personal = [autenticar, autorizar("cocina", "dueno")]

rutas.post("/", cliente, controlador.crear)
rutas.get("/", personal, controlador.listar)
rutas.get("/mios", cliente, controlador.listarPropios)
rutas.get("/:id/repetir", cliente, controlador.repetir)
rutas.get("/:id", personal, controlador.obtener)

export default rutas
