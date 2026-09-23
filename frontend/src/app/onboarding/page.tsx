'use client'

import ModeSelector from '@/components/onboarding/ModeSelector'
import StepCard from '@/components/onboarding/StepCard'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <ModeSelector />
      <StepCard />
    </main>
  )
}
