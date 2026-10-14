// Таблица констант объяснялок — единственное место с числами физики и порогами. У каждого ключа (путь вида
// `suspension.bodyMass`) — строка в SOURCES.md рядом с источником. Единицы СИ: метры, килограммы, секунды,
// герцы; углы — градусы коленвала; удлинение и износ — доли единицы.
export const PHYSICS = {
  g: 9.80665,
  suspension: {
    // Угол машины: подрессоренная и неподрессоренная массы, частота кузова, шина, демпфирование нового амортизатора.
    bodyMass: 355,
    wheelMass: 45,
    bodyFrequency: 1.2,
    tireRate: 240000,
    dampingRatioNew: 0.3,
    // Ползунок: износ — доля потерянного усилия амортизатора.
    wearStart: 0.5,
    wearMax: 0.8,
    wearStep: 0.05,
    // Кочка — сборная искусственная неровность «на 30 км/ч».
    bumpHeight: 0.055,
    bumpLength: 0.6,
    speed: 30 / 3.6,
    wheelbase: 2.604,
    // Сценарий и расчет.
    settleFraction: 0.05,
    bumpStart: 0.3,
    airWindow: 2,
    plotDuration: 3,
    cyclePause: 0.8,
    cycleMax: 10,
    dt: 0.001,
  },
  chain: {
    // Геометрия привода — модель auto.glb (CONTRACT.md): центры звездочек в плоскости цепи (x, y), метры.
    pitch: 0.0127,
    crankTeeth: 19,
    camTeeth: 38,
    crank: [1.5, 0.44],
    cam: [1.47, 0.8],
    // Пороги: предел износа цепи ГРМ, норма фазы впуска, начало зоны риска перескока.
    wearLimit: 0.005,
    errorShift: 5,
    skipElongation: 0.015,
    // Ползунок.
    elongationMax: 0.02,
    elongationStep: 0.0005,
  },
};
