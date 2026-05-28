const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
  .replace('http://', 'ws://')
  .replace('https://', 'wss://')

let ws: WebSocket | null = null

// ── CONECTAR ──
export function conectar(salaId: string, userId: string, apelido?: string): WebSocket {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws

  const params = new URLSearchParams({ userId })
  if (apelido?.trim()) params.set('apelido', apelido.trim())

  ws = new WebSocket(`${WS_URL}/ws/sala/${salaId}?${params.toString()}`)
 


  // ws.onopen = () => console.log('✅ WebSocket conectado')
  // ws.onclose = () => console.log('❌ WebSocket desconectado')
  // ws.onerror = (err: Event) => console.error('Erro de conexão:', err)
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
type Callback<T = unknown> = (data: T) => void
const listeners: Record<string, Callback> = {}

export function ouvirParticipantes<T = unknown>(callback: Callback<T>) {
  listeners['jogador_entrou'] = callback as Callback<unknown>
  listeners['jogador_saiu'] = callback as Callback<unknown>
}

export function ouvirMatch<T = unknown>(callback: Callback<T>) {
  listeners['match'] = callback as Callback<unknown>
}

export function ouvirVotoRegistrado<T = unknown>(callback: Callback<T>) {
  listeners['voto_registrado'] = callback as Callback<unknown>
}

// dispatcher central — chama no useEffect da página
export function iniciarDispatcher() {
  if (!ws) return
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as { tipo?: string; payload?: unknown }
      if (!msg.tipo) return

      const cb = listeners[msg.tipo]
      if (cb) cb(msg.payload)
    } catch {
      console.error('Erro ao parsear mensagem WebSocket')
    }
  }
}

export function ouvirSalaAtual<T = unknown>(callback: Callback<T>) {
  listeners['sala_atual'] = callback as Callback<unknown>
}

// ── REMOVER LISTENERS ──
export function removerListeners() {
  Object.keys(listeners).forEach(k => delete listeners[k])
  if (ws) ws.onmessage = null
}

export function ouvirSalaIniciada<T = unknown>(callback: Callback<T>) {
  listeners['sala_iniciada'] = callback as Callback<unknown>
}

export function emitirIniciarSala() {
  if (ws?.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify({ tipo: 'iniciar_sala', payload: {} }))
}
