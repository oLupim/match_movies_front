import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

let socket: Socket | null = null

// ── CONECTAR ──
export function conectar(salaId: string): Socket {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    query: { salaId },
    transports: ['websocket'],
    autoConnect: true,
  })

  socket.on('connect', () => {
    console.log('✅ Socket conectado:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('❌ Socket desconectado')
  })

  socket.on('connect_error', (err) => {
    console.error('Erro de conexão:', err.message)
  })

  return socket
}

// ── DESCONECTAR ──
export function desconectar() {
  socket?.disconnect()
  socket = null
}

// ── EMITIR VOTO ──
export function emitirVoto(filmeId: number, voto: 'like' | 'dislike') {
  socket?.emit('votar', { filmeId, voto })
}

// ── OUVIR EVENTOS ──
export function ouvirParticipantes(callback: (participantes: any[]) => void) {
  socket?.on('participantes', callback)
}

export function ouvirNovoCard(callback: (filme: any) => void) {
  socket?.on('novo_card', callback)
}

export function ouvirStatusVoto(callback: (data: { votaram: number, total: number }) => void) {
  socket?.on('status_voto', callback)
}

export function ouvirMatch(callback: (filme: any) => void) {
  socket?.on('match', callback)
}

export function ouvirCarregando(callback: () => void) {
  socket?.on('carregando', callback)
}

export function ouvirSemMatch(callback: () => void) {
  socket?.on('sem_match', callback)
}

// ── REMOVER LISTENERS (importante para evitar duplicatas) ──
export function removerListeners() {
  socket?.off('participantes')
  socket?.off('novo_card')
  socket?.off('status_voto')
  socket?.off('match')
  socket?.off('carregando')
  socket?.off('sem_match')
}