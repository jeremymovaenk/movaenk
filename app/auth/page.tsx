'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async () => {
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/onboarding')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/onboarding')
    }

    setLoading(false)
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
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Movaenk</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {isSignUp ? 'Begin your purpose.' : 'Return to your work.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            padding: '12px',
            background: '#111',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '1rem'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            padding: '12px',
            background: '#111',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '1rem'
          }}
        />

        {error && <p style={{ color: '#ff4444', fontSize: '0.875rem' }}>{error}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            padding: '12px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'New here? Sign Up'}
        </button>
      </div>
    </main>
  )
}