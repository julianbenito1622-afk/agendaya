'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Salon = {
  id: string
  nombre: string
  email: string
  telefono_bot: string
  plan: string
  citas_mes: number
  activo: boolean
  created_at: string
}

export default function Admin() {
  const [salones, setSalones] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [autenticado, setAutenticado] = useState(false)

  const ADMIN_PASSWORD = 'r00t2026'

  useEffect(() => {
    if (!autenticado) return
    async function cargar() {
      const { data } = await supabase
        .from('salones')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setSalones(data)
      setLoading(false)
    }
    cargar()
  }, [autenticado])

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('salones').update({ activo: !activo }).eq('id', id)
    setSalones(salones.map(s => s.id === id ? {...s, activo: !activo} : s))
  }

  const totalActivos = salones.filter(s => s.activo).length
  const ingresoEstimado = salones.filter(s => s.activo && s.plan !== 'free').length * 69

  if (!autenticado) {
    return (
      <main style={{fontFamily: "'Georgia', serif", background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
        <div style={{background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '40px 32px', width: '100%', maxWidth: '320px', textAlign: 'center'}}>
          <p style={{color: '#f7426f', fontSize: '12px', letterSpacing: '2px', fontFamily: 'monospace', margin: '0 0 16px'}}>ADMIN</p>
          <h2 style={{color: 'white', fontSize: '24px', margin: '0 0 32px'}}>AgendaYa</h2>
          <input
            type="password"
            placeholder="Contraseña"
            style={{width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box', marginBottom: '16px'}}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && password === ADMIN_PASSWORD && setAutenticado(true)}
          />
          <button
            onClick={() => password === ADMIN_PASSWORD ? setAutenticado(true) : alert('Contraseña incorrecta')}
            style={{width: '100%', background: '#f7426f', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}
          >
            Entrar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{fontFamily: "'Georgia', serif", background: '#0a0a0a', minHeight: '100vh', color: 'white'}}>

      {/* Header */}
      <div style={{padding: '24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 style={{fontSize: '20px', fontWeight: '700', margin: 0}}>
            Agenda<span style={{color: '#f7426f'}}>Ya</span>
          </h1>
          <p style={{color: '#555', fontSize: '11px', margin: '2px 0 0', fontFamily: 'monospace'}}>PANEL ADMIN</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <div style={{background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '10px 16px', textAlign: 'center'}}>
            <p style={{color: '#555', fontSize: '10px', margin: 0, fontFamily: 'monospace'}}>ACTIVOS</p>
            <p style={{color: 'white', fontSize: '20px', fontWeight: '700', margin: 0}}>{totalActivos}</p>
          </div>
          <div style={{background: '#111', border: '1px solid #f7426f', borderRadius: '10px', padding: '10px 16px', textAlign: 'center'}}>
            <p style={{color: '#f7426f', fontSize: '10px', margin: 0, fontFamily: 'monospace'}}>INGRESO EST.</p>
            <p style={{color: 'white', fontSize: '20px', fontWeight: '700', margin: 0}}>S/{ingresoEstimado}</p>
          </div>
        </div>
      </div>

      {/* Lista de salones */}
      <div style={{padding: '24px', maxWidth: '800px', margin: '0 auto'}}>
        <p style={{color: '#555', fontSize: '11px', letterSpacing: '2px', marginBottom: '16px', fontFamily: 'monospace'}}>
          SALONES REGISTRADOS — {salones.length}
        </p>

        {loading ? (
          <p style={{color: '#555', textAlign: 'center', marginTop: '40px'}}>Cargando...</p>
        ) : salones.length === 0 ? (
          <p style={{color: '#555', textAlign: 'center', marginTop: '40px'}}>Sin salones registrados</p>
        ) : (
          salones.map(salon => (
            <div key={salon.id} style={{background: '#111', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '18px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <p style={{fontWeight: '600', fontSize: '15px', color: 'white', margin: '0 0 4px'}}>{salon.nombre}</p>
                <p style={{color: '#555', fontSize: '12px', margin: '0 0 4px', fontFamily: 'monospace'}}>{salon.email}</p>
                <p style={{color: '#555', fontSize: '12px', margin: 0, fontFamily: 'monospace'}}>{salon.telefono_bot}</p>
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
                <span style={{
                  background: salon.plan === 'free' ? '#222' : '#f7426f',
                  color: salon.plan === 'free' ? '#666' : 'white',
                  fontSize: '10px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}>
                  {salon.plan.toUpperCase()}
                </span>
                <button
                  onClick={() => toggleActivo(salon.id, salon.activo)}
                  style={{
                    background: salon.activo ? '#10b98120' : '#ef444420',
                    color: salon.activo ? '#10b981' : '#ef4444',
                    border: `1px solid ${salon.activo ? '#10b981' : '#ef4444'}`,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  {salon.activo ? 'ACTIVO' : 'INACTIVO'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}