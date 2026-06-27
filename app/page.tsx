'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv2, Play, Hash, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { criarSala as criarSalaAPI, type FiltrosSala } from './services/api'
import Button from './components/Button'

const STREAMINGS = [
  { id: 8,    nome: 'NETFLIX'   },
  { id: 119,  nome: 'PRIME'     },
  { id: 337,  nome: 'DISNEY+'   },
  { id: 1899, nome: 'MAX'       },
  { id: 350,  nome: 'APPLE TV'  },
  { id: 307,  nome: 'GLOBOPLAY' },
  { id: 531,  nome: 'PARAMOUNT' },
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

const ANOS = [
  { label: 'Qualquer ano', value: 0 },
  ...Array.from({ length: 2026 - 1900 + 1 }, (_, index) => {
    const ano = 2026 - index
    return { label: String(ano), value: ano }
  }),
]

const NOTAS = [
  { label: 'Qualquer nota', value: 0 },
  { label: '6.0+', value: 6 },
  { label: '7.0+', value: 7 },
  { label: '8.0+', value: 8 },
]

const DIRETORES = [
  'Christopher Nolan',
  'Steven Spielberg',
  'Martin Scorsese',
  'Quentin Tarantino',
  'Greta Gerwig',
  'Denis Villeneuve',
  'Sofia Coppola',
  'Jordan Peele',
  'Bong Joon-ho',
  'Guillermo del Toro',
  'Alfonso Cuaron',
  'James Cameron',
  'Ridley Scott',
  'David Fincher',
  'Wes Anderson',
  'Hayao Miyazaki',
  'Pedro Almodovar',
  'Spike Lee',
  'Kathryn Bigelow',
  'Ava DuVernay',
]

function selecionar(lista: number[], item: number) {
  const novaLista: number[] = []
  let temItem = false
  
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] === item) {
      temItem = true
    } else {
      novaLista.push(lista[i])
    }
  }
  
  if (!temItem) {
    novaLista.push(item)
  }
  
  return novaLista
}

function selectStyle(): CSSProperties {
  return {
    width: '100%',
    minHeight: 42,
    padding: '10px 12px',
    borderRadius: 12,
    background: '#1E1E2E',
    border: '1px solid #2D2D44',
    color: '#F9FAFB',
    fontSize: 12,
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
  }
}

function inputStyle(): CSSProperties {
  return {
    ...selectStyle(),
    boxSizing: 'border-box',
  }
}

export default function Home() {
  const router = useRouter()
  const [tela, setTela] = useState<'inicio' | 'criar' | 'entrar'>('inicio')
  const [codigo, setCodigo] = useState('')
  const [streamings, setStreamings] = useState<number[]>([])
  const [generos, setGeneros] = useState<number[]>([])
  const [anoInicio, setAnoInicio] = useState(0)
  const [anoFim, setAnoFim] = useState(0)
  const [notaMin, setNotaMin] = useState(0)
  const [diretor, setDiretor] = useState('')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function criarSala(generos: number[], streamings: number[]) {
    if (streamings.length === 0) return setErro('Selecione pelo menos um streaming')
    if (generos.length === 0) return setErro('Selecione pelo menos um gênero')
    if (anoInicio > 0 && anoFim > 0 && anoInicio > anoFim) {
      return setErro('O ano inicial precisa ser menor ou igual ao ano final')
    }

    const filtrosExtras: Omit<FiltrosSala, 'generos' | 'streamings'> = {}

    if (anoInicio > 0) filtrosExtras.AnoInicio = anoInicio
    if (anoFim > 0) filtrosExtras.AnoFim = anoFim
    if (notaMin > 0) filtrosExtras.NotaMinima = notaMin
    if (diretor.trim()) filtrosExtras.Diretor = diretor.trim()

    setErro('')
    setCarregando(true)
    try {
      const { salaId } = await criarSalaAPI(generos, streamings, filtrosExtras)
      sessionStorage.setItem('donoDaSala', salaId) 
      router.push(`/sala/${salaId}`)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar sala')
    } finally {
      setCarregando(false)
    }
  }

  function entrarSala() {
    if (!codigo.trim()) return setErro('Digite o código da sala')
    setErro('')
    router.push(`/sala/${codigo.trim().toUpperCase()}`)
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(16px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
      }}>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Tv2 size={32} color="white" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
          <span style={{ color: '#ffffff' }}>Match </span>
          <span style={{ color: '#A855F7' }}>Movies</span>
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

              <Button onClick={() => setTela('criar')} larguraTotal>
                <Tv2 size={18} /> Criar Sala
              </Button>

              <Button variante="secundario" onClick={() => setTela('entrar')} larguraTotal>
                <Play size={18} /> Entrar em Sala
              </Button>

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
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <Button variante="ghost" onClick={() => { setTela('inicio'); setErro('') }}>
                ← Voltar
              </Button>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#eeeeee' }}>Nova sala</h2>

              {/* Gêneros */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Escolha os gêneros
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {GENEROS.map(g => (
                    <button key={g.id} onClick={() => setGeneros(selecionar(generos, g.id))} style={{
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
                    <button key={s.id} onClick={() => setStreamings(selecionar(streamings, s.id))} style={{
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

              {/* Filtros extras */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  aria-expanded={filtrosAbertos}
                  onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                  style={{
                    width: '100%',
                    minHeight: 42,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: '#1E1E2E',
                    border: '1px solid #2D2D44',
                    color: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SlidersHorizontal size={16} />
                    Filtros opcionais
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: filtrosAbertos ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {filtrosAbertos && (
                    <motion.div
                      key="filtros-opcionais"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, paddingTop: 2 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Ano inicio
                          </span>
                          <select value={anoInicio} onChange={e => setAnoInicio(Number(e.target.value))} style={selectStyle()}>
                            {ANOS.map(opcao => (
                              <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                            ))}
                          </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Ano fim
                          </span>
                          <select value={anoFim} onChange={e => setAnoFim(Number(e.target.value))} style={selectStyle()}>
                            {ANOS.map(opcao => (
                              <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                            ))}
                          </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Nota minima
                          </span>
                          <select value={notaMin} onChange={e => setNotaMin(Number(e.target.value))} style={selectStyle()}>
                            {NOTAS.map(opcao => (
                              <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                            ))}
                          </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Diretor
                          </span>
                          <input
                            type="text"
                            list="diretores"
                            placeholder="Ex: Nolan"
                            value={diretor}
                            onChange={e => setDiretor(e.target.value)}
                            style={inputStyle()}
                          />
                          <datalist id="diretores">
                            {DIRETORES.map(nome => (
                              <option key={nome} value={nome} />
                            ))}
                          </datalist>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {erro && (
                <p style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>⚠️ {erro}</p>
              )}

              <Button onClick={() => criarSala(generos, streamings)} larguraTotal disabled={carregando}>
                {carregando ? 'Criando...' : 'Criar Sala →'}
              </Button>

            </motion.div>
          )}

          {/* ── ENTRAR EM SALA ── */}
          {tela === 'entrar' && (
            <motion.div key="entrar"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Button variante="ghost" onClick={() => { setTela('inicio'); setErro('') }}>
                ← Voltar
              </Button>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#eeeeee' }}>Entrar em sala</h2>

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

              <Button onClick={entrarSala} larguraTotal>
                Entrar →
              </Button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
