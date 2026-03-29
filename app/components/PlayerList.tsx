import { motion } from 'framer-motion'
import { Users, Crown } from 'lucide-react'

type Player = { id: string }

export default function PlayerList({ players }: { players: Player[] }) {
  return (
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
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F0F0' }}>Jogador {i + 1}</span>
                  {i === 0 && <Crown size={12} color="#F59E0B" />}
                </div>
                <span style={{ fontSize: 11, color: '#34D399' }}>● Online</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}