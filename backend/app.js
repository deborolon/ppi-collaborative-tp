import express from "express"
import datos from "./data/datos.json" with { type: "json" }
import { manejarErrores, rutaNoEncontrada } from "./src/middlewares/errores.js"
import rutas from "./src/rutas/index.js"

const app = express()

app.get("/api/datos", (req, res) => {
  res.json(datos)
})

app.use("/api", rutas)
app.use("/api", rutaNoEncontrada)
app.use(manejarErrores)

export default app
