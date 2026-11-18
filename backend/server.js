import path from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"
import app from "./app.js"

const backendDirectory = path.dirname(fileURLToPath(import.meta.url))
const frontendDirectory = path.resolve(backendDirectory, "../frontend")
const port = process.env.PORT || 3000

app.use(express.static(frontendDirectory))

app.listen(port, () => {
  console.log(`BurgerClick disponible en http://localhost:${port}`)
})
