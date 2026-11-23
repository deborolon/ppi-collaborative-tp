import { Router } from "express"
import * as controlador from "../controladores/auth.js"
import { autenticar } from "../middlewares/autenticacion.js"

const rutas = Router()

rutas.post("/login", controlador.iniciarSesion)
rutas.post("/logout", autenticar, controlador.cerrarSesion)
rutas.get("/sesion", autenticar, controlador.obtenerSesion)

export default rutas
