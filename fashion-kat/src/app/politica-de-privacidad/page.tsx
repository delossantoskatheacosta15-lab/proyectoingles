import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POLÍTICA DE PRIVACIDAD',
  description:
    'POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES DE FASHION KAT CONFORME A LA LEY 1581 DE 2012 DE COLOMBIA.',
  alternates: { canonical: '/politica-de-privacidad' },
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
    id: 'responsable',
    titulo: 'RESPONSABLE DEL TRATAMIENTO',
    parrafos: [
      'FASHION KAT, TIENDA DE MODA FEMENINA CON DOMICILIO PRINCIPAL EN LA CALLE 10 # 40-20, MEDELLÍN, ANTIOQUIA, COLOMBIA, ACTÚA COMO RESPONSABLE DEL TRATAMIENTO DE LOS DATOS PERSONALES RECOLECTADOS A TRAVÉS DE ESTE SITIO WEB, DE NUESTROS CANALES DE ATENCIÓN Y DE NUESTRAS REDES SOCIALES.',
      'ESTA POLÍTICA SE EXPIDE EN CUMPLIMIENTO DE LA LEY 1581 DE 2012, EL DECRETO 1074 DE 2015 Y DEMÁS NORMAS QUE REGULAN LA PROTECCIÓN DE DATOS PERSONALES EN COLOMBIA.',
    ],
    lista: [
      'CORREO ELECTRÓNICO: HOLA@FASHIONKAT.CO',
      'TELÉFONO: (604) 000 0000',
      'HORARIO DE ATENCIÓN: LUNES A SÁBADO DE 9:00 A.M. A 7:00 P.M.',
    ],
  },
  {
    id: 'datos',
    titulo: 'DATOS PERSONALES QUE RECOLECTAMOS',
    parrafos: [
      'SOLO SOLICITAMOS LA INFORMACIÓN NECESARIA PARA VENDERTE, ENVIARTE TU PEDIDO Y ATENDERTE. NO RECOLECTAMOS DATOS SENSIBLES COMO ORIGEN ÉTNICO, CONVICCIONES RELIGIOSAS O DATOS BIOMÉTRICOS.',
    ],
    lista: [
      'DATOS DE IDENTIFICACIÓN: NOMBRE COMPLETO Y DOCUMENTO DE IDENTIDAD CUANDO SE REQUIERE PARA FACTURACIÓN.',
      'DATOS DE CONTACTO: CORREO ELECTRÓNICO, TELÉFONO CELULAR Y DIRECCIÓN DE ENVÍO CON CIUDAD Y DEPARTAMENTO.',
      'DATOS DE LA COMPRA: PRODUCTOS, TALLAS, VALORES, MÉTODO DE PAGO Y ESTADO DEL PEDIDO.',
      'DATOS DE PAGO: LOS DATOS DE TARJETA SON CAPTURADOS Y CUSTODIADOS DIRECTAMENTE POR LA PASARELA DE PAGOS; FASHION KAT NO ALMACENA NÚMEROS COMPLETOS DE TARJETA NI CLAVES.',
      'DATOS DE NAVEGACIÓN: DIRECCIÓN IP, TIPO DE DISPOSITIVO, PÁGINAS VISITADAS Y PRODUCTOS CONSULTADOS.',
    ],
  },
  {
    id: 'finalidades',
    titulo: 'FINALIDADES DEL TRATAMIENTO',
    parrafos: ['UTILIZAMOS TUS DATOS PERSONALES ÚNICAMENTE PARA LAS SIGUIENTES FINALIDADES:'],
    lista: [
      'PROCESAR, CONFIRMAR, DESPACHAR Y ENTREGAR LOS PEDIDOS REALIZADOS EN LA TIENDA.',
      'GESTIONAR PAGOS, FACTURACIÓN ELECTRÓNICA, CAMBIOS, DEVOLUCIONES Y GARANTÍAS.',
      'ATENDER PETICIONES, QUEJAS, RECLAMOS Y SOLICITUDES DE ASESORÍA DE TALLAS.',
      'ENVIAR INFORMACIÓN COMERCIAL, NOVEDADES Y CUPONES CUANDO LA TITULAR LO HAYA AUTORIZADO EXPRESAMENTE.',
      'MEJORAR EL CATÁLOGO Y LA EXPERIENCIA DE COMPRA MEDIANTE ESTADÍSTICAS AGREGADAS Y ANÓNIMAS.',
      'CUMPLIR OBLIGACIONES LEGALES, CONTABLES Y TRIBUTARIAS EXIGIBLES EN COLOMBIA.',
    ],
  },
  {
    id: 'autorizacion',
    titulo: 'AUTORIZACIÓN DE LA TITULAR',
    parrafos: [
      'AL CREAR UNA CUENTA, REALIZAR UNA COMPRA, SUSCRIBIRTE AL BOLETÍN O ESCRIBIRNOS POR CUALQUIER CANAL, OTORGAS TU AUTORIZACIÓN PREVIA, EXPRESA E INFORMADA PARA EL TRATAMIENTO DE TUS DATOS EN LOS TÉRMINOS DE ESTA POLÍTICA.',
      'LA AUTORIZACIÓN PARA FINES PUBLICITARIOS ES OPCIONAL: PUEDES COMPRAR SIN ACEPTARLA Y PUEDES RETIRARLA EN CUALQUIER MOMENTO SIN QUE ELLO AFECTE LA GESTIÓN DE TUS PEDIDOS.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'DERECHOS DE LA TITULAR',
    parrafos: [
      'COMO TITULAR DE LOS DATOS PERSONALES TIENES DERECHO A EJERCER, DE FORMA GRATUITA, LAS SIGUIENTES FACULTADES:',
    ],
    lista: [
      'CONOCER: SABER QUÉ DATOS TUYOS TENEMOS Y CÓMO LOS ESTAMOS USANDO.',
      'ACTUALIZAR: MANTENER TU INFORMACIÓN VIGENTE, POR EJEMPLO TU DIRECCIÓN DE ENVÍO O TU TELÉFONO.',
      'RECTIFICAR: CORREGIR DATOS PARCIALES, INEXACTOS, INCOMPLETOS O QUE INDUZCAN A ERROR.',
      'SUPRIMIR: SOLICITAR LA ELIMINACIÓN DE TUS DATOS CUANDO NO EXISTA UN DEBER LEGAL O CONTRACTUAL DE CONSERVARLOS.',
      'REVOCAR: RETIRAR LA AUTORIZACIÓN OTORGADA PARA EL TRATAMIENTO, EN ESPECIAL PARA FINES PUBLICITARIOS.',
      'PRESENTAR QUEJAS ANTE LA SUPERINTENDENCIA DE INDUSTRIA Y COMERCIO POR INFRACCIONES A LA LEY 1581 DE 2012.',
    ],
    nota: 'PARA EJERCER CUALQUIERA DE ESTOS DERECHOS ESCRIBE A HOLA@FASHIONKAT.CO INDICANDO TU NOMBRE, DOCUMENTO, LA SOLICITUD CONCRETA Y UN CORREO DE CONTACTO. RESPONDEMOS LAS CONSULTAS EN MÁXIMO 10 DÍAS HÁBILES Y LOS RECLAMOS EN MÁXIMO 15 DÍAS HÁBILES.',
  },
  {
    id: 'cookies',
    titulo: 'USO DE COOKIES',
    parrafos: [
      'ESTE SITIO UTILIZA COOKIES Y TECNOLOGÍAS SIMILARES PARA FUNCIONAR CORRECTAMENTE Y RECORDAR TUS PREFERENCIAS. PUEDES ELIMINARLAS O BLOQUEARLAS DESDE LA CONFIGURACIÓN DE TU NAVEGADOR, TENIENDO EN CUENTA QUE ALGUNAS FUNCIONES COMO EL CARRITO O EL INICIO DE SESIÓN PODRÍAN DEJAR DE OPERAR.',
    ],
    lista: [
      'COOKIES NECESARIAS: MANTIENEN TU SESIÓN INICIADA Y CONSERVAN LOS PRODUCTOS DEL CARRITO.',
      'COOKIES DE PREFERENCIA: RECUERDAN FILTROS, FAVORITOS Y LA CIUDAD DE ENVÍO SELECCIONADA.',
      'COOKIES ANALÍTICAS: NOS PERMITEN MEDIR DE FORMA AGREGADA QUÉ SECCIONES SE VISITAN MÁS.',
    ],
  },
  {
    id: 'seguridad',
    titulo: 'SEGURIDAD DE LA INFORMACIÓN',
    parrafos: [
      'ADOPTAMOS MEDIDAS TÉCNICAS, HUMANAS Y ADMINISTRATIVAS RAZONABLES PARA PROTEGER TUS DATOS CONTRA PÉRDIDA, ACCESO NO AUTORIZADO, ALTERACIÓN O USO FRAUDULENTO.',
    ],
    lista: [
      'CIFRADO DE LAS COMUNICACIONES MEDIANTE CERTIFICADO SSL EN TODO EL SITIO.',
      'ALMACENAMIENTO DE CONTRASEÑAS DE FORMA CIFRADA E IRREVERSIBLE.',
      'ACCESO AL PANEL ADMINISTRATIVO RESTRINGIDO POR ROLES Y CREDENCIALES INDIVIDUALES.',
      'COPIAS DE SEGURIDAD PERIÓDICAS DE LA BASE DE DATOS DE PEDIDOS.',
    ],
  },
  {
    id: 'conservacion',
    titulo: 'TIEMPO DE CONSERVACIÓN',
    parrafos: [
      'CONSERVAMOS TUS DATOS MIENTRAS EXISTA UNA RELACIÓN COMERCIAL VIGENTE Y, POSTERIORMENTE, DURANTE LOS TÉRMINOS EXIGIDOS POR LA LEY COLOMBIANA PARA EFECTOS CONTABLES, TRIBUTARIOS Y DE GARANTÍAS. LOS DATOS DE FACTURACIÓN SE CONSERVAN POR UN MÍNIMO DE CINCO AÑOS.',
      'CUANDO YA NO EXISTA UNA FINALIDAD LEGÍTIMA NI UN DEBER LEGAL DE CONSERVACIÓN, LOS DATOS SON ELIMINADOS O ANONIMIZADOS DE MANERA SEGURA.',
    ],
  },
  {
    id: 'terceros',
    titulo: 'TRANSFERENCIA Y TRANSMISIÓN A TERCEROS',
    parrafos: [
      'NO VENDEMOS NI ARRENDAMOS TUS DATOS PERSONALES. COMPARTIMOS ÚNICAMENTE LA INFORMACIÓN INDISPENSABLE CON ALIADOS QUE NOS PERMITEN CUMPLIR EL CONTRATO DE COMPRAVENTA, QUIENES ESTÁN OBLIGADOS A USARLA SOLO PARA ESA FINALIDAD:',
    ],
    lista: [
      'TRANSPORTADORAS Y OPERADORES LOGÍSTICOS: NOMBRE, TELÉFONO Y DIRECCIÓN PARA ENTREGAR TU PEDIDO.',
      'PASARELAS DE PAGO Y ENTIDADES FINANCIERAS: DATOS NECESARIOS PARA PROCESAR Y VALIDAR LA TRANSACCIÓN.',
      'PROVEEDORES DE CORREO ELECTRÓNICO Y MENSAJERÍA: PARA ENVIARTE CONFIRMACIONES Y NOTIFICACIONES DE TU PEDIDO.',
      'AUTORIDADES ADMINISTRATIVAS O JUDICIALES: CUANDO EXISTA UNA ORDEN LEGAL QUE ASÍ LO EXIJA.',
    ],
  },
  {
    id: 'menores',
    titulo: 'DATOS DE MENORES DE EDAD',
    parrafos: [
      'NUESTRA TIENDA ESTÁ DIRIGIDA A PERSONAS MAYORES DE 18 AÑOS. NO RECOLECTAMOS DELIBERADAMENTE DATOS DE MENORES; SI DETECTAMOS UN REGISTRO DE ESTE TIPO, PROCEDEMOS A ELIMINARLO. LAS COMPRAS PARA MENORES DEBEN SER REALIZADAS POR SUS PADRES O REPRESENTANTES LEGALES.',
    ],
  },
  {
    id: 'vigencia',
    titulo: 'VIGENCIA Y CAMBIOS EN LA POLÍTICA',
    parrafos: [
      'ESTA POLÍTICA RIGE DESDE SU PUBLICACIÓN Y PERMANECE VIGENTE MIENTRAS FASHION KAT TRATE DATOS PERSONALES. PODEMOS ACTUALIZARLA PARA REFLEJAR CAMBIOS LEGALES U OPERATIVOS; LA VERSIÓN VIGENTE SERÁ SIEMPRE LA PUBLICADA EN ESTA PÁGINA.',
    ],
  },
  {
    id: 'contacto',
    titulo: 'CANAL DE CONTACTO',
    parrafos: [
      'PARA CUALQUIER CONSULTA, RECLAMO O SOLICITUD RELACIONADA CON TUS DATOS PERSONALES, ESCRÍBENOS A HOLA@FASHIONKAT.CO O UTILIZA EL FORMULARIO DE CONTACTO DE LA TIENDA. TAMBIÉN PUEDES ACERCARTE A NUESTRA DIRECCIÓN EN MEDELLÍN EN EL HORARIO DE ATENCIÓN.',
    ],
  },
];

export default function PoliticaDePrivacidadPage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="bg-ink-950 py-16 sm:py-20">
        <div className="container-fk">
          <p className="eyebrow">LEGAL</p>
          <h1 className="heading-xl mt-4 text-white">POLÍTICA DE PRIVACIDAD</h1>
          <p className="mt-5 max-w-2xl text-[11px] leading-relaxed tracking-brand text-white/70">
            POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES DE FASHION KAT, EXPEDIDA CONFORME A LA LEY
            1581 DE 2012 Y SUS DECRETOS REGLAMENTARIOS EN COLOMBIA.
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
                ¿NECESITAS QUE ACTUALICEMOS, CORRIJAMOS O ELIMINEMOS TUS DATOS? ESCRÍBENOS Y
                GESTIONAMOS TU SOLICITUD.
              </p>
              <Link href="/contacto" className="btn-dark shrink-0">
                CONTÁCTANOS
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
