'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import React from 'react'
import { atualizarApelidoSala, buscarSala } from '../../services/api'
import { conectar, desconectar, emitirApelido, emitirIniciarSala, iniciarDispatcher, ouvirJogadorAtualizado, ouvirParticipantes, ouvirSalaAtual, ouvirSalaIniciada, removerListeners } from '../../services/socket'
import LoadingSpinner from '../../components/LoadingSpinner'
import PlayerList from '../../components/PlayerList'
import SalaCode from '../../components/SalaCode'
import Button from '../../components/Button'

type Player = {
  id: string
  apelido?: string
}

type PlayerPayload = Player | string

type Sala = {
  id: string
  status: string
  participantes?: PlayerPayload[]
  jogadores?: PlayerPayload[]
}

function getUserIdSessao() {
  const userIdSalvo = window.sessionStorage.getItem('userId')
  if (userIdSalvo) return userIdSalvo

  const novoUserId = window.crypto.randomUUID()
  window.sessionStorage.setItem('userId', novoUserId)
  return novoUserId
}

function normalizarPlayers(players: PlayerPayload[]) {
  return players
    .map(player => (
      typeof player === 'string'
        ? { id: player }
        : player
    ))
    .filter(player => Boolean(player.id))
}

function atualizarPlayer(players: PlayerPayload[], playerAtualizado: Player) {
  const playersNormalizados = normalizarPlayers(players)
  const jaExiste = playersNormalizados.some(p => p.id === playerAtualizado.id)
  if (!jaExiste) return [...playersNormalizados, playerAtualizado]

  return playersNormalizados.map(player => (
    player.id === playerAtualizado.id
      ? { ...player, apelido: playerAtualizado.apelido || player.apelido }
      : player
  ))
}

function obterPlayersDaSala(sala: Sala) {
  return sala.participantes || sala.jogadores || []
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
  const [apelidoInput, setApelidoInput] = useState('')
  const [userId, setUserId] = useState('')
  const apelidoRef = useRef('Jogador')

  useEffect(() => {
    setIsDono(sessionStorage.getItem('donoDaSala') === salaId)

    const apelidoSalvo = sessionStorage.getItem('apelido') || ''
    const apelidoInicial = apelidoSalvo.trim() || 'Jogador'
    apelidoRef.current = apelidoInicial
    setApelidoInput(apelidoInicial)
    setUserId(getUserIdSessao())
  }, [salaId])

  useEffect(() => {
    if (!userId) return

    conectar(salaId, userId, apelidoRef.current)
    iniciarDispatcher()

    ouvirSalaAtual((data: { userId: string, total: number, jogadores: PlayerPayload[] }) => {
      setPlayers(normalizarPlayers(data.jogadores || []))
    })

    ouvirParticipantes((data: { userId: string, apelido?: string, status?: string }) => {
      setPlayers(prev => {
        if (data.status === 'saiu') {
          return prev.filter(p => p.id !== data.userId)
        }

        return atualizarPlayer(prev, { id: data.userId, apelido: data.apelido })
      })
    })

    ouvirJogadorAtualizado((data: { userId: string, apelido?: string }) => {
      setPlayers(prev => atualizarPlayer(prev, { id: data.userId, apelido: data.apelido }))
    })

    ouvirSalaIniciada(() => {
      router.push(`/sala/${salaId}/party`)
    })

    return () => {
      removerListeners()
      desconectar()
    }
  }, [salaId, userId, router])

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarSala(salaId)
        setSala(dados)
        const playersDaSala = obterPlayersDaSala(dados)
        if (playersDaSala.length > 0) {
          setPlayers(normalizarPlayers(playersDaSala))
        }
      } catch {
        setSala({ id: salaId, status: 'lobby' })
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [salaId])

  useEffect(() => {
    if (!userId) return

    let ativo = true

    async function atualizarParticipantes() {
      try {
        const dados = await buscarSala(salaId)
        const playersDaSala = obterPlayersDaSala(dados)

        if (ativo && playersDaSala.length > 0) {
          setPlayers(normalizarPlayers(playersDaSala))
        }
      } catch {
      }
    }

    atualizarParticipantes()
    const intervalo = window.setInterval(atualizarParticipantes, 3000)

    return () => {
      ativo = false
      window.clearInterval(intervalo)
    }
  }, [salaId, userId])

  function salvarApelido() {
    const novoApelido = apelidoInput.trim() || 'Jogador'
    sessionStorage.setItem('apelido', novoApelido)
    apelidoRef.current = novoApelido
    setApelidoInput(novoApelido)
    if (userId) {
      setPlayers(prev => atualizarPlayer(prev, { id: userId, apelido: novoApelido }))
    }
    emitirApelido(novoApelido)
    if (userId) {
      atualizarApelidoSala(salaId, userId, novoApelido).catch(() => {})
    }
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <button type="button" onClick={salvarApelido} style={{
            width: '100%', minHeight: 44, padding: '12px 14px', borderRadius: 12, border: '1px solid #7C3AED',
            background: '#7C3AED22', color: '#C4B5FD', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            touchAction: 'manipulation'
          }}>
            Salvar apelido
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
