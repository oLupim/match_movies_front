'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Filme = {
  id: number
  title: string
  overview: string
  poster_path: string
  vote_average: number
  release_date: string
  streaming?: string
}

type Props = {
  match: Filme | null
  onContinuar: () => void
}

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
const POSTER_PLACEHOLDER = 'https://via.placeholder.com/500x750/1E1E2E/A855F7?text=Sem+Poster'

const STREAMINGS: Record<number, string> = {
  8:    'NETFLIX',
  9:    'PRIME',
  337:  'DISNEY+',
  1899: 'MAX',
  350:  'APPLE TV',
  307:  'GLOBOPLAY',
  531:  'PARAMOUNT',
}

function getNomeStreaming(streaming: string | number) {
  const id = Number(streaming)
  return STREAMINGS[id] || streaming
}

function getPoster(filme: Filme) {
  if (!filme.poster_path) return POSTER_PLACEHOLDER
  if (filme.poster_path.startsWith('http')) return filme.poster_path
  return `${POSTER_BASE}${filme.poster_path}`
}

export default function MatchPopup({ match, onContinuar }: Props) {
  const router = useRouter()

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }} transition={{ type: 'spring', damping: 15 }}
            style={{
              background: '#1E1E2E', borderRadius: 24, overflow: 'hidden',
              width: '100%', maxWidth: 340, border: '1px solid #7C3AED'
            }}>

            <div style={{ position: 'relative', height: 280 }}>
              <img src={getPoster(match)} alt={match.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1E1E2E 10%, transparent 60%)' }} />
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', borderRadius: 999, padding: '8px 24px' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>🎉 MATCH!</span>
                </div>
              </motion.div>
            </div>

            <div style={{ padding: '16px 20px 24px' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>{match.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {match.release_date && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{match.release_date}</span>}
                {match.vote_average && <>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <span style={{ fontSize: 12, color: '#FCD34D', fontWeight: 700 }}>{match.vote_average.toFixed(1)}</span>
                  </div>
                </>}
                {match.streaming && <>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>•</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: '#7C3AED22', color: '#A855F7', padding: '2px 8px', borderRadius: 999 }}>
                    {getNomeStreaming(match.streaming)}
                  </span>
                </>}
              </div>
              <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: '0 0 20px' }}>{match.overview}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={onContinuar} style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: '1px solid #2D2D44',
                  background: '#2D2D44', color: '#E5E7EB', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                }}>
                  Continuar vendo filmes
                </button>
                <button onClick={() => router.push('/')} style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Voltar ao início
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}