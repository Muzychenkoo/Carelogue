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
      aria-label={isListening ? 'Stop' : 'Voice input'}
    >
      {isListening ? 'Stop' : 'Mic'}
    </button>
  )
}
