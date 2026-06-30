import React from 'react'

type Props = {
  onClick?: () => void
  children: React.ReactNode
  variante?: 'primario' | 'secundario' | 'ghost'
  larguraTotal?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}

export default function Button({
  onClick,
  children,
  variante = 'primario',
  larguraTotal = false,
  disabled = false,
  style,
}: Props) {
  const estilos: Record<string, React.CSSProperties> = {
    primario: {
      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
      border: 'none',
      color: '#fff',
      justifyContent: 'center',
    },
    secundario: {
      background: '#1E1E2E',
      border: '1px solid #2D2D44',
      color: '#E5E7EB',
      justifyContent: 'center',
    },
    ghost: {
      background: 'none',
      border: 'none',
      color: '#9CA3AF',
      justifyContent: 'flex-start',
      padding: '8px 0',
      fontSize: 14,
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...estilos[variante],
        width: larguraTotal ? '100%' : 'auto',
        padding: estilos[variante].padding ?? '16px',
        borderRadius: 16,
        fontWeight: 700,
        fontSize: estilos[variante].fontSize ?? 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Poppins, sans-serif',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  )
}