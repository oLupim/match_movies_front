const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
  .replace('http://', 'ws://')
  .replace('https://', 'wss://')

let ws: WebSocket | null = null
const pendingMessages: string[] = []

type Callback<T = unknown> = (data: T) => void
const listeners: Record<string, Callback> = {}

function enviarMensagem(mensagem: object) {
  const texto = JSON.stringify(mensagem)

  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(texto)
    return
  }

  if (ws?.readyState === WebSocket.CONNECTING) {
    pendingMessages.push(texto)
  }
}

function enviarPendentes() {
  if (ws?.readyState !== WebSocket.OPEN) return

  while (pendingMessages.length > 0) {
    const mensagem = pendingMessages.shift()
    if (mensagem) ws.send(mensagem)
  }
}

export function conectar(salaId: string, userId: string, apelido?: string): WebSocket {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws
  }

  const params = new URLSearchParams({ userId })
  if (apelido?.trim()) params.set('apelido', apelido.trim())

  ws = new WebSocket(`${WS_URL}/ws/sala/${salaId}?${params.toString()}`)
  ws.onopen = enviarPendentes
  return ws
}

export function desconectar() {
  ws?.close()
  ws = null
}

export function emitirVoto(filmeId: number, voto: 'like' | 'dislike') {
  enviarMensagem({
    tipo: 'voto',
    payload: { filmeId, voto }
  })
}

export function emitirApelido(apelido: string) {
  enviarMensagem({
    tipo: 'apelido',
    payload: { apelido }
  })
}

export function emitirIniciarSala() {
  enviarMensagem({ tipo: 'iniciar_sala', payload: {} })
}

export function ouvirParticipantes<T = unknown>(callback: Callback<T>) {
  listeners['jogador_entrou'] = callback as Callback<unknown>
  listeners['jogador_saiu'] = callback as Callback<unknown>
}

export function ouvirJogadorAtualizado<T = unknown>(callback: Callback<T>) {
  listeners['jogador_atualizado'] = callback as Callback<unknown>
}

export function ouvirMatch<T = unknown>(callback: Callback<T>) {
  listeners['match'] = callback as Callback<unknown>
}

export function ouvirVotoRegistrado<T = unknown>(callback: Callback<T>) {
  listeners['voto_registrado'] = callback as Callback<unknown>
}

export function ouvirSalaAtual<T = unknown>(callback: Callback<T>) {
  listeners['sala_atual'] = callback as Callback<unknown>
}

export function ouvirSalaIniciada<T = unknown>(callback: Callback<T>) {
  listeners['sala_iniciada'] = callback as Callback<unknown>
}

export function iniciarDispatcher() {
  if (!ws) return

  ws.onmessage = event => {
    try {
      const msg = JSON.parse(event.data) as { tipo?: string; payload?: unknown }
      if (!msg.tipo) return

      const callback = listeners[msg.tipo]
      if (callback) callback(msg.payload)
    } catch {
      console.error('Erro ao interpretar mensagem WebSocket')
    }
  }
}

export function removerListeners() {
  Object.keys(listeners).forEach(tipo => delete listeners[tipo])
  if (ws) ws.onmessage = null
}
