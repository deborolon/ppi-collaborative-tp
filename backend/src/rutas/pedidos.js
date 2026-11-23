import { Router } from "express"
import * as controlador from "../controladores/pedidos.js"
import { autenticar, autorizar } from "../middlewares/autenticacion.js"

const rutas = Router()
const cliente = [autenticar, autorizar("cliente")]
const cocina = [autenticar, autorizar("cocina")]
const personal = [autenticar, autorizar("cocina", "dueno")]

rutas.post("/", cliente, controlador.crear)
rutas.get("/", personal, controlador.listar)
rutas.get("/mios", cliente, controlador.listarPropios)
rutas.get("/comandas", cocina, controlador.listarComandas)
rutas.get("/:id/repetir", cliente, controlador.repetir)
rutas.patch("/:id/estado", cocina, controlador.actualizarEstado)
rutas.get("/:id", personal, controlador.obtener)

export default rutas
