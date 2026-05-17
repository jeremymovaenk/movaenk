'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [medium, setMedium] = useState('')
  const [collaborating, setCollaborating] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name,
      purpose,
      medium,
      direction: collaborating,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/profile')
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '2rem'
    }}>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>

        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '400',
            marginBottom: '0.5rem'
          }}>
            Who are you collaborating with?
          </h1>
          <p style={{ color: '#555', fontSize: '0.875rem' }}>
            Define your position before you enter.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              YOUR NAME
            </label>
            <input
              type="text"
              placeholder="What do they call you"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              YOUR PURPOSE
            </label>
            <input
              type="text"
              placeholder="What are you currently building"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              YOUR MEDIUM
            </label>
            <input
              type="text"
              placeholder="How do you create"
              value={medium}
              onChange={e => setMedium(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              COLLABORATING WITH
            </label>
            <input
              type="text"
              placeholder="Names, a Coven, or no one yet"
              value={collaborating}
              onChange={e => setCollaborating(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

        </div>

        {error && (
          <p style={{ color: '#ff4444', fontSize: '0.875rem' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '14px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}
        >
          {loading ? 'Entering...' : 'Enter Movaenk'}
        </button>

      </div>
    </main>
  )
}