const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8080'

let ws: WebSocket | null = null

// ── CONECTAR ──
export function conectar(salaId: string): WebSocket {
  if (ws?.readyState === WebSocket.OPEN) return ws

  ws = new WebSocket(`${WS_URL}/ws/${salaId}`)

  ws.onopen = () => {
    console.log('✅ WebSocket conectado')
  }

  ws.onclose = () => {
    console.log('❌ WebSocket desconectado')
    ws = null
  }

  ws.onerror = (err) => {
    console.error('Erro de conexão:', err)
  }

  return ws
}

// ── DESCONECTAR ──
export function desconectar() {
  ws?.close()
  ws = null
}

// ── EMITIR VOTO ──
export function emitirVoto(filmeId: number, voto: 'like' | 'dislike') {
  if (ws?.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify({
    type: 'voto',
    payload: { filmeId, voto }
  }))
}

// ── OUVIR EVENTOS ──
type Callback = (data: any) => void
const listeners: Record<string, Callback> = {}

function registrarListener(tipo: string, callback: Callback) {
  listeners[tipo] = callback

  if (ws) {
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      const fn = listeners[msg.type]
      if (fn) fn(msg.payload)
    }
  }
}

export function ouvirParticipantes(callback: (players: any[]) => void) {
  registrarListener('players', (payload) => callback(payload.players))
}

export function ouvirStatusVoto(callback: (data: { likes: number, total: number }) => void) {
  registrarListener('voto_status', callback)
}

export function ouvirMatch(callback: (data: { filmeId: number }) => void) {
  registrarListener('match', callback)
}

// ── REMOVER LISTENERS ──
export function removerListeners() {
  Object.keys(listeners).forEach(key => delete listeners[key])
  if (ws) ws.onmessage = null
}