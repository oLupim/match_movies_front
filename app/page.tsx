'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv2, Play, Hash } from 'lucide-react'
import { criarSala as criarSalaAPI } from './services/api'

const STREAMINGS = [
  { id: 8,    nome: 'NETFLIX'    },
  { id: 9,    nome: 'PRIME'      },
  { id: 337,  nome: 'DISNEY+'    },
  { id: 1899, nome: 'MAX'        },
  { id: 350,  nome: 'APPLE TV'   },
  { id: 307,  nome: 'GLOBOPLAY'  },
  { id: 531,  nome: 'PARAMOUNT'  },
]

const GENEROS = [
  { id: 28,    nome: 'Action'      },
  { id: 35,    nome: 'Comedy'      },
  { id: 10749, nome: 'Romance'     },
  { id: 27,    nome: 'Horror'      },
  { id: 878,   nome: 'Sci-Fi'      },
  { id: 18,    nome: 'Drama'       },
  { id: 53,    nome: 'Thriller'    },
  { id: 16,    nome: 'Animation'   },
  { id: 99,    nome: 'Documentary' },
  { id: 14,    nome: 'Fantasy'     },
]

function toggle(lista: number[], item: number) {
  return lista.includes(item)
    ? lista.filter(i => i !== item)
    : [...lista, item]
}

export default function Home() {
  const router = useRouter()
  const [tela, setTela] = useState<'inicio' | 'criar' | 'entrar'>('inicio')
  const [codigo, setCodigo] = useState('')
  const [streamings, setStreamings] = useState<number[]>([])
  const [generos, setGeneros] = useState<number[]>([])
  const [erro, setErro] = useState('')

  async function criarSala(generos: number[], streamings: number[]) {
  if (streamings.length === 0) return setErro('Selecione pelo menos um streaming')
  if (generos.length === 0) return setErro('Selecione pelo menos um gênero')
  setErro('')
  try {
    const { salaId } = await criarSalaAPI(generos, streamings)
    router.push(`/sala/${salaId}/party`)
  } catch (err) {
    setErro('Erro ao criar sala. Tente novamente.')
  }
}

  function entrarSala() {
    if (!codigo.trim()) return setErro('Digite o código da sala')
    setErro('')
    router.push(`/sala/${codigo.trim().toUpperCase()}`)
  }

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Tv2 size={32} color="white" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
          <span style={{ color: '#ffffff' }}>Tinder dos </span>
          <span style={{ color: '#A855F7' }}>Filmes</span>
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
          Você finalmente vai achar um filme que todos gostem!
        </p>
      </motion.div>

      {/* Conteúdo */}
      <div style={{ width: '100%', maxWidth: 350 }}>
        <AnimatePresence mode="wait">

          {/* ── TELA INICIAL ── */}
          {tela === 'inicio' && (
            <motion.div key="inicio"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              <button onClick={() => setTela('criar')} style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Poppins, sans-serif'
              }}>
                <Tv2 size={18} /> Criar Sala
              </button>

              <button onClick={() => setTela('entrar')} style={{
                width: '100%', padding: '16px', borderRadius: 16,
                border: '1px solid #2D2D44', background: '#1E1E2E',
                color: '#E5E7EB', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Poppins, sans-serif'
              }}>
                <Play size={18} /> Entrar em Sala
              </button>

              <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 24 }}>
                Gustavo Lupim &amp; Guilherme Alves
              </p>
            </motion.div>
          )}

          {/* ── CRIAR SALA ── */}
          {tela === 'criar' && (
            <motion.div key="criar"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <button onClick={() => { setTela('inicio'); setErro('') }}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
                ← Voltar
              </button>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#eeeeee" }}>Nova sala</h2>

              {/* Gêneros */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Escolha os gêneros
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {GENEROS.map(g => (
                    <button key={g.id} onClick={() => setGeneros(toggle(generos, g.id))} style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                      background: generos.includes(g.id) ? '#7C3AED22' : '#1E1E2E',
                      border: `1px solid ${generos.includes(g.id) ? '#A855F7' : '#2D2D44'}`,
                      color: generos.includes(g.id) ? '#A855F7' : '#9CA3AF',
                    }}>
                      {g.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Streamings */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Streaming disponível
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {STREAMINGS.map(s => (
                    <button key={s.id} onClick={() => setStreamings(toggle(streamings, s.id))} style={{
                      padding: '12px 4px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                      background: streamings.includes(s.id) ? '#7C3AED22' : '#1E1E2E',
                      border: `1px solid ${streamings.includes(s.id) ? '#A855F7' : '#2D2D44'}`,
                      color: streamings.includes(s.id) ? '#A855F7' : '#9CA3AF',
                    }}>
                      {s.nome}
                    </button>
                  ))}
                </div>
              </div>

              {erro && (
                <p style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>⚠️ {erro}</p>
              )}

              <button onClick={() => criarSala(generos, streamings)} style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Criar Sala →
              </button>
            </motion.div>
          )}

          {/* ── ENTRAR EM SALA ── */}
          {tela === 'entrar' && (
            <motion.div key="entrar"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <button onClick={() => { setTela('inicio'); setErro('') }}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
                ← Voltar
              </button>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#eeeeee" }}>Entrar em sala</h2>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Código da sala
                </p>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                  <input type="text" placeholder="Ex: XKTZ91"
                    value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
                    maxLength={8}
                    style={{
                      width: '100%', padding: '12px 16px 12px 36px', borderRadius: 12,
                      background: '#1E1E2E', border: '1px solid #2D2D44',
                      color: '#fff', fontSize: 14, outline: 'none',
                      fontFamily: 'Poppins, sans-serif', letterSpacing: '0.15em',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#A855F7'}
                    onBlur={e => e.target.style.borderColor = '#2D2D44'}
                  />
                </div>
              </div>

              {erro && (
                <p style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>⚠️ {erro}</p>
              )}

              <button onClick={entrarSala} style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Entrar →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}