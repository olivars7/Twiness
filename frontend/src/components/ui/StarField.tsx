'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  phase: number   // for twinkle
}

export default function StarField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const PARTICLE_COUNT = 55
    const GRID_SIZE = 40
    let W = 0, H = 0
    const particles: Particle[] = []

    function resize() {
      W = canvas!.width  = canvas!.offsetWidth
      H = canvas!.height = canvas!.offsetHeight
    }

    function spawnParticles() {
      particles.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x:       Math.random() * W,
          y:       Math.random() * H,
          vx:      (Math.random() - 0.5) * 0.35,
          vy:      (Math.random() - 0.5) * 0.35,
          size:    3 + Math.random() * 5,
          opacity: 0.3 + Math.random() * 0.5,
          phase:   Math.random() * Math.PI * 2,
        })
      }
    }

    function drawStar(cx: number, cy: number, r: number) {
      ctx!.beginPath()
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const innerA = outerA + (2 * Math.PI) / 10
        if (i === 0) ctx!.moveTo(cx + r * Math.cos(outerA), cy + r * Math.sin(outerA))
        else         ctx!.lineTo(cx + r * Math.cos(outerA), cy + r * Math.sin(outerA))
        ctx!.lineTo(cx + (r * 0.4) * Math.cos(innerA), cy + (r * 0.4) * Math.sin(innerA))
      }
      ctx!.closePath()
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H)

      // ── grid ──────────────────────────────────────────────────────
      ctx!.strokeStyle = 'rgba(59,130,246,0.07)'
      ctx!.lineWidth = 1
      for (let x = 0; x < W; x += GRID_SIZE) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke()
      }
      for (let y = 0; y < H; y += GRID_SIZE) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke()
      }

      // ── particles ─────────────────────────────────────────────────
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        const twinkle = 0.6 + 0.4 * Math.sin(t * 0.0012 + p.phase)
        ctx!.save()
        ctx!.globalAlpha = p.opacity * twinkle
        ctx!.fillStyle = '#3b82f6'
        drawStar(p.x, p.y, p.size)
        ctx!.fill()
        ctx!.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    spawnParticles()
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => { resize(); spawnParticles() })
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
