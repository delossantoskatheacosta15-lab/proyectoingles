import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CAMBIOS Y DEVOLUCIONES',
  description:
    'CONOCE EL PLAZO DE 10 DÍAS, LAS CONDICIONES DE LA PRENDA, LOS PASOS PARA SOLICITAR TU CAMBIO Y LOS TIEMPOS DE REEMBOLSO EN FASHION KAT.',
  alternates: { canonical: '/cambios-y-devoluciones' },
};

const RESUMEN = [
  { valor: '10 DÍAS', texto: 'CALENDARIO PARA SOLICITAR TU CAMBIO' },
  { valor: '5 DÍAS', texto: 'HÁBILES PARA EJERCER EL RETRACTO' },
  { valor: '15 DÍAS', texto: 'HÁBILES MÁXIMO PARA EL REEMBOLSO' },
  { valor: '1 CAMBIO', texto: 'GRATIS POR PEDIDO EN TALLA' },
];

const CONDICIONES = [
  'LA PRENDA DEBE ESTAR SIN USO, SIN LAVAR Y SIN PLANCHAR.',
  'DEBE CONSERVAR TODAS SUS ETIQUETAS ORIGINALES PEGADAS.',
  'DEBE VENIR EN SU EMPAQUE ORIGINAL, EN BUEN ESTADO.',
  'NO DEBE PRESENTAR MANCHAS, OLOR A PERFUME, MAQUILLAJE NI PELO DE MASCOTAS.',
  'LOS ZAPATOS DEBEN ENTREGARSE EN SU CAJA Y SIN MARCAS DE USO EN LA SUELA.',
  'DEBES ADJUNTAR EL NÚMERO DE PEDIDO O LA FACTURA ELECTRÓNICA.',
];

const NO_APLICAN = [
  { titulo: 'ROPA INTERIOR', texto: 'POR NORMAS DE HIGIENE NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES.' },
  { titulo: 'VESTIDOS DE BAÑO', texto: 'NO APLICAN CAMBIOS UNA VEZ RETIRADA LA CINTA SANITARIA.' },
  { titulo: 'ARETES', texto: 'POR HIGIENE NO SE CAMBIAN NI SE DEVUELVEN.' },
  {
    titulo: 'PRENDAS EN LIQUIDACIÓN FINAL',
    texto: 'LOS ÍTEMS MARCADOS COMO VENTA FINAL SOLO APLICAN GARANTÍA POR DEFECTO.',
  },
];

const PASOS = [
  {
    titulo: 'ESCRÍBENOS',
    texto:
      'ENVÍANOS TU SOLICITUD POR EL FORMULARIO DE CONTACTO O POR WHATSAPP DENTRO DE LOS 10 DÍAS CALENDARIO SIGUIENTES A LA ENTREGA, CON TU NÚMERO DE PEDIDO Y EL MOTIVO DEL CAMBIO.',
  },
  {
    titulo: 'ENVÍA LAS FOTOS',
    texto:
      'ADJUNTA FOTOS DE LA PRENDA COMPLETA, DE SUS ETIQUETAS Y, SI ES UN DEFECTO, UN ACERCAMIENTO DE LA ZONA AFECTADA. CON ESO VALIDAMOS EL CASO EN MENOS DE 24 HORAS HÁBILES.',
  },
  {
    titulo: 'RECIBE LA AUTORIZACIÓN',
    texto:
      'TE ENVIAMOS POR CORREO LA AUTORIZACIÓN DEL CAMBIO CON LA DIRECCIÓN DE NUESTRA BODEGA Y, CUANDO APLICA, LA GUÍA PREPAGADA DE LA TRANSPORTADORA.',
  },
  {
    titulo: 'DESPACHAMOS TU CAMBIO',
    texto:
      'AL RECIBIR Y REVISAR LA PRENDA EN BODEGA, DESPACHAMOS LA NUEVA TALLA O REFERENCIA EN UN PLAZO DE 1 A 3 DÍAS HÁBILES Y TE COMPARTIMOS EL NUEVO NÚMERO DE GUÍA.',
  },
];

const COSTOS = [
  {
    caso: 'PRENDA CON DEFECTO DE FABRICACIÓN',
    detalle: 'FASHION KAT ASUME EL 100% DEL FLETE DE IDA Y DE REGRESO.',
    quien: 'ASUME FASHION KAT',
  },
  {
    caso: 'ENVIAMOS UNA TALLA O REFERENCIA EQUIVOCADA',
    detalle: 'FASHION KAT ASUME EL 100% DEL FLETE Y PRIORIZA EL DESPACHO DEL CAMBIO.',
    quien: 'ASUME FASHION KAT',
  },
  {
    caso: 'PRIMER CAMBIO DE TALLA POR GUSTO O AJUSTE',
    detalle: 'FASHION KAT ASUME EL ENVÍO DE LA PRENDA NUEVA; TÚ ASUMES EL ENVÍO DE REGRESO.',
    quien: 'COMPARTIDO',
  },
  {
    caso: 'SEGUNDO CAMBIO DEL MISMO PEDIDO',
    detalle: 'LOS FLETES DE IDA Y REGRESO QUEDAN A CARGO DE LA CLIENTA.',
    quien: 'ASUME LA CLIENTA',
  },
  {
    caso: 'RETRACTO DENTRO DE LOS 5 DÍAS HÁBILES',
    detalle: 'LA CLIENTA ASUME EL COSTO DEL TRANSPORTE DE DEVOLUCIÓN, SEGÚN LA LEY 1480 DE 2011.',
    quien: 'ASUME LA CLIENTA',
  },
];

export default function CambiosYDevolucionesPage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="bg-ink-950 py-16 sm:py-20">
        <div className="container-fk">
          <p className="eyebrow">POLÍTICA DE LA TIENDA</p>
          <h1 className="heading-xl mt-4 text-white">CAMBIOS Y DEVOLUCIONES</h1>
          <p className="mt-5 max-w-2xl text-[11px] leading-relaxed tracking-brand text-white/70">
            SI LA TALLA NO TE QUEDÓ COMO ESPERABAS, LO RESOLVEMOS. AQUÍ ENCUENTRAS LOS PLAZOS, LAS
            CONDICIONES Y LOS PASOS EXACTOS PARA GESTIONAR TU CAMBIO EN FASHION KAT.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {RESUMEN.map((item) => (
              <div key={item.texto} className="bg-ink-950 px-6 py-8">
                <p className="text-2xl font-light tracking-wider2 text-rose-400">{item.valor}</p>
                <p className="mt-3 text-[10px] leading-relaxed tracking-brand text-white/60">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PLAZO Y CONDICIONES ---------------- */}
      <section className="container-fk py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow">PLAZO</p>
            <h2 className="heading-lg mt-4 text-ink-950">10 DÍAS DESDE LA ENTREGA</h2>
            <div className="divider mt-6" />
            <p className="mt-6 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
              TIENES 10 DÍAS CALENDARIO CONTADOS DESDE LA FECHA EN QUE LA TRANSPORTADORA REGISTRA LA
              ENTREGA PARA SOLICITAR EL CAMBIO DE TALLA, COLOR O REFERENCIA. LA SOLICITUD DEBE
              RADICARSE DENTRO DE ESE PLAZO, AUNQUE EL ENVÍO DE REGRESO SE REALICE DÍAS DESPUÉS.
            </p>
            <p className="mt-4 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
              ADICIONALMENTE, POR TRATARSE DE UNA COMPRA NO PRESENCIAL, CUENTAS CON EL DERECHO DE
              RETRACTO DE 5 DÍAS HÁBILES ESTABLECIDO EN EL ESTATUTO DEL CONSUMIDOR (LEY 1480 DE 2011)
              PARA DESISTIR DE LA COMPRA Y RECIBIR TU DINERO.
            </p>
          </div>

          <div className="surface border-t-2 border-t-rose-500 p-7 sm:p-9">
            <p className="eyebrow">CONDICIONES DE LA PRENDA</p>
            <h3 className="heading-md mt-4 text-ink-950">CÓMO DEBE ESTAR PARA ACEPTARLA</h3>
            <ul className="mt-7 space-y-4">
              {CONDICIONES.map((condicion) => (
                <li key={condicion.slice(0, 30)} className="flex gap-3">
                  <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-500" />
                  <span className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                    {condicion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- PRODUCTOS QUE NO APLICAN ---------------- */}
      <section className="border-y border-smoke-300 bg-smoke-100 py-16">
        <div className="container-fk">
          <p className="eyebrow">EXCEPCIONES</p>
          <h2 className="heading-lg mt-4 text-ink-950">PRODUCTOS QUE NO APLICAN</h2>
          <p className="mt-4 max-w-2xl text-[11px] leading-relaxed tracking-brand text-smoke-600">
            POR RAZONES DE HIGIENE Y SALUBRIDAD, LOS SIGUIENTES PRODUCTOS NO ADMITEN CAMBIO NI
            DEVOLUCIÓN, SALVO QUE PRESENTEN UN DEFECTO DE FABRICACIÓN.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {NO_APLICAN.map((item) => (
              <article key={item.titulo} className="surface p-7">
                <h3 className="text-[12px] font-semibold tracking-brand text-ink-950">
                  {item.titulo}
                </h3>
                <p className="mt-3 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                  {item.texto}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PASOS ---------------- */}
      <section className="container-fk py-16">
        <p className="eyebrow">PASO A PASO</p>
        <h2 className="heading-lg mt-4 text-ink-950">CÓMO SOLICITAR TU CAMBIO</h2>
        <p className="mt-4 max-w-2xl text-[11px] leading-relaxed tracking-brand text-smoke-600">
          CUATRO PASOS SENCILLOS. TODO EL PROCESO SE GESTIONA CON TU NÚMERO DE PEDIDO.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((paso, index) => (
            <article key={paso.titulo} className="surface card-hover flex flex-col p-7">
              <span className="flex h-9 w-9 items-center justify-center bg-ink-950 text-[11px] font-bold tracking-brand text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-[12px] font-semibold tracking-brand text-ink-950">
                {paso.titulo}
              </h3>
              <p className="mt-3 flex-1 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                {paso.texto}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- COSTOS DE ENVÍO ---------------- */}
      <section className="container-fk pb-16">
        <p className="eyebrow">COSTOS</p>
        <h2 className="heading-lg mt-4 text-ink-950">QUIÉN PAGA EL ENVÍO EN CADA CASO</h2>

        <div className="mt-8 divide-y divide-smoke-300 border border-smoke-300 bg-white">
          {COSTOS.map((costo) => (
            <div
              key={costo.caso}
              className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:gap-8"
            >
              <p className="text-[11px] font-semibold tracking-wider2 text-ink-950 sm:w-1/3">
                {costo.caso}
              </p>
              <p className="flex-1 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                {costo.detalle}
              </p>
              <span
                className={
                  costo.quien === 'ASUME FASHION KAT'
                    ? 'badge-rose shrink-0 self-start'
                    : 'badge border border-smoke-400 bg-white text-ink-700 shrink-0 self-start'
                }
              >
                {costo.quien}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- REEMBOLSOS Y DEFECTOS ---------------- */}
      <section className="container-fk pb-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="surface border-l-2 border-l-rose-500 p-7 sm:p-9">
            <p className="eyebrow">REEMBOLSOS</p>
            <h2 className="heading-md mt-4 text-ink-950">TIEMPOS DE DEVOLUCIÓN DEL DINERO</h2>
            <p className="mt-5 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
              CUANDO EL CASO TERMINA EN REEMBOLSO Y NO EN CAMBIO, EL DINERO SE DEVUELVE EN UN PLAZO
              MÁXIMO DE 15 DÍAS HÁBILES CONTADOS DESDE QUE RECIBIMOS Y APROBAMOS LA PRENDA EN BODEGA.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-500" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                  PAGO ONLINE CON TARJETA: LA REVERSIÓN SE APLICA SOBRE LA MISMA TARJETA Y SU REFLEJO
                  DEPENDE DEL CORTE DE TU BANCO.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-500" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                  PSE O TRANSFERENCIA: DEVOLVEMOS EL VALOR A LA CUENTA BANCARIA QUE NOS INDIQUES.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-500" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                  PAGO CONTRA ENTREGA: REALIZAMOS TRANSFERENCIA A LA CUENTA DE LA TITULAR DEL PEDIDO.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-500" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                  SI PREFIERES, PUEDES RECIBIR EL VALOR COMO SALDO A FAVOR PARA USAR EN LA TIENDA SIN
                  FECHA DE VENCIMIENTO.
                </span>
              </li>
            </ul>
          </article>

          <article className="bg-ink-950 p-7 sm:p-9">
            <p className="eyebrow">GARANTÍA</p>
            <h2 className="heading-md mt-4 text-white">¿TU PRODUCTO LLEGÓ DEFECTUOSO?</h2>
            <p className="mt-5 text-[11px] leading-relaxed tracking-wider2 text-white/70">
              SI AL ABRIR TU PAQUETE ENCUENTRAS UN DEFECTO DE FABRICACIÓN —COSTURAS ABIERTAS, CIERRE
              DAÑADO, MANCHAS DE FÁBRICA, HERRAJES ROTOS— O RECIBISTE UNA REFERENCIA DISTINTA A LA
              QUE PEDISTE, ESCRÍBENOS DENTRO DE LAS 72 HORAS SIGUIENTES A LA ENTREGA.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-400" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-white/60">
                  ENVÍANOS FOTOS O UN VIDEO CORTO DEL DEFECTO Y DE LA ETIQUETA DE LA PRENDA.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-400" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-white/60">
                  NOSOTROS ASUMIMOS EL 100% DE LOS COSTOS DE ENVÍO DE IDA Y DE REGRESO.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-400" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-white/60">
                  REPONEMOS LA PRENDA POR UNA NUEVA; SI NO HAY INVENTARIO, ELIGES OTRA REFERENCIA O
                  RECIBES EL REEMBOLSO TOTAL.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-400" />
                <span className="text-[10px] leading-relaxed tracking-wider2 text-white/60">
                  LA GARANTÍA NO CUBRE DESGASTE POR USO NI LAVADOS CONTRARIOS A LAS INSTRUCCIONES DE
                  LA ETIQUETA.
                </span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* ---------------- CIERRE ---------------- */}
      <section className="container-fk pb-16">
        <div className="surface flex flex-col items-start gap-8 border-l-2 border-l-rose-500 p-9 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">ESTAMOS PARA AYUDARTE</p>
            <h2 className="heading-lg mt-4 text-ink-950">SOLICITA TU CAMBIO EN MINUTOS</h2>
            <p className="mt-4 text-[11px] leading-relaxed tracking-wider2 text-smoke-600">
              TEN A LA MANO TU NÚMERO DE PEDIDO Y LAS FOTOS DE LA PRENDA. ATENDEMOS DE LUNES A SÁBADO
              DE 9:00 A.M. A 7:00 P.M. Y RESPONDEMOS LAS SOLICITUDES EN MENOS DE 24 HORAS HÁBILES.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/contacto" className="btn-primary">
              SOLICITAR CAMBIO
            </Link>
            <Link href="/faq" className="btn-outline">
              VER PREGUNTAS FRECUENTES
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
