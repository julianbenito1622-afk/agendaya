'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Registro() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono_bot: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMensaje('')

    if (!form.nombre || !form.email || !form.telefono_bot || !form.password) {
      setMensaje('Completa todos los campos')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) {
  console.log('Error auth:', JSON.stringify(authError))
  setMensaje('Error al crear cuenta: ' + authError.message)
      setLoading(false)
      return
    }

    // Guardar datos del salón
    const { error: salonError } = await supabase.from('salones').insert({
      id: authData.user?.id,
      nombre: form.nombre,
      email: form.email,
      telefono_bot: form.telefono_bot,
      plan: 'free',
      activo: true
    })

    if (salonError) {
  console.log('Error salon completo:', JSON.stringify(salonError))
  setMensaje('Error al guardar datos del salón: ' + salonError.message)
      setLoading(false)
      return
    }

    setExito(true)
    setLoading(false)
  }

  return (
    <main style={{fontFamily: "'Georgia', serif", background: '#faf7f4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
      <div style={{background: 'white', border: '1px solid #ede8e3', borderRadius: '20px', padding: '40px 32px', width: '100%', maxWidth: '380px'}}>

        <h1 style={{fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px'}}>
          Agenda<span style={{color: '#f7426f'}}>Ya</span>
        </h1>
        <p style={{color: '#a89a8a', fontSize: '13px', margin: '0 0 32px', fontFamily: 'monospace'}}>CREA TU CUENTA</p>

        {exito ? (
          <div style={{textAlign: 'center', padding: '32px 0'}}>
            <p style={{fontSize: '40px', margin: '0 0 16px'}}>✅</p>
            <p style={{fontWeight: '600', color: '#1a1a1a', fontSize: '18px', margin: '0 0 8px'}}>¡Bienvenida!</p>
            <p style={{color: '#a89a8a', fontSize: '14px', margin: '0 0 24px'}}>Revisa tu correo para confirmar tu cuenta.</p>
            <a href="/login" style={{display: 'block', background: '#f7426f', color: 'white', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600'}}>
              Ir al login →
            </a>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

            <div>
              <label style={{color: '#7a6a5a', fontSize: '13px', display: 'block', marginBottom: '6px'}}>Nombre del salón</label>
              <input
                type="text"
                placeholder="Salón Valentina"
                style={{width: '100%', border: '1px solid #ede8e3', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#faf7f4'}}
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
              />
            </div>

            <div>
              <label style={{color: '#7a6a5a', fontSize: '13px', display: 'block', marginBottom: '6px'}}>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                style={{width: '100%', border: '1px solid #ede8e3', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#faf7f4'}}
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>

            <div>
              <label style={{color: '#7a6a5a', fontSize: '13px', display: 'block', marginBottom: '6px'}}>Tu número de WhatsApp</label>
              <input
                type="text"
                placeholder="+51999999999"
                style={{width: '100%', border: '1px solid #ede8e3', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#faf7f4'}}
                value={form.telefono_bot}
                onChange={e => setForm({...form, telefono_bot: e.target.value})}
              />
            </div>

            <div>
              <label style={{color: '#7a6a5a', fontSize: '13px', display: 'block', marginBottom: '6px'}}>Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                style={{width: '100%', border: '1px solid #ede8e3', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#faf7f4'}}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            {mensaje && (
              <p style={{color: '#ef4444', fontSize: '13px', margin: 0}}>{mensaje}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{background: '#f7426f', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px'}}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
            </button>

            <p style={{textAlign: 'center', color: '#a89a8a', fontSize: '13px', margin: 0}}>
              ¿Ya tienes cuenta?{' '}
              <a href="/login" style={{color: '#f7426f', textDecoration: 'none', fontWeight: '600'}}>Inicia sesión</a>
            </p>

          </div>
        )}
      </div>
    </main>
  )
}