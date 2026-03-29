'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { Heart, X, Users } from 'lucide-react'
import { buscarFilmesDaSala, buscarSala } from '../../../services/api'
import LoadingSpinner from '../../../components/LoadingSpinner'
import FilmeCard from '../../../components/FilmeCard'
import MatchPopup from '../../../components/MatchPopup'

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

const FILMES_MOCK: Filme[] = [
  {
    id: 1, title: 'Inception',
    overview: 'Um ladrão especializado em roubar segredos do subconsciente recebe a missão inversa: plantar uma ideia.',
    poster_path: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    vote_average: 8.8, release_date: '2010', generos: ['Sci-Fi', 'Action'], streaming: 'Netflix'
  },
  {
    id: 2, title: 'The Dark Knight',
    overview: 'Batman enfrenta o Coringa, um criminoso que semeia o caos em Gotham City.',
    poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    vote_average: 9.0, release_date: '2008', generos: ['Action', 'Drama'], streaming: 'Max'
  },
  {
    id: 3, title: 'Interstellar',
    overview: 'Um grupo de astronautas viaja através de um buraco de minhoca em busca de um novo lar.',
    poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    vote_average: 8.6, release_date: '2014', generos: ['Sci-Fi', 'Drama'], streaming: 'Prime'
  },
]

export default function Party({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const [filmes, setFilmes] = useState<Filme[]>([])
  const [index, setIndex] = useState(0)
  const [match, setMatch] = useState<Filme | null>(null)
  const [jogadoresVotaram, setJogadoresVotaram] = useState(1)
  const [totalJogadores, setTotalJogadores] = useState(0)
  const [carregando, setCarregando] = useState(true)

  const x = useMotionValue(0)

  useEffect(() => {
    async function carregar() {
      try {
        const [filmesDados, salaDados] = await Promise.all([
          buscarFilmesDaSala(id),
          buscarSala(id)
        ])
        setFilmes(filmesDados)
        setTotalJogadores(salaDados.totalJogadores || salaDados.jogadores?.length || 0)
      } catch {
        console.warn('Backend indisponível, usando mock')
        setFilmes(FILMES_MOCK)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id])

  const filme = filmes[index]

  function votar(voto: 'like' | 'dislike') {
    if (!filme) return

    if (voto === 'like' && index === 1) {
      setTimeout(() => setMatch(filme), 300)
      return
    }

    setTimeout(() => {
      if (index + 1 < filmes.length) {
        setIndex(index + 1)
        setJogadoresVotaram(Math.floor(Math.random() * totalJogadores) + 1)
      }
      x.set(0)
    }, 300)
  }

  if (carregando) return <LoadingSpinner texto="Carregando filmes..." />

  if (!filme) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9CA3AF' }}>Nenhum filme encontrado.</p>
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Sala #{id.toUpperCase()}
          </p>
          <p style={{ fontSize: 13, color: '#F0F0F0', margin: 0, fontWeight: 600, marginTop: 2 }}>
            Filme {index + 1} de {filmes.length}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          background: '#1E1E2E', borderRadius: 20, padding: '6px 12px', border: '1px solid #2D2D44' }}>
          <Users size={13} color="#A855F7" />
          <span style={{ fontSize: 12, color: '#A855F7', fontWeight: 600 }}>
            {jogadoresVotaram}/{totalJogadores}
          </span>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          <FilmeCard key={filme.id} filme={filme} onVotar={votar} x={x} />
        </AnimatePresence>
      </div>

      {/* Botões Like / Dislike */}
      <div style={{ padding: '16px 20px 32px', display: 'flex', justifyContent: 'center', gap: 32, flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => votar('dislike')} style={{
          width: 64, height: 64, borderRadius: '50%', border: '2px solid #F87171',
          background: '#F8717122', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <X size={28} color="#F87171" />
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => votar('like')} style={{
          width: 64, height: 64, borderRadius: '50%', border: '2px solid #34D399',
          background: '#34D39922', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Heart size={28} color="#34D399" />
        </motion.button>
      </div>

      {/* Match Popup */}
      <MatchPopup
        match={match}
        onContinuar={() => { setMatch(null); setIndex(index + 1) }}
      />

    </div>
  )
}