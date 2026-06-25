interface VoiceButtonProps {
  isListening: boolean
  supported: boolean
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function VoiceButton({ isListening, supported, onClick, size = 'md', label }: VoiceButtonProps) {
  if (!supported) return null

  const sizes = {
    sm: 'w-9 h-9 text-base',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      className={`
        relative flex items-center justify-center rounded-full transition-all
        ${sizes[size]}
        ${isListening
          ? 'bg-coral text-white shadow-lg shadow-coral/30'
          : 'bg-warm text-navy hover:bg-coral/20 active:scale-95'
        }
      `}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-coral animate-pulse-ring" />
      )}
      <span className="relative">{isListening ? '⏹' : '🎤'}</span>
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}
