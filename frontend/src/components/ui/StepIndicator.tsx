interface StepIndicatorProps {
  totalSteps: number
  currentStep: number
  labels?: string[]
}

export default function StepIndicator({ totalSteps, currentStep, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
              ${i < currentStep ? 'bg-green-500 text-white' : ''}
              ${i === currentStep ? 'bg-blue-600 text-white ring-2 ring-blue-300' : ''}
              ${i > currentStep ? 'bg-gray-200 text-gray-500' : ''}
            `}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
          {labels?.[i] && (
            <span className={`text-xs hidden sm:block ${i === currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {labels[i]}
            </span>
          )}
          {i < totalSteps - 1 && (
            <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
