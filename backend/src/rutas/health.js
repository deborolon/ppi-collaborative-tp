import { Router } from "express"

const rutas = Router()

rutas.get("/", (req, res) => {
  res.json({ estado: "Healthy", hora: new Date().toISOString() })
})

export default rutas
