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
