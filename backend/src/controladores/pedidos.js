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

export async function listarComandas(req, res) {
  res.status(200).json(await servicio.listarComandas())
}

export async function actualizarEstado(req, res) {
  const resultado = await servicio.actualizarEstado(req.params.id, req.body?.estado)

  if (resultado.estado === "invalido") {
    return res.status(400).json({ error: resultado.error })
  }

  if (resultado.estado === "no-encontrado") {
    return res.status(404).json({ error: "Pedido no encontrado." })
  }

  if (resultado.estado !== "ok") {
    return res.status(409).json({ error: resultado.error })
  }

  res.status(200).json(resultado.pedido)
}

export async function listarPropios(req, res) {
  const resultado = await servicio.listarDeCliente(req.usuario, req.query.estado)

  if (resultado.estado === "invalido") {
    return res.status(400).json({ error: resultado.error })
  }

  res.status(200).json(resultado.pedidos)
}

export async function repetir(req, res) {
  const resultado = await servicio.repetir(req.usuario, req.params.id)

  if (resultado.estado === "no-encontrado") {
    return res.status(404).json({ error: "Pedido no encontrado." })
  }

  if (resultado.estado === "no-repetible") {
    return res.status(409).json({ error: resultado.error })
  }

  res.status(200).json(resultado.repeticion)
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
