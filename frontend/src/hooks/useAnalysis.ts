import { useState, useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { api } from '@/lib/api'
import type { AnalysisResult } from '@/types/analysis'

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const project = useProjectStore((s) => s.project)

  const runLocationAnalysis = useCallback(async () => {
    if (!project?.location) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.post<AnalysisResult>('/analysis/location', {
        lat: project.location.lat,
        lng: project.location.lng,
        businessType: project.businessType,
        radiusMeters: 500,
      })
      return result
    } catch (e) {
      setError('Error al obtener análisis de ubicación')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [project])

  const runCompetitionAnalysis = useCallback(async () => {
    if (!project?.location) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.post<AnalysisResult>('/analysis/competition', {
        lat: project.location.lat,
        lng: project.location.lng,
        businessType: project.businessType,
      })
      return result
    } catch (e) {
      setError('Error al obtener análisis de competencia')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [project])

  return { runLocationAnalysis, runCompetitionAnalysis, isLoading, error }
}
