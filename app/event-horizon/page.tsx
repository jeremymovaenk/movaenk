'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Release {
  id: string
  title: string
  medium: string
  content_url: string
  published_at: string
  covens: { name: string }
  users: { name: string }
}

export default function EventHorizonPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadReleases = async () => {
      const { data } = await supabase
        .from('releases')
        .select('id, title, medium, content_url, published_at, covens(name), users(name)')
        .eq('payment_status', 'paid')
        .order('published_at', { ascending: false })

      if (data) setReleases(data as any)
      setLoading(false)
    }

    loadReleases()
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
        maxWidth: '680px',
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
            <h1 style={{ fontSize: '2rem', fontWeight: '400', marginBottom: '0.25rem' }}>
              Event Horizon
            </h1>
            <p style={{ color: '#444', fontSize: '0.75rem' }}>WHAT HAS BEEN MADE</p>
          </div>
          <button
            onClick={() => router.push('/release')}
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
            + new release
          </button>
        </div>

        {releases.length === 0 ? (
          <div style={{
            border: '1px solid #1a1a1a',
            borderRadius: '4px',
            padding: '4rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#333', marginBottom: '0.5rem' }}>Nothing released yet.</p>
            <p style={{ color: '#222', fontSize: '0.875rem' }}>The horizon is waiting.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {releases.map((release) => (
              <div
                key={release.id}
                style={{
                  padding: '2rem 0',
                  borderBottom: '1px solid #111',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '400', marginBottom: '0.35rem' }}>
                      {release.title}
                    </h2>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      {release.medium && (
                        <span style={{ fontSize: '0.7rem', color: '#444', letterSpacing: '0.1em' }}>
                          {release.medium.toUpperCase()}
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: '#333' }}>
                        {(release.covens as any)?.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#2a2a2a' }}>
                        {(release.users as any)?.name}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#2a2a2a', paddingLeft: '2rem' }}>
                    {new Date(release.published_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          borderTop: '1px solid #1a1a1a',
          paddingTop: '2rem',
          display: 'flex',
          gap: '1rem'
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
            ← profile
          </button>
          <button
            onClick={() => router.push('/ria')}
            style={{
              background: 'none',
              border: 'none',
              color: '#444',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            ria →
          </button>
        </div>

      </div>
    </main>
  )
}