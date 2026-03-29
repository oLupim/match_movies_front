'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import React from 'react'
import { buscarSala } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import PlayerList from '../../components/PlayerList'
import SalaCode from '../../components/SalaCode'
import Button from '../../components/Button'

type Player = { id: string }

type Sala = {
  id: string
  status: string
}

export default function Lobby({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = React.use(params)
  const salaId = id.toUpperCase()
  const link = typeof window !== 'undefined' ? `${window.location.origin}/sala/${salaId}` : ''

  const [sala, setSala] = useState<Sala | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [carregando, setCarregando] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws/${salaId}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'players') {
        const lista = (msg.payload.players as string[]).map(id => ({ id }))
        setPlayers(lista)
      }
    }

    ws.onclose = () => console.log('WebSocket desconectado')

    return () => ws.close()
  }, [salaId])

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarSala(salaId)
        setSala(dados)
      } catch {
        setSala({ id: salaId, status: 'lobby' })
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [salaId])

  if (carregando) return <LoadingSpinner texto="Carregando sala..." />
  if (!sala) return null

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100vh' }}>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 4 }}>Sala criada com sucesso 🎬</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#eeeeee' }}>Aguardando jogadores</h1>
      </motion.div>

      <SalaCode salaId={salaId} link={link} />

      <PlayerList players={players} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 'auto', paddingBottom: 20 }}>
        <Button onClick={() => router.push(`/sala/${salaId}/party`)} larguraTotal>
          Iniciar Sessão 🎬
        </Button>
        <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 10 }}>
          Apenas o dono da sala pode iniciar
        </p>
      </motion.div>

    </div>
  )
}