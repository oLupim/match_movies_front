export default function LoadingSpinner({ texto }: { texto?: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #2D2D44', borderTop: '3px solid #A855F7',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#9CA3AF', fontSize: 14 }}>{texto || 'Carregando...'}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}