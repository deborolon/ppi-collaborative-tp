import { Router } from "express"
import * as controlador from "../controladores/datos.js"

const rutas = Router()

rutas.get("/", controlador.obtener)

export default rutas
