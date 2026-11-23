import * as servicio from "../servicios/ventas.js"

export async function resumir(req, res) {
  const resultado = await servicio.resumir(req.query.desde, req.query.hasta)

  if (resultado.estado === "invalido") {
    return res.status(400).json({ error: resultado.error })
  }

  res.status(200).json(resultado.resumen)
}

export async function rankear(req, res) {
  const resultado = await servicio.rankear(req.query.desde, req.query.hasta, req.query.categoria)

  if (resultado.estado === "invalido") {
    return res.status(400).json({ error: resultado.error })
  }

  res.status(200).json(resultado.ranking)
}
