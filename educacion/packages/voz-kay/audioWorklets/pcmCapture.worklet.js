// Corre en el AudioContext de ENTRADA (16kHz — ver kaySession.js), así que
// cada bloque que llega acá ya viene a la frecuencia que pide la Live API de
// Gemini, sin resamplear nada a mano. Solo convierte de Float32 (-1..1) a
// PCM16 y lo manda al hilo principal.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const canal = inputs[0]?.[0]
    if (canal && canal.length > 0) {
      const pcm16 = new Int16Array(canal.length)
      for (let i = 0; i < canal.length; i++) {
        const s = Math.max(-1, Math.min(1, canal[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
      this.port.postMessage(pcm16.buffer, [pcm16.buffer])
    }
    return true
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor)
