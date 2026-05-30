'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Home, Play, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getLinkStreaming, getNomeStreaming, type StreamingValue } from '../utils/streaming'

type Filme = {
  id: number
  title: string
  overview: string
  poster_path: string
  vote_average: number
  release_date: string
  streaming?: StreamingValue
  watch_url?: string
}

type Props = {
  match: Filme | null
  onContinuar: () => void
}

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
const POSTER_PLACEHOLDER = 'https://via.placeholder.com/500x750/1E1E2E/A855F7?text=Sem+Poster'

function getPoster(filme: Filme) {
  if (!filme.poster_path) return POSTER_PLACEHOLDER
  if (filme.poster_path.startsWith('http')) return filme.poster_path
  return `${POSTER_BASE}${filme.poster_path}`
}

export default function MatchPopup({ match, onContinuar }: Props) {
  const router = useRouter()
  const streamingNome = match ? getNomeStreaming(match.streaming) : null
  const streamingLink = match ? getLinkStreaming(match.streaming, match.title, match.watch_url) : null

  function abrirStreaming() {
    if (!streamingLink) return
    window.location.href = streamingLink.url
  }

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'max(16px, env(safe-area-inset-top)) 20px max(16px, env(safe-area-inset-bottom))',
            overflowY: 'auto'
          }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }} transition={{ type: 'spring', damping: 15 }}
            style={{
              background: '#1E1E2E', borderRadius: 24, overflow: 'hidden',
              width: '100%', maxWidth: 340, maxHeight: 'calc(100dvh - 32px)',
              border: '1px solid #7C3AED', display: 'flex', flexDirection: 'column'
            }}>

            <div style={{ position: 'relative', height: 'clamp(180px, 36dvh, 280px)', flexShrink: 0 }}>
              <img src={getPoster(match)} alt={match.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1E1E2E 10%, transparent 60%)' }} />
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', borderRadius: 999, padding: '8px 24px' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>MATCH!</span>
                </div>
              </motion.div>
            </div>

            <div style={{ padding: '16px 20px 24px', overflowY: 'auto' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>{match.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {match.release_date && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{match.release_date}</span>}
                {match.vote_average && <>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <span style={{ fontSize: 12, color: '#FCD34D', fontWeight: 700 }}>{match.vote_average.toFixed(1)}</span>
                  </div>
                </>}
                {streamingNome && <>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>•</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: '#7C3AED22', color: '#A855F7', padding: '2px 8px', borderRadius: 999 }}>
                    {streamingNome}
                  </span>
                </>}
              </div>
              <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: '0 0 20px' }}>{match.overview}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {streamingLink && (
                  <button type="button" onClick={abrirStreaming} style={{
                    width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                    background: 'linear-gradient(135deg, #E11D48, #F97316)',
                    color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, boxSizing: 'border-box'
                  }}>
                    <Play size={16} fill="currentColor" />
                    <span>{streamingLink.direto ? 'Ir para o streaming' : `Abrir no app/site ${streamingLink.nome}`}</span>
                    <ExternalLink size={15} />
                  </button>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => router.push('/')} style={{
                    width: '100%', padding: '12px', borderRadius: 14, border: '1px solid #2D2D44',
                    background: '#2D2D44', color: '#E5E7EB', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}>
                    <Home size={15} />
                    Inicio
                  </button>
                  <button onClick={onContinuar} style={{
                    width: '100%', padding: '12px', borderRadius: 14, border: '1px solid #7C3AED',
                    background: '#7C3AED22', color: '#C4B5FD', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                  }}>
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
