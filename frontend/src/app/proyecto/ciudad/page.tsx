'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CiudadRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/proyecto/ubicacion') }, [router])
  return null
}
