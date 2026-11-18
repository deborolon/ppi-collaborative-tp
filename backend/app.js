import express from "express"
import datos from "./data/datos.json" with { type: "json" }

const app = express()

app.get("/api/datos", (_request, response) => {
  response.json(datos)
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: "No se pudieron cargar los datos de la aplicación." })
})

export default app
