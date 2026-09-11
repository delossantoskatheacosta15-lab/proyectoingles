import { IconTruck, IconShield, IconCash, IconRefresh, IconHeadset } from '@/components/ui/Icons';

const ITEMS = [
  { icon: IconTruck, title: 'ENVÍOS A TODA COLOMBIA', text: 'ENTREGAS DE 2 A 5 DÍAS HÁBILES.' },
  { icon: IconShield, title: 'PAGO SEGURO', text: 'TUS DATOS SIEMPRE PROTEGIDOS.' },
  { icon: IconCash, title: 'PAGO CONTRA ENTREGA', text: 'PAGA CUANDO RECIBAS TU PEDIDO.' },
  { icon: IconRefresh, title: 'CAMBIOS Y DEVOLUCIONES', text: 'HASTA 10 DÍAS PARA CAMBIAR.' },
  { icon: IconHeadset, title: 'ATENCIÓN AL CLIENTE', text: 'TE ACOMPAÑAMOS POR WHATSAPP.' },
];

export function TrustBar() {
  return (
    <section className="border-y border-smoke-300 bg-smoke-100" aria-label="BENEFICIOS DE COMPRAR EN FASHION KAT">
      <div className="container-fk">
        <ul className="grid grid-cols-2 divide-smoke-300 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="flex items-start gap-3 px-2 py-6 lg:px-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div>
                  <p className="text-[10px] font-semibold tracking-brand text-ink-950">{item.title}</p>
                  <p className="mt-1 text-[9px] leading-relaxed tracking-wider2 text-smoke-600">
                    {item.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
