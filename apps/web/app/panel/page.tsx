'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Cita = {
  id: string
  cliente_telefono: string
  fecha: string
  hora: string
  estado: string
  servicios_salon: { nombre: string; precio: number }
}

export default function Panel() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [salon, setSalon] = useState<any>(null)
  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const salonData = localStorage.getItem('salon')
    if (!salonData) { window.location.href = '/login'; return }
    const s = JSON.parse(salonData)
    setSalon(s)

    async function cargarCitas() {
      const { data } = await supabase
        .from('citas')
        .select('*, servicios_salon(nombre, precio)')
        .eq('salon_id', s.id)
        .order('fecha', { ascending: true })
      if (data) setCitas(data)
      setLoading(false)
    }
    cargarCitas()
  }, [])

  const citasHoy = citas.filter(c => c.fecha === hoy)
  const citasFuturas = citas.filter(c => c.fecha > hoy)
  const totalHoy = citasHoy.reduce((sum, c) => sum + (c.servicios_salon?.precio || 0), 0)
  const pendientes = citasHoy.filter(c => c.estado === 'pendiente').length

  async function actualizarEstado(id: string, estado: string) {
    await supabase.from('citas').update({ estado }).eq('id', id)
    setCitas(citas.map(c => c.id === id ? {...c, estado} : c))
  }

  function cerrarSesion() {
    localStorage.removeItem('salon')
    window.location.href = '/login'
  }

  const estadoColor: Record<string, {bg: string, text: string}> = {
    pendiente:  { bg: '#FFF7ED', text: '#C2410C' },
    confirmada: { bg: '#F0FDF4', text: '#15803D' },
    cancelada:  { bg: '#FEF2F2', text: '#B91C1C' },
  }

  return (
    <div style={{fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F9FAFB', minHeight: '100vh'}}>

      <div style={{background: 'white', borderBottom: '1px solid #F3F4F6', padding: '0 24px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF4D6A, #FF6B84)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'}}>💅</div>
            <div>
              <p style={{fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0}}>{salon?.nombre || 'Mi Salón'}</p>
              <p style={{fontSize: '12px', color: '#9CA3AF', margin: 0, textTransform: 'capitalize'}}>{salon?.plan || 'free'}</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <a href="/panel/bot" style={{background: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', color: '#374151', cursor: 'pointer', textDecoration: 'none', fontWeight: '500'}}>
              ⚙️ Mi bot
            </a>
            <button onClick={cerrarSesion} style={{background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', color: '#6B7280', cursor: 'pointer'}}>
              Salir
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '900px', margin: '0 auto', padding: '24px'}}>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px'}}>
          <div style={{background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #F3F4F6'}}>
            <p style={{fontSize: '12px', color: '#9CA3AF', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Citas hoy</p>
            <p style={{fontSize: '32px', fontWeight: '700', color: '#111827', margin: 0}}>{citasHoy.length}</p>
          </div>
          <div style={{background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #F3F4F6'}}>
            <p style={{fontSize: '12px', color: '#9CA3AF', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Pendientes</p>
            <p style={{fontSize: '32px', fontWeight: '700', color: '#C2410C', margin: 0}}>{pendientes}</p>
          </div>
          <div style={{background: 'linear-gradient(135deg, #FF4D6A, #FF6B84)', borderRadius: '14px', padding: '20px'}}>
            <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Ingresos hoy</p>
            <p style={{fontSize: '32px', fontWeight: '700', color: 'white', margin: 0}}>S/{totalHoy}</p>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '60px', color: '#9CA3AF'}}>Cargando citas...</div>
        ) : (
          <>
            <div style={{marginBottom: '28px'}}>
              <p style={{fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px'}}>
                Hoy · {new Date().toLocaleDateString('es-PE', {weekday: 'long', day: 'numeric', month: 'long'})}
              </p>
              {citasHoy.length === 0 ? (
                <div style={{background: 'white', borderRadius: '14px', padding: '40px', textAlign: 'center', border: '1px solid #F3F4F6'}}>
                  <p style={{fontSize: '32px', marginBottom: '8px'}}>📅</p>
                  <p style={{color: '#9CA3AF', fontSize: '14px', margin: 0}}>Sin citas para hoy</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  {citasHoy.map(cita => (
                    <div key={cita.id} style={{background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                        <div style={{width: '44px', height: '44px', borderRadius: '12px', background: '#FFF1F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0}}>✂️</div>
                        <div>
                          <p style={{fontWeight: '600', fontSize: '14px', color: '#111827', margin: '0 0 2px'}}>
                            {cita.servicios_salon?.nombre || 'Servicio'}
                          </p>
                          <p style={{fontSize: '13px', color: '#9CA3AF', margin: 0, fontFamily: 'monospace'}}>
                            {cita.cliente_telefono}
                          </p>
                        </div>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{textAlign: 'right'}}>
                          <p style={{fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 2px', fontFamily: 'monospace'}}>{cita.hora?.slice(0,5)}</p>
                          <p style={{fontSize: '13px', color: '#FF4D6A', fontWeight: '600', margin: 0}}>S/{cita.servicios_salon?.precio}</p>
                        </div>
                        <span style={{
                          background: estadoColor[cita.estado]?.bg || '#F3F4F6',
                          color: estadoColor[cita.estado]?.text || '#6B7280',
                          padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap'
                        }}>{cita.estado}</span>
                        {cita.estado === 'pendiente' && (
                          <div style={{display: 'flex', gap: '6px'}}>
                            <button onClick={() => actualizarEstado(cita.id, 'confirmada')}
                              style={{background: '#DCFCE7', color: '#15803D', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}>
                              ✓
                            </button>
                            <button onClick={() => actualizarEstado(cita.id, 'cancelada')}
                              style={{background: '#FEE2E2', color: '#B91C1C', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}>
                              ✗
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {citasFuturas.length > 0 && (
              <div>
                <p style={{fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px'}}>
                  Próximas · {citasFuturas.length} cita{citasFuturas.length !== 1 ? 's' : ''}
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {citasFuturas.map(cita => (
                    <div key={cita.id} style={{background: 'white', borderRadius: '12px', padding: '14px 18px', border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{width: '38px', height: '38px', borderRadius: '10px', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'}}>✂️</div>
                        <div>
                          <p style={{fontWeight: '600', fontSize: '14px', color: '#111827', margin: '0 0 2px'}}>{cita.servicios_salon?.nombre}</p>
                          <p style={{fontSize: '12px', color: '#9CA3AF', margin: 0}}>{cita.cliente_telefono}</p>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 2px'}}>
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-PE', {day: 'numeric', month: 'short'})}
                        </p>
                        <p style={{fontSize: '12px', color: '#9CA3AF', margin: 0, fontFamily: 'monospace'}}>{cita.hora?.slice(0,5)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {citas.length === 0 && (
              <div style={{textAlign: 'center', padding: '80px 0'}}>
                <p style={{fontSize: '48px', marginBottom: '16px'}}>💅</p>
                <p style={{fontSize: '16px', color: '#374151', fontWeight: '600', marginBottom: '8px'}}>Sin citas por ahora</p>
                <p style={{fontSize: '14px', color: '#9CA3AF'}}>Las citas aparecerán aquí cuando alguien agende por WhatsApp</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}