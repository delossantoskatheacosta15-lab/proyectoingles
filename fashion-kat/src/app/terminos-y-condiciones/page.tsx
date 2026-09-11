import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TÉRMINOS Y CONDICIONES',
  description:
    'TÉRMINOS DE USO Y CONDICIONES DE VENTA DE FASHION KAT: PRECIOS EN COP, PAGOS, ENVÍOS, DERECHO DE RETRACTO Y GARANTÍAS.',
  alternates: { canonical: '/terminos-y-condiciones' },
};

type Seccion = {
  id: string;
  titulo: string;
  parrafos?: string[];
  lista?: string[];
  nota?: string;
};

const SECCIONES: Seccion[] = [
  {
    id: 'aceptacion',
    titulo: 'ACEPTACIÓN DE LOS TÉRMINOS',
    parrafos: [
      'ESTOS TÉRMINOS Y CONDICIONES REGULAN EL USO DEL SITIO WEB DE FASHION KAT Y LA COMPRA DE PRODUCTOS A TRAVÉS DE ÉL. AL NAVEGAR, REGISTRARTE O REALIZAR UN PEDIDO, DECLARAS QUE LOS HAS LEÍDO Y QUE LOS ACEPTAS EN SU TOTALIDAD.',
      'FASHION KAT ES UNA TIENDA DE MODA FEMENINA CON DOMICILIO EN MEDELLÍN, ANTIOQUIA, COLOMBIA, QUE VENDE A PERSONAS MAYORES DE 18 AÑOS CON CAPACIDAD LEGAL PARA CONTRATAR.',
    ],
  },
  {
    id: 'cuenta',
    titulo: 'REGISTRO Y CUENTA DE USUARIA',
    parrafos: [
      'PUEDES COMPRAR COMO INVITADA O CREAR UNA CUENTA. LA INFORMACIÓN QUE REGISTRES DEBE SER VERAZ, COMPLETA Y ACTUAL, ESPECIALMENTE LA DIRECCIÓN DE ENTREGA Y EL TELÉFONO DE CONTACTO.',
    ],
    lista: [
      'ERES RESPONSABLE DE LA CUSTODIA DE TU CONTRASEÑA Y DE TODA ACTIVIDAD REALIZADA DESDE TU CUENTA.',
      'DEBES NOTIFICARNOS DE INMEDIATO CUALQUIER USO NO AUTORIZADO DE TUS CREDENCIALES.',
      'PODEMOS SUSPENDER CUENTAS CON INFORMACIÓN FALSA, PEDIDOS FRAUDULENTOS O CONDUCTAS ABUSIVAS.',
    ],
  },
  {
    id: 'precios',
    titulo: 'PRECIOS E IMPUESTOS',
    parrafos: [
      'TODOS LOS PRECIOS PUBLICADOS ESTÁN EXPRESADOS EN PESOS COLOMBIANOS (COP) E INCLUYEN LOS IMPUESTOS APLICABLES EN COLOMBIA. EL COSTO DE ENVÍO, CUANDO APLIQUE, SE INDICA POR SEPARADO ANTES DE CONFIRMAR EL PAGO.',
      'LOS PRECIOS Y LAS PROMOCIONES PUEDEN CAMBIAR EN CUALQUIER MOMENTO, PERO NUNCA AFECTAN PEDIDOS YA CONFIRMADOS. SI SE DETECTA UN ERROR EVIDENTE DE DIGITACIÓN EN UN PRECIO, TE CONTACTAREMOS ANTES DE DESPACHAR PARA CONFIRMAR O ANULAR EL PEDIDO CON REEMBOLSO TOTAL.',
    ],
  },
  {
    id: 'disponibilidad',
    titulo: 'DISPONIBILIDAD DE INVENTARIO',
    parrafos: [
      'NUESTRAS COLECCIONES SON LIMITADAS Y EL INVENTARIO SE ACTUALIZA DE FORMA CONTINUA. LA PUBLICACIÓN DE UN PRODUCTO NO GARANTIZA SU DISPONIBILIDAD HASTA QUE EL PEDIDO SEA CONFIRMADO.',
      'SI UNA PRENDA SE AGOTA DESPUÉS DE TU COMPRA, TE AVISAREMOS EN UN PLAZO MÁXIMO DE 48 HORAS Y PODRÁS ELEGIR ENTRE CAMBIARLA POR OTRA REFERENCIA, ESPERAR LA REPOSICIÓN O RECIBIR EL REEMBOLSO TOTAL DE ESE ÍTEM.',
    ],
  },
  {
    id: 'compra',
    titulo: 'PROCESO DE COMPRA',
    parrafos: ['LA COMPRA SE PERFECCIONA CUANDO RECIBES NUESTRA CONFIRMACIÓN DEL PEDIDO:'],
    lista: [
      'SELECCIONAS PRODUCTOS, TALLA Y COLOR, Y LOS AGREGAS AL CARRITO.',
      'DILIGENCIAS TUS DATOS DE ENVÍO Y ELIGES EL MÉTODO DE PAGO EN EL CHECKOUT.',
      'RECIBES UN CORREO CON EL NÚMERO DE PEDIDO Y EL DETALLE DE LA COMPRA.',
      'EL PEDIDO AVANZA POR LOS ESTADOS CONFIRMADO, PREPARANDO, ENVIADO, EN CAMINO Y ENTREGADO, CONSULTABLES EN LA SECCIÓN DE SEGUIMIENTO.',
    ],
  },
  {
    id: 'pagos',
    titulo: 'MÉTODOS DE PAGO',
    parrafos: ['ACEPTAMOS LOS SIGUIENTES MEDIOS DE PAGO PARA PEDIDOS DENTRO DE COLOMBIA:'],
    lista: [
      'PAGO CONTRA ENTREGA: PAGAS EN EFECTIVO AL RECIBIR EL PEDIDO, SUJETO A COBERTURA DE LA TRANSPORTADORA EN TU CIUDAD.',
      'PAGO ONLINE: TARJETA DÉBITO O CRÉDITO Y PSE, PROCESADOS POR PASARELAS AUTORIZADAS CON CIFRADO SSL.',
      'TRANSFERENCIA BANCARIA: TE ENVIAMOS LOS DATOS DE LA CUENTA AL CONFIRMAR EL PEDIDO; EL DESPACHO SE REALIZA UNA VEZ VERIFICADO EL PAGO.',
    ],
    nota: 'FASHION KAT NO ALMACENA NÚMEROS COMPLETOS DE TARJETA NI CLAVES BANCARIAS. LOS PEDIDOS POR TRANSFERENCIA SIN PAGO VERIFICADO EN 48 HORAS PUEDEN SER CANCELADOS AUTOMÁTICAMENTE.',
  },
  {
    id: 'envios',
    titulo: 'ENVÍOS Y TIEMPOS DE ENTREGA',
    parrafos: [
      'DESPACHAMOS A TODO EL TERRITORIO NACIONAL DESDE NUESTRA BODEGA EN ANTIOQUIA A TRAVÉS DE TRANSPORTADORAS ALIADAS.',
    ],
    lista: [
      'TIEMPO ESTIMADO DE ENTREGA: DE 2 A 5 DÍAS HÁBILES SEGÚN LA CIUDAD DE DESTINO.',
      'COSTO ESTÁNDAR DE ENVÍO: $15.000. ENVÍO GRATIS EN COMPRAS DESDE $200.000.',
      'LOS PEDIDOS CONFIRMADOS ANTES DE LAS 2:00 P.M. DE DÍAS HÁBILES SE DESPACHAN EL MISMO DÍA.',
      'LOS TIEMPOS SON ESTIMADOS Y PUEDEN VERSE AFECTADOS POR TEMPORADAS ALTAS, ORDEN PÚBLICO O CAUSAS DE FUERZA MAYOR AJENAS A FASHION KAT.',
      'TRAS DOS INTENTOS FALLIDOS DE ENTREGA POR DATOS INCORRECTOS O AUSENCIA DE LA DESTINATARIA, EL PAQUETE REGRESA A BODEGA Y UN NUEVO ENVÍO GENERA UN FLETE ADICIONAL.',
    ],
  },
  {
    id: 'retracto',
    titulo: 'DERECHO DE RETRACTO',
    parrafos: [
      'POR TRATARSE DE VENTAS NO PRESENCIALES, APLICA EL DERECHO DE RETRACTO PREVISTO EN EL ARTÍCULO 47 DEL ESTATUTO DEL CONSUMIDOR (LEY 1480 DE 2011).',
      'DISPONES DE 5 DÍAS HÁBILES CONTADOS DESDE LA ENTREGA DEL PRODUCTO PARA MANIFESTAR TU DECISIÓN DE RETRACTARTE, DEVOLVIENDO LA PRENDA EN LAS MISMAS CONDICIONES EN QUE LA RECIBISTE: SIN USO, CON ETIQUETAS Y EN SU EMPAQUE ORIGINAL. EL COSTO DEL TRANSPORTE DE DEVOLUCIÓN ESTÁ A CARGO DE LA CONSUMIDORA.',
      'RECIBIDA Y VERIFICADA LA PRENDA, DEVOLVEMOS EL DINERO PAGADO EN UN PLAZO MÁXIMO DE 30 DÍAS CALENDARIO, POR EL MISMO MEDIO DE PAGO O POR TRANSFERENCIA CUANDO LA COMPRA HAYA SIDO CONTRA ENTREGA.',
    ],
  },
  {
    id: 'garantias',
    titulo: 'GARANTÍAS, CAMBIOS Y DEVOLUCIONES',
    parrafos: [
      'TODOS NUESTROS PRODUCTOS CUENTAN CON GARANTÍA LEGAL POR DEFECTOS DE FABRICACIÓN EN COSTURAS, CIERRES, BOTONES, HERRAJES O TELA, CONFORME A LA LEY 1480 DE 2011.',
    ],
    lista: [
      'PLAZO PARA SOLICITAR CAMBIO POR TALLA O REFERENCIA: 10 DÍAS CALENDARIO DESDE LA ENTREGA.',
      'LA PRENDA DEBE ESTAR SIN USO, SIN LAVAR, CON ETIQUETAS Y EN SU EMPAQUE ORIGINAL.',
      'POR HIGIENE NO APLICAN CAMBIOS EN ROPA INTERIOR, VESTIDOS DE BAÑO NI ARETES, SALVO DEFECTO DE FABRICACIÓN.',
      'LA GARANTÍA NO CUBRE EL DESGASTE NORMAL, EL MAL USO NI EL LAVADO CONTRARIO A LAS INSTRUCCIONES DE LA ETIQUETA.',
    ],
    nota: 'EL DETALLE COMPLETO DEL PROCEDIMIENTO SE ENCUENTRA EN NUESTRA POLÍTICA DE CAMBIOS Y DEVOLUCIONES.',
  },
  {
    id: 'uso',
    titulo: 'USO PERMITIDO DEL SITIO',
    parrafos: [
      'TE COMPROMETES A USAR EL SITIO DE FORMA LÍCITA Y RESPETUOSA. QUEDA PROHIBIDO INTENTAR VULNERAR LA SEGURIDAD DE LA PLATAFORMA, EXTRAER DATOS DE FORMA AUTOMATIZADA, SUPLANTAR A OTRAS PERSONAS O PUBLICAR RESEÑAS FALSAS, OFENSIVAS O ENGAÑOSAS.',
    ],
  },
  {
    id: 'propiedad',
    titulo: 'PROPIEDAD INTELECTUAL',
    parrafos: [
      'LA MARCA FASHION KAT, SU LOGOTIPO, LOS TEXTOS, LAS FOTOGRAFÍAS DE PRODUCTO, LOS DISEÑOS Y EL CÓDIGO DE ESTE SITIO SON DE PROPIEDAD DE FASHION KAT O DE SUS LICENCIANTES Y ESTÁN PROTEGIDOS POR LA NORMATIVA COLOMBIANA Y ANDINA SOBRE DERECHOS DE AUTOR Y PROPIEDAD INDUSTRIAL.',
      'SE PROHÍBE SU REPRODUCCIÓN, DISTRIBUCIÓN O USO COMERCIAL TOTAL O PARCIAL SIN AUTORIZACIÓN ESCRITA PREVIA.',
    ],
  },
  {
    id: 'responsabilidad',
    titulo: 'LIMITACIÓN DE RESPONSABILIDAD',
    parrafos: [
      'FASHION KAT RESPONDE POR LA CALIDAD E IDONEIDAD DE LOS PRODUCTOS VENDIDOS Y POR EL CUMPLIMIENTO DE LAS CONDICIONES INFORMADAS. NO SOMOS RESPONSABLES POR RETRASOS ATRIBUIBLES A LAS TRANSPORTADORAS, POR DATOS DE ENTREGA ERRÓNEOS SUMINISTRADOS POR LA COMPRADORA, NI POR INTERRUPCIONES TEMPORALES DEL SITIO POR MANTENIMIENTO O CAUSAS DE FUERZA MAYOR.',
      'LOS COLORES DE LAS PRENDAS PUEDEN PRESENTAR LEVES VARIACIONES FRENTE A LAS FOTOGRAFÍAS DEBIDO A LA CALIBRACIÓN DE CADA PANTALLA; ESTA DIFERENCIA NO CONSTITUYE UN DEFECTO DEL PRODUCTO.',
    ],
  },
  {
    id: 'modificaciones',
    titulo: 'MODIFICACIONES',
    parrafos: [
      'PODEMOS ACTUALIZAR ESTOS TÉRMINOS PARA REFLEJAR CAMBIOS LEGALES, OPERATIVOS O COMERCIALES. LA VERSIÓN VIGENTE SERÁ SIEMPRE LA PUBLICADA EN ESTA PÁGINA Y APLICARÁ A LOS PEDIDOS REALIZADOS CON POSTERIORIDAD A SU PUBLICACIÓN.',
    ],
  },
  {
    id: 'ley',
    titulo: 'LEY APLICABLE Y JURISDICCIÓN',
    parrafos: [
      'ESTOS TÉRMINOS SE RIGEN POR LAS LEYES DE LA REPÚBLICA DE COLOMBIA. CUALQUIER CONTROVERSIA SE INTENTARÁ RESOLVER DIRECTAMENTE ENTRE LAS PARTES Y, DE NO LOGRARSE, SE SOMETERÁ A LOS JUECES COMPETENTES DE LA CIUDAD DE MEDELLÍN O A LA SUPERINTENDENCIA DE INDUSTRIA Y COMERCIO EN EJERCICIO DE SUS FACULTADES JURISDICCIONALES.',
    ],
  },
];

export default function TerminosYCondicionesPage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="bg-ink-950 py-16 sm:py-20">
        <div className="container-fk">
          <p className="eyebrow">LEGAL</p>
          <h1 className="heading-xl mt-4 text-white">TÉRMINOS Y CONDICIONES</h1>
          <p className="mt-5 max-w-2xl text-[11px] leading-relaxed tracking-brand text-white/70">
            CONDICIONES DE USO DEL SITIO Y DE VENTA DE PRODUCTOS FASHION KAT, CONFORME AL ESTATUTO DEL
            CONSUMIDOR (LEY 1480 DE 2011) Y DEMÁS NORMAS COLOMBIANAS APLICABLES.
          </p>
          <p className="mt-6 text-[10px] font-semibold tracking-brand text-rose-400">
            ÚLTIMA ACTUALIZACIÓN: ENERO DE 2026
          </p>
        </div>
      </section>

      {/* ---------------- CONTENIDO ---------------- */}
      <section className="container-fk py-14">
        <div className="grid gap-10 lg:grid-cols-[0.28fr_0.72fr] lg:gap-14">
          {/* ÍNDICE */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="label-xs">CONTENIDO</p>
            <ol className="mt-5 space-y-3">
              {SECCIONES.map((seccion, index) => (
                <li key={seccion.id}>
                  <a
                    href={`#${seccion.id}`}
                    className="flex gap-3 text-[10px] leading-relaxed tracking-wider2 text-smoke-600 transition-colors hover:text-rose-500"
                  >
                    <span className="font-semibold text-rose-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{seccion.titulo}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          {/* SECCIONES */}
          <div className="space-y-12">
            {SECCIONES.map((seccion, index) => (
              <article key={seccion.id} id={seccion.id} className="scroll-mt-32">
                <p className="text-[10px] font-bold tracking-brand text-rose-500">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="heading-md mt-3 text-ink-950">{seccion.titulo}</h2>
                <div className="divider mt-5" />

                {seccion.parrafos?.map((parrafo) => (
                  <p
                    key={parrafo.slice(0, 40)}
                    className="mt-5 text-[11px] leading-relaxed tracking-wider2 text-smoke-700"
                  >
                    {parrafo}
                  </p>
                ))}

                {seccion.lista && (
                  <ul className="mt-6 space-y-3">
                    {seccion.lista.map((item) => (
                      <li key={item.slice(0, 40)} className="flex gap-3">
                        <span className="mt-[7px] h-1 w-1 shrink-0 bg-rose-500" />
                        <span className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {seccion.nota && (
                  <p className="surface mt-6 border-l-2 border-l-rose-500 p-5 text-[10px] leading-relaxed tracking-wider2 text-ink-700">
                    {seccion.nota}
                  </p>
                )}
              </article>
            ))}

            <div className="surface flex flex-col gap-5 border-l-2 border-l-ink-950 p-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                ¿TIENES DUDAS SOBRE ESTAS CONDICIONES O SOBRE UN PEDIDO EN CURSO? ESTAMOS PARA
                AYUDARTE.
              </p>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/faq" className="btn-ghost">
                  VER PREGUNTAS FRECUENTES
                </Link>
                <Link href="/contacto" className="btn-dark">
                  CONTÁCTANOS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
