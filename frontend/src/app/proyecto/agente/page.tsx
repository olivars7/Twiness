'use client'

import ChatPanel from '@/components/agent/ChatPanel'

export default function AgentePage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Agente IA</h1>
      <ChatPanel />
    </main>
  )
}
