'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Coven {
  id: string
  name: string
  purpose: string
  status: string
  created_at: string
}

export default function CovenPage() {
  const [covens, setCovens] = useState<Coven[]>([])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCovens = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      const { data } = await supabase
        .from('coven_members')
        .select('coven_id, covens(*)')
        .eq('user_id', user.id)

      if (data) {
        const userCovens = data
          .map((item: any) => item.covens)
          .filter(Boolean)
        setCovens(userCovens)
      }

      setPageLoading(false)
    }

    loadCovens()
  }, [])

  const handleCreateCoven = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    const { data: coven, error: covenError } = await supabase
      .from('covens')
      .insert({ name, purpose, created_by: user.id })
      .select()
      .single()

    if (covenError) {
      setError(covenError.message)
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase
      .from('coven_members')
      .insert({
        coven_id: coven.id,
        user_id: user.id,
        role: 'founder',
        invited_by: user.id
      })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    setCovens([...covens, coven])
    setCreating(false)
    setName('')
    setPurpose('')
    setLoading(false)
  }

  if (pageLoading) {
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
              Covens
            </h1>
            <p style={{ color: '#444', fontSize: '0.75rem' }}>
              YOUR EXECUTION UNITS
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.75rem'
            }}
          >
            + form a coven
          </button>
        </div>

        {creating && (
          <div style={{
            border: '1px solid #222',
            borderRadius: '4px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <p style={{ color: '#666', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              NEW COVEN
            </p>

            <input
              type="text"
              placeholder="Coven name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace'
              }}
            />

            <input
              type="text"
              placeholder="What is this coven building"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              style={{
                padding: '12px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace'
              }}
            />

            {error && (
              <p style={{ color: '#ff4444', fontSize: '0.875rem' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleCreateCoven}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                {loading ? 'forming...' : 'form coven'}
              </button>
              <button
                onClick={() => setCreating(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  color: '#666',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {covens.length === 0 && !creating && (
          <div style={{
            border: '1px solid #1a1a1a',
            borderRadius: '4px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#333', marginBottom: '0.5rem' }}>
              No covens yet.
            </p>
            <p style={{ color: '#222', fontSize: '0.875rem' }}>
              Form one or wait for an invitation.
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {covens.map(coven => (
            <div
              key={coven.id}
              style={{
                border: '1px solid #1a1a1a',
                borderRadius: '4px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <p style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {coven.name}
                </p>
                <p style={{ color: '#444', fontSize: '0.875rem' }}>
                  {coven.purpose}
                </p>
              </div>
              <p style={{
                fontSize: '0.7rem',
                color: coven.status === 'active' ? '#2a2a2a' : '#333',
                letterSpacing: '0.1em'
              }}>
                {coven.status?.toUpperCase()}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid #1a1a1a',
          paddingTop: '2rem'
        }}>
          <button
            onClick={() => router.push('/profile')}
            style={{
              background: 'none',
              border: 'none',
              color: '#444',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            ← back to profile
          </button>
        </div>

      </div>
    </main>
  )
}