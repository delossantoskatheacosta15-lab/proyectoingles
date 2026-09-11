import Link from 'next/link';
import type { Metadata } from 'next';

import { BRAND } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'NOSOTROS',
  description:
    'CONOCE LA HISTORIA DE FASHION KAT: UNA TIENDA DE MODA FEMENINA NACIDA EN MEDELLÍN QUE VISTE A MUJERES DE TODA COLOMBIA.',
  alternates: { canonical: '/nosotros' },
};

const VALORES = [
  {
    titulo: 'CALIDAD',
    texto:
      'REVISAMOS TELA POR TELA Y COSTURA POR COSTURA ANTES DE PUBLICAR UNA PRENDA. TRABAJAMOS CON TALLERES DEL VALLE DE ABURRÁ QUE CUIDAN CADA DETALLE.',
  },
  {
    titulo: 'CERCANÍA',
    texto:
      'TE RESPONDEMOS COMO AMIGAS, NO COMO UN ROBOT. ASESORÍA DE TALLAS, COMBINACIONES Y SEGUIMIENTO DE TU PEDIDO POR WHATSAPP.',
  },
  {
    titulo: 'ESTILO PROPIO',
    texto:
      'NO SEGUIMOS TODAS LAS MODAS: ELEGIMOS LAS QUE DURAN. PRENDAS VERSÁTILES QUE FUNCIONAN EN LA OFICINA, EN LA CALLE Y EN LA NOCHE.',
  },
  {
    titulo: 'COMPROMISO',
    texto:
      'SI ALGO SALE MAL, LO RESOLVEMOS. CAMBIOS SENCILLOS, EMPAQUES CUIDADOS Y TIEMPOS DE ENTREGA QUE SÍ CUMPLIMOS.',
  },
];

const CIFRAS = [
  { valor: '+12.000', texto: 'CLIENTAS FELICES' },
  { valor: '+38.000', texto: 'PRENDAS ENVIADAS' },
  { valor: '+180', texto: 'CIUDADES CON COBERTURA' },
  { valor: '8', texto: 'AÑOS DE EXPERIENCIA' },
];

const HITOS = [
  {
    anio: '2017',
    texto: 'ABRIMOS UN LOCAL PEQUEÑO EN EL CENTRO DE MEDELLÍN CON VEINTE VESTIDOS Y MUCHAS GANAS.',
  },
  {
    anio: '2019',
    texto: 'LANZAMOS LA VENTA POR REDES SOCIALES Y ENVIAMOS NUESTRO PRIMER PEDIDO A BARRANQUILLA.',
  },
  {
    anio: '2021',
    texto: 'ESTRENAMOS BODEGA PROPIA EN ITAGÜÍ Y SUMAMOS EL PAGO CONTRA ENTREGA A TODO EL PAÍS.',
  },
  {
    anio: '2024',
    texto: 'NACE LA TIENDA ONLINE FASHION KAT, CON CATÁLOGO COMPLETO Y SEGUIMIENTO EN LÍNEA.',
  },
];

export default function NosotrosPage() {
  return (
    <>
      {/* ---------------- HERO OSCURO ---------------- */}
      <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-rose-700/20 blur-3xl" />
        <div className="container-fk relative">
          <p className="eyebrow">NUESTRA HISTORIA</p>
          <h1 className="heading-xl mt-4 max-w-3xl text-white">{BRAND.slogan}</h1>
          <p className="mt-6 max-w-2xl text-[11px] leading-relaxed tracking-brand text-white/70">
            SOMOS FASHION KAT, UNA TIENDA DE MODA FEMENINA NACIDA EN MEDELLÍN, COLOMBIA. VESTIMOS A
            MUJERES REALES QUE TRABAJAN, ESTUDIAN, SALEN Y SE ATREVEN, CON PRENDAS QUE SE SIENTEN TAN
            BIEN COMO SE VEN.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/productos" className="btn-primary">
              VER CATÁLOGO
            </Link>
            <Link href="/categorias" className="btn-outline-light">
              EXPLORAR CATEGORÍAS
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- HISTORIA ---------------- */}
      <section className="container-fk py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="eyebrow">CÓMO EMPEZAMOS</p>
            <h2 className="heading-lg mt-4 text-ink-950">DE UN LOCAL EN MEDELLÍN A TODA COLOMBIA</h2>
            <div className="divider mt-6" />
            <p className="mt-6 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
              FASHION KAT EMPEZÓ EN 2017 COMO UN LOCAL DE DOCE METROS CUADRADOS EN EL CENTRO DE
              MEDELLÍN. KATHERINE, NUESTRA FUNDADORA, COMPRABA TELAS EN EL BARRIO ANTIOQUIA Y LLEVABA
              LAS PRENDAS TERMINADAS EN UNA MALETA HASTA LA VITRINA. NO HABÍA CATÁLOGO NI FOTOS
              PROFESIONALES: HABÍA CONVERSACIÓN, ESPEJO Y CONSEJO SINCERO.
            </p>
            <p className="mt-4 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
              ESA FORMA DE ATENDER FUE LA QUE NOS HIZO CRECER. LAS CLIENTAS EMPEZARON A PEDIRNOS
              PRENDAS POR MENSAJE DESDE OTRAS CIUDADES Y ENTENDIMOS QUE LA MODA COLOMBIANA NECESITABA
              UNA TIENDA QUE HABLARA CLARO: TALLAS REALES, PRECIOS EN PESOS SIN SORPRESAS Y ENVÍOS
              QUE LLEGARAN CUANDO PROMETIMOS.
            </p>
            <p className="mt-4 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
              HOY TRABAJAMOS CON TALLERES ALIADOS DEL VALLE DE ABURRÁ, DISEÑAMOS COLECCIONES CÁPSULA
              CADA TEMPORADA Y ENVIAMOS A MÁS DE 180 CIUDADES Y MUNICIPIOS DEL PAÍS. SEGUIMOS SIENDO
              EL MISMO EQUIPO QUE RESPONDE CON NOMBRE PROPIO.
            </p>
          </div>

          <div className="surface p-7 sm:p-9">
            <p className="label-xs">LÍNEA DE TIEMPO</p>
            <ul className="mt-7 space-y-7">
              {HITOS.map((hito) => (
                <li key={hito.anio} className="border-l-2 border-rose-500 pl-5">
                  <p className="text-[13px] font-semibold tracking-brand text-ink-950">{hito.anio}</p>
                  <p className="mt-2 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                    {hito.texto}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- MISIÓN Y VISIÓN ---------------- */}
      <section className="border-y border-smoke-300 bg-smoke-100 py-16 sm:py-20">
        <div className="container-fk">
          <p className="eyebrow">HACIA DÓNDE VAMOS</p>
          <h2 className="heading-lg mt-4 text-ink-950">MISIÓN Y VISIÓN</h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="surface border-t-2 border-t-rose-500 p-7 sm:p-9">
              <h3 className="heading-md text-ink-950">MISIÓN</h3>
              <p className="mt-5 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
                HACER QUE CADA MUJER COLOMBIANA ENCUENTRE PRENDAS QUE LE QUEDEN BIEN, LE DUREN Y LE
                HAGAN SENTIR SEGURA, CON UNA EXPERIENCIA DE COMPRA HONESTA: DESCRIPCIONES CLARAS,
                TALLAS REALES, PRECIOS JUSTOS Y UNA ATENCIÓN QUE NO DESAPARECE DESPUÉS DE LA VENTA.
              </p>
            </article>

            <article className="surface border-t-2 border-t-ink-950 p-7 sm:p-9">
              <h3 className="heading-md text-ink-950">VISIÓN</h3>
              <p className="mt-5 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
                SER PARA 2030 LA TIENDA DE MODA FEMENINA EN LÍNEA MÁS QUERIDA DE COLOMBIA: RECONOCIDA
                POR SU SERVICIO CERCANO, POR PRODUCIR CON TALLERES LOCALES EN CONDICIONES DIGNAS Y POR
                REDUCIR EL DESPERDICIO TEXTIL CON COLECCIONES PEQUEÑAS Y BIEN PENSADAS.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------- VALORES ---------------- */}
      <section className="container-fk py-16 sm:py-20">
        <p className="eyebrow">LO QUE NOS MUEVE</p>
        <h2 className="heading-lg mt-4 text-ink-950">NUESTROS VALORES</h2>
        <p className="mt-4 max-w-2xl text-[11px] leading-relaxed tracking-brand text-smoke-600">
          CUATRO PRINCIPIOS QUE APLICAMOS EN CADA PRENDA QUE ELEGIMOS Y EN CADA PEDIDO QUE EMPACAMOS.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALORES.map((valor, index) => (
            <article key={valor.titulo} className="surface card-hover flex flex-col p-7">
              <span className="text-[11px] font-bold tracking-brand text-rose-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-[13px] font-semibold tracking-brand text-ink-950">
                {valor.titulo}
              </h3>
              <p className="mt-3 flex-1 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                {valor.texto}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- CIFRAS ---------------- */}
      <section className="bg-ink-950 py-16 sm:py-20">
        <div className="container-fk">
          <p className="eyebrow">EN NÚMEROS</p>
          <h2 className="heading-lg mt-4 text-white">FASHION KAT HOY</h2>

          <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {CIFRAS.map((cifra) => (
              <div key={cifra.texto} className="bg-ink-950 px-7 py-10 text-center">
                <p className="text-3xl font-light tracking-wider2 text-rose-400 sm:text-4xl">
                  {cifra.valor}
                </p>
                <p className="mt-4 text-[10px] font-semibold leading-relaxed tracking-brand text-white/70">
                  {cifra.texto}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-[10px] leading-relaxed tracking-brand text-white/50">
            CIFRAS ACUMULADAS DESDE 2017 HASTA HOY, CON DESPACHOS DESDE NUESTRA BODEGA EN ANTIOQUIA
            HACIA TODO EL TERRITORIO NACIONAL.
          </p>
        </div>
      </section>

      {/* ---------------- CIERRE ---------------- */}
      <section className="container-fk py-16 sm:py-20">
        <div className="surface flex flex-col items-start gap-8 border-l-2 border-l-rose-500 p-9 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">TE ESPERAMOS</p>
            <h2 className="heading-lg mt-4 text-ink-950">
              ¿LISTA PARA ENCONTRAR TU PRÓXIMA PRENDA FAVORITA?
            </h2>
            <p className="mt-4 text-[11px] leading-relaxed tracking-wider2 text-smoke-600">
              ENVÍO GRATIS EN COMPRAS DESDE $200.000, PAGO CONTRA ENTREGA DISPONIBLE Y ASESORÍA DE
              TALLAS ANTES DE COMPRAR. SI TIENES UNA DUDA, ESCRÍBENOS Y TE RESPONDEMOS EL MISMO DÍA.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/productos" className="btn-primary">
              COMPRAR AHORA
            </Link>
            <Link href="/contacto" className="btn-outline">
              CONTÁCTANOS
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
