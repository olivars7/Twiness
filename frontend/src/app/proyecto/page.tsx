'use client'

export default function ProyectoHubPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Mi Proyecto</h1>
      {/* Hub con los módulos disponibles según datos capturados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Módulos se renderizan aquí */}
      </div>
    </main>
  )
}
