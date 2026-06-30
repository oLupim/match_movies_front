'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Hash, Play, Star, Tv2, UserRound } from 'lucide-react'
import { buscarDiretores, criarSala as criarSalaAPI, type DiretorResultado } from './services/api'

const STREAMINGS = [
  { id: 8, nome: 'NETFLIX' },
  { id: 119, nome: 'PRIME' },
  { id: 337, nome: 'DISNEY+' },
  { id: 1899, nome: 'MAX' },
  { id: 350, nome: 'APPLE TV' },
  { id: 307, nome: 'GLOBOPLAY' },
  { id: 531, nome: 'PARAMOUNT' },
]

const GENEROS = [
  { id: 28, nome: 'Action' },
  { id: 35, nome: 'Comedy' },
  { id: 10749, nome: 'Romance' },
  { id: 27, nome: 'Horror' },
  { id: 878, nome: 'Sci-Fi' },
  { id: 18, nome: 'Drama' },
  { id: 53, nome: 'Thriller' },
  { id: 16, nome: 'Animation' },
  { id: 99, nome: 'Documentary' },
  { id: 14, nome: 'Fantasy' },
]

const NOTAS = [0, 6, 7, 8, 9]

const DIRETORES_FALLBACK = [
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
  'James Cameron',
  'Ridley Scott',
  'David Fincher',
  'Wes Anderson',
  'Hayao Miyazaki',
]

function toggle(lista: number[], item: number) {
  return lista.includes(item)
    ? lista.filter(i => i !== item)
    : [...lista, item]
}

function filtrarDiretoresLocais(query: string): DiretorResultado[] {
  const termo = query.trim().toLocaleLowerCase('pt-BR')

  return DIRETORES_FALLBACK
    .filter(nome => nome.toLocaleLowerCase('pt-BR').includes(termo))
    .slice(0, 6)
    .map((nome, index) => ({ id: -(index + 1), nome }))
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9CA3AF',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: 10,
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  background: '#1E1E2E',
  border: '1px solid #2D2D44',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'Poppins, sans-serif',
  boxSizing: 'border-box' as const,
}

export default function Home() {
  const router = useRouter()
  const [tela, setTela] = useState<'inicio' | 'criar' | 'entrar'>('inicio')
  const [codigo, setCodigo] = useState('')
  const [streamings, setStreamings] = useState<number[]>([])
  const [generos, setGeneros] = useState<number[]>([])
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [anoInicio, setAnoInicio] = useState('')
  const [anoFim, setAnoFim] = useState('')
  const [notaMinima, setNotaMinima] = useState(0)
  const [diretor, setDiretor] = useState('')
  const [diretorConfirmado, setDiretorConfirmado] = useState('')
  const [sugestoesDiretores, setSugestoesDiretores] = useState<DiretorResultado[]>([])
  const [buscandoDiretores, setBuscandoDiretores] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const busca = diretor.trim()
    if (!mostrarFiltros || busca.length < 2 || busca === diretorConfirmado) {
      setSugestoesDiretores([])
      setBuscandoDiretores(false)
      return
    }

    let ativo = true
    setBuscandoDiretores(true)

    const timeout = window.setTimeout(async () => {
      try {
        const resultados = await buscarDiretores(busca)
        if (ativo) setSugestoesDiretores(resultados.length > 0 ? resultados : filtrarDiretoresLocais(busca))
      } catch {
        if (ativo) setSugestoesDiretores(filtrarDiretoresLocais(busca))
      } finally {
        if (ativo) setBuscandoDiretores(false)
      }
    }, 350)

    return () => {
      ativo = false
      window.clearTimeout(timeout)
    }
  }, [diretor, diretorConfirmado, mostrarFiltros])

  async function criarSala(generosSelecionados: number[], streamingsSelecionados: number[]) {
    if (streamingsSelecionados.length === 0) return setErro('Selecione pelo menos um streaming')
    if (generosSelecionados.length === 0) return setErro('Selecione pelo menos um genero')

    const anoInicioNumero = mostrarFiltros && anoInicio.trim() ? Number(anoInicio) : undefined
    const anoFimNumero = mostrarFiltros && anoFim.trim() ? Number(anoFim) : undefined
    if (mostrarFiltros && ((anoInicioNumero && anoInicioNumero < 1888) || (anoFimNumero && anoFimNumero < 1888))) {
      return setErro('Digite um ano valido')
    }
    if (mostrarFiltros && anoInicioNumero && anoFimNumero && anoInicioNumero > anoFimNumero) {
      return setErro('O ano inicial precisa ser menor que o ano final')
    }

    setErro('')
    setCarregando(true)
    try {
      const { salaId } = await criarSalaAPI({
        generos: generosSelecionados,
        streamings: streamingsSelecionados,
        anoInicio: anoInicioNumero,
        anoFim: anoFimNumero,
        notaMinima: mostrarFiltros ? notaMinima || undefined : undefined,
        diretor: mostrarFiltros ? diretor.trim() || undefined : undefined,
      })
      sessionStorage.setItem('donoDaSala', salaId)
      router.push(`/sala/${salaId}`)
    } catch {
      setErro('Erro ao criar sala. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  function entrarSala() {
    if (!codigo.trim()) return setErro('Digite o codigo da sala')
    setErro('')
    router.push(`/sala/${codigo.trim().toUpperCase()}`)
  }

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
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
          Voce finalmente vai achar um filme que todos gostem!
        </p>
      </motion.div>

      <div style={{ width: '100%', maxWidth: 350 }}>
        <AnimatePresence mode="wait">
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

          {tela === 'criar' && (
            <motion.div key="criar"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <button onClick={() => { setTela('inicio'); setErro('') }}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
                Voltar
              </button>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#eeeeee' }}>Nova sala</h2>

              <div>
                <p style={labelStyle}>Escolha os generos</p>
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

              <div>
                <p style={labelStyle}>Streaming disponivel</p>
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

              <button
                type="button"
                onClick={() => setMostrarFiltros(valor => !valor)}
                style={{
                  alignSelf: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: '#C4B5FD',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                }}
              >
                {mostrarFiltros ? 'Ocultar mais filtros' : 'Escolher mais filtros'}
              </button>

              {mostrarFiltros && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'visible' }}
                >
                  <div>
                    <p style={labelStyle}>Ano do filme</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                        <input type="number" inputMode="numeric" placeholder="De" value={anoInicio}
                          onChange={e => setAnoInicio(e.target.value)} min={1888} max={2100}
                          style={{ ...inputStyle, paddingLeft: 36 }} />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                        <input type="number" inputMode="numeric" placeholder="Ate" value={anoFim}
                          onChange={e => setAnoFim(e.target.value)} min={1888} max={2100}
                          style={{ ...inputStyle, paddingLeft: 36 }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p style={labelStyle}>Nota minima</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      {NOTAS.map(nota => (
                        <button key={nota} onClick={() => setNotaMinima(nota)} style={{
                          minHeight: 42, padding: '8px 4px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                          background: notaMinima === nota ? '#7C3AED22' : '#1E1E2E',
                          border: `1px solid ${notaMinima === nota ? '#A855F7' : '#2D2D44'}`,
                          color: notaMinima === nota ? '#A855F7' : '#9CA3AF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                          {nota > 0 && <Star size={12} fill="currentColor" />}
                          {nota === 0 ? 'Todas' : `${nota}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={labelStyle}>Diretor</p>
                    <div style={{ position: 'relative' }}>
                      <UserRound size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                      <input type="text" placeholder="Ex: Christopher Nolan" value={diretor}
                        onChange={e => {
                          setDiretor(e.target.value)
                          setDiretorConfirmado('')
                        }}
                        maxLength={60}
                        style={{ ...inputStyle, paddingLeft: 38 }} />
                      {(buscandoDiretores || sugestoesDiretores.length > 0) && (
                        <div style={{
                          position: 'absolute',
                          zIndex: 5,
                          left: 0,
                          right: 0,
                          top: 'calc(100% + 6px)',
                          background: '#1E1E2E',
                          border: '1px solid #2D2D44',
                          borderRadius: 12,
                          overflow: 'hidden',
                          boxShadow: '0 16px 32px rgba(0,0,0,0.35)'
                        }}>
                          {buscandoDiretores && (
                            <div style={{ padding: '10px 12px', color: '#9CA3AF', fontSize: 12 }}>
                              Buscando...
                            </div>
                          )}
                          {!buscandoDiretores && sugestoesDiretores.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setDiretor(item.nome)
                                setDiretorConfirmado(item.nome)
                                setSugestoesDiretores([])
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: 'none',
                                borderBottom: '1px solid #2D2D44',
                                background: 'transparent',
                                color: '#F9FAFB',
                                cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 13,
                                textAlign: 'left'
                              }}
                            >
                              {item.nome}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {erro && (
                <p style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>{erro}</p>
              )}

              <button disabled={carregando} onClick={() => criarSala(generos, streamings)} style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: carregando ? 'wait' : 'pointer',
                opacity: carregando ? 0.7 : 1,
                fontFamily: 'Poppins, sans-serif'
              }}>
                {carregando ? 'Criando...' : 'Criar Sala'}
              </button>
            </motion.div>
          )}

          {tela === 'entrar' && (
            <motion.div key="entrar"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <button onClick={() => { setTela('inicio'); setErro('') }}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
                Voltar
              </button>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#eeeeee' }}>Entrar em sala</h2>

              <div>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Codigo da sala</p>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                  <input type="text" placeholder="Ex: XKTZ91"
                    value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
                    maxLength={8}
                    style={{ ...inputStyle, paddingLeft: 36, letterSpacing: '0.15em' }}
                    onFocus={e => e.target.style.borderColor = '#A855F7'}
                    onBlur={e => e.target.style.borderColor = '#2D2D44'}
                  />
                </div>
              </div>

              {erro && (
                <p style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>{erro}</p>
              )}

              <button onClick={entrarSala} style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Entrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
