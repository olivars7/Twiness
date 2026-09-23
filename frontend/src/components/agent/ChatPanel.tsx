'use client'

import { useState } from 'react'
import ChatMessage from './ChatMessage'
import { useChat } from '@/hooks/useChat'

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading } = useChat()

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <div>
          <p className="font-semibold text-white text-sm">Asesor IA</p>
          <p className="text-xs text-gray-500">Impulsado por watsonx.ai</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isLoading && (
          <div className="flex gap-1 px-3 py-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregunta sobre tu negocio..."
          className="flex-1 text-sm border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 disabled:opacity-40 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
