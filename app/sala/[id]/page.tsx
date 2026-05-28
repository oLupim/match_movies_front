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

type Player = {
  id: string
  apelido?: string
}

type Sala = {
  id: string
  status: string
}

function getUserIdSessao() {
  const userIdSalvo = window.sessionStorage.getItem('userId')
  if (userIdSalvo) return userIdSalvo

  const novoUserId = window.crypto.randomUUID()
  window.sessionStorage.setItem('userId', novoUserId)
  return novoUserId
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
  const [apelido, setApelido] = useState('')
  const [apelidoInput, setApelidoInput] = useState('')

  useEffect(() => {
    setIsDono(sessionStorage.getItem('donoDaSala') === salaId)

    const apelidoSalvo = sessionStorage.getItem('apelido') || ''
    const apelidoInicial = apelidoSalvo.trim() || 'Jogador'
    setApelido(apelidoInicial)
    setApelidoInput(apelidoInicial)
  }, [salaId])

  useEffect(() => {
    if (!apelido) return

    const userId = getUserIdSessao()

    conectar(salaId, userId, apelido)
    iniciarDispatcher()

    ouvirSalaAtual((data: { userId: string, total: number, jogadores: Player[] }) => {
      setPlayers(data.jogadores)
    })

    ouvirParticipantes((data: { userId: string, apelido?: string, status?: string }) => {
      setPlayers(prev => {
        if (data.status === 'saiu') {
          return prev.filter(p => p.id !== data.userId)
        }

        const player = { id: data.userId, apelido: data.apelido }
        const jaExiste = prev.some(p => p.id === data.userId)
        if (jaExiste) {
          return prev.map(p => p.id === data.userId ? { ...p, apelido: data.apelido || p.apelido } : p)
        }
        return [...prev, player]
      })
    })

    ouvirSalaIniciada(() => {
      router.push(`/sala/${salaId}/party`)
    })

    return () => {
      removerListeners()
      desconectar()
    }
  }, [salaId, apelido, router])

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

  function salvarApelido() {
    const novoApelido = apelidoInput.trim() || 'Jogador'
    sessionStorage.setItem('apelido', novoApelido)
    setApelidoInput(novoApelido)
    setApelido(novoApelido)
  }

  if (carregando) return <LoadingSpinner texto="Carregando sala..." />
  if (!sala) return null

  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: 'max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowX: 'hidden',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 4 }}>Sala criada com sucesso</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#eeeeee' }}>Aguardando jogadores</h1>
      </motion.div>

      <div style={{ background: '#1E1E2E', borderRadius: 16, padding: 16, border: '1px solid #2D2D44' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          Seu apelido
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
          <input
            value={apelidoInput}
            onChange={e => setApelidoInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') salvarApelido() }}
            maxLength={24}
            placeholder="Digite seu nome"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              background: '#0D0D1A', border: '1px solid #2D2D44',
              color: '#fff', fontSize: 14, outline: 'none',
              fontFamily: 'Poppins, sans-serif',
            }}
          />
          <button onClick={salvarApelido} style={{
            padding: '12px 14px', borderRadius: 12, border: '1px solid #7C3AED',
            background: '#7C3AED22', color: '#C4B5FD', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
          }}>
            Salvar
          </button>
        </div>
      </div>

      <SalaCode salaId={salaId} link={link} />

      <PlayerList players={players} />

      {isDono && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 'auto', paddingBottom: 20 }}>
          <Button onClick={() => emitirIniciarSala()} larguraTotal>
            Iniciar sessao
          </Button>
          <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 10 }}>
            Apenas o dono da sala pode iniciar
          </p>
        </motion.div>
      )}
    </div>
  )
}
