# Reserva Cancha

MVP full stack con Next.js App Router, TypeScript, Tailwind CSS y Supabase para reservar canchas deportivas.

## Variables de entorno

Creá `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

No hace falta usar `service_role` en la app.

## SQL de Supabase

En Supabase, abrí SQL Editor y ejecutá:

1. `supabase/schema.sql`
2. Opcionalmente `supabase/seed.sql` si querés volver a cargar los datos demo

El schema crea:

- `profiles`
- `courts`
- `reservations`
- bucket público `court-images`
- políticas RLS
- trigger de perfil al crear usuarios
- índice único para bloquear doble reserva activa de la misma cancha, fecha y horario

Después de crear un usuario en Supabase Auth, marcá ese usuario como admin:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@tuemail.com';
```

## Comandos

```bash
npm install
npm run dev
```

Para validar producción:

```bash
npm run lint
npm run build
```

La app corre en `http://localhost:3000`.

## Cómo probar

1. Landing: abrí `/` y verificá hero, beneficios, CTA y canchas destacadas.
2. Canchas: abrí `/canchas`; deben verse las canchas activas del seed.
3. Reserva: entrá a una cancha, elegí fecha futura, horario, nombre, email y teléfono. Al confirmar debe redirigir a `/reserva-exitosa`.
4. Doble reserva: repetí la misma cancha, fecha y horario. Debe mostrar error de horario reservado.
5. Login admin: abrí `/admin` sin sesión; debe redirigir a `/login`.
6. Permisos admin: iniciá sesión con un usuario sin `profiles.role = 'admin'`; no debe entrar al panel.
7. Panel admin: con rol admin, entrá a `/admin`, cambiá estados de reservas y creá/editá/eliminá canchas.
8. Storage: subí una imagen al bucket `court-images`, copiá la URL pública y usala como `image_url` al crear o editar una cancha.

## Datos demo

`supabase/schema.sql` ya inserta tres canchas iniciales. Además, si todavía no configuraste `.env.local`, la UI pública muestra canchas mock locales para que puedas revisar diseño y responsive sin cargar datos manualmente.

Las reservas reales requieren Supabase configurado.
