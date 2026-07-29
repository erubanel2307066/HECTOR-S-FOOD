import Link from 'next/link'
import Image from 'next/image'
import { MdStore, MdWhatsapp, MdDeliveryDining, MdRestaurantMenu } from 'react-icons/md'

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-[#1f2937]">
        <Image
          src="/images/hero-food.png"
          alt="Variedad de platillos de Hector's"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111827]/90 via-[#111827]/70 to-[#111827]/40" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#b45309] shadow-[0_18px_35px_rgba(180,83,9,0.3)]">
              <MdStore size={36} className="text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Hector<span className="text-[#fbbf24]">&apos;</span>s
            </h1>
            <p className="mb-3 text-lg text-[#f7e7d1] sm:text-xl">
              Comida como en casa
            </p>
            <p className="mb-8 text-sm text-[#e5e7eb]">
              Pollos, hamburguesas, tacos y más. <br className="sm:hidden" />
              Pide hoy y recibe en tu casa.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b45309] px-8 py-3.5 text-base font-bold text-white shadow-[0_14px_36px_rgba(180,83,9,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#93370d] sm:w-auto"
              >
                <MdRestaurantMenu size={20} />
                Ver menú y ordenar
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f766e] px-8 py-3.5 text-base font-bold text-white shadow-[0_14px_36px_rgba(15,118,110,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#115e59] sm:w-auto"
              >
                <MdWhatsapp size={20} />
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: MdDeliveryDining, title: 'Delivery propio', desc: 'Entrega rápida y directa, sin intermediarios' },
            { icon: MdWhatsapp, title: 'Pedido por WhatsApp', desc: 'Ordena desde tu chat favorito' },
            { icon: MdStore, title: 'Pago en efectivo', desc: 'Pagas hasta que recibes tu pedido' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-[1.5rem] border border-[#efe2d0] bg-[#fffcf8] p-6 text-center shadow-[0_14px_32px_rgba(31,41,55,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,41,55,0.1)]"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7ed]">
                <feature.icon size={24} className="text-[#b45309]" />
              </div>
              <h3 className="mb-1 font-semibold text-[#111827]">{feature.title}</h3>
              <p className="text-sm text-[#6b7280]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8">
        <div className="rounded-[1.75rem] border border-[#f4d9b3] bg-gradient-to-r from-[#fff7ed] to-[#fef3c7] p-6 text-center shadow-[0_12px_32px_rgba(180,83,9,0.08)]">
          <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-[#f4d9b3] shadow-md sm:h-20 sm:w-20">
            <Image
              src="/images/chef-preparation.png"
              alt="Chef de Hector's preparando platillos"
              fill
              sizes="(min-width: 640px) 80px, 64px"
              className="object-cover object-center"
            />
          </div>
          <h3 className="mb-1 text-lg font-bold text-[#111827]">Todo se prepara al momento</h3>
          <p className="mx-auto max-w-lg text-sm text-[#4b5563]">
            En Hector&apos;s cocinamos cada pedido cuando lo recibes, para que llegue fresco a tu mesa.
            <br />
            <span className="mt-1 inline-flex items-center gap-1 font-semibold text-[#9a2c00]">
              ⏱ Tiempo estimado de entrega: máximo 45 min después de confirmar
            </span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-[#111827]">Nuestro menú</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { name: 'Pollos', emoji: '🍗', bg: 'bg-[#fff7ed]', hover: 'hover:bg-[#ffedd5]', border: 'border-[#f4d9b3]' },
            { name: 'Hamburguesas', emoji: '🍔', bg: 'bg-[#fef2f2]', hover: 'hover:bg-[#fee2e2]', border: 'border-[#fecaca]' },
            { name: 'Tacos', emoji: '🌮', bg: 'bg-[#fff7ed]', hover: 'hover:bg-[#ffedd5]', border: 'border-[#f4d9b3]' },
            { name: 'Guarniciones', emoji: '🧆', bg: 'bg-[#ecfdf3]', hover: 'hover:bg-[#d1fae5]', border: 'border-[#a7f3d0]' },
            { name: 'Bebidas', emoji: '🥤', bg: 'bg-[#eff6ff]', hover: 'hover:bg-[#dbeafe]', border: 'border-[#bfdbfe]' },
            { name: 'Postres', emoji: '🍰', bg: 'bg-[#faf5ff]', hover: 'hover:bg-[#f3e8ff]', border: 'border-[#e9d5ff]' },
          ].map((cat) => (
            <Link
              key={cat.name}
              href="/menu"
              className={`${cat.bg} ${cat.hover} rounded-[1.25rem] border ${cat.border} p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <span className="mb-2 block text-3xl">{cat.emoji}</span>
              <span className="text-sm font-semibold text-[#374151]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#efe2d0] bg-[#fffaf3]">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#b45309]">
                <MdStore size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold text-[#111827]">Hector&apos;s</span>
            </div>
            <p className="text-xs text-[#8a7057]">
              © {new Date().getFullYear()} Hector&apos;s. Comida como en casa.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8a7057]">Lun–Sáb 11:00 – 22:00</span>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16a34a] transition-colors hover:text-[#15803d]"
              >
                <MdWhatsapp size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
