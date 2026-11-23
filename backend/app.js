import express from "express"
import { permitirOrigenes } from "./src/middlewares/cors.js"
import { manejarErrores, rutaNoEncontrada } from "./src/middlewares/errores.js"
import rutas from "./src/rutas/index.js"

const app = express()

app.use(express.json())

app.use("/api", permitirOrigenes)
app.use("/api", rutas)
app.use("/api", rutaNoEncontrada)
app.use(manejarErrores)

export default app
