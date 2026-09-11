import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PREGUNTAS FRECUENTES',
  description:
    'RESOLVEMOS TUS DUDAS SOBRE PEDIDOS, ENVÍOS A TODA COLOMBIA, MÉTODOS DE PAGO, CAMBIOS Y DEVOLUCIONES EN FASHION KAT.',
  alternates: { canonical: '/faq' },
};

type Pregunta = { q: string; a: string };
type Grupo = { id: string; titulo: string; resumen: string; preguntas: Pregunta[] };

const GRUPOS: Grupo[] = [
  {
    id: 'pedidos',
    titulo: 'PEDIDOS',
    resumen: 'CÓMO COMPRAR, CONFIRMAR Y SEGUIR TU PEDIDO.',
    preguntas: [
      {
        q: '¿CÓMO HAGO UN PEDIDO EN FASHION KAT?',
        a: 'ELIGE TU PRENDA, SELECCIONA TALLA Y COLOR, AGRÉGALA AL CARRITO Y CONTINÚA AL CHECKOUT. ALLÍ INGRESAS TUS DATOS DE ENVÍO, ESCOGES EL MÉTODO DE PAGO Y CONFIRMAS. RECIBIRÁS UN CORREO CON EL NÚMERO DE TU PEDIDO EN POCOS MINUTOS.',
      },
      {
        q: '¿NECESITO CREAR UNA CUENTA PARA COMPRAR?',
        a: 'PUEDES COMPRAR COMO INVITADA, PERO SI CREAS TU CUENTA GUARDAMOS TUS DIRECCIONES, TU HISTORIAL DE PEDIDOS Y TUS FAVORITOS, Y EL SIGUIENTE PEDIDO TE TOMA MENOS DE UN MINUTO.',
      },
      {
        q: '¿CÓMO SÉ QUÉ TALLA ELEGIR?',
        a: 'CADA PRODUCTO TIENE SU TABLA DE MEDIDAS EN CENTÍMETROS (BUSTO, CINTURA Y CADERA) Y LA TALLA QUE USA LA MODELO DE LA FOTO. MANEJAMOS TALLAS XS, S, M, L Y XL EN ROPA, Y DE LA 35 A LA 40 EN CALZADO. SI DUDAS ENTRE DOS TALLAS, ESCRÍBENOS CON TUS MEDIDAS Y TE ASESORAMOS.',
      },
      {
        q: '¿PUEDO MODIFICAR O CANCELAR MI PEDIDO?',
        a: 'SÍ, SIEMPRE QUE EL PEDIDO NO HAYA PASADO AL ESTADO ENVIADO. ESCRÍBENOS LO ANTES POSIBLE CON TU NÚMERO DE PEDIDO Y CAMBIAMOS LA TALLA, EL COLOR O LA DIRECCIÓN SIN COSTO. SI YA SALIÓ DE LA BODEGA, TENDRÁS QUE GESTIONARLO COMO UN CAMBIO.',
      },
      {
        q: '¿CÓMO HAGO SEGUIMIENTO A MI PEDIDO?',
        a: 'DESDE LA SECCIÓN DE SEGUIMIENTO CON TU NÚMERO DE PEDIDO, O DESDE TU CUENTA. VERÁS LOS ESTADOS PENDIENTE, CONFIRMADO, PREPARANDO, ENVIADO, EN CAMINO Y ENTREGADO, ADEMÁS DEL NÚMERO DE GUÍA DE LA TRANSPORTADORA.',
      },
    ],
  },
  {
    id: 'envios',
    titulo: 'ENVÍOS',
    resumen: 'COBERTURA, TIEMPOS Y COSTOS DE ENTREGA.',
    preguntas: [
      {
        q: '¿A QUÉ CIUDADES ENVÍAN?',
        a: 'ENVIAMOS A TODA COLOMBIA: CIUDADES PRINCIPALES, MUNICIPIOS INTERMEDIOS Y ZONAS RURALES CON COBERTURA DE NUESTRAS TRANSPORTADORAS ALIADAS. DESPACHAMOS DESDE NUESTRA BODEGA EN ANTIOQUIA.',
      },
      {
        q: '¿CUÁNTO TARDA EN LLEGAR MI PEDIDO?',
        a: 'ENTRE 2 Y 5 DÍAS HÁBILES SEGÚN LA CIUDAD DE DESTINO. EN MEDELLÍN Y EL ÁREA METROPOLITANA SUELE LLEGAR EN 1 A 2 DÍAS HÁBILES; EN ZONAS APARTADAS PUEDE TOMAR HASTA 7 DÍAS HÁBILES. LOS PEDIDOS CONFIRMADOS ANTES DE LAS 2:00 P.M. SE DESPACHAN EL MISMO DÍA.',
      },
      {
        q: '¿CUÁNTO CUESTA EL ENVÍO?',
        a: 'EL ENVÍO TIENE UN COSTO ESTÁNDAR DE $15.000 A NIVEL NACIONAL Y ES TOTALMENTE GRATIS EN COMPRAS DESDE $200.000. EL VALOR EXACTO SE CALCULA Y SE MUESTRA ANTES DE CONFIRMAR EL PAGO.',
      },
      {
        q: '¿QUÉ PASA SI NO ESTOY CUANDO LLEGUE EL DOMICILIARIO?',
        a: 'LA TRANSPORTADORA REALIZA HASTA DOS INTENTOS DE ENTREGA EN LA DIRECCIÓN REGISTRADA. SI NO LOGRAN ENTREGARLO, EL PAQUETE REGRESA A NUESTRA BODEGA Y TE CONTACTAMOS PARA REPROGRAMAR; EN ESE CASO SE COBRA UN NUEVO FLETE.',
      },
    ],
  },
  {
    id: 'pagos',
    titulo: 'PAGOS',
    resumen: 'MEDIOS DE PAGO, CUPONES Y FACTURACIÓN.',
    preguntas: [
      {
        q: '¿QUÉ MÉTODOS DE PAGO ACEPTAN?',
        a: 'PAGO CONTRA ENTREGA EN EFECTIVO, PAGO ONLINE CON TARJETA DÉBITO O CRÉDITO Y PSE, Y TRANSFERENCIA BANCARIA. AL CONFIRMAR EL PEDIDO POR TRANSFERENCIA TE ENVIAMOS LOS DATOS DE LA CUENTA.',
      },
      {
        q: '¿EL PAGO CONTRA ENTREGA ESTÁ DISPONIBLE EN TODO EL PAÍS?',
        a: 'SÍ, EL PAGO CONTRA ENTREGA ESTÁ DISPONIBLE EN LA MAYORÍA DE CIUDADES Y MUNICIPIOS CON COBERTURA. SI TU DIRECCIÓN NO LO PERMITE, EL SISTEMA TE LO INDICARÁ EN EL CHECKOUT Y PODRÁS PAGAR EN LÍNEA.',
      },
      {
        q: '¿LOS PRECIOS INCLUYEN IMPUESTOS?',
        a: 'SÍ. TODOS LOS PRECIOS ESTÁN EXPRESADOS EN PESOS COLOMBIANOS (COP) E INCLUYEN LOS IMPUESTOS APLICABLES. EL ÚNICO VALOR ADICIONAL POSIBLE ES EL COSTO DE ENVÍO, QUE SIEMPRE SE MUESTRA ANTES DE PAGAR.',
      },
      {
        q: '¿CÓMO USO UN CUPÓN DE DESCUENTO?',
        a: 'EN EL CARRITO ENCONTRARÁS EL CAMPO PARA INGRESAR TU CÓDIGO. SI ES TU PRIMERA COMPRA, USA EL CUPÓN BIENVENIDA10 Y OBTÉN 10% DE DESCUENTO. LOS CUPONES NO SON ACUMULABLES ENTRE SÍ NI APLICAN SOBRE EL COSTO DE ENVÍO.',
      },
      {
        q: '¿ES SEGURO PAGAR EN LÍNEA?',
        a: 'SÍ. LOS PAGOS SE PROCESAN A TRAVÉS DE PASARELAS AUTORIZADAS EN COLOMBIA CON CIFRADO SSL. FASHION KAT NUNCA ALMACENA LOS NÚMEROS COMPLETOS DE TU TARJETA NI TUS CLAVES BANCARIAS.',
      },
      {
        q: '¿EMITEN FACTURA?',
        a: 'SÍ. ENVIAMOS LA FACTURA ELECTRÓNICA AL CORREO REGISTRADO EN EL PEDIDO. SI NECESITAS FACTURAR A NOMBRE DE UNA EMPRESA, INDÍCANOS NIT Y RAZÓN SOCIAL ANTES DEL DESPACHO.',
      },
    ],
  },
  {
    id: 'cambios',
    titulo: 'CAMBIOS Y DEVOLUCIONES',
    resumen: 'PLAZOS, CONDICIONES Y REEMBOLSOS.',
    preguntas: [
      {
        q: '¿CUÁNTO TIEMPO TENGO PARA SOLICITAR UN CAMBIO?',
        a: 'TIENES 10 DÍAS CALENDARIO DESDE LA FECHA DE ENTREGA PARA SOLICITAR EL CAMBIO DE TALLA, COLOR O REFERENCIA. PASADO ESE PLAZO NO PODEMOS GESTIONARLO, SALVO QUE SE TRATE DE UNA GARANTÍA POR DEFECTO DE FABRICACIÓN.',
      },
      {
        q: '¿EN QUÉ CONDICIONES DEBE ESTAR LA PRENDA?',
        a: 'SIN USO, SIN LAVAR, SIN OLORES NI MANCHAS, CON SUS ETIQUETAS ORIGINALES PEGADAS Y EN SU EMPAQUE. LOS ZAPATOS DEBEN VENIR EN SU CAJA SIN MARCAS DE USO EN LA SUELA.',
      },
      {
        q: '¿QUÉ PRODUCTOS NO TIENEN CAMBIO?',
        a: 'POR RAZONES DE HIGIENE NO APLICAN CAMBIOS EN ROPA INTERIOR, VESTIDOS DE BAÑO NI ARETES. ESTOS PRODUCTOS SOLO SE REPONEN SI PRESENTAN UN DEFECTO DE FABRICACIÓN.',
      },
      {
        q: '¿PUEDO ARREPENTIRME DE LA COMPRA Y QUE ME DEVUELVAN EL DINERO?',
        a: 'SÍ. COMO COMPRA NO PRESENCIAL, APLICA EL DERECHO DE RETRACTO DEL ESTATUTO DEL CONSUMIDOR (LEY 1480 DE 2011): TIENES 5 DÍAS HÁBILES DESDE LA ENTREGA PARA DESISTIR. DEBES DEVOLVER EL PRODUCTO EN PERFECTO ESTADO Y ASUMIR EL COSTO DEL TRANSPORTE DE REGRESO.',
      },
      {
        q: '¿CUÁNTO TARDA EL REEMBOLSO?',
        a: 'UNA VEZ RECIBIMOS Y REVISAMOS LA PRENDA EN BODEGA, EL REEMBOLSO SE GESTIONA EN UN PLAZO MÁXIMO DE 15 DÍAS HÁBILES POR EL MISMO MEDIO DE PAGO O POR TRANSFERENCIA SI LA COMPRA FUE CONTRA ENTREGA.',
      },
    ],
  },
];

export default function FaqPage() {
  const total = GRUPOS.reduce((sum, grupo) => sum + grupo.preguntas.length, 0);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="border-b border-smoke-300 bg-smoke-100 py-14">
        <div className="container-fk">
          <p className="eyebrow">AYUDA</p>
          <h1 className="heading-xl mt-4 text-ink-950">PREGUNTAS FRECUENTES</h1>
          <p className="mt-4 max-w-2xl text-[11px] leading-relaxed tracking-brand text-smoke-600">
            {total} RESPUESTAS SOBRE PEDIDOS, ENVÍOS, PAGOS Y CAMBIOS. SI TU DUDA NO ESTÁ AQUÍ,
            ESCRÍBENOS Y TE RESPONDEMOS EL MISMO DÍA HÁBIL.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2">
            {GRUPOS.map((grupo) => (
              <a key={grupo.id} href={`#${grupo.id}`} className="btn-ghost">
                {grupo.titulo}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ---------------- SECCIONES ---------------- */}
      <section className="container-fk py-14">
        <div className="space-y-14">
          {GRUPOS.map((grupo) => (
            <div key={grupo.id} id={grupo.id} className="scroll-mt-32">
              <div className="grid gap-8 lg:grid-cols-[0.32fr_0.68fr] lg:gap-12">
                <div>
                  <p className="eyebrow">SECCIÓN</p>
                  <h2 className="heading-lg mt-3 text-ink-950">{grupo.titulo}</h2>
                  <p className="mt-3 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                    {grupo.resumen}
                  </p>
                  <span className="badge-dark mt-5">
                    {grupo.preguntas.length}{' '}
                    {grupo.preguntas.length === 1 ? 'PREGUNTA' : 'PREGUNTAS'}
                  </span>
                </div>

                <div className="divide-y divide-smoke-300 border border-smoke-300 bg-white">
                  {grupo.preguntas.map((pregunta) => (
                    <details key={pregunta.q} className="group">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-6 py-5 text-[11px] font-semibold tracking-wider2 text-ink-950 transition-colors hover:bg-rose-50/60 group-open:bg-rose-50/60">
                        <span className="flex-1">{pregunta.q}</span>
                        <span className="mt-0.5 shrink-0 text-[14px] font-light leading-none text-rose-500 transition-transform duration-200 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="border-t border-smoke-200 px-6 pb-6 pt-5">
                        <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                          {pregunta.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CIERRE ---------------- */}
      <section className="container-fk pb-16">
        <div className="bg-ink-950 px-8 py-12 sm:px-12 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">¿SIGUES CON DUDAS?</p>
              <h2 className="heading-lg mt-4 text-white">ESCRÍBENOS, TE RESPONDEMOS RÁPIDO</h2>
              <p className="mt-4 text-[11px] leading-relaxed tracking-wider2 text-white/70">
                NUESTRO EQUIPO ATIENDE DE LUNES A SÁBADO DE 9:00 A.M. A 7:00 P.M. CUÉNTANOS TU CASO
                CON EL NÚMERO DE PEDIDO Y TE AYUDAMOS CON TALLAS, ENVÍOS, PAGOS O CAMBIOS.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/contacto" className="btn-primary">
                IR A CONTACTO
              </Link>
              <Link href="/cambios-y-devoluciones" className="btn-outline-light">
                VER POLÍTICA DE CAMBIOS
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
