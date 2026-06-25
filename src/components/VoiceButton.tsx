interface VoiceButtonProps {
  isListening: boolean
  supported: boolean
  onClick: () => void
}

export function VoiceButton({ isListening, supported, onClick }: VoiceButtonProps) {
  if (!supported) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-mic${isListening ? ' active' : ''}`}
      style={{ padding: isListening ? '12px 24px' : '12px 20px', fontSize: '0.95rem' }}
      aria-label={isListening ? 'Stop' : 'Voice input'}
    >
      {isListening ? '● Listening…' : '🎤 Mic'}
    </button>
  )
}
