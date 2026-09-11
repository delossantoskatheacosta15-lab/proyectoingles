# FASHION KAT

**TU ESTILO, TU ACTITUD, TU MOMENTO.**

Plataforma de e-commerce de moda completa y funcional: frontend, backend, base de datos real, autenticación con roles, panel administrativo, inventario, pedidos, cupones, pagos preparados, envíos, notificaciones, correos, SEO y analíticas.

---

## 1. PUESTA EN MARCHA (3 PASOS)

Necesitas **Node.js 18.17 o superior** ([descargar](https://nodejs.org)).

Abre la carpeta del proyecto en Visual Studio Code y, en la terminal integrada (`Ctrl+Ñ` o `Terminal → Nueva terminal`):

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos y cargar los datos de demostración
npm run setup

# 3. Levantar la tienda
npm run dev
```

Abre **http://localhost:3000**.

> El paso 2 genera el cliente de Prisma, crea `prisma/dev.db` (SQLite) y carga 45 productos, 10 categorías, 9 catálogos, 20 pedidos, reseñas, cupones, clientes y mensajes de contacto.

### Extensiones recomendadas de VS Code

- **Prisma** (`Prisma.prisma`) — resaltado del esquema
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — autocompletado de clases
- **ESLint** (`dbaeumer.vscode-eslint`)

---

## 2. CUENTAS DE DEMOSTRACIÓN

| ROL | CORREO | CONTRASEÑA | ACCESO |
|---|---|---|---|
| ADMINISTRADOR | `admin@fashionkat.co` | `Admin123*` | Todo el panel |
| EDITOR | `editor@fashionkat.co` | `Admin123*` | Productos, categorías, catálogos, banners, reseñas |
| OPERADOR | `operador@fashionkat.co` | `Admin123*` | Pedidos, clientes, mensajes, envíos |
| CLIENTA | `cliente@fashionkat.co` | `Cliente123*` | Su cuenta, pedidos y favoritos |

El panel está en **/admin** y es una ruta protegida: un cliente que intente entrar es redirigido a su cuenta.

> Borra el bloque de cuentas de demostración de `src/components/auth/LoginForm.tsx` antes de publicar la tienda, y cambia las contraseñas.

### Cupones de prueba

`FASHION20` (20%), `BIENVENIDA10` (10%), `ENVIOGRATIS` ($15.000), `VESTIDOS15`, `ROSA25`, `KAT50K`, `ZAPATOS10` y `VERANO30` (expirado, para probar el mensaje de error).

---

## 3. TECNOLOGÍA

| CAPA | TECNOLOGÍA |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Estilos | Tailwind CSS 3 (sistema de diseño propio en `globals.css`) |
| Base de datos | Prisma ORM + SQLite (cambiable a PostgreSQL o MySQL) |
| Autenticación | JWT firmado (`jose`) en cookie `httpOnly` + `bcryptjs` |
| Validación | Zod en el backend y validación nativa en el frontend |
| Gráficos | Recharts |

---

## 4. ESTRUCTURA DEL PROYECTO

```
fashion-kat/
├── prisma/
│   ├── schema.prisma        # 20 modelos y sus relaciones
│   ├── seed.ts              # Generador de datos de demostración
│   └── seed-data.ts         # Catálogo, categorías, cupones, clientes
├── public/
│   ├── favicon.svg
│   └── uploads/             # Carpeta para tus propias imágenes
└── src/
    ├── middleware.ts        # Protección de /admin y del área de cliente
    ├── app/
    │   ├── layout.tsx       # Layout raíz, proveedores y SEO global
    │   ├── page.tsx         # INICIO
    │   ├── api/             # BACKEND: 58 rutas
    │   │   ├── auth/        # registro, login, logout, recuperación
    │   │   ├── productos/   # listado, detalle, lote
    │   │   ├── carrito/     # sincronización y resolución de precios
    │   │   ├── pedidos/     # creación y consulta
    │   │   ├── cupones/ resenas/ contacto/ favoritos/ ...
    │   │   ├── pagos/       # webhook y estado de la pasarela
    │   │   └── admin/       # CRUD completo del panel
    │   ├── admin/           # PANEL ADMINISTRATIVO (16 pantallas)
    │   └── (páginas públicas: productos, categorias, catalogo, ofertas,
    │        producto/[slug], carrito, checkout, seguimiento, favoritos,
    │        mi-cuenta, mis-pedidos, mis-direcciones, contacto, nosotros,
    │        faq, legales, 404 y error)
    ├── components/
    │   ├── providers/       # Sesión, carrito/favoritos y toasts
    │   ├── layout/          # Header, footer, buscador, WhatsApp, popup
    │   ├── ui/              # Botones, modal, skeletons, rating, iconos…
    │   ├── product/ cart/ checkout/ orders/ account/ contact/ home/
    │   └── admin/           # Vistas del panel
    ├── lib/                 # Utilidades y reglas de negocio
    │   ├── prisma.ts auth.ts jwt.ts session.ts api.ts validation.ts
    │   ├── cart.ts coupons.ts shipping.ts settings.ts notifications.ts
    │   ├── email.ts analytics.ts serializers.ts utils.ts constants.ts
    │   └── payments/        # wompi.ts · mercadopago.ts · payu.ts
    └── services/            # Consultas de dominio (productos, pedidos,
                             #  taxonomía, dashboard)
```

---

## 5. BASE DE DATOS

20 modelos con todas sus relaciones:

`User` · `PasswordReset` · `Address` · `Category` · `Catalog` · `CatalogProduct` · `Product` · `ProductVariant` · `Cart` · `CartItem` · `Favorite` · `Order` · `OrderItem` · `OrderStatusHistory` · `Coupon` · `CouponUse` · `Review` · `ContactMessage` · `Notification` · `EmailLog` · `Banner` · `Setting` · `ShippingRate` · `NewsletterSubscriber` · `AnalyticsEvent`

### Comandos útiles

```bash
npm run db:studio   # Explorador visual de la base de datos
npm run db:reset    # Borra todo y vuelve a cargar los datos de demostración
npm run db:push     # Aplica cambios del esquema sin perder datos
npm run db:seed     # Vuelve a cargar los datos de demostración
```

### Cambiar a PostgreSQL

1. En `prisma/schema.prisma`, cambia `provider = "sqlite"` por `provider = "postgresql"`.
2. En `.env`, pon tu cadena de conexión en `DATABASE_URL`.
3. Ejecuta `npm run db:push && npm run db:seed`.

No hay que tocar ninguna consulta: todas pasan por Prisma.

---

## 6. VARIABLES DE ENTORNO

El archivo `.env` ya viene listo para desarrollo. Para producción, copia `.env.example` y completa lo que necesites. **Ninguna clave secreta se expone al navegador**: solo las variables que empiezan por `NEXT_PUBLIC_` llegan al frontend.

| VARIABLE | PARA QUÉ | OBLIGATORIA |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | Sí |
| `AUTH_SECRET` | Firma de las sesiones (mínimo 32 caracteres) | Sí en producción |
| `NEXT_PUBLIC_SITE_URL` | SEO, sitemap, enlaces de correos y pagos | Sí en producción |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Botón flotante de WhatsApp | No |
| `EMAIL_PROVIDER`, `RESEND_API_KEY`, `SMTP_*` | Envío real de correos | No |
| `PAYMENT_PROVIDER` + claves de la pasarela | Pago online | No |

Genera una clave segura con:

```bash
openssl rand -base64 48
```

---

## 7. PAGOS

La tienda funciona **hoy mismo** con **pago contra entrega** y **transferencia**, sin configurar nada.

El **pago online** está implementado con una capa de adaptadores intercambiables en `src/lib/payments/`:

| PASARELA | VARIABLES NECESARIAS EN `.env` |
|---|---|
| **Wompi** | `PAYMENT_PROVIDER=wompi`, `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`, `WOMPI_ENV` |
| **Mercado Pago** | `PAYMENT_PROVIDER=mercadopago`, `MERCADOPAGO_ACCESS_TOKEN` |
| **PayU** | `PAYMENT_PROVIDER=payu`, `PAYU_MERCHANT_ID`, `PAYU_ACCOUNT_ID`, `PAYU_API_KEY`, `PAYU_API_LOGIN`, `PAYU_TEST` |

Mientras falten esas variables, la opción "PAGO ONLINE" aparece deshabilitada en el checkout con el motivo exacto, y en **/admin/configuracion** verás qué variables faltan.

El webhook de confirmación está en `POST /api/pagos/webhook` y verifica la firma del evento. **Nunca se guardan datos de tarjetas**: solo la referencia del pago y su estado.

---

## 8. CORREOS

`src/lib/email.ts` incluye una plantilla HTML con la identidad de la marca y cinco correos: bienvenida, confirmación de pedido, actualización de estado, recuperación de contraseña y respuesta de contacto.

- `EMAIL_PROVIDER=log` (por defecto): los correos se registran en la consola y en la tabla `EmailLog`, sin enviar nada.
- `EMAIL_PROVIDER=resend` + `RESEND_API_KEY`: envío real, sin instalar nada más.
- `EMAIL_PROVIDER=smtp`: instala `npm i nodemailer` y descomenta el bloque señalado en `src/lib/email.ts`.

En desarrollo, el enlace de recuperación de contraseña también se imprime en la consola del servidor.

---

## 9. FLUJO DE LA CLIENTA

Inicio → categorías → buscador con sugerencias → filtros → detalle del producto (galería con zoom, talla, color, guía de tallas) → carrito → cupón → checkout → método de pago → **#FK-000001** → seguimiento con línea de tiempo → reseña al recibir el pedido.

- El carrito de una invitada vive en `localStorage`; al iniciar sesión se **fusiona** con el carrito guardado en la base de datos.
- Los favoritos siguen la misma lógica.
- Los precios y el stock **siempre** se recalculan en el servidor: el navegador nunca decide cuánto cuesta algo.

## 10. FLUJO DEL ADMINISTRADOR

Dashboard con ventas del día/mes, ticket promedio y gráficos → pedidos (cambio de estado con historial, guía y transportadora) → inventario por variante → productos con variantes e imágenes → catálogos ordenables → cupones → reseñas → mensajes → banners de la home → envíos por departamento → configuración → analíticas → exportaciones CSV.

Al cambiar el estado de un pedido se guarda el historial, se notifica a la clienta y se le envía un correo. Al cancelar, **el inventario se devuelve automáticamente**.

---

## 11. SEGURIDAD

- Contraseñas con `bcrypt` (nunca en texto plano).
- Sesión en cookie `httpOnly`, `sameSite=lax` y `secure` en producción.
- Rutas protegidas en el `middleware` (Edge) y **otra vez** en cada ruta de API.
- Roles: `ADMIN`, `EDITOR`, `OPERADOR`, `CLIENTE`, con permisos por sección.
- Validación con Zod en todas las entradas del backend.
- Sanitización del texto libre (reseñas y contacto).
- Rate limiting en login, registro, recuperación, checkout, cupones y contacto.
- Consultas siempre por Prisma (parametrizadas, sin SQL concatenado).
- Cabeceras de seguridad en `next.config.mjs`.
- Los errores técnicos se registran en el servidor; la clienta solo ve *"ALGO SALIÓ MAL. INTENTA NUEVAMENTE."*

---

## 12. SEO Y RENDIMIENTO

Metadatos por página, Open Graph, `sitemap.xml` y `robots.txt` generados dinámicamente, URLs amigables por slug, datos estructurados JSON-LD en cada producto, `alt` en todas las imágenes, `next/image` con AVIF/WebP y *lazy loading*, paginación en listados y consultas indexadas.

---

## 13. PERSONALIZAR LA MARCA

| QUÉ | DÓNDE |
|---|---|
| Colores | `tailwind.config.ts` (`ink`, `rose`, `smoke`) |
| Tipografía | `--font-sans` y `--font-display` en `src/app/globals.css` |
| Textos, categorías, departamentos | `src/lib/constants.ts` |
| Datos de la tienda, envíos, popup | **/admin/configuracion** (se guardan en la base de datos) |
| Banners de la home | **/admin/banners** |
| Productos de la home | Marca **DESTACADO / NUEVO / EN OFERTA** en cada producto |

### Usar tus propias fotos

Copia las imágenes a `public/uploads/` y, al crear el producto, escribe la ruta `/uploads/mi-foto.jpg` en el campo de imagen. Para imágenes externas, añade el dominio en `next.config.mjs → images.remotePatterns`.

---

## 14. PUBLICAR EN PRODUCCIÓN

```bash
npm run build
npm start
```

Antes de publicar:

1. Cambia `AUTH_SECRET` por una clave larga y aleatoria.
2. Pon tu dominio real en `NEXT_PUBLIC_SITE_URL`.
3. Cambia las contraseñas de las cuentas de demostración (o bórralas desde **/admin/clientes**).
4. Elimina el bloque de cuentas de demostración del login.
5. Configura el número de WhatsApp y la pasarela de pago.
6. Para desplegar en Vercel, Railway o Render, usa PostgreSQL en lugar de SQLite (ver sección 5).

---

## 15. NOTAS

- Las fotos de demostración se cargan desde Unsplash. Si alguna no carga (por ejemplo, sin conexión), la interfaz muestra automáticamente un respaldo con los colores de la marca en lugar de un hueco vacío.
- El número de WhatsApp no viene inventado: mientras no lo configures, el botón flotante lleva a la página de contacto.
- Todo el texto visible de la interfaz está en español y en mayúsculas, tal como se pidió.
