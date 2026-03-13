const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// ── CRIAR SALA ──
export async function criarSala(generos: number[], streamings: number[]) {
  const res = await fetch(`${API_URL}/sala`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ generos, streamings })
  })

  if (!res.ok) throw new Error('Erro ao criar sala')

  const data = await res.json()
  return data as { salaId: string }
}

// ── BUSCAR DADOS DA SALA ──
export async function buscarSala(salaId: string) {
  const res = await fetch(`${API_URL}/sala/${salaId}`)

  if (!res.ok) throw new Error('Sala não encontrada')

  const data = await res.json()
  return data
}

// ── ENTRAR NA SALA ──
export async function entrarSala(salaId: string) {
  const res = await fetch(`${API_URL}/sala/${salaId}/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) throw new Error('Erro ao entrar na sala')

  const data = await res.json()
  return data as { userId: string, token: string }
}

// ── BUSCAR FILMES ──
export async function buscarFilmes(genero: string, streaming: string) {
  const res = await fetch(`${API_URL}/discover?genero=${genero}&streaming=${streaming}`)

  if (!res.ok) throw new Error('Erro ao buscar filmes')

  const data = await res.json()
  return data
}

// ── BUSCAR FILMES DA SALA ──
export async function buscarFilmesDaSala(salaId: string) {
  const res = await fetch(`${API_URL}/sala/${salaId}/filmes`)

  if (!res.ok) throw new Error('Erro ao buscar filmes')

  const data = await res.json()
  return data
}