'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SendMessage({ params }: { params: { username: string } }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || sending) return

    setSending(true)
    const { error } = await supabase.from('messages').insert({
      recipient_username: params.username.toLowerCase(),
      content: content.trim(),
      game_mode: 'anonymous',
    })

    setSending(false)
    if (!error) {
      setContent('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Send an anonymous message
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>
          to <span style={{ fontWeight: '700', color: '#A78BFA' }}>@{params.username}</span>
        </p>

        <form onSubmit={handleSend}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            maxLength={500}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>
            {content.length}/500
          </div>

          <button
            type="submit"
            disabled={!content.trim() || sending}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#fff',
              background: '#A78BFA',
              border: 'none',
              borderRadius: '12px',
              cursor: content.trim() && !sending ? 'pointer' : 'not-allowed',
              opacity: content.trim() && !sending ? 1 : 0.5
            }}
          >
            {sending ? 'Sending...' : sent ? 'Sent! ✓' : 'Send anonymously'}
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
          Your identity is not stored. Only the message is sent.
        </p>
      </div>
    </div>
  )
}
