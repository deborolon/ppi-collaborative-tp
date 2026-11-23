import { Router } from "express"
import * as controlador from "../controladores/pedidos.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()
const cliente = [autenticar, autorizar("cliente")]
const cocina = [autenticar, autorizar("cocina")]
const dueno = [autenticar, autorizar("dueno")]

rutas.post("/", cliente, controlador.crear)
rutas.get("/propios", cliente, controlador.listarPropios)
rutas.get("/comandas", cocina, controlador.listarComandas)
rutas.get("/demoras", dueno, controlador.listarDemoras)
rutas.get("/:id/repetir", cliente, controlador.repetir)
rutas.patch("/:id/estado", cocina, controlador.actualizarEstado)
rutas.post("/:id/demora", cocina, controlador.reportarDemora)

export default rutas
