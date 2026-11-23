import * as servicio from "../servicios/pedidos.js"

export async function listar(req, res) {
  res.status(200).json(await servicio.listar())
}

export async function obtener(req, res) {
  const pedido = await servicio.obtener(req.params.id)

  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado." })
  }

  res.status(200).json(pedido)
}

export async function crear(req, res) {
  const resultado = await servicio.crear(req.usuario, req.body)

  if (resultado.estado === "invalido") {
    return res.status(400).json({ error: resultado.error })
  }

  if (resultado.estado !== "ok") {
    return res.status(409).json({ error: resultado.error })
  }

  res.status(201).json(resultado.pedido)
}
