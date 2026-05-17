'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  purpose: string
  medium: string
  direction: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        router.push('/onboarding')
        return
      }

      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [])

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
        loading...
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '4rem 2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem'
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '400',
              marginBottom: '0.25rem'
            }}>
              {profile?.name}
            </h1>
            <p style={{ color: '#444', fontSize: '0.75rem' }}>
              MOVAENK
            </p>
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              background: 'none',
              border: '1px solid #222',
              color: '#666',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.75rem'
            }}
          >
            update purpose
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>

          <div>
            <p style={{
              fontSize: '0.7rem',
              color: '#444',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              PURPOSE
            </p>
            <p style={{ fontSize: '1.125rem', color: '#fff' }}>
              {profile?.purpose}
            </p>
          </div>

          <div>
            <p style={{
              fontSize: '0.7rem',
              color: '#444',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              MEDIUM
            </p>
            <p style={{ fontSize: '1.125rem', color: '#fff' }}>
              {profile?.medium}
            </p>
          </div>

          <div>
            <p style={{
              fontSize: '0.7rem',
              color: '#444',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              COLLABORATING WITH
            </p>
            <p style={{ fontSize: '1.125rem', color: '#fff' }}>
              {profile?.direction}
            </p>
          </div>

        </div>

        <div style={{
          borderTop: '1px solid #1a1a1a',
          paddingTop: '2rem',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => router.push('/coven')}
            style={{
              flex: 1,
              padding: '12px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            enter a coven
          </button>

          <button
            onClick={() => router.push('/event-horizon')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              color: '#fff',
              border: '1px solid #222',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            event horizon
          </button>
        </div>

      </div>
    </main>
  )
}