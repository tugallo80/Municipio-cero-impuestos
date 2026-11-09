// ══════════════════════════════════════════════════
//  Texto de las primeras páginas de un PDF, en el navegador (EDU.04b).
//  Se publica como /voz/pdf-texto.js (pdf.js va incluido en el sitio: no depende de un CDN).
//  Sirve para libros de 25 MB: no se sube el PDF, solo el texto del índice.
//  Reconstruye las líneas por altura y deja la sangría ("trimestre → unidad → tema").
// ══════════════════════════════════════════════════
import * as pdfjs from 'pdfjs-dist/build/pdf.min.mjs'
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = worker

export async function textoDelPdf(file, maxPaginas = 16) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const paginas = []
  for (let i = 1; i <= Math.min(doc.numPages, maxPaginas); i++) {
    const pag = await doc.getPage(i)
    const { items } = await pag.getTextContent()
    const lineas = new Map()
    for (const it of items) {
      if (!it.str || !it.str.trim()) continue
      const y = Math.round(it.transform[5] / 3) * 3
      if (!lineas.has(y)) lineas.set(y, [])
      lineas.get(y).push(it)
    }
    const texto = [...lineas.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, xs]) => {
        xs.sort((a, b) => a.transform[4] - b.transform[4])
        return ' '.repeat(Math.max(0, Math.round((xs[0].transform[4] - 40) / 6))) + xs.map((x) => x.str).join(' ').replace(/\s+/g, ' ')
      })
      .join('\n')
    paginas.push(`--- Página ${i} ---\n${texto}`)
  }
  return { texto: paginas.join('\n').slice(0, 80000), paginas: doc.numPages }
}
window.NandePdf = { textoDelPdf }
