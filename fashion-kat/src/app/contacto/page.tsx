import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { getSettings } from '@/lib/settings';
import { IconMail, IconPhone, IconPin, IconClock, IconWhatsapp } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CONTACTO',
  description:
    'ESCRÍBENOS Y TE RESPONDEMOS EN MENOS DE 24 HORAS HÁBILES. ESTAMOS PARA AYUDARTE CON TU PEDIDO, TALLAS Y ENVÍOS.',
  alternates: { canonical: '/contacto' },
};

export default async function ContactoPage() {
  const settings = await getSettings();
  const whatsapp = (settings.store_whatsapp || '').replace(/\D/g, '');

  const items = [
    { icon: IconMail, label: 'CORREO', value: settings.store_email },
    { icon: IconPhone, label: 'TELÉFONO', value: settings.store_phone },
    { icon: IconPin, label: 'DIRECCIÓN', value: settings.store_address },
    { icon: IconClock, label: 'HORARIO', value: settings.store_schedule },
  ];

  return (
    <>
      <section className="border-b border-smoke-300 bg-ink-950 py-16 text-white">
        <div className="container-fk">
          <p className="eyebrow">ESTAMOS PARA AYUDARTE</p>
          <h1 className="heading-xl mt-4">CONTACTO</h1>
          <p className="mt-4 max-w-xl text-[11px] leading-relaxed tracking-brand text-white/65">
            ¿TIENES DUDAS SOBRE UNA TALLA, UN PEDIDO O UN CAMBIO? ESCRÍBENOS Y TE RESPONDEMOS EN MENOS
            DE 24 HORAS HÁBILES.
          </p>
        </div>
      </section>

      <section className="container-fk py-14">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-[12px] font-semibold tracking-brand text-ink-950">
              ESCRÍBENOS UN MENSAJE
            </h2>
            <p className="mt-2 text-[10px] tracking-brand text-smoke-600">
              TODOS LOS CAMPOS MARCADOS SON OBLIGATORIOS.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="border border-smoke-300 bg-white p-6">
              <p className="label-xs mb-5">DATOS DE CONTACTO</p>
              <ul className="flex flex-col gap-5">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                      <div>
                        <p className="text-[9px] font-semibold tracking-brand text-smoke-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed tracking-wider2 text-ink-900">
                          {item.value}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border border-smoke-300 bg-ink-950 p-6 text-white">
              <IconWhatsapp className="h-6 w-6 text-rose-400" />
              <p className="mt-4 text-[11px] font-semibold tracking-brand">ATENCIÓN POR WHATSAPP</p>
              <p className="mt-2 text-[10px] leading-relaxed tracking-wider2 text-white/60">
                {whatsapp
                  ? 'ESCRÍBENOS Y RESOLVEMOS TUS DUDAS AL INSTANTE.'
                  : 'EL NÚMERO DE WHATSAPP SE CONFIGURA DESDE EL PANEL ADMINISTRATIVO O EN LA VARIABLE NEXT_PUBLIC_WHATSAPP_NUMBER.'}
              </p>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('HOLA, FASHION KAT. TENGO UNA PREGUNTA SOBRE UN PRODUCTO.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 w-full"
                >
                  ABRIR WHATSAPP
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
