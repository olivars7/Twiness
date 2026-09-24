'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
interface InfoTooltipProps {
  text: string
  /** 'light' (default) sobre fondo claro · 'dark' sobre dark-box */
  variant?: 'light' | 'dark'
}

export default function InfoTooltip({ text, variant = 'light' }: InfoTooltipProps) {
  const btnRef  = useRef<HTMLButtonElement>(null)
  const [show, setShow]     = useState(false)
  const [pos,  setPos]      = useState({ top: 0, left: 0 })
  const [ready, setReady]   = useState(false)          // SSR guard

  useEffect(() => { setReady(true) }, [])

  function open() {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({
      top:  r.top,                    // borde SUPERIOR del botón, en coords de viewport
      left: r.left + r.width / 2,    // centro horizontal
    })
    setShow(true)
  }

  const isDark = variant === 'dark'

  const btn = (
    <button
      ref={btnRef}
      type="button"
      onMouseEnter={open}
      onMouseLeave={() => setShow(false)}
      aria-label="Más información"
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold shrink-0 cursor-default select-none"
      style={isDark
        ? { background: '#2a2a2e', color: '#52525b' }
        : { background: 'var(--color-border)', color: 'var(--color-text-muted)' }
      }
    >
      i
    </button>
  )

  if (!ready) return btn          // no portal durante SSR

  const popover = show && createPortal(
    <div
      role="tooltip"
      className="w-64 rounded-xl px-3 py-2.5 text-xs leading-relaxed shadow-2xl pointer-events-none select-none"
      style={{
        position:  'fixed',
        top:       pos.top,
        left:      pos.left,
        transform: 'translate(-50%, calc(-100% - 6px))',
        zIndex:    99999,
        background: '#111113',
        border:    '1px solid #27272a',
        color:     '#d4d4d8',
      }}
    >
      {text}
      <span
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft:  '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop:   '5px solid #27272a',
        }}
      />
    </div>,
    document.body,
  )

  return (
    <span className="inline-flex items-center shrink-0">
      {btn}
      {popover}
    </span>
  )
}
