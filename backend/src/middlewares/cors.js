import cors from "cors"

const origenesLocales = [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]

const origenes = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((origen) => origen.trim())
      .filter(Boolean)
  : origenesLocales

export const permitirOrigenes = cors({
  origin: origenes,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Retry-After"],
  maxAge: 600,
})
