import { Router } from "express"
import * as controlador from "../controladores/productos.js"

const rutas = Router()

rutas.get("/", controlador.listar)
rutas.get("/:id", controlador.obtener)

export default rutas
