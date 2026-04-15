export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">

      {/* Logo / Nombre */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-pink-500">AgendaYa</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Tu asistente de citas por WhatsApp
        </p>
      </div>

      {/* Propuesta de valor */}
      <div className="max-w-sm text-center mb-10">
        <p className="text-gray-700 text-base leading-relaxed">
          Automatiza las citas de tu salón. Tu clienta agenda por WhatsApp, 
          tú recibes la cita lista. Sin llamadas, sin olvidos.
        </p>
      </div>

      {/* Botón CTA */}
      <button className="bg-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-md">
        Quiero probarlo gratis
      </button>

      {/* Precio */}
      <p className="text-gray-400 text-sm mt-4">
        14 días gratis · Sin tarjeta · Cancela cuando quieras
      </p>

      {/* Sección Problema */}
      <div className="mt-20 max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ¿Te suena familiar?
        </h2>
        <div className="flex flex-col gap-4">
          {[
            "📱 Respondes WhatsApp mientras atiendes clientas",
            "😓 Clientas que agendan y no llegan",
            "📋 No sabes cuánto ganaste esta semana",
            "🌙 Pierdes citas en la noche cuando no estás",
          ].map((item, i) => (
            <div key={i} className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-3 text-gray-700 text-sm text-left">
              {item}
            </div>
          ))}
        </div>
      </div>
{/* Cómo funciona */}
      <div className="mt-20 max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          ¿Cómo funciona?
        </h2>
        <div className="flex flex-col gap-6">
          {[
            { paso: "1", titulo: "Tu clienta escribe", desc: "Manda un WhatsApp a tu número y el bot responde al instante" },
            { paso: "2", titulo: "Elige su cita", desc: "Ve los horarios disponibles y reserva en segundos" },
            { paso: "3", titulo: "Tú recibes la alerta", desc: "Te llega la cita confirmada a tu panel. Sin hacer nada." },
          ].map((item) => (
            <div key={item.paso} className="flex gap-4 items-start text-left">
              <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                {item.paso}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{item.titulo}</p>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    {/* Precios */}
      <div className="mt-20 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Un precio simple
        </h2>
        <div className="bg-pink-50 border-2 border-pink-400 rounded-2xl p-6">
          <p className="text-pink-500 font-semibold text-sm mb-2">MÁS POPULAR</p>
          <p className="text-4xl font-bold text-gray-800">S/79<span className="text-lg font-normal text-gray-500">/mes</span></p>
          <p className="text-gray-500 text-sm mt-1 mb-6">Primeros 14 días gratis</p>
          <div className="flex flex-col gap-3 text-left mb-6">
            {[
              "✅ Bot de WhatsApp activo 24/7",
              "✅ Agenda automática de citas",
              "✅ Recordatorios a tus clientas",
              "✅ Panel desde tu celular",
              "✅ Soporte por WhatsApp",
            ].map((item, i) => (
              <p key={i} className="text-gray-700 text-sm">{item}</p>
            ))}
          </div>
          <button className="w-full bg-pink-500 text-white py-4 rounded-xl font-semibold text-lg">
            Empezar gratis
          </button>
        </div>
      </div>

      {/* CTA Final */}
      <div className="mt-20 mb-16 text-center max-w-sm">
        <p className="text-gray-500 text-sm">
          ¿Tienes dudas? Escríbenos por WhatsApp
        </p>
        <a href="https://wa.me/51999999999" className="text-pink-500 font-semibold text-sm">
          +51 999 999 999
        </a>
      </div>
    </main>
  )
}