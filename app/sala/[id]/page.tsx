'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Copy, Check, Users, Crown } from 'lucide-react'
import React from 'react'
import { buscarSala } from '../../services/api'

type Player = {
  id: string
}

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
  const [copiouCodigo, setCopiouCodigo] = useState(false)
  const [copiouLink, setCopiouLink] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // Conecta WebSocket
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

  // Busca dados da sala
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

  function copiar(texto: string, tipo: 'codigo' | 'link') {
    navigator.clipboard.writeText(texto)
    if (tipo === 'codigo') {
      setCopiouCodigo(true)
      setTimeout(() => setCopiouCodigo(false), 2000)
    } else {
      setCopiouLink(true)
      setTimeout(() => setCopiouLink(false), 2000)
    }
  }

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid #2D2D44', borderTop: '3px solid #A855F7',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Carregando sala...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!sala) return null

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100vh' }}>

      {/* Cabeçalho */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 4 }}>Sala criada com sucesso 🎬</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#eeeeee" }}>Aguardando jogadores</h1>
      </motion.div>

      {/* Código da sala */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: '#1E1E2E', borderRadius: 16, padding: '20px', border: '1px solid #2D2D44' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Código da sala
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: '0.2em', color: '#A855F7' }}>
            {salaId}
          </span>
          <button onClick={() => copiar(salaId, 'codigo')} style={{
            background: copiouCodigo ? '#7C3AED22' : '#2D2D44',
            border: `1px solid ${copiouCodigo ? '#A855F7' : '#3D3D54'}`,
            borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: copiouCodigo ? '#A855F7' : '#9CA3AF', fontSize: 12,
            fontFamily: 'Poppins, sans-serif', fontWeight: 500,
          }}>
            {copiouCodigo ? <Check size={14} /> : <Copy size={14} />}
            {copiouCodigo ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0D0D1A', borderRadius: 10, padding: '10px 14px', border: '1px solid #2D2D44' }}>
          <span style={{ color: '#6B7280', fontSize: 12, fontFamily: 'monospace' }}>{link}</span>
          <button onClick={() => copiar(link, 'link')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: copiouLink ? '#A855F7' : '#6B7280',
          }}>
            {copiouLink ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </motion.div>

      {/* Participantes via WebSocket */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: '#1E1E2E', borderRadius: 16, padding: '16px 20px', border: '1px solid #2D2D44' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Users size={14} color="#9CA3AF" />
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            Conectados ({players.length})
          </p>
        </div>

        {players.length === 0 ? (
          <p style={{ color: '#4B5563', fontSize: 13 }}>Aguardando jogadores entrarem...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {players.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F0F0' }}>
                      Jogador {i + 1}
                    </span>
                    {i === 0 && <Crown size={12} color="#F59E0B" />}
                  </div>
                  <span style={{ fontSize: 11, color: '#34D399' }}>● Online</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Botão iniciar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 'auto', paddingBottom: 20 }}>
        <button onClick={() => router.push(`/sala/${salaId}/party`)} style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Iniciar Sessão 🎬
        </button>
        <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 10 }}>
          Apenas o dono da sala pode iniciar
        </p>
      </motion.div>

    </div>
  )
}