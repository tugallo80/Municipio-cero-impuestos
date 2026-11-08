// Corre en el AudioContext de SALIDA (creado a 24kHz — ver kaySession.js).
// Recibe bloques Float32 (ya convertidos desde el PCM16 que manda Gemini) y
// los va sirviendo muestra por muestra en cada process() — así el audio
// suena continuo aunque los bloques lleguen en pedazos separados por la red.
// "limpiar" vacía la cola de golpe: es lo que se usa cuando el usuario
// interrumpe a Kay hablando encima (evento "interrupted" de la Live API).
//
// Colchón (jitter buffer): la Live API no manda el audio a un ritmo
// perfectamente parejo — un turno grande, más contexto que sostener, o una
// herramienta a mitad de frase pueden dejar un hueco de unos milisegundos
// entre un bloque y el siguiente. Sin colchón, ese hueco vacía la cola a
// mitad de una frase y se oye como un corte/click — "voz entrecortada".
// Por eso no se empieza a reproducir un tramo nuevo apenas llega el primer
// bloque: se junta un mínimo de audio primero, así un hueco chico entre
// bloques lo absorbe el colchón en vez de convertirse en silencio audible.
// Subido de 120ms a 220ms: 120ms no alcanzó a absorber todos los huecos en
// la práctica (seguían pasando cortes reales, reportados después de probar
// en el celular) — más colchón cuesta un poco de latencia al arranque de
// cada tramo, pero un corte a mitad de frase es peor experiencia que un
// pelín más de espera antes de que arranque a hablar.
const MUESTRAS_COLCHON = Math.round(24000 * 0.22) // ~220ms a 24kHz

class PcmPlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.cola = []
    this.offset = 0
    this.muestrasEnCola = 0
    this.listo = false
    this.port.onmessage = (e) => {
      if (e.data?.tipo === 'limpiar') {
        this.cola = []
        this.offset = 0
        this.muestrasEnCola = 0
        this.listo = false
        return
      }
      const bloque = new Float32Array(e.data)
      this.cola.push(bloque)
      this.muestrasEnCola += bloque.length
    }
  }

  process(_inputs, outputs) {
    const salida = outputs[0][0]

    if (!this.listo) {
      if (this.muestrasEnCola < MUESTRAS_COLCHON) {
        // Todavía juntando colchón — silencio en vez de arrancar a medias.
        salida.fill(0)
        return true
      }
      this.listo = true
    }

    for (let i = 0; i < salida.length; i++) {
      if (this.cola.length === 0) {
        // Se vació antes de lo esperado (turno más corto que el colchón, o
        // un hueco real más largo) — vuelve a juntar colchón antes de seguir
        // en vez de arrancar y frenar en seco de nuevo enseguida.
        salida[i] = 0
        // Avisa una vez que terminó de sonar todo lo que había (ÑANDÉ: sirve
        // para cortar la charla recién cuando Kay terminó de despedirse).
        if (this.listo) this.port.postMessage({ tipo: 'vacio' })
        this.listo = false
        continue
      }
      const bloqueActual = this.cola[0]
      salida[i] = bloqueActual[this.offset++]
      this.muestrasEnCola--
      if (this.offset >= bloqueActual.length) {
        this.cola.shift()
        this.offset = 0
      }
    }
    return true
  }
}

registerProcessor('pcm-playback', PcmPlaybackProcessor)
