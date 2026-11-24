import { Router } from "express"
import * as controlador from "../controladores/productos.js"

const rutas = Router()

rutas.get("/", controlador.listar)

export default rutas
