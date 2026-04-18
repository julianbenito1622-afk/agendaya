'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Guardar datos del salón en localStorage
    const { data: salon } = await supabase
      .from('salones')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (salon) {
      localStorage.setItem('salon', JSON.stringify(salon))
    }

    router.push('/panel')
    setLoading(false)
  }

  return (
    <main style={{fontFamily: "'Georgia', serif", background: '#faf7f4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
      <div style={{background: 'white', border: '1px solid #ede8e3', borderRadius: '20px', padding: '40px 32px', width: '100%', maxWidth: '380px'}}>

        <h1 style={{fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px'}}>
          Agenda<span style={{color: '#f7426f'}}>Ya</span>
        </h1>
        <p style={{color: '#a89a8a', fontSize: '13px', margin: '0 0 32px', fontFamily: 'monospace'}}>INICIA SESIÓN</p>

        <div style={{marginBottom: '16px'}}>
          <label style={{color: '#7a6a5a', fontSize: '13px', display: 'block', marginBottom: '6px'}}>Correo electrónico</label>
          <input type="email" placeholder="tu@email.com"
            style={{width: '100%', border: '1px solid #ede8e3', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#faf7f4'}}
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>

        <div style={{marginBottom: '24px'}}>
          <label style={{color: '#7a6a5a', fontSize: '13px', display: 'block', marginBottom: '6px'}}>Contraseña</label>
          <input type="password" placeholder="••••••••"
            style={{width: '100%', border: '1px solid #ede8e3', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#faf7f4'}}
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
        </div>

        {error && <p style={{color: '#ef4444', fontSize: '13px', marginBottom: '16px'}}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          style={{width: '100%', background: '#f7426f', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'}}>
          {loading ? 'Entrando...' : 'Entrar →'}
        </button>

        <p style={{textAlign: 'center', color: '#a89a8a', fontSize: '13px', marginTop: '20px'}}>
          ¿No tienes cuenta?{' '}
          <a href="/registro" style={{color: '#f7426f', textDecoration: 'none', fontWeight: '600'}}>Regístrate gratis</a>
        </p>

      </div>
    </main>
  )
}