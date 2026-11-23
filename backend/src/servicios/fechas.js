const ZONA_HORARIA = "America/Argentina/Buenos_Aires"

const formatoFecha = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA })
const formatoHora = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

export const fechaDe = (instante) => formatoFecha.format(instante)

export const horaDe = (instante) => formatoHora.format(instante)

export function esFechaValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false
  }

  const instante = new Date(`${valor}T00:00:00Z`)
  return !Number.isNaN(instante.getTime()) && instante.toISOString().slice(0, 10) === valor
}
