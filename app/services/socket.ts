const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
  .replace('http://', 'ws://')
  .replace('https://', 'wss://')

let ws: WebSocket | null = null

// ── CONECTAR ──
export function conectar(salaId: string, userId: string): WebSocket {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws

  ws = new WebSocket(`${WS_URL}/ws/sala/${salaId}?userId=${userId}`)
 


  ws.onopen = () => console.log('✅ WebSocket conectado')
  ws.onclose = () => console.log('❌ WebSocket desconectado')
  ws.onerror = (err: Event) => console.error('Erro de conexão:', err)
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
    tipo: 'voto',
    payload: { filmeId, voto }
  }))
}

// ── OUVIR EVENTOS ──
type Callback = (data: any) => void
const listeners: Record<string, Callback> = {}

export function ouvirParticipantes(callback: Callback) {
  listeners['jogador_entrou'] = callback
  listeners['jogador_saiu'] = callback
}

export function ouvirMatch(callback: Callback) {
  listeners['match'] = callback
}

export function ouvirVotoRegistrado(callback: Callback) {
  listeners['voto_registrado'] = callback
}

// dispatcher central — chama no useEffect da página
export function iniciarDispatcher() {
  if (!ws) return
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const cb = listeners[msg.tipo]
      if (cb) cb(msg.payload)
    } catch {
      console.error('Erro ao parsear mensagem WebSocket')
    }
  }
}

export function ouvirSalaAtual(callback: Callback) {
  listeners['sala_atual'] = callback
}

// ── REMOVER LISTENERS ──
export function removerListeners() {
  Object.keys(listeners).forEach(k => delete listeners[k])
  if (ws) ws.onmessage = null
}

export function ouvirSalaIniciada(callback: Callback) {
  listeners['sala_iniciada'] = callback
}

export function emitirIniciarSala() {
  if (ws?.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify({ tipo: 'iniciar_sala', payload: {} }))
}