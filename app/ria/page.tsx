'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Territory {
  id: string
  name: string
  purpose: string
  releaseCount: number
  x: number
  y: number
  pulse: number
}

export default function RiaPage() {
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Territory | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadTerritories = async () => {
      const { data: covens } = await supabase
        .from('covens')
        .select('id, name, purpose')
        .eq('status', 'active')

      if (!covens) { setLoading(false); return }

      const territoriesWithCounts = await Promise.all(
        covens.map(async (coven, index) => {
          const { count } = await supabase
            .from('releases')
            .select('*', { count: 'exact', head: true })
            .eq('coven_id', coven.id)
            .eq('payment_status', 'paid')

          const angle = (index / covens.length) * Math.PI * 2
          const radius = 180 + Math.random() * 80
          const centerX = window.innerWidth / 2
          const centerY = window.innerHeight / 2

          return {
            id: coven.id,
            name: coven.name,
            purpose: coven.purpose,
            releaseCount: count || 0,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            pulse: Math.random() * Math.PI * 2
          }
        })
      )

      setTerritories(territoriesWithCounts)
      setLoading(false)
    }

    loadTerritories()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || territories.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw worldriver connections
      territories.forEach(territory => {
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(territory.x, territory.y)
        const alpha = 0.03 + Math.sin(frame * 0.01 + territory.pulse) * 0.02
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Draw territories
      territories.forEach(territory => {
        const baseSize = 8 + territory.releaseCount * 4
        const pulse = Math.sin(frame * 0.02 + territory.pulse) * 3
        const size = baseSize + pulse

        // Outer glow
        const gradient = ctx.createRadialGradient(
          territory.x, territory.y, 0,
          territory.x, territory.y, size * 4
        )
        const glowAlpha = 0.04 + Math.sin(frame * 0.02 + territory.pulse) * 0.02
        gradient.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha + 0.06})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.beginPath()
        ctx.arc(territory.x, territory.y, size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(territory.x, territory.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`
        ctx.fill()

        // Name label
        ctx.font = '11px monospace'
        ctx.fillStyle = `rgba(255, 255, 255, 0.5)`
        ctx.textAlign = 'center'
        ctx.fillText(territory.name, territory.x, territory.y + size + 18)

        // Release count
        if (territory.releaseCount > 0) {
          ctx.font = '10px monospace'
          ctx.fillStyle = `rgba(255, 255, 255, 0.2)`
          ctx.fillText(
            `${territory.releaseCount} release${territory.releaseCount > 1 ? 's' : ''}`,
            territory.x,
            territory.y + size + 30
          )
        }
      })

      // Center point — worldriver origin
      const centerPulse = Math.sin(frame * 0.015) * 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, 2 + centerPulse, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.fill()

      frame++
      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animRef.current)
  }, [territories])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clicked = territories.find(t => {
      const dist = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2)
      return dist < 30
    })

    setSelected(clicked || null)
  }

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#555',
        fontFamily: 'monospace'
      }}>
        loading ria...
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'crosshair'
        }}
      />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        fontFamily: 'monospace',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '1rem',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '0.25rem'
        }}>
          Ria
        </h1>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)' }}>
          {territories.length} {territories.length === 1 ? 'territory' : 'territories'} active
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        fontFamily: 'monospace',
        zIndex: 10,
        display: 'flex',
        gap: '1.5rem'
      }}>
        <button
          onClick={() => router.push('/event-horizon')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }}
        >
          ← event horizon
        </button>
        <button
          onClick={() => router.push('/release')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }}
        >
          + release
        </button>
      </div>

      {/* Selected territory panel */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          width: '260px',
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid #1a1a1a',
          borderRadius: '4px',
          padding: '1.5rem',
          fontFamily: 'monospace',
          zIndex: 10
        }}>
          <p style={{
            fontSize: '0.7rem',
            color: '#333',
            marginBottom: '0.75rem',
            letterSpacing: '0.1em'
          }}>
            TERRITORY
          </p>
          <p style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
            {selected.name}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#444', marginBottom: '1rem' }}>
            {selected.purpose}
          </p>
          <p style={{ fontSize: '0.7rem', color: '#333' }}>
            {selected.releaseCount} {selected.releaseCount === 1 ? 'release' : 'releases'}
          </p>
          <button
            onClick={() => setSelected(null)}
            style={{
              marginTop: '1rem',
              background: 'none',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.75rem'
            }}
          >
            dismiss
          </button>
        </div>
      )}

      {territories.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontFamily: 'monospace'
        }}>
          <p style={{ color: '#222', fontSize: '0.875rem' }}>
            No territories yet.
          </p>
          <p style={{ color: '#1a1a1a', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Form a coven to begin.
          </p>
        </div>
      )}
    </main>
  )
}