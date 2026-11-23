import { Router } from "express"
import * as controlador from "../controladores/zonas-envio.js"

const rutas = Router()

rutas.get("/", controlador.listar)

export default rutas
