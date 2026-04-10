'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'

type Filme = {
  id: number
  title: string
  overview: string
  poster_path: string
  vote_average: number
  release_date: string
  generos?: string[]
  streaming?: string
}

type Props = {
  filme: Filme
  onVotar: (voto: 'like' | 'dislike') => void
  x: ReturnType<typeof useMotionValue<number>>
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

export default function FilmeCard({ filme, onVotar, x }: Props) {
  const [sinopseAberta, setSinopseAberta] = useState(false)

  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const dislikeOpacity = useTransform(x, [-100, -20], [1, 0])

  

  function handleDragEnd(_: never, info: { offset: { x: number } }) {
    if (info.offset.x > 100) onVotar('like')
    else if (info.offset.x < -100) onVotar('dislike')
    else x.set(0)
  }

  return (
    <motion.div
      key={filme.id}
      style={{
        x, rotate,
        width: '100%', maxWidth: 340,
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        cursor: 'grab', position: 'relative',
        border: '1px solid #2D2D44'
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Poster */}
      <div style={{ position: 'relative', height: 380 }}>
        <img
          src={getPoster(filme)}
          alt={filme.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        />

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to top, #0D0D1A, transparent)'
        }} />

        {/* LIKE overlay */}
        <motion.div style={{ opacity: likeOpacity, position: 'absolute', top: 20, left: 20 }}>
          <div style={{ border: '3px solid #34D399', borderRadius: 8, padding: '4px 12px' }}>
            <span style={{ color: '#34D399', fontWeight: 800, fontSize: 22 }}>LIKE</span>
          </div>
        </motion.div>

        {/* NOPE overlay */}
        <motion.div style={{ opacity: dislikeOpacity, position: 'absolute', top: 20, right: 20 }}>
          <div style={{ border: '3px solid #F87171', borderRadius: 8, padding: '4px 12px' }}>
            <span style={{ color: '#F87171', fontWeight: 800, fontSize: 22 }}>NOPE</span>
          </div>
        </motion.div>

        {/* Título e nota */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, marginRight: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#fff', lineHeight: 1.2 }}>{filme.title}</h2>
              {filme.release_date && <p style={{ fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' }}>{filme.release_date}</p>}
            </div>
            {filme.vote_average && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4,
                background: '#7C3AED', borderRadius: 20, padding: '4px 10px', flexShrink: 0 }}>
                <Star size={12} color="#FCD34D" fill="#FCD34D" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{filme.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info abaixo do poster */}
      <div style={{ background: '#1A1A2E', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(filme.generos || []).map(g => (
              <span key={g} style={{
                fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                background: '#7C3AED22', border: '1px solid #7C3AED44', color: '#A855F7'
              }}>{g}</span>
            ))}
          </div>
          {filme.streaming && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF',
              background: '#2D2D44', padding: '3px 8px', borderRadius: 999, flexShrink: 0 }}>
              {getNomeStreaming(filme.streaming)}
            </span>
          )}
        </div>

        <button onClick={() => setSinopseAberta(!sinopseAberta)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
            {sinopseAberta ? 'Ocultar sinopse' : 'Ver sinopse'}
          </span>
          {sinopseAberta ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
        </button>

        <AnimatePresence>
          {sinopseAberta && (
            <motion.p
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: '8px 0 0', overflow: 'hidden' }}>
              {filme.overview}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}