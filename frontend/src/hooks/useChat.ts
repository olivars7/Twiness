import { useState, useCallback } from 'react'
import type { ChatMessageData } from '@/components/agent/ChatMessage'
import { api } from '@/lib/api'
import { useProjectStore } from '@/store/projectStore'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asesor de negocios impulsado por watsonx. ¿En qué puedo ayudarte con tu proyecto?',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const projectId = useProjectStore((s) => s.project?.id)

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessageData = { role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await api.post<{ reply: string }>('/agent/chat', {
        message: content,
        projectId,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, ocurrió un error al procesar tu mensaje. Intenta de nuevo.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  return { messages, sendMessage, isLoading }
}
