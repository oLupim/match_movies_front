export type StreamingValue = string | number | Array<string | number> | null | undefined

const STREAMINGS: Record<number, string> = {
  8: 'NETFLIX',
  9: 'PRIME',
  119: 'PRIME',
  337: 'DISNEY+',
  1899: 'MAX',
  2: 'APPLE TV',
  350: 'APPLE TV',
  307: 'GLOBOPLAY',
  531: 'PARAMOUNT',
}

const STREAMING_ALIASES: Record<string, number> = {
  netflix: 8,
  prime: 119,
  'prime video': 119,
  'amazon prime': 119,
  'amazon prime video': 119,
  disney: 337,
  'disney+': 337,
  'disney plus': 337,
  max: 1899,
  'hbo max': 1899,
  apple: 350,
  'apple tv': 350,
  'apple tv+': 350,
  globoplay: 307,
  paramount: 531,
  'paramount+': 531,
  'paramount plus': 531,
}

const STREAMING_URLS: Record<number, (query: string) => string> = {
  8: query => `https://www.netflix.com/search?q=${query}`,
  9: query => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`,
  119: query => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`,
  337: query => `https://www.disneyplus.com/search?q=${query}`,
  1899: query => `https://www.max.com/search?q=${query}`,
  2: query => `https://tv.apple.com/search?term=${query}`,
  350: query => `https://tv.apple.com/search?term=${query}`,
  307: query => `https://globoplay.globo.com/busca/?q=${query}`,
  531: query => `https://www.paramountplus.com/br/search/?query=${query}`,
}

function getStreamings(streaming: StreamingValue) {
  if (Array.isArray(streaming)) return streaming
  if (streaming === null || streaming === undefined || streaming === '') return []
  return [streaming]
}

function normalizarStreamingId(id: number) {
  if (id === 9) return 119
  return id
}

function getStreamingId(streaming: string | number) {
  const idNumerico = Number(streaming)
  if (!Number.isNaN(idNumerico)) {
    const idNormalizado = normalizarStreamingId(idNumerico)
    if (STREAMINGS[idNormalizado]) return idNormalizado
  }

  const chave = String(streaming).trim().toLowerCase()
  return STREAMING_ALIASES[chave] ?? null
}

export function filtrarStreamingSelecionado(streaming: StreamingValue, streamingsSelecionados: number[]) {
  if (streamingsSelecionados.length === 0) return streaming

  const selecionados = streamingsSelecionados.map(normalizarStreamingId)
  const filtrados = getStreamings(streaming).filter(item => {
    const id = getStreamingId(item)
    return id !== null && selecionados.includes(id)
  })

  if (filtrados.length === 0) return undefined
  return filtrados.length === 1 ? filtrados[0] : filtrados
}

export function getNomeStreaming(streaming: StreamingValue) {
  const nomes = getStreamings(streaming)
    .map(item => {
      const id = getStreamingId(item)
      return id ? STREAMINGS[id] : String(item)
    })
    .filter((nome, index, lista) => lista.indexOf(nome) === index)

  return nomes.length > 0 ? nomes.join(' + ') : null
}

export function getLinkStreaming(streaming: StreamingValue, titulo: string, watchUrl?: string) {
  void watchUrl

  const id = getStreamings(streaming)
    .map(item => getStreamingId(item))
    .find((item): item is number => item !== null)

  if (!id) return null

  const urlBuilder = STREAMING_URLS[id]
  if (!urlBuilder) return null

  const query = encodeURIComponent(titulo)
  return {
    nome: STREAMINGS[id],
    url: urlBuilder(query),
    direto: false,
  }
}
