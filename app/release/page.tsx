'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Coven {
  id: string
  name: string
}

export default function ReleasePage() {
  const [covens, setCovens] = useState<Coven[]>([])
  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [selectedCoven, setSelectedCoven] = useState('')
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
        .select('coven_id, covens(id, name)')
        .eq('user_id', user.id)

      if (data) {
        const userCovens = data
          .map((item: any) => item.covens)
          .filter(Boolean)
        setCovens(userCovens)
        if (userCovens.length > 0) {
          setSelectedCoven(userCovens[0].id)
        }
      }

      setPageLoading(false)
    }

    loadCovens()
  }, [])

  const handleSubmit = async () => {
    if (!title || !selectedCoven) {
      setError('A title and coven are required.')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    const { error } = await supabase
      .from('releases')
      .insert({
        title,
        medium,
        content_url: contentUrl,
        coven_id: selectedCoven,
        created_by: user.id,
        payment_status: 'paid',
        published_at: new Date().toISOString()
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/event-horizon')
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

        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '400',
            marginBottom: '0.25rem'
          }}>
            New Release
          </h1>
          <p style={{ color: '#444', fontSize: '0.75rem' }}>
            WHAT HAS BEEN MADE
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>

          <div>
            <label style={{
              fontSize: '0.7rem',
              color: '#666',
              display: 'block',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              TITLE
            </label>
            <input
              type="text"
              placeholder="Name this release"
              value={title}
              onChange={e => setTitle(e.target.value)}
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
            <label style={{
              fontSize: '0.7rem',
              color: '#666',
              display: 'block',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              MEDIUM
            </label>
            <input
              type="text"
              placeholder="Music, film, design, code..."
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
            <label style={{
              fontSize: '0.7rem',
              color: '#666',
              display: 'block',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              LINK
            </label>
            <input
              type="text"
              placeholder="URL to the work"
              value={contentUrl}
              onChange={e => setContentUrl(e.target.value)}
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
            <label style={{
              fontSize: '0.7rem',
              color: '#666',
              display: 'block',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              COVEN
            </label>
            {covens.length === 0 ? (
              <p style={{ color: '#444', fontSize: '0.875rem' }}>
                You need to be in a coven before releasing.{' '}
                <span
                  onClick={() => router.push('/coven')}
                  style={{ color: '#fff', cursor: 'pointer' }}
                >
                  Form one.
                </span>
              </p>
            ) : (
              <select
                value={selectedCoven}
                onChange={e => setSelectedCoven(e.target.value)}
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
              >
                {covens.map(coven => (
                  <option key={coven.id} value={coven.id}>
                    {coven.name}
                  </option>
                ))}
              </select>
            )}
          </div>

        </div>

        {error && (
          <p style={{ color: '#ff4444', fontSize: '0.875rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={handleSubmit}
            disabled={loading || covens.length === 0}
            style={{
              padding: '14px',
              background: covens.length === 0 ? '#1a1a1a' : '#fff',
              color: covens.length === 0 ? '#333' : '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: covens.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            {loading ? 'releasing...' : 'release into event horizon'}
          </button>

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