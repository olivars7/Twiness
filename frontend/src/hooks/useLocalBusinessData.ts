'use client'

/**
 * useLocalBusinessData
 *
 * Hook aislado para leer y persistir datos del negocio en localStorage.
 * - Solo se usa en la subpágina "Mis Datos".
 * - No toca el store global de onboarding ni ninguna otra subpágina.
 * - Toda interacción con localStorage está envuelta en try/catch para
 *   sobrevivir modo privado, cuotas llenas, SSR, o JSON malformado.
 * - El estado interno es el único source-of-truth mientras la página
 *   está montada; se sincroniza con localStorage en cada escritura.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { OnboardingData } from '@/store/onboardingStore'

// ─── Constante de clave ───────────────────────────────────────────────────────
const STORAGE_KEY = 'viabl_business_data_v1'

// ─── Tipo exportado ───────────────────────────────────────────────────────────
export type LocalBusinessData = Partial<OnboardingData>

// ─── Helpers de storage (100% error-safe) ────────────────────────────────────

function readFromStorage(): LocalBusinessData {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // Asegura que sea un objeto plano, no un array ni un primitivo
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return parsed as LocalBusinessData
  } catch {
    return {}
  }
}

function writeToStorage(data: LocalBusinessData): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage lleno o modo privado: falla silenciosamente
  }
}

function removeFromStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

interface UseLocalBusinessDataReturn {
  /** Datos actuales (puede ser parcial) */
  data: LocalBusinessData
  /** Indica si la lectura inicial de localStorage ya terminó */
  hydrated: boolean
  /** Actualiza un campo y persiste en localStorage */
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  /** Reemplaza todo el objeto de datos y persiste */
  setData: (data: LocalBusinessData) => void
  /** Borra todos los datos del localStorage y resetea el estado */
  clearData: () => void
  /** Importa datos desde otra fuente (p.ej. el store de onboarding) sin machacar si ya hay datos locales */
  mergeData: (incoming: LocalBusinessData, overwrite?: boolean) => void
  /** Indica si localStorage está disponible en este entorno */
  storageAvailable: boolean
}

export function useLocalBusinessData(): UseLocalBusinessDataReturn {
  const [data, setDataState] = useState<LocalBusinessData>({})
  const [hydrated, setHydrated] = useState(false)
  const storageAvailable = useRef(false)

  // ── Detectar disponibilidad de localStorage (una vez) ──────────────────────
  useEffect(() => {
    try {
      const probe = '__viabl_probe__'
      window.localStorage.setItem(probe, '1')
      window.localStorage.removeItem(probe)
      storageAvailable.current = true
    } catch {
      storageAvailable.current = false
    }
  }, [])

  // ── Hidratación inicial — leer localStorage después del primer render ───────
  useEffect(() => {
    const stored = readFromStorage()
    setDataState(stored)
    setHydrated(true)
  }, [])

  // ── setField ────────────────────────────────────────────────────────────────
  const setField = useCallback(<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) => {
    setDataState(prev => {
      const next = { ...prev, [key]: value }
      writeToStorage(next)
      return next
    })
  }, [])

  // ── setData ─────────────────────────────────────────────────────────────────
  const setData = useCallback((incoming: LocalBusinessData) => {
    setDataState(incoming)
    writeToStorage(incoming)
  }, [])

  // ── clearData ───────────────────────────────────────────────────────────────
  const clearData = useCallback(() => {
    setDataState({})
    removeFromStorage()
  }, [])

  // ── mergeData ───────────────────────────────────────────────────────────────
  const mergeData = useCallback((incoming: LocalBusinessData, overwrite = false) => {
    setDataState(prev => {
      // overwrite=false → incoming llena solo los campos vacíos/undefined
      const next: LocalBusinessData = overwrite
        ? { ...prev, ...incoming }
        : { ...incoming, ...prev }
      writeToStorage(next)
      return next
    })
  }, [])

  return {
    data,
    hydrated,
    setField,
    setData,
    clearData,
    mergeData,
    storageAvailable: storageAvailable.current,
  }
}
