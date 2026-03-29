import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

type Props = {
  salaId: string
  link: string
}

export default function SalaCode({ salaId, link }: Props) {
  const [copiouCodigo, setCopiouCodigo] = useState(false)
  const [copiouLink, setCopiouLink] = useState(false)

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

  return (
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
  )
}