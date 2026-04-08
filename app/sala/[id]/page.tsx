'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import React from 'react'
import { buscarSala } from '../../services/api'
import { conectar, desconectar, emitirIniciarSala, iniciarDispatcher, ouvirParticipantes, ouvirSalaAtual, ouvirSalaIniciada, removerListeners } from '../../services/socket'
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
  const [isDono, setIsDono] = useState(false)

useEffect(() => {
  setIsDono(sessionStorage.getItem('donoDaSala') === salaId)
}, [salaId])

useEffect(() => {
  const userId = sessionStorage.getItem('userId') ?? (() => {
    const id = crypto.randomUUID()
    sessionStorage.setItem('userId', id)
    return id
  })()
  
  conectar(salaId, userId)
  iniciarDispatcher()

  ouvirSalaAtual((data: { userId: string, total: number, jogadores: string[] }) => {
    setPlayers(data.jogadores.map(id => ({ id })))
  })

  ouvirParticipantes((data: { userId: string }) => {
    if (data.userId === userId) return
    setPlayers(prev => {
      const jaExiste = prev.some(p => p.id === data.userId)
      if (jaExiste) return prev
      return [...prev, { id: data.userId }]
    })
  })

  ouvirSalaIniciada(() => {
    router.push(`/sala/${salaId}/party`)
  })

  return () => {
    removerListeners()
    desconectar()
  }
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

      {isDono && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
    style={{ marginTop: 'auto', paddingBottom: 20 }}>
    <Button onClick={() => emitirIniciarSala()} larguraTotal>
      Iniciar Sessão 🎬
    </Button>
    <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 10 }}>
      Apenas o dono da sala pode iniciar
    </p>
  </motion.div>
)}

    </div>
  )
}