'use client'

import { useEffect, useRef } from 'react'

interface Square {
  x: number
  y: number
  vx: number
  vy: number
  size: number        // half-side length
  rotation: number    // radians
  vr: number          // rotation speed
  opacity: number
  phase: number       // for opacity pulse
}

export default function SquareField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const COUNT = 38
    let W = 0, H = 0
    const squares: Square[] = []

    function resize() {
      W = canvas!.width  = canvas!.offsetWidth
      H = canvas!.height = canvas!.offsetHeight
    }

    function spawn() {
      squares.length = 0
      for (let i = 0; i < COUNT; i++) {
        const size = 4 + Math.random() * 10        // half-side: 4–14px → full side 8–28px
        squares.push({
          x:        Math.random() * W,
          y:        Math.random() * H,
          vx:       (Math.random() - 0.5) * 0.28,
          vy:       (Math.random() - 0.5) * 0.28,
          size,
          rotation: Math.random() * Math.PI * 2,
          vr:       (Math.random() - 0.5) * 0.006, // very slow spin
          opacity:  0.06 + Math.random() * 0.14,   // subtle: 6–20% opacity
          phase:    Math.random() * Math.PI * 2,
        })
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H)

      for (const s of squares) {
        // Move
        s.x += s.vx
        s.y += s.vy
        s.rotation += s.vr

        // Wrap
        const pad = s.size * 2
        if (s.x < -pad)   s.x = W + pad
        if (s.x > W + pad) s.x = -pad
        if (s.y < -pad)   s.y = H + pad
        if (s.y > H + pad) s.y = -pad

        // Pulse opacity slowly
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.0008 + s.phase)

        ctx!.save()
        ctx!.globalAlpha = s.opacity * pulse
        ctx!.translate(s.x, s.y)
        ctx!.rotate(s.rotation)

        // Filled square (navy blue)
        ctx!.fillStyle = '#1e3a5f'
        ctx!.fillRect(-s.size, -s.size, s.size * 2, s.size * 2)

        // Thin border for definition
        ctx!.strokeStyle = '#3b82f6'
        ctx!.lineWidth = 0.6
        ctx!.strokeRect(-s.size, -s.size, s.size * 2, s.size * 2)

        ctx!.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    spawn()
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => { resize(); spawn() })
    ro.observe(canvas)

    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}
