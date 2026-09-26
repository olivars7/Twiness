'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import ChatMessage from './ChatMessage'
import { useChat } from '@/hooks/useChat'

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  // Listen for quick-prompt events dispatched from AgentePage
  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail
      if (prompt) {
        sendMessage(prompt)
      }
    }
    window.addEventListener('viabl:quick-prompt', handler)
    return () => window.removeEventListener('viabl:quick-prompt', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        height: 520,
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-card-hover)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#7c3aed18', border: '1px solid #7c3aed30' }}
        >
          <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>AI</span>
        </div>
        <div>
          <p className="font-semibold text-xs" style={{ color: 'var(--color-text)' }}>Asesor Twiness</p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>watsonx.ai · contextualizado</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>En línea</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--color-card)' }}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#7c3aed10', border: '1px solid #7c3aed20' }}
            >
              <span className="text-xl font-bold" style={{ color: '#a78bfa' }}>AI</span>
            </div>
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)', maxWidth: 200 }}>
              Haz una pregunta sobre tu negocio o usa las sugerencias de arriba
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex gap-1 px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#a78bfa', animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#a78bfa', animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#a78bfa', animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-2 shrink-0"
        style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-card-hover)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Pregunta sobre tu negocio..."
          className="flex-1 text-sm rounded-xl px-3 py-2 outline-none transition-colors"
          style={{
            background: 'var(--color-input)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60' }}
          onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors shrink-0"
          style={(!isLoading && input.trim())
            ? { background: '#7c3aed', color: '#fff', border: '1px solid #6d28d9' }
            : { background: 'var(--color-input)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', opacity: 0.5, cursor: 'not-allowed' }
          }
        >
          <Send size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
