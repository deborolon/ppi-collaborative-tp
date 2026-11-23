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
